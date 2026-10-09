import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import fontJson from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { EVENTS, FOCUS, PARTNERS, PHOTOS, STARTUPS, STATS, WHY, YOUTUBE } from '../data.js';
import { artTexture, loadAny, loadPhoto, paintBrowser, paintEditorial, paintLabel, paintQuote, paintScreen, paintTile, cover, FONT } from './canvasArt.js';
import { drawPoster } from './poster.js';

// Order matches the DOM chapters in App.jsx.
export const STATIONS = ['hero', 'tunnel', 'impact', 'about', 'why', 'partners', 'startups', 'events', 'gallery', 'channel', 'stories', 'join'];

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const CENTERS = {
  impact: V(16, 0, -205),
  about: V(-14, 3, -300),
  why: V(18, -1, -395),
  partners: V(-12, 4, -490),
  startups: V(16, 0, -585),
  events: V(-10, -2, -680),
  gallery: V(0, 1, -780),
  channel: V(14, 2, -880),
  stories: V(-12, 0, -975),
  join: V(0, 0, -1075),
};

const GAP = 8.25;
const TUNNEL_SEGMENTS = 17;
const HALF_W = 4.82;
const HALF_H = 4.03;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (v) => v * v * (3 - 2 * v);

export class World {
  constructor(canvas, { mobile = false, reduced = false, onPick = () => {}, onHover = () => {} } = {}) {
    this.canvas = canvas;
    this.mobile = mobile;
    this.reduced = reduced;
    this.onPick = onPick;
    this.onHover = onHover;
    this.u = 0;
    this.time = 0;
    this.pointer = new THREE.Vector2();
    this.pointerSmooth = new THREE.Vector2();
    this.clickables = [];
    this.disposables = [];
    this.stations = {};
    this.galleryDrag = 0;
    this.galleryVel = 0;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050505');
    scene.fog = new THREE.FogExp2('#050505', 0.0115);
    this.scene = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = this.envMap;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
    this.lookAt = new THREE.Vector3();

    scene.add(new THREE.HemisphereLight(0xfff4ec, 0x1a0004, 0.75));
    scene.add(new THREE.AmbientLight(0xffffff, 0.18));
    this.camLight = new THREE.PointLight(0xfff1e6, 60, 70, 1.6);
    scene.add(this.camLight);

    this.font = new FontLoader().parse(fontJson);
    this.mat = {
      red: new THREE.MeshPhysicalMaterial({ color: 0xca0019, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
      bone: new THREE.MeshPhysicalMaterial({ color: 0xece7de, metalness: 0.05, roughness: 0.4, clearcoat: 0.6 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0x9a9aa2, metalness: 1, roughness: 0.22 }),
      body: new THREE.MeshStandardMaterial({ color: 0x0e0e0f, metalness: 0.6, roughness: 0.35 }),
      neon: new THREE.MeshBasicMaterial({ color: 0xff2a3d }),
      neonSoft: new THREE.MeshBasicMaterial({ color: 0xff2a3d, transparent: true, opacity: 0.35 }),
      frame: new THREE.MeshStandardMaterial({ color: 0x030303, metalness: 0.3, roughness: 0.42 }),
      glow: new THREE.MeshBasicMaterial({ color: 0xfff1e0 }),
    };
    this.alphaMaps = new Map();

    this.buildAtmosphere();
    this.buildTunnel();
    this.buildImpact();
    this.buildAbout();
    this.buildWhy();
    this.buildPartners();
    this.buildStartups();
    this.buildEvents();
    this.buildGallery();
    this.buildChannel();
    this.buildStories();
    this.buildJoin();

    this.composer = null;
    if (!mobile) {
      this.composer = new EffectComposer(renderer);
      this.composer.addPass(new RenderPass(scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.45, 0.9);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }

    this.raycaster = new THREE.Raycaster();
    this.resize();
  }

  // ---------- helpers ----------

  tex(w, h, paint, photo = null) {
    const t = artTexture(this.renderer, w, h, paint, photo);
    this.disposables.push(t);
    return t;
  }

  roundedAlpha(aspect, radius = 0.05) {
    const key = `${aspect.toFixed(3)}-${radius}`;
    if (this.alphaMaps.has(key)) return this.alphaMaps.get(key);
    const h = 256;
    const w = Math.round(h * aspect);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    const r = h * radius;
    ctx.beginPath();
    ctx.roundRect(1, 1, w - 2, h - 2, r);
    ctx.fill();
    const t = new THREE.CanvasTexture(c);
    this.alphaMaps.set(key, t);
    this.disposables.push(t);
    return t;
  }

  card(w, h, map, { radius = 0.05, rough = 0.55, double = true } = {}) {
    const material = new THREE.MeshStandardMaterial({
      map, alphaMap: this.roundedAlpha(w / h, radius), alphaTest: 0.5, roughness: rough, metalness: 0.02,
      side: double ? THREE.DoubleSide : THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    this.disposables.push(material, mesh.geometry);
    return mesh;
  }

  label(w, h, map) {
    const material = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, toneMapped: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    this.disposables.push(material, mesh.geometry);
    return mesh;
  }

  text3d(str, size, material, depth = size * 0.28) {
    const geometry = new TextGeometry(str, {
      font: this.font, size, depth, curveSegments: 8,
      bevelEnabled: true, bevelThickness: size * 0.03, bevelSize: size * 0.018, bevelSegments: 4,
    });
    geometry.center();
    this.disposables.push(geometry);
    return new THREE.Mesh(geometry, material);
  }

  station(name, group) {
    const center = CENTERS[name];
    if (center) group.position.copy(center);
    this.scene.add(group);
    this.stations[name] = { group, index: STATIONS.indexOf(name), update: () => {} };
    return this.stations[name];
  }

  clickable(mesh, data) {
    mesh.userData.pick = data;
    this.clickables.push(mesh);
  }

  // ---------- atmosphere ----------

  buildAtmosphere() {
    const count = this.mobile ? 1600 : 3200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const red = new THREE.Color('#ff2a3d');
    const warm = new THREE.Color('#fff1e0');
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = 40 - Math.random() * 1180;
      const c = Math.random() < 0.18 ? red : warm;
      col.set([c.r, c.g, c.b], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);
    const map = new THREE.CanvasTexture(sprite);
    const material = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: map }, uScale: { value: 1 } },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying float vFade;
        uniform float uScale;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float d = -mv.z;
          // Cap the sprite so nothing near the lens balloons into a disc.
          gl_PointSize = clamp(uScale * 26.0 / max(d, 0.1), 0.0, 3.5 * uScale);
          vFade = smoothstep(2.0, 9.0, d) * (1.0 - smoothstep(60.0, 120.0, d));
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uMap;
        varying vec3 vColor;
        varying float vFade;
        void main() {
          vec4 tex = texture2D(uMap, gl_PointCoord);
          gl_FragColor = vec4(vColor, tex.a * 0.8 * vFade);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.dust = new THREE.Points(geometry, material);
    this.scene.add(this.dust);
    this.disposables.push(geometry, material, map);

    // A faint floor grid that sells the sense of travel between chapters.
    const grid = new THREE.GridHelper(1400, 280, 0x3a0008, 0x161616);
    grid.position.set(0, -14, -540);
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    this.scene.add(grid);
    this.disposables.push(grid.geometry, grid.material);
  }

  // ---------- 00 hero corridor ----------

  buildTunnel() {
    const group = new THREE.Group();
    const inner = new THREE.Group();
    group.add(inner);
    const textures = Array.from({ length: 24 }, (_, i) => this.tex(768, 900, (ctx, w, h, img) => drawPoster(ctx.canvas, i, img), i));
    this.tunnelReady = Promise.race([
      Promise.all(textures.slice(0, 8).map((t) => t.userData.ready)),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
    const wall = new THREE.PlaneGeometry(GAP * 0.92, HALF_H * 2 - 0.54);
    const deck = new THREE.PlaneGeometry(HALF_W * 2 - 0.38, GAP * 0.92);
    const ringV = new THREE.BoxGeometry(0.24, HALF_H * 2, 0.3);
    const ringH = new THREE.BoxGeometry(HALF_W * 2, 0.24, 0.3);
    const rail = new THREE.BoxGeometry(0.17, 0.17, GAP);
    const neon = new THREE.BoxGeometry(0.05, HALF_H * 2 - 0.6, 0.05);
    const bulb = new THREE.SphereGeometry(0.11, 10, 6);
    const plate = new THREE.BoxGeometry(1.6, 0.07, 1.1);
    this.disposables.push(wall, deck, ringV, ringH, rail, neon, bulb, plate);
    const mats = textures.map((map) => new THREE.MeshStandardMaterial({ map, roughness: 0.85, metalness: 0, envMapIntensity: 0.2 }));
    this.disposables.push(...mats);

    for (let i = 0; i < TUNNEL_SEGMENTS; i += 1) {
      const seg = new THREE.Group();
      seg.position.z = 2 * GAP - i * GAP;
      const cz = -GAP / 2;
      const add = (geo, mat, x, y, z, rx = 0, ry = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.set(rx, ry, 0);
        seg.add(m);
        return m;
      };
      add(wall, mats[(i * 3) % 24], -HALF_W + 0.08, 0, cz, 0, Math.PI / 2);
      add(wall, mats[(i * 3 + 7) % 24], HALF_W - 0.08, 0, cz, 0, -Math.PI / 2);
      add(deck, mats[(i * 3 + 13) % 24], 0, -HALF_H + 0.08, cz, -Math.PI / 2);
      add(deck, mats[(i * 3 + 19) % 24], 0, HALF_H - 0.08, cz, Math.PI / 2);
      add(ringV, this.mat.frame, -HALF_W, 0, 0);
      add(ringV, this.mat.frame, HALF_W, 0, 0);
      add(ringH, this.mat.frame, 0, HALF_H, 0);
      add(ringH, this.mat.frame, 0, -HALF_H, 0);
      for (const x of [-HALF_W + 0.02, HALF_W - 0.02]) for (const y of [-HALF_H + 0.02, HALF_H - 0.02]) add(rail, this.mat.frame, x, y, cz);
      if (i % 4 === 0) {
        add(neon, this.mat.neon, -HALF_W + 0.16, 0, 0.18);
        add(neon, this.mat.neon, HALF_W - 0.16, 0, 0.18);
      }
      if (i % 3 === 1) {
        add(plate, this.mat.frame, 0, HALF_H - 0.32, cz);
        for (let r = -1; r <= 1; r += 1) for (let c = -2; c <= 2; c += 1) {
          add(bulb, this.mat.glow, c * 0.27, HALF_H - 0.25, cz + r * 0.25).scale.set(1, 0.5, 1);
        }
      }
      if (i % 6 === 2) {
        const light = new THREE.PointLight(0xca0019, 30, 18, 2);
        light.position.set(0, 1.8, cz);
        seg.add(light);
      }
      inner.add(seg);
    }
    // Portal ring at the corridor's mouth: the exit into the community world.
    const portal = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.06, 12, 120), this.mat.neon);
    portal.position.z = 2 * GAP - TUNNEL_SEGMENTS * GAP - 2;
    group.add(portal);
    this.disposables.push(portal.geometry);

    let offset = 0;
    const st = this.station('tunnel', group);
    this.stations.hero = st;
    st.update = (u, dt) => {
      // The corridor drifts toward the viewer while they rest on the hero.
      const speed = this.reduced ? 0 : Math.max(0, 1 - u * 1.6) * 1.8;
      offset = (offset + speed * dt) % GAP;
      inner.position.z = offset;
      portal.rotation.z += dt * 0.2;
      group.visible = u < 2.3;
    };
  }

  // ---------- 01 impact ----------

  buildImpact() {
    const group = new THREE.Group();
    const values = ['8.6L+', '100+', '150+', '40+'];
    const mats = [this.mat.red, this.mat.bone, this.mat.chrome, this.mat.bone];
    const slots = [V(-6.5, 3.6, 0), V(6.5, 3.6, -3), V(-6.5, -3.8, -3), V(6.5, -3.8, 0)];
    const items = values.map((v, i) => {
      const holder = new THREE.Group();
      holder.position.copy(slots[i]);
      const mesh = this.text3d(v, 2.6, mats[i]);
      holder.add(mesh);
      const label = this.label(8, 1.1, this.tex(800, 110, paintLabel(STATS[i].label, { sub: i === 0 ? '₹8,60,000+ earned through client work' : STATS[i].note, size: 0.3 })));
      label.position.set(0, -2.4, 0.4);
      holder.add(label);
      group.add(holder);
      return { holder, mesh, base: slots[i].clone() };
    });
    const light = new THREE.PointLight(0xff2a3d, 80, 40, 2);
    light.position.set(-4, 6, 8);
    group.add(light);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(13, 0.03, 8, 160), this.mat.neonSoft);
    halo.rotation.x = Math.PI / 2.2;
    group.add(halo);
    this.disposables.push(halo.geometry);

    const st = this.station('impact', group);
    st.update = (local, t) => {
      const enter = smooth(clamp01(1 - Math.abs(local)));
      items.forEach(({ holder, mesh, base }, i) => {
        holder.position.y = base.y + Math.sin(t * 0.7 + i) * 0.25 - (1 - enter) * (i % 2 ? 4 : -4);
        holder.position.z = base.z - (1 - enter) * 10;
        mesh.rotation.y = Math.sin(t * 0.4 + i * 1.3) * 0.25 + local * 0.6;
        mesh.rotation.x = Math.sin(t * 0.3 + i) * 0.06;
      });
      halo.rotation.z = t * 0.1;
    };
  }

  // ---------- 02 about / main focus ----------

  buildAbout() {
    const group = new THREE.Group();
    const ring = new THREE.Group();
    group.add(ring);
    const configs = [
      { layout: 'photoFull', photo: 1 },
      { layout: 'photoTop', theme: 'bone', photo: 5 },
      { layout: 'type', theme: 'red' },
      { layout: 'photoTop', theme: 'carbon', photo: 9 },
      { layout: 'photoFull', photo: 13 },
    ];
    const R = 10.5;
    FOCUS.forEach((f, i) => {
      const c = configs[i];
      const map = this.tex(720, 940, paintEditorial({
        kicker: 'Our main focus', no: `Nº 0${i + 1}`, title: f.label, body: f.text, layout: c.layout, theme: c.theme, footer: 'The Uniques Community',
      }), c.photo ?? null);
      const mesh = this.card(6.2, 8.1, map);
      const a = (i / FOCUS.length) * Math.PI * 2;
      mesh.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      mesh.rotation.y = a;
      ring.add(mesh);
    });
    const tu = this.text3d('TU', 4.2, this.mat.red);
    tu.position.y = 0.2;
    group.add(tu);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(R, 0.025, 8, 200), this.mat.neonSoft);
    orbit.rotation.x = Math.PI / 2;
    orbit.position.y = -4.4;
    group.add(orbit);
    this.disposables.push(orbit.geometry);
    const light = new THREE.PointLight(0xff2a3d, 60, 30, 2);
    light.position.set(0, 2, 0);
    group.add(light);

    const st = this.station('about', group);
    st.update = (local, t) => {
      ring.rotation.y = -local * 1.9 + (this.reduced ? 0 : t * 0.05);
      tu.rotation.y = t * 0.6;
      ring.position.y = Math.sin(t * 0.5) * 0.2;
    };
  }

  // ---------- 03 why us ----------

  buildWhy() {
    const group = new THREE.Group();
    const themes = ['carbon', 'bone', 'red', 'carbon'];
    const slabGeo = new RoundedBoxGeometry(5.8, 8.4, 0.5, 4, 0.18);
    this.disposables.push(slabGeo);
    const slabs = WHY.cards.map((card, i) => {
      const holder = new THREE.Group();
      const slab = new THREE.Mesh(slabGeo, this.mat.body);
      holder.add(slab);
      const face = this.card(5.4, 8, this.tex(675, 1000, paintEditorial({
        kicker: card.kicker, no: `0${i + 1}`, title: card.title, body: card.text, layout: 'type', theme: themes[i], footer: 'A community like no other',
      })), { double: false });
      face.position.z = 0.26;
      holder.add(face);
      holder.position.set(-10 + i * 6.6, 0, -i * 1.5);
      group.add(holder);
      return holder;
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 8), this.mat.chrome);
    plinth.position.set(0, -4.8, -2);
    group.add(plinth);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(30, 0.04, 0.04), this.mat.neon);
    edge.position.set(0, -4.64, 2);
    group.add(edge);
    this.disposables.push(plinth.geometry, edge.geometry);

    const st = this.station('why', group);
    st.update = (local, t) => {
      slabs.forEach((s, i) => {
        const phase = clamp01(1 - Math.abs(local * 1.4 - (i - 1.5) * 0.18));
        s.rotation.y = 0.35 - local * 0.5 + Math.sin(t * 0.4 + i) * 0.03;
        s.position.y = (1 - smooth(phase)) * -3 + Math.sin(t * 0.6 + i) * 0.12;
      });
    };
  }

  // ---------- 04 partners ----------

  buildPartners() {
    const group = new THREE.Group();
    const core = new THREE.Mesh(new THREE.SphereGeometry(3, 64, 48), new THREE.MeshPhysicalMaterial({
      color: 0xca0019, emissive: 0x3a0007, metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05,
    }));
    group.add(core);
    const tu = this.text3d('TU', 1.6, this.mat.bone, 0.3);
    tu.position.z = 3.05;
    core.add(tu);
    this.disposables.push(core.geometry, core.material);

    const ring = new THREE.Group();
    ring.rotation.x = 0.28;
    group.add(ring);
    const R = 9;
    PARTNERS.logos.forEach((name, i) => {
      const a = (i / PARTNERS.logos.length) * Math.PI * 2;
      const tile = this.card(3.6, 1.8, this.tex(480, 240, paintTile(name, i % 3 === 0)), { radius: 0.18, rough: 0.35 });
      tile.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
      tile.rotation.y = a;
      ring.add(tile);
    });
    const orbits = [11.5, 13.5].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, i ? 0.02 : 0.035, 8, 200), i ? this.mat.neonSoft : this.mat.neon);
      m.rotation.x = Math.PI / 2 + 0.28 + i * 0.2;
      group.add(m);
      this.disposables.push(m.geometry);
      return m;
    });
    const light = new THREE.PointLight(0xff2a3d, 120, 40, 2);
    light.position.set(0, 0, 6);
    group.add(light);

    const st = this.station('partners', group);
    st.update = (local, t) => {
      ring.rotation.y = (this.reduced ? 0 : t * 0.18) + local * 1.2;
      core.rotation.y = Math.sin(t * 0.3) * 0.4;
      core.position.y = Math.sin(t * 0.8) * 0.3;
      orbits.forEach((o, i) => { o.rotation.z = t * (i ? -0.08 : 0.12); });
    };
  }

  // ---------- 05 startups ----------

  buildStartups() {
    const group = new THREE.Group();
    const themes = ['carbon', 'red', 'bone'];
    const panels = STARTUPS.items.map((s, i) => {
      const map = this.tex(1280, 800, paintBrowser({ ...s, theme: themes[i] }), i * 5 + 3);
      const mesh = this.card(17, 10.625, map, { radius: 0.035, rough: 0.4 });
      this.clickable(mesh, { type: 'url', url: s.url, label: `Visit ${s.name}` });
      group.add(mesh);
      return mesh;
    });
    const light = new THREE.PointLight(0xfff1e6, 60, 40, 2);
    light.position.set(-6, 6, 10);
    group.add(light);

    const st = this.station('startups', group);
    st.update = (local, t) => {
      const spread = clamp01(local + 0.6);
      panels.forEach((p, i) => {
        const k = i - spread * 1.2;
        p.position.set(k * 4.2, -k * 1.1 + Math.sin(t * 0.6 + i) * 0.15, 3 - Math.abs(k) * 6);
        p.rotation.y = -0.32 + k * 0.08;
        p.rotation.x = Math.sin(t * 0.4 + i) * 0.02;
        p.renderOrder = 10 - Math.round(Math.abs(k) * 2);
      });
    };
  }

  // ---------- 06 events ----------

  buildEvents() {
    const group = new THREE.Group();
    const helix = new THREE.Group();
    group.add(helix);
    const themes = ['photoFull', 'photoTop', 'type'];
    EVENTS.forEach((ev, i) => {
      const layout = themes[i % 3];
      const map = this.tex(800, 620, paintEditorial({
        kicker: `${ev.category} / Nº ${String(i + 1).padStart(2, '0')}`, title: ev.title, layout,
        theme: layout === 'type' ? 'red' : 'bone', footer: 'The Uniques · Events',
      }), layout === 'type' ? null : i * 2 + 2);
      const mesh = this.card(6.4, 4.96, map);
      const a = i * 0.72;
      mesh.position.set(Math.sin(a) * 10, i * 1.25 - 5, Math.cos(a) * 10);
      mesh.rotation.y = a;
      helix.add(mesh);
    });
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 16, 8), this.mat.neon);
    group.add(spine);
    this.disposables.push(spine.geometry);

    const st = this.station('events', group);
    st.update = (local, t) => {
      helix.rotation.y = -local * 2.6 + (this.reduced ? 0 : t * 0.04);
      helix.position.y = -local * 3;
    };
  }

  // ---------- 07 gallery ----------

  buildGallery() {
    const group = new THREE.Group();
    const drum = new THREE.Group();
    group.add(drum);
    const R = 14;
    const n = PHOTOS.length;
    PHOTOS.forEach((_, i) => {
      const map = this.tex(420, 560, (ctx, w, h, img) => {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, w, h);
        if (img) cover(ctx, img, 0, 0, w, h);
        ctx.fillStyle = 'rgba(10,10,10,.6)';
        ctx.beginPath();
        ctx.roundRect(16, h - 52, 64, 34, 17);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = FONT.mono(18);
        ctx.fillText(String(i + 1).padStart(2, '0'), 30, h - 29);
      }, i);
      const mesh = this.card(3.6, 4.8, map, { radius: 0.06, rough: 0.5 });
      const a = (i / n) * Math.PI * 2;
      mesh.position.set(Math.sin(a) * R, (i % 3) * 0.5 - 0.5, Math.cos(a) * R);
      mesh.lookAt(0, mesh.position.y, 0);
      this.clickable(mesh, { type: 'photo', index: i, label: `Open photo ${i + 1}` });
      drum.add(mesh);
    });
    const floor = new THREE.Mesh(new THREE.RingGeometry(R - 0.5, R + 0.3, 160), this.mat.neonSoft);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.6;
    group.add(floor);
    this.disposables.push(floor.geometry);

    const st = this.station('gallery', group);
    st.update = (local, t, dt) => {
      this.galleryDrag += this.galleryVel;
      this.galleryVel *= 0.94;
      drum.rotation.y = local * 1.4 + this.galleryDrag + (this.reduced ? 0 : t * 0.025);
    };
  }

  // ---------- 08 channel ----------

  buildChannel() {
    const group = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(18, 10.125, 40, 1);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i += 1) p.setZ(i, -(p.getX(i) ** 2) / 38);
    geometry.computeVertexNormals();
    // YouTube's thumbnail when reachable, otherwise a community photo.
    const map = this.tex(1280, 720, paintScreen({ title: YOUTUBE.channel, handle: YOUTUBE.handle }),
      () => loadAny(`https://i.ytimg.com/vi/${YOUTUBE.videoId}/maxresdefault.jpg`).then((img) => img || loadPhoto(0)));
    const screen = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, toneMapped: false }));
    this.disposables.push(geometry, screen.material);
    this.clickable(screen, { type: 'url', url: `https://www.youtube.com/watch?v=${YOUTUBE.videoId}`, label: 'Watch on YouTube' });
    group.add(screen);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(18, 0.05, 0.05), this.mat.neon);
    bar.position.set(0, -5.6, -2);
    group.add(bar);
    const glow = new THREE.PointLight(0xff2a3d, 90, 30, 2);
    glow.position.set(0, 0, 4);
    group.add(glow);
    this.disposables.push(bar.geometry);

    const st = this.station('channel', group);
    st.update = (local, t) => {
      group.rotation.y = -0.25 - local * 0.35;
      screen.position.y = Math.sin(t * 0.6) * 0.15;
    };
  }

  // ---------- 09 stories ----------

  buildStories() {
    const group = new THREE.Group();
    this.storyCards = [0, 1, 2, 3].map((i) => {
      const mesh = this.card(9.5, 7.6, null, { radius: 0.05, rough: 0.85 });
      mesh.material.color.setScalar(0.82);
      mesh.material.envMapIntensity = 0.3;
      group.add(mesh);
      return mesh;
    });
    this.storyActive = 0;

    const st = this.station('stories', group);
    st.update = (local, t) => {
      this.storyCards.forEach((m, i) => {
        const d = (i - this.storyActive + 4) % 4;
        const tx = d * 2.6;
        const ty = d * 0.6;
        const tz = -d * 3.2;
        m.position.x += (tx - m.position.x) * 0.08;
        m.position.y += (ty + Math.sin(t * 0.6 + i) * 0.12 - m.position.y) * 0.08;
        m.position.z += (tz - m.position.z) * 0.08;
        m.rotation.y += ((-0.22 + d * 0.06 - local * 0.2) - m.rotation.y) * 0.08;
        m.renderOrder = 10 - d;
      });
    };
  }

  setStories(items, active = 0) {
    this.storyActive = active;
    this.storyCards.forEach((mesh, i) => {
      const person = items[i];
      if (!person) return;
      if (mesh.userData.person === person.name) return;
      mesh.userData.person = person.name;
      const old = mesh.material.map;
      mesh.material.map = this.tex(950, 760, paintQuote(person), person.image || null);
      mesh.material.needsUpdate = true;
      if (old) old.dispose();
    });
  }

  // ---------- 10 join ----------

  buildJoin() {
    const group = new THREE.Group();
    const word = this.text3d('JOIN US', 3.6, this.mat.red, 1.1);
    word.position.y = 0.6;
    group.add(word);
    const sub = this.text3d('TODAY', 1.4, this.mat.bone, 0.3);
    sub.position.set(0, -3.4, 0);
    group.add(sub);
    const rings = [9, 13, 17].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, i === 1 ? 0.05 : 0.025, 8, 220), i === 1 ? this.mat.neon : this.mat.neonSoft);
      group.add(m);
      this.disposables.push(m.geometry);
      return m;
    });
    const light = new THREE.PointLight(0xff2a3d, 140, 50, 2);
    light.position.set(0, 2, 10);
    group.add(light);

    const st = this.station('join', group);
    st.update = (local, t) => {
      rings.forEach((r, i) => {
        r.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.2 + i) * 0.3;
        r.rotation.y = t * (0.1 + i * 0.05) * (i % 2 ? -1 : 1);
      });
      word.rotation.y = Math.sin(t * 0.4) * 0.18 + local * 0.3;
      sub.rotation.y = Math.sin(t * 0.4 + 0.4) * 0.12;
    };
  }

  // ---------- camera rail ----------

  layoutRail() {
    const side = this.mobile ? 0 : 8.5;
    const lift = this.mobile ? 4.5 : 0;
    const dist = this.mobile ? 36 : 25;
    const cams = [];
    const looks = [];
    STATIONS.forEach((name) => {
      if (name === 'hero') { cams.push(V(0, 0, 9)); looks.push(V(0, 0, -40)); return; }
      if (name === 'tunnel') { cams.push(V(0, 0, -96)); looks.push(V(0, 0, -150)); return; }
      const c = CENTERS[name];
      if (name === 'gallery') { cams.push(V(c.x, c.y + 0.5, c.z + 3)); looks.push(V(c.x - side * 0.6, c.y - lift * 0.3, c.z - 12)); return; }
      if (name === 'join') { cams.push(V(c.x - side * 0.4, c.y + 1, c.z + dist + 4)); looks.push(V(c.x - side * 0.4, c.y - lift, c.z)); return; }
      cams.push(V(c.x - side, c.y + 1.5, c.z + dist));
      looks.push(V(c.x - side, c.y - lift, c.z));
    });
    this.camRail = new THREE.CatmullRomCurve3(cams, false, 'centripetal');
    this.lookRail = new THREE.CatmullRomCurve3(looks, false, 'centripetal');
  }

  resize() {
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    const wasMobile = this.mobile;
    this.mobile = w < 760;
    this.camera.aspect = w / h;
    this.camera.fov = this.camera.aspect < 0.8 ? 68 : 60;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    if (this.composer) {
      this.composer.setSize(w, h);
      this.composer.setPixelRatio(this.renderer.getPixelRatio());
    }
    this.dust.material.uniforms.uScale.value = this.renderer.getPixelRatio() * (h / 900);
    if (wasMobile !== this.mobile || !this.camRail) this.layoutRail();
  }

  setPointer(x, y) {
    this.pointer.set(x, y);
  }

  pick(clientX, clientY, commit) {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const live = this.clickables.filter((m) => {
      let o = m;
      while (o) { if (!o.visible) return false; o = o.parent; }
      return true;
    });
    const hit = this.raycaster.intersectObjects(live, false)[0];
    const data = hit ? hit.object.userData.pick : null;
    if (this.hovered !== hit?.object) {
      if (this.hovered) this.hovered.userData.hover = false;
      this.hovered = hit?.object || null;
      if (this.hovered) this.hovered.userData.hover = true;
      this.onHover(data);
    }
    if (commit && data) this.onPick(data);
    return data;
  }

  dragGallery(dx) {
    this.galleryVel = dx * 0.0035;
  }

  render(targetU, dt, realDt = dt) {
    this.time += dt;
    const t = this.time;
    // Exponential follow on wall-clock time: the camera glides, yet still settles on slow devices.
    this.u += (targetU - this.u) * (1 - Math.exp(-realDt * 3.2));
    if (Math.abs(targetU - this.u) < 0.0005) this.u = targetU;
    const u = this.u;
    const n = STATIONS.length - 1;
    const r = Math.min(1, Math.max(0, u / n));

    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-realDt * 2.2));
    const cam = this.camRail.getPoint(r);
    const look = this.lookRail.getPoint(r);
    const breathe = Math.max(0, 1 - u) * (this.reduced ? 0 : 1);
    cam.x += this.pointerSmooth.x * 1.2 + Math.sin(t * 0.24) * 0.2 * breathe;
    cam.y += -this.pointerSmooth.y * 0.7 + Math.sin(t * 0.35) * 0.08 * breathe;
    this.camera.position.copy(cam);
    look.x += this.pointerSmooth.x * 1.6;
    look.y += -this.pointerSmooth.y * 0.9;
    this.lookAt.lerp(look, this.lookAt.lengthSq() ? 1 - Math.exp(-realDt * 6) : 1);
    this.camera.lookAt(this.lookAt);
    this.camera.rotateZ(Math.sin(u * 1.7) * 0.02);
    this.camLight.position.copy(cam);

    for (const name of Object.keys(this.stations)) {
      if (name === 'hero') continue;
      const s = this.stations[name];
      const local = u - s.index;
      if (name !== 'tunnel') s.group.visible = Math.abs(local) < 1.6;
      if (name === 'tunnel') s.update(u, dt);
      else if (s.group.visible) s.update(local, t, dt);
    }
    for (const m of this.clickables) {
      const target = m.userData.hover ? 1.05 : 1;
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * Math.min(1, dt * 8));
    }
    this.dust.rotation.z = t * 0.004;

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose?.());
    Object.values(this.mat).forEach((m) => m.dispose());
    this.envMap.dispose();
    this.composer?.dispose?.();
    this.renderer.dispose();
  }
}
