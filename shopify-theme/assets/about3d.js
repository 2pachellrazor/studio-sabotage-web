import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ─── Hotspot Data ────────────────────────────────────────────────────
const HOTSPOTS = [
  {
    id: 'computer',
    position: new THREE.Vector3(-0.81, 1.51, 3.34),
    category: 'Arbeit',
    title: 'Der Computer',
    text: `Links laufen Kampagnen f\u00fcr Vier f\u00fcr Texas, rechts der Code f\u00fcr diese Seite. Ich hab in Z\u00fcrich angefangen, SEA bei Webrepublic, dann E-Commerce bei Outfittery in Berlin. Jetzt Performance Marketing in der Agentur und nebenbei das hier. Irgendwann verschwimmt die Grenze \u2014 und das ist okay so.`,
    detail: ''
  },
  {
    id: 'books',
    position: new THREE.Vector3(-2.46, 1.32, 1.83),
    category: 'Lesen',
    title: 'Der B\u00fccherstapel',
    text: `Romane neben Kunstb\u00fcchern neben Sachen \u00fcber kreative Prozesse. Gie\u00dfen studiert, ein Semester in Istanbul gemalt. Sortiert wird das nicht mehr. Wer was sucht, findet was anderes. Meistens das Bessere.`,
    detail: ''
  },
  {
    id: 'clothes',
    position: new THREE.Vector3(0.49, 1.65, -0.22),
    category: 'Stil',
    title: 'Die Kleiderstange',
    text: `Da h\u00e4ngt die MA-1 neben dem Leopardenprint. Ich ziehe mich an wie ich male \u2014 Sachen die eigentlich nicht zusammengeh\u00f6ren, bis sie es tun.`,
    detail: ''
  },
  {
    id: 'plants',
    position: new THREE.Vector3(0.40, 1.32, 2.25),
    category: 'Leben',
    title: 'Die Pflanzen',
    text: `Die stehen hier seit ich eingezogen bin. Ich vergesse sie regelm\u00e4\u00dfig. Sie machen trotzdem weiter. Vielleicht ist das die treffendste Metapher f\u00fcr alles hier.`,
    detail: ''
  },
  {
    id: 'bike',
    position: new THREE.Vector3(-2.0, 1.0, 2.8),
    category: 'Bewegung',
    title: 'Das Fahrrad',
    text: `Steht im Zimmer, weil es drau\u00dfen geklaut wird. Und weil es hier reinpasst. Gerade so.`,
    detail: ''
  },
  {
    id: 'ceiling',
    position: new THREE.Vector3(-1.0, 2.3, 0.0),
    category: 'Ort',
    title: 'Die Dachschr\u00e4ge',
    text: `W\u00e4chtersbach, Hessen. Nicht die Adresse die man auf eine K\u00fcnstler-Bio schreibt. Davor Z\u00fcrich, Berlin, Istanbul, Kirgistan. Ich bin viel umgezogen. Hier bleibe ich erstmal. Die Schr\u00e4ge erinnert mich jeden Morgen daran, dass nichts gerade verl\u00e4uft.`,
    detail: ''
  },
  {
    id: 'bed',
    position: new THREE.Vector3(-1.15, 0.95, -1.83),
    category: 'Ehrlich',
    title: 'Das Bett',
    text: `Hier liegen ein Skizzenbuch und ein Handy. Und ehrlich gesagt meistens ich \u2014 mit Skizzenbuch und Handy.`,
    detail: ''
  },
  {
    id: 'lamp',
    position: new THREE.Vector3(-2.2, 0.9, -2.2),
    category: 'Objekt',
    title: 'Die orange Lampe',
    text: `Steht hier, weil sie orange ist. Mehr Konzept steckt da nicht dahinter.`,
    detail: ''
  },
  {
    id: 'universe',
    position: new THREE.Vector3(-1.50, 1.73, -3.65),
    category: '???',
    title: 'Das Universum',
    text: `Du bist aus dem Zimmer rausgegangen. Die meisten bleiben drin. Hier drau\u00dfen gibt es nichts \u2014 au\u00dfer allem.`,
    detail: ''
  },
  {
    id: 'desktop-note',
    position: new THREE.Vector3(-0.81, 1.1, 3.2),
    category: 'Transparenz',
    title: 'Desktop-Notiz',
    text: `Wie fast alles hier wurden auch diese Texte mit KI geschrieben. Ich hab korrigiert, gestrichen und entschieden was bleibt.`,
    detail: ''
  }
];

