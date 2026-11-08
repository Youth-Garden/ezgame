"use client";

import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import * as THREE from "three";
import {
  BALL_RADIUS,
  TABLE_HEIGHT,
  TABLE_WIDTH,
} from "../utils/bida-physics";
import { BidaBall, BidaBallType, BidaTurnState } from "../types";
import { PlayerRole } from "@/shared/types/room";
import {
  initThreeBidaScene,
  type ThreeBidaScene,
} from "../utils/bida-3d-scene";
import { updateAimAndCue } from "../utils/bida-3d-aim";
import { usePortal } from "@/shared/components/portal";
import { BidaSpinDialog, type BidaSpinDialogData } from "./bida-spin-dialog";
import { BidaActionBar } from "./bida-action-bar";

interface BidaTableProps {
  balls: BidaBall[];
  isMyTurn: boolean;
  turnState: BidaTurnState;
  currentRole: PlayerRole;
  myGroup?: BidaBallType | null;
  isVertical?: boolean;
  isOpponentOnline?: boolean;
  onFireShot: (angle: number, power: number, englishX?: number, englishY?: number) => void;
}

export function BidaTable({
  balls,
  isMyTurn,
  turnState,
  myGroup = null,
  isVertical = false,
  isOpponentOnline = false,
  onFireShot,
}: BidaTableProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cue Stick Aim & Power
  const [cueAngle, setCueAngle] = useState(0); // in radians
  const [power, setPower] = useState(0); // 0 to 100
  const [english, setEnglish] = useState({ x: 0, y: 0 }); // Spin: -1 to 1

  const [presentSpinDialog] = usePortal<BidaSpinDialogData>(BidaSpinDialog);

  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lockedAngleRef = useRef(0);
  const powerRef = useRef(0);

  // Three.js Scene References
  const threeSceneRef = useRef<ThreeBidaScene | null>(null);

  const cueBall = balls.find((b) => b.type === BidaBallType.CUE && !b.isPocketed);
  const canPlay = isMyTurn && isOpponentOnline && turnState === BidaTurnState.AIMING;

  // Initialize Three.js WebGL scene with continuous requestAnimationFrame render loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const threeScene = initThreeBidaScene(container, isVertical);
    threeSceneRef.current = threeScene;

    const handleResize = () => {
      if (!container || !threeScene.renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      threeScene.renderer.setSize(width, height);
      threeScene.camera.aspect = width / height;

      // Update optimal Z on resize
      const targetW = isVertical ? 540 : 940;
      const targetH = isVertical ? 940 : 540;
      const fovRad = (threeScene.camera.fov * Math.PI) / 180;
      const zByH = (targetH / 2) / Math.tan(fovRad / 2);
      const zByW = (targetW / 2) / (Math.tan(fovRad / 2) * (width / height));
      threeScene.camera.position.z = Math.max(zByH, zByW) * 1.02;

      threeScene.camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Dedicated requestAnimationFrame render loop for smooth 60 FPS V-Sync
    let animationFrameId: number;
    const renderLoop = () => {
      threeScene.renderer.render(threeScene.scene, threeScene.camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      threeScene.destroy();
      threeSceneRef.current = null;
    };
  }, [isVertical]);

  // Cancel charging shot (reset power and unlock gậy để lia hướng lại)
  const cancelShot = () => {
    isDraggingRef.current = false;
    isSpaceChargingRef.current = false;
    if (spaceChargeIntervalRef.current) {
      clearInterval(spaceChargeIntervalRef.current);
      spaceChargeIntervalRef.current = null;
    }
    powerRef.current = 0;
    setPower(0);
  };

  const isSpaceChargingRef = useRef(false);
  const spaceChargeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard controls: [SPACE] to charge & shoot, [ESC] to cancel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelShot();
        return;
      }

      if (event.code === "Space" && canPlay && !isDraggingRef.current && !isSpaceChargingRef.current) {
        event.preventDefault();
        isSpaceChargingRef.current = true;
        lockedAngleRef.current = cueAngle;
        powerRef.current = 0;
        setPower(0);

        spaceChargeIntervalRef.current = setInterval(() => {
          powerRef.current = Math.min(100, powerRef.current + 2);
          setPower(powerRef.current);
        }, 16);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && isSpaceChargingRef.current) {
        event.preventDefault();
        isSpaceChargingRef.current = false;
        if (spaceChargeIntervalRef.current) {
          clearInterval(spaceChargeIntervalRef.current);
          spaceChargeIntervalRef.current = null;
        }

        const shotPower = powerRef.current;
        if (shotPower > 2 && canPlay) {
          onFireShot(lockedAngleRef.current, shotPower, english.x, english.y);
        }
        powerRef.current = 0;
        setPower(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (spaceChargeIntervalRef.current) {
        clearInterval(spaceChargeIntervalRef.current);
      }
    };
  }, [canPlay, cueAngle, english, onFireShot]);

  // Pointer drag controls: aim angle & strike power with global window release
  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!canPlay || !cueBall || isSpaceChargingRef.current) return;

    isDraggingRef.current = true;
    dragStartPos.current = { x: clientX, y: clientY };
    lockedAngleRef.current = cueAngle;
    powerRef.current = 0;
    setPower(0);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!cueBall || !canPlay || isSpaceChargingRef.current) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    if (!isDraggingRef.current) {
      // Free Aiming: Cue stick follows pointer relative to cue ball position
      const pointerX = clientX - rect.left;
      const pointerY = clientY - rect.top;

      const scaleX = TABLE_WIDTH / rect.width;
      const scaleY = TABLE_HEIGHT / rect.height;

      const cueBallPixelX = cueBall.x / scaleX;
      const cueBallPixelY = cueBall.y / scaleY;

      const dx = pointerX - cueBallPixelX;
      const dy = pointerY - cueBallPixelY;

      const rawAngle = Math.atan2(dy, dx);
      setCueAngle(rawAngle);
    } else {
      // Pull-back power drag
      const deltaX = clientX - dragStartPos.current.x;
      const deltaY = clientY - dragStartPos.current.y;

      const aimDirX = Math.cos(lockedAngleRef.current);
      const aimDirY = Math.sin(lockedAngleRef.current);

      const pullAlongAim = -(deltaX * aimDirX + deltaY * aimDirY);
      const dragDist = Math.max(0, pullAlongAim > 0 ? pullAlongAim : Math.hypot(deltaX, deltaY));

      // If user drags back near origin (under 8px distance), cancel charge smoothly
      if (dragDist < 8 && powerRef.current > 0) {
        powerRef.current = 0;
        setPower(0);
        return;
      }

      const calculatedPower = Math.min(100, Math.max(0, (dragDist / 120) * 100));
      powerRef.current = calculatedPower;
      setPower(calculatedPower);
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    const shotPower = powerRef.current;
    if (shotPower > 2 && canPlay) {
      onFireShot(lockedAngleRef.current, shotPower, english.x, english.y);
    }
    powerRef.current = 0;
    setPower(0);
  };

  // Attach global pointer listeners so dragging outside the table never drops or gets stuck
  useEffect(() => {
    const handleGlobalMouseMove = (event: globalThis.MouseEvent) => {
      if (!isDraggingRef.current) return;
      handlePointerMove(event.clientX, event.clientY);
    };

    const handleGlobalTouchMove = (event: globalThis.TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = event.touches[0];
      if (touch) {
        handlePointerMove(touch.clientX, touch.clientY);
      }
    };

    const handleGlobalUp = () => {
      if (isDraggingRef.current) {
        handlePointerUp();
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalUp);
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: true });
    window.addEventListener("touchend", handleGlobalUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalUp);
    };
  }, [canPlay, cueAngle, english, onFireShot]);

  const handleOpenSpinModal = () => {
    presentSpinDialog({
      initialEnglish: english,
      onApply: (newEnglish) => {
        setEnglish(newEnglish);
      },
    });
  };

  // Sync ball positions, rotation, and aiming guides with Three.js scene
  useEffect(() => {
    const scene = threeSceneRef.current;
    if (!scene) return;

    // Synchronize 3D pool ball meshes
    balls.forEach((b) => {
      const mesh = scene.ballMeshes.get(b.id);
      if (!mesh) return;

      if (b.isPocketed) {
        mesh.visible = false;
        mesh.position.set(0, 0, -900);
        return;
      }

      mesh.visible = true;
      const targetX = b.x - TABLE_WIDTH / 2;
      const targetY = -(b.y - TABLE_HEIGHT / 2);

      const speed = Math.hypot(b.vx, b.vy);
      if (speed > 0.05) {
        const moveAngle = Math.atan2(-b.vy, b.vx);
        const rotationAxis = new THREE.Vector3(-Math.sin(moveAngle), Math.cos(moveAngle), 0);
        const angleRot = speed / BALL_RADIUS;
        mesh.rotateOnWorldAxis(rotationAxis, angleRot);
      }

      mesh.position.set(targetX, targetY, BALL_RADIUS);
    });

    // Update Cue Stick, Aim Guide, Ghost Ball, and Cue Ball Deflection
    if (cueBall && canPlay) {
      updateAimAndCue({
        cueBall,
        cueAngle: isDraggingRef.current ? lockedAngleRef.current : cueAngle,
        power,
        englishX: english.x,
        englishY: english.y,
        balls,
        myGroup,
        aimLineMesh: scene.aimLineMesh,
        ghostBallMesh: scene.ghostBallMesh,
        targetGuideLine: scene.targetGuideLine,
        cueBallGuideLine: scene.cueBallGuideLine,
        foulMarkerMesh: scene.foulMarkerMesh,
        cueMesh: scene.cueMesh,
      });
    } else {
      scene.cueMesh.visible = false;
      scene.aimLineMesh.visible = false;
      scene.ghostBallMesh.visible = false;
      scene.targetGuideLine.visible = false;
      scene.cueBallGuideLine.visible = false;
      if (scene.foulMarkerMesh) scene.foulMarkerMesh.visible = false;
    }
  }, [balls, cueBall, cueAngle, power, english, canPlay, myGroup]);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* 3D Viewport Table Container */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-3xl overflow-hidden bg-neutral-950 shadow-2xl transition-all duration-300 ${
          canPlay ? "cursor-crosshair" : "cursor-not-allowed"
        } touch-none ${
          isVertical ? "max-w-[620px] aspect-[440/840]" : "max-w-[1360px] aspect-[840/440]"
        }`}
        onContextMenu={(e) => {
          e.preventDefault();
          cancelShot();
        }}
        onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
          if (e.button === 2) {
            cancelShot();
            return;
          }
          handlePointerDown(e.clientX, e.clientY);
        }}
        onMouseMove={(e: MouseEvent<HTMLDivElement>) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e: TouchEvent<HTMLDivElement>) => {
          const touch = e.touches[0];
          if (touch) handlePointerDown(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e: TouchEvent<HTMLDivElement>) => {
          const touch = e.touches[0];
          if (touch) handlePointerMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handlePointerUp}
      />

      {/* Floating 8-Ball Pool Sleek Action Bar */}
      <div className="w-full max-w-[1360px] flex justify-center">
        <BidaActionBar
          isOpponentOnline={isOpponentOnline}
          isMyTurn={isMyTurn}
          turnState={turnState}
          isDragging={isDraggingRef.current || isSpaceChargingRef.current}
          power={power}
          english={english}
          onOpenSpinModal={handleOpenSpinModal}
          onCancelShot={cancelShot}
        />
      </div>
    </div>
  );
}
