import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let currentRoom = 'gallery';
let bedroomLoaded = false;
let galleryLoaded = false;
let hoveredDoor = false;
const doorMeshes = [];
let entered = false;

const PAINTINGS = [
  { handle: 'luchador-mask',               title: 'Luchador Mask',              price: '2160', w: 80,  h: 80,  img: 'painting_00' },
  { handle: 'the-kiss',                    title: 'The Kiss',                   price: '2430', w: 120, h: 60,  img: 'painting_01' },
  { handle: 'selbstportrait-mit-trommel',  title: 'Selbstportrait mit Trommel', price: '2980', w: 100, h: 120, img: 'painting_02' },
  { handle: 'volk-wolf',                   title: 'Volk / Wolf',               price: '2160', w: 70,  h: 90,  img: 'painting_03' },
  { handle: 'purple-figure',               title: 'Purple Figure',             price: '2150', w: 80,  h: 100, img: 'painting_04' },
  { handle: 'pink-faces',                   title: 'Pink Faces',                price: '1920', w: 60,  h: 120, img: 'painting_05' },
  { handle: 'extended-hand',               title: 'Extended Hand',             price: '1660', w: 80,  h: 80,  img: 'painting_06' },
  { handle: 'fist',                        title: 'Fist',                      price: '1660', w: 80,  h: 80,  img: 'painting_07' },
  { handle: 'hand-on-black',               title: 'Hand on Black',             price: '1920', w: 80,  h: 80,  img: 'painting_08' },
  { handle: 'figure-on-pink',              title: 'Figure on Pink',            price: '1450', w: 60,  h: 80,  img: 'painting_13' },
];

const CDN_BASE = 'https://cdn.shopify.com/s/files/1/1013/4650/9142/files/';
const CDN_SUFFIX = '?v=1774065825';
function paintingUrl(i) { return `${CDN_BASE}${PAINTINGS[i].img}.jpg${CDN_SUFFIX}`; }

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

const GALLERY_BOUNDS = { xMin: -9.5, xMax: 9.5, zMin: -5.5, zMax: 5.5 };
const GALLERY_EYE_HEIGHT = 1.7;
const INTERNAL_WALLS = [
  { xMin: 3.8, xMax: 4.2, zMin: -3.0, zMax: 3.0 },
];

let bedroomBounds = { xMin: -10, xMax: 10, zMin: -10, zMax: 10 };
let bedroomEyeHeight = 1.7;

function clampToWalls(pos) {
  for (const wall of INTERNAL_WALLS) {
    if (pos.x > wall.xMin && pos.x < wall.xMax && pos.z > wall.zMin && pos.z < wall.zMax) {
      const dxLeft  = pos.x - wall.xMin;
      const dxRight = wall.xMax - pos.x;
      const dzBack  = pos.z - wall.zMin;
      const dzFront = wall.zMax - pos.z;
      const minD = Math.min(dxLeft, dxRight, dzBack, dzFront);
      if (minD === dxLeft)       pos.x = wall.xMin;
      else if (minD === dxRight) pos.x = wall.xMax;
      else if (minD === dzBack)  pos.z = wall.zMin;
      else                       pos.z = wall.zMax;
    }
  }
}

const loadingEl   = document.getElementById('loading');
const loadBar     = document.getElementById('load-bar');
const loadStatus  = document.getElementById('load-status');
const overlayEl   = document.getElementById('overlay');
const crosshairEl = document.getElementById('crosshair');
const infoEl      = document.getElementById('painting-info');
const infoTitle   = document.getElementById('info-title');
const infoPrice   = document.getElementById('info-price');
const headerEl    = document.getElementById('gallery-header');
const controlsHint = document.getElementById('controls-hint');
const controlsHintText = document.getElementById('controls-hint-text');
const resumeText  = document.getElementById('resume-text');
const hotspotHint = document.getElementById('hotspot-hint');
const panel       = document.getElementById('info-panel');
const hotspotContainer = document.getElementById('hotspot-container');
const transitionEl = document.getElementById('room-transition');
const flatWorldBtn = document.getElementById('flat-world-btn');

const scene    = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 1000);
// Hero cam start: wide shot showing the whole gallery
// Start before the divider wall (x<3.8), elevated, centered
const HERO_START = new THREE.Vector3(2.0, 2.2, 0);
const HERO_END = new THREE.Vector3(-3.74, 1.7, 1.85);
const HERO_LOOK_START = new THREE.Vector3(-5.0, 1.5, -2.0);
const HERO_LOOK_END = new THREE.Vector3(-1.06, 0.99, -1.06);

camera.position.copy(HERO_START);
camera.lookAt(HERO_LOOK_START);

let heroActive = false;
let heroProgress = 0;
const HERO_DURATION = 2.5; // seconds

