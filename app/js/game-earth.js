// game-earth.js — interaktywny globus 3D i lot do Rynku w Trzebnicy

const TRZEBNICA = { lat: 51.3072, lon: 17.0565 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

let THREE;
let canvas, space, label, loader, videoModal, video;
let scene, camera, renderer, earth, atmosphere, stars, markerGroup, markerRing;
let markerNormal, markerAnchor, raycaster;
let initialized = false;
let initPromise = null;
let active = false;
let worldReady = false;
let rafId = 0;
let focusTween = null;
let pickables = [];
let pointers = new Map();
let dragStart = null;
let pinchStart = null;

const orbit = {
  theta: 0,
  phi: Math.PI / 2,
  radius: 4.6,
  targetTheta: 0,
  targetPhi: Math.PI / 2,
  targetRadius: 4.6,
};

function latLonToVector(lat, lon, radius = 1) {
  const latitude = lat * Math.PI / 180;
  const longitude = lon * Math.PI / 180;
  const cosLat = Math.cos(latitude);
  return new THREE.Vector3(
    radius * cosLat * Math.cos(longitude),
    radius * Math.sin(latitude),
    -radius * cosLat * Math.sin(longitude),
  );
}

function markerAngles() {
  return {
    theta: Math.atan2(markerNormal.z, markerNormal.x),
    phi: Math.acos(clamp(markerNormal.y, -1, 1)),
  };
}

function buildStars() {
  const count = 760;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 6 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xD7E8FF,
    size: .018,
    transparent: true,
    opacity: .82,
    sizeAttenuation: true,
    depthWrite: false,
  });
  stars = new THREE.Points(geometry, material);
  scene.add(stars);
}

function buildMarker() {
  markerNormal = latLonToVector(TRZEBNICA.lat, TRZEBNICA.lon).normalize();
  markerAnchor = markerNormal.clone().multiplyScalar(1.17);

  markerGroup = new THREE.Group();
  markerGroup.position.copy(markerNormal);
  markerGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), markerNormal);

  const stemMaterial = new THREE.MeshBasicMaterial({ color: 0xF7D581 });
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(.009, .014, .12, 10),
    stemMaterial,
  );
  stem.position.y = .06;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(.045, 20, 14),
    new THREE.MeshBasicMaterial({ color: 0xE75F5B }),
  );
  head.position.y = .135;

  markerRing = new THREE.Mesh(
    new THREE.RingGeometry(.042, .062, 28),
    new THREE.MeshBasicMaterial({
      color: 0xFF8B7E,
      transparent: true,
      opacity: .72,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  markerRing.rotation.x = -Math.PI / 2;
  markerRing.position.y = .006;

  markerGroup.add(stem, head, markerRing);
  scene.add(markerGroup);
  pickables = [stem, head, markerRing];
}

function buildAtmosphere() {
  const material = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      varying float glow;
      void main() {
        vec3 viewNormal = normalize(normalMatrix * normal);
        glow = pow(max(0.0, 0.72 - dot(viewNormal, vec3(0.0, 0.0, 1.0))), 2.2);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying float glow;
      void main() {
        gl_FragColor = vec4(0.20, 0.57, 1.0, glow * 0.72);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.075, 64, 48), material);
  scene.add(atmosphere);
}

function finishLoading(message = '') {
  worldReady = true;
  if (message) loader.querySelector('p').textContent = message;
  window.setTimeout(() => loader.classList.add('is-done'), message ? 650 : 120);
}

async function initializeWorld() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      THREE = await import('./vendor/three.module.js');

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, 1, .05, 40);
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);

      scene.add(new THREE.HemisphereLight(0xBFDFFF, 0x08111F, 1.45));
      const sun = new THREE.DirectionalLight(0xFFF2D1, 2.65);
      sun.position.set(4, 3, 5);
      scene.add(sun);

      const earthMaterial = new THREE.MeshPhongMaterial({
        color: 0x2F6A94,
        specular: 0x284D68,
        shininess: 12,
      });
      earth = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 54), earthMaterial);
      scene.add(earth);

      buildStars();
      buildAtmosphere();
      buildMarker();
      raycaster = new THREE.Raycaster();
      resize();

      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        'assets/img/earth/earth-blue-marble-2048.png',
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          earthMaterial.map = texture;
          earthMaterial.color.set(0xFFFFFF);
          earthMaterial.needsUpdate = true;
          finishLoading();
        },
        undefined,
        () => finishLoading('Ziemia jest gotowa'),
      );

      initialized = true;
      return true;
    } catch (error) {
      console.error('Nie udało się uruchomić globusa 3D:', error);
      loader.querySelector('p').textContent = 'Ten ekran nie obsługuje grafiki 3D';
      loader.querySelector('span').style.display = 'none';
      return false;
    }
  })();
  return initPromise;
}

