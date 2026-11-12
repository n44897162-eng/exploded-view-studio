/* Exploded View Studio - spec-driven Three.js engine.
   No external models, textures, fonts, or services. */
(() => {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const damp = (current, target, lambda, dt) => current + (target - current) * (1 - Math.exp(-lambda * dt));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const spec = window.SCENE_SPEC;
  const compactViewport = window.matchMedia('(max-width: 980px), (pointer: coarse)');
  const isCompactView = () => compactViewport.matches;

  if (!spec || !Array.isArray(spec.modules) || !spec.modules.length) {
    document.body.innerHTML = '<main style="padding:48px;color:#dce7eb;font:14px monospace;background:#05070a">SCENE_SPEC is missing. Run scaffold.mjs to generate scene-spec.js.</main>';
    throw new Error('SCENE_SPEC missing');
  }

  const product = spec.product || {};
  const meta = spec.meta || {};
  const DESIGN = window.STUDIO_DESIGN
    ? window.STUDIO_DESIGN.apply(spec)
    : { preset: 'aerolab', copy: {}, colors: {}, scene: {} };

  /* ---------------------------------------------------- product identity */
  const ARCHETYPE_DEFAULTS = {
    camera: {
      label: 'OPTICAL STAGE',
      construction: 'optical',
      stage: 'aperture',
      views: [
        { label: 'MACRO', theta: 0.68, phi: 1.12, zoom: 0.76 },
        { label: 'TOP', theta: 0.02, phi: 0.2, zoom: 0.96 },
        { label: 'FRONT', theta: 0, phi: 1.34, zoom: 0.88 }
      ],
      motion: { stagger: 0.055, order: 'optical', connectors: true },
      actions: { explode: '全部拆解', assemble: '收合装配' }
    },
    quadrotor: {
      label: 'FLIGHT DECK',
      construction: 'radial',
      stage: 'rotor',
      views: [
        { label: 'FLIGHT', theta: 0.82, phi: 0.92, zoom: 1.18 },
        { label: 'TOP', theta: 0.02, phi: 0.18, zoom: 1.08 },
        { label: 'NOSE', theta: 0, phi: 1.34, zoom: 1.02 }
      ],
      motion: { stagger: 0.05, order: 'radial', connectors: true },
      actions: { explode: '全部拆解', assemble: '收合装配' }
    },
    audio: {
      label: 'LISTENING ROOM',
      construction: 'layered',
      stage: 'waveform',
      views: [
        { label: 'LISTEN', theta: 0.55, phi: 1.08, zoom: 0.94 },
        { label: 'TOP', theta: 0.02, phi: 0.2, zoom: 0.94 },
        { label: 'FRONT', theta: 0, phi: 1.3, zoom: 0.9 }
      ],
      motion: { stagger: 0.065, order: 'layered', connectors: true },
      actions: { explode: '展开结构', assemble: '收拢箱体' }
    },
    watch: {
      label: 'MICRO MECHANISM',
      construction: 'circular',
      stage: 'turntable',
      views: [
        { label: 'MACRO', theta: 0.36, phi: 1.15, zoom: 0.72 },
        { label: 'DIAL', theta: 0.02, phi: 0.08, zoom: 0.82 },
        { label: 'PROFILE', theta: 0, phi: 1.36, zoom: 0.8 }
      ],
      motion: { stagger: 0.06, order: 'circular', connectors: true },
      actions: { explode: '展开机芯', assemble: '合盖' }
    },
    robot: {
      label: 'WORK CELL',
      construction: 'kinematic',
      stage: 'cell',
      views: [
        { label: 'CELL', theta: 0.86, phi: 1.06, zoom: 1.08 },
        { label: 'TOP', theta: 0.02, phi: 0.2, zoom: 1.0 },
        { label: 'TOOL', theta: 0.42, phi: 1.24, zoom: 0.72 }
      ],
      motion: { stagger: 0.045, order: 'kinematic', connectors: true },
      actions: { explode: '展开机构', assemble: '复位' }
    },
    medical: {
      label: 'SCAN BAY',
      construction: 'scan',
      stage: 'scan',
      views: [
        { label: 'SCAN', theta: 0.02, phi: 1.34, zoom: 0.94 },
        { label: 'TOP', theta: 0.02, phi: 0.16, zoom: 0.96 },
        { label: 'SIDE', theta: 1.18, phi: 1.18, zoom: 1.0 }
      ],
      motion: { stagger: 0.05, order: 'scan', connectors: true },
      actions: { explode: '分层检查', assemble: '合并扫描' }
    },
    generic: {
      label: 'ASSEMBLY STAGE',
      construction: 'linear',
      stage: 'grid',
      views: [
        { label: 'ISO', theta: 0.72, phi: 1.12, zoom: 1.0 },
        { label: 'TOP', theta: 0.02, phi: 0.2, zoom: 0.96 },
        { label: 'FRONT', theta: 0, phi: 1.34, zoom: 0.92 }
      ],
      motion: { stagger: 0.045, order: 'linear', connectors: true },
      actions: { explode: '全部拆解', assemble: '收合装配' }
    }
  };

  const PRESET_ARCHETYPE = {
    atelier: 'camera', signal: 'quadrotor', studio: 'audio', nocturne: 'watch',
    pulse: 'medical', foundry: 'robot', terrain: 'generic', aerolab: 'generic'
  };

  function detectArchetype() {
    const asked = spec.identity && spec.identity.archetype;
    if (asked && ARCHETYPE_DEFAULTS[asked]) return asked;
    const text = [product.name, product.cn, product.tagline, meta.category, meta.kicker].filter(Boolean).join(' ');
    const rules = [
      ['camera', /(camera|lens|optic|photo|cinema|optical|相机|镜头|光学|影像|摄影)/i],
      ['audio', /(audio|speaker|woofer|tweeter|headphone|studio monitor|monitor speaker|音响|音箱|耳机|家具|灯具|家居)/i],
      ['medical', /(medical|clinical|health|wearable|patient monitor|vital signs|医疗|健康|临床|监测|可穿戴)/i],
      ['watch', /(watch|luxury|jewel|perfume|手表|奢华|珠宝|香水)/i],
      ['quadrotor', /(drone|quadrotor|sport|bike|game|field|无人机|运动|竞速)/i],
      ['robot', /(robot|tool|industrial|machine|hardware|机器人|工具|工业|机械)/i]
    ];
    for (const [archetype, pattern] of rules) if (pattern.test(text)) return archetype;
    return PRESET_ARCHETYPE[DESIGN.preset] || 'generic';
  }

  function resolveIdentity() {
    const archetype = detectArchetype();
    const defaults = ARCHETYPE_DEFAULTS[archetype] || ARCHETYPE_DEFAULTS.generic;
    const asked = spec.identity && typeof spec.identity === 'object' ? spec.identity : {};
    const views = defaults.views.map((view, index) => {
      const override = Array.isArray(asked.views) ? asked.views[index] || {} : {};
      return {
        label: String(override.label || view.label).toUpperCase(),
        theta: Number.isFinite(Number(override.theta)) ? Number(override.theta) : view.theta,
        phi: Number.isFinite(Number(override.phi)) ? Number(override.phi) : view.phi,
        zoom: Number.isFinite(Number(override.zoom)) ? Number(override.zoom) : view.zoom,
        target: Array.isArray(override.target) ? override.target.slice(0, 3) : null
      };
    });
    return {
      archetype,
      label: String(asked.label || defaults.label).toUpperCase(),
      construction: String(asked.construction || defaults.construction),
      stage: String(asked.stage || defaults.stage),
      views,
      motion: { ...defaults.motion, ...(asked.motion || {}) },
      actions: { ...defaults.actions, ...(asked.actions || {}) }
    };
  }

  const IDENTITY = resolveIdentity();
  document.body.dataset.stage = IDENTITY.stage;
  document.body.dataset.construction = IDENTITY.construction;
  document.body.dataset.identity = IDENTITY.archetype;
  const modulesData = spec.modules.slice();
  const totalMass = Number(product.totalMass) || modulesData.reduce((sum, m) => sum + (Number(m.mass) || 0), 0);
  const canvas = $('#studioCanvas');
  const stage = $('#stage');
  const pinsRoot = $('#pins');
  const moduleList = $('#moduleList');
  const inspector = $('#inspector');

  /* ---------------------------------------------------------------- copy */
  const setText = (sel, value) => { const el = $(sel); if (el && value != null) el.textContent = value; };
  setText('#stageMethod', `${IDENTITY.label} / ${IDENTITY.stage.toUpperCase()}`);
  setText('#brandName', meta.brand || 'AEROLAB');
  setText('#brandMicro', DESIGN.copy.micro || 'PROCEDURAL ASSEMBLY ENGINE');
  setText('#projectName', `${product.name || 'PRODUCT'} / ${product.model || '001'}`);
  setText('#projectCategory', meta.category || DESIGN.copy.category || 'EXPLODED TECHNICAL VIEW');
  setText('#projectRev', meta.revision || 'REV. 01');
  setText('#projectKicker', DESIGN.copy.kicker || meta.kicker || 'PROCEDURAL ASSEMBLY SYSTEM');
  setText('#explodeMicro', DESIGN.copy.explode || 'EXPLODE ASSEMBLY');
  setText('#treeEyebrow', DESIGN.copy.tree || 'ASSEMBLY TREE');
  setText('#treeTitle', DESIGN.copy.index || '模块索引');
  setText('#massLabel', DESIGN.copy.mass || 'SYSTEM WEIGHT');
  setText('#autoLabel', DESIGN.copy.auto || 'AUTO ORBIT');
  setText('#resetLabel', DESIGN.copy.reset || 'RESET VIEW');
  setText('#stageHintText', DESIGN.copy.hint || '拖拽旋转 · 双指缩放 · 点按模块查看参数');
  const themeMeta = document.getElementById('themeColor');
  if (themeMeta) themeMeta.setAttribute('content', DESIGN.colors.bg || '#05070a');
  setText('#bootKicker', `${meta.brand || 'AEROLAB'} / ${DESIGN.label || 'ASSEMBLY ENGINE'}`.toUpperCase());
  setText('#productName', product.name || 'PRODUCT');
  setText('#productCn', product.cn || '产品');
  setText('#productTagline', product.tagline || 'EXPLODED TECHNICAL VIEW');
  setText('#moduleCount', String(modulesData.length).padStart(2, '0'));
  setText('#moduleCountSmall', String(modulesData.length).padStart(2, '0'));
  setText('#massTotal', totalMass.toLocaleString('en-US'));
  setText('#massCode', product.massCode || 'SYS-001');
  setText('#massCaption', product.massCaption || 'TOTAL ASSEMBLY');
  setText('#bootName', `${product.name || 'PRODUCT'} / ${product.cn || '产品'}`);
  setText('#stageThemeName', (DESIGN.label || 'Aerolab').toUpperCase());
  const motif = DESIGN.motif || 'orbit';
  const motifUse = $('#stageMotifUse');
  if (motifUse) motifUse.setAttribute('href', `#i-${motif}`);
  document.title = `${product.name || 'Product'} · Exploded View Studio`;

  /* -------------------------------------------------------------- renderer */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  function syncPixelRatio() {
    const cap = isCompactView() ? 2.5 : 1.75;
    const ratio = Math.min(window.devicePixelRatio || 1, cap);
    if (Math.abs(renderer.getPixelRatio() - ratio) > 0.01) renderer.setPixelRatio(ratio);
  }
  syncPixelRatio();
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = Number(DESIGN.scene.exposure) || 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(DESIGN.scene.background || 0x070a0d);
  scene.fog = new THREE.Fog(DESIGN.scene.fog || 0x070a0d, 17, 37);
  const camera = new THREE.PerspectiveCamera(Number(spec.camera?.fov) || 34, 1, 0.05, 120);

  /* -------------------------------------------------------------- materials */
  const palette = spec.palette || {};
  const accentColor = new THREE.Color(DESIGN.colors.accent || 0xff6b2c);
  const altColor = new THREE.Color(DESIGN.colors.alt || 0x58d8ff);
  const bodyRoughness = Number.isFinite(Number(DESIGN.scene?.bodyRoughness)) ? Number(DESIGN.scene.bodyRoughness) : 0.48;
  const bodyMetalness = Number.isFinite(Number(DESIGN.scene?.bodyMetalness)) ? Number(DESIGN.scene.bodyMetalness) : 0.48;
  const materialOptions = (options) => new THREE.MeshStandardMaterial({
    side: THREE.FrontSide,
    envMapIntensity: 0.55,
    ...options
  });

  // Soft contact shadow without a real shadow catcher (avoiding a large
  // ShadowMaterial disc on grid/plain backdrops).
  function makeContactShadowTexture() {
    const surface = document.createElement('canvas');
    surface.width = 256;
    surface.height = 256;
    const ctx = surface.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 6, 128, 128, 126);
    gradient.addColorStop(0, 'rgba(0,0,0,0.72)');
    gradient.addColorStop(0.34, 'rgba(0,0,0,0.34)');
    gradient.addColorStop(0.7, 'rgba(0,0,0,0.08)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  const contactShadowTexture = makeContactShadowTexture();

  // Small deterministic micro-surface map: keeps close-up surfaces from
  // reading as flat color when the user pinch-zooms on a phone.
  function makeMicroSurfaceTexture() {
    const surface = document.createElement('canvas');
    surface.width = 256;
    surface.height = 256;
    const ctx = surface.getContext('2d');
    const image = ctx.createImageData(256, 256);
    for (let y = 0; y < 256; y += 1) {
      for (let x = 0; x < 256; x += 1) {
        const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const grain = (noise - Math.floor(noise)) * 18;
        const brushed = Math.sin(y * 0.42) * 3;
        const value = clamp(124 + grain + brushed, 96, 154);
        const offset = (y * 256 + x) * 4;
        image.data[offset] = value;
        image.data[offset + 1] = value;
        image.data[offset + 2] = value;
        image.data[offset + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(surface);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  const microSurface = makeMicroSurfaceTexture();

  const M = {
    body: materialOptions({ color: palette.body || 0x37424b, roughness: bodyRoughness, metalness: bodyMetalness, bumpMap: microSurface, bumpScale: 0.004 }),
    bodyLight: materialOptions({ color: palette.bodyLight || 0x71808b, roughness: 0.4, metalness: 0.5, bumpMap: microSurface, bumpScale: 0.0025 }),
    dark: materialOptions({ color: palette.dark || 0x12171d, roughness: 0.62, metalness: 0.32, bumpMap: microSurface, bumpScale: 0.002 }),
    black: materialOptions({ color: 0x0a0d10, roughness: 0.78, metalness: 0.11 }),
    prop: materialOptions({ color: 0x2a343b, roughness: 0.7, metalness: 0.08 }),
    silver: materialOptions({ color: 0x9ba8b0, roughness: 0.3, metalness: 0.7, bumpMap: microSurface, bumpScale: 0.002 }),
    steel: materialOptions({ color: 0x59666f, roughness: 0.34, metalness: 0.76, bumpMap: microSurface, bumpScale: 0.002 }),
    rubber: materialOptions({ color: 0x101417, roughness: 0.97, metalness: 0.01 }),
    copper: materialOptions({ color: 0xb96b36, roughness: 0.34, metalness: 0.8 }),
    pcb: materialOptions({ color: 0x163c35, roughness: 0.64, metalness: 0.08 }),
    pcbLight: materialOptions({ color: 0x266b55, roughness: 0.55, metalness: 0.08 }),
    chip: materialOptions({ color: 0x22292f, roughness: 0.46, metalness: 0.46 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x77bfd5, roughness: 0.04, metalness: 0.16, transparent: true,
      opacity: 0.28, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.2,
      side: THREE.DoubleSide, depthWrite: false
    }),
    sensor: new THREE.MeshStandardMaterial({
      color: 0x071926, roughness: 0.22, metalness: 0.68,
      emissive: 0x0a4d66, emissiveIntensity: 0.28
    }),
    accent: materialOptions({
      color: palette.accent || accentColor,
      roughness: 0.5, metalness: 0.16,
      emissive: accentColor.clone().multiplyScalar(0.18), emissiveIntensity: 0.22
    }),
    cyan: materialOptions({
      color: palette.cyan || altColor,
      roughness: 0.36, metalness: 0.24,
      emissive: altColor.clone().multiplyScalar(0.22), emissiveIntensity: 0.55
    }),
    white: materialOptions({ color: 0xd7e1e4, roughness: 0.52, metalness: 0.08 }),
    floor: new THREE.MeshStandardMaterial({ color: DESIGN.scene.floor || 0x090e13, roughness: 0.82, metalness: 0.2 })
  };

  /* --------------------------------------------------------------- helpers */
  const reusableBox = new THREE.Box3();
  const reusableSphere = new THREE.Sphere();
  const tmpVector = new THREE.Vector3();
  const tmpMatrix = new THREE.Matrix4();

  function geometryFor(part) {
    const segments = Math.max(8, Math.min(64, Number(part.segments) || 32));
    switch (part.type || 'box') {
      case 'cylinder':
        return new THREE.CylinderGeometry(
          Number(part.radiusTop ?? part.radius ?? 0.25),
          Number(part.radiusBottom ?? part.radius ?? 0.25),
          Number(part.height ?? 0.6), segments, 1, false
        );
      case 'cone':
        return new THREE.ConeGeometry(Number(part.radius ?? 0.3), Number(part.height ?? 0.7), segments);
      case 'sphere':
        return new THREE.SphereGeometry(Number(part.radius ?? 0.3), segments, Math.max(8, Math.round(segments * 0.55)));
      case 'torus':
        return new THREE.TorusGeometry(Number(part.radius ?? 0.35), Number(part.tube ?? 0.04), Math.max(6, Math.round(segments * 0.4)), segments);
      case 'ring':
        return new THREE.RingGeometry(Number(part.inner ?? 0.3), Number(part.outer ?? 0.36), segments);
      case 'plane':
        return new THREE.PlaneGeometry(Number(part.width ?? 0.5), Number(part.height ?? 0.5));
      case 'tube': {
        const points = (part.points || []).map(p => new THREE.Vector3(...p));
        if (points.length < 2) return new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const curve = new THREE.CatmullRomCurve3(points);
        return new THREE.TubeGeometry(curve, Math.max(8, Number(part.tubularSegments) || 32), Number(part.radius ?? 0.02), Math.max(4, Number(part.radialSegments) || 8), false);
      }
      default: {
        const size = part.size || [0.4, 0.4, 0.4];
        return new THREE.BoxGeometry(size[0], size[1], size[2]);
      }
    }
  }

  function buildPart(part) {
    const material = M[part.mat] || M.body;
    const mesh = new THREE.Mesh(geometryFor(part), material);
    mesh.position.fromArray(part.pos || [0, 0, 0]);
    if (part.axis === 'z') mesh.rotation.x = Math.PI / 2;
    if (part.axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (part.rot) mesh.rotation.set(part.rot[0], part.rot[1], part.rot[2]);
    if (part.scale) mesh.scale.fromArray(part.scale);
    mesh.castShadow = part.shadow !== false;
    mesh.receiveShadow = part.shadow !== false;
    return mesh;
  }

  /* ---------------------------------------------------------------- scene */
  const hemi = new THREE.HemisphereLight(
    DESIGN.scene.hemiSky || 0x9dbdca,
    DESIGN.scene.hemiGround || 0x070b0f,
    Number(DESIGN.scene.hemiIntensity) || 0.65
  );
  scene.add(hemi);
  const ambientIntensity = Number(DESIGN.scene.ambientIntensity) || 0;
  if (ambientIntensity > 0) {
    scene.add(new THREE.AmbientLight(DESIGN.scene.ambient || 0xffffff, ambientIntensity));
  }
  const key = new THREE.DirectionalLight(DESIGN.scene.key || 0xfff4ea, Number(DESIGN.scene.keyIntensity) || 2.5);
  key.position.set(5.6, 9.2, 6.1);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -7;
  key.shadow.camera.right = 7;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -7;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight(DESIGN.scene.rim || 0x58d8ff, Number(DESIGN.scene.rimIntensity) || 1.1);
  rim.position.set(-6.4, 3.6, -5.5);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(DESIGN.scene.fill || 0xffb58a, Number(DESIGN.scene.fillIntensity) || 0.46);
  fill.position.set(5.1, 1.5, 5.8);
  scene.add(fill);
  const topPoint = new THREE.PointLight(DESIGN.scene.top || 0x74c7e2, Number(DESIGN.scene.topIntensity) || 2.4, 18, 2);
  topPoint.position.set(0, 5.8, 1.7);
  scene.add(topPoint);

  const floorGroup = new THREE.Group();
  scene.add(floorGroup);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(20, 96), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floorGroup.add(floor);
  // Grid/plain themes hide the colored floor so the CSS backdrop remains visible.
  // A soft procedural contact shadow grounds the model without a hard disc.
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: makeContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      color: 0xffffff,
      opacity: DESIGN.mode === 'light' ? 0.2 : 0.46
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.003;
  floorGroup.add(contactShadow);
  const floorRing = new THREE.Mesh(
    new THREE.RingGeometry(2.72, 2.765, 120),
    new THREE.MeshBasicMaterial({ color: DESIGN.colors.accent || 0xff6b2c, transparent: true, opacity: Number(DESIGN.scene.ringOpacity) || 0.25, side: THREE.DoubleSide, depthWrite: false })
  );
  floorRing.rotation.x = -Math.PI / 2;
  floorGroup.add(floorRing);
  const floorRingCyan = new THREE.Mesh(
    new THREE.RingGeometry(2.15, 2.18, 120),
    new THREE.MeshBasicMaterial({ color: DESIGN.colors.alt || 0x58d8ff, transparent: true, opacity: Number(DESIGN.scene.ring2Opacity) || 0.14, side: THREE.DoubleSide, depthWrite: false })
  );
  floorRingCyan.rotation.x = -Math.PI / 2;
  floorGroup.add(floorRingCyan);
  // A quiet scanning ring, built from a thin torus to avoid extra textures.
  const scanRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.44, 0.006, 6, 140),
    new THREE.MeshBasicMaterial({ color: DESIGN.colors.scan || 0xdfeef2, transparent: true, opacity: Number(DESIGN.scene.scanOpacity) || 0.16, depthWrite: false })
  );
  scanRing.rotation.x = Math.PI / 2;
  floorGroup.add(scanRing);

  const showFloor = DESIGN.backdrop !== 'plain';
  const showGround = DESIGN.backdrop === 'rings' || DESIGN.backdrop === 'horizon';
  const showRings = showGround;
  floorGroup.visible = showFloor;
  floor.visible = showGround;
  contactShadow.visible = showFloor && !showGround;
  floorRing.visible = showRings;
  floorRingCyan.visible = showRings;
  scanRing.visible = showRings;

  // Low-cost dust; deterministic distribution, no per-frame allocation.
  const dustCount = 90;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    const angle = i * 2.399963;
    const radius = 1.2 + ((i * 0.618033) % 1) * 4.8;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = -0.55 + ((i * 0.381966) % 1) * 2.8;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({ color: DESIGN.scene.dust || 0x6d94a2, size: 0.012, transparent: true, opacity: DESIGN.backdrop === 'plain' ? 0 : 0.42, depthWrite: false, sizeAttenuation: true })
  );
  dust.visible = DESIGN.backdrop !== 'plain';
  scene.add(dust);

  /* --------------------------------------------------------------- model */
  const world = new THREE.Group();
  scene.add(world);
  const modules = [];
  const selectable = [];
  const anchors = [];

  modulesData.forEach((data, index) => {
    const group = new THREE.Group();
    group.position.fromArray(data.base || [0, 0, 0]);
    group.userData.moduleId = data.id;
    const parts = Array.isArray(data.parts) && data.parts.length ? data.parts : [{ type: 'box', size: [0.5, 0.3, 0.5], mat: 'body' }];
    parts.forEach(part => group.add(buildPart(part)));

    const anchor = new THREE.Object3D();
    anchor.position.fromArray(data.anchor || [0, 0, 0]);
    group.add(anchor);

    group.traverse(child => {
      if (child.isMesh) {
        child.userData.moduleId = data.id;
        selectable.push(child);
      }
    });
    world.add(group);
    modules.push({
      data,
      group,
      anchor,
      base: new THREE.Vector3().fromArray(data.base || [0, 0, 0]),
      offset: new THREE.Vector3().fromArray(data.offset || [0, 0, 0]),
      state: 0,
      index
    });
    anchors.push(anchor);
  });

  /*
   * Keep the stage under the assembly, even while downward modules are
   * travelling. The old version anchored the floor to the assembled bounding
   * box once, so modules with a negative explode Y crossed the platform and
   * visually sank through it. baseMinY is measured once at assemble time; the
   * animation loop lowers the floor to the current lowest module instead.
   */
  world.updateMatrixWorld(true);
  const assembledFloorY = (() => {
    const box = new THREE.Box3().setFromObject(world);
    return box.isEmpty() ? 0 : box.min.y;
  })();
  modules.forEach(module => {
    reusableBox.setFromObject(module.group);
    module.baseMinY = reusableBox.isEmpty() ? assembledFloorY : reusableBox.min.y;
  });

  /* Exploded-path connectors: a single dynamic LineSegments buffer, no adds. */
  const connectorPositions = new Float32Array(modules.length * 6);
  modules.forEach((module, index) => {
    const base = module.base;
    connectorPositions[index * 6] = base.x;
    connectorPositions[index * 6 + 1] = base.y;
    connectorPositions[index * 6 + 2] = base.z;
    connectorPositions[index * 6 + 3] = base.x;
    connectorPositions[index * 6 + 4] = base.y;
    connectorPositions[index * 6 + 5] = base.z;
  });
  const connectorGeometry = new THREE.BufferGeometry();
  connectorGeometry.setAttribute('position', new THREE.BufferAttribute(connectorPositions, 3));
  const connectorMaterial = new THREE.LineBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    toneMapped: false
  });
  const connectorLines = new THREE.LineSegments(connectorGeometry, connectorMaterial);
  connectorLines.frustumCulled = false;
  connectorLines.visible = false;
  world.add(connectorLines);

  /*
   * Construction grammar: each product gets a different order in which its
   * modules leave the assembly. The delay is normalised so the whole sequence
   * lands at 100% explode instead of drifting forever.
   */
  function applyChoreography() {
    const order = IDENTITY.motion.order || 'linear';
    const ranked = modules.slice();
    if (order === 'optical') {
      ranked.sort((a, b) => b.offset.z - a.offset.z || a.index - b.index);
    } else if (order === 'radial') {
      ranked.sort((a, b) => {
        const angleA = Math.atan2(a.base.z, a.base.x);
        const angleB = Math.atan2(b.base.z, b.base.x);
        return angleA - angleB || a.index - b.index;
      });
    } else if (order === 'layered') {
      ranked.sort((a, b) => b.base.y - a.base.y || a.index - b.index);
    } else if (order === 'circular') {
      ranked.sort((a, b) => Math.atan2(a.base.z, a.base.x) - Math.atan2(b.base.z, b.base.x) || a.index - b.index);
    } else if (order === 'scan') {
      ranked.sort((a, b) => a.base.y - b.base.y || a.index - b.index);
    } else if (order === 'kinematic') {
      ranked.sort((a, b) => a.base.y - b.base.y || a.index - b.index);
    }
    const stagger = clamp(Number(IDENTITY.motion.stagger) || 0, 0, 0.2);
    const span = Math.min(0.58, stagger * Math.max(0, ranked.length - 1));
    ranked.forEach((module, rank) => {
      module.orderRank = rank;
      module.delay = ranked.length > 1 ? (rank / (ranked.length - 1)) * span : 0;
    });
  }
  applyChoreography();

  /* --------------------------------------------------------------- layout */
  const fitPadding = Number(spec.camera?.fitPadding) || 1.08;
  const fit = { radius: 7, explodedRadius: 10, ratio: 1.35, center: new THREE.Vector3() };

  function measureFit() {
    world.updateMatrixWorld(true);
    const assembledBox = new THREE.Box3().setFromObject(world);
    const explodedBox = assembledBox.clone();
    modules.forEach(module => {
      reusableBox.setFromObject(module.group);
      if (reusableBox.isEmpty()) return;
      reusableBox.min.add(module.offset);
      reusableBox.max.add(module.offset);
      explodedBox.union(reusableBox);
    });
    if (assembledBox.isEmpty()) return;
    const assembledSphere = assembledBox.getBoundingSphere(new THREE.Sphere());
    const explodedSphere = explodedBox.getBoundingSphere(new THREE.Sphere());

    camera.updateProjectionMatrix();
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.45));
    const minFov = Math.min(vFov, hFov);
    fit.radius = clamp((assembledSphere.radius / Math.sin(minFov / 2)) * fitPadding, 2.2, 36);
    fit.explodedRadius = clamp((explodedSphere.radius / Math.sin(minFov / 2)) * fitPadding, fit.radius, 42);
    fit.ratio = fit.explodedRadius / Math.max(fit.radius, 0.001);
    fit.center.copy(assembledSphere.center);
    fit.center.y += assembledSphere.radius * 0.055;
    contactShadow.scale.setScalar(Math.max(1.2, assembledSphere.radius * 1.45));
    floorGroup.position.y = assembledBox.min.y - 0.12;
    key.shadow.camera.top = Math.max(5, assembledSphere.radius * 2.6);
    key.shadow.camera.bottom = -key.shadow.camera.top;
    key.shadow.camera.left = -key.shadow.camera.top;
    key.shadow.camera.right = key.shadow.camera.top;
    key.shadow.camera.updateProjectionMatrix();
    return fit;
  }

  const cameraConfig = spec.camera || {};
  const rig = {
    theta: Number(cameraConfig.theta) || 0.75,
    phi: clamp(Number(cameraConfig.phi) || 1.12, 0.2, 1.47),
    radius: 7,
    target: new THREE.Vector3(...(cameraConfig.target || [0, 0, 0])),
    goalTheta: Number(cameraConfig.theta) || 0.75,
    goalPhi: clamp(Number(cameraConfig.phi) || 1.12, 0.2, 1.47),
    goalRadius: 7,
    goalTarget: new THREE.Vector3(...(cameraConfig.target || [0, 0, 0])),
    minRadius: Number(cameraConfig.minRadius) || 2.2,
    maxRadius: Number(cameraConfig.maxRadius) || 34,
    minVisibleRadius: 1.2,
    maxVisibleRadius: 20,
    explodeRatio: 1.35,
    update(dt) {
      this.theta = damp(this.theta, this.goalTheta, 8.5, dt);
      this.phi = damp(this.phi, this.goalPhi, 8.5, dt);
      this.radius = damp(this.radius, this.goalRadius, 7.5, dt);
      this.radius = clamp(this.radius, this.minVisibleRadius, this.maxVisibleRadius);
      this.goalRadius = clamp(this.goalRadius, this.minRadius, this.maxRadius);
      this.target.x = damp(this.target.x, this.goalTarget.x, 8.5, dt);
      this.target.y = damp(this.target.y, this.goalTarget.y, 8.5, dt);
      this.target.z = damp(this.target.z, this.goalTarget.z, 8.5, dt);
      const requested = this.radius * (1 + explodeCurrent * (this.explodeRatio - 1));
      const radius = clamp(requested, this.minVisibleRadius, this.maxVisibleRadius);
      const sinPhi = Math.sin(this.phi);
      camera.position.set(
        this.target.x + radius * sinPhi * Math.sin(this.theta),
        this.target.y + radius * Math.cos(this.phi),
        this.target.z + radius * sinPhi * Math.cos(this.theta)
      );
      camera.lookAt(this.target);
    }
  };

  function applyFit(force) {
    measureFit();
    rig.explodeRatio = fit.ratio;
    rig.minVisibleRadius = Math.max(1.1, fit.radius * 0.30);
    rig.maxVisibleRadius = Math.max(fit.radius * 1.05, Math.min(20, fit.explodedRadius * 1.12));
    rig.minRadius = Math.max(1.2, fit.radius * 0.38);
    // Base radius is clamped to the same visible limit; update() also clamps
    // radius*explodeRatio so an exploded view can never zoom into black.
    rig.maxRadius = rig.maxVisibleRadius;
    if (force || !userAdjusted) {
      rig.radius = fit.radius;
      rig.goalRadius = fit.radius;
      rig.target.copy(fit.center);
      rig.goalTarget.copy(fit.center);
    }
    if (scene.fog) {
      scene.fog.near = Math.max(12, fit.radius * 1.35);
      scene.fog.far = Math.max(scene.fog.near + 18, fit.explodedRadius * 2.2);
    }
  }

  const views = {};
  const baseViews = {
    iso: { theta: rig.theta, phi: rig.phi, zoom: 0.98, label: 'ISO' },
    top: { theta: 0.02, phi: 0.2, zoom: 0.96, label: 'TOP' },
    front: { theta: 0, phi: 1.34, zoom: 0.92, label: 'FRONT' }
  };
  IDENTITY.views.forEach((view, index) => {
    const key = ['iso', 'top', 'front'][index];
    if (!key) return;
    views[key] = {
      ...baseViews[key],
      ...view,
      label: String(view.label || baseViews[key].label).toUpperCase()
    };
    const label = $(`.view-btn[data-view="${key}"] .view-label`);
    if (label) label.textContent = views[key].label;
  });
  let currentView = 'iso';
  let userAdjusted = false;
  let selectedId = modules[0]?.data.id || '01';
  let hoveredId = null;
  let explodeTarget = 0;
  let explodeCurrent = 0;
  let autoOrbit = false;
  let bootComplete = false;
  let rafId = 0;
  let lastFrame = performance.now();
  let lastHoverCheck = 0;
  let initialized = false;

  /* ------------------------------------------------------------------- UI */
  const pinByModule = new Map();
  const rowById = new Map();

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function moduleShare(module) {
    return Math.max(0.1, (Number(module.data.mass) || 0) / totalMass * 100);
  }

  function buildList() {
    moduleList.innerHTML = '';
    modules.forEach(module => {
      const data = module.data;
      const row = document.createElement('button');
      row.className = 'module-row';
      row.type = 'button';
      row.dataset.id = data.id;
      row.setAttribute('role', 'option');
      row.innerHTML = `
        <span class="module-num">${escapeHtml(data.id)}</span>
        <span class="module-copy"><strong>${escapeHtml(data.title)}</strong><small>${escapeHtml(data.en || data.code || '')}</small></span>
        <span class="module-mass"><b>${Number(data.mass || 0).toLocaleString('en-US')}</b> g</span>
        <span class="module-arrow"><svg class="icon"><use href="#i-chevron-right"></use></svg></span>`;
      row.addEventListener('click', () => selectModule(data.id));
      row.addEventListener('pointerenter', () => { hoveredId = data.id; syncHover(); });
      row.addEventListener('pointerleave', () => { if (hoveredId === data.id) { hoveredId = null; syncHover(); } });
      moduleList.appendChild(row);
      rowById.set(data.id, row);
    });
    if (DESIGN.layout === 'atlas') {
      if (modules.length <= 8) {
        moduleList.style.gridTemplateColumns = `repeat(${Math.max(1, Math.ceil(modules.length / 2))}, minmax(0, 1fr))`;
      } else {
        moduleList.classList.add('is-filmstrip');
        moduleList.style.gridTemplateColumns = `repeat(${modules.length}, 174px)`;
      }
    }
  }

  function buildPins() {
    pinsRoot.innerHTML = '';
    modules.forEach(module => {
      const pin = document.createElement('button');
      pin.className = 'pin';
      pin.type = 'button';
      pin.dataset.id = module.data.id;
      pin.setAttribute('aria-label', `${module.data.title} ${module.data.mass} g`);
      pin.innerHTML = `<span class="pin-dot"></span><span class="pin-index">${escapeHtml(module.data.id)}</span><span class="pin-label"><strong>${escapeHtml(module.data.title)}</strong><small>${escapeHtml(module.data.id)} / ${Number(module.data.mass || 0)} g</small></span>`;
      pin.addEventListener('click', event => { event.stopPropagation(); selectModule(module.data.id); });
      pin.addEventListener('pointerenter', () => { hoveredId = module.data.id; syncHover(); });
      pin.addEventListener('pointerleave', () => { if (hoveredId === module.data.id) { hoveredId = null; syncHover(); } });
      pinsRoot.appendChild(pin);
      pinByModule.set(module.data.id, pin);
    });
  }

  function renderInspector() {
    const module = modules.find(item => item.data.id === selectedId) || modules[0];
    if (!module) {
      inspector.innerHTML = '<p class="ins-empty">NO MODULE SELECTED</p>';
      return;
    }
    const data = module.data;
    const specs = Array.isArray(data.specs) ? data.specs.slice(0, 8) : [];
    const components = Array.isArray(data.components) ? data.components.slice(0, 8) : [];
    const share = moduleShare(module);
    inspector.innerHTML = `
      <div class="ins-topline"><span>${escapeHtml(data.code || 'MODULE')} / ${escapeHtml(data.id)}</span><em>· CALIBRATED</em></div>
      <div class="ins-head">
        <div class="ins-title-group">
          <div class="ins-code">MODULE ${escapeHtml(data.id)} · ${escapeHtml(data.category || 'ASSEMBLY')}</div>
          <h2 class="ins-title">${escapeHtml(data.title)}</h2>
          <div class="ins-en">${escapeHtml(data.en || '')}</div>
        </div>
        <div class="ins-index">${escapeHtml(data.id)}</div>
      </div>
      <p class="ins-desc">${escapeHtml(data.description || '')}</p>
      <div class="ins-mass">
        <div class="ins-mass-top"><span>MODULE MASS / ${escapeHtml(data.code || '')}</span><b>${share.toFixed(1)}% TOTAL</b></div>
        <div class="ins-mass-value"><strong>${Number(data.mass || 0).toLocaleString('en-US')}</strong><span>g</span></div>
        <div class="ins-mass-track"><i style="width:${share.toFixed(1)}%"></i></div>
        <div class="ins-mass-foot"><span>SYSTEM MASS ${totalMass.toLocaleString('en-US')} G</span><span>${escapeHtml(data.category || 'ASSEMBLY')}</span></div>
      </div>
      ${specs.length ? `<div class="ins-section-label"><span>TECHNICAL SPEC</span><span>${specs.length} FIELDS</span></div><div class="ins-specs">${specs.map(pair => `<div class="ins-spec"><span>${escapeHtml(pair[0])}</span><strong>${escapeHtml(pair[1])}</strong></div>`).join('')}</div>` : ''}
      ${components.length ? `<div class="ins-section-label"><span>INCLUDED COMPONENTS</span><span>${components.length}</span></div><div class="ins-chips">${components.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join('')}</div>` : ''}
      ${data.insight ? `<p class="ins-note"><b>ENGINEERING NOTE</b>${escapeHtml(data.insight)}</p>` : ''}
      <div class="ins-actions">
        <button class="ins-btn primary" data-ins-act="focus"><svg class="icon"><use href="#i-focus"></use></svg>聚焦查看</button>
        <button class="ins-btn" data-ins-act="next"><svg class="icon"><use href="#i-chevron-right"></use></svg>下一模块</button>
      </div>`;
  }

  function syncSelection() {
    modules.forEach(module => {
      const active = module.data.id === selectedId;
      const row = rowById.get(module.data.id);
      const pin = pinByModule.get(module.data.id);
      if (row) {
        row.classList.toggle('is-active', active);
        row.setAttribute('aria-selected', String(active));
      }
      if (pin) pin.classList.toggle('is-selected', active);
    });
  }

  function syncHover() {
    modules.forEach(module => {
      const pin = pinByModule.get(module.data.id);
      if (pin) pin.classList.toggle('is-hover', module.data.id === hoveredId);
    });
  }

  function selectModule(id, options = {}) {
    if (!id || !modules.some(module => module.data.id === id)) return;
    selectedId = id;
    syncSelection();
    syncHover();
    renderInspector();
    if (options.focus) focusModule(id);
  }

  function focusModule(id) {
    const module = modules.find(item => item.data.id === id);
    if (!module) return;
    world.updateMatrixWorld(true);
    reusableBox.setFromObject(module.group);
    if (reusableBox.isEmpty()) return;
    reusableBox.getCenter(tmpVector);
    const sphere = reusableBox.getBoundingSphere(reusableSphere);
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(camera.aspect, 0.45));
    const radius = clamp((sphere.radius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.16, 1.9, 18);
    rig.goalTarget.copy(tmpVector);
    rig.goalRadius = radius;
    rig.goalTheta = rig.theta + 0.12;
    rig.goalPhi = clamp(rig.phi - 0.03, 0.35, 1.4);
    userAdjusted = true;
  }

  function setExplodeTarget(value) {
    explodeTarget = clamp(Number(value) || 0, 0, 1);
    const percent = Math.round(explodeTarget * 100);
    setText('#explodeValue', `${percent}%`);
    setText('#separationReadout', String(percent).padStart(2, '0') + '%');
    setText('#explodeState', String(percent).padStart(2, '0'));
    const button = $('#explodeBtn');
    button.classList.toggle('is-active', explodeTarget > 0.5);
    button.setAttribute('aria-pressed', String(explodeTarget > 0.5));
    setText('#explodeLabel', explodeTarget > 0.5 ? IDENTITY.actions.assemble : IDENTITY.actions.explode);
    const range = $('#explodeRange');
    range.value = percent;
    range.style.setProperty('--fill', `${percent}%`);
    if (explodeTarget > 0) autoOrbit = false, syncAuto();
  }

  function syncAuto() {
    const button = $('#autoBtn');
    button.classList.toggle('is-active', autoOrbit);
    button.setAttribute('aria-pressed', String(autoOrbit));
  }

  function resetAll() {
    selectedId = modules[0]?.data.id || '01';
    setExplodeTarget(0);
    autoOrbit = false;
    userAdjusted = false;
    applyFit(true);
    rig.goalTheta = Number(cameraConfig.theta) || 0.75;
    rig.goalPhi = clamp(Number(cameraConfig.phi) || 1.12, 0.2, 1.47);
    rig.goalRadius = fit.radius;
    rig.goalTarget.copy(fit.center);
    setView('iso', false);
    syncSelection();
    renderInspector();
    syncAuto();
  }

  function setView(name, markActive = true) {
    if (name === 'reset') {
      resetAll();
      return;
    }
    const view = views[name];
    if (!view) return;
    rig.goalTheta = view.theta;
    rig.goalPhi = view.phi;
    const zoom = clamp(Number(view.zoom) || 0.98, 0.42, 1.6);
    rig.goalRadius = clamp(fit.radius * zoom, rig.minRadius, rig.maxRadius);
    if (Array.isArray(view.target) && view.target.length === 3) {
      rig.goalTarget.fromArray(view.target);
    } else {
      rig.goalTarget.copy(fit.center);
    }
    userAdjusted = true;
    currentView = name;
    if (markActive) {
      $$('.view-btn').forEach(button => button.classList.toggle('is-active', button.dataset.view === name));
    }
  }

  /* ------------------------------------------------------------ interaction */
  const pointer = {
    active: false, id: null, startX: 0, startY: 0, lastX: 0, lastY: 0,
    moved: 0, downAt: 0, dragging: false
  };
  const touchState = { pinching: false, startDistance: 0, startRadius: 0 };
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();

  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(selectable, false);
    for (const hit of hits) {
      if (hit.object.visible) return hit.object.userData.moduleId || null;
    }
    return null;
  }

  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || touchState.pinching) return;
    if (event.pointerType === 'touch' && !event.isPrimary) return;
    pointer.active = true;
    pointer.id = event.pointerId;
    pointer.startX = pointer.lastX = event.clientX;
    pointer.startY = pointer.lastY = event.clientY;
    pointer.moved = 0;
    pointer.downAt = performance.now();
    pointer.dragging = true;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  });

  canvas.addEventListener('pointermove', event => {
    if (touchState.pinching) return;
    if (pointer.active && event.pointerId === pointer.id) {
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.moved += Math.abs(dx) + Math.abs(dy);
      if (pointer.moved > 4) {
        rig.goalTheta -= dx * 0.0062;
        rig.goalPhi = clamp(rig.goalPhi - dy * 0.0052, 0.2, 1.46);
        userAdjusted = true;
        autoOrbit = false;
        syncAuto();
      }
      return;
    }
    const now = performance.now();
    if (now - lastHoverCheck < 65) return;
    lastHoverCheck = now;
    const id = pickAt(event.clientX, event.clientY);
    const nextHover = id;
    if (nextHover !== hoveredId) {
      hoveredId = nextHover;
      syncHover();
    }
    canvas.style.cursor = id ? 'pointer' : '';
  });

  function endPointer(event, canceled = false) {
    if (!pointer.active || event.pointerId !== pointer.id) return;
    const elapsed = performance.now() - pointer.downAt;
    pointer.active = false;
    pointer.dragging = false;
    canvas.classList.remove('is-dragging');
    try { canvas.releasePointerCapture(event.pointerId); } catch (_) { /* no-op */ }
    if (!canceled && pointer.moved < 5 && elapsed < 600) {
      const id = pickAt(event.clientX, event.clientY);
      if (id) selectModule(id);
    }
  }

  canvas.addEventListener('pointerup', event => endPointer(event, false));
  canvas.addEventListener('pointercancel', event => endPointer(event, true));
  canvas.addEventListener('contextmenu', event => event.preventDefault());
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    const next = clamp(rig.goalRadius * Math.exp(event.deltaY * 0.0011), rig.minRadius, rig.maxRadius);
    rig.goalRadius = next;
    userAdjusted = true;
    autoOrbit = false;
    syncAuto();
  }, { passive: false });

  const touchDistance = touches => Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
  canvas.addEventListener('touchstart', event => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    touchState.pinching = true;
    touchState.startDistance = Math.max(1, touchDistance(event.touches));
    touchState.startRadius = rig.goalRadius;
    pointer.active = false;
    pointer.dragging = false;
    canvas.classList.remove('is-dragging');
  }, { passive: false });
  canvas.addEventListener('touchmove', event => {
    if (!touchState.pinching || event.touches.length < 2) return;
    event.preventDefault();
    const distance = Math.max(1, touchDistance(event.touches));
    const ratio = touchState.startDistance / distance;
    rig.goalRadius = clamp(touchState.startRadius * ratio, rig.minRadius, rig.maxRadius);
    userAdjusted = true;
    autoOrbit = false;
    syncAuto();
  }, { passive: false });
  canvas.addEventListener('touchend', event => {
    if (event.touches.length < 2) touchState.pinching = false;
  }, { passive: true });

  $('#explodeBtn').addEventListener('click', () => setExplodeTarget(explodeTarget > 0.5 ? 0 : 1));
  $('#explodeRange').addEventListener('input', event => setExplodeTarget(Number(event.target.value) / 100));
  $('#autoBtn').addEventListener('click', () => { autoOrbit = !autoOrbit; syncAuto(); });
  $('#resetBtn').addEventListener('click', resetAll);
  $$('.view-btn').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  inspector.addEventListener('click', event => {
    const button = event.target.closest('[data-ins-act]');
    if (!button) return;
    const index = modules.findIndex(module => module.data.id === selectedId);
    if (button.dataset.insAct === 'focus') focusModule(selectedId);
    if (button.dataset.insAct === 'next') selectModule(modules[(index + 1) % modules.length].data.id);
  });
  document.addEventListener('keydown', event => {
    if (event.target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight') { const index = modules.findIndex(m => m.data.id === selectedId); selectModule(modules[(index + 1) % modules.length].data.id); }
    else if (event.key === 'ArrowLeft') { const index = modules.findIndex(m => m.data.id === selectedId); selectModule(modules[(index - 1 + modules.length) % modules.length].data.id); }
    else if (/^[0-9]$/.test(event.key)) { const index = event.key === '0' ? 9 : Number(event.key) - 1; if (modules[index]) selectModule(modules[index].data.id); }
    else if (event.key.toLowerCase() === 'e') setExplodeTarget(explodeTarget > 0.5 ? 0 : 1);
    else if (event.key.toLowerCase() === 'r') resetAll();
    else if (event.key.toLowerCase() === 'f') focusModule(selectedId);
    else if (event.key === ' ') { event.preventDefault(); autoOrbit = !autoOrbit; syncAuto(); }
  });

  /* ------------------------------------------------------------------ pins */
  function updatePins() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const halfW = width / 2;
    const halfH = height / 2;
    const compact = isCompactView();
    modules.forEach(module => {
      const pin = pinByModule.get(module.data.id);
      if (!pin) return;
      module.anchor.getWorldPosition(tmpVector);
      tmpVector.project(camera);
      const inFrame = tmpVector.z < 1 && tmpVector.z > -1 && Math.abs(tmpVector.x) < 1.2 && Math.abs(tmpVector.y) < 1.2;
      // On phones/tablets only the selected (or hovered) anchor is actionable.
      // Ten overview pins read as noise and obscure the model.
      const visible = inFrame && (!compact || module.data.id === selectedId || module.data.id === hoveredId);
      pin.style.display = visible ? 'grid' : 'none';
      if (!visible) return;
      const x = tmpVector.x * halfW + halfW;
      const y = -tmpVector.y * halfH + halfH;
      pin.style.left = `${x.toFixed(1)}px`;
      pin.style.top = `${y.toFixed(1)}px`;
      pin.classList.toggle('is-flipped', x > width - 150);
    });
  }

  /* ------------------------------------------------------------- render loop */
  function resize() {
    const width = Math.max(1, stage.clientWidth);
    const height = Math.max(1, stage.clientHeight);
    syncPixelRatio();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    measureFit();
    if (!userAdjusted) {
      rig.radius = fit.radius;
      rig.goalRadius = fit.radius;
      rig.target.copy(fit.center);
      rig.goalTarget.copy(fit.center);
    }
    rig.explodeRatio = fit.ratio;
    initialized = true;
  }

  let resizeFrame = 0;
  function scheduleResize() {
    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      resize();
    });
  }

  function updateClock() {
    const now = new Date();
    setText('#clock', [now.getHours(), now.getMinutes(), now.getSeconds()].map(value => String(value).padStart(2, '0')).join(':'));
  }
  updateClock();
  setInterval(updateClock, 1000);

  let fpsFrames = 0;
  let fpsElapsed = 0;
  function updateFps(dt) {
    fpsFrames += 1;
    fpsElapsed += dt;
    if (fpsElapsed >= 0.55) {
      setText('#fpsReadout', `${Math.round(fpsFrames / fpsElapsed)} FPS`);
      fpsFrames = 0;
      fpsElapsed = 0;
    }
  }

  function animate(now) {
    rafId = requestAnimationFrame(animate);
    const dt = Math.min(Math.max((now - lastFrame) / 1000, 0.0001), 0.05);
    lastFrame = now;
    if (!initialized) return;

    if (autoOrbit) {
      rig.goalTheta += (Number(cameraConfig.autoSpeed) || 0.06) * dt;
    }
    explodeCurrent = damp(explodeCurrent, explodeTarget, 3.4, dt);
    let floorY = assembledFloorY;
    modules.forEach(module => {
      const delay = clamp(Number(module.delay) || 0, 0, 0.75);
      const target = explodeCurrent < 0.001
        ? 0
        : clamp((explodeCurrent - delay) / Math.max(0.001, 1 - delay), 0, 1);
      module.state = damp(module.state, target, 4.4 + (module.index % 3) * 0.35, dt);
      module.group.position.copy(module.base).addScaledVector(module.offset, module.state);
      floorY = Math.min(floorY, module.baseMinY + module.offset.y * module.state);
      connectorPositions[module.index * 6 + 3] = module.group.position.x;
      connectorPositions[module.index * 6 + 4] = module.group.position.y;
      connectorPositions[module.index * 6 + 5] = module.group.position.z;
    });
    connectorGeometry.attributes.position.needsUpdate = true;
    const connectorOpacity = IDENTITY.motion.connectors === false ? 0 : Math.min(0.34, explodeCurrent * 0.4);
    connectorMaterial.opacity = connectorOpacity;
    connectorLines.visible = connectorOpacity > 0.008;
    floorGroup.position.y = floorY - 0.12;
    rig.update(dt);
    updatePins();
    updateFps(dt);
    const ringBase = Number(DESIGN.scene.ringOpacity) || 0.25;
    const ring2Base = Number(DESIGN.scene.ring2Opacity) || 0.14;
    floorRing.material.opacity = ringBase + Math.sin(now * 0.0013) * 0.035;
    floorRingCyan.material.opacity = ring2Base + Math.sin(now * 0.0011 + 2) * 0.025;
    scanRing.rotation.z = now * 0.00008;
    dust.rotation.y = now * 0.00002;
    renderer.render(scene, camera);
  }

  function countParts() {
    let count = 0;
    modules.forEach(module => { count += module.data.parts?.length || 0; });
    return count;
  }

  /* ---------------------------------------------------------------- startup */
  buildList();
  buildPins();
  selectModule(selectedId, { focus: false });
  resize();
  applyFit(true);
  rig.theta = Number(cameraConfig.theta) || 0.75;
  rig.phi = clamp(Number(cameraConfig.phi) || 1.12, 0.2, 1.47);
  rig.goalTheta = rig.theta;
  rig.goalPhi = rig.phi;
  rig.radius = fit.radius;
  rig.goalRadius = fit.radius;
  rig.target.copy(fit.center);
  rig.goalTarget.copy(fit.center);
  rig.explodeRatio = fit.ratio;
  setExplodeTarget(0);
  setView('iso', false);

  const resizeObserver = new ResizeObserver(scheduleResize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', scheduleResize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', scheduleResize);
  if (compactViewport.addEventListener) {
    compactViewport.addEventListener('change', () => { syncPixelRatio(); scheduleResize(); });
  }

  // Boot sequence: deterministic removal, because headless screenshots can
  // otherwise capture a half-faded overlay as ghost text.
  const boot = $('#boot');
  const bootBar = $('#bootBar');
  const bootText = ['LOADING SPECIFICATION', 'BUILDING MODULE GRAPH', 'CALIBRATING MATERIALS', 'ASSEMBLY READY'];
  let bootStep = 0;
  const bootTimer = setInterval(() => {
    bootStep += 1;
    if (bootBar) bootBar.style.width = `${Math.min(100, bootStep * 25)}%`;
    if (bootText[bootStep - 1] && $('#bootLog')) $('#bootLog').textContent = bootText[Math.min(bootStep - 1, bootText.length - 1)];
    if (bootStep >= 4) {
      clearInterval(bootTimer);
      bootComplete = true;
      boot.classList.add('is-hidden');
      setTimeout(() => boot.remove(), 520);
    }
  }, 160);

  window.__STUDIO__ = {
    spec, identity: IDENTITY, modules, selectModule, setExplodeTarget, resetAll, setView,
    rig, fit, camera, scene, renderer, applyFit, countParts, floorGroup, connectorLines
  };

  lastFrame = performance.now();
  rafId = requestAnimationFrame(animate);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    } else if (!rafId) {
      lastFrame = performance.now();
      rafId = requestAnimationFrame(animate);
    }
  });
})();