const _isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const renderer = new THREE.WebGLRenderer({ antialias: !_isTouch, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.9;
document.body.appendChild(renderer.domElement);

const galleryGroup = new THREE.Group();
const bedroomGroup = new THREE.Group();
scene.add(galleryGroup);
scene.add(bedroomGroup);
bedroomGroup.visible = false;

const galleryAmbient = new THREE.AmbientLight(0xffeedd, 0.9);
galleryGroup.add(galleryAmbient);
const galleryHemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
galleryGroup.add(galleryHemi);
const gallerySkyLight = new THREE.DirectionalLight(0xffffff, 0.8);
gallerySkyLight.position.set(0, 10, 0);
galleryGroup.add(gallerySkyLight);
const galleryFillLight = new THREE.DirectionalLight(0xffeedd, 0.3);
galleryFillLight.position.set(5, 8, 3);
galleryGroup.add(galleryFillLight);

// Two strip lights replace 15 individual SpotLights — same warm gallery look, fraction of the cost
const stripA = new THREE.DirectionalLight(0xfff8f0, 0.6);
stripA.position.set(0, 6, -3);  // above wall A (z=-6), pointing down
stripA.target.position.set(0, 1.8, -6);
galleryGroup.add(stripA);
galleryGroup.add(stripA.target);

const stripB = new THREE.DirectionalLight(0xfff8f0, 0.6);
stripB.position.set(0, 6, 3);   // above wall B (z=+6), pointing down
stripB.target.position.set(0, 1.8, 6);
galleryGroup.add(stripB);
galleryGroup.add(stripB.target);

const bedroomAmbient = new THREE.AmbientLight(0xffeedd, 1.8);
bedroomGroup.add(bedroomAmbient);
const bedroomHemi = new THREE.HemisphereLight(0xffffff, 0x666666, 0.8);
bedroomGroup.add(bedroomHemi);
const bedroomSkyLight = new THREE.DirectionalLight(0xffffff, 1.2);
bedroomSkyLight.position.set(0, 10, 0);
bedroomGroup.add(bedroomSkyLight);
const bedroomFillLight = new THREE.DirectionalLight(0xffeedd, 0.6);
bedroomFillLight.position.set(5, 8, 3);
bedroomGroup.add(bedroomFillLight);
const bedroomFillLight2 = new THREE.DirectionalLight(0xeeeeff, 0.5);
bedroomFillLight2.position.set(-5, 6, -3);
bedroomGroup.add(bedroomFillLight2);
const pinkLight = new THREE.PointLight(0xF5A0B5, 0.15, 10);
pinkLight.position.set(0, 2.5, 0);
bedroomGroup.add(pinkLight);

const raycaster = new THREE.Raycaster();
raycaster.far = 8;
const screenCenter = new THREE.Vector2(0, 0);
const paintingMeshes = [];

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const textureLoader = new THREE.TextureLoader();

function updateLoading(pct, msg) {
  loadBar.style.width = pct + '%';
  loadStatus.textContent = msg;
}

updateLoading(5, 'loading gallery model...');

gltfLoader.load(
  window.SS_ASSETS.galleryGlb,
  (gltf) => {
    galleryGroup.add(gltf.scene);
    galleryLoaded = true;
    updateLoading(50, 'model loaded, loading paintings...');
    loadPaintings();

    // Gallery door portal — leads to bedroom
    // Glass door at the far end (x≈-10, z≈3 based on debug coordinates)
    const galleryDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 4.0),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    galleryDoor.position.set(-10.0, 2.0, 3.0);
    galleryDoor.rotation.y = Math.PI / 2;
    galleryDoor.userData.isDoor = true;
    galleryDoor.userData.doorTarget = 'bedroom';
    galleryGroup.add(galleryDoor);
    doorMeshes.push(galleryDoor);

    // Door light hint — pink light spilling through the doorway
    const doorLight = new THREE.PointLight(0xF5A0B5, 1.2, 8, 2);
    doorLight.position.set(-9.5, 1.5, 3.0);
    galleryGroup.add(doorLight);

    // Second light higher up for the sign
    const signLight = new THREE.PointLight(0xF5A0B5, 0.8, 5, 2);
    signLight.position.set(-9.3, 3.2, 3.0);
    galleryGroup.add(signLight);

    // Glow on the floor near the door
    const doorGlowGeo = new THREE.PlaneGeometry(2.5, 3.0);
    const doorGlowMat = new THREE.MeshBasicMaterial({
      color: 0xF5A0B5,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });
    const doorGlow = new THREE.Mesh(doorGlowGeo, doorGlowMat);
    doorGlow.rotation.x = -Math.PI / 2;
    doorGlow.position.set(-9.5, 0.02, 3.0);
    galleryGroup.add(doorGlow);

    // Neon sign above the door: "ABOUT THE ARTIST" + ↓ centered below
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const sCtx = signCanvas.getContext('2d');

    // Neon glow passes — text line
    sCtx.textAlign = 'center';
    for (let blur = 70; blur >= 5; blur -= 5) {
      sCtx.shadowColor = '#FF3E8E';
      sCtx.shadowBlur = blur;
      sCtx.fillStyle = blur > 25 ? 'rgba(255,62,142,0.12)' : 'rgba(255,62,142,0.5)';
      sCtx.font = '700 56px monospace';
      sCtx.textBaseline = 'middle';
      sCtx.fillText('ABOUT THE ARTIST', 512, 80);
      sCtx.font = '700 52px monospace';
      sCtx.fillText('\u2193', 512, 170);
    }
    // White-hot core
    sCtx.shadowColor = '#FF3E8E';
    sCtx.shadowBlur = 12;
    sCtx.fillStyle = '#ffffff';
    sCtx.font = '700 56px monospace';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('ABOUT THE ARTIST', 512, 80);
    sCtx.font = '700 52px monospace';
    sCtx.fillText('\u2193', 512, 170);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signGeo = new THREE.PlaneGeometry(2.8, 0.7);
    const signMat = new THREE.MeshBasicMaterial({
      map: signTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(-9.85, 3.5, 3.0);
    signMesh.rotation.y = Math.PI / 2;
    signMesh.userData.isDoor = true;
    signMesh.userData.doorTarget = 'bedroom';
    galleryGroup.add(signMesh);
    doorMeshes.push(signMesh);

    // ─── Sub Rosa portal — same wall as About door, opposite side (x≈-10, z≈-3) ───
    const subrosaDoor = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 3.5),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    subrosaDoor.position.set(-10.0, 1.8, -3.0);
    subrosaDoor.rotation.y = Math.PI / 2;
    subrosaDoor.userData.isDoor = true;
    subrosaDoor.userData.doorTarget = 'subrosa';
    galleryGroup.add(subrosaDoor);
    doorMeshes.push(subrosaDoor);

    // Sub Rosa neon sign — blue theme matching the room
    const srSignCanvas = document.createElement('canvas');
    srSignCanvas.width = 1024;
    srSignCanvas.height = 256;
    const srCtx = srSignCanvas.getContext('2d');
    srCtx.textAlign = 'center';
    for (let blur = 70; blur >= 5; blur -= 5) {
      srCtx.shadowColor = '#FF3E8E';
      srCtx.shadowBlur = blur;
      srCtx.fillStyle = blur > 25 ? 'rgba(255,62,142,0.12)' : 'rgba(255,62,142,0.5)';
      srCtx.font = '700 56px monospace';
      srCtx.textBaseline = 'middle';
      srCtx.fillText('SUB ROSA', 512, 80);
      srCtx.font = '700 52px monospace';
      srCtx.fillText('\u2193', 512, 170);
    }
    srCtx.shadowColor = '#FF3E8E';
    srCtx.shadowBlur = 12;
    srCtx.fillStyle = '#ffffff';
    srCtx.font = '700 56px monospace';
    srCtx.textBaseline = 'middle';
    srCtx.fillText('SUB ROSA', 512, 80);
    srCtx.font = '700 52px monospace';
    srCtx.fillText('\u2193', 512, 170);

    const srSignTex = new THREE.CanvasTexture(srSignCanvas);
    const srSignMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.6),
      new THREE.MeshBasicMaterial({ map: srSignTex, transparent: true, side: THREE.DoubleSide })
    );
    srSignMesh.position.set(-9.85, 3.5, -3.0);
    srSignMesh.rotation.y = Math.PI / 2;
    srSignMesh.userData.isDoor = true;
    srSignMesh.userData.doorTarget = 'subrosa';
    galleryGroup.add(srSignMesh);
    doorMeshes.push(srSignMesh);

    // Sub Rosa door blue light
    const subrosaDoorLight = new THREE.PointLight(0xFF3E8E, 1.0, 8, 2);
    subrosaDoorLight.position.set(-9.5, 1.5, -3.0);
    galleryGroup.add(subrosaDoorLight);

    // Blue glow on the floor near Sub Rosa door
    const srGlowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 3.0),
      new THREE.MeshBasicMaterial({ color: 0xFF3E8E, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    );
    srGlowMesh.rotation.x = -Math.PI / 2;
    srGlowMesh.position.set(-9.5, 0.02, -3.0);
    galleryGroup.add(srGlowMesh);
  },
  (progress) => {
    if (progress.total > 0) {
      const pct = Math.min(45, (progress.loaded / progress.total) * 45);
      updateLoading(5 + pct, 'loading gallery model...');
    }
  },
  (err) => {
    console.warn('GLB load failed, continuing without model:', err);
    updateLoading(50, 'no model found, loading paintings...');
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
    );
    floor.rotation.x = -Math.PI / 2;
    galleryGroup.add(floor);
    loadPaintings();
  }
);

// Bedroom — lazy-loaded on first door click (saves 4.5 MB on initial load)
let bedroomLoadStarted = false;
function loadBedroom(onComplete) {
  if (bedroomLoadStarted) return;
  bedroomLoadStarted = true;

  gltfLoader.load(
    window.SS_ASSETS.roomGlb,
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 8 / maxDim;
      model.scale.setScalar(scale);
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      model.position.x -= scaledCenter.x;
      model.position.z -= scaledCenter.z;
      model.position.y -= scaledBox.min.y;
      bedroomGroup.add(model);
      const finalBox = new THREE.Box3().setFromObject(model);
      const margin = 0.3;
      bedroomBounds = {
        xMin: finalBox.min.x + margin,
        xMax: finalBox.max.x - margin,
        zMin: finalBox.min.z + margin,
        zMax: finalBox.max.z - margin
      };
      bedroomEyeHeight = Math.min(Math.max(scaledSize.y * 0.45, 1.2), 2.0);
      bedroomLoaded = true;
      createHotspotSpheres();
      createHotspotMarkers();

      // Bedroom door portal — back to gallery
      const bedroomDoor = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 2.5),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      bedroomDoor.position.set(-2.9, bedroomEyeHeight, 0.5);
      bedroomDoor.rotation.y = Math.PI / 2;
      bedroomDoor.userData.isDoor = true;
      bedroomDoor.userData.doorTarget = 'gallery';
      bedroomGroup.add(bedroomDoor);
      doorMeshes.push(bedroomDoor);

      if (onComplete) onComplete();
    },
    undefined,
    (error) => {
      console.warn('Bedroom GLB load error:', error);
      bedroomLoadStarted = false;
    }
  );
}

function loadPaintings() {
  let loaded = 0;
  const total = PAINTINGS.length;

  PAINTINGS.forEach((p, i) => {
    const url = paintingUrl(i);
    textureLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      createPaintingMesh(tex, i);
      loaded++;
      const pct = 50 + (loaded / total) * 45;
      updateLoading(pct, `paintings ${loaded}/${total}`);
      if (loaded === total) finishGalleryLoading();
    }, undefined, () => {
      createPaintingMesh(null, i);
      loaded++;
      if (loaded === total) finishGalleryLoading();
    });
  });
}

function createPaintingMesh(texture, index) {
  const scale = 1.5 / 100;
  const pw = PAINTINGS[index].w * scale;
  const ph = PAINTINGS[index].h * scale;

  const group = new THREE.Group();

  const frameW = 0.04;
  const frameD = 0.06;
  const totalFrameW = frameW;
  const canvasZ = 0.03;

  // Black or Pink frame — pre-shuffled, not alternating
  const frameColors = [0,1,0,0,1,0,1,0,0,1,0,1,0,0,1];
  const isPink = frameColors[index % frameColors.length] === 1;

  const frameMat = isPink
    ? new THREE.MeshStandardMaterial({ color: 0xF5A0B5, roughness: 0.35, metalness: 0.2 })
    : new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.25, metalness: 0.15 });

  // Back panel
  const backGeo = new THREE.PlaneGeometry(pw + totalFrameW * 2, ph + totalFrameW * 2);
  const backMesh = new THREE.Mesh(backGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a08 }));
  group.add(backMesh);

  function addLayer(halfW, halfH, w, d, mat) {
    const fullW = (halfW + w) * 2;
    const top = new THREE.Mesh(new THREE.BoxGeometry(fullW, w, d), mat);
    top.position.set(0, halfH + w / 2, d / 2);
    group.add(top);
    const bot = new THREE.Mesh(new THREE.BoxGeometry(fullW, w, d), mat);
    bot.position.set(0, -halfH - w / 2, d / 2);
    group.add(bot);
    const left = new THREE.Mesh(new THREE.BoxGeometry(w, halfH * 2, d), mat);
    left.position.set(-halfW - w / 2, 0, d / 2);
    group.add(left);
    const right = new THREE.Mesh(new THREE.BoxGeometry(w, halfH * 2, d), mat);
    right.position.set(halfW + w / 2, 0, d / 2);
    group.add(right);
  }

  addLayer(pw / 2, ph / 2, frameW, frameD, frameMat);

  // Canvas
  const paintGeo = new THREE.PlaneGeometry(pw, ph);
  const paintMat = texture
    ? new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, metalness: 0.0 })
    : new THREE.MeshStandardMaterial({ color: 0x333333 });
  const paintMesh = new THREE.Mesh(paintGeo, paintMat);
  paintMesh.position.z = canvasZ;
  group.add(paintMesh);

  const paintingY = 1.8;
  const wallOffset = 0.08;

  // 10 paintings split: 5 on Wall A (front), 5 on Wall B (back)
  const wallA_x = [-7.5, -3.8, 0.0, 3.8, 7.5];       // 5 paintings
  const wallB_x = [-7.0, -3.5, 0.0, 3.5, 7.0];       // 5 paintings

  if (index < 5) {
    group.position.set(wallA_x[index], paintingY, -6.0 + wallOffset);
    group.rotation.y = 0;
  } else {
    const ri = index - 5;
    group.position.set(wallB_x[ri], paintingY, 6.0 - wallOffset);
    group.rotation.y = Math.PI;
  }

  // Painting lights removed — gallery uses shared strip lights (see galleryStripLights below)

  galleryGroup.add(group);

  paintMesh.userData = { paintingIndex: index };
  paintingMeshes.push(paintMesh);
}