function resize() {
  if (!renderer || !camera) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

function focusOnTrzebnica(opening = false) {
  if (!initialized) return;
  const target = markerAngles();
  const now = performance.now();

  if (opening) {
    orbit.theta = target.theta - .88;
    orbit.phi = clamp(target.phi + .2, .12, Math.PI - .12);
    orbit.radius = 6.8;
  }

  focusTween = {
    startedAt: now,
    duration: opening ? 2600 : 1050,
    from: {
      theta: orbit.theta,
      phi: orbit.phi,
      radius: orbit.radius,
    },
    to: {
      theta: target.theta,
      phi: target.phi,
      radius: 5.45,
    },
  };
  label.classList.add('hidden');
}

function updateFocus(now) {
  if (!focusTween) return false;
  const raw = clamp((now - focusTween.startedAt) / focusTween.duration, 0, 1);
  const eased = 1 - Math.pow(1 - raw, 3);
  const { from, to } = focusTween;

  orbit.theta = from.theta + (to.theta - from.theta) * eased;
  orbit.phi = from.phi + (to.phi - from.phi) * eased;
  orbit.radius = from.radius + (to.radius - from.radius) * eased;
  orbit.targetTheta = orbit.theta;
  orbit.targetPhi = orbit.phi;
  orbit.targetRadius = orbit.radius;

  if (raw >= 1) focusTween = null;
  return true;
}

function updateCamera(now) {
  if (!updateFocus(now)) {
    orbit.theta += (orbit.targetTheta - orbit.theta) * .13;
    orbit.phi += (orbit.targetPhi - orbit.phi) * .13;
    orbit.radius += (orbit.targetRadius - orbit.radius) * .13;
  }

  const sinPhi = Math.sin(orbit.phi);
  camera.position.set(
    orbit.radius * sinPhi * Math.cos(orbit.theta),
    orbit.radius * Math.cos(orbit.phi),
    orbit.radius * sinPhi * Math.sin(orbit.theta),
  );
  camera.lookAt(0, 0, 0);
}

function updateLabel() {
  if (!worldReady || !active) {
    label.classList.add('hidden');
    return;
  }

  const cameraDirection = camera.position.clone().normalize();
  const isFrontFacing = markerNormal.dot(cameraDirection) > .14;
  const projected = markerAnchor.clone().project(camera);
  const rect = canvas.getBoundingClientRect();
  const x = (projected.x * .5 + .5) * rect.width;
  const y = (-projected.y * .5 + .5) * rect.height;
  const onScreen = x > -20 && x < rect.width - 120 && y > 90 && y < rect.height - 55;
  const visible = isFrontFacing && onScreen && !focusTween;

  label.classList.toggle('hidden', !visible);
  if (visible) {
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
  }
}

function render(now) {
  if (!active || !initialized) {
    rafId = 0;
    return;
  }
  updateCamera(now);
  stars.rotation.y += .000035;
  const pulse = 1 + Math.sin(now * .0045) * .16;
  markerRing.scale.setScalar(pulse);
  markerRing.material.opacity = .5 + Math.sin(now * .0045) * .2;
  updateLabel();
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(render);
}

function startLoop() {
  if (!rafId) rafId = requestAnimationFrame(render);
}

function cancelFocus() {
  if (!focusTween) return;
  focusTween = null;
  orbit.targetTheta = orbit.theta;
  orbit.targetPhi = orbit.phi;
  orbit.targetRadius = orbit.radius;
}

function pointerDistance() {
  const values = [...pointers.values()];
  if (values.length < 2) return 0;
  return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
}

function resetSingleDrag() {
  const first = [...pointers.entries()][0];
  if (!first) {
    dragStart = null;
    return;
  }
  dragStart = {
    id: first[0],
    x: first[1].x,
    y: first[1].y,
    theta: orbit.targetTheta,
    phi: orbit.targetPhi,
    moved: false,
  };
}

function onPointerDown(event) {
  if (!initialized) return;
  cancelFocus();
  canvas.setPointerCapture?.(event.pointerId);
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 1) {
    resetSingleDrag();
  } else if (pointers.size === 2) {
    pinchStart = { distance: pointerDistance(), radius: orbit.targetRadius };
    dragStart = null;
  }
}

