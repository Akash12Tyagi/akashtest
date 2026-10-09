// Editorial posters that line the hero corridor.

// Brand palettes: Uniques red (#ca0019), carbon and bone.
const PALETTES = [
  { paper: '#f2efe9', ink: '#0d0d0d', accent: '#ca0019', soft: '#d9d3ca' },
  { paper: '#0f0f10', ink: '#f4f1ea', accent: '#ff2a3d', soft: '#2a2a2c' },
  { paper: '#ca0019', ink: '#fff7f2', accent: '#0d0d0d', soft: '#8f0012' },
  { paper: '#e6e1d8', ink: '#141414', accent: '#ca0019', soft: '#b8b1a5' },
  { paper: '#18181a', ink: '#f4f1ea', accent: '#ca0019', soft: '#3a3a3d' },
  { paper: '#f7f4ee', ink: '#ca0019', accent: '#0d0d0d', soft: '#e3ddd3' },
];

const VARIANTS = [
  { title: 'CREATORS', overline: 'A COMMUNITY OF', footer: 'LEARN · BUILD · GROW' },
  { title: 'DREAMERS\n& DOERS.', overline: 'THE UNIQUES COMMUNITY', footer: 'BANUR · PUNJAB · IN' },
  { title: '150+', overline: 'PROJECTS DELIVERED', footer: 'REAL-WORLD SOLUTIONS' },
  { title: 'HACK\nATHONS', overline: 'NATIONAL HACKATHON GOLD', footer: 'CODE WARRIORS TROPHY' },
  { title: 'FUTURE\nLEADERS', overline: 'PEER-TO-PEER LEARNING', footer: 'THEORY → PRACTICE' },
  { title: '40+', overline: 'COMMUNITY EVENTS', footer: 'TALKS · SUMMITS · JAMS' },
  { title: 'VISION\nARIES', overline: 'A COMMUNITY LIKE NO OTHER', footer: 'INNOVATION THROUGH COLLABORATION' },
  { title: '100+', overline: 'TECH PARTNERS', footer: 'TRUSTED BY INDUSTRY LEADERS' },
  { title: 'UI/UX', overline: 'DESIGN MASTERCLASS', footer: 'GRAPHIC DESIGNERS' },
  { title: 'BUILD\nTOGETHER', overline: 'LEARN, BUILD, AND GROW', footer: 'THE UNIQUES / 2026' },
  { title: '₹8.6L+', overline: 'REVENUE GENERATED', footer: 'STUDENT-LED CLIENT WORK' },
  { title: 'STAY\nUNIQUE', overline: 'AN OPEN INVITATION', footer: 'JOIN THE COMMUNITY' },
];

function seededRandom(seed) {
  let n = (seed * 9301 + 49297) % 233280;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

function coverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
}

export function drawPoster(canvas, index, img) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const palette = PALETTES[index % PALETTES.length];
  const variant = VARIANTS[index % VARIANTS.length];
  const random = seededRandom(index * 41 + 7);

  ctx.fillStyle = palette.paper;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 1400; i += 1) {
    const v = random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${random() * 0.03})`;
    ctx.fillRect(random() * width, random() * height, 1.5, 1.5);
  }

  ctx.fillStyle = palette.ink;
  ctx.font = '600 15px "DM Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('THE UNIQUES  /  COMMUNITY', 52, 53);
  ctx.textAlign = 'right';
  ctx.fillText(`Nº ${String(index + 1).padStart(2, '0')} — 2026`, width - 52, 53);
  ctx.textAlign = 'left';
  ctx.fillStyle = palette.accent;
  ctx.fillRect(52, 72, width - 104, 2);

  const style = index % 4;
  const photo = style === 1 ? { x: 52, y: 100, w: width - 104, h: 520 } : { x: 32, y: 95, w: width - 64, h: 430 };

  ctx.save();
  ctx.beginPath();
  if (style === 2) {
    ctx.ellipse(width / 2, photo.y + photo.h / 2, photo.w / 2.3, photo.h / 2, 0, 0, Math.PI * 2);
  } else {
    ctx.rect(photo.x, photo.y, photo.w, photo.h);
  }
  ctx.clip();
  if (img) {
    coverImage(ctx, img, photo.x, photo.y, photo.w, photo.h);
    const wash = ctx.createLinearGradient(0, photo.y, 0, photo.y + photo.h);
    wash.addColorStop(0, 'rgba(10,10,10,.05)');
    wash.addColorStop(1, 'rgba(10,10,10,.42)');
    ctx.fillStyle = wash;
    ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    if (index % 3 === 0) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(202,0,25,.28)';
      ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
      ctx.globalCompositeOperation = 'source-over';
    }
  } else {
    // Graphic placeholder while (or if) the photo loads: concentric brand rings.
    const g = ctx.createLinearGradient(photo.x, photo.y, photo.x + photo.w, photo.y + photo.h);
    g.addColorStop(0, palette.soft);
    g.addColorStop(1, palette.accent);
    ctx.fillStyle = g;
    ctx.fillRect(photo.x, photo.y, photo.w, photo.h);
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    for (let r = 30; r < 520; r += 34) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(photo.x + photo.w * 0.7, photo.y + photo.h * 0.55, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();

  const lines = variant.title.split('\n');
  ctx.fillStyle = palette.ink;
  if (style === 0) {
    ctx.font = '800 92px Manrope, Arial, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, 48, 628 + i * 86));
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(width - 110, 600, 34, 0, Math.PI * 2);
    ctx.fill();
  } else if (style === 1) {
    ctx.font = 'italic 84px "Instrument Serif", Georgia, serif';
    ctx.fillText(lines.join(' '), 52, 712);
  } else if (style === 2) {
    ctx.textAlign = 'center';
    ctx.font = '800 78px Manrope, Arial, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, width / 2, 610 + i * 76));
    ctx.textAlign = 'left';
  } else {
    ctx.font = '800 74px Manrope, Arial, sans-serif';
    lines.forEach((line, i) => ctx.fillText(line, 52, 612 + i * 72));
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width - 160, 650, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width - 160, 650, 50, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = palette.ink;
  ctx.font = '500 14px "DM Mono", monospace';
  ctx.fillText(variant.overline, 52, 817);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(52, 836, width - 104, 1.5);
  ctx.fillStyle = palette.ink;
  ctx.font = '500 12px "DM Mono", monospace';
  ctx.fillText(variant.footer, 52, 862);
  ctx.textAlign = 'right';
  ctx.fillText('THEUNIQUES.IN', width - 52, 862);
  ctx.textAlign = 'left';
}
