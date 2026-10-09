import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HERO, JOIN_URL, PHOTOS } from '../data.js';
import '../styles/hero.css';

const GAP = 8.25;
const SEGMENT_COUNT = 30;
const HALF_WIDTH = 4.82;
const HALF_HEIGHT = 4.03;
const TEXTURE_COUNT = 24;

// Brand palettes: Uniques red (#ca0019), carbon and bone.
const PALETTES = [
  { paper: '#f2efe9', ink: '#0d0d0d', accent: '#ca0019', soft: '#d9d3ca' },
  { paper: '#0f0f10', ink: '#f4f1ea', accent: '#ff2a3d', soft: '#2a2a2c' },
  { paper: '#ca0019', ink: '#fff7f2', accent: '#0d0d0d', soft: '#8f0012' },
  { paper: '#e6e1d8', ink: '#141414', accent: '#ca0019', soft: '#b8b1a5' },
  { paper: '#18181a', ink: '#f4f1ea', accent: '#ca0019', soft: '#3a3a3d' },
  { paper: '#f7f4ee', ink: '#ca0019', accent: '#0d0d0d', soft: '#e3ddd3' },
];

const VARIANTS = [
  { title: 'CREATORS', overline: 'A COMMUNITY OF', footer: 'LEARN · BUILD · GROW' },
  { title: 'DREAMERS\n& DOERS.', overline: 'THE UNIQUES COMMUNITY', footer: 'BANUR · PUNJAB · IN' },
  { title: '150+', overline: 'PROJECTS DELIVERED', footer: 'REAL-WORLD SOLUTIONS' },
  { title: 'HACK\nATHONS', overline: 'NATIONAL HACKATHON GOLD', footer: 'CODE WARRIORS TROPHY' },
  { title: 'FUTURE\nLEADERS', overline: 'PEER-TO-PEER LEARNING', footer: 'THEORY → PRACTICE' },
  { title: '40+', overline: 'COMMUNITY EVENTS', footer: 'TALKS · SUMMITS · JAMS' },
  { title: 'VISION\nARIES', overline: 'A COMMUNITY LIKE NO OTHER', footer: 'INNOVATION THROUGH COLLABORATION' },
  { title: '100+', overline: 'TECH PARTNERS', footer: 'TRUSTED BY INDUSTRY LEADERS' },
  { title: 'UI/UX', overline: 'DESIGN MASTERCLASS', footer: 'GRAPHIC DESIGNERS' },
  { title: 'BUILD\nTOGETHER', overline: 'LEARN, BUILD, AND GROW', footer: 'THE UNIQUES / 2026' },
  { title: '₹8.6L+', overline: 'REVENUE GENERATED', footer: 'STUDENT-LED CLIENT WORK' },
  { title: 'STAY\nUNIQUE', overline: 'AN OPEN INVITATION', footer: 'JOIN THE COMMUNITY' },
];