function onPointerMove(event) {
  if (!pointers.has(event.pointerId)) return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

  if (pointers.size === 1 && dragStart?.id === event.pointerId) {
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    if (Math.hypot(dx, dy) > 6) dragStart.moved = true;
    orbit.targetTheta = dragStart.theta - dx * .006;
    orbit.targetPhi = clamp(dragStart.phi + dy * .006, .12, Math.PI - .12);
  } else if (pointers.size === 2 && pinchStart) {
    const distance = Math.max(30, pointerDistance());
    orbit.targetRadius = clamp(
      pinchStart.radius * pinchStart.distance / distance,
      1.18,
      7,
    );
  }
}

function markerWasHit(event) {
  const rect = canvas.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(pickables, false).length > 0;
}

function onPointerUp(event) {
  const wasClick = pointers.size === 1 && dragStart?.id === event.pointerId && !dragStart.moved;
  pointers.delete(event.pointerId);

  if (wasClick && markerWasHit(event)) openVideo();

  if (pointers.size === 1) resetSingleDrag();
  else if (pointers.size === 0) {
    dragStart = null;
    pinchStart = null;
  }
}

function onWheel(event) {
  if (!active || !initialized) return;
  event.preventDefault();
  cancelFocus();
  orbit.targetRadius = clamp(
    orbit.targetRadius * Math.exp(event.deltaY * .0012),
    1.18,
    7,
  );
}

function openVideo() {
  videoModal.classList.remove('hidden');
  video.currentTime = 0;
  video.play().catch(() => {});
}

function closeVideo() {
  video.pause();
  video.currentTime = 0;
  videoModal.classList.add('hidden');
}

export function initEarth({ onScreen }) {
  canvas = document.querySelector('#earth-canvas');
  space = document.querySelector('#earth-space');
  label = document.querySelector('#earth-marker');
  loader = document.querySelector('#earth-loader');
  videoModal = document.querySelector('#earth-video-modal');
  video = document.querySelector('#earth-video');

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  label.addEventListener('click', openVideo);
  document.querySelector('#earth-locate').addEventListener('click', () => focusOnTrzebnica(false));
  document.querySelector('#earth-video-close').addEventListener('click', closeVideo);
  videoModal.addEventListener('click', (event) => {
    if (event.target === videoModal) closeVideo();
  });
  window.addEventListener('resize', resize);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !videoModal.classList.contains('hidden')) closeVideo();
  });

  onScreen('screen-earth', {
    onEnter() {
      active = true;
      loader.classList.remove('is-done');
      initializeWorld().then((ok) => {
        if (!ok || !active) return;
        resize();
        focusOnTrzebnica(true);
        if (worldReady) loader.classList.add('is-done');
        startLoop();
      });
    },
    onLeave() {
      active = false;
      pointers.clear();
      cancelAnimationFrame(rafId);
      rafId = 0;
      label.classList.add('hidden');
      closeVideo();
    },
  });
}
