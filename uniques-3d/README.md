# The Uniques Community — 3D web prototype

A spatial, 3D re-imagining of the theuniques.in homepage. Content mirrors the live homepage section by section.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # static build in dist/ (relative paths — deploy anywhere)
```

## How it works

The whole page is one WebGL world (`src/world/World.js`, three.js). Twelve HTML chapters
(`src/components/Chapters.jsx`) scroll over a fixed canvas; each chapter's centre maps to a
station on a Catmull-Rom camera rail, so scrolling flies the camera through the world.
Copy stays as real HTML for legibility, accessibility and SEO.

| Chapter | Station in the world |
|---------|----------------------|
| Intro / Journey | Poster corridor you fly through, exiting via a neon portal |
| Impact | Extruded 3D numbers (8.6L+, 100+, 150+, 40+) in red lacquer, bone and chrome |
| About | Ring of five Main Focus cards orbiting an extruded TU mark |
| Why us | Four monoliths on a chrome plinth |
| Partners | Glossy TU sphere with an orbiting ring of 12 partner tiles |
| Startups | Three browser panels that fan apart as you scroll (click to visit) |
| Events | Nine event panels on a rising helix |
| Gallery | You stand inside a drum of all 23 photos: drag to spin, click to open |
| Channel | Curved cinema screen (click to watch on YouTube) |
| Stories | 3D testimonial deck synced to the Students / Faculty / Professionals tabs |
| Join | Extruded JOIN US with orbiting neon rings |

Bloom post-processing on desktop, capped dust particles, PMREM room lighting, a preloader,
and a chapter HUD on the right. Mobile drops bloom and re-frames the camera rail.

## Images

Photos load from the Uniques image proxy (`src/data.js`). Every image has a same-origin
fallback in `public/assets/photos`, so nothing renders broken if the proxy is slow or blocks
CORS (the WebGL tunnel needs CORS to use remote photos as textures).

All motion respects `prefers-reduced-motion`; the WebGL loop pauses when off-screen.
