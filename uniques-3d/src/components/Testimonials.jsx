import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TESTIMONIALS } from '../data.js';
import { Eyebrow, Reveal, useInView, usePrefersReducedMotion } from './shared.jsx';

const KEYS = Object.keys(TESTIMONIALS);
const initials = (name) => name.replace(/^(Dr\.|Prof\.)\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('');

function Avatar({ person }) {
  const [failed, setFailed] = useState(false);
  if (person.image && !failed) {
    return <img className="tm-avatar" src={person.image} alt="" loading="lazy" onError={() => setFailed(true)} />;
  }
  return <span className="tm-avatar tm-initials" aria-hidden="true">{initials(person.name)}</span>;
}

export default function Testimonials() {
  const reduced = usePrefersReducedMotion();
  const [tab, setTab] = useState('students');
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.3 }, false);
  const hovering = useRef(false);
  const group = TESTIMONIALS[tab];
  const n = group.items.length;

  const step = useCallback((d) => setActive((i) => (i + d + n) % n), [n]);
  useEffect(() => { setActive(0); }, [tab]);
  useEffect(() => {
    if (reduced || !inView) return undefined;
    const t = setInterval(() => { if (!hovering.current) step(1); }, 4200);
    return () => clearInterval(t);
  }, [reduced, inView, step, tab]);

  return (
    <section className="section tm" id="stories" ref={ref}>
      <div className="wrap">
        <div className="tm-head">
          <div>
            <Reveal><Eyebrow index="09">Testimonials</Eyebrow></Reveal>
            <Reveal as="h2" className="display" delay={80}>Testimonials from Our <em key={tab} className="tm-swap">{group.heading}</em></Reveal>
            <Reveal as="p" className="lead" delay={140}>{group.text}</Reveal>
          </div>
          <Reveal delay={200} className="tm-tabs" role="tablist" aria-label="Testimonial groups">
            {KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={tab === key ? 'is-active' : ''}
                onClick={() => setTab(key)}
              >
                {TESTIMONIALS[key].label}
              </button>
            ))}
          </Reveal>
        </div>

        <div
          className="tm-deck"
          role="tabpanel"
          aria-live="polite"
          onPointerEnter={() => { hovering.current = true; }}
          onPointerLeave={() => { hovering.current = false; }}
        >
          {group.items.map((person, i) => {
            const offset = (i - active + n) % n;
            return (
              <article
                key={`${tab}-${person.name}`}
                className={`tm-card ${offset === 0 ? 'is-active' : ''}`}
                style={{ '--d': offset, '--layer': 10 - offset }}
                aria-hidden={offset !== 0}
                onClick={() => offset !== 0 && setActive(i)}
              >
                <div className="tm-card-top">
                  <span className="tm-tag">{person.tag}</span>
                  <span className="tm-stars" aria-label="Rated 5 out of 5">★★★★★</span>
                </div>
                <blockquote>“{person.quote}”</blockquote>
                <footer>
                  <Avatar person={person} />
                  <div>
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
                  </div>
                  <span className="tm-quote-mark" aria-hidden="true">”</span>
                </footer>
              </article>
            );
          })}
        </div>
        <div className="tm-controls">
          <div className="tm-dots">
            {group.items.map((p, i) => (
              <button key={p.name} type="button" className={i === active ? 'is-active' : ''} onClick={() => setActive(i)} aria-label={`Show testimonial from ${p.name}`} />
            ))}
          </div>
          <div className="ec-controls">
            <button type="button" onClick={() => step(-1)} aria-label="Previous testimonial">←</button>
            <button type="button" onClick={() => step(1)} aria-label="Next testimonial">→</button>
          </div>
        </div>
      </div>
    </section>
  );
}