// ─── DOM Refs ────────────────────────────────────────────────────────
const loadingEl    = document.getElementById('loading');
const loadBar      = document.getElementById('load-bar');
const loadStatus   = document.getElementById('load-status');
const ctaLine      = document.getElementById('cta-line');
const overlayEl    = document.getElementById('overlay');
const crosshairEl  = document.getElementById('crosshair');
const controlsHint = document.getElementById('controls-hint');
const headerEl     = document.getElementById('gallery-header');
const hotspotHint  = document.getElementById('hotspot-hint');
const panel        = document.getElementById('info-panel');

// ─── Three.js Basics ─────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(0, 1.7, 0);

const _isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const renderer = new THREE.WebGLRenderer({ antialias: !_isTouch, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, _isTouch ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.4;
document.body.appendChild(renderer.domElement);

// ─── Lighting ────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffeedd, 1.8));
scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 0.8));

const skyLight = new THREE.DirectionalLight(0xffffff, 1.2);
skyLight.position.set(0, 10, 0);
scene.add(skyLight);

const fillLight = new THREE.DirectionalLight(0xffeedd, 0.6);
fillLight.position.set(5, 8, 3);
scene.add(fillLight);

const fillLight2 = new THREE.DirectionalLight(0xeeeeff, 0.5);
fillLight2.position.set(-5, 6, -3);
scene.add(fillLight2);

// Pink accent (subtle)
const pinkLight = new THREE.PointLight(0xFF3E8E, 0.15, 10);
pinkLight.position.set(0, 2.5, 0);
scene.add(pinkLight);

// ─── Room Bounds ─────────────────────────────────────────────────────
let ROOM_BOUNDS = { xMin: -10, xMax: 10, zMin: -10, zMax: 10 };
let EYE_HEIGHT = 1.7;

// ─── Raycaster ───────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
raycaster.far = 4;
const screenCenter = new THREE.Vector2(0, 0);

const hotspotSpheres = [];

function createHotspotSpheres() {
  const geo = new THREE.SphereGeometry(0.35, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ visible: false });

  HOTSPOTS.forEach((hs, i) => {
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(hs.position);
    sphere.userData.hotspotIndex = i;
    scene.add(sphere);
    hotspotSpheres.push(sphere);
  });
}

// ─── GLB Loading ─────────────────────────────────────────────────────
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
let roomLoaded = false;

function updateLoading(pct, msg) {
  loadBar.style.width = pct + '%';
  loadStatus.textContent = msg;
}

function loadRoom(url) {
  updateLoading(5, 'loading room...');

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Scale so longest dimension is ~8 units
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 8 / maxDim;
      model.scale.setScalar(scale);

      // Recalculate after scaling
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());

      // Center on XZ, put floor at Y=0
      model.position.x -= scaledCenter.x;
      model.position.z -= scaledCenter.z;
      model.position.y -= scaledBox.min.y;

      scene.add(model);

      // Compute room bounds
      const finalBox = new THREE.Box3().setFromObject(model);
      const margin = 0.3;
      ROOM_BOUNDS = {
        xMin: finalBox.min.x + margin,
        xMax: finalBox.max.x - margin,
        zMin: finalBox.min.z + margin,
        zMax: finalBox.max.z - margin
      };

      // Eye height
      EYE_HEIGHT = Math.min(Math.max(scaledSize.y * 0.45, 1.2), 2.0);
      camera.position.set(0, EYE_HEIGHT, 0);

      roomLoaded = true;
      finishLoading();
    },
    (progress) => {
      if (progress.total > 0) {
        const pct = Math.min(95, Math.round((progress.loaded / progress.total) * 95));
        updateLoading(pct, `loading room... ${pct}%`);
      }
    },
    (error) => {
      console.warn('GLB load error:', error);
      updateLoading(0, 'error loading room.glb');
    }
  );
}

