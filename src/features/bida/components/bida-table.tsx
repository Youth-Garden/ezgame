"use client";

import { useEffect, useRef, useState, useCallback, type MouseEvent, type TouchEvent } from "react";
import {
  BALL_RADIUS,
  CUSHION_WIDTH,
  POCKETS,
  POCKET_RADIUS,
  TABLE_HEIGHT,
  TABLE_WIDTH,
} from "../utils/bida-physics";
import { BidaBall, BidaBallType, BidaTurnState } from "../types";
import { PlayerRole } from "@/shared/types/room";

interface BidaTableProps {
  balls: BidaBall[];
  isMyTurn: boolean;
  turnState: BidaTurnState;
  currentRole: PlayerRole;
  onFireShot: (angle: number, power: number) => void;
}

export function BidaTable({
  balls,
  isMyTurn,
  turnState,
  onFireShot,
}: BidaTableProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cue Stick Controls
  const [cueAngle, setCueAngle] = useState(0); // in radians
  const [power, setPower] = useState(0); // 0 to 100
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const cueBall = balls.find((b) => b.type === BidaBallType.CUE && !b.isPocketed);

  // Auto-aim cue angle at first solid/stripe ball initially
  useEffect(() => {
    if (!cueBall) return;
    const firstTarget = balls.find((b) => b.id !== 0 && !b.isPocketed);
    if (firstTarget) {
      const angle = Math.atan2(firstTarget.y - cueBall.y, firstTarget.x - cueBall.x);
      setCueAngle(angle);
    }
  }, [cueBall?.id]);

  // Pointer interactions for aiming and pulling back
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = TABLE_WIDTH / rect.width;
    const scaleY = TABLE_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    if (!isMyTurn || turnState !== BidaTurnState.AIMING || !cueBall) return;
    const coords = getCanvasCoords(clientX, clientY);
    isDraggingRef.current = true;
    dragStartPos.current = coords;
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || !cueBall) return;
    const coords = getCanvasCoords(clientX, clientY);

    // Vector from cue ball to pointer
    const deltaX = coords.x - cueBall.x;
    const deltaY = coords.y - cueBall.y;

    // Angle of shot points opposite to pull back or directly towards aim
    const angle = Math.atan2(deltaY, deltaX);
    setCueAngle(angle);

    const pullDist = Math.hypot(coords.x - dragStartPos.current.x, coords.y - dragStartPos.current.y);
    const calculatedPower = Math.min(100, Math.max(5, pullDist * 0.8));
    setPower(calculatedPower);
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (power > 10 && isMyTurn && turnState === BidaTurnState.AIMING) {
      onFireShot(cueAngle, power);
      setPower(0);
    } else {
      setPower(0);
    }
  };

  // Canvas 60FPS Render Loop
  const renderTable = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw Table Frame & Rails (Rich wood grain tone)
    ctx.clearRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

    // Outer Wooden Rim
    ctx.fillStyle = "#1e130c";
    ctx.beginPath();
    ctx.roundRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT, 16);
    ctx.fill();

    // Wood Border Highlights
    ctx.strokeStyle = "#382314";
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Play Area (Emerald Green Felt)
    const playWidth = TABLE_WIDTH - CUSHION_WIDTH * 2;
    const playHeight = TABLE_HEIGHT - CUSHION_WIDTH * 2;

    const feltGrad = ctx.createLinearGradient(0, 0, 0, TABLE_HEIGHT);
    feltGrad.addColorStop(0, "#065f46");
    feltGrad.addColorStop(0.5, "#047857");
    feltGrad.addColorStop(1, "#064e3b");
    ctx.fillStyle = feltGrad;
    ctx.beginPath();
    ctx.roundRect(CUSHION_WIDTH, CUSHION_WIDTH, playWidth, playHeight, 6);
    ctx.fill();

    // Cushions Inner Shadow
    ctx.strokeStyle = "#022c22";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Head string line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(TABLE_WIDTH * 0.25, CUSHION_WIDTH);
    ctx.lineTo(TABLE_WIDTH * 0.25, TABLE_HEIGHT - CUSHION_WIDTH);
    ctx.stroke();

    // 3. Draw 6 Pockets
    POCKETS.forEach((pocket) => {
      // Outer drop rim
      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Metallic rim shadow
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // 4. Draw Balls with 3D Spherical Gradients
    balls.forEach((ball) => {
      if (ball.isPocketed) return;

      // Ball Drop Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.ellipse(ball.x + 2, ball.y + 3, ball.radius, ball.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ball Base Gradient
      const ballGrad = ctx.createRadialGradient(
        ball.x - ball.radius * 0.35,
        ball.y - ball.radius * 0.35,
        ball.radius * 0.1,
        ball.x,
        ball.y,
        ball.radius
      );

      if (ball.type === BidaBallType.CUE) {
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.7, "#f1f5f9");
        ballGrad.addColorStop(1, "#94a3b8");
      } else if (ball.type === BidaBallType.EIGHT_BALL) {
        ballGrad.addColorStop(0, "#52525b");
        ballGrad.addColorStop(0.6, "#18181b");
        ballGrad.addColorStop(1, "#09090b");
      } else {
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.3, ball.color);
        ballGrad.addColorStop(1, "#0f172a");
      }

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Ball Number / Badge Circle
      if (ball.type !== BidaBallType.CUE) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 0.42, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.font = `bold ${Math.round(ball.radius * 0.6)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(ball.id), ball.x, ball.y);
      }
    });

    // 5. Aiming Line & Cue Stick (Only when active player is aiming)
    if (cueBall && isMyTurn && turnState === BidaTurnState.AIMING) {
      const aimDist = 180;
      const targetX = cueBall.x + Math.cos(cueAngle) * aimDist;
      const targetY = cueBall.y + Math.sin(cueAngle) * aimDist;

      // Dashed Aim Guide Line
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.restore();

      // Cue Stick pulling back based on power
      const pullOffset = BALL_RADIUS + 10 + power * 0.4;
      const cueLength = 140;

      const cueStartX = cueBall.x - Math.cos(cueAngle) * pullOffset;
      const cueStartY = cueBall.y - Math.sin(cueAngle) * pullOffset;
      const cueEndX = cueBall.x - Math.cos(cueAngle) * (pullOffset + cueLength);
      const cueEndY = cueBall.y - Math.sin(cueAngle) * (pullOffset + cueLength);

      ctx.save();
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cueStartX, cueStartY);
      ctx.lineTo(cueEndX, cueEndY);
      ctx.stroke();

      // Cue stick white tip
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cueStartX, cueStartY);
      ctx.lineTo(
        cueBall.x - Math.cos(cueAngle) * (pullOffset + 8),
        cueBall.y - Math.sin(cueAngle) * (pullOffset + 8)
      );
      ctx.stroke();
      ctx.restore();
    }
  }, [balls, cueBall, cueAngle, power, isMyTurn, turnState]);

  useEffect(() => {
    renderTable();
  }, [renderTable]);

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <div className="relative w-full max-w-[840px] aspect-[800/420] rounded-2xl p-2 bg-neutral-950/40 border border-white/10 shadow-2xl backdrop-blur-md">
        <canvas
          ref={canvasRef}
          width={TABLE_WIDTH}
          height={TABLE_HEIGHT}
          className="w-full h-full rounded-xl cursor-crosshair touch-none"
          onMouseDown={(e: MouseEvent<HTMLCanvasElement>) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e: MouseEvent<HTMLCanvasElement>) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={handlePointerUp}
          onTouchStart={(e: TouchEvent<HTMLCanvasElement>) => {
            const touch = e.touches[0];
            if (touch) handlePointerDown(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e: TouchEvent<HTMLCanvasElement>) => {
            const touch = e.touches[0];
            if (touch) handlePointerMove(touch.clientX, touch.clientY);
          }}
          onTouchEnd={handlePointerUp}
        />
      </div>

      {/* Aim & Power Quick Controller Indicator */}
      {isMyTurn && turnState === BidaTurnState.AIMING && (
        <div className="mt-3 flex items-center gap-4 px-4 py-2 rounded-full bg-neutral-900/80 border border-white/10 text-xs text-neutral-300">
          <span>Kéo chuột hoặc ngón tay từ bi trắng để chỉnh góc và lực</span>
          {power > 0 && (
            <span className="font-semibold text-emerald-400">
              Lực: {Math.round(power)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
