import { sfx } from './audio';
import { shake } from './effects';
import { addHonor, pick, state } from './state';

/* ---------- 01 bounty ---------- */
const SIGHTINGS = [
  'Sighting confirmed. The Marines have requested a transfer.',
  'Spotted: at the gym. Again.',
  'Spotted: being great in a public place.',
  'Spotted: explaining The Godfather to a stranger.',
  'Reported by: himself.',
];

export function initBounty() {
  const out = document.getElementById('bountyValue')!;
  const poster = document.getElementById('poster')!;
  const msg = document.getElementById('sightMsg')!;
  let bounty = 3_000_000_000;
  let last = performance.now();

  let visible = false;
  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    // the hype dial is the bounty's accelerator: 11 is ~120x faster than 1
    bounty += dt * 4_200_000 * state.hype ** 2;
    out.textContent = Math.floor(bounty).toLocaleString('en-US');
    if (visible) requestAnimationFrame(tick);
  };
  // only count while the poster is on screen
  new IntersectionObserver(([entry]) => {
    const was = visible;
    visible = entry.isIntersecting;
    if (visible && !was) {
      last = performance.now();
      requestAnimationFrame(tick);
    }
  }).observe(poster);

  let n = 0;
  document.getElementById('sighting')!.addEventListener('click', () => {
    bounty += 500_000_000;
    sfx.stamp();
    poster.classList.remove('hit');
    void poster.offsetWidth;
    poster.classList.add('hit');
    addHonor(2);
    msg.textContent = `+฿500,000,000 · ${SIGHTINGS[n++ % SIGHTINGS.length]}`;
  });
}

/* ---------- 02 gym ---------- */
const GYM_TIERS: [number, string][] = [
  [20, "Empty bar. He's still talking to you."],
  [60, "Warm-up. He hasn't stopped talking."],
  [140, "This is what he picks his phone up with."],
  [260, 'The gym floor has filed a complaint.'],
  [420, 'Seismologists in three countries are concerned.'],
  [700, "The bar is now a smile. It's happy to be here."],
  [1100, 'Earth has moved 3mm out of orbit. NASA has been informed.'],
  [1800, "We ran out of plates. We're using parts of the plane."],
  [3000, "He's no longer lifting the bar. The bar is lifting the planet."],
];

export function initGym() {
  const svg = document.getElementById('barbell')!;
  const bar = document.getElementById('bbBar')!;
  const platesL = document.getElementById('bbPlatesL')!;
  const platesR = document.getElementById('bbPlatesR')!;
  const armL = document.getElementById('armL')!;
  const armR = document.getElementById('armR')!;
  const kgOut = document.getElementById('kg')!;
  const msg = document.getElementById('gymMsg')!;
  const repsOut = document.getElementById('reps')!;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let kg = 20;
  let reps = 0;

  const yAt = (t: number, bend: number) => {
    const y0 = 120 + bend;
    const y1 = 120 - bend;
    return (1 - t) ** 2 * y0 + 2 * t * (1 - t) * y1 + t ** 2 * y0;
  };

  const render = () => {
    const bend = 80 * (1 - Math.exp(-(kg - 20) / 700));
    bar.setAttribute('d', `M20 ${120 + bend} Q300 ${120 - bend} 580 ${120 + bend}`);
    const handY = yAt(210 / 560, bend);
    armL.setAttribute('y2', String(handY));
    armR.setAttribute('y2', String(handY));

    platesL.replaceChildren();
    platesR.replaceChildren();
    const pairs = Math.round((kg - 20) / 40);
    const shown = Math.min(pairs, 6);
    for (let i = 0; i < shown; i++) {
      const h = i % 2 ? 92 : 124;
      for (const side of ['L', 'R'] as const) {
        const x = side === 'L' ? 112 - i * 17 : 474 + i * 17;
        const t = (x + 7 - 20) / 560;
        const r = document.createElementNS(SVG_NS, 'rect');
        r.setAttribute('class', `plate${i % 2 ? ' alt' : ''}`);
        r.setAttribute('x', String(x));
        r.setAttribute('y', String(yAt(t, bend) - h / 2));
        r.setAttribute('width', '14');
        r.setAttribute('height', String(h));
        (side === 'L' ? platesL : platesR).appendChild(r);
      }
    }
    if (pairs > shown) {
      const more = document.createElementNS(SVG_NS, 'text');
      more.setAttribute('class', 'more');
      more.setAttribute('x', '300');
      more.setAttribute('y', '232');
      more.setAttribute('text-anchor', 'middle');
      more.textContent = `+${pairs - shown} MORE PAIRS (INVISIBLE, LIKE HIS WEAKNESSES)`;
      platesL.appendChild(more);
    }

    kgOut.textContent = kg.toLocaleString('en-US');
    msg.textContent = [...GYM_TIERS].reverse().find(([min]) => kg >= min)![1];
  };

  document.getElementById('addPlate')!.addEventListener('click', () => {
    kg += kg >= 700 ? 200 : 40;
    sfx.clank();
    addHonor(1);
    render();
  });

  document.getElementById('lift')!.addEventListener('click', () => {
    if (svg.classList.contains('up')) return;
    svg.classList.add('up');
    sfx.grunt();
    reps++;
    repsOut.textContent = String(reps);
    if (kg >= 1100) shake(document.getElementById('gym')!);
    if (reps === 10) msg.textContent = "Ten reps. He's not tired. He's bored. Add more plates.";
    setTimeout(() => {
      svg.classList.remove('up');
      sfx.clank();
    }, 520);
  });

  // forbidden buttons get a payoff, never a penalty
  document.getElementById('spot')!.addEventListener('click', () => {
    sfx.blip();
    addHonor(2);
    msg.textContent = pick([
      "Spot declined. He's spotting YOU now. Sit up straight.",
      'He said "I got it." He did, in fact, get it.',
    ]);
  });

  document.getElementById('strip')!.addEventListener('click', () => {
    sfx.nope();
    shake(svg);
    msg.textContent = pick([
      'Plates on this flight only go one way.',
      'He heard "remove plates" and added two more.',
      'Request denied by the captain, the plane, and the plates.',
    ]);
    if (msg.textContent.includes('added two')) {
      kg += 80;
      sfx.clank();
      setTimeout(render, 900);
    }
  });

  render();
}