function finishLoading() {
  updateLoading(100, 'ready');
  loadStatus.style.display = 'none';
  document.querySelector('.bar-track').style.display = 'none';
  loadingEl.style.cursor = 'pointer';

  // Show CTA
  ctaLine.style.display = 'block';

  // CTA hover
  ctaLine.addEventListener('mouseenter', () => {
    ctaLine.style.background = 'rgba(var(--ss-neon-rgb),0.15)';
    ctaLine.style.borderColor = 'rgba(var(--ss-neon-rgb),0.5)';
    ctaLine.style.boxShadow = '0 0 30px rgba(var(--ss-neon-rgb),0.2)';
  });
  ctaLine.addEventListener('mouseleave', () => {
    ctaLine.style.background = 'rgba(var(--ss-neon-rgb),0.05)';
    ctaLine.style.borderColor = 'rgba(var(--ss-neon-rgb),0.4)';
    ctaLine.style.boxShadow = '0 0 20px rgba(var(--ss-neon-rgb),0.08)';
  });

  // Create hotspot interaction spheres
  createHotspotSpheres();
  createHotspotMarkers();

  // Click anywhere to enter
  let entered = false;
  loadingEl.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    loadingEl.classList.add('fade-enter');
    setTimeout(() => {
      loadingEl.style.display = 'none';
      headerEl.classList.add('visible');
      if (isTouchDevice) {
        isTouchActive = true;
        crosshairEl.style.display = 'none';
        controlsHint.style.display = 'block';
      } else {
        try { renderer.domElement.requestPointerLock(); } catch(e) { /* Safari fallback */ }
      }
    }, 700);
  });

  // Touch tap on loading screen
  loadingEl.addEventListener('touchend', (e) => {
    if (entered || !roomLoaded) return;
    e.preventDefault();
    entered = true;
    isTouchActive = true;
    loadingEl.classList.add('fade-enter');
    setTimeout(() => {
      loadingEl.style.display = 'none';
      headerEl.classList.add('visible');
      crosshairEl.style.display = 'none';
      controlsHint.style.display = 'block';
    }, 700);
  });
}

// ── Touch Detection ──
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let isTouchActive = false;
let touchLook = { active: false, id: null, lastX: 0, lastY: 0 };
let touchPinch = { active: false, startDist: 0, lastDist: 0, lastMidX: 0, lastMidY: 0 };
let touchMoveZ = 0;
let touchMoveX = 0;
const TOUCH_LOOK_SENSITIVITY = 0.003;
const TOUCH_MOVE_SENSITIVITY = 0.012;

// ─── Pointer Lock ────────────────────────────────────────────────────
let isLocked = false;

overlayEl.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

renderer.domElement.addEventListener('click', () => {
  if (!isLocked && roomLoaded) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  isLocked = document.pointerLockElement === renderer.domElement;
  if (isLocked) {
    crosshairEl.style.display = 'block';
    controlsHint.style.display = 'block';
    panel.classList.remove('visible');
    activeHotspot = -1;
  } else {
    crosshairEl.style.display = 'none';
    controlsHint.style.display = 'none';
    hotspotHint.classList.remove('visible');
  }
});

// ─── Mouse Look ──────────────────────────────────────────────────────
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const MOUSE_SENSITIVITY = 0.002;
const MAX_PITCH = Math.PI / 2 - 0.05;

document.addEventListener('mousemove', (e) => {
  if (!isLocked) return;
  euler.setFromQuaternion(camera.quaternion);
  euler.y -= e.movementX * MOUSE_SENSITIVITY;
  euler.x -= e.movementY * MOUSE_SENSITIVITY;
  euler.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, euler.x));
  camera.quaternion.setFromEuler(euler);
});

// ─── Keyboard Movement ──────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if ((e.code === 'KeyQ' || e.code === 'Tab') && isLocked) {
    e.preventDefault();
    document.exitPointerLock();
  }
  if (e.code === 'Escape') {
    if (activeHotspot >= 0) {
      closePanel();
      e.preventDefault();
    }
  }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// ── Touch Controls ──────────────────────────────────────────────
renderer.domElement.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isTouchActive = true;

  if (e.touches.length === 1 && !touchPinch.active) {
    const t = e.touches[0];
    touchLook = { active: true, id: t.identifier, lastX: t.clientX, lastY: t.clientY };

    // Resume from overlay via touch
    if (!isLocked && !overlayEl.classList.contains('hidden')) {
      overlayEl.classList.add('hidden');
      crosshairEl.style.display = 'none';
      controlsHint.style.display = 'block';
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
      euler.x = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, euler.x));
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

