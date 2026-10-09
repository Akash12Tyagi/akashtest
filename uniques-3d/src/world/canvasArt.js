import * as THREE from 'three';
import { PHOTOS } from '../data.js';

export const INK = {
  red: '#ca0019', redHot: '#ff2a3d', redDeep: '#7a000f',
  bone: '#ece7de', carbon: '#0d0d0d', graphite: '#18181a', white: '#f4f1ea',
};

const photoCache = new Map();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Remote photo first (WebGL needs CORS); same-origin copy if that fails.
export function loadPhoto(index) {
  const i = ((index % PHOTOS.length) + PHOTOS.length) % PHOTOS.length;
  if (!photoCache.has(i)) {
    const { src, fallback } = PHOTOS[i];
    photoCache.set(i, loadImage(src).catch(() => loadImage(fallback)).catch(() => null));
  }
  return photoCache.get(i);
}

export function loadAny(src) {
  return loadImage(src).catch(() => null);
}

export function cover(ctx, img, x, y, w, h) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrap(ctx, text, x, y, maxWidth, lineHeight, maxLines = 99) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines += 1;
      if (lines >= maxLines) {
        ctx.fillText(`${line}…`, x, y);
        return y + lineHeight;
      }
      ctx.fillText(line, x, y);
      line = words[i];
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
}

