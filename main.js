// GE90-Style Engine Viewer — Clean Medium Version (Updated)
// No bundler, no local node_modules; uses CDN ES modules only.
//
// IMPORTANT: You must open index.html via a local web server, not by double-clicking the file.
// Example (Python 3):  python -m http.server 8000   and then open http://localhost:8000/

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";



// GE90-Style Engine Viewer — Clean, From-Scratch Version
// - No bundler, CDN ES modules only
// - N1 spool: Fan + LPC + LPT (all animated)
// - N2 spool: HPC + HPT + core drum (animated)
// - Combustor + nacelle are static


const canvas = document.getElementById("scene");
const throttleSlider = document.getElementById("throttle");
const n1Label = document.getElementById("n1-val");
const n2Label = document.getElementById("n2-val");

// --- Basic THREE.js setup ---
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050816);

// Camera: side 3/4 view
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 200);
camera.position.set(7.0, 3.0, 7.5);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = true;
controls.enableZoom = true;
controls.minDistance = 3.0;
controls.maxDistance = 25.0;
controls.target.set(0, 0, 3.5);
controls.update();

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(6, 9, 7);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x88aaff, 0.9);
rimLight.position.set(-6, 3, -7);
scene.add(rimLight);

// --- Engine groups ---
const engineRoot = new THREE.Group();
engineRoot.scale.set(0.65, 0.65, 0.65);
scene.add(engineRoot);

// N1 spool: fan + LPC + LPT
const n1Group = new THREE.Group();
engineRoot.add(n1Group);

// N2 spool: HPC + core drum + HPT
const n2Group = new THREE.Group();
engineRoot.add(n2Group);

// --- Materials ---
const fanMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  metalness: 0.9,
  roughness: 0.2
});
const leMat = new THREE.MeshStandardMaterial({
  color: 0xcad2ff,
  metalness: 0.9,
  roughness: 0.3
});
const hubMat = new THREE.MeshStandardMaterial({
  color: 0xe5e7eb,
  metalness: 0.85,
  roughness: 0.35
});
const coreMat = new THREE.MeshStandardMaterial({
  color: 0x777777,
  metalness: 0.7,
  roughness: 0.4
});
const hptMat = new THREE.MeshStandardMaterial({
  color: 0x9e7c4b,
  metalness: 0.75,
  roughness: 0.4
});
const lptMat = new THREE.MeshStandardMaterial({
  color: 0x6e6e6e,
  metalness: 0.65,
  roughness: 0.45
});
const combustorMat = new THREE.MeshStandardMaterial({
  color: 0xffa500,
  metalness: 0.6,
  roughness: 0.5,
  emissive: 0xff6600,
  emissiveIntensity: 0.7
});
const nacelleMat = new THREE.MeshStandardMaterial({
  color: 0xf9fafb,
  metalness: 0.3,
  roughness: 0.2,
  transparent: true,
  opacity: 0.16
});
const shaftMat = new THREE.MeshStandardMaterial({
  color: 0x444444,
  metalness: 0.8,
  roughness: 0.35
});

const HUB_RADIUS = 0.35;

// Helper: create a simple radial box blade geometry
function createRadialBladeGeom(rootRadius, span, thickness = 0.03) {
  const bladeLen = span * 0.95;
  const geom = new THREE.BoxGeometry(thickness, bladeLen, thickness * 0.5);
  geom.translate(0, rootRadius + bladeLen * 0.5, 0);
  return geom;
}

/**
 * Builds a compressor stage consisting of a drum and a ring of blades
 * @param {Object} params - Parameters for the stage
 * @param {THREE.Group} params.parentGroup - The group to add the stage to
 * @param {number} params.stageRadius - Outer radius of the stage
 * @param {number} params.rootRadius - Inner radius where blades attach
 * @param {number} params.z - Z position of the stage
 * @param {number} params.drumLength - Length of the drum
 * @param {number} params.bladeCount - Number of blades
 * @param {THREE.Material} params.bladeMat - Material for the blades
 * @param {number} params.drumColor - Color for the drum
 * @param {number} params.bladeTwist - Twist angle for blades in radians
 */
