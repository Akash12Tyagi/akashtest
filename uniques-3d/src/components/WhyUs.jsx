import React from 'react';
import { WHY } from '../data.js';
import { Eyebrow, Reveal, Tilt } from './shared.jsx';

const ICONS = [
  // Global networking — orbit
  <svg key="a" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="24" cy="24" r="17" /><ellipse cx="24" cy="24" rx="7.5" ry="17" /><path d="M7 24h34M10 15h28M10 33h28" /></svg>,
  // Hands-on learning — layered blocks
  <svg key="b" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M24 6 41 15 24 24 7 15z" /><path d="m7 24 17 9 17-9" /><path d="m7 33 17 9 17-9" /></svg>,
  // Startup acceleration — rocket trail
  <svg key="c" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M29 8c6 0 11 5 11 11L26 33l-11-11z" /><circle cx="30" cy="18" r="3" /><path d="M15 22 9 23l-3 5 9 1M26 33l-1 6-5 3-1-9M8 40l6-6" /></svg>,
  // Showcase — spotlight stage
  <svg key="d" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M24 6v6M10 12l4 4M38 12l-4 4" /><path d="M14 40h20l-4-18h-12z" /><path d="M8 42h32" /></svg>,
];

export default function WhyUs() {
  return (
    <section className="section why" id="why">
      <div className="wrap">
        <div className="why-head">
          <Reveal><Eyebrow index="03">{WHY.eyebrow}</Eyebrow></Reveal>
          <Reveal as="h2" className="display why-title" delay={80}>
            Driving <em>Innovation</em> Through Collaboration &amp; <span className="red">Visionary</span> Thinking
          </Reveal>
        </div>
        <div className="why-grid">
          {WHY.cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 120} className="why-cell">
              <Tilt className={`why-card ${i === 2 ? 'is-red' : ''}`} max={9}>
                <div className="why-shine" aria-hidden="true" />
                <div className="why-depth">
                  <div className="why-top">
                    <span className="why-icon" aria-hidden="true">{ICONS[i]}</span>
                    <span className="why-no">0{i + 1}</span>
                  </div>
                  <span className="why-kicker">{card.kicker}</span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
                <span className="why-ghost" aria-hidden="true">0{i + 1}</span>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
