import React, { useCallback, useEffect, useRef, useState } from 'react';
import Nav from './components/Nav.jsx';
import Chapters from './components/Chapters.jsx';
import Footer from './components/Footer.jsx';
import { SmartImg } from './components/shared.jsx';
import { PHOTOS, LOGO } from './data.js';
import { World, STATIONS } from './world/World.js';
import './styles/chrome.css';
import './styles/world.css';

const CHAPTER_NAMES = ['Intro', 'Journey', 'Impact', 'About', 'Why us', 'Partners', 'Startups', 'Events', 'Gallery', 'Channel', 'Stories', 'Join'];

function openExternal(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.click();
}

export default function App() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const tipRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [noWebgl, setNoWebgl] = useState(false);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [tip, setTip] = useState(null);
  const storiesRef = useRef({ items: [], active: 0 });

  const onStories = useCallback((items, idx) => {
    storiesRef.current = { items, active: idx };
    worldRef.current?.setStories(items, idx);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let world;
    try {
      world = new World(canvas, {
        mobile: window.innerWidth < 760,
        reduced,
        onPick: (data) => {
          if (data.type === 'url') openExternal(data.url);
          if (data.type === 'photo') setLightbox(data.index);
        },
        onHover: (data) => {
          setTip(data?.label || null);
          canvas.style.cursor = data ? 'pointer' : '';
        },
      });
    } catch (e) {
      setNoWebgl(true);
      setLoaded(true);
      document.body.classList.add('is-ready');
      return undefined;
    }
    worldRef.current = world;
    world.setStories(storiesRef.current.items, storiesRef.current.active);

    // Preloader: count up while the corridor's first posters arrive.
    let pct = 0;
    const tick = setInterval(() => { pct = Math.min(92, pct + Math.random() * 9); setProgress(Math.round(pct)); }, 90);
    world.tunnelReady.then(() => {
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => { setLoaded(true); document.body.classList.add('is-ready'); }, 450);
    });

    // Map scroll position to a float station index using each chapter's centre.
    let centers = [];
    const measure = () => {
      const els = Array.from(document.querySelectorAll('[data-chapter]'));
      centers = els.map((el) => ({ el, c: el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2 }));
    };
    const scrollToU = (y) => {
      if (!centers.length) return 0;
      if (y <= centers[0].c) return 0;
      for (let k = 0; k < centers.length - 1; k += 1) {
        const a = centers[k].c;
        const b = centers[k + 1].c;
        if (y < b) return k + (y - a) / (b - a);
      }
      return centers.length - 1;
    };
    const onResize = () => { measure(); world.resize(); };
    measure();
    window.addEventListener('resize', onResize);

    const onMove = (e) => {
      world.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      if (tipRef.current) tipRef.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`;
      if (e.target === canvas) world.pick(e.clientX, e.clientY, false);
      else world.pick(-9999, -9999, false);
    };
    let down = null;
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY, last: e.clientX, moved: 0 }; };
    const onDrag = (e) => {
      if (!down) return;
      const dx = e.clientX - down.last;
      down.last = e.clientX;
      down.moved += Math.abs(dx) + Math.abs(e.clientY - down.y) * 0.1;
      if (Math.abs(world.u - STATIONS.indexOf('gallery')) < 0.7) world.dragGallery(dx);
    };
    const onUp = (e) => {
      if (down && down.moved < 8) world.pick(e.clientX, e.clientY, true);
      down = null;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onDrag, { passive: true });
    window.addEventListener('pointerup', onUp);

    let raf = 0;
    let last = performance.now();
    let lastActive = -1;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const realDt = Math.min(1, (now - last) / 1000);
      const dt = Math.min(0.05, realDt);
      last = now;
      if (document.hidden) return;
      const y = window.scrollY;
      const u = scrollToU(y);
      // Chapter copy fades in around its station and out as the camera leaves.
      for (let k = 0; k < centers.length; k += 1) {
        const vis = Math.max(0, 1 - Math.abs(u - k) * 1.9);
        centers[k].el.style.setProperty('--vis', vis.toFixed(3));
        centers[k].el.classList.toggle('is-live', vis > 0.02);
      }
      const footer = document.querySelector('.footer');
      const past = footer ? footer.getBoundingClientRect().top < 0 : false;
      if (!past) world.render(u, dt, realDt);
      const a = Math.round(u);
      if (a !== lastActive) { lastActive = a; setActive(a); }
    };
    raf = requestAnimationFrame(loop);
    document.fonts?.ready.then(measure);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(tick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', onDrag);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (lightbox === null) return undefined;
    const n = PHOTOS.length;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % n);
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + n) % n);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const jump = (k) => {
    const el = document.querySelector(`[data-chapter="${k}"]`);
    if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2, behavior: 'smooth' });
  };

  return (
    <>
      <canvas ref={canvasRef} className={`world-canvas ${noWebgl ? 'is-off' : ''}`} aria-hidden="true" />
      <div className="world-vignette" aria-hidden="true" />

      <div className={`loader ${loaded ? 'is-done' : ''}`} aria-hidden={loaded}>
        <img src={LOGO} alt="" />
        <div className="loader-bar"><span style={{ transform: `scaleX(${progress / 100})` }} /></div>
        <span className="loader-pct">{String(progress).padStart(3, '0')}</span>
        <span className="loader-note">Building the world</span>
      </div>

      <Nav />

      <nav className="hud" aria-label="Chapters">
        {CHAPTER_NAMES.map((name, k) => (
          <button key={name} type="button" className={active === k ? 'is-active' : ''} onClick={() => jump(k)} aria-label={`Go to ${name}`}>
            <span className="hud-no">{String(k).padStart(2, '0')}</span>
            <span className="hud-name">{name}</span>
          </button>
        ))}
      </nav>
      <div className="hud-now" aria-hidden="true">
        <span>{String(active).padStart(2, '0')} / {String(CHAPTER_NAMES.length - 1).padStart(2, '0')}</span>
        <strong>{CHAPTER_NAMES[active]}</strong>
      </div>

      <main className="track">
        <Chapters active={active} onStories={onStories} onOpenGallery={setLightbox} />
      </main>
      <Footer />

      <div className={`tip ${tip ? 'is-on' : ''}`} ref={tipRef} aria-hidden="true">{tip}</div>

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightbox(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <SmartImg src={PHOTOS[lightbox].src} fallback={PHOTOS[lightbox].fallback} alt={`Community photo ${lightbox + 1}`} />
            <figcaption>
              <span>{String(lightbox + 1).padStart(2, '0')} / {PHOTOS.length}</span>
              <div className="lightbox-nav">
                <button type="button" onClick={() => setLightbox((i) => (i - 1 + PHOTOS.length) % PHOTOS.length)} aria-label="Previous photo">←</button>
                <button type="button" onClick={() => setLightbox((i) => (i + 1) % PHOTOS.length)} aria-label="Next photo">→</button>
                <button type="button" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
              </div>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