function buildCompressorStage({
  parentGroup,
  stageRadius,
  rootRadius,
  z,
  drumLength,
  bladeCount,
  bladeMat,
  drumColor,
  bladeTwist = 0.16
}) {
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(stageRadius * 0.8, stageRadius * 0.8, drumLength, 36),
    new THREE.MeshStandardMaterial({
      color: drumColor,
      metalness: 0.75,
      roughness: 0.35
    })
  );
  drum.rotation.x = Math.PI / 2;
  drum.position.z = z;
  parentGroup.add(drum);

  const span = Math.max(0.08, stageRadius - rootRadius);
  const bladeGeom = createRadialBladeGeom(rootRadius, span, 0.026);

  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const blade = new THREE.Mesh(bladeGeom, bladeMat);
    const wrapper = new THREE.Group();
    wrapper.add(blade);
    wrapper.rotation.z = angle;
    wrapper.rotation.y = -Math.PI * bladeTwist;
    wrapper.position.z = z;
    parentGroup.add(wrapper);
  }
}

/**
 * Builds a turbine stage consisting of a drum and a ring of blades
 * @param {Object} params - Parameters for the stage
 * @param {THREE.Group} params.parentGroup - The group to add the stage to
 * @param {number} params.radius - Radius of the stage
 * @param {number} params.z - Z position of the stage
 * @param {number} params.bladeCount - Number of blades
 * @param {THREE.Material} params.material - Material for drum and blades
 * @param {number} params.bladeTwist - Twist angle for blades in radians
 * @param {number} params.rootRadius - Inner radius where blades attach
 * @param {number} params.thickness - Thickness of blades
 */
function buildTurbineStage({
  parentGroup,
  radius,
  z,
  bladeCount,
  material,
  bladeTwist = 0.16,
  rootRadius = 0.25,
  thickness = 0.02
}) {
  const length = 0.18;
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.8, radius * 0.8, length, 32),
    material
  );
  drum.rotation.x = Math.PI / 2;
  drum.position.z = z;
  parentGroup.add(drum);

  const span = Math.max(0.08, radius - rootRadius);
  const bladeGeom = createRadialBladeGeom(rootRadius, span, thickness);

  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const blade = new THREE.Mesh(bladeGeom, material);
    const wrapper = new THREE.Group();
    wrapper.add(blade);
    wrapper.rotation.z = angle;
    wrapper.rotation.y = Math.PI * bladeTwist; // leaning the other way vs compressor
    wrapper.position.z = z;
    parentGroup.add(wrapper);
  }
}

// ---------------------------
// FRONT: Fan + LPC (N1 spool)
// ---------------------------
(function buildFanAndLPC() {
  const fanZ = 0.0;
  const fanRadius = 1.8;

  // Hub
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(HUB_RADIUS, HUB_RADIUS, 0.4, 48),
    hubMat
  );
  hub.rotation.x = Math.PI / 2;
  hub.position.z = fanZ;
  n1Group.add(hub);

  // Spinner
  const spinner = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.8, 48),
    hubMat
  );
  spinner.position.z = fanZ + 0.45;
  spinner.rotation.x = Math.PI / 2;
  n1Group.add(spinner);

  // Fan blades (big, readable)
  const fanRootRadius = HUB_RADIUS * 1.2;
  const fanSpan = fanRadius - fanRootRadius;
  const fanBladeGeom = createRadialBladeGeom(fanRootRadius, fanSpan, 0.09);

  const fanBladeCount = 22;
  for (let i = 0; i < fanBladeCount; i++) {
    const angle = (i / fanBladeCount) * Math.PI * 2;
    const blade = new THREE.Mesh(fanBladeGeom, fanMat);
    const wrapper = new THREE.Group();
    wrapper.add(blade);
    wrapper.rotation.z = angle;
    wrapper.rotation.y = -Math.PI * 0.22;
    wrapper.position.z = fanZ;
    n1Group.add(wrapper);
  }

  // LPC stages (booster) behind fan
  const lpcGroup = new THREE.Group();
  n1Group.add(lpcGroup);

  const lpcBaseZ = 0.8;
  const lpcStages = 3;

  for (let s = 0; s < lpcStages; s++) {
    const stageRadius = 1.35 - s * 0.18;
    const stageZ = lpcBaseZ + s * 0.55;
    const rootRadius = HUB_RADIUS * 1.2;

    buildCompressorStage({
      parentGroup: lpcGroup,
      stageRadius,
      rootRadius,
      z: stageZ,
      drumLength: 0.3,
      bladeCount: 24 + s * 6,
      bladeMat: leMat,
      drumColor: 0x8faadc,
      bladeTwist: 0.16
    });
  }
})();

