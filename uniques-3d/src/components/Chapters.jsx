import React, { useEffect, useState } from 'react';
import {
  ABOUT, EVENTS, FOCUS, HERO, JOIN_URL, PARTNERS, PHOTOS, SITE, STARTUPS, STATS, TESTIMONIALS, WHY, YOUTUBE,
} from '../data.js';
import { useCountUp } from './shared.jsx';

// Each chapter pins for a beat while the camera flies to its station in the 3D world.
function Chapter({ id, index, title, className = '', align = 'left', children }) {
  return (
    <section className={`ch ch-${align} ${className}`} id={id} data-chapter={index} aria-label={title}>
      <div className="ch-pin">
        <div className="ch-panel">{children}</div>
      </div>
    </section>
  );
}

function Eyebrow({ n, children }) {
  return <div className="eyebrow"><span className="eyebrow-index">{n}</span><span className="eyebrow-dot" />{children}</div>;
}

function Stat({ stat, active, i }) {
  const v = useCountUp(stat.value, active, 1800 + i * 200);
  return (
    <li>
      <strong>{stat.prefix}{v.toLocaleString('en-IN')}<b>+</b></strong>
      <span>{stat.label}</span>
    </li>
  );
}

const TAB_KEYS = Object.keys(TESTIMONIALS);

export function Stories({ onChange }) {
  const [tab, setTab] = useState('students');
  const [active, setActive] = useState(0);
  const group = TESTIMONIALS[tab];
  const person = group.items[active];
  useEffect(() => { onChange(group.items, active); }, [tab, active, group.items, onChange]);
  const go = (d) => setActive((a) => (a + d + group.items.length) % group.items.length);
  return (
    <>
      <Eyebrow n="09">Testimonials</Eyebrow>
      <h2 className="ch-title">Testimonials from Our <em>{group.heading}</em></h2>
      <p className="ch-lead">{group.text}</p>
      <div className="ch-tabs" role="tablist" aria-label="Testimonial groups">
        {TAB_KEYS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-active' : ''} onClick={() => { setTab(k); setActive(0); }}>
            {TESTIMONIALS[k].label}
          </button>
        ))}
      </div>
      <figure className="ch-quote" aria-live="polite">
        <blockquote>“{person.quote}”</blockquote>
        <figcaption><strong>{person.name}</strong> · {person.role} <span className="ch-tag">{person.tag}</span></figcaption>
      </figure>
      <div className="ch-row">
        <button type="button" className="ch-round" onClick={() => go(-1)} aria-label="Previous testimonial">←</button>
        <span className="ch-count">{String(active + 1).padStart(2, '0')} / {String(group.items.length).padStart(2, '0')}</span>
        <button type="button" className="ch-round" onClick={() => go(1)} aria-label="Next testimonial">→</button>
      </div>
    </>
  );
}

