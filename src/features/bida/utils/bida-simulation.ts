import Matter from "matter-js";
import {
  BALL_RADIUS,
  CUSHION_WIDTH,
  POCKETS,
  TABLE_HEIGHT,
  TABLE_WIDTH,
} from "./bida-physics";
import { BidaBall, BidaBallType } from "../types";
import { createTableCushions } from "./bida-cushions";

export interface SimulationStepResult {
  pocketedIds: number[];
  hasCollisions: boolean;
  isStillMoving: boolean;
  firstContactBallId: number | null;
  cushionHitAfterContact: boolean;
}

export interface MatterPoolSimulation {
  engine: Matter.Engine;
  ballsMap: Map<number, Matter.Body>;
  step: () => SimulationStepResult;
  applyShot: (cueAngle: number, power: number, englishX?: number, englishY?: number) => void;
  syncBallPositions: (balls: BidaBall[]) => void;
  destroy: () => void;
}

export function createMatterPoolSimulation(initialBalls: BidaBall[]): MatterPoolSimulation {
  const { Engine, Bodies, Composite, Body, Events } = Matter;

  // 1. Create Matter Engine with zero gravity (top-down 2D pool table)
  const engine = Engine.create({
    gravity: { x: 0, y: 0, scale: 0 },
    positionIterations: 8,
    velocityIterations: 8,
  });

  const world = engine.world;
  const ballsMap = new Map<number, Matter.Body>();
  let hasCollisionsThisTick = false;
  const newlyPocketedIds: number[] = [];

  // Official 8-ball shot tracking: first ball hit & rail contact
  let firstContactBallId: number | null = null;
  let cushionHitAfterContact = false;

  // Active spin state on cue ball (decayed over time)
  let spinAngular = 0; // Side spin (englishX)
  let spinLinear = 0;  // Draw / Follow spin (englishY)

  // 2. Build Cushions / Rails with Chamfers & Pocket Cutouts
  const cushions = createTableCushions();
  Composite.add(world, cushions);

  // 3. Create Matter Physics Bodies for all 16 Balls
  initialBalls.forEach((b) => {
    if (b.isPocketed) return;

    const body = Bodies.circle(b.x, b.y, BALL_RADIUS, {
      restitution: 0.96, // High elastic phenolic resin ball-to-ball rebound
      friction: 0.015,
      frictionAir: 0.012, // Table felt rolling resistance
      density: 0.0018,
      label: `ball_${b.id}`,
    });
    ballsMap.set(b.id, body);
    Composite.add(world, body);
  });

  // Track collisions for audio, spin reactions, and official 8-ball fouls
  Events.on(engine, "collisionStart", (event) => {
    if (event.pairs.length > 0) {
      hasCollisionsThisTick = true;

      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        const isCueInvolved = bodyA.label === "ball_0" || bodyB.label === "ball_0";

        // Track first contact ball by cue ball
        if (isCueInvolved && firstContactBallId === null) {
          const otherBody = bodyA.label === "ball_0" ? bodyB : bodyA;
          if (otherBody.label.startsWith("ball_")) {
            const hitId = parseInt(otherBody.label.replace("ball_", ""), 10);
            if (!Number.isNaN(hitId) && hitId !== 0) {
              firstContactBallId = hitId;
            }
          }
        }

        // Track cushion hit after initial contact has happened
        if (firstContactBallId !== null) {
          if (bodyA.label === "cushion" || bodyB.label === "cushion") {
            cushionHitAfterContact = true;
          }
        }

        // Apply english spin deflection upon cue ball first impact
        if (isCueInvolved && (Math.abs(spinAngular) > 0.01 || Math.abs(spinLinear) > 0.01)) {
          const cueBody = bodyA.label === "ball_0" ? bodyA : bodyB;
          const otherBody = bodyA.label === "ball_0" ? bodyB : bodyA;

          if (otherBody.label.startsWith("ball_")) {
            // Draw (trô bi) or Follow (culê) impulse
            const speed = Math.hypot(cueBody.velocity.x, cueBody.velocity.y);
            if (speed > 0.1) {
              const dirX = cueBody.velocity.x / speed;
              const dirY = cueBody.velocity.y / speed;
              // Add linear spin push / pull
              Body.applyForce(cueBody, cueBody.position, {
                x: dirX * spinLinear * 0.015,
                y: dirY * spinLinear * 0.015,
              });
            }
          }
        }
      });
    }
  });

  // 4. Step Function (Called on requestAnimationFrame)
  let lowSpeedFrames = 0;

  const step = () => {
    hasCollisionsThisTick = false;
    newlyPocketedIds.length = 0;

    // Apply spin decay per tick
    spinAngular *= 0.97;
    spinLinear *= 0.96;

    // Advance Matter engine step (approx 60fps = 16.66ms)
    Engine.update(engine, 1000 / 60);

    let maxSpeed = 0;

    // Hard boundary clamping: prevent any fast-moving ball from tunneling through cushion rails
    const minX = CUSHION_WIDTH + BALL_RADIUS;
    const maxX = TABLE_WIDTH - CUSHION_WIDTH - BALL_RADIUS;
    const minY = CUSHION_WIDTH + BALL_RADIUS;
    const maxY = TABLE_HEIGHT - CUSHION_WIDTH - BALL_RADIUS;

    ballsMap.forEach((body, ballId) => {
      // Check if ball fell into any pocket first (generous pocket radius with smooth gravity drop)
      let fellInPocket = false;
      for (let i = 0; i < POCKETS.length; i++) {
        const pocket = POCKETS[i];
        const dist = Math.hypot(body.position.x - pocket.x, body.position.y - pocket.y);

        // Suction pull towards pocket center when ball enters the pocket throat
        if (dist < pocket.radius * 1.5) {
          const pullFactor = 0.0012;
          const pullX = (pocket.x - body.position.x) * pullFactor;
          const pullY = (pocket.y - body.position.y) * pullFactor;
          Body.applyForce(body, body.position, { x: pullX, y: pullY });
        }

        // Pocket drop threshold: once ball center is within the pocket mouth (1.25x radius), pocket it cleanly
        if (dist < pocket.radius * 1.25) {
          newlyPocketedIds.push(ballId);
          Composite.remove(world, body);
          ballsMap.delete(ballId);
          fellInPocket = true;
          break;
        }
      }

      if (fellInPocket) return;

      const speed = Math.hypot(body.velocity.x, body.velocity.y);
      if (speed > maxSpeed) maxSpeed = speed;

      // Force-stop tiny drifting to ensure crisp settling
      if (speed < 0.12 && speed > 0) {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
      }

      // Check if ball is near any of the 6 pockets; if near pocket mouth, do NOT clamp to cushion
      const isNearAnyPocket = POCKETS.some((p) => {
        return Math.hypot(body.position.x - p.x, body.position.y - p.y) < p.radius * 1.7;
      });

      // Clamp ball strictly within cushion perimeter only when far from pocket mouths
      if (!isNearAnyPocket) {
        if (body.position.x < minX) {
          Body.setPosition(body, { x: minX, y: body.position.y });
          if (body.velocity.x < 0) Body.setVelocity(body, { x: -body.velocity.x * 0.7, y: body.velocity.y });
        } else if (body.position.x > maxX) {
          Body.setPosition(body, { x: maxX, y: body.position.y });
          if (body.velocity.x > 0) Body.setVelocity(body, { x: -body.velocity.x * 0.7, y: body.velocity.y });
        }

        if (body.position.y < minY) {
          Body.setPosition(body, { x: body.position.x, y: minY });
          if (body.velocity.y < 0) Body.setVelocity(body, { x: body.velocity.x, y: -body.velocity.y * 0.7 });
        } else if (body.position.y > maxY) {
          Body.setPosition(body, { x: body.position.x, y: maxY });
          if (body.velocity.y > 0) Body.setVelocity(body, { x: body.velocity.x, y: -body.velocity.y * 0.7 });
        }
      }
    });

    if (maxSpeed < 0.12) {
      lowSpeedFrames += 1;
    } else {
      lowSpeedFrames = 0;
    }

    // Still moving if maxSpeed is above threshold AND hasn't been low speed for 6 consecutive frames
    const isStillMoving = maxSpeed > 0.12 && lowSpeedFrames < 6;

    if (!isStillMoving) {
      // Crisp zeroing of all residual momentum
      ballsMap.forEach((body) => {
        Body.setVelocity(body, { x: 0, y: 0 });
        Body.setAngularVelocity(body, 0);
      });
      lowSpeedFrames = 0;
    }

    return {
      pocketedIds: [...newlyPocketedIds],
      hasCollisions: hasCollisionsThisTick,
      isStillMoving,
      firstContactBallId,
      cushionHitAfterContact,
    };
  };

  // 5. Apply Cue Shot Impulse with English / Spin
  const applyShot = (
    cueAngle: number,
    power: number,
    englishX: number = 0,
    englishY: number = 0
  ) => {
    firstContactBallId = null;
    cushionHitAfterContact = false;

    const cueBody = ballsMap.get(0);
    if (!cueBody) return;

    // Store active spin
    spinAngular = englishX;
    spinLinear = englishY;

    // Force magnitude scale proportional to power (0 to 100)
    const forceMagnitude = (power / 100) * 0.065;

    // Slight squirt effect (deflection when hitting off-center english)
    const squirtAngle = cueAngle - (englishX * 0.035);

    const force = {
      x: Math.cos(squirtAngle) * forceMagnitude,
      y: Math.sin(squirtAngle) * forceMagnitude,
    };

    Body.applyForce(cueBody, cueBody.position, force);
    // Apply initial angular spin
    Body.setAngularVelocity(cueBody, englishX * 0.25);
  };

  // 6. Synchronize Ball Positions back into state
  const syncBallPositions = (balls: BidaBall[]) => {
    balls.forEach((b) => {
      const body = ballsMap.get(b.id);
      if (body) {
        b.x = body.position.x;
        b.y = body.position.y;
        b.vx = body.velocity.x;
        b.vy = body.velocity.y;
        b.rotation = body.angle;
      }
    });
  };

  const destroy = () => {
    Composite.clear(world, false);
    Engine.clear(engine);
    ballsMap.clear();
  };

  return {
    engine,
    ballsMap,
    step,
    applyShot,
    syncBallPositions,
    destroy,
  };
}

export function respawnCueBall(balls: BidaBall[]): BidaBall[] {
  const headStringX = TABLE_WIDTH * 0.25;
  const centerY = TABLE_HEIGHT / 2;

  return balls.map((b) => {
    if (b.type === BidaBallType.CUE) {
      return {
        ...b,
        x: headStringX,
        y: centerY,
        vx: 0,
        vy: 0,
        isPocketed: false,
      };
    }
    return b;
  });
}

export function respotEightBall(balls: BidaBall[]): BidaBall[] {
  const footSpotX = TABLE_WIDTH * 0.68;
  const footSpotY = TABLE_HEIGHT / 2;

  return balls.map((b) => {
    if (b.type === BidaBallType.EIGHT_BALL) {
      return {
        ...b,
        x: footSpotX,
        y: footSpotY,
        vx: 0,
        vy: 0,
        isPocketed: false,
      };
    }
    return b;
  });
}