function finishGalleryLoading() {
  updateLoading(100, 'ready');
  loadGraffiti();

  // Auto-enter after brief delay (landing page serves as the gate now)
  setTimeout(() => {
    entered = true;
    loadingEl.classList.add('fade-enter');
    setTimeout(() => {
      loadingEl.style.display = 'none';
      headerEl.classList.add('visible');
      flatWorldBtn.style.display = 'block';
      if (isTouchDevice) {
        isTouchActive = true;
        isLocked = true;
        overlayEl.classList.add('hidden');
        crosshairEl.style.display = 'none';
        controlsHint.style.display = 'block';
        const hint = document.getElementById('controls-hint-text');
        if (hint) hint.textContent = 'Drag to look · Pinch to move · Double-tap to interact';
      } else {
        setTimeout(() => { try { renderer.domElement.requestPointerLock(); } catch(e) { /* Safari: no user gesture */ } }, (HERO_DURATION + 0.5) * 1000);
      }

      heroActive = true;
      heroProgress = 0;

      // Header flash
      const flash = document.getElementById('header-flash');
      const flashStatic = document.getElementById('header-flash-static');
      flash.style.display = 'block';
      flash.src = window.SS_ASSETS.headerFlash;
      setTimeout(() => {
        flashStatic.width = flash.naturalWidth;
        flashStatic.height = flash.naturalHeight;
        flashStatic.getContext('2d').drawImage(flash, 0, 0);
        flashStatic.style.display = 'block';
        flashStatic.style.transition = 'opacity 0.6s ease-in';
        flashStatic.style.opacity = '0.85';
        setTimeout(() => { flash.style.display = 'none'; }, 700);
      }, 1800);
    }, 700);
  }, 500);

  // 3D parallax: translate + rotate based on mouse

  loadingEl.addEventListener('mousemove', (e) => {
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    const x = nx * 50;
    const y = ny * 50;
    const rotY = nx * 8;   // max ±4 degrees
    const rotX = -ny * 6;  // max ±3 degrees

    loadingEl.style.setProperty('--parallax-x', x + 'px');
    loadingEl.style.setProperty('--parallax-y', y + 'px');
    loadingEl.style.setProperty('--rotate-y', rotY + 'deg');
    loadingEl.style.setProperty('--rotate-x', rotX + 'deg');

  });

}

