import React, { useState } from 'react';
import { YOUTUBE, photo } from '../data.js';
import { Eyebrow, Reveal, Tilt } from './shared.jsx';

export default function YouTube() {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${YOUTUBE.videoId}/maxresdefault.jpg`;
  return (
    <section className="section yt section-dots" id="channel">
      <div className="wrap yt-grid">
        <div className="yt-copy">
          <Reveal><Eyebrow index="08">{YOUTUBE.eyebrow}</Eyebrow></Reveal>
          <Reveal as="h2" className="display" delay={80}>The Uniques Community is <em>Live</em> on YouTube</Reveal>
          <Reveal as="p" className="lead" delay={140}>{YOUTUBE.sub}</Reveal>
          <ul className="yt-list">
            {YOUTUBE.highlights.map((h, i) => (
              <Reveal as="li" key={h.title} delay={200 + i * 90}>
                <span className="yt-list-no">0{i + 1}</span>
                <div><strong>{h.title}</strong><p>{h.text}</p></div>
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal delay={120} className="yt-stage">
          <Tilt className="yt-screen" max={8}>
            <div className="yt-frame">
              {playing ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE.videoId}?autoplay=1&rel=0`}
                  title="The Uniques Community on YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <button type="button" className="yt-poster" onClick={() => setPlaying(true)} aria-label="Play The Uniques Community video">
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      // maxres → hq → a local community photo
                      const img = e.currentTarget;
                      const step = Number(img.dataset.step || 0);
                      img.dataset.step = step + 1;
                      if (step === 0) img.src = `https://i.ytimg.com/vi/${YOUTUBE.videoId}/hqdefault.jpg`;
                      else if (step === 1) img.src = photo(0).fallback;
                    }}
                  />
                  <span className="yt-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
                </button>
              )}
            </div>
            <div className="yt-channel">
              <div className="yt-avatar" aria-hidden="true">TU</div>
              <div className="yt-channel-copy">
                <strong>{YOUTUBE.channel}</strong>
                <span>{YOUTUBE.handle}</span>
              </div>
              <a className="btn btn-red yt-sub" href={YOUTUBE.url} target="_blank" rel="noreferrer">Visit Our Channel</a>
            </div>
            <p className="yt-blurb">{YOUTUBE.blurb}</p>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}
