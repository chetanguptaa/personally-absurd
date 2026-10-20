type Listener = () => void;

export const state = {
  hype: 1,
  honor: 10,
  soundOn: true,
};

const listeners: Listener[] = [];

export function onChange(fn: Listener) {
  listeners.push(fn);
  fn();
}

function emit() {
  listeners.forEach((fn) => fn());
}

// Honor only goes up. Nobody gets punished for playing along.
export function addHonor(delta: number) {
  state.honor = Math.min(100, state.honor + Math.max(0, delta));
  emit();
}

export function setHype(value: number) {
  state.hype = Math.max(1, Math.min(11, value));
  emit();
}

const NAME_KEY = 'airgoat.name';

export const passenger = {
  name: (() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      return '';
    }
  })(),
};

export function setPassenger(name: string) {
  passenger.name = name;
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // private mode: he'll remember you in spirit
  }
}

// "Rahul" when we know the passenger, '' when we don't
export const firstName = () => {
  const first = passenger.name.split(/\s+/)[0] ?? '';
  return first && first[0] + first.slice(1).toLowerCase();
};

export function toggleSound() {
  state.soundOn = !state.soundOn;
  emit();
}

export function honorTitle(h: number) {
  if (h >= 100) return 'HONORARY CO-PILOT';
  if (h >= 70) return 'CREW';
  if (h >= 40) return 'GOOD COMPANY';
  if (h >= 20) return 'DRIFTER';
  return 'STRANGER';
}

export const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
