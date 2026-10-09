import React from 'react';
import { FOOTER, JOIN_URL, LOGO, SITE } from '../data.js';
import { Reveal } from './shared.jsx';

export function CallToAction() {
  return (
    <section className="cta" id="join">
      <div className="cta-orbit" aria-hidden="true">
        <span className="cta-ring r1" /><span className="cta-ring r2" /><span className="cta-ring r3" />
      </div>
      <div className="wrap cta-inner">
        <Reveal as="h2" className="cta-title">Join Us <em>Today</em></Reveal>
        <Reveal as="p" className="lead cta-lead" delay={100}>Join the community of unique individuals and learn from the best</Reveal>
        <Reveal className="cta-actions" delay={180}>
          <a className="btn btn-red" href={JOIN_URL} target="_blank" rel="noreferrer">Join on WhatsApp <span aria-hidden="true">↗</span></a>
          <a className="btn btn-ghost" href={`${SITE}/auth/login`} target="_blank" rel="noreferrer">Login</a>
        </Reveal>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src={LOGO} alt="The Uniques Community" />
            <p>{FOOTER.about}</p>
          </div>
          {FOOTER.columns.map((col) => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={label}><a href={SITE + href} target="_blank" rel="noreferrer">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-word" aria-hidden="true">UNIQUES</div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} The Uniques Community. All rights reserved.</span>
          <div className="footer-socials">
            {FOOTER.socials.map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