function loadGraffiti() {
  const graffitiVertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `;

  const graffitiFragmentShader = `
    uniform sampler2D graffitiTex;
    uniform float uOpacity;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    varying vec3 vNormal;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec4 texel = texture2D(graffitiTex, vUv);

      float edgeNoise = noise(vUv * 80.0) * 0.3 + noise(vUv * 200.0) * 0.15;
      float alpha = texel.a;
      if (alpha > 0.1 && alpha < 0.9) {
        alpha = alpha + edgeNoise - 0.15;
      }
      if (alpha > 0.85) {
        float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        if (edgeDist < 0.02) {
          alpha *= (0.7 + edgeNoise);
        }
      }
      alpha = clamp(alpha, 0.0, 1.0);

      if (alpha < 0.15) discard;

      float brightness = (texel.r + texel.g + texel.b) / 3.0;
      float maxC = max(max(texel.r, texel.g), texel.b);
      float minC = min(min(texel.r, texel.g), texel.b);
      float saturation = maxC - minC;
      if (brightness > 0.82 && saturation < 0.18) discard;

      vec3 wallColor = vec3(0.92, 0.90, 0.88);

      vec3 lightDir = normalize(vec3(0.0, 1.0, 0.5));
      float diff = max(dot(vNormal, lightDir), 0.0) * 0.3 + 0.7;

      vec3 multiplyColor = texel.rgb * wallColor;

      // Dunkle Farben saugen sich mehr in den Putz ein
      float lum = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
      float blendFactor = mix(0.25, 0.42, 1.0 - lum);
      vec3 blended = mix(multiplyColor, texel.rgb, blendFactor) * diff * 1.05;

      // Desaturation: Spray-Farbe verliert Sättigung auf rauem Putz
      float gray = dot(blended, vec3(0.299, 0.587, 0.114));
      vec3 grafColor = mix(blended, vec3(gray), 0.15);

      // Warmer Farbshift: Beton zieht Farben leicht ins Warme
      grafColor *= vec3(1.02, 1.0, 0.97);

      // Micro-Variation: Spray ist nie 100% gleichmäßig
      float sprayNoise = noise(vUv * 120.0) * 0.08;
      grafColor *= (1.0 - sprayNoise);

      float finalAlpha = alpha * uOpacity;

      gl_FragColor = vec4(grafColor, finalAlpha);
    }
  `;

  const endRotY = -Math.PI / 2;
  const graffitiPlacements = [
    // === UNTERE EBENE (Standhöhe, ~0.5m bis ~2.5m) ===
    // Pieces die ein Mensch (~1.80m) stehend malen kann
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_01.webp', x: 9.98, y: 1.6, z: -3.5, w: 2.8, rotY: endRotY, rotZ:  0.02, order: 2 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_02.webp', x: 9.96, y: 1.4, z: -0.8, w: 2.5, rotY: endRotY, rotZ: -0.03, order: 4 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_03.webp', x: 9.97, y: 1.5, z:  1.8, w: 2.6, rotY: endRotY, rotZ:  0.04, order: 3 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_04.webp', x: 9.95, y: 1.3, z:  4.0, w: 2.4, rotY: endRotY, rotZ: -0.02, order: 5 },
    // Kleiner Quick-Tag unten links
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_08.webp', x: 9.99, y: 0.9, z: -1.8, w: 1.8, rotY: endRotY, rotZ: -0.05, order: 10 },
    // Kleiner Tag unten rechts
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_11.webp', x: 9.99, y: 0.8, z:  3.2, w: 1.6, rotY: endRotY, rotZ:  0.06, order: 11 },

    // === OBERE EBENE (Leiter, ~2.5m bis ~4.5m) ===
    // Setzt an wo die untere aufhört
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_05.webp', x: 9.94, y: 3.4, z: -3.0, w: 2.6, rotY: endRotY, rotZ:  0.03, order: 1 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_06.webp', x: 9.95, y: 3.2, z: -0.3, w: 2.8, rotY: endRotY, rotZ: -0.04, order: 6 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_07.webp', x: 9.93, y: 3.5, z:  2.5, w: 2.5, rotY: endRotY, rotZ:  0.02, order: 7 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_09.webp', x: 9.96, y: 3.0, z:  4.5, w: 2.2, rotY: endRotY, rotZ: -0.03, order: 8 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_10.webp', x: 9.92, y: 3.6, z: -4.8, w: 2.0, rotY: endRotY, rotZ:  0.05, order: 9 },

    // === RÜCKSEITE TRENNWAND (x≈4.2, facing +x, Richtung Graffiti-Wand) ===
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_13.webp', x: 4.24, y: 1.0, z:  2.55, w: 1.4, rotY: Math.PI / 2, rotZ:  0.04, order: 14 },
    { file: window.SS_ASSETS.assetBase + 'graffiti_new_14.webp', x: 4.21, y: 1.7, z:  0.65, w: 1.5, rotY: Math.PI / 2, rotZ: -0.02, order: 15 },
  ];

  graffitiPlacements.forEach(g => {
    textureLoader.load(g.file, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const aspect = tex.image.height / tex.image.width;
      const gw = g.w;
      const gh = gw * aspect;

      const geo = new THREE.PlaneGeometry(gw, gh);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          graffitiTex: { value: tex },
          uOpacity: { value: 0.88 },
        },
        vertexShader: graffitiVertexShader,
        fragmentShader: graffitiFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(g.x, g.y, g.z);
      mesh.rotation.y = g.rotY;
      if (g.rotZ) mesh.rotation.z = g.rotZ;
      mesh.renderOrder = g.order || 0;
      galleryGroup.add(mesh);
    });
  });
}

function createBranding(wallX, facingRotation) {
  const textureLoader2 = new THREE.TextureLoader();
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // 1. "STUDIO SABOTAGE" — canvas-rendered text (resolution-independent, always crisp)
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 2048;
  textCanvas.height = 256;
  const tctx = textCanvas.getContext('2d');
  tctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  tctx.fillStyle = '#000000';
  tctx.font = '400 112px "Nimbus Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif';
  tctx.textAlign = 'center';
  tctx.textBaseline = 'middle';
  tctx.letterSpacing = '12px';
  tctx.fillText('STUDIO SABOTAGE', textCanvas.width / 2, textCanvas.height / 2);

  const textTex = new THREE.CanvasTexture(textCanvas);
  textTex.colorSpace = THREE.SRGBColorSpace;
  textTex.anisotropy = maxAniso;
  const textW = 1.8;
  const textH = textW * (textCanvas.height / textCanvas.width);
  const textGeo = new THREE.PlaneGeometry(textW, textH);
  const textMat = new THREE.MeshBasicMaterial({
    map: textTex, transparent: true, alphaTest: 0.05,
    side: THREE.DoubleSide, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.set(wallX, 2.85, 0);
  textMesh.rotation.y = facingRotation;
  textMesh.renderOrder = 21;
  galleryGroup.add(textMesh);

  // 2. Brandmark (black, 1024px) — centred on wall
  textureLoader2.load(window.SS_ASSETS.brandmarkBlack, (logoTex) => {
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = maxAniso;
    const aspect = logoTex.image.width / logoTex.image.height;
    const logoH = 1.6;
    const logoW = logoH * aspect;
    const logoGeo = new THREE.PlaneGeometry(logoW, logoH);
    const logoMat = new THREE.MeshBasicMaterial({
      map: logoTex, transparent: true, alphaTest: 0.1,
      side: THREE.DoubleSide, depthWrite: true,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(wallX, 1.91, 0);
    logoMesh.rotation.y = facingRotation;
    logoMesh.renderOrder = 20;
    galleryGroup.add(logoMesh);
  });

  // 3. sort-Tag below the logo (black, 512px high-res)
  textureLoader2.load(window.SS_ASSETS.tagBlack, (tagTex) => {
    tagTex.colorSpace = THREE.SRGBColorSpace;
    tagTex.anisotropy = maxAniso;
    const tagAspect = tagTex.image.width / tagTex.image.height;
    const tagH = 0.75;
    const tagW = tagH * tagAspect;
    const tagGeo = new THREE.PlaneGeometry(tagW, tagH);
    const tagMat = new THREE.MeshBasicMaterial({
      map: tagTex, transparent: true, alphaTest: 0.35,
      side: THREE.DoubleSide, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(wallX, 0.70, 0);
    tagMesh.rotation.y = facingRotation;
    tagMesh.renderOrder = 21;
    galleryGroup.add(tagMesh);
  });
}

createBranding(3.78, -Math.PI / 2);    // front face of divider wall (wall at x=3.8)
createBranding(-5.66, Math.PI / 2);   // partition wall near About area (facing +x)

// ─── Easter Egg: Gobo Light + Floor Projection ──────────────────────
// Subtle pink "S" projected on the floor in a quiet corner.
// Glows brighter as you approach. Double-click to discover.
const eePos = new THREE.Vector3(-8, 0, -5);

// Canvas: radial glow + logo (pink tinted)
const eeCanvas = document.createElement('canvas');
eeCanvas.width = 512;
eeCanvas.height = 512;
const eeCtx = eeCanvas.getContext('2d');
const eeGrad = eeCtx.createRadialGradient(256, 256, 0, 256, 256, 240);
eeGrad.addColorStop(0, 'rgba(255, 62, 142, 0.5)');
eeGrad.addColorStop(0.35, 'rgba(255, 62, 142, 0.12)');
eeGrad.addColorStop(1, 'rgba(255, 62, 142, 0)');
eeCtx.fillStyle = eeGrad;
eeCtx.fillRect(0, 0, 512, 512);

// Load logo and draw pink-tinted
const eeLogo = new Image();
eeLogo.onload = () => {
  const logoSize = 280;
  const lx = (512 - logoSize) / 2;
  const ly = (512 - logoSize) / 2;
  eeCtx.drawImage(eeLogo, lx, ly, logoSize, logoSize);
  // Tint pink using composite
  eeCtx.globalCompositeOperation = 'source-atop';
  eeCtx.fillStyle = 'rgba(255, 62, 142, 0.75)';
  eeCtx.fillRect(0, 0, 512, 512);
  eeCtx.globalCompositeOperation = 'source-over';
  eeTex.needsUpdate = true;
};
eeLogo.src = window.SS_ASSETS.logoPng;

const eeTex = new THREE.CanvasTexture(eeCanvas);
eeTex.colorSpace = THREE.SRGBColorSpace;
const eeGeo = new THREE.PlaneGeometry(1.8, 1.8);
const eeMat = new THREE.MeshBasicMaterial({
  map: eeTex, transparent: true, depthWrite: false,
  opacity: 0.12, side: THREE.DoubleSide,
});
window.easterEgg = new THREE.Mesh(eeGeo, eeMat);
window.easterEgg.rotation.x = -Math.PI / 2;
window.easterEgg.position.set(eePos.x, 0.02, eePos.z);
window.easterEgg.renderOrder = 25;
galleryGroup.add(window.easterEgg);

// Dim pink point light above the spot (subtle glow on ceiling/walls)
const eeLight = new THREE.PointLight(0xFF3E8E, 0.15, 4);
eeLight.position.set(eePos.x, 2.5, eePos.z);
galleryGroup.add(eeLight);

let easterEggFound = false;
const easterEggModal = document.createElement('div');
easterEggModal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:rgba(255,255,255,0.85); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); justify-content:center; align-items:center;';
easterEggModal.innerHTML = `
  <div style="text-align:center; max-width:500px; padding:40px;">
    <p style="font-family:'Nimbus Sans','Helvetica Neue','Helvetica','Arial',sans-serif; color:#F5A0B5; font-size:1.6rem; line-height:1.6; letter-spacing:0.05em; font-style:italic;">
      Brudi, wie ich jetzt \u00fcberall ausstellen kann.
    </p>
    <p style="font-family:monospace; color:rgba(0,0,0,0.3); font-size:0.7rem; margin-top:2rem; letter-spacing:0.15em; text-transform:uppercase;">click to close</p>
  </div>
`;
document.body.appendChild(easterEggModal);
easterEggModal.addEventListener('click', () => {
  easterEggModal.style.display = 'none';
  renderer.domElement.requestPointerLock();
});

const productModal = document.createElement('div');
productModal.id = 'product-modal';
productModal.setAttribute('role', 'dialog');
productModal.setAttribute('aria-modal', 'true');
productModal.setAttribute('aria-labelledby', 'product-title');
productModal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; z-index:99999; background:var(--ss-black); flex-direction:row;';
productModal.innerHTML = `
  <div id="product-img-wrap" style="width:60%; height:100%; background:var(--ss-surface-2); display:flex; align-items:center; justify-content:center; overflow:hidden;">
    <img id="product-img" style="width:100%; height:100%; object-fit:cover; display:block;" alt="" />
  </div>
  <div id="product-info" style="width:40%; height:100%; background:var(--ss-beige); padding:48px; display:flex; flex-direction:column; justify-content:flex-start; overflow-y:auto; font-family:var(--ss-font-primary); color:var(--ss-on-surface);">
    <button id="product-close" aria-label="Zurück zur Galerie" style="display:inline-flex; align-items:center; gap:8px; background:none; border:none; color:var(--ss-on-surface-muted); font-family:var(--ss-font-primary); font-size:11px; letter-spacing:0.15em; text-transform:uppercase; cursor:pointer; padding:0; margin-bottom:48px; transition:opacity 0.2s;" onmouseover="this.style.opacity='0.5'" onmouseout="this.style.opacity='1'">\u2190 Return to Gallery</button>
    <h2 id="product-title" style="margin:0 0 8px 0; font-size:36px; font-weight:800; letter-spacing:-0.01em; text-transform:uppercase; line-height:1.1;"></h2>
    <p id="product-series" style="margin:0 0 40px 0; font-size:13px; letter-spacing:0.12em; text-transform:uppercase; color:var(--ss-on-surface-muted);"></p>
    <div id="product-meta" style="display:flex; flex-direction:column; gap:16px; margin-bottom:40px;">
      <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid rgba(0,0,0,0.08); padding-bottom:12px;">
        <span style="font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--ss-on-surface-muted);">Dimensions</span>
        <span id="product-dims" style="font-size:13px; font-weight:700;"></span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid rgba(0,0,0,0.08); padding-bottom:12px;">
        <span style="font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--ss-on-surface-muted);">Medium</span>
        <span style="font-size:13px; font-weight:700;">Oil on Canvas</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; border-bottom:1px solid rgba(0,0,0,0.08); padding-bottom:12px;">
        <span style="font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--ss-on-surface-muted);">Price</span>
        <span id="product-price" style="font-size:18px; font-weight:800; letter-spacing:-0.02em;"></span>
      </div>
    </div>
    <button id="product-buy" style="display:flex; align-items:center; justify-content:center; padding:18px 24px; font-family:var(--ss-font-primary); font-size:13px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--ss-black); background:var(--ss-pink); border:none; border-radius:0; cursor:pointer; transition:all 0.3s ease;" onmouseover="this.style.background='var(--ss-black)';this.style.color='var(--ss-pink)'" onmouseout="this.style.background='var(--ss-pink)';this.style.color='var(--ss-black)'">IN DEN WARENKORB</button>
    <a id="product-checkout" href="/checkout" style="display:none; align-items:center; justify-content:center; text-decoration:none; padding:14px 24px; margin-top:8px; font-family:var(--ss-font-primary); font-size:11px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--ss-pink); background:var(--ss-black); border:1px solid var(--ss-pink); cursor:pointer; transition:all 0.3s ease;">ZUM CHECKOUT &rarr;</a>
    <div id="product-more" style="margin-top:auto; padding-top:48px;">
      <p style="font-size:10px; letter-spacing:0.3em; text-transform:uppercase; font-weight:700; color:rgba(0,0,0,0.3); margin:0 0 16px 0;">MORE WORKS</p>
      <div id="product-suggestions" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;"></div>
    </div>
  </div>
