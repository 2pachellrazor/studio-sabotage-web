import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// === PAINTINGS DATA ===
const CDN_BASE = 'https://cdn.shopify.com/s/files/1/1013/4650/9142/files/';
const CDN_SUFFIX = '?v=1774065825';

// 4 paintings for Sub Rosa
const PAINTINGS = [
  { title: 'DRMS',             url: CDN_BASE + 'drms.jpg?v=1774374693',       w: 306, h: 153, large: true },
  { title: 'Pink Rabbit',      url: CDN_BASE + 'painting_11.jpg' + CDN_SUFFIX, w: 60,  h: 80 },
  { title: 'Rabbit II',        url: CDN_BASE + 'painting_12.jpg' + CDN_SUFFIX, w: 60,  h: 80 },
  { title: 'Rabbit on Yellow', url: CDN_BASE + 'painting_14.jpg' + CDN_SUFFIX, w: 60,  h: 80 },
];

// === STATE ===
let isLocked = false;
let modelLoaded = false;
let floorY = 0;
let eyeHeight = 1.7;
let roomBounds = { xMin: -10, xMax: 10, zMin: -10, zMax: 10 };
const paintingMeshes = [];
let hoveredPainting = null;

// ── Touch Detection ──
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let isTouchActive = false;
let touchLook = { active: false, id: null, lastX: 0, lastY: 0 };
let touchPinch = { active: false, startDist: 0, lastDist: 0, lastMidX: 0, lastMidY: 0 };
let touchMoveZ = 0;
let touchMoveX = 0;
const TOUCH_LOOK_SENSITIVITY = 0.003;
const TOUCH_MOVE_SENSITIVITY = 0.012;

// === SCENE ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.FogExp2(0x050508, 0.03);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// === LIGHTING ===
scene.add(new THREE.AmbientLight(0x889999, 1.0));
scene.add(new THREE.HemisphereLight(0xaabbcc, 0x111122, 0.5));

const fill = new THREE.DirectionalLight(0x8899aa, 0.4);
fill.position.set(0, 15, 0);
scene.add(fill);

const skyLight = new THREE.PointLight(0x6699cc, 2.0, 40);
scene.add(skyLight);
const skyLight2 = new THREE.PointLight(0x6699cc, 1.2, 35);
scene.add(skyLight2);
const pinkNeon = new THREE.PointLight(0xFF3E8E, 0.6, 20);
scene.add(pinkNeon);

// === LOADERS ===
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const textureLoader = new THREE.TextureLoader();

// === RAYCASTER ===
const raycaster = new THREE.Raycaster();
raycaster.far = 10;
const screenCenter = new THREE.Vector2(0, 0);

// === CREATE PAINTING MESH ===
function createPaintingMesh(texture, p, position, rotationY) {
  const pScale = 4.0 / 100;
  const pw = p.w * pScale;
  const ph = p.h * pScale;
  const group = new THREE.Group();

  // Frame
  const frameW = 0.04;
  const frameD = 0.06;
  const framePattern = [1, 0, 0, 1]; // 1 = pink, 0 = black
  const isPink = framePattern[paintingMeshes.length % framePattern.length] === 1;
  const frameMat = isPink
    ? new THREE.MeshStandardMaterial({ color: 0xF5A0B5, roughness: 0.35, metalness: 0.2 })
    : new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.25, metalness: 0.15 });

  // Back
  group.add(new THREE.Mesh(
    new THREE.PlaneGeometry(pw + frameW * 2, ph + frameW * 2),
    new THREE.MeshStandardMaterial({ color: 0x0a0a08 })
  ));

  // Frame border
  function addFrame(halfW, halfH, w, d, mat) {
    const fullW = (halfW + w) * 2;
    const top = new THREE.Mesh(new THREE.BoxGeometry(fullW, w, d), mat);
    top.position.set(0, halfH + w / 2, d / 2); group.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(fullW, w, d), mat);
    bot.position.set(0, -halfH - w / 2, d / 2); group.add(bot);
    const left = new THREE.Mesh(new THREE.BoxGeometry(w, halfH * 2, d), mat);
    left.position.set(-halfW - w / 2, 0, d / 2); group.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(w, halfH * 2, d), mat);
    right.position.set(halfW + w / 2, 0, d / 2); group.add(right);
  }
  addFrame(pw / 2, ph / 2, frameW, frameD, frameMat);

  // Canvas
  const paintMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(pw, ph),
    texture
      ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide })
  );
  paintMesh.position.z = 0.03;
  group.add(paintMesh);

  group.position.copy(position);
  group.rotation.y = rotationY;
  scene.add(group);

  // SpotLight per painting
  const spotDir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
  const spotPos = position.clone().add(new THREE.Vector3(0, ph / 2 + 1.5, 0)).sub(spotDir.clone().multiplyScalar(1.0));
  const spot = new THREE.SpotLight(0xfff8f0, 4.0, 15, Math.PI / 5, 0.5, 1.5);
  spot.position.copy(spotPos);
  spot.target.position.copy(position);
  spot.castShadow = true;
  spot.shadow.mapSize.set(512, 512);
  spot.shadow.bias = -0.001;
  scene.add(spot);
  scene.add(spot.target);

  group.traverse(child => { if (child.isMesh) child.castShadow = true; });

  paintMesh.userData = { paintingTitle: p.title, paintingData: p };
  paintingMeshes.push(paintMesh);
  return group;
}

