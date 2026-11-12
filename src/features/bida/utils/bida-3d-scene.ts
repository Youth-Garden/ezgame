import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import {
  BALL_RADIUS,
  TABLE_HEIGHT,
  TABLE_WIDTH,
} from "./bida-physics";
import { createPoolBallMaterial, createBanIconTexture } from "./bida-3d-textures";

export interface ThreeBidaScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  ballMeshes: Map<number, THREE.Mesh>;
  cueMesh: THREE.Group;
  aimLineMesh: THREE.Line;
  ghostBallMesh: THREE.Mesh;
  targetGuideLine: THREE.Line;
  cueBallGuideLine: THREE.Line;
  foulMarkerMesh: THREE.Mesh;
  destroy: () => void;
}

export function initThreeBidaScene(container: HTMLDivElement, isVertical: boolean): ThreeBidaScene {
  const width = TABLE_WIDTH;
  const height = TABLE_HEIGHT;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090a0f);

  // 1. Top-Down Orthogonal Perspective Camera fitted snugly to table dimensions (fill ~96% viewport)
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(40, aspect, 10, 4000);

  // Calculate ideal camera Z to make table fill the screen with minimal black border
  // Table visual outer frame width is ~930, height is ~530
  const targetW = isVertical ? 540 : 940;
  const targetH = isVertical ? 940 : 540;
  const fovRad = (camera.fov * Math.PI) / 180;
  const zByH = (targetH / 2) / Math.tan(fovRad / 2);
  const zByW = (targetW / 2) / (Math.tan(fovRad / 2) * aspect);
  const optimalZ = Math.max(zByH, zByW) * 1.02;

  if (isVertical) {
    camera.position.set(0, 0, optimalZ);
    camera.lookAt(0, 0, 0);
    camera.rotation.z = Math.PI / 2;
  } else {
    camera.position.set(0, 0, optimalZ);
    camera.lookAt(0, 0, 0);
  }

  // Detect mobile / low-power devices for adaptive GPU scaling
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isMobile, // Disable MSAA on mobile for huge fill-rate boost
    alpha: false,
    powerPreference: "high-performance",
    precision: isMobile ? "mediump" : "highp",
  });
  // Cap at 1.0 on mobile, 1.35 on desktop to eliminate thermal throttling and micro-stutter
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.0 : 1.35));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = !isMobile; // Disable expensive dynamic shadows on mobile
  if (!isMobile) {
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 2. High-precision PBR Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 1.5 : 1.3);
  scene.add(ambientLight);

  // Single overhead directional key light (shadows enabled only on desktop)
  const overhead = new THREE.DirectionalLight(0xfff7ed, 1.8);
  overhead.position.set(0, 0, 850);
  overhead.castShadow = !isMobile;
  if (!isMobile) {
    overhead.shadow.mapSize.width = 512;
    overhead.shadow.mapSize.height = 512;
    overhead.shadow.camera.near = 100;
    overhead.shadow.camera.far = 1400;
    overhead.shadow.camera.left = -width / 2 - 80;
    overhead.shadow.camera.right = width / 2 + 80;
    overhead.shadow.camera.top = height / 2 + 80;
    overhead.shadow.camera.bottom = -height / 2 - 80;
    overhead.shadow.bias = -0.001;
  }
  scene.add(overhead);

  // 3. High-Res Procedural Equirectangular UV 3D Ball Meshes (24 segments on mobile, 32 on desktop)
  const ballMeshes = new Map<number, THREE.Mesh>();
  const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, isMobile ? 20 : 28, isMobile ? 20 : 28);

  for (let id = 0; id <= 15; id++) {
    const mat = createPoolBallMaterial(id);
    const mesh = new THREE.Mesh(ballGeo, mat);
    mesh.castShadow = !isMobile;
    mesh.receiveShadow = false;
    mesh.position.set(0, 0, -500); // Offscreen until physics position sync
    scene.add(mesh);
    ballMeshes.set(id, mesh);
  }

  // 4. Interactive Cue Stick Group
  const cueMesh = new THREE.Group();
  scene.add(cueMesh);

  // High-fidelity tournament cue stick
  const shaftGeo = new THREE.CylinderGeometry(1.8, 3.6, 480, 24);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.35,
    metalness: 0.1,
  });
  const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
  shaftMesh.castShadow = true;
  shaftMesh.position.set(0, 240, 0);

  const tipGeo = new THREE.CylinderGeometry(1.9, 1.8, 8, 24);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.8,
  });
  const tipMesh = new THREE.Mesh(tipGeo, tipMat);
  tipMesh.position.set(0, 4, 0);

  const gripGeo = new THREE.CylinderGeometry(3.3, 3.6, 120, 24);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.9,
  });
  const gripMesh = new THREE.Mesh(gripGeo, gripMat);
  gripMesh.position.set(0, 360, 0);

  cueMesh.add(shaftMesh, tipMesh, gripMesh);
  cueMesh.visible = false;

  // 5. Load Authoritative 3D Pool Table (.glb)
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "/models/bida/pool-table.glb",
    (gltf) => {
      const root = gltf.scene;
      const scaleFactor = 357.3;

      root.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = true;

          const name = mesh.name.toLowerCase();

          // Hide static props, author cue and static balls from GLB
          if (
            name.includes("rack") ||
            name.includes("chalk") ||
            name.includes("ball") ||
            name.includes("white") ||
            name.includes("cue")
          ) {
            mesh.visible = false;
          }
        }
      });

      // Align 3D Pool Table: felt surface perfectly at z = 0, exactly aligned with physics play area
      root.scale.set(scaleFactor, scaleFactor, scaleFactor);
      root.rotation.x = Math.PI / 2;
      root.position.set(0, 0, -282);

      // Performance: Disable matrix auto updates on the large static table hierarchy
      root.matrixAutoUpdate = false;
      root.updateMatrix();
      root.traverse((child) => {
        child.matrixAutoUpdate = false;
        child.updateMatrix();
      });

      scene.add(root);
      renderer.render(scene, camera);
    },
    undefined,
    (error) => {
      console.error("Failed to load /models/bida/pool-table.glb:", error);
    }
  );

  // 6. Aim Trajectory Lines & Ghost Ball
  const aimGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const aimLineMesh = new THREE.Line(
    aimGeo,
    new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 7, gapSize: 5, opacity: 0.9, transparent: true })
  );
  aimLineMesh.visible = false;
  scene.add(aimLineMesh);

  const ghostBallMesh = new THREE.Mesh(
    new THREE.SphereGeometry(BALL_RADIUS, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 })
  );
  ghostBallMesh.visible = false;
  scene.add(ghostBallMesh);

  // Target Ball Deflection Trajectory Line
  const targetGuideLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 6, gapSize: 4, transparent: true, opacity: 0.9 })
  );
  targetGuideLine.visible = false;
  scene.add(targetGuideLine);

  // Cue Ball Deflection (English / Tangent line)
  const cueBallGuideLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineDashedMaterial({ color: 0xfacc15, dashSize: 5, gapSize: 4, transparent: true, opacity: 0.8 })
  );
  cueBallGuideLine.visible = false;
  scene.add(cueBallGuideLine);

  // Illegal Target Warning Marker (Small prohibition / ban icon next to the ball along aim line)
  const banTexture = createBanIconTexture();
  const foulMarkerGeo = new THREE.PlaneGeometry(16, 16);
  const foulMarkerMat = new THREE.MeshBasicMaterial({
    map: banTexture,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
  });
  const foulMarkerMesh = new THREE.Mesh(foulMarkerGeo, foulMarkerMat);
  foulMarkerMesh.renderOrder = 998;
  foulMarkerMesh.visible = false;
  scene.add(foulMarkerMesh);

  const destroy = () => {
    renderer.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };

  return {
    scene,
    camera,
    renderer,
    ballMeshes,
    cueMesh,
    aimLineMesh,
    ghostBallMesh,
    targetGuideLine,
    cueBallGuideLine,
    foulMarkerMesh,
    destroy,
  };
}