`;
document.body.appendChild(productModal);

function fillSuggestions(currentIdx) {
  const container = document.getElementById('product-suggestions');
  container.innerHTML = '';
  const others = PAINTINGS.map((p, i) => i).filter(i => i !== currentIdx);
  for (let n = others.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [others[n], others[j]] = [others[j], others[n]]; }
  others.slice(0, 3).forEach(i => {
    const thumb = document.createElement('div');
    thumb.style.cssText = 'cursor:pointer; overflow:hidden;';
    thumb.innerHTML = `<img src="${paintingUrl(i)}" style="width:100%; aspect-ratio:1; object-fit:cover; display:block; transition:transform 0.5s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" /><p style="font-size:10px; letter-spacing:0.12em; text-transform:uppercase; font-weight:700; margin:6px 0 0 0;">${PAINTINGS[i].title}</p>`;
    thumb.addEventListener('click', () => {
      const p = PAINTINGS[i];
      document.getElementById('product-img').src = paintingUrl(i);
      document.getElementById('product-title').textContent = p.title;
      document.getElementById('product-dims').textContent = `${p.w} \u00d7 ${p.h} cm`;
      document.getElementById('product-price').textContent = `EUR ${Number(p.price).toLocaleString('de-DE')}`;
      document.getElementById('product-buy').dataset.handle = p.handle;
      fillSuggestions(i);
      document.getElementById('product-info').scrollTop = 0;
    });
    container.appendChild(thumb);
  });
}

/* Mobile: stack vertically */
const mobileModalCSS = document.createElement('style');
mobileModalCSS.textContent = `
  @media (max-width: 768px) {
    #product-modal { flex-direction: column !important; }
    #product-img-wrap { width: 100% !important; height: 40vh !important; }
    #product-info { width: 100% !important; height: 60vh !important; padding: 24px !important; }
  }
