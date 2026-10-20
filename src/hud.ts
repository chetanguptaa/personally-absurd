import { sfx } from './audio';
import { shake } from './effects';
import { announce } from './intercom';
import { addHonor, firstName, honorTitle, onChange, setHype, state, toggleSound } from './state';

// Only a few milestones get a word from the captain. The rest speak for themselves.
const HYPE_LINES: Record<number, string> = {
  5: "Hype at 5. A few passengers have started calling me 'sir'.",
  8: "Hype at 8. The engine's making a noise I've never heard before. I like it.",
  11: 'Hype at 11. DRS is open. The Cessna is now an F1 car. Hold on.',
};

const COPILOT_KEY = 'airgoat.copilot';

export function isCopilot() {
  try {
    return localStorage.getItem(COPILOT_KEY) === '1';
  } catch {
    return false;
  }
}

// Honor 100: a rubber stamp, a new title in the HUD, and the captain remembers it next visit.
function promote(brand: HTMLElement) {
  try {
    localStorage.setItem(COPILOT_KEY, '1');
  } catch {
    // private mode: promoted in spirit
  }
  brand.textContent = '✈ AIR GOAT · CO-PILOT';

  const overlay = document.createElement('div');
  overlay.className = 'promo';
  const stamp = document.createElement('div');
  stamp.className = 'promo-stamp';
  stamp.innerHTML = 'PROMOTED<br />HONORARY<br />CO-PILOT<small></small>';
  stamp.querySelector('small')!.textContent = `${firstName().toUpperCase() || 'PASSENGER'} · AIR GOAT FLIGHT CG-001 · TAP TO CONTINUE`;
  overlay.appendChild(stamp);
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', close);
  setTimeout(close, 5000);

  sfx.stamp();
  setTimeout(() => sfx.stamp(), 160);
  sfx.melody([523, 659, 784, 1046], 0.12, 'triangle');
  announce("Ladies and gentlemen, we have a new co-pilot. One rule: don't touch anything.", true);
}

export function initHud() {
  const brand = document.getElementById('hudBrand')!;
  const honorFill = document.getElementById('honorFill')!;
  const honorLabel = document.getElementById('honorLabel')!;
  const finalHonor = document.getElementById('finalHonor')!;
  const finalLabel = document.getElementById('finalHonorLabel')!;
  const muteBtn = document.getElementById('muteBtn')!;
  const hypeBox = document.getElementById('hype')!;
  const hypeLabel = document.getElementById('hypeLabel')!;
  const hypeValue = document.getElementById('hypeValue')!;
  const hypeFill = document.getElementById('hypeFill')!;
  const up = document.getElementById('hypeUp')!;
  const down = document.getElementById('hypeDown') as HTMLButtonElement;

  let promoted = isCopilot();
  if (promoted) brand.textContent = '✈ AIR GOAT · CO-PILOT';

  // first few seconds: make it obvious this page makes noise
  let cue = true;
  muteBtn.classList.add('cue');
  setTimeout(() => {
    cue = false;
    muteBtn.classList.remove('cue');
    render();
  }, 7000);

  const label = () => (state.hype >= 11 ? 'DRS OPEN' : 'HYPE');

  const render = () => {
    honorFill.style.width = `${state.honor}%`;
    honorLabel.textContent = `${state.honor}% · ${honorTitle(state.honor)}`;
    finalHonor.textContent = String(state.honor);
    finalLabel.textContent = honorTitle(state.honor);
    muteBtn.textContent = !state.soundOn ? '🔇 SOUND OFF' : cue ? '🔊 SOUND IS ON' : '🔊 SOUND ON';
    hypeValue.textContent = String(state.hype);
    hypeLabel.textContent = label();
    hypeFill.style.width = `${(state.hype / 11) * 100}%`;
    document.documentElement.style.setProperty('--hype', String(state.hype));
    document.body.classList.toggle('hype-max', state.hype >= 11);
    if (!promoted && state.honor >= 100) {
      promoted = true;
      promote(brand);
    }
  };
  onChange(render);

  muteBtn.addEventListener('click', () => {
    toggleSound();
    sfx.blip();
  });

  const pulse = () => {
    hypeBox.classList.remove('pulse');
    void hypeBox.offsetWidth;
    hypeBox.classList.add('pulse');
  };

  const raise = () => {
    if (state.hype >= 11) return false;
    setHype(state.hype + 1);
    sfx.melody([440 + state.hype * 40, 660 + state.hype * 50], 0.07);
    addHonor(2);
    if (state.hype === 11) {
      sfx.engine();
      shake(document.getElementById('main')!);
    }
    if (HYPE_LINES[state.hype]) announce(HYPE_LINES[state.hype], state.hype === 11);
    return true;
  };

  let maxedOnce = false;
  up.addEventListener('click', () => {
    pulse();
    if (!raise() && !maxedOnce) {
      maxedOnce = true;
      sfx.nope();
      announce("It's already at eleven. Love the enthusiasm though.");
    }
  });

  // The down button runs away from mouse users. Anyone who catches it gets the opposite.
  const dodge = () => {
    const x = (Math.random() - 0.5) * 120;
    const y = -20 - Math.random() * 70;
    down.style.transform = `translate(${x}px, ${y}px) rotate(${x / 3}deg)`;
    setTimeout(() => (down.style.transform = ''), 900);
  };
  down.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') dodge();
  });
  let caught = 0;
  down.addEventListener('click', () => {
    pulse();
    raise();
    hypeLabel.textContent = 'NICE TRY';
    setTimeout(() => (hypeLabel.textContent = label()), 1200);
    if (caught++ === 0) announce("You pressed down. Hype went up. That's just how it works on my plane.");
    dodge();
  });

  // Altimeter: scroll depth becomes altitude.
  const altFill = document.getElementById('altFill')!;
  const altValue = document.getElementById('altValue')!;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;
    // climb to cruise, then descend for landing
    const curve = p < 0.85 ? Math.min(1, p / 0.35) : Math.max(0, (1 - p) / 0.15);
    altFill.style.height = `${curve * 100}%`;
    altValue.textContent = Math.round(curve * 41000).toLocaleString('en-US');
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
