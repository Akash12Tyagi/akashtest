import React from 'react';
import { STATS } from '../data.js';
import { Eyebrow, Reveal, Tilt, useCountUp, useInView } from './shared.jsx';

function Stat({ stat, index, start }) {
  const value = useCountUp(stat.value, start, 2000 + index * 250);
  return (
    <Reveal delay={index * 110} className="stat-cell">
      <Tilt className="stat-card" max={12}>
        <div className="stat-glow" aria-hidden="true" />
        <span className="stat-index">0{index + 1}</span>
        <div className="stat-value" aria-label={`${stat.prefix || ''}${stat.value.toLocaleString('en-IN')} plus`}>
          <span aria-hidden="true">{stat.prefix}{value.toLocaleString('en-IN')}<b>+</b></span>
        </div>
        <div className="stat-label">{stat.label}</div>
        <div className="stat-note">{stat.note}</div>
        <div className="stat-bar" aria-hidden="true"><span style={{ transform: `scaleX(${start ? value / stat.value : 0})` }} /></div>
      </Tilt>
    </Reveal>
  );
}

export default function Counts() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  return (
    <section className="section counts section-dots" id="impact" ref={ref}>
      <div className="wrap">
        <div className="section-head">
          <Reveal><Eyebrow index="01">Our Achievements</Eyebrow></Reveal>
          <Reveal as="h2" className="display" delay={80}>Making an <em>Impact</em><span className="red">.</span></Reveal>
        </div>
        <div className="stat-grid">
          {STATS.map((stat, i) => <Stat key={stat.label} stat={stat} index={i} start={inView} />)}
        </div>
      </div>
    </section>
  );
}