// === LOAD GLB ===
const headerEl = document.getElementById('gallery-header');
const overlayEl = document.getElementById('overlay');
const loadBar = document.getElementById('load-bar');
const loadStatus = document.getElementById('load-status');

gltfLoader.load(
  window.SS_ASSETS.manufactoryGlb,
  (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 30 / Math.max(size.x, size.y, size.z);
    model.scale.setScalar(scale);

    const scaledBox = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const scaledSize = scaledBox.getSize(new THREE.Vector3());
    model.position.x -= scaledCenter.x;
    model.position.z -= scaledCenter.z;
    model.position.y -= scaledBox.min.y;
    model.traverse(child => { if (child.isMesh) child.receiveShadow = true; });
    scene.add(model);

    const finalBox = new THREE.Box3().setFromObject(model);
    const margin = scaledSize.x * 0.12;
    roomBounds = {
      xMin: finalBox.min.x + margin, xMax: finalBox.max.x - margin,
      zMin: finalBox.min.z + margin, zMax: finalBox.max.z - margin
    };

    // Floor detection
    const floorRay = new THREE.Raycaster();
    floorRay.set(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, -1, 0));
    const allHits = floorRay.intersectObject(model, true);

    if (allHits.length >= 3) floorY = allHits[allHits.length - 2].point.y;
    else if (allHits.length >= 1) floorY = allHits[allHits.length - 1].point.y;

    eyeHeight = floorY + 6.4;

    camera.position.set(0, eyeHeight, 0);
    camera.lookAt(3, eyeHeight, 0);

    skyLight.position.set(0, floorY + 10, 0);
    skyLight2.position.set(-5, floorY + 9, 3);
    pinkNeon.position.set(4, floorY + 5, -2);

    modelLoaded = true;
    loadBar.style.width = '100%';
    setTimeout(() => {
      document.querySelector('.bar-track').style.opacity = '0';
    }, 400);
    loadStatus.textContent = isTouchDevice ? 'Tap to enter' : 'Click to enter';

    // === PAINTING PLACEMENT ===
    const paintingY = eyeHeight - 0.5;

    const placements = [
      { painting: PAINTINGS[0], pos: new THREE.Vector3(8.0, paintingY, 8.1), rotY: Math.PI },       // DRMS — large, z+ wall
      { painting: PAINTINGS[1], pos: new THREE.Vector3(0.0, paintingY, 7.1), rotY: Math.PI },       // Pink Rabbit — z+ wall
      { painting: PAINTINGS[2], pos: new THREE.Vector3(0.0, paintingY, -8.5), rotY: 0 },            // Rabbit II — z- wall
      { painting: PAINTINGS[3], pos: new THREE.Vector3(-13.5, paintingY, -5.5), rotY: Math.PI / 2 },// Rabbit on Yellow — x- wall
    ];

    placements.forEach(pl => {
      textureLoader.load(pl.painting.url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        createPaintingMesh(tex, pl.painting, pl.pos, pl.rotY);
      });
    });

    // Show header
    headerEl.classList.add('visible');
  },
  (progress) => {
    if (progress.total > 0) {
      const pct = Math.min(95, Math.round(progress.loaded / progress.total * 95));
      loadBar.style.width = pct + '%';
      loadStatus.textContent = `Loading ${pct}%`;
    }
  },
  (error) => {
    console.error('[Sub Rosa] GLB load error:', error);
    loadBar.style.background = '#cc4444';
    loadStatus.textContent = 'Error loading model';
  }
);

// === CONTROLS ===
const crosshair = document.getElementById('crosshair');
const infoEl = document.getElementById('info');

overlayEl.addEventListener('click', () => {
  if (!modelLoaded) return;
  try { renderer.domElement.requestPointerLock(); } catch(e) { /* Safari fallback */ }
});

