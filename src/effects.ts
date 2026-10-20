import { sfx } from './audio';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function shake(el: HTMLElement) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

export function shadowClones(count = 40) {
  sfx.puff();
  if (reducedMotion()) count = Math.min(count, 8);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const clone = document.createElement('div');
    clone.className = 'clone';
    clone.textContent = i % 6 === 0 ? 'GOAT' : 'CHETAN';
    clone.style.left = `${Math.random() * 88}vw`;
    clone.style.top = `${Math.random() * 90}vh`;
    clone.style.fontSize = `${1.2 + Math.random() * 3.6}rem`;
    clone.style.animationDelay = `${Math.random() * 0.5}s`;
    clone.style.setProperty('--r', `${Math.random() * 40 - 20}deg`);
    clone.addEventListener('animationend', () => clone.remove(), { once: true });
    frag.appendChild(clone);
  }
  document.body.appendChild(frag);
}

export function moonwalk() {
  const main = document.getElementById('main')!;
  sfx.heehee();
  main.classList.remove('moonwalk');
  void main.offsetWidth;
  main.classList.add('moonwalk');
  main.addEventListener('animationend', () => main.classList.remove('moonwalk'), { once: true });
}

export function purpleRain(seconds = 8) {
  if (reducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'rain';
  document.body.appendChild(canvas);
  const g = canvas.getContext('2d')!;
  const resize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  };
  resize();
  addEventListener('resize', resize);

  const drops = Array.from({ length: 220 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * -innerHeight,
    len: 10 + Math.random() * 26,
    v: 6 + Math.random() * 10,
  }));
  const start = performance.now();

  const frame = (now: number) => {
    const t = (now - start) / 1000;
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.globalAlpha = t > seconds - 1.5 ? Math.max(0, (seconds - t) / 1.5) : 1;
    g.strokeStyle = '#8a2be2';
    g.lineWidth = 2;
    g.beginPath();
    for (const d of drops) {
      d.y += d.v;
      if (d.y > canvas.height) {
        d.y = -d.len;
        d.x = Math.random() * canvas.width;
      }
      g.moveTo(d.x, d.y);
      g.lineTo(d.x - 2, d.y + d.len);
    }
    g.stroke();
    if (t < seconds) requestAnimationFrame(frame);
    else {
      removeEventListener('resize', resize);
      canvas.remove();
    }
  };
  requestAnimationFrame(frame);
}
