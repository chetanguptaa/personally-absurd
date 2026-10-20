import './style.css';
import { initCourt, initIfe, initLanding } from './aft';
import { initBounty, initGym } from './cabin';
import { reducedMotion, shadowClones } from './effects';
import { initGate } from './gate';
import { initHud, isCopilot } from './hud';
import { announce, isTalking } from './intercom';
import { firstName } from './state';
import { initTable, savedLegend } from './table';

// marquees: duplicate the text so the loop is seamless
document.querySelectorAll<HTMLElement>('.marquee-track').forEach((track) => {
  const text = track.dataset.marquee!.repeat(4);
  for (let i = 0; i < 2; i++) {
    const span = document.createElement('span');
    span.textContent = text;
    track.appendChild(span);
  }
});

initHud();
initGate();
initBounty();
initGym();
initIfe();
initTable();
initCourt();
initLanding();

// The captain talks rarely, so every line lands. A few sections get one comment each.
const ENTRY_LINES: Record<string, () => string> = {
  ife: () => "The in-flight magazine's in the seat pocket. Everything in it was personally reviewed by me. Favourably.",
  table: () => "We've reached maximum altitude. If you look up, there's a table. It's reserved. For me.",
  court: () => "Quick heads-up: this flight has a courtroom. Don't ask. I'm representing myself.",
  landing: () => `Beginning our descent${firstName() ? `, ${firstName()}` : ''}. Please return your humility to its upright and locked position.`,
};
const seen = new Set<string>();
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const id = e.target.id;
      if (e.isIntersecting && ENTRY_LINES[id] && !seen.has(id)) {
        seen.add(id);
        announce(ENTRY_LINES[id]());
      }
    }
  },
  { threshold: 0.35 },
);
document.querySelectorAll('section[id]').forEach((s) => io.observe(s));

// a little idle chatter, three times at most
const IDLE = [
  "Captain here. Nothing to report. Just wanted you to hear my voice again.",
  "For those wondering: yes, I'm using the intercom. Yes, you're sitting right next to me.",
  'Weather at destination: me. Hundred percent chance of me.',
];
let idle = 0;
const chatter = setInterval(() => {
  if (document.hidden || isTalking()) return;
  announce(IDLE[idle++]);
  if (idle >= IDLE.length) clearInterval(chatter);
}, 90000);

// returning passengers get their legend brought up, the way Chetan would
const legend = savedLegend();
const who = [isCopilot() ? 'co-pilot' : '', firstName()].filter(Boolean).join(' ');
const back = who ? `Welcome back, ${who}.` : 'Welcome back.';
setTimeout(() => announce(
  legend ? `${back} The table's still talking about the time you ${legend}. Alexander brought it up twice.`
  : who ? `${back} Your seat's right where you left it. I had the crew keep it warm.`
  : "Evening, and welcome aboard Air GOAT flight CG-001. I'm your captain, Chetan. Type your name at the gate and let's go."), 1200);

// first five seconds: the captain arrives a few dozen times at once
if (!reducedMotion()) setTimeout(() => shadowClones(28), 700);