document.addEventListener('pointerlockchange', () => {
  isLocked = document.pointerLockElement === renderer.domElement;
  if (isLocked) {
    overlayEl.classList.add('hidden');
    crosshair.style.display = 'block';
  } else {
    overlayEl.classList.remove('hidden');
    crosshair.style.display = 'none';
  }
});

// Mouse look
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
document.addEventListener('mousemove', (e) => {
  if (!isLocked) return;
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= e.movementX * 0.002;
  euler.x -= e.movementY * 0.002;
  euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.x));
  camera.quaternion.setFromEuler(euler);
});

// WASD
const keys = {};
document.addEventListener('keydown', (e) => { keys[e.code] = true; });
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// ── Touch Controls ──────────────────────────────────────────────
renderer.domElement.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isTouchActive = true;

  if (e.touches.length === 1 && !touchPinch.active) {
    const t = e.touches[0];
    touchLook = { active: true, id: t.identifier, lastX: t.clientX, lastY: t.clientY };

    // First tap enters the room (no pointer lock on mobile)
    if (!isLocked && !overlayEl.classList.contains('hidden')) {
      if (!modelLoaded) return;
      overlayEl.classList.add('hidden');
      crosshair.style.display = 'none';
      document.getElementById('controls-hint').style.display = 'block';
    }
  }

  if (e.touches.length === 2) {
    touchLook.active = false;
    const t0 = e.touches[0], t1 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const midX = (t0.clientX + t1.clientX) / 2;
    const midY = (t0.clientY + t1.clientY) / 2;
    touchPinch = { active: true, startDist: dist, lastDist: dist, lastMidX: midX, lastMidY: midY };
  }
}, { passive: false });

renderer.domElement.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && touchLook.active) {
    const t = e.touches[0];
    if (t.identifier === touchLook.id) {
      const dx = t.clientX - touchLook.lastX;
      const dy = t.clientY - touchLook.lastY;
      touchLook.lastX = t.clientX;
      touchLook.lastY = t.clientY;

      euler.setFromQuaternion(camera.quaternion);
      euler.y -= dx * TOUCH_LOOK_SENSITIVITY;
      euler.x -= dy * TOUCH_LOOK_SENSITIVITY;
      euler.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.x));
      camera.quaternion.setFromEuler(euler);
    }
  }

  if (e.touches.length === 2 && touchPinch.active) {
    const t0 = e.touches[0], t1 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const midX = (t0.clientX + t1.clientX) / 2;

    touchMoveZ = (dist - touchPinch.lastDist) * TOUCH_MOVE_SENSITIVITY;
    touchMoveX = -(midX - touchPinch.lastMidX) * TOUCH_MOVE_SENSITIVITY * 0.5;

    touchPinch.lastDist = dist;
    touchPinch.lastMidX = midX;
  }
}, { passive: false });

renderer.domElement.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) { touchPinch.active = false; touchMoveZ = 0; touchMoveX = 0; }
  if (e.touches.length === 0) { touchLook.active = false; }
  if (e.touches.length === 1) {
    const t = e.touches[0];
    touchLook = { active: true, id: t.identifier, lastX: t.clientX, lastY: t.clientY };
  }
});

