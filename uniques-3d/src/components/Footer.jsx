import React from 'react';
import { FOOTER, LOGO, SITE } from '../data.js';

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