function grain(ctx, w, h, seed = 1, amount = 1400) {
  let n = seed * 9301 + 49297;
  const rnd = () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
  for (let i = 0; i < amount; i += 1) {
    const v = rnd() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${rnd() * 0.035})`;
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6);
  }
}

export const FONT = {
  display: (w, s) => `${w} ${s}px Manrope, "Helvetica Neue", Arial, sans-serif`,
  mono: (s) => `500 ${s}px "DM Mono", ui-monospace, monospace`,
  serif: (s) => `italic 400 ${s}px "Instrument Serif", Georgia, serif`,
};

/**
 * A texture backed by a canvas that can repaint itself once photos and
 * web fonts arrive. `paint(ctx, w, h, img)` does the drawing.
 */
export function artTexture(renderer, width, height, paint, photoIndex = null) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let img = null;
  const redraw = () => {
    ctx.clearRect(0, 0, width, height);
    paint(ctx, width, height, img);
    texture.needsUpdate = true;
  };
  redraw();
  document.fonts?.ready.then(redraw);
  let source = null;
  if (typeof photoIndex === 'function') source = photoIndex();
  else if (typeof photoIndex === 'string') source = loadAny(photoIndex);
  else if (typeof photoIndex === 'number') source = loadPhoto(photoIndex);
  const ready = source ? source.then((loaded) => { img = loaded; redraw(); }) : Promise.resolve();
  texture.userData.redraw = (nextPaint) => { if (nextPaint) paint = nextPaint; redraw(); };
  texture.userData.ready = ready;
  return texture;
}

// ---------- Painters ----------

export function paintEditorial({ kicker, title, body, footer, theme = 'bone', layout = 'photoTop', no }) {
  const themes = {
    bone: { bg: INK.bone, fg: INK.carbon, accent: INK.red },
    carbon: { bg: INK.graphite, fg: INK.white, accent: INK.redHot },
    red: { bg: INK.red, fg: '#fff', accent: INK.carbon },
  };
  const t = themes[theme];
  return (ctx, w, h, img) => {
    ctx.fillStyle = t.bg;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, title.length);
    const pad = w * 0.07;

    ctx.fillStyle = t.fg;
    ctx.font = FONT.mono(Math.round(w * 0.02));
    ctx.textAlign = 'left';
    ctx.fillText((kicker || '').toUpperCase(), pad, pad + 6);
    ctx.textAlign = 'right';
    if (no) ctx.fillText(no, w - pad, pad + 6);
    ctx.textAlign = 'left';
    ctx.fillStyle = t.accent;
    ctx.fillRect(pad, pad + 22, w - pad * 2, 2);

    if (layout === 'photoTop') {
      const py = pad + 44;
      const ph = h * 0.48;
      ctx.save();
      roundRect(ctx, pad, py, w - pad * 2, ph, 18);
      ctx.clip();
      if (img) {
        cover(ctx, img, pad, py, w - pad * 2, ph);
        const g = ctx.createLinearGradient(0, py, 0, py + ph);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(1, 'rgba(0,0,0,.35)');
        ctx.fillStyle = g;
        ctx.fillRect(pad, py, w - pad * 2, ph);
      } else {
        ctx.fillStyle = t.accent;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(pad, py, w - pad * 2, ph);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      ctx.fillStyle = t.fg;
      ctx.font = FONT.display(800, Math.round(w * 0.085));
      let y = py + ph + w * 0.11;
      y = wrap(ctx, title, pad, y, w - pad * 2, w * 0.082, 2);
      if (body) {
        ctx.globalAlpha = 0.78;
        ctx.font = FONT.display(500, Math.round(w * 0.032));
        wrap(ctx, body, pad, y + w * 0.005, w - pad * 2, w * 0.045, 3);
        ctx.globalAlpha = 1;
      }
    } else if (layout === 'type') {
      ctx.fillStyle = t.fg;
      ctx.font = FONT.display(800, Math.round(w * 0.12));
      let y = h * 0.3;
      y = wrap(ctx, title.toUpperCase(), pad, y, w - pad * 2, w * 0.112, 4);
      if (body) {
        ctx.globalAlpha = 0.85;
        ctx.font = FONT.display(500, Math.round(w * 0.036));
        wrap(ctx, body, pad, y + w * 0.04, w - pad * 2, w * 0.05, 5);
        ctx.globalAlpha = 1;
      }
      // scalloped base, a nod to the reference carousel
      const r = w / 12;
      ctx.fillStyle = theme === 'red' ? INK.redDeep : t.accent;
      for (let i = 0; i < 7; i += 1) {
        ctx.beginPath();
        ctx.arc(i * r * 2, h + r * 0.15, r * 1.05, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (layout === 'photoFull') {
      if (img) cover(ctx, img, 0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(8,8,8,.35)');
      g.addColorStop(0.45, 'rgba(8,8,8,.05)');
      g.addColorStop(1, 'rgba(8,8,8,.88)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.font = FONT.mono(Math.round(w * 0.022));
      ctx.fillText((kicker || '').toUpperCase(), pad, pad + 6);
      ctx.font = FONT.display(800, Math.round(w * 0.085));
      const lines = Math.ceil(ctx.measureText(title).width / (w - pad * 2));
      let y = h - pad - (body ? w * 0.14 : 0) - (Math.min(lines, 3) - 1) * w * 0.082;
      y = wrap(ctx, title, pad, y, w - pad * 2, w * 0.082, 3);
      if (body) {
        ctx.globalAlpha = 0.8;
        ctx.font = FONT.display(500, Math.round(w * 0.03));
        wrap(ctx, body, pad, y, w - pad * 2, w * 0.042, 2);
        ctx.globalAlpha = 1;
      }
    }

    if (footer) {
      ctx.fillStyle = layout === 'photoFull' ? '#fff' : t.fg;
      ctx.globalAlpha = 0.6;
      ctx.font = FONT.mono(Math.round(w * 0.018));
      ctx.fillText(footer.toUpperCase(), pad, h - pad * 0.55);
      ctx.globalAlpha = 1;
    }
  };
}

export function paintLabel(text, { color = INK.white, sub, align = 'center', size = 0.34 } = {}) {
  return (ctx, w, h) => {
    ctx.textAlign = align;
    const x = align === 'center' ? w / 2 : 8;
    ctx.fillStyle = color;
    ctx.font = FONT.mono(Math.round(h * size));
    ctx.fillText(text.toUpperCase(), x, h * (sub ? 0.42 : 0.62));
    if (sub) {
      ctx.globalAlpha = 0.55;
      ctx.font = FONT.display(500, Math.round(h * 0.26));
      ctx.fillText(sub, x, h * 0.86);
      ctx.globalAlpha = 1;
    }
  };
}

export function paintTile(name, red) {
  return (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, red ? '#d6001c' : '#232325');
    g.addColorStop(1, red ? '#7a000f' : '#0f0f10');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = FONT.display(800, Math.round(h * 0.32));
    ctx.fillText(name, w / 2, h * 0.6);
  };
}

export function paintBrowser({ name, domain, text, no, theme }) {
  const dark = theme !== 'bone';
  const bg = theme === 'red' ? INK.red : theme === 'bone' ? INK.bone : INK.graphite;
  const fg = dark ? '#fff' : INK.carbon;
  return (ctx, w, h, img) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, name.length, 1800);
    ctx.fillStyle = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
    ctx.fillRect(0, 0, w, 64);
    [INK.redHot, '#888', '#888'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(34 + i * 26, 32, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)';
    roundRect(ctx, 130, 16, 300, 32, 16);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.font = FONT.mono(18);
    ctx.fillText(domain, 150, 38);

    const px = w * 0.52;
    ctx.save();
    roundRect(ctx, px, 90, w - px - 26, h - 116, 22);
    ctx.clip();
    if (img) cover(ctx, img, px, 90, w - px - 26, h - 116);
    ctx.restore();

    ctx.fillStyle = fg;
    ctx.globalAlpha = 0.6;
    ctx.font = FONT.mono(20);
    ctx.fillText(`${no} / STARTUP`, 56, 150);
    ctx.globalAlpha = 1;
    ctx.font = FONT.display(800, 92);
    const y = wrap(ctx, name, 56, h * 0.52, px - 90, 88, 2);
    ctx.globalAlpha = 0.8;
    ctx.font = FONT.display(500, 26);
    wrap(ctx, text, 56, y + 10, px - 100, 36, 4);
    ctx.globalAlpha = 1;
    ctx.fillStyle = dark ? '#fff' : INK.red;
    ctx.font = FONT.display(700, 24);
    ctx.fillText(`Visit ${domain} ↗`, 56, h - 56);
  };
}

export function paintQuote(person) {
  return (ctx, w, h, img) => {
    ctx.fillStyle = INK.bone;
    ctx.fillRect(0, 0, w, h);
    grain(ctx, w, h, person.name.length);
    const pad = 56;
    ctx.fillStyle = INK.red;
    ctx.font = FONT.mono(18);
    roundRect(ctx, pad, pad, ctx.measureText(person.tag.toUpperCase()).width + 40, 44, 22);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = FONT.mono(18);
    ctx.fillText(person.tag.toUpperCase(), pad + 20, pad + 29);
    ctx.fillStyle = INK.red;
    ctx.textAlign = 'right';
    ctx.font = FONT.display(700, 26);
    ctx.fillText('★★★★★', w - pad, pad + 32);
    ctx.textAlign = 'left';
    ctx.fillStyle = INK.carbon;
    ctx.font = FONT.display(700, 38);
    wrap(ctx, `“${person.quote}”`, pad, pad + 130, w - pad * 2, 48, 6);
    const ay = h - pad - 40;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pad + 36, ay, 36, 0, Math.PI * 2);
    ctx.clip();
    if (img) cover(ctx, img, pad, ay - 36, 72, 72);
    else {
      ctx.fillStyle = INK.carbon;
      ctx.fillRect(pad, ay - 36, 72, 72);
      ctx.fillStyle = '#fff';
      ctx.font = FONT.display(700, 26);
      ctx.textAlign = 'center';
      const initials = person.name.replace(/^(Dr\.|Prof\.)\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('');
      ctx.fillText(initials, pad + 36, ay + 9);
      ctx.textAlign = 'left';
    }
    ctx.restore();
    ctx.fillStyle = INK.carbon;
    ctx.font = FONT.display(700, 28);
    ctx.fillText(person.name, pad + 92, ay - 4);
    ctx.globalAlpha = 0.6;
    ctx.font = FONT.display(500, 22);
    ctx.fillText(person.role, pad + 92, ay + 26);
    ctx.globalAlpha = 1;
    ctx.fillStyle = INK.red;
    ctx.font = FONT.serif(220);
    ctx.textAlign = 'right';
    ctx.fillText('”', w - pad + 10, h + 40);
    ctx.textAlign = 'left';
  };
}

export function paintScreen({ title, handle }) {
  return (ctx, w, h, img) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    if (img) {
      cover(ctx, img, 0, 0, w, h);
      ctx.fillStyle = 'rgba(0,0,0,.42)';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = INK.red;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, h * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(w / 2 - h * 0.035, h / 2 - h * 0.055);
    ctx.lineTo(w / 2 + h * 0.06, h / 2);
    ctx.lineTo(w / 2 - h * 0.035, h / 2 + h * 0.055);
    ctx.fill();
    ctx.font = FONT.display(800, Math.round(h * 0.07));
    ctx.fillText(title, w * 0.04, h * 0.9);
    ctx.globalAlpha = 0.7;
    ctx.font = FONT.mono(Math.round(h * 0.035));
    ctx.fillText(handle, w * 0.04, h * 0.95);
    ctx.globalAlpha = 1;
  };
}