`;
document.head.appendChild(mobileModalCSS);

document.getElementById('product-close').addEventListener('click', (e) => {
  e.stopPropagation();
  productModal.style.display = 'none';
  renderer.domElement.requestPointerLock();
});

productModal.addEventListener('click', (e) => {
  if (e.target === productModal) {
    productModal.style.display = 'none';
    renderer.domElement.requestPointerLock();
  }
});

const hotspotSpheres = [];

function createHotspotSpheres() {
  const geo = new THREE.SphereGeometry(0.35, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ visible: false });
  HOTSPOTS.forEach((hs, i) => {
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(hs.position);
    sphere.userData.hotspotIndex = i;
    bedroomGroup.add(sphere);
    hotspotSpheres.push(sphere);
  });
}

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

let isLocked = false;
let hoveredPainting = null;
let hoveredHotspot = -1;
let activeHotspot = -1;

overlayEl.addEventListener('click', () => {
  if (isTouchDevice) {
    isTouchActive = true;
    isLocked = true;
    overlayEl.classList.add('hidden');
    controlsHint.style.display = 'block';
  } else {
    renderer.domElement.requestPointerLock();
  }
});

renderer.domElement.addEventListener('click', () => {
  if (!isLocked) {
    renderer.domElement.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  isLocked = document.pointerLockElement === renderer.domElement;
  if (isLocked) {
    overlayEl.classList.add('hidden');
    crosshairEl.style.display = 'block';
    controlsHint.style.display = 'block';
    if (currentRoom === 'bedroom') {
      panel.classList.remove('visible');
      panel.style.display = 'none';
      activeHotspot = -1;
    }
  } else {
    overlayEl.classList.remove('hidden');
    crosshairEl.style.display = 'none';
    controlsHint.style.display = 'none';
    controlsHint.style.opacity = '1';
    controlsHint.style.transition = 'none';
    infoEl.classList.remove('visible');
    if (currentRoom === 'bedroom') {
      hotspotHint.classList.remove('visible');
    }
  }
});

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

const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if ((e.code === 'KeyQ' || e.code === 'Tab') && isLocked) {
    e.preventDefault();
    document.exitPointerLock();
  }
  if (e.code === 'Escape') {
    if (currentRoom === 'gallery') {
      if (productModal.style.display === 'flex') {
        productModal.style.display = 'none';
        renderer.domElement.requestPointerLock();
      }
      if (easterEggModal.style.display === 'flex') {
        easterEggModal.style.display = 'none';
        renderer.domElement.requestPointerLock();
      }
    } else {
      if (activeHotspot >= 0) {
        closePanel();
        e.preventDefault();
      }
    }
  }
  if (e.code === 'KeyP' && isLocked) {
    debugMode = !debugMode;
    debugEl.style.display = debugMode ? 'block' : 'none';
    debugTarget.style.display = debugMode ? 'block' : 'none';
  }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

// ── Touch & Trackpad Controls ──────────────────────────────────
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let isTouchActive = false; // true when user is actively using touch

// Touch state
let touchLook = { active: false, id: null, lastX: 0, lastY: 0 };
let touchPinch = { active: false, startDist: 0, startMidX: 0, startMidY: 0, lastDist: 0, lastMidX: 0, lastMidY: 0 };
let touchMoveZ = 0; // pinch forward/backward
let touchMoveX = 0; // pinch strafe
const TOUCH_LOOK_SENSITIVITY = 0.003;
const TOUCH_MOVE_SENSITIVITY = 0.012;
const TRACKPAD_ZOOM_SENSITIVITY = 0.015;
let trackpadMoveZ = 0;

// Trackpad: intercept pinch-to-zoom (ctrlKey + wheel)
renderer.domElement.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    if (isLocked || isTouchActive) {
      // Pinch out (negative deltaY) = forward, pinch in = backward
      trackpadMoveZ += -e.deltaY * TRACKPAD_ZOOM_SENSITIVITY;
      trackpadMoveZ = Math.max(-1, Math.min(1, trackpadMoveZ));
    }
  }
}, { passive: false });

// Touch: start
renderer.domElement.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isTouchActive = true;

  if (e.touches.length === 1 && !touchPinch.active) {
    // Single finger → look
    const t = e.touches[0];
    touchLook = { active: true, id: t.identifier, lastX: t.clientX, lastY: t.clientY };

    // If not yet "entered", treat first tap as entering the gallery
    if (!isLocked && overlayEl.classList.contains('hidden')) {
      isLocked = true;
      overlayEl.classList.add('hidden');
      crosshairEl.style.display = 'none'; // no crosshair on mobile
      controlsHint.style.display = 'block';
    }
  }

  if (e.touches.length === 2) {
    // Two fingers → pinch (move)
    touchLook.active = false;
    const t0 = e.touches[0], t1 = e.touches[1];
    const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
    const midX = (t0.clientX + t1.clientX) / 2;
    const midY = (t0.clientY + t1.clientY) / 2;
    touchPinch = { active: true, startDist: dist, startMidX: midX, startMidY: midY, lastDist: dist, lastMidX: midX, lastMidY: midY };
  }
}, { passive: false });

// Touch: move
renderer.domElement.addEventListener('touchmove', (e) => {
  e.preventDefault();

  if (e.touches.length === 1 && touchLook.active) {
    const t = e.touches[0];
    if (t.identifier === touchLook.id) {
      const dx = t.clientX - touchLook.lastX;
      const dy = t.clientY - touchLook.lastY;
      touchLook.lastX = t.clientX;
      touchLook.lastY = t.clientY;

      // Rotate camera
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
    const midY = (t0.clientY + t1.clientY) / 2;

    // Pinch distance delta → forward/backward
    const distDelta = dist - touchPinch.lastDist;
    touchMoveZ = distDelta * TOUCH_MOVE_SENSITIVITY;

    // Two-finger pan (midpoint movement) → strafe
    const panDeltaX = midX - touchPinch.lastMidX;
    touchMoveX = -panDeltaX * TOUCH_MOVE_SENSITIVITY * 0.5;

    touchPinch.lastDist = dist;
    touchPinch.lastMidX = midX;
    touchPinch.lastMidY = midY;
  }
}, { passive: false });

// Touch: end
renderer.domElement.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    touchPinch.active = false;
    touchMoveZ = 0;
    touchMoveX = 0;
  }
  if (e.touches.length === 0) {
    touchLook.active = false;
  }
  // If one finger remains after pinch, re-init look
  if (e.touches.length === 1) {
    const t = e.touches[0];
    touchLook = { active: true, id: t.identifier, lastX: t.clientX, lastY: t.clientY };
  }
});

// Double-tap to teleport (mobile)
let lastTapTime = 0;
renderer.domElement.addEventListener('touchend', (e) => {
  if (e.changedTouches.length !== 1) return;
  const now = Date.now();
  if (now - lastTapTime < 300) {
    // Double tap → teleport or interact
    if (isTouchActive && currentRoom === 'gallery') {
      const touch = e.changedTouches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = -(touch.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Check paintings
      const paintHits = raycaster.intersectObjects(paintingMeshes, false);
      if (paintHits.length > 0) {
        const idx = paintHits[0].object.userData.paintingIndex;
        if (idx !== undefined) {
          const p = PAINTINGS[idx];
          document.getElementById('product-img').src = paintingUrl(idx);
          document.getElementById('product-title').textContent = p.title;
          document.getElementById('product-dims').textContent = `${p.w} \u00d7 ${p.h} cm`;
          document.getElementById('product-price').textContent = `EUR ${Number(p.price).toLocaleString('de-DE')}`;
          document.getElementById('product-series').textContent = 'Oil, Acrylic & Mixed Media on Canvas';
          document.getElementById('product-buy').dataset.handle = p.handle;
          fillSuggestions(idx);
          document.getElementById('product-img').alt = p.title;
          resetCartButton();
          trackViewItem(p);
          productModal.style.display = 'flex';
          document.getElementById('product-close').focus();
          return;
        }
      }

      // Check doors
      if (doorMeshes.length > 0) {
        const doorHits = raycaster.intersectObjects(doorMeshes, false);
        if (doorHits.length > 0 && doorHits[0].distance < 4) {
          const doorTarget = doorHits[0].object.userData.doorTarget;
          switchRoom(doorTarget || (currentRoom === 'gallery' ? 'bedroom' : 'gallery'));
          return;
        }
      }

      // Teleport to floor
      const floorHits = raycaster.intersectObject(floorPlane);
      if (floorHits.length > 0) {
        const target = floorHits[0].point.clone();
        target.x = Math.max(GALLERY_BOUNDS.xMin + 0.5, Math.min(GALLERY_BOUNDS.xMax - 0.5, target.x));
        target.z = Math.max(GALLERY_BOUNDS.zMin + 0.5, Math.min(GALLERY_BOUNDS.zMax - 0.5, target.z));
        target.y = GALLERY_EYE_HEIGHT;
        clampToWalls(target);
        teleportStart = camera.position.clone();
        teleportTarget = target;
        teleportProgress = 0;
      }
    }

    if (isTouchActive && currentRoom === 'bedroom') {
      const touch = e.changedTouches[0];
      const x = (touch.clientX / window.innerWidth) * 2 - 1;
      const y = -(touch.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Check hotspots
      if (hotspotSpheres.length > 0) {
        const hsHits = raycaster.intersectObjects(hotspotSpheres, false);
        if (hsHits.length > 0) {
          const idx = hsHits[0].object.userData.hotspotIndex;
          if (idx !== undefined) openPanel(idx);
          return;
        }
      }

      // Check doors
      if (doorMeshes.length > 0) {
        const doorHits = raycaster.intersectObjects(doorMeshes, false);
        if (doorHits.length > 0 && doorHits[0].distance < 4) {
          switchRoom('gallery');
          return;
        }
      }
    }
  }
  lastTapTime = now;
});

// Update mobile controls hint
if (isTouchDevice) {
  document.addEventListener('DOMContentLoaded', () => {
    const hint = document.getElementById('controls-hint-text');
    if (hint) hint.textContent = 'Drag to look · Pinch to move · Double-tap to teleport';
  });
}

// Prevent browser zoom on the canvas
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('gesturechange', (e) => e.preventDefault());
document.addEventListener('gestureend', (e) => e.preventDefault());

// ── Movement ───────────────────────────────────────────────────
const GALLERY_MOVE_SPEED = 3.5;
const BEDROOM_MOVE_SPEED = 2.8;
const direction  = new THREE.Vector3();
const forward    = new THREE.Vector3();
const right      = new THREE.Vector3();

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
  if (Math.abs(touchMoveZ) > 0.001) {
    direction.addScaledVector(forward, touchMoveZ);
  }
  if (Math.abs(touchMoveX) > 0.001) {
    direction.addScaledVector(right, touchMoveX);
  }

  // Trackpad pinch → forward/backward
  if (Math.abs(trackpadMoveZ) > 0.001) {
    direction.addScaledVector(forward, trackpadMoveZ);
    trackpadMoveZ *= 0.85; // decay smoothly
  }

  if (direction.lengthSq() > 0) {
    direction.normalize();
    const speed = currentRoom === 'gallery' ? GALLERY_MOVE_SPEED : BEDROOM_MOVE_SPEED;
    camera.position.addScaledVector(direction, speed * dt);
  }

  const bounds = currentRoom === 'gallery' ? GALLERY_BOUNDS : bedroomBounds;
  const eyeH = currentRoom === 'gallery' ? GALLERY_EYE_HEIGHT : bedroomEyeHeight;

  camera.position.x = Math.max(bounds.xMin, Math.min(bounds.xMax, camera.position.x));
  camera.position.z = Math.max(bounds.zMin, Math.min(bounds.zMax, camera.position.z));

  if (currentRoom === 'gallery') clampToWalls(camera.position);

  camera.position.y = eyeH;
}

function updateGalleryRaycast() {
  if (!isLocked) return;

  raycaster.setFromCamera(screenCenter, camera);

  const intersects = raycaster.intersectObjects(paintingMeshes, false);

  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const idx = hit.userData.paintingIndex;
    if (idx !== undefined) {
      hoveredPainting = idx;
      hoveredDoor = false;
      const p = PAINTINGS[idx];
      infoTitle.textContent = p.title;
      infoPrice.textContent = p.price || 'Price on request';
      infoEl.classList.add('visible');
      hotspotHint.classList.remove('visible');
      renderer.domElement.style.cursor = 'pointer';
      return;
    }
  }

  // Check door portals in gallery
  const doorHits = raycaster.intersectObjects(
    galleryGroup.children.filter(c => c.userData.isDoor), false
  );
  if (doorHits.length > 0) {
    const doorData = doorHits[0].object.userData;
    hoveredDoor = doorData.doorTarget || true;
    hoveredPainting = null;
    infoEl.classList.remove('visible');
    const hintMap = {
      bedroom: '[ Enter my Bedroom ] \u2014 Click',
      subrosa: '[ Sub Rosa ] \u2014 Click'
    };
    hotspotHint.textContent = hintMap[doorData.doorTarget] || '[ Enter ] \u2014 Click';
    hotspotHint.classList.add('visible');
    renderer.domElement.style.cursor = 'pointer';
    return;
  }

  if (!easterEggFound && window.easterEgg) {
    const eeIntersects = raycaster.intersectObject(window.easterEgg);
    window.easterEggHovered = eeIntersects.length > 0;
  }

  hoveredPainting = null;
  hoveredDoor = false;
  infoEl.classList.remove('visible');
  hotspotHint.classList.remove('visible');
  renderer.domElement.style.cursor = '';
}

function updateHotspotRaycast() {
  if (!isLocked || !bedroomLoaded) return;

  raycaster.setFromCamera(screenCenter, camera);
  const hits = raycaster.intersectObjects(hotspotSpheres);

  if (hits.length > 0) {
    const idx = hits[0].object.userData.hotspotIndex;
    if (hoveredHotspot !== idx) {
      hoveredHotspot = idx;
      hoveredDoor = false;
      hotspotHint.textContent = `[ ${HOTSPOTS[idx].title} ] \u2014 Click`;
      hotspotHint.classList.add('visible');
    }
    return;
  }

  // Check door portal back to gallery
  const doorHits = raycaster.intersectObjects(
    bedroomGroup.children.filter(c => c.userData.isDoor), false
  );
  if (doorHits.length > 0) {
    hoveredDoor = true;
    hoveredHotspot = -1;
    hotspotHint.textContent = '[ Enter Studio Sabotage ] — Click Click Bang';
    hotspotHint.classList.add('visible');
    renderer.domElement.style.cursor = 'pointer';
    return;
  }

  if (hoveredHotspot >= 0 || hoveredDoor) {
    hoveredHotspot = -1;
    hoveredDoor = false;
    hotspotHint.classList.remove('visible');
    renderer.domElement.style.cursor = '';
  }
}

function updateHotspotPositions() {
  if (!bedroomLoaded) return;

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

document.addEventListener('click', () => {
  if (!isLocked) return;

  if (hoveredDoor) {
    const target = (typeof hoveredDoor === 'string') ? hoveredDoor : (currentRoom === 'gallery' ? 'bedroom' : 'gallery');
    switchRoom(target);
    return;
  }

  if (currentRoom === 'gallery' && hoveredPainting !== null) {
    const p = PAINTINGS[hoveredPainting];
    document.exitPointerLock();
    document.getElementById('product-img').src = paintingUrl(hoveredPainting);
    document.getElementById('product-title').textContent = p.title;
    document.getElementById('product-dims').textContent = `${p.w} \u00d7 ${p.h} cm`;
    document.getElementById('product-series').textContent = 'Oil, Acrylic & Mixed Media on Canvas';
    document.getElementById('product-price').textContent = `EUR ${Number(p.price).toLocaleString('de-DE')}`;
    document.getElementById('product-buy').dataset.handle = p.handle;
    document.getElementById('product-img').alt = p.title;
    fillSuggestions(hoveredPainting);
    resetCartButton();
    trackViewItem(p);
    productModal.style.display = 'flex';
    document.getElementById('product-close').focus();
  }

  if (currentRoom === 'bedroom' && hoveredHotspot >= 0) {
    openPanel(hoveredHotspot);
  }
});

function openPanel(index) {
  const hs = HOTSPOTS[index];
  activeHotspot = index;

  document.getElementById('panel-category').textContent = hs.category;
  document.getElementById('panel-title').textContent = hs.title;
  document.getElementById('panel-text').textContent = hs.text;
  document.getElementById('panel-detail').textContent = hs.detail;

  panel.style.display = '';
  panel.classList.add('visible');
  document.exitPointerLock();
}

function closePanel() {
  panel.classList.remove('visible');
  activeHotspot = -1;
  setTimeout(() => { panel.style.display = 'none'; }, 300);
  renderer.domElement.requestPointerLock();
}

document.getElementById('close-panel-btn').addEventListener('click', closePanel);

panel.addEventListener('click', (e) => {
  if (e.target === panel) closePanel();
});

let teleportTarget = null;
let teleportStart = null;
let teleportProgress = 0;
const TELEPORT_DURATION = 0.5;

const floorPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 20),
  new THREE.MeshBasicMaterial({ visible: false })
);
floorPlane.rotation.x = -Math.PI / 2;
floorPlane.position.y = 0.01;
galleryGroup.add(floorPlane);

document.addEventListener('dblclick', (e) => {
  if (!isLocked) return;
  if (currentRoom !== 'gallery') return;
  if (hoveredPainting !== null) return;
  if (hoveredDoor) return;

  if (!easterEggFound && window.easterEggHovered) {
    easterEggFound = true;
    document.exitPointerLock();
    easterEggModal.style.display = 'flex';
    return;
  }

  raycaster.setFromCamera(screenCenter, camera);
  const hits = raycaster.intersectObject(floorPlane);

  if (hits.length > 0) {
    const target = hits[0].point.clone();
    target.x = Math.max(GALLERY_BOUNDS.xMin + 0.5, Math.min(GALLERY_BOUNDS.xMax - 0.5, target.x));
    target.z = Math.max(GALLERY_BOUNDS.zMin + 0.5, Math.min(GALLERY_BOUNDS.zMax - 0.5, target.z));
    target.y = GALLERY_EYE_HEIGHT;

    clampToWalls(target);

    teleportStart = camera.position.clone();
    teleportTarget = target;
    teleportProgress = 0;
  }
});

function updateTeleport(dt) {
  if (!teleportTarget) return;

  teleportProgress += dt / TELEPORT_DURATION;

  if (teleportProgress >= 1.0) {
    camera.position.copy(teleportTarget);
    teleportTarget = null;
    return;
  }

  const t = 1 - Math.pow(1 - teleportProgress, 3);
  camera.position.lerpVectors(teleportStart, teleportTarget, t);
}

let switching = false;

function switchRoom(target) {
  if (target === currentRoom) return;
  if (switching) return;
  trackRoomChange(target);

  // Sub Rosa — separate page, fade + redirect
  if (target === 'subrosa') {
    switching = true;
    document.exitPointerLock();
    transitionEl.style.opacity = '1';
    setTimeout(() => { window.location.href = '/pages/gallery3d'; }, 500);
    return;
  }

  // Lazy-load bedroom on first visit
  if (target === 'bedroom' && !bedroomLoaded) {
    if (!bedroomLoadStarted) {
      switching = true;
      document.exitPointerLock();
      transitionEl.style.opacity = '1';
      loadBedroom(() => {
        switching = false;
        switchRoom('bedroom');
      });
    }
    return;
  }

  switching = true;
  document.exitPointerLock();

  transitionEl.style.opacity = '1';

  setTimeout(() => {
    if (target === 'gallery') {
      bedroomGroup.visible = false;
      galleryGroup.visible = true;
      renderer.toneMappingExposure = 1.9;

      camera.position.set(-8.5, GALLERY_EYE_HEIGHT, 3.0);
      camera.lookAt(0, GALLERY_EYE_HEIGHT, 3.0);

      resumeText.textContent = isTouchDevice ? 'Tap to resume, motherfucker' : 'Click to resume, motherfucker';
      controlsHintText.textContent = isTouchDevice
        ? 'Drag to look \u00b7 Pinch to move \u00b7 Double-tap to interact'
        : 'WASD move \u00b7 Double-click teleport \u00b7 Click painting for details';

      hotspotContainer.style.display = 'none';
      hotspotHint.classList.remove('visible');
      panel.classList.remove('visible');
      panel.style.display = 'none';

      hoveredHotspot = -1;
      activeHotspot = -1;

    } else {
      galleryGroup.visible = false;
      bedroomGroup.visible = true;
      renderer.toneMappingExposure = 2.4;

      // Spawn at the door (where player entered from gallery)
      camera.position.set(-2.2, bedroomEyeHeight, 0.5);
      camera.lookAt(0, bedroomEyeHeight, 0.5);

      resumeText.textContent = isTouchDevice ? 'Tap to keep looking' : 'Click to keep looking';
      controlsHintText.textContent = isTouchDevice
        ? 'Drag to look \u00b7 Pinch to move \u00b7 Double-tap hotspot'
        : 'WASD move \u00b7 Click hotspot to read \u00b7 ESC exit';

      hotspotContainer.style.display = 'block';
      infoEl.classList.remove('visible');

      // Bedroom entry hint
      const bedroomHint = document.createElement('div');
      bedroomHint.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:100; text-align:center; pointer-events:none; opacity:0; transition: opacity 0.8s ease;';
      bedroomHint.innerHTML = '<div style="font-family:\'Nimbus Sans\',\'Helvetica Neue\',\'Helvetica\',\'Arial\',sans-serif; color:#FF3E8E; font-size:1.1rem; letter-spacing:0.15em; text-transform:uppercase; text-shadow: 0 0 20px rgba(255,62,142,0.5);">Nimm Platz. Schau dich um.<br><span style="font-size:0.75rem; opacity:0.7; letter-spacing:0.2em;">Nicht wundern — ist nicht aufgeräumt.</span></div>';
      document.body.appendChild(bedroomHint);
      requestAnimationFrame(() => { bedroomHint.style.opacity = '1'; });
      setTimeout(() => { bedroomHint.style.opacity = '0'; }, 3000);
      setTimeout(() => { bedroomHint.remove(); }, 4000);

      teleportTarget = null;

      productModal.style.display = 'none';
      easterEggModal.style.display = 'none';
    }

    currentRoom = target;
    window._debugMeshCacheDirty = true;

    setTimeout(() => {
      transitionEl.style.opacity = '0';
      renderer.domElement.requestPointerLock();
      switching = false;
    }, 300);
  }, 400);
}

// Logo + Header Flash → navigate to landing page
function goToLanding() {
  window.location.href = '/';
}

document.querySelector('.header-logo').addEventListener('click', (e) => {
  e.preventDefault();
  goToLanding();
});
document.getElementById('header-flash').addEventListener('click', goToLanding);
document.getElementById('header-flash-static').addEventListener('click', goToLanding);

// ─── 2D Grid View ───
const gridView = document.getElementById('grid-view');
const gridContainer = document.getElementById('grid-container');
// flatWorldBtn already declared above

function buildGrid() {
  if (gridContainer.children.length > 0) return;
  PAINTINGS.forEach((p, i) => {
    const card = document.createElement('a');
    card.className = 'grid-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.href = `/products/${p.handle}`;
    card.target = '_blank';
    card.rel = 'noopener';
    const img = document.createElement('img');
    img.src = paintingUrl(i);
    img.alt = p.title;
    img.loading = 'lazy';
    const info = document.createElement('div');
    info.className = 'grid-card-info';
    info.innerHTML = `<div class="grid-card-title">${p.title}</div>`
      + `<div class="grid-card-price">${p.price || 'Price on request'}</div>`
      + `<div class="grid-card-dims">${p.w} \u00d7 ${p.h} cm</div>`;
    card.appendChild(img);
    card.appendChild(info);
    gridContainer.appendChild(card);
  });
}

let gridActive = false;

function showGrid() {
  buildGrid();
  document.exitPointerLock();
  isLocked = false;
  gridActive = true;
  gridView.classList.add('visible');
  gridView.scrollTop = 0;
  flatWorldBtn.textContent = '\u00d7';
  flatWorldBtn.title = 'Zurueck zur 3D-Ansicht';
}

function hideGrid() {
  gridActive = false;
  gridView.classList.remove('visible');
  flatWorldBtn.textContent = '\u229e';
  flatWorldBtn.title = 'Flat World \u2014 2D Ansicht';
}

flatWorldBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (gridActive) {
    hideGrid();
  } else if (entered) {
    showGrid();
  }
});

const debugEl = document.createElement('div');
debugEl.style.cssText = 'display:none; position:fixed; bottom:70px; left:16px; z-index:200; font-family:monospace; font-size:0.7rem; color:#FF3E8E; background:rgba(255,255,255,0.9); padding:6px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(255,62,142,0.3);';
document.body.appendChild(debugEl);

const debugTarget = document.createElement('div');
debugTarget.style.cssText = 'display:none; position:fixed; bottom:44px; left:16px; z-index:200; font-family:monospace; font-size:0.7rem; color:rgba(0,0,0,0.6); background:rgba(255,255,255,0.9); padding:6px 12px; border-radius:3px; pointer-events:none; border:1px solid rgba(0,0,0,0.1);';
document.body.appendChild(debugTarget);

let debugMode = false;
const targetRaycaster = new THREE.Raycaster();
targetRaycaster.far = 20;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
const _eeVec = new THREE.Vector3();       // reusable — avoid per-frame allocation
const _heroLookTarget = new THREE.Vector3(); // reusable for hero camera

let _animRunning = true;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { _animRunning = false; }
  else { _animRunning = true; clock.getDelta(); requestAnimationFrame(animate); }
});

function animate() {
  if (!_animRunning) return;
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  // Hero camera move
  if (heroActive) {
    heroProgress += dt / HERO_DURATION;
    if (heroProgress >= 1.0) {
      heroProgress = 1.0;
      heroActive = false;
      // Capture final orientation so pointer lock doesn't jump
      euler.setFromQuaternion(camera.quaternion);
    }
    // Smooth ease-in-out (less jarring than pure ease-out)
    const t = heroProgress < 0.5
      ? 4 * heroProgress * heroProgress * heroProgress
      : 1 - Math.pow(-2 * heroProgress + 2, 3) / 2;
    camera.position.lerpVectors(HERO_START, HERO_END, t);
    _heroLookTarget.lerpVectors(HERO_LOOK_START, HERO_LOOK_END, t);
    camera.lookAt(_heroLookTarget);
  }

  if (!heroActive) updateMovement(dt);

  if (currentRoom === 'gallery') {
    updateTeleport(dt);
    updateGalleryRaycast();

    // Easter egg proximity glow (gallery only) — brighter as you approach
    if (!easterEggFound && window.easterEgg) {
      _eeVec.set(eePos.x, 1.7, eePos.z);
      const dist = camera.position.distanceTo(_eeVec);
      const t = THREE.MathUtils.clamp(1 - (dist - 1.5) / 5, 0, 1);
      window.easterEgg.material.opacity = 0.12 + t * 0.5;
      eeLight.intensity = 0.15 + t * 0.6;
      // Subtle pulse
      const pulse = Math.sin(Date.now() * 0.003) * 0.03;
      window.easterEgg.material.opacity += pulse;
    }
  } else {
    updateHotspotRaycast();
    updateHotspotPositions();
  }

  if (debugMode && isLocked) {
    debugEl.textContent = `cam: x:${camera.position.x.toFixed(2)}  y:${camera.position.y.toFixed(2)}  z:${camera.position.z.toFixed(2)}`;
    targetRaycaster.setFromCamera(screenCenter, camera);
    // Use cached mesh list instead of scene.traverse every frame
    if (!window._debugMeshCache || window._debugMeshCacheDirty) {
      window._debugMeshCache = [];
      scene.traverse(child => { if (child.isMesh && child.material.visible !== false) window._debugMeshCache.push(child); });
      window._debugMeshCacheDirty = false;
    }
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

// Cookie banner + consent now handled by assets/consent.js (shared across pages)

// === AJAX Cart ===
const buyBtn = document.getElementById('product-buy');
const checkoutLink = document.getElementById('product-checkout');

buyBtn.addEventListener('click', async () => {
  const handle = buyBtn.dataset.handle;
  if (!handle) return;
  buyBtn.textContent = '...';
  buyBtn.disabled = true;
  try {
    const res = await fetch(`/products/${handle}.js`);
    const product = await res.json();
    const variantId = product.variants[0].id;
    await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    });
    buyBtn.textContent = 'HINZUGEFÜGT ✓';
    checkoutLink.style.display = 'flex';
    if (window.dataLayer) {
      window.dataLayer.push({ event: 'add_to_cart', ecommerce: {
        items: [{ item_name: product.title, price: product.price / 100, currency: 'EUR' }]
      }});
    }
  } catch (e) {
    buyBtn.textContent = 'FEHLER — NOCHMAL';
    buyBtn.disabled = false;
  }
});

// Reset cart button state when opening a new product
function resetCartButton() {
  buyBtn.textContent = 'IN DEN WARENKORB';
  buyBtn.disabled = false;
  checkoutLink.style.display = 'none';
}

// E-Commerce Tracking
function trackViewItem(painting) {
  if (!window.dataLayer) return;
  window.dataLayer.push({ ecommerce: null }); // clear
  window.dataLayer.push({ event: 'view_item', ecommerce: {
    items: [{ item_name: painting.title, price: Number(painting.price), currency: 'EUR',
      item_category: 'Painting', item_variant: `${painting.w}x${painting.h}cm` }]
  }});
}

function trackRoomChange(room) {
  if (!window.dataLayer) return;
  window.dataLayer.push({ event: 'room_change', room_name: room });
}

// Legal overlays
function openLegal(id) {
  document.exitPointerLock();
  document.getElementById(id + '-overlay').classList.add('visible');
  document.getElementById(id + '-close').classList.add('visible');
}
function closeLegal(id) {
  document.getElementById(id + '-overlay').classList.remove('visible');
  document.getElementById(id + '-close').classList.remove('visible');
}

// Auto-open legal overlay if URL hash matches (e.g. /pages/gallery#impressum)
if (window.location.hash) {
  const target = window.location.hash.substring(1);
  if (['impressum', 'datenschutz', 'agb'].includes(target)) {
    openLegal(target);
    history.replaceState(null, '', window.location.pathname);
  }
}

// Impressum accessible via grid footer and overlay close buttons
document.querySelectorAll('[data-legal="impressum"]').forEach(el => {
  el.addEventListener('click', (e) => { e.preventDefault(); openLegal('impressum'); });
});
document.getElementById('impressum-close').addEventListener('click', () => closeLegal('impressum'));
document.getElementById('impressum-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('impressum-overlay')) closeLegal('impressum');
});

document.getElementById('datenschutz-close').addEventListener('click', () => closeLegal('datenschutz'));
document.getElementById('datenschutz-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('datenschutz-overlay')) closeLegal('datenschutz');
});

document.getElementById('agb-close').addEventListener('click', () => closeLegal('agb'));
document.getElementById('agb-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('agb-overlay')) closeLegal('agb');
});

// Add Datenschutz link to Impressum overlay (bottom)
const impressumContent = document.querySelector('#impressum-overlay .legal-content');
const legalLinks = document.createElement('div');
legalLinks.style.cssText = 'margin-top:2rem; padding-top:1rem; border-top:1px solid rgba(0,0,0,0.06); display:flex; flex-direction:column; gap:0.6rem;';
legalLinks.innerHTML = `
  <a href="#" id="link-datenschutz" style="color:#F5A0B5; text-decoration:none; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase;">Datenschutzerklärung →</a>
  <a href="#" id="link-agb" style="color:#F5A0B5; text-decoration:none; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase;">AGB & Widerrufsbelehrung →</a>
  <a href="#" id="link-cookie-settings" style="color:#F5A0B5; text-decoration:none; font-size:0.7rem; letter-spacing:0.1em; text-transform:uppercase;">Cookie-Einstellungen ändern →</a>
`;
impressumContent.appendChild(legalLinks);
document.getElementById('link-datenschutz').addEventListener('click', (e) => {
  e.preventDefault();
  closeLegal('impressum');
  openLegal('datenschutz');
});
document.getElementById('link-agb').addEventListener('click', (e) => {
  e.preventDefault();
  closeLegal('impressum');
  openLegal('agb');
});
document.getElementById('link-cookie-settings').addEventListener('click', (e) => {
  e.preventDefault();
  closeLegal('impressum');
  // Restore previous consent into toggles (consent logic lives in consent.js)
  let prev = null;
  try { prev = JSON.parse(localStorage.getItem('cookie-consent')); } catch {}
  if (prev) {
    document.getElementById('cookie-analytics').checked = prev.analytics || false;
    document.getElementById('cookie-marketing').checked = prev.marketing || false;
  }
  document.getElementById('cookie-settings').classList.add('visible');
});

// Expose state for footer visibility script (gallery-main-config.js)
window._SS = { get entered() { return entered; }, get gridActive() { return gridActive; }, productModal };