// Double-tap to interact with hotspots
let lastTapTime = 0;
renderer.domElement.addEventListener('touchend', (e) => {
  if (e.changedTouches.length !== 1) return;
  const now = Date.now();
  if (now - lastTapTime < 300 && isTouchActive) {
    const touch = e.changedTouches[0];
    const x = (touch.clientX / window.innerWidth) * 2 - 1;
    const y = -(touch.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const hsHits = raycaster.intersectObjects(hotspotSpheres, false);
    if (hsHits.length > 0) {
      const idx = hsHits[0].object.userData.hotspotIndex;
      if (idx !== undefined) openPanel(idx);
    }
  }
  lastTapTime = now;
});

// Mobile: adapt controls hint + resume overlay text
if (isTouchDevice) {
  controlsHint.querySelector('span').textContent = 'Drag to look \u00b7 Pinch to move \u00b7 Double-tap hotspot';
  overlayEl.querySelector('.resume-text').textContent = 'Tap to keep looking';
}

// Prevent browser zoom gestures
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

const MOVE_SPEED = 2.8;
const direction = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

function updateMovement(dt) {
  if (!isLocked && !isTouchActive) return;

  direction.set(0, 0, 0);

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  right.crossVectors(forward, camera.up).normalize();

  if (keys['KeyW'] || keys['ArrowUp'])    direction.add(forward);
  if (keys['KeyS'] || keys['ArrowDown'])   direction.sub(forward);
  if (keys['KeyA'] || keys['ArrowLeft'])   direction.sub(right);
  if (keys['KeyD'] || keys['ArrowRight'])  direction.add(right);

  // Touch pinch → forward/backward + strafe
  if (Math.abs(touchMoveZ) > 0.001) direction.addScaledVector(forward, touchMoveZ);
  if (Math.abs(touchMoveX) > 0.001) direction.addScaledVector(right, touchMoveX);

  if (direction.lengthSq() > 0) {
    direction.normalize();
    camera.position.addScaledVector(direction, MOVE_SPEED * dt);
  }

  camera.position.x = Math.max(ROOM_BOUNDS.xMin, Math.min(ROOM_BOUNDS.xMax, camera.position.x));
  camera.position.z = Math.max(ROOM_BOUNDS.zMin, Math.min(ROOM_BOUNDS.zMax, camera.position.z));
  camera.position.y = EYE_HEIGHT;
}

// ─── Hotspot Interaction ─────────────────────────────────────────────
let hoveredHotspot = -1;
let activeHotspot = -1;

function updateHotspotRaycast() {
  if ((!isLocked && !isTouchActive) || !roomLoaded) return;

  raycaster.setFromCamera(screenCenter, camera);
  const hits = raycaster.intersectObjects(hotspotSpheres);

  if (hits.length > 0) {
    const idx = hits[0].object.userData.hotspotIndex;
    if (hoveredHotspot !== idx) {
      hoveredHotspot = idx;
      hotspotHint.textContent = `[ ${HOTSPOTS[idx].title} ] \u2014 Click`;
      hotspotHint.classList.add('visible');
    }
  } else {
    if (hoveredHotspot >= 0) {
      hoveredHotspot = -1;
      hotspotHint.classList.remove('visible');
    }
  }
}

renderer.domElement.addEventListener('click', () => {
  if (isLocked && hoveredHotspot >= 0) {
    openPanel(hoveredHotspot);
  }
});

// ─── Info Panel ──────────────────────────────────────────────────────
function openPanel(index) {
  const hs = HOTSPOTS[index];
  activeHotspot = index;

  document.getElementById('panel-category').textContent = hs.category;
  document.getElementById('panel-title').textContent = hs.title;
  document.getElementById('panel-text').textContent = hs.text;
  document.getElementById('panel-detail').textContent = hs.detail;

  panel.classList.add('visible');
  document.exitPointerLock();
}

function closePanel() {
  panel.classList.remove('visible');
  activeHotspot = -1;
  renderer.domElement.requestPointerLock();
}

document.getElementById('close-panel-btn').addEventListener('click', closePanel);

// Click outside panel to close
panel.addEventListener('click', (e) => {
  if (e.target === panel) closePanel();
});

// ─── Hotspot Markers (HTML overlays projected from 3D) ───────────────
const hotspotContainer = document.getElementById('hotspot-container');
const markerElements = [];

function createHotspotMarkers() {
  HOTSPOTS.forEach((hs, i) => {
    const el = document.createElement('div');
    el.className = 'hotspot-marker';
    el.innerHTML = `<div class="ring"></div><div class="dot"></div><div class="label">${hs.title}</div>`;
    hotspotContainer.appendChild(el);
    markerElements.push(el);
  });
}

function updateHotspotPositions() {
  if (!roomLoaded) return;

  const w2 = window.innerWidth / 2;
  const h2 = window.innerHeight / 2;

  HOTSPOTS.forEach((hs, i) => {
    const el = markerElements[i];
    if (!el) return;

    const projected = hs.position.clone().project(camera);

    if (projected.z > 1) {
      el.style.display = 'none';
      return;
    }

    const x = (projected.x * w2) + w2;
    const y = -(projected.y * h2) + h2;

    el.style.display = 'block';
    el.style.left = x + 'px';
    el.style.top = y + 'px';

    const dist = camera.position.distanceTo(hs.position);
    const opacity = THREE.MathUtils.clamp(1 - (dist - 2) / 8, 0.1, 1);
    el.style.opacity = opacity;

    if (dist < 3) {
      el.classList.add('nearby');
    } else {
      el.classList.remove('nearby');
    }
  });
}

// ─── Resize ──────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Debug: Position Display (press P to toggle) ────────────────────
const debugEl = document.createElement('div');
debugEl.style.cssText = 'display:none; position:fixed; bottom:70px; left:16px; z-index:200; font-family:monospace; font-size:0.7rem; color:var(--ss-neon); background:rgba(245,245,240,0.9); padding:6px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(var(--ss-neon-rgb),0.3);';
document.body.appendChild(debugEl);

const debugTarget = document.createElement('div');
debugTarget.style.cssText = 'display:none; position:fixed; bottom:44px; left:16px; z-index:200; font-family:monospace; font-size:0.7rem; color:rgba(0,0,0,0.6); background:rgba(245,245,240,0.9); padding:6px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(0,0,0,0.1);';
document.body.appendChild(debugTarget);

let debugMode = false;
document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyP' && isLocked) {
    debugMode = !debugMode;
    debugEl.style.display = debugMode ? 'block' : 'none';
    debugTarget.style.display = debugMode ? 'block' : 'none';
  }
});