// ---------------------------
// CORE: HPC (N2 spool)
// ---------------------------
(function buildHPC() {
  const hpcGroup = new THREE.Group();
  n2Group.add(hpcGroup);

  const hpcBaseZ = 2.4;
  const stages = 3;

  for (let s = 0; s < stages; s++) {
    const stageRadius = 1.0 - s * 0.12;
    const stageZ = hpcBaseZ + s * 0.45;
    const rootRadius = HUB_RADIUS * 1.4;

    buildCompressorStage({
      parentGroup: hpcGroup,
      stageRadius,
      rootRadius,
      z: stageZ,
      drumLength: 0.26,
      bladeCount: 28 + s * 6,
      bladeMat: coreMat,
      drumColor: 0x5a6d7c,
      bladeTwist: 0.18
    });
  }

  // Core drum tying HPC visually
  const coreDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 2.3, 32),
    coreMat
  );
  coreDrum.rotation.x = Math.PI / 2;
  coreDrum.position.z = 3.3;
  n2Group.add(coreDrum);
})();

// ---------------------------
// COMBUSTOR (static)
// ---------------------------
const combustor = new THREE.Mesh(
  new THREE.TorusGeometry(0.55, 0.12, 16, 64),
  combustorMat
);
combustor.position.z = 4.1;
combustor.rotation.x = Math.PI / 2;
engineRoot.add(combustor);

// Second combustor torus rotated 90° around Z for a crossed appearance
const combustor2 = new THREE.Mesh(
  new THREE.TorusGeometry(0.55, 0.12, 16, 64),
  combustorMat
);
combustor2.position.z = 4.1;
// combustor2.rotation.x = Math.PI / 2;
combustor2.rotation.z = Math.PI / 2; // rotate 90deg about Z
engineRoot.add(combustor2);

// ---------------------------
// TURBINES: HPT (N2) + LPT (N1)
// ---------------------------
(function buildTurbines() {
  // HPT on N2 (2 compact stages)
  const hptGroup = new THREE.Group();
  n2Group.add(hptGroup);

  buildTurbineStage({
    parentGroup: hptGroup,
    radius: 0.65,
    z: 4.5,
    bladeCount: 18,
    material: hptMat,
    bladeTwist: 0.15
  });

  buildTurbineStage({
    parentGroup: hptGroup,
    radius: 0.55,
    z: 4.9,
    bladeCount: 18,
    material: hptMat,
    bladeTwist: 0.16
  });

  // LPT on N1 (2 larger stages, further aft)
  const lptGroup = new THREE.Group();
  n1Group.add(lptGroup);

  buildTurbineStage({
    parentGroup: lptGroup,
    radius: 1.1,
    z: 5.5,
    bladeCount: 16,
    material: lptMat,
    bladeTwist: 0.14,
    rootRadius: 0.20,
    thickness: 0.03
  });

  buildTurbineStage({
    parentGroup: lptGroup,
    radius: 0.65,
    z: 4.0,
    bladeCount: 16,
    material: lptMat,
    bladeTwist: 0.14,
    rootRadius: 0.18,
    thickness: 0.03
  });

    buildTurbineStage({
    parentGroup: lptGroup,
    radius: 0.7,
    z: 5.15,
    bladeCount: 13,
    material: lptMat,
    bladeTwist: 0.14,
    rootRadius: 0.18,
    thickness: 0.05
  });
})();

