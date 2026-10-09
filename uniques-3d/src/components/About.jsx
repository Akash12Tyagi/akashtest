import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ABOUT, FOCUS, MARK, photo } from '../data.js';
import { Eyebrow, Reveal, SmartImg, useInView, usePrefersReducedMotion } from './shared.jsx';
import '../styles/carousel.css';

function DotMark() {
  return (
    <div className="ec-mark" aria-hidden="true">
      {Array.from({ length: 25 }, (_, i) => <span key={i} className={(i === 12 || (i % 2 === 0 && i > 5 && i < 19)) ? 'is-red' : ''} />)}
    </div>
  );
}

function FocusArtwork({ card, index }) {
  const img = photo(index * 4 + 1);
  const no = `Nº 0${index + 1}`;
  switch (card.kind) {
    case 'photo':
      return (
        <div className="ec-art ec-photo">
          <SmartImg className="ec-cover" src={img.src} fallback={img.fallback} alt="" />
          <div className="ec-photo-shade" />
          <span className="ec-meta ec-top">{no} / MAIN FOCUS</span>
          <h3>Community<br /><i>engagement.</i></h3>
          <p className="ec-body">{card.text}</p>
        </div>
      );
    case 'split':
      return (
        <div className="ec-art ec-split">
          <div className="ec-split-photo"><SmartImg src={img.src} fallback={img.fallback} alt="" /></div>
          <div className="ec-split-copy">
            <span className="ec-meta">{no}</span>
            <strong>Volun<br />teer<br />Programs</strong>
            <small>{card.text}</small>
          </div>
        </div>
      );
    case 'type':
      return (
        <div className="ec-art ec-type">
          <span className="ec-meta ec-top">{no} / HIGHLIGHT</span>
          <h3>SKILL<br />DEVELOP<br />MENT<span>&amp; implementation</span></h3>
          <p className="ec-body">{card.text}</p>
          <div className="ec-type-pattern" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>
        </div>
      );
    case 'oval':
      return (
        <div className="ec-art ec-oval">
          <div className="ec-oval-img"><SmartImg src={img.src} fallback={img.fallback} alt="" /></div>
          <p>A welcoming<br />space for<br />everyone.</p>
          <span className="ec-rule" />
          <span className="ec-meta">{no} / INCLUSIVE ENVIRONMENT</span>
        </div>
      );
    case 'framed':
    default:
      return (
        <div className="ec-art ec-framed">
          <span className="ec-meta ec-framed-no">{no}</span>
          <div className="ec-paper">
            <div className="ec-paper-photo"><SmartImg src={img.src} fallback={img.fallback} alt="" /><DotMark /></div>
            <strong>collab<br />oration</strong>
            <span className="ec-paper-sub">DRIVE MEANINGFUL CHANGE</span>
          </div>
        </div>
      );
  }
}

function FocusCarousel() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(2);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState({ start: null, delta: 0 });
  const [stageRef, inView] = useInView({ threshold: 0.35 }, false);
  const hovering = useRef(false);

  const step = useCallback((d) => setActive((i) => (i + d + FOCUS.length) % FOCUS.length), []);

  useEffect(() => {
    if (paused || reduced || !inView) return undefined;
    const t = setInterval(() => { if (!hovering.current) step(1); }, 2600);
    return () => clearInterval(t);
  }, [paused, reduced, inView, step]);

  const onDown = (e) => setDrag({ start: e.clientX, delta: 0 });
  const onMove = (e) => { if (drag.start !== null) setDrag((d) => ({ ...d, delta: e.clientX - d.start })); };
  const onUp = () => {
    if (drag.start !== null && Math.abs(drag.delta) > 50) step(drag.delta < 0 ? 1 : -1);
    setDrag({ start: null, delta: 0 });
  };

  return (
    <div className="ec">
      <div
        className="ec-stage grain"
        ref={stageRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => { hovering.current = true; }}
        onPointerLeave={() => { hovering.current = false; onUp(); }}
      >
        <div className="ec-topline">
          <span>Our Main Focus</span>
          <span className="ec-live"><i /> Five pillars</span>
        </div>
        <div className="ec-cards">
          {FOCUS.map((card, index) => {
            let offset = index - active;
            if (offset > FOCUS.length / 2) offset -= FOCUS.length;
            if (offset < -FOCUS.length / 2) offset += FOCUS.length;
            const distance = Math.abs(offset);
            return (
              <button
                key={card.id}
                type="button"
                className={`ec-card ${distance === 0 ? 'is-active' : ''}`}
                style={{
                  '--x': `${offset * 86}%`,
                  '--z': `${distance * -220}px`,
                  '--ry': `${offset * -16}deg`,
                  '--s': distance === 0 ? 1 : distance === 1 ? 0.7 : 0.48,
                  '--o': distance === 0 ? 1 : distance === 1 ? 0.88 : 0.3,
                  '--layer': 20 - distance,
                  '--drag': drag.start !== null && distance === 0 ? `${drag.delta * 0.25}px` : '0px',
                }}
                onClick={() => setActive(index)}
                aria-label={`${card.label}: ${card.text}`}
                aria-current={distance === 0 ? 'true' : undefined}
                tabIndex={distance <= 1 ? 0 : -1}
              >
                <FocusArtwork card={card} index={index} />
              </button>
            );
          })}
        </div>
        <div className="ec-bottomline">
          <div className="ec-caption">
            <span className="ec-count">{String(active + 1).padStart(2, '0')} <i>/</i> {String(FOCUS.length).padStart(2, '0')}</span>
            <span className="ec-title">{FOCUS[active].label}</span>
          </div>
          <div className="ec-controls">
            <button type="button" onClick={() => step(-1)} aria-label="Previous focus">←</button>
            <button type="button" className="ec-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
              <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>{paused ? 'Play' : 'Pause'}
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next focus">→</button>
          </div>
        </div>
        <div className="ec-progress" aria-hidden="true"><span style={{ width: `${((active + 1) / FOCUS.length) * 100}%` }} /></div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section className="section about" id="about">
      <div className="about-bgword" aria-hidden="true"><span>The Uniques</span><span>Community</span></div>
      <div className="wrap">
        <div className="about-grid">
          <div>
            <Reveal><Eyebrow index="02">{ABOUT.eyebrow}</Eyebrow></Reveal>
            <Reveal as="h2" className="display" delay={80}>{ABOUT.title}</Reveal>
            <Reveal as="p" className="about-sub serif" delay={160}>{ABOUT.sub}</Reveal>
          </div>
          <Reveal className="about-quote" delay={200}>
            <img className="about-mark" src={MARK} alt="" aria-hidden="true" />
            <blockquote>
              <p>“{ABOUT.quote[0]}</p>
              <p className="about-quote-2">{ABOUT.quote[1]}”</p>
            </blockquote>
          </Reveal>
        </div>
        <Reveal delay={100}><FocusCarousel /></Reveal>
      </div>
    </section>
  );
}
