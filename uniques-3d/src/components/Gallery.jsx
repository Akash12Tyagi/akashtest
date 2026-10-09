import React, { useEffect, useRef, useState } from 'react';
import { PHOTOS } from '../data.js';
import { Eyebrow, Reveal, SmartImg, usePrefersReducedMotion } from './shared.jsx';

// A draggable 3D cylinder holding every community photo.
export default function Gallery() {
  const reduced = usePrefersReducedMotion();
  const sceneRef = useRef(null);
  const ringRef = useRef(null);
  const state = useRef({ angle: 0, velocity: 0, dragging: false, lastX: 0, tilt: 0, targetTilt: 0, visible: false });
  const [lightbox, setLightbox] = useState(null);
  const count = PHOTOS.length;
  const step = 360 / count;

  useEffect(() => {
    const scene = sceneRef.current;
    const ring = ringRef.current;
    const s = state.current;
    const io = new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(scene);
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!s.visible) return;
      if (!s.dragging) {
        s.velocity *= 0.95;
        s.angle += s.velocity + (reduced ? 0 : 0.06);
      }
      s.tilt += (s.targetTilt - s.tilt) * 0.06;
      ring.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${s.tilt}deg) rotateY(${s.angle}deg)`;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [reduced]);

  const onDown = (e) => {
    const s = state.current;
    s.dragging = true;
    s.moved = 0;
    s.lastX = e.clientX;
    s.velocity = 0;
  };
  const onMove = (e) => {
    const s = state.current;
    const rect = sceneRef.current.getBoundingClientRect();
    s.targetTilt = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.moved += Math.abs(dx);
    s.angle += dx * 0.18;
    s.velocity = dx * 0.18;
  };
  const onUp = () => { state.current.dragging = false; };
  const open = (i) => { if ((state.current.moved || 0) < 6) setLightbox(i); };

  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % count);
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + count) % count);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, count]);

  return (
    <section className="section gallery" id="gallery">
      <div className="wrap gallery-head">
        <Reveal><Eyebrow index="07">Gallery</Eyebrow></Reveal>
        <Reveal as="h2" className="display" delay={80}>Moments that <em>made</em> us<span className="red">.</span></Reveal>
        <Reveal as="p" className="lead" delay={160}>Hackathon wins, summits, masterclasses and late-night builds — {count} frames from the community. Drag to spin, tap to open.</Reveal>
      </div>
      <div
        className="cyl-scene"
        ref={sceneRef}
        style={{ '--count': count }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
      >
        <div className="cyl-ring" ref={ringRef}>
          {PHOTOS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              className="cyl-item"
              style={{ '--a': `${i * step}deg`, '--h': `${(i % 3) * 14 - 14}px` }}
              onClick={() => open(i)}
              aria-label={`Open community photo ${i + 1}`}
            >
              <SmartImg src={p.src} fallback={p.fallback} alt="" />
              <span className="cyl-cap">{String(i + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
        <div className="cyl-floor" aria-hidden="true" />
      </div>

      {lightbox !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightbox(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <SmartImg src={PHOTOS[lightbox].src} fallback={PHOTOS[lightbox].fallback} alt={`Community photo ${lightbox + 1}`} />
            <figcaption>
              <span>{String(lightbox + 1).padStart(2, '0')} / {count}</span>
              <div className="lightbox-nav">
                <button type="button" onClick={() => setLightbox((i) => (i - 1 + count) % count)} aria-label="Previous photo">←</button>
                <button type="button" onClick={() => setLightbox((i) => (i + 1) % count)} aria-label="Next photo">→</button>
                <button type="button" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
              </div>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
