import React from 'react';
import { PARTNERS } from '../data.js';
import { Reveal, Eyebrow } from './shared.jsx';

export default function Partners() {
  const step = 360 / PARTNERS.logos.length;
  return (
    <section className="section partners" id="partners">
      <div className="wrap partners-wrap">
        <div className="partners-copy">
          <Reveal><Eyebrow index="04">Partners</Eyebrow></Reveal>
          <Reveal as="h2" className="display" delay={80}>Trusted by <em>Industry</em> Leaders<span className="red">.</span></Reveal>
          <div className="partners-stats">
            {PARTNERS.stats.map((s, i) => (
              <Reveal key={s.label} delay={160 + i * 100} className="partners-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal className="ring-scene" delay={120} aria-label={`Partner ecosystem: ${PARTNERS.logos.join(', ')}`} role="img">
          <div className="ring-floor" aria-hidden="true" />
          <div className="ring" aria-hidden="true">
            {PARTNERS.logos.map((name, i) => (
              <div key={name} className="ring-tile" style={{ '--a': `${i * step}deg` }}>
                <span>{name}</span>
              </div>
            ))}
          </div>
          <div className="ring-core" aria-hidden="true"><span>TU</span></div>
        </Reveal>
      </div>
      <div className="partners-marquee" aria-hidden="true">
        <div className="partners-track">
          {[...PARTNERS.logos, ...PARTNERS.logos].map((name, i) => <span key={i}>{name}</span>)}
        </div>
      </div>
    </section>
  );
}