// ---------------------------
// SHAFT + EXHAUST + NACELLE
// ---------------------------
const mainShaft = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.12, 7.2, 24),
  shaftMat
);
mainShaft.rotation.x = Math.PI / 2;
mainShaft.position.z = 3.6;
engineRoot.add(mainShaft);

// Simple exhaust plug
const exhaustCone = new THREE.Mesh(
  new THREE.ConeGeometry(0.62, 1.8, 32),
  coreMat
);
exhaustCone.position.z = 7.1;
exhaustCone.rotation.x = Math.PI / 2;
engineRoot.add(exhaustCone);

// Nacelle around everything
(function buildNacelle() {
  const outerRadius = 1.9;
  const length = 8.0;
  const nacelle = new THREE.Mesh(
    new THREE.CylinderGeometry(outerRadius, outerRadius, length, 64, 1, true),
    nacelleMat
  );
  nacelle.rotation.x = Math.PI / 2;
  nacelle.position.z = 3.8;
  engineRoot.add(nacelle);
})();

// ---------------------------
// POSITIONING + ANIMATION STATE
// ---------------------------
n1Group.position.z = 0.4;
n2Group.position.z = 0.4;

engineRoot.rotation.y = Math.PI * 0.32;
engineRoot.rotation.x = -Math.PI * 0.08;

// Throttle + spool model
let throttle = parseFloat(throttleSlider.value) / 100; // 0..1
let n1Percent = 0;
let n2Percent = 0;
let lastTime = performance.now();

function updateSpoolPercents(dt) {
  const targetN1 = 20 + throttle * 80; // idle ~20, TO ~100
  const targetN2 = 60 + throttle * 40; // idle ~60, TO ~100

  const tau = 0.7;
  const alpha = 1 - Math.exp(-dt / tau);

  n1Percent += (targetN1 - n1Percent) * alpha;
  n2Percent += (targetN2 - n2Percent) * alpha;
}

function percentToRadPerSec(percent, baseRps, maxRps) {
  const frac = Math.max(0, Math.min(1, percent / 100));
  const rps = baseRps + frac * (maxRps - baseRps);
  return rps * Math.PI * 2;
}

// Public hook for later sim integration
window.updateEngineFromSim = function (data) {
  if (typeof data.throttle === "number") {
    throttle = Math.max(0, Math.min(1, data.throttle));
    throttleSlider.value = Math.round(throttle * 100);
  }
  if (typeof data.n1 === "number") n1Percent = data.n1;
  if (typeof data.n2 === "number") n2Percent = data.n2;
};

// UI bindings
throttleSlider.addEventListener("input", () => {
  throttle = parseFloat(throttleSlider.value) / 100;
});

// Resize
function resizeRendererToDisplaySize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}
window.addEventListener("resize", resizeRendererToDisplaySize);

// Main loop
function render(now) {
  const dt = Math.max(0.001, (now - lastTime) / 1000.0);
  lastTime = now;

  resizeRendererToDisplaySize();
  updateSpoolPercents(dt);

  const n1RadPerSec = percentToRadPerSec(n1Percent, 8, 40);
  const n2RadPerSec = percentToRadPerSec(n2Percent, 15, 65);

  // Animate spools:
  // N1: Fan + LPC + LPT
  n1Group.rotation.z += n1RadPerSec * dt;

  // N2: HPC + core drum + HPT
  n2Group.rotation.z += n2RadPerSec * dt;

  n1Label.textContent = n1Percent.toFixed(1);
  n2Label.textContent = n2Percent.toFixed(1);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);