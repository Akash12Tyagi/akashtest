import React, { useEffect, useState } from 'react';
import { JOIN_URL, LOGO, NAV } from '../data.js';

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav ${solid ? 'is-solid' : ''} ${open ? 'is-open' : ''}`}>
      <div className="nav-inner">
        <a className="nav-logo" href="#top" aria-label="The Uniques Community — home">
          <img src={LOGO} alt="The Uniques Community" />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="nav-right">
          <a className="btn btn-red nav-cta" href={JOIN_URL} target="_blank" rel="noreferrer">Join Us</a>
          <button type="button" className="nav-burger" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span /><span />
          </button>
        </div>
      </div>
      <div className="nav-sheet" aria-hidden={!open}>
        {NAV.map((item, i) => (
          <a key={item.href} href={item.href} tabIndex={open ? 0 : -1} style={{ '--i': i }} onClick={() => setOpen(false)}>
            <span>0{i + 1}</span>{item.label}
          </a>
        ))}
        <a className="btn btn-red" href={JOIN_URL} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>Join the community ↗</a>
      </div>
    </header>
  );
}