function seededRandom(seed) {
  let n = (seed * 9301 + 49297) % 233280;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

function coverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

function drawPoster(canvas, index, img) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const palette = PALETTES[index % PALETTES.length];
  const variant = VARIANTS[index % VARIANTS.length];
  const random = seededRandom(index * 41 + 7);

  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 1400; i += 1) {
    const v = random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${random() * 0.03})`;
    ctx.fillRect(random() * width, random() * height, 1.5, 1.5);
  }

  ctx.fillStyle = palette.ink;
  ctx.font = '600 15px "DM Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('THE UNIQUES  /  COMMUNITY', 52, 53);
  ctx.textAlign = 'right';
  ctx.fillText(`Nº ${String(index + 1).padStart(2, '0')} — 2026`, width - 52, 53);
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.accent;
  ctx.fillRect(52, 72, width - 104, 2);

  const style = index % 4;
  const photo = style === 1 ? { x: 52, y: 100, w: width - 104, h: 520 } : { x: 32, y: 95, w: width - 64, h: 430 };

  ctx.save();
  ctx.beginPath();
  if (style === 2) {
    ctx.ellipse(width / 2, photo.y + photo.h / 2, photo.w / 2.3, photo.h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(photo.x, photo.y, photo.w, photo.h);
  }
  ctx.clip();
  if (img) {
    coverImage(ctx, img, photo.x, photo.y, photo.w, photo.h);
    const wash = ctx.createLinearGradient(0, photo.y, 0, photo.y + photo.h);
    wash.addColorStop(0, 'rgba(10,10,10,.05)');
    wash.addColorStop(1, 'rgba(10,10,10,.42)');
    ctx.fillStyle = wash;
    ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    if (index % 3 === 0) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(202,0,25,.28)';
      ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
      ctx.globalCompositeOperation = 'source-over';
    }
  } else {
    // Graphic placeholder while (or if) the photo loads: concentric brand rings.
    const g = ctx.createLinearGradient(photo.x, photo.y, photo.x + photo.w, photo.y + photo.h);
    g.addColorStop(0, palette.soft);
    g.addColorStop(1, palette.accent);
    ctx.fillStyle = g;
    ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    for (let r = 30; r < 520; r += 34) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(photo.x + photo.w * 0.7, photo.y + photo.h * 0.55, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  const lines = variant.title.split('\n');
  ctx.fillStyle = palette.ink;
  if (style === 0) {
    ctx.font = '800 92px Manrope, Arial, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, 48, 628 + i * 86));
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(width - 110, 600, 34, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 1) {
    ctx.font = 'italic 84px "Instrument Serif", Georgia, serif';
    ctx.fillText(lines.join(' '), 52, 712);
  } else if (style === 2) {
    ctx.textAlign = 'center';
    ctx.font = '800 78px Manrope, Arial, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, width / 2, 610 + i * 76));
    ctx.textAlign = 'left';
  } else {
    ctx.font = '800 74px Manrope, Arial, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, 52, 612 + i * 72));
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width - 160, 650, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width - 160, 650, 50, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = palette.ink;
  ctx.font = '500 14px "DM Mono", monospace';
  ctx.fillText(variant.overline, 52, 817);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(52, 836, width - 104, 1.5);
  ctx.fillStyle = palette.ink;
  ctx.font = '500 12px "DM Mono", monospace';
  ctx.fillText(variant.footer, 52, 862);
  ctx.textAlign = 'right';
  ctx.fillText('THEUNIQUES.IN', width - 52, 862);
  ctx.textAlign = 'left';
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createPosterTexture(index, renderer, disposed) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 900;
  drawPoster(canvas, index, null);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  let photo = null;
  const redraw = () => {
    if (disposed.current) return;
    drawPoster(canvas, index, photo);
    texture.needsUpdate = true;
  };
  // Web fonts may arrive after the first paint of the canvas.
  document.fonts?.ready.then(redraw);

  // Remote photo first (needs CORS for WebGL); local copy if that fails.
  const { src, fallback } = PHOTOS[index % PHOTOS.length];
  loadImage(src)
    .catch(() => loadImage(fallback))
    .then((img) => {
      photo = img;
      redraw();
    })
    .catch(() => {});
  return texture;
}

function createFixture(group, localZ, glowMaterial, plateMaterial, bulbGeometry) {
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.07, 1.1), plateMaterial);
  plate.position.set(0, HALF_HEIGHT - 0.32, localZ);
  group.add(plate);
  for (let row = -1; row <= 1; row += 1) {
    for (let col = -2; col <= 2; col += 1) {
      const bulb = new THREE.Mesh(bulbGeometry, glowMaterial);
      bulb.scale.set(1, 0.5, 1);
      bulb.position.set(col * 0.27, HALF_HEIGHT - 0.25, localZ + row * 0.25);
      group.add(bulb);
    }
  }
}

function buildScene(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (error) {
    return null;
  }
  const disposed = { current: false };
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#060606');
  scene.fog = new THREE.FogExp2('#060606', 0.011);

  const camera = new THREE.PerspectiveCamera(76, 1, 0.1, 330);
  camera.position.set(0, 0.02, 11.5);

  scene.add(new THREE.HemisphereLight(0xf1ece4, 0x140608, 1.3));
  scene.add(new THREE.AmbientLight(0x9a8f88, 0.6));
  const keyLight = new THREE.DirectionalLight(0xfff1e6, 1.45);
  keyLight.position.set(-1, 6, 4);
  scene.add(keyLight);

  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x030303, metalness: 0.3, roughness: 0.42 });
  const plateMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.3, roughness: 0.5 });
  const glowMaterial = new THREE.MeshStandardMaterial({ color: 0xfff3e6, emissive: 0xffe0c4, emissiveIntensity: 2.6, roughness: 0.25 });
  const redGlow = new THREE.MeshStandardMaterial({ color: 0xff2a3d, emissive: 0xca0019, emissiveIntensity: 3.2 });

  const textures = Array.from({ length: TEXTURE_COUNT }, (_, i) => createPosterTexture(i, renderer, disposed));
  const wallGeometry = new THREE.PlaneGeometry(GAP * 0.92, HALF_HEIGHT * 2 - 0.54);
  const deckGeometry = new THREE.PlaneGeometry(HALF_WIDTH * 2 - 0.38, GAP * 0.92);
  const ringV = new THREE.BoxGeometry(0.24, HALF_HEIGHT * 2, 0.3);
  const ringH = new THREE.BoxGeometry(HALF_WIDTH * 2, 0.24, 0.3);
  const rail = new THREE.BoxGeometry(0.17, 0.17, GAP);
  const neon = new THREE.BoxGeometry(0.05, HALF_HEIGHT * 2 - 0.6, 0.05);
  const bulbGeometry = new THREE.SphereGeometry(0.11, 12, 8);
  const materials = [];
  const segmentGroups = [];

  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    const group = new THREE.Group();
    group.position.z = -i * GAP;
    scene.add(group);
    segmentGroups.push(group);

    const mat = (t) => {
      const m = new THREE.MeshStandardMaterial({ map: textures[t % TEXTURE_COUNT], roughness: 0.88, metalness: 0 });
      materials.push(m);
      return m;
    };
    const centerZ = -GAP / 2;
    const left = new THREE.Mesh(wallGeometry, mat(i * 3));
    left.position.set(-HALF_WIDTH + 0.08, 0, centerZ);
    left.rotation.y = Math.PI / 2;
    const right = new THREE.Mesh(wallGeometry, mat(i * 3 + 7));
    right.position.set(HALF_WIDTH - 0.08, 0, centerZ);
    right.rotation.y = -Math.PI / 2;
    const floor = new THREE.Mesh(deckGeometry, mat(i * 3 + 13));
    floor.position.set(0, -HALF_HEIGHT + 0.08, centerZ);
    floor.rotation.x = -Math.PI / 2;
    const ceiling = new THREE.Mesh(deckGeometry, mat(i * 3 + 19));
    ceiling.position.set(0, HALF_HEIGHT - 0.08, centerZ);
    ceiling.rotation.x = Math.PI / 2;
    group.add(left, right, floor, ceiling);

    [[-HALF_WIDTH, 0, ringV], [HALF_WIDTH, 0, ringV], [0, HALF_HEIGHT, ringH], [0, -HALF_HEIGHT, ringH]].forEach(([x, y, g]) => {
      const bar = new THREE.Mesh(g, frameMaterial);
      bar.position.set(x, y, 0);
      group.add(bar);
    });
    for (const x of [-HALF_WIDTH + 0.02, HALF_WIDTH - 0.02]) {
      for (const y of [-HALF_HEIGHT + 0.02, HALF_HEIGHT - 0.02]) {
        const r = new THREE.Mesh(rail, frameMaterial);
        r.position.set(x, y, -GAP / 2);
        group.add(r);
      }
    }
    // Every fourth rib carries a red neon strip — the brand signature in the corridor.
    if (i % 4 === 0) {
      for (const x of [-HALF_WIDTH + 0.16, HALF_WIDTH - 0.16]) {
        const strip = new THREE.Mesh(neon, redGlow);
        strip.position.set(x, 0, 0.18);
        group.add(strip);
      }
    }
    if (i % 3 === 1) createFixture(group, centerZ, glowMaterial, plateMaterial, bulbGeometry);
    if (i % 6 === 2) {
      const bounce = new THREE.PointLight(0xca0019, 3.2, 18, 2);
      bounce.position.set(0, 1.8, centerZ);
      group.add(bounce);
    }
  }

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    camera.aspect = width / height;
    const referenceAspect = Math.min(1.05, camera.aspect);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(76 / 2)) * referenceAspect / camera.aspect));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  resize();

  return {
    renderer, scene, camera, segmentGroups, resize,
    dispose() {
      disposed.current = true;
      renderer.dispose();
      textures.forEach((t) => t.dispose());
      materials.forEach((m) => m.dispose());
      [frameMaterial, plateMaterial, glowMaterial, redGlow].forEach((m) => m.dispose());
      [wallGeometry, deckGeometry, ringV, ringH, rail, neon, bulbGeometry].forEach((g) => g.dispose());
      scene.traverse((o) => {
        if (o.isMesh && o.geometry?.type === 'BoxGeometry' && ![ringV, ringH, rail, neon].includes(o.geometry)) o.geometry.dispose();
      });
    },
  };
}

export default function HeroTunnel() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const pausedRef = useRef(false);
  const progressRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [noWebgl, setNoWebgl] = useState(false);
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      pausedRef.current = true;
      setPaused(true);
    }
    const built = buildScene(canvas);
    if (!built) {
      setNoWebgl(true);
      return undefined;
    }
    const { camera, segmentGroups: groups, renderer, scene } = built;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      progressRef.current = p;
      section.style.setProperty('--hero-p', p.toFixed(4));
    };
    let visible = true;
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    io.observe(section);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', built.resize);
    onScroll();

    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let counter = 0;
    let shown = 1;
    let speed = 1;
    let lastScroll = window.scrollY;

    const animate = (now) => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(0.045, last ? (now - last) / 1000 : 0.016);
      last = now;
      if (!visible || document.hidden) return;

      // Scrolling pushes the camera forward; it eases back to cruising speed.
      const scrollDelta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      const targetSpeed = 1 + Math.min(4, scrollDelta * 0.09) + progressRef.current * 1.4;
      speed += (targetSpeed - speed) * Math.min(1, dt * 3);

      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 1.7);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 1.7);

      if (!pausedRef.current) {
        elapsed += dt;
        const travel = 2.45 * speed * dt;
        for (const g of groups) g.position.z += travel;
        counter += travel;
        if (counter > 2.6) {
          counter = 0;
          shown = (shown % TEXTURE_COUNT) + 1;
          setFrame(shown);
        }
        let furthest = Infinity;
        for (const g of groups) furthest = Math.min(furthest, g.position.z);
        for (const g of groups) {
          if (g.position.z > camera.position.z + GAP * 0.72) {
            g.position.z = furthest - GAP;
            furthest = g.position.z;
          }
        }
      }

      const driftX = Math.sin(elapsed * 0.24) * 0.17;
      const driftY = Math.sin(elapsed * 0.35) * 0.055;
      camera.position.x += ((driftX + pointer.x * 0.16) - camera.position.x) * Math.min(1, dt * 1.1);
      camera.position.y += ((driftY - pointer.y * 0.1) - camera.position.y) * Math.min(1, dt * 1.1);
      camera.rotation.z = Math.sin(elapsed * 0.18) * 0.012 + progressRef.current * 0.06;
      camera.lookAt(pointer.x * 0.24, pointer.y * -0.12, -50);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    const onKey = (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(document.activeElement?.tagName) && visible && progressRef.current < 0.9) {
        e.preventDefault();
        setPaused((p) => { pausedRef.current = !p; return !p; });
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', built.resize);
      window.removeEventListener('keydown', onKey);
      built.dispose();
    };
  }, []);

  const toggle = () => setPaused((p) => { pausedRef.current = !p; return !p; });

  return (
    <section className="hero" ref={sectionRef} id="top" aria-label="The Uniques Community — immersive 3D introduction">
      <div className="hero-sticky">
        <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-grain" aria-hidden="true" />

        <div className="hero-content">
          <a className="hero-pill" href="#events">
            <span className="hero-pill-dot" />{HERO.pill}
          </a>
          <h1 className="hero-title">
            <span className="hero-line"><span>{HERO.title[0]}</span></span>
            <span className="hero-line"><span>{HERO.title[1]}</span></span>
            <span className="hero-line hero-line-accent"><span><em>Dreamers</em> &amp; Doers.</span></span>
          </h1>
          <p className="hero-sub">{HERO.sub}</p>
          <div className="hero-actions">
            <a className="btn btn-red" href={JOIN_URL} target="_blank" rel="noreferrer">Join Us <span aria-hidden="true">↗</span></a>
            <a className="btn btn-ghost" href="#about">Explore the community</a>
          </div>
        </div>

        <div className="hero-side" aria-hidden="true">
          <span className="hero-side-line" />
          <span>A continuous journey through the community</span>
        </div>

        <div className="hero-bottom">
          <div className="hero-tags" aria-label="Who we are">
            <div className="hero-tags-track">
              {[...HERO.tags, ...HERO.tags].map((tag, i) => (
                <span key={`${tag}-${i}`} aria-hidden={i >= HERO.tags.length}>{tag}<i>✦</i></span>
              ))}
            </div>
          </div>
          <div className="hero-hud">
            <span className="hero-counter">FRAME {String(frame).padStart(2, '0')} / {TEXTURE_COUNT}</span>
            <button type="button" className="hero-motion" onClick={toggle} aria-pressed={paused}>
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>{paused ? 'Resume motion' : 'Pause motion'}
            </button>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true"><span>Scroll to fly</span><i /></div>
        {noWebgl && <div className="hero-fallback" role="status">This experience is best viewed in a browser with WebGL enabled.</div>}
      </div>
    </section>
  );
}
