# The Uniques Community — 3D web prototype

A spatial, 3D re-imagining of the theuniques.in homepage. Content mirrors the live homepage section by section.

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # static build in dist/ (relative paths — deploy anywhere)
```

## Sections → 3D treatment

| # | Homepage section | Treatment |
|---|------------------|-----------|
| — | HomeHero | WebGL (three.js) infinite poster corridor; scroll accelerates the flight, pointer steers the camera |
| 01 | Counts | Count-up stats on pointer-tilt cards with cursor glow |
| 02 | AboutSection + Main Focus | Editorial 3D carousel (5 focus pillars), drag / arrows / autoplay |
| 03 | WhyUs | Layered tilt cards with Z-depth content |
| 04 | CommunityPartners | Rotating CSS-3D partner ring + marquee |
| 05 | Startups | Sticky stacked browser cards that sink back in Z as the next arrives |
| 06 | Event | Perspective ribbon (rotateY panels), drag / arrows / autoplay |
| 07 | Gallery | Draggable 3D photo cylinder with inertia + lightbox |
| 08 | YoutubeSection | Tilted 3D screen, click-to-load video |
| 09 | Testimonials | Students / Faculty / Professionals tabs on a 3D card deck |
| — | CallToAction + Footer | Orbiting 3D rings, full footer link map |

## Images

Photos load from the Uniques image proxy (`src/data.js`). Every image has a same-origin
fallback in `public/assets/photos`, so nothing renders broken if the proxy is slow or blocks
CORS (the WebGL tunnel needs CORS to use remote photos as textures).

All motion respects `prefers-reduced-motion`; the WebGL loop pauses when off-screen.
