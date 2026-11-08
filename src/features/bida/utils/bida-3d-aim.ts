import * as THREE from "three";
import {
  BALL_RADIUS,
  CUSHION_WIDTH,
  TABLE_HEIGHT,
  TABLE_WIDTH,
} from "./bida-physics";
import { BidaBall, BidaBallType } from "../types";

export function updateAimAndCue(
  aimContext: {
    cueBall: BidaBall;
    cueAngle: number;
    power: number;
    englishX: number; // Spin -1 to 1 (left to right)
    englishY: number; // Spin -1 to 1 (draw to follow)
    balls: BidaBall[];
    myGroup?: BidaBallType | null;
    aimLineMesh: THREE.Line;
    ghostBallMesh: THREE.Mesh;
    targetGuideLine: THREE.Line;
    cueBallGuideLine: THREE.Line;
    foulMarkerMesh?: THREE.Mesh;
    cueMesh: THREE.Group;
  }
) {
  const {
    cueBall,
    cueAngle,
    power,
    englishX,
    englishY,
    balls,
    myGroup,
    aimLineMesh,
    ghostBallMesh,
    targetGuideLine,
    cueBallGuideLine,
    foulMarkerMesh,
    cueMesh,
  } = aimContext;

  const cosA = Math.cos(cueAngle);
  const sinA = Math.sin(cueAngle);

  let cushionDist = 1200;
  if (cosA > 0.0001) {
    const d = (TABLE_WIDTH - CUSHION_WIDTH - BALL_RADIUS - cueBall.x) / cosA;
    if (d > 0 && d < cushionDist) cushionDist = d;
  } else if (cosA < -0.0001) {
    const d = (CUSHION_WIDTH + BALL_RADIUS - cueBall.x) / cosA;
    if (d > 0 && d < cushionDist) cushionDist = d;
  }
  if (sinA > 0.0001) {
    const d = (TABLE_HEIGHT - CUSHION_WIDTH - BALL_RADIUS - cueBall.y) / sinA;
    if (d > 0 && d < cushionDist) cushionDist = d;
  } else if (sinA < -0.0001) {
    const d = (CUSHION_WIDTH + BALL_RADIUS - cueBall.y) / sinA;
    if (d > 0 && d < cushionDist) cushionDist = d;
  }

  let closestHitDist = cushionDist;
  let ghostPos: { x: number; y: number } | null = null;
  let targetBallHit: BidaBall | null = null;

  balls.forEach((target) => {
    if (target.id === 0 || target.isPocketed) return;
    const deltaX = target.x - cueBall.x;
    const deltaY = target.y - cueBall.y;
    const distAlongAim = deltaX * cosA + deltaY * sinA;

    if (distAlongAim > 0 && distAlongAim < closestHitDist + BALL_RADIUS * 2) {
      const perpDist = Math.abs(deltaX * -sinA + deltaY * cosA);
      const collisionThreshold = BALL_RADIUS * 2;
      if (perpDist <= collisionThreshold) {
        const hitDist = distAlongAim - Math.sqrt(Math.max(0, collisionThreshold ** 2 - perpDist ** 2));
        if (hitDist > 0 && hitDist < closestHitDist) {
          closestHitDist = hitDist;
          targetBallHit = target;
          ghostPos = {
            x: cueBall.x + cosA * hitDist,
            y: cueBall.y + sinA * hitDist,
          };
        }
      }
    }
  });

  const startVec = new THREE.Vector3(cueBall.x - TABLE_WIDTH / 2, -(cueBall.y - TABLE_HEIGHT / 2), BALL_RADIUS);
  const hitX = cueBall.x + cosA * closestHitDist;
  const hitY = cueBall.y + sinA * closestHitDist;
  const endVec = new THREE.Vector3(hitX - TABLE_WIDTH / 2, -(hitY - TABLE_HEIGHT / 2), BALL_RADIUS);

  // Check if aiming at an illegal ball (opponent's ball, or 8-ball before clearing)
  let isIllegalTarget = false;
  const target = targetBallHit as BidaBall | null;
  if (target && myGroup) {
    const myRemainingBalls = balls.filter((b) => b.type === myGroup && !b.isPocketed).length;
    const legalTargetType = myRemainingBalls === 0 ? BidaBallType.EIGHT_BALL : myGroup;
    if (target.type !== legalTargetType) {
      isIllegalTarget = true;
    }
  } else if (target && !myGroup && target.id === 8) {
    // 8-ball cannot be targeted first on open table
    isIllegalTarget = true;
  }

  // Update Aim Line (dashed white for legal, warning rose-red for illegal)
  const aimMaterial = aimLineMesh.material as THREE.LineDashedMaterial;
  if (aimMaterial) {
    aimMaterial.color.setHex(isIllegalTarget ? 0xf43f5e : 0xffffff);
    aimMaterial.opacity = isIllegalTarget ? 0.95 : 0.85;
  }
  aimLineMesh.geometry.setFromPoints([startVec, endVec]);
  aimLineMesh.computeLineDistances();
  aimLineMesh.visible = true;

  if (ghostPos !== null && targetBallHit !== null) {
    const activeGhost: { x: number; y: number } = ghostPos;
    const targetBall: BidaBall = targetBallHit;

    ghostBallMesh.position.set(activeGhost.x - TABLE_WIDTH / 2, -(activeGhost.y - TABLE_HEIGHT / 2), BALL_RADIUS);
    const ghostMaterial = ghostBallMesh.material as THREE.MeshBasicMaterial;
    if (ghostMaterial) {
      ghostMaterial.color.setHex(isIllegalTarget ? 0xf43f5e : 0xffffff);
      ghostMaterial.opacity = isIllegalTarget ? 0.75 : 0.5;
    }
    ghostBallMesh.visible = true;

    // Show/hide Foul Warning Ring Marker over the illegal target ball
    if (foulMarkerMesh) {
      if (isIllegalTarget) {
        foulMarkerMesh.position.set(targetBall.x - TABLE_WIDTH / 2, -(targetBall.y - TABLE_HEIGHT / 2), BALL_RADIUS + 0.5);
        foulMarkerMesh.visible = true;
      } else {
        foulMarkerMesh.visible = false;
      }
    }

    // Normal line along center-to-center collision (Target path)
    const normalX = targetBall.x - activeGhost.x;
    const normalY = targetBall.y - activeGhost.y;
    const normalLen = Math.hypot(normalX, normalY);

    if (normalLen > 0.001) {
      const dirX = normalX / normalLen;
      const dirY = normalY / normalLen;
      const targetLineLen = isIllegalTarget ? 40 : 120;

      const tStart = new THREE.Vector3(targetBall.x - TABLE_WIDTH / 2, -(targetBall.y - TABLE_HEIGHT / 2), BALL_RADIUS);
      const tEnd = new THREE.Vector3(
        targetBall.x + dirX * targetLineLen - TABLE_WIDTH / 2,
        -(targetBall.y + dirY * targetLineLen - TABLE_HEIGHT / 2),
        BALL_RADIUS
      );

      const targetMat = targetGuideLine.material as THREE.LineDashedMaterial;
      if (targetMat) {
        targetMat.color.setHex(isIllegalTarget ? 0xf43f5e : 0x38bdf8);
      }
      targetGuideLine.geometry.setFromPoints([tStart, tEnd]);
      targetGuideLine.computeLineDistances();
      targetGuideLine.visible = true;

      // 90-degree Tangent line for Cue ball deflection
      const tangentX = -dirY;
      const tangentY = dirX;
      const dotAimTangent = cosA * tangentX + sinA * tangentY;
      const sign = dotAimTangent >= 0 ? 1 : -1;

      // English / Side spin modifies tangent angle
      const englishMod = englishX * 0.25;
      const cueDeflectLen = 70 * (1 + englishY * 0.3);

      const cStart = new THREE.Vector3(activeGhost.x - TABLE_WIDTH / 2, -(activeGhost.y - TABLE_HEIGHT / 2), BALL_RADIUS);
      const cEnd = new THREE.Vector3(
        activeGhost.x + (tangentX * sign + dirX * englishMod) * cueDeflectLen - TABLE_WIDTH / 2,
        -(activeGhost.y + (tangentY * sign + dirY * englishMod) * cueDeflectLen - TABLE_HEIGHT / 2),
        BALL_RADIUS
      );

      cueBallGuideLine.geometry.setFromPoints([cStart, cEnd]);
      cueBallGuideLine.computeLineDistances();
      cueBallGuideLine.visible = true;
    }
  } else {
    ghostBallMesh.visible = false;
    targetGuideLine.visible = false;
    cueBallGuideLine.visible = false;
    if (foulMarkerMesh) foulMarkerMesh.visible = false;
  }

  // Position and angle cue stick (offset slightly by english/spin)
  const pullOffset = BALL_RADIUS + 4 + power * 0.85;
  const perpCueX = -sinA * (englishX * 7);
  const perpCueY = cosA * (englishX * 7);

  cueMesh.position.set(
    startVec.x - Math.cos(cueAngle) * pullOffset + perpCueX,
    startVec.y + Math.sin(cueAngle) * pullOffset - perpCueY,
    BALL_RADIUS + 2 + englishY * 3
  );
  cueMesh.rotation.z = -cueAngle + Math.PI / 2;
  cueMesh.visible = true;
}