export default function Chapters({ active, onStories, onOpenGallery }) {
  return (
    <>
      <Chapter id="top" index={0} title="The Uniques Community" className="ch-hero">
        <h1 className="hero-title">
          <span className="hero-line"><span>A Community of</span></span>
          <span className="hero-line"><span>Creators,</span></span>
          <span className="hero-line"><span><em>Dreamers</em> &amp; Doers.</span></span>
        </h1>
        <p className="ch-lead">{HERO.sub}</p>
        <div className="ch-actions">
          <a className="btn btn-red" href={JOIN_URL} target="_blank" rel="noreferrer">Join Us <span aria-hidden="true">↗</span></a>
          <a className="btn btn-ghost" href="#impact">Enter the world</a>
        </div>
        <div className="hero-tags" aria-label="Who we are">
          <div className="hero-tags-track">
            {[...HERO.tags, ...HERO.tags].map((tag, i) => <span key={i} aria-hidden={i >= HERO.tags.length}>{tag}<i>✦</i></span>)}
          </div>
        </div>
      </Chapter>

      <Chapter id="journey" index={1} title="Learn, Build, and Grow Together" align="center" className="ch-tunnel">
        <span className="ch-kicker">Founded 2022 · Banur, Punjab</span>
        <p className="ch-statement">Learn, <em>Build</em>, and Grow Together.</p>
      </Chapter>

      <Chapter id="impact" index={2} title="Making an Impact">
        <Eyebrow n="01">Our Achievements</Eyebrow>
        <h2 className="ch-title">Making an <em>Impact</em><span className="red">.</span></h2>
        <ul className="ch-stats">
          {STATS.map((s, i) => <Stat key={s.label} stat={s} i={i} active={active >= 2} />)}
        </ul>
      </Chapter>

      <Chapter id="about" index={3} title={ABOUT.title}>
        <Eyebrow n="02">{ABOUT.eyebrow}</Eyebrow>
        <h2 className="ch-title">{ABOUT.title}</h2>
        <p className="ch-serif">{ABOUT.sub}</p>
        <p className="ch-lead">{ABOUT.quote[0]} {ABOUT.quote[1]}</p>
        <ol className="ch-list">
          {FOCUS.map((f) => <li key={f.id}><strong>{f.label}</strong></li>)}
        </ol>
      </Chapter>

      <Chapter id="why" index={4} title={WHY.title}>
        <Eyebrow n="03">{WHY.eyebrow}</Eyebrow>
        <h2 className="ch-title">Driving <em>Innovation</em> Through Collaboration &amp; <span className="red">Visionary</span> Thinking</h2>
        <ul className="ch-pairs">
          {WHY.cards.map((c) => <li key={c.title}><strong>{c.title}</strong><span>{c.text}</span></li>)}
        </ul>
      </Chapter>

      <Chapter id="partners" index={5} title={PARTNERS.title}>
        <Eyebrow n="04">Partners</Eyebrow>
        <h2 className="ch-title">Trusted by <em>Industry</em> Leaders<span className="red">.</span></h2>
        <div className="ch-bigstats">
          {PARTNERS.stats.map((s) => <div key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}
        </div>
        <p className="ch-small">{PARTNERS.logos.join(' · ')}</p>
      </Chapter>

      <Chapter id="startups" index={6} title={STARTUPS.title}>
        <Eyebrow n="05">{STARTUPS.eyebrow}</Eyebrow>
        <h2 className="ch-title">Pioneering the Future with <em>Disruptive</em> Ideas &amp; Technology</h2>
        <ul className="ch-links">
          {STARTUPS.items.map((s) => (
            <li key={s.name}><a href={s.url} target="_blank" rel="noreferrer"><span>{s.no}</span><strong>{s.name}</strong><i aria-hidden="true">↗</i></a></li>
          ))}
        </ul>
      </Chapter>

      <Chapter id="events" index={7} title="Experience the excitement">
        <Eyebrow n="06">Our Events</Eyebrow>
        <h2 className="ch-title">Experience the <em>excitement</em><span className="red">.</span></h2>
        <p className="ch-lead">Hackathons, summits, masterclasses and launch days, spiralling through the community’s year.</p>
        <p className="ch-small">{EVENTS.map((e) => e.title).join(' · ')}</p>
        <div className="ch-actions"><a className="btn btn-ghost" href={`${SITE}/events`} target="_blank" rel="noreferrer">View All <span aria-hidden="true">↗</span></a></div>
      </Chapter>

      <Chapter id="gallery" index={8} title="Gallery">
        <Eyebrow n="07">Gallery</Eyebrow>
        <h2 className="ch-title">Moments that <em>made</em> us<span className="red">.</span></h2>
        <p className="ch-lead">{PHOTOS.length} frames wrap around you. Drag to spin the drum, tap any photo to open it.</p>
        <div className="ch-actions"><button type="button" className="btn btn-ghost" onClick={() => onOpenGallery(0)}>Open the gallery</button></div>
      </Chapter>

      <Chapter id="channel" index={9} title={YOUTUBE.title}>
        <Eyebrow n="08">{YOUTUBE.eyebrow}</Eyebrow>
        <h2 className="ch-title">The Uniques Community is <em>Live</em> on YouTube</h2>
        <p className="ch-lead">{YOUTUBE.sub}</p>
        <ul className="ch-pairs ch-pairs-tight">
          {YOUTUBE.highlights.map((h) => <li key={h.title}><strong>{h.title}</strong><span>{h.text}</span></li>)}
        </ul>
        <div className="ch-actions">
          <a className="btn btn-red" href={`https://www.youtube.com/watch?v=${YOUTUBE.videoId}`} target="_blank" rel="noreferrer">Watch the film ▶</a>
          <a className="btn btn-ghost" href={YOUTUBE.url} target="_blank" rel="noreferrer">Visit Our Channel</a>
        </div>
      </Chapter>

      <Chapter id="stories" index={10} title="Testimonials">
        <Stories onChange={onStories} />
      </Chapter>

      <Chapter id="join" index={11} title="Join Us Today" align="center" className="ch-join">
        <h2 className="sr-only">Join Us Today</h2>
        <p className="ch-lead">Join the community of unique individuals and learn from the best</p>
        <div className="ch-actions">
          <a className="btn btn-red" href={JOIN_URL} target="_blank" rel="noreferrer">Join on WhatsApp <span aria-hidden="true">↗</span></a>
          <a className="btn btn-ghost" href={`${SITE}/auth/login`} target="_blank" rel="noreferrer">Login</a>
        </div>
      </Chapter>
    </>
  );
}
