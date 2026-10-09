import React, { useEffect, useRef } from 'react';
import { STARTUPS, photo } from '../data.js';
import { Eyebrow, Reveal, SmartImg } from './shared.jsx';

const THEMES = ['is-carbon', 'is-red', 'is-bone'];

export default function Startups() {
  const stackRef = useRef(null);

  // As the next card slides over, push the one beneath back in Z and dim it.
  useEffect(() => {
    const cards = Array.from(stackRef.current.children);
    let raf = 0;
    const update = () => {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        const browser = card.firstElementChild;
        if (!next) return;
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const cover = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
        browser.style.setProperty('--cover', cover.toFixed(3));
      });
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section className="section startups" id="startups">
      <div className="wrap">
        <div className="section-head">
          <Reveal><Eyebrow index="05">{STARTUPS.eyebrow}</Eyebrow></Reveal>
          <Reveal as="h2" className="display" delay={80}>Pioneering the Future with <em>Disruptive</em> Ideas &amp; Technology</Reveal>
        </div>
        <div className="stack" ref={stackRef}>
          {STARTUPS.items.map((item, i) => {
            const img = photo(i * 5 + 3);
            return (
              <article key={item.name} className={`stack-card ${THEMES[i]}`} style={{ '--i': i }}>
                <div className="stack-browser">
                  <div className="stack-chrome" aria-hidden="true">
                    <i /><i /><i />
                    <span className="stack-url">{item.domain}</span>
                  </div>
                  <div className="stack-body">
                    <div className="stack-copy">
                      <span className="stack-no">{item.no} / Startup</span>
                      <h3>{item.name}</h3>
                      <p>{item.text}</p>
                      <a className="btn btn-ghost stack-link" href={item.url} target="_blank" rel="noreferrer">Visit {item.domain} <span aria-hidden="true">↗</span></a>
                    </div>
                    <div className="stack-visual">
                      <SmartImg src={img.src} fallback={img.fallback} alt="" />
                      <span className="stack-badge">Built by Uniques</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
