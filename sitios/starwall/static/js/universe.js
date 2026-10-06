/**
 * StarWall Ads — Universo 3D interactivo (Three.js)
 * Galaxia tridimensional con estrellas, planetas, nebulosas y bloom.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const Universe = (() => {
  const POS_SCALE = 0.06;
  const UNIVERSE_CENTER = { x: 900, y: 500 };

  let container, tooltip, loadingEl;
  let scene, camera, renderer, composer, controls;
  let raycaster, mouse, clock;
  let spaces = [], activeCategory = 'all';
  let celestialGroup, clickableMeshes = [];
  let hoveredMesh = null;
  let animationId = null;

  /* ── Init ─────────────────────────────────────────────────────────────── */

  async function init({ canvasId, apiUrl, filterBarId }) {
    container = document.getElementById(canvasId);
    if (!container) return;

    setupNavToggle();
    setupModal();
    createOverlays();
    showLoading(true);

    if (filterBarId) setupFilters(filterBarId);

    try {
      const res = await fetch(apiUrl);
      spaces = await res.json();
    } catch (e) {
      console.error('Error cargando espacios:', e);
      spaces = [];
    }

    initThree();
    buildEnvironment();
    renderSpaces();
    setupInteraction();
    animate();
    showLoading(false);

    window.addEventListener('resize', onResize);
  }

  function createOverlays() {
    loadingEl = document.createElement('div');
    loadingEl.className = 'universe-loading';
    loadingEl.innerHTML = '<div class="universe-loading-ring"></div><span>Cargando galaxia...</span>';
    container.appendChild(loadingEl);

    tooltip = document.createElement('div');
    tooltip.className = 'universe-tooltip-3d';
    tooltip.hidden = true;
    container.appendChild(tooltip);
  }

  function showLoading(show) {
    if (loadingEl) loadingEl.classList.toggle('hidden', !show);
  }

  /* ── Three.js core ────────────────────────────────────────────────────── */

  function initThree() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.0035);

    const w = container.clientWidth;
    const h = container.clientHeight || 600;

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 800);
    camera.position.set(0, 35, 75);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controls.target.set(0, 0, 0);

    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.85, 0.5, 0.15);
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.8 };
    mouse = new THREE.Vector2();
    clock = new THREE.Clock();

    celestialGroup = new THREE.Group();
    scene.add(celestialGroup);

    scene.add(new THREE.AmbientLight(0x1a1040, 0.4));
    const keyLight = new THREE.DirectionalLight(0x8888ff, 0.6);
    keyLight.position.set(30, 50, 20);
    scene.add(keyLight);
  }

  /* ── Entorno galáctico ────────────────────────────────────────────────── */

  function buildEnvironment() {
    createStarfield();
    createNebulae();
    createGalacticCore();
    createDustRing();
  }

  function createStarfield() {
    const count = window.innerWidth < 768 ? 8000 : 18000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xaaccff),
      new THREE.Color(0xffddaa),
      new THREE.Color(0xccaaff),
    ];

    for (let i = 0; i < count; i++) {
      const r = 60 + Math.random() * 180;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * r * 0.4;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = Math.random() * 1.8 + 0.3;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (180.0 / -mv.z) * (0.8 + 0.2 * sin(uTime + position.x * 0.1));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          gl_FragColor = vec4(vColor, glow * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(geo, mat);
    stars.name = 'starfield';
    stars.userData.shader = mat;
    scene.add(stars);
  }

  function createNebulae() {
    const nebulae = [
      { color: 0x7c3aed, pos: [-40, 5, -30], scale: 55 },
      { color: 0x0ea5e9, pos: [45, -8, 25], scale: 45 },
      { color: 0xec4899, pos: [10, 15, -50], scale: 38 },
      { color: 0x6366f1, pos: [-25, -12, 40], scale: 42 },
    ];

    nebulae.forEach((n) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      const hex = '#' + n.color.toString(16).padStart(6, '0');
      grad.addColorStop(0, hex + 'cc');
      grad.addColorStop(0.4, hex + '44');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      sprite.position.set(...n.pos);
      sprite.scale.set(n.scale, n.scale, 1);
      scene.add(sprite);
    });
  }

  function createGalacticCore() {
    const coreGeo = new THREE.SphereGeometry(6, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff0cc, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    const glowGeo = new THREE.SphereGeometry(12, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    const outerGlow = new THREE.SphereGeometry(20, 32, 32);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x3b1f8e,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(outerGlow, outerMat));
  }

  function createDustRing() {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 25 + Math.random() * 35;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x8866ff,
      size: 0.35,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Points(geo, mat);
    ring.rotation.x = 0.15;
    scene.add(ring);
  }

  /* ── Cuerpos celestes (marcas) ────────────────────────────────────────── */

  function mapPosition(space) {
    const x = (space.x_position - UNIVERSE_CENTER.x) * POS_SCALE;
    const z = (space.y_position - UNIVERSE_CENTER.y) * POS_SCALE;
    const typeGroup = space.category_group || 'star';
    const y = typeGroup === 'planet' ? (Math.random() * 2 - 1) * 2 : (Math.random() * 4 - 2) + 3;
    return new THREE.Vector3(x, y, z);
  }

  function get3DSize(space) {
    const s = space.size || 12;
    const group = space.category_group || 'star';
    if (group === 'planet') return s * 0.07;
    if (group === 'constellation') return s * 0.05;
    return s * 0.04;
  }

  function renderSpaces() {
    clickableMeshes = [];
    while (celestialGroup.children.length) {
      const child = celestialGroup.children[0];
      celestialGroup.remove(child);
      disposeObject(child);
    }

    const filtered = activeCategory === 'all'
      ? spaces
      : spaces.filter((s) => s.category === activeCategory);

    filtered.forEach((space) => {
      if (space.category_group === 'constellation') {
        createConstellation(space);
      } else if (space.category_group === 'planet') {
        createPlanet(space);
      } else {
        createStar(space);
      }
    });
  }

  function createStar(space) {
    const pos = mapPosition(space);
    const size = get3DSize(space);
    const color = new THREE.Color(space.main_color || '#7c5cff');
    const group = new THREE.Group();
    group.position.copy(pos);
    group.userData.space = space;

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(size, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 })
    );
    group.add(core);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(size * 2.5, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, side: THREE.BackSide })
    );
    group.add(glow);

    const rays = new THREE.Mesh(
      new THREE.SphereGeometry(size * 4, 8, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.05, wireframe: true })
    );
    group.add(rays);

    group.userData.pulseMeshes = [core, glow];
    group.userData.baseScale = 1;
    group.userData.phase = Math.random() * Math.PI * 2;

    celestialGroup.add(group);
    clickableMeshes.push(group);
  }

  function createPlanet(space) {
    const pos = mapPosition(space);
    const radius = get3DSize(space);
    const color = new THREE.Color(space.main_color || '#7c5cff');
    const group = new THREE.Group();
    group.position.copy(pos);
    group.userData.space = space;

    let planetMat;
    if (space.logo_path) {
      const loader = new THREE.TextureLoader();
      loader.load(`/static/${space.logo_path}`, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        planetMat.map = tex;
        planetMat.needsUpdate = true;
      });
      planetMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: color,
        emissiveIntensity: 0.15,
        roughness: 0.6,
        metalness: 0.2,
      });
    } else {
      planetMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25,
        roughness: 0.55,
        metalness: 0.15,
      });
    }

    const planet = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 48), planetMat);
    group.add(planet);

    const atmos = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.12, 32, 32),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      })
    );
    group.add(atmos);

    const ringGeo = new THREE.RingGeometry(radius * 1.4, radius * 1.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    if (radius > 3) group.add(ring);

    const light = new THREE.PointLight(color, 1.5, radius * 8);
    group.add(light);

    group.userData.planetMesh = planet;
    group.userData.orbitPhase = Math.random() * Math.PI * 2;
    group.userData.baseY = pos.y;

    celestialGroup.add(group);
    clickableMeshes.push(group);
  }

  function createConstellation(space) {
    const center = mapPosition(space);
    const color = new THREE.Color(space.main_color || '#7c5cff');
    const starCount = 6;
    const spread = 4;
    const group = new THREE.Group();
    group.position.copy(center);
    group.userData.space = space;

    const points = [];
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      const r = spread * (0.5 + Math.random() * 0.5);
      points.push(new THREE.Vector3(Math.cos(angle) * r, (Math.random() - 0.5) * 1.5, Math.sin(angle) * r));
    }

    const linePositions = [];
    for (let i = 0; i < points.length; i++) {
      linePositions.push(points[i].x, points[i].y, points[i].z);
      const next = points[(i + 1) % points.length];
      linePositions.push(next.x, next.y, next.z);
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
    );
    group.add(lines);

    points.forEach((p, i) => {
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 12, 12),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
      );
      star.position.copy(p);
      star.userData.phase = i * 0.8;
      group.add(star);
    });

    celestialGroup.add(group);
    clickableMeshes.push(group);
  }

  function disposeObject(obj) {
    obj.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
  }

  /* ── Interacción ──────────────────────────────────────────────────────── */

  function setupInteraction() {
    const canvas = renderer.domElement;

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mouseleave', () => {
      hoveredMesh = null;
      tooltip.hidden = true;
      container.style.cursor = 'grab';
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.touches[0].clientY - rect.top) / rect.height) * 2 + 1;
      }
    }, { passive: true });
  }

  function onMouseMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickableMeshes, true);

    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj.parent && !obj.userData.space) obj = obj.parent;
      if (obj.userData.space) {
        hoveredMesh = obj;
        controls.autoRotate = false;
        container.style.cursor = 'pointer';
        showTooltip(obj.userData.space, e.clientX - rect.left, e.clientY - rect.top);
        return;
      }
    }

    hoveredMesh = null;
    controls.autoRotate = true;
    container.style.cursor = 'grab';
    tooltip.hidden = true;
  }

  function onClick(e) {
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(clickableMeshes, true);
    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj.parent && !obj.userData.space) obj = obj.parent;
    if (obj.userData.space) {
      openModal(obj.userData.space);
      focusOnObject(obj);
    }
  }

  function focusOnObject(group) {
    const target = group.position.clone();
    controls.target.copy(target);
    const dir = camera.position.clone().sub(target).normalize();
    const newPos = target.clone().add(dir.multiplyScalar(25));
    animateCameraTo(newPos, target);
  }

  function animateCameraTo(pos, target) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    let t = 0;
    const step = () => {
      t += 0.03;
      if (t >= 1) return;
      const ease = 1 - Math.pow(1 - t, 3);
      camera.position.lerpVectors(startPos, pos, ease);
      controls.target.lerpVectors(startTarget, target, ease);
      requestAnimationFrame(step);
    };
    step();
  }

  function showTooltip(space, x, y) {
    tooltip.hidden = false;
    tooltip.innerHTML = `<span class="tooltip-dot" style="background:${space.main_color}"></span>${escapeHtml(space.brand_name)}`;
    tooltip.style.left = x + 'px';
    tooltip.style.top = (y - 36) + 'px';
  }

  function setupFilters(filterBarId) {
    const bar = document.getElementById(filterBarId);
    if (!bar) return;
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      bar.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderSpaces();
    });
  }

  /* ── Animación ────────────────────────────────────────────────────────── */

  function animate() {
    animationId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    const starfield = scene.getObjectByName('starfield');
    if (starfield?.userData.shader) starfield.userData.shader.uniforms.uTime.value = t;

    celestialGroup.children.forEach((group) => {
      if (group.userData.pulseMeshes) {
        const pulse = 1 + 0.15 * Math.sin(t * 2.5 + group.userData.phase);
        group.userData.pulseMeshes[0].scale.setScalar(pulse);
        group.userData.pulseMeshes[1].scale.setScalar(pulse * 1.1);
      }
      if (group.userData.planetMesh) {
        group.userData.planetMesh.rotation.y = t * 0.15;
        const baseY = group.userData.baseY ?? group.position.y;
        group.position.y = baseY + Math.sin(t * 0.8 + group.userData.orbitPhase) * 0.6;
      }
      if (hoveredMesh === group) {
        group.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    });

    controls.update();
    composer.render();
  }

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight || 600;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }

  /* ── Modal & UI compartida ────────────────────────────────────────────── */

  function openModal(space) {
    const modal = document.getElementById('spaceModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    const logoHtml = space.logo_path
      ? `<img src="/static/${space.logo_path}" alt="${space.brand_name}" class="modal-logo">`
      : `<div class="modal-avatar" style="background:${space.main_color};box-shadow:0 0 20px ${space.main_color}">${space.brand_name[0]}</div>`;

    body.innerHTML = `
      ${logoHtml}
      <h2 class="modal-brand" id="modalBrandName">${escapeHtml(space.brand_name)}</h2>
      <p class="modal-title">${escapeHtml(space.title)}</p>
      <p class="modal-desc">${escapeHtml(space.description)}</p>
      <div class="modal-tags">
        <span class="modal-tag">${escapeHtml(space.category)}</span>
        <span class="modal-tag">${escapeHtml(space.space_label || space.space_type)}</span>
      </div>
      <a href="${escapeHtml(space.target_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block">
        Visitar marca →
      </a>
    `;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function setupModal() {
    const modal = document.getElementById('spaceModal');
    const closeBtn = document.getElementById('modalClose');
    if (!modal) return;
    const close = () => {
      modal.hidden = true;
      document.body.style.overflow = '';
    };
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  function setupNavToggle() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init };
})();

export { Universe };
window.Universe = Universe;
