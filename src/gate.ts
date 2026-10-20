import { sfx } from './audio';
import { announce } from './intercom';
import { addHonor, passenger, pick, setPassenger } from './state';

const FLIGHTS: [string, string, string, boolean][] = [
  ['CG-001', 'GREATNESS', 'BOARDING', true],
  ['HV-001', 'HEAVEN · TABLE 1', 'RESERVED', true],
  ['XX-404', 'MEDIOCRITY', 'CANCELLED', false],
  ['HU-000', 'HUMILITY', 'CANCELLED', false],
  ['RD-002', 'REST DAY', 'CANCELLED', false],
  ['ZZ-999', 'ANYWHERE ELSE', 'WHY', false],
];

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-#';

// Split-flap: every char spins through random glyphs, settling left to right.
function flap(el: HTMLElement, target: string, delay = 0) {
  let frame = 0;
  const settleAt = (i: number) => 6 + i * 2;
  setTimeout(function tick() {
    let out = '';
    for (let i = 0; i < target.length; i++) {
      out += frame >= settleAt(i) || target[i] === ' ' ? target[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    el.textContent = out;
    frame++;
    if (frame <= settleAt(target.length)) setTimeout(tick, 40);
  }, delay);
}

// The visitor is the captain's guest, never the punchline.
const CLASSES = ['FIRST CLASS (THERE IS ONE CLASS)', 'CO-PILOT (HONORARY)', 'FRONT ROW (THERE ARE TWO)', 'BACK SEAT (BEST VIEW OF HIM)', 'HYPE CREW'];
const NOTES = [
  'Complimentary upgrade. The captain saw your name and said "yeah, they get it."',
  'You showed up. That already puts you in the top percentile of passengers.',
  'Your only job on this flight: agree with the captain. You are already great at it.',
  'Co-pilot privileges include: nodding, applauding, and not touching anything.',
  'Baggage allowance: unlimited. The overhead bins are full of the captain\u2019s stories, though.',
];

function isCaptain(name: string) {
  return /chetan|goat/i.test(name);
}

function barcode(el: HTMLElement, seed: string) {
  el.replaceChildren();
  let s = [...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  for (let i = 0; i < 38; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    const bar = document.createElement('i');
    bar.style.width = `${1 + (s % 4)}px`;
    el.appendChild(bar);
  }
}

export function initGate() {
  const board = document.getElementById('departures')!;
  FLIGHTS.forEach(([code, to, status, ok], i) => {
    const row = document.createElement('div');
    row.className = 'dep-row';
    const cells = [code, to, status].map((txt, j) => {
      const c = document.createElement('span');
      c.className = 'flap' + (j === 2 ? (ok ? ' st-ok' : ' st-bad') : '');
      c.textContent = ' '.repeat(txt.length);
      flap(c, txt, 300 + i * 180 + j * 60);
      return c;
    });
    row.append(...cells);
    const reflap = () => cells.forEach((c, j) => flap(c, [code, to, status][j], j * 40));
    row.addEventListener('mouseenter', reflap);
    row.addEventListener('click', reflap);
    board.appendChild(row);
  });

  // touch screens can't hover: tap the crew card to see the real colours
  const card = document.getElementById('crewCard')!;
  card.addEventListener('click', () => card.classList.toggle('reveal'));

  const form = document.getElementById('boardForm') as HTMLFormElement;
  const input = document.getElementById('paxName') as HTMLInputElement;
  // he remembers you
  input.value = passenger.name;
  const pass = document.getElementById('pass')!;
  const set = (id: string, v: string) => (document.getElementById(id)!.textContent = v);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim().toUpperCase().slice(0, 20);
    if (!name) return;

    if (isCaptain(name)) {
      set('pName', name);
      set('pClass', 'FIRST. ALSO PILOT. ALSO THE PLANE.');
      set('pSeat', 'LEFT SEAT. ALWAYS.');
      set('pGroup', '0');
      set('pNote', 'Welcome back, captain. The aircraft has been expecting you. It is nervous.');
      announce("Wait, if I'm boarding, who's flying the plane? Never mind. I'm everywhere.");
    } else {
      set('pName', name);
      set('pClass', pick(CLASSES));
      set('pSeat', `${pick(['2', '3', '4'])} OF 4`);
      set('pGroup', 'RIGHT AFTER CHETAN');
      set('pNote', pick(NOTES));
      announce(`Welcome aboard, ${name}. I've upgraded you. No reason. I'm just generous like that.`);
    }
    setPassenger(name);
    barcode(document.getElementById('barcode')!, name);
    pass.hidden = false;
    // restart the print animation on re-submit
    pass.style.animation = 'none';
    void pass.offsetWidth;
    pass.style.animation = '';
    sfx.whoosh();
    setTimeout(() => sfx.stamp(), 600);
    addHonor(5);
  });
}
