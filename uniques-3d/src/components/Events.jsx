import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EVENTS, SITE, photo } from '../data.js';
import { Eyebrow, Reveal, SmartImg, useInView, usePrefersReducedMotion } from './shared.jsx';
import '../styles/ribbon.css';

function PanelArt({ event, index }) {
  const img = photo(index * 2 + 2);
  const no = `Nº ${String(index + 1).padStart(2, '0')}`;
  const variant = index % 4;
  if (variant === 0) {
    return (
      <div className="rb-art rb-full">
        <SmartImg src={img.src} fallback={img.fallback} alt="" />
        <div className="rb-shade" />
        <span className="rb-kicker">{no} / {event.category}</span>
        <h3>{event.title}</h3>
        <span className="rb-foot">THE UNIQUES · EVENTS</span>
      </div>
    );
  }
  if (variant === 1) {
    return (
      <div className="rb-art rb-framed">
        <div className="rb-framed-photo"><SmartImg src={img.src} fallback={img.fallback} alt="" /></div>
        <span className="rb-framed-cat">{event.category}</span>
        <h3>{event.title}</h3>
        <span className="rb-foot">{no}</span>
      </div>
    );
  }
  if (variant === 2) {
    return (
      <div className="rb-art rb-red">
        <span className="rb-kicker">{no} / {event.category}</span>
        <h3>{event.title}</h3>
        <div className="rb-scallops" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} className={i % 6 === 0 || i % 6 === 5 ? 'is-offset' : ''} />)}</div>
        <span className="rb-foot">EXPERIENCE THE EXCITEMENT</span>
      </div>
    );
  }
  return (
    <div className="rb-art rb-split">
      <div className="rb-split-photo"><SmartImg src={img.src} fallback={img.fallback} alt="" /></div>
      <div className="rb-split-copy">
        <span className="rb-split-no">{String(index + 1).padStart(2, '0')}</span>
        <h3>{event.title}</h3>
        <small>{event.category.toUpperCase()}<br />THE UNIQUES COMMUNITY</small>
      </div>
    </div>
  );
}

export default function Events() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState({ start: null, delta: 0 });
  const [stageRef, inView] = useInView({ threshold: 0.35 }, false);
  const hovering = useRef(false);
  const step = useCallback((d) => setActive((i) => (i + d + EVENTS.length) % EVENTS.length), []);

  useEffect(() => {
    if (paused || reduced || !inView) return undefined;
    const t = setInterval(() => { if (!hovering.current) step(1); }, 2400);
    return () => clearInterval(t);
  }, [paused, reduced, inView, step]);

  useEffect(() => {
    if (!inView) return undefined;
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inView, step]);

  const onDown = (e) => setDrag({ start: e.clientX, delta: 0 });
  const onMove = (e) => { if (drag.start !== null) setDrag((d) => ({ ...d, delta: e.clientX - d.start })); };
  const onUp = () => {
    if (drag.start !== null && Math.abs(drag.delta) > 45) step(drag.delta < 0 ? 1 : -1);
    setDrag({ start: null, delta: 0 });
  };

  return (
    <section className="events" id="events">
      <div
        className="rb-stage grain"
        ref={stageRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => { hovering.current = true; }}
        onPointerLeave={() => { hovering.current = false; onUp(); }}
      >
        <div className="rb-head wrap">
          <div>
            <Reveal><Eyebrow index="06">Our Events</Eyebrow></Reveal>
            <Reveal as="h2" className="display" delay={80}>Experience the <em>excitement</em><span className="red">.</span></Reveal>
          </div>
          <Reveal delay={160}><a className="btn btn-ghost" href={`${SITE}/events`} target="_blank" rel="noreferrer">View All <span aria-hidden="true">↗</span></a></Reveal>
        </div>

        <div className="rb-space">
          {EVENTS.map((event, index) => {
            let offset = index - active;
            if (offset > EVENTS.length / 2) offset -= EVENTS.length;
            if (offset < -EVENTS.length / 2) offset += EVENTS.length;
            const distance = Math.abs(offset);
            const scale = distance === 0 ? 1 : distance === 1 ? 0.78 : distance === 2 ? 0.56 : 0.38;
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.96 : distance === 2 ? 0.7 : distance === 3 ? 0.25 : 0;
            return (
              <button
                key={event.title}
                type="button"
                className={`rb-panel ${distance === 0 ? 'is-active' : ''}`}
                style={{
                  '--x': `calc(${offset * 25}vw + ${distance === 0 && drag.start !== null ? drag.delta * 0.3 : 0}px)`,
                  '--z': `${distance * -150}px`,
                  '--r': `${offset === 0 ? 0 : offset < 0 ? 54 : -54}deg`,
                  '--s': scale,
                  '--o': opacity,
                  '--layer': 30 - distance,
                }}
                onClick={() => setActive(index)}
                aria-label={`${event.title} — ${event.category}`}
                aria-current={distance === 0 ? 'true' : undefined}
                tabIndex={distance <= 2 ? 0 : -1}
              >
                <PanelArt event={event} index={index} />
              </button>
            );
          })}
        </div>

        <div className="rb-bottom wrap">
          <div className="rb-caption">
            <span className="rb-count">{String(active + 1).padStart(2, '0')} <i>/</i> {String(EVENTS.length).padStart(2, '0')}</span>
            <span>{EVENTS[active].title}</span>
          </div>
          <div className="ec-controls">
            <button type="button" onClick={() => step(-1)} aria-label="Previous event">←</button>
            <button type="button" className="ec-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>{paused ? 'Play' : 'Pause'}
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next event">→</button>
          </div>
        </div>
      </div>
    </section>
  );
}