// Double-tap to show painting info
let lastTapTime = 0;
renderer.domElement.addEventListener('touchend', (e) => {
  if (e.changedTouches.length !== 1) return;
  const now = Date.now();
  if (now - lastTapTime < 300 && isTouchActive) {
    const touch = e.changedTouches[0];
    const x = (touch.clientX / window.innerWidth) * 2 - 1;
    const y = -(touch.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const hits = raycaster.intersectObjects(paintingMeshes, false);
    if (hits.length > 0 && hits[0].object.userData.paintingTitle) {
      const data = hits[0].object.userData;
      infoEl.textContent = data.paintingTitle + ` \u2014 ${data.paintingData.w} \u00d7 ${data.paintingData.h} cm`;
      infoEl.classList.add('visible');
      setTimeout(() => infoEl.classList.remove('visible'), 3000);
    }
  }
  lastTapTime = now;
});

// Mobile: adapt controls hint text
if (isTouchDevice) {
  document.getElementById('controls-hint').textContent = 'Drag to look \u00b7 Pinch to move \u00b7 Double-tap painting';
}

// Prevent browser zoom gestures
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

function updateMovement(dt) {
  if ((!isLocked && !isTouchActive) || !modelLoaded) return;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

  const dir = new THREE.Vector3();
  if (keys['KeyW'] || keys['ArrowUp']) dir.add(forward);
  if (keys['KeyS'] || keys['ArrowDown']) dir.sub(forward);
  if (keys['KeyD'] || keys['ArrowRight']) dir.add(right);
  if (keys['KeyA'] || keys['ArrowLeft']) dir.sub(right);

  // Touch pinch → forward/backward + strafe
  if (Math.abs(touchMoveZ) > 0.001) dir.addScaledVector(forward, touchMoveZ);
  if (Math.abs(touchMoveX) > 0.001) dir.addScaledVector(right, touchMoveX);

  if (dir.lengthSq() > 0) {
    dir.normalize();
    camera.position.addScaledVector(dir, 3.5 * dt);
  }
  camera.position.x = Math.max(roomBounds.xMin, Math.min(roomBounds.xMax, camera.position.x));
  camera.position.z = Math.max(roomBounds.zMin, Math.min(roomBounds.zMax, camera.position.z));
  camera.position.y = eyeHeight;
}

function updateRaycast() {
  if (!isLocked && !isTouchActive) return;
  raycaster.setFromCamera(screenCenter, camera);
  const hits = raycaster.intersectObjects(paintingMeshes, false);
  if (hits.length > 0 && hits[0].object.userData.paintingTitle) {
    const data = hits[0].object.userData;
    hoveredPainting = data;
    infoEl.textContent = data.paintingTitle + ` \u2014 ${data.paintingData.w} \u00d7 ${data.paintingData.h} cm`;
    infoEl.classList.add('visible');
    renderer.domElement.style.cursor = 'pointer';
    return;
  }
  hoveredPainting = null;
  infoEl.classList.remove('visible');
  renderer.domElement.style.cursor = '';
}

// ─── Debug: Position Display (press P to toggle) ────────────────────
const debugEl = document.createElement('div');
debugEl.style.cssText = 'display:none; position:fixed; bottom:70px; left:16px; z-index:200; font-family:monospace; font-size:0.7rem; color:#FF3E8E; background:rgba(5,5,8,0.9); padding:6px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(255,62,142,0.3);';
document.body.appendChild(debugEl);

const debugTarget = document.createElement('div');
debugTarget.style.cssText = 'display:none; position:fixed; bottom:44px; left:16px; z-index:200; font-family:monospace; font-size:0.7rem; color:rgba(255,255,255,0.6); background:rgba(5,5,8,0.9); padding:6px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(255,255,255,0.1);';
document.body.appendChild(debugTarget);

const debugBounds = document.createElement('div');
debugBounds.style.cssText = 'display:none; position:fixed; bottom:18px; left:16px; z-index:200; font-family:monospace; font-size:0.65rem; color:rgba(255,255,255,0.4); background:rgba(5,5,8,0.9); padding:4px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(255,255,255,0.05);';
document.body.appendChild(debugBounds);

let debugMode = false;
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyP' && (isLocked || isTouchActive)) {
    debugMode = !debugMode;
    debugEl.style.display = debugMode ? 'block' : 'none';
    debugTarget.style.display = debugMode ? 'block' : 'none';
    debugBounds.style.display = debugMode ? 'block' : 'none';
    if (debugMode) {
      debugBounds.textContent = `bounds: x[${roomBounds.xMin.toFixed(1)}…${roomBounds.xMax.toFixed(1)}] z[${roomBounds.zMin.toFixed(1)}…${roomBounds.zMax.toFixed(1)}] floorY:${floorY.toFixed(2)} eyeH:${eyeHeight.toFixed(2)}`;
    }
  }
});

// === ANIMATE ===
let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;
  updateMovement(dt);
  updateRaycast();

  // Debug position display
  if (debugMode) {
    debugEl.textContent = `cam: x:${camera.position.x.toFixed(2)}  y:${camera.position.y.toFixed(2)}  z:${camera.position.z.toFixed(2)}`;
    const debugRay = new THREE.Raycaster();
    debugRay.setFromCamera(screenCenter, camera);
    const allMeshes = [];
    scene.traverse(c => { if (c.isMesh) allMeshes.push(c); });
    const targetHits = debugRay.intersectObjects(allMeshes);
    if (targetHits.length > 0) {
      const p = targetHits[0].point;
      const name = targetHits[0].object.userData.paintingTitle || targetHits[0].object.name || '(mesh)';
      debugTarget.textContent = `target: x:${p.x.toFixed(2)}  y:${p.y.toFixed(2)}  z:${p.z.toFixed(2)}  [${name}]`;
    } else {
      debugTarget.textContent = 'target: ---';
    }
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