const targetRaycaster = new THREE.Raycaster();
targetRaycaster.far = 20;

// ─── Animation Loop ──────────────────────────────────────────────────
const clock = new THREE.Clock();
let _animRunning = true;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { _animRunning = false; }
  else { _animRunning = true; clock.getDelta(); requestAnimationFrame(animate); }
});

function animate() {
  if (!_animRunning) return;
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  updateMovement(dt);
  updateHotspotRaycast();
  updateHotspotPositions();

  // Debug position display (mesh cache for performance)
  if (debugMode && isLocked) {
    debugEl.textContent = `cam: x:${camera.position.x.toFixed(2)}  y:${camera.position.y.toFixed(2)}  z:${camera.position.z.toFixed(2)}`;

    if (!window._debugMeshCache || window._debugMeshCacheDirty) {
      window._debugMeshCache = [];
      scene.traverse(child => { if (child.isMesh && child.material.visible !== false) window._debugMeshCache.push(child); });
      window._debugMeshCacheDirty = false;
    }
    targetRaycaster.setFromCamera(screenCenter, camera);
    const targetHits = targetRaycaster.intersectObjects(window._debugMeshCache);
    if (targetHits.length > 0) {
      const p = targetHits[0].point;
      debugTarget.textContent = `target: x:${p.x.toFixed(2)}  y:${p.y.toFixed(2)}  z:${p.z.toFixed(2)}`;
    } else {
      debugTarget.textContent = 'target: ---';
    }
  }

  renderer.render(scene, camera);
}
animate();

// ─── Load the Room ───────────────────────────────────────────────────
loadRoom(window.SS_ASSETS.roomGlb);
