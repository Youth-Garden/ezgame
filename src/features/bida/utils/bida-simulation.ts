import {
  BALL_RADIUS,
  CUSHION_WIDTH,
  FRICTION,
  POCKETS,
  POCKET_RADIUS,
  RESTITUTION,
  TABLE_HEIGHT,
  TABLE_WIDTH,
} from "./bida-physics";
import { BidaBall, BidaBallType } from "../types";

export interface StepPhysicsResult {
  pocketedBalls: BidaBall[];
  hasCollisions: boolean;
  isStillMoving: boolean;
}

export function updatePhysicsStep(balls: BidaBall[]): StepPhysicsResult {
  const pocketedBalls: BidaBall[] = [];
  let hasCollisions = false;

  // 1. Move active balls & apply friction
  for (let index = 0; index < balls.length; index++) {
    const ball = balls[index];
    if (ball.isPocketed) continue;

    ball.x += ball.vx;
    ball.y += ball.vy;

    ball.vx *= FRICTION;
    ball.vy *= FRICTION;

    // Zero out negligible velocity
    if (Math.abs(ball.vx) < 0.05) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.05) ball.vy = 0;

    // 2. Check Pocketing
    for (let pocketIndex = 0; pocketIndex < POCKETS.length; pocketIndex++) {
      const pocket = POCKETS[pocketIndex];
      const deltaX = ball.x - pocket.x;
      const deltaY = ball.y - pocket.y;
      const dist = Math.hypot(deltaX, deltaY);

      if (dist < POCKET_RADIUS) {
        ball.isPocketed = true;
        ball.vx = 0;
        ball.vy = 0;
        pocketedBalls.push(ball);
        break;
      }
    }

    if (ball.isPocketed) continue;

    // 3. Cushion Collision
    const minX = CUSHION_WIDTH + BALL_RADIUS;
    const maxX = TABLE_WIDTH - CUSHION_WIDTH - BALL_RADIUS;
    const minY = CUSHION_WIDTH + BALL_RADIUS;
    const maxY = TABLE_HEIGHT - CUSHION_WIDTH - BALL_RADIUS;

    if (ball.x < minX) {
      ball.x = minX;
      ball.vx = -ball.vx * RESTITUTION;
      hasCollisions = true;
    } else if (ball.x > maxX) {
      ball.x = maxX;
      ball.vx = -ball.vx * RESTITUTION;
      hasCollisions = true;
    }

    if (ball.y < minY) {
      ball.y = minY;
      ball.vy = -ball.vy * RESTITUTION;
      hasCollisions = true;
    } else if (ball.y > maxY) {
      ball.y = maxY;
      ball.vy = -ball.vy * RESTITUTION;
      hasCollisions = true;
    }
  }

  // 4. Ball-to-Ball Collisions (Elastic Spheres)
  for (let i = 0; i < balls.length; i++) {
    const ballA = balls[i];
    if (ballA.isPocketed) continue;

    for (let j = i + 1; j < balls.length; j++) {
      const ballB = balls[j];
      if (ballB.isPocketed) continue;

      const deltaX = ballB.x - ballA.x;
      const deltaY = ballB.y - ballA.y;
      const distance = Math.hypot(deltaX, deltaY);
      const minDistance = ballA.radius + ballB.radius;

      if (distance < minDistance && distance > 0) {
        hasCollisions = true;
        // Normal vector
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;

        // Separate overlapping balls
        const overlap = (minDistance - distance) / 2;
        ballA.x -= normalX * overlap;
        ballA.y -= normalY * overlap;
        ballB.x += normalX * overlap;
        ballB.y += normalY * overlap;

        // Relative velocity
        const relativeVx = ballA.vx - ballB.vx;
        const relativeVy = ballA.vy - ballB.vy;

        // Velocity along normal
        const velocityAlongNormal = relativeVx * normalX + relativeVy * normalY;

        // Do not resolve if velocities are separating
        if (velocityAlongNormal > 0) {
          const impulse = (1 + RESTITUTION) * velocityAlongNormal * 0.5;
          ballA.vx -= impulse * normalX;
          ballA.vy -= impulse * normalY;
          ballB.vx += impulse * normalX;
          ballB.vy += impulse * normalY;
        }
      }
    }
  }

  // 5. Check if any ball is still in motion
  const isStillMoving = balls.some(
    (b) => !b.isPocketed && (Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05)
  );

  return {
    pocketedBalls,
    hasCollisions,
    isStillMoving,
  };
}

export function respawnCueBall(balls: BidaBall[]): void {
  const cue = balls.find((b) => b.type === BidaBallType.CUE);
  if (!cue) return;
  cue.isPocketed = false;
  cue.x = TABLE_WIDTH * 0.25;
  cue.y = TABLE_HEIGHT / 2;
  cue.vx = 0;
  cue.vy = 0;
}
