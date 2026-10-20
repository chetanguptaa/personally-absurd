import { state } from './state';

// Every sound is synthesized on the fly. No audio files, no copyright.
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (!state.soundOn) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', vol = 0.15, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise(at: number, dur: number, vol = 0.2, freq = 1200, q = 1) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + at;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = c.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(t);
}

export const sfx = {
  ding() { tone(1046, 0, 0.9, 'sine', 0.1); tone(784, 0.32, 1.2, 'sine', 0.1); },
  stamp() { tone(90, 0, 0.18, 'square', 0.18, 40); noise(0, 0.12, 0.3, 400); },
  clank() { noise(0, 0.25, 0.35, 2500, 4); tone(220, 0, 0.15, 'triangle', 0.1, 180); },
  grunt() { tone(150, 0, 0.4, 'sawtooth', 0.1, 70); },
  nope() { tone(160, 0, 0.16, 'square', 0.1); tone(115, 0.19, 0.32, 'square', 0.1); },
  blip() { tone(660, 0, 0.06, 'square', 0.05); },
  puff() { noise(0, 0.35, 0.3, 900, 0.7); },
  whoosh() { noise(0, 0.7, 0.25, 600, 0.5); },
  scribble() { noise(0, 0.45, 0.12, 3200, 2); },
  engine(dur = 2.6) { tone(70, 0, dur, 'sawtooth', 0.06, 1100); tone(72, 0, dur, 'sawtooth', 0.05, 1110); },
  heehee() { tone(900, 0, 0.22, 'sine', 0.1, 1900); tone(1000, 0.28, 0.2, 'sine', 0.1, 2100); },
  melody(notes: number[], step = 0.16, type: OscillatorType = 'square') {
    notes.forEach((n, i) => { if (n > 0) tone(n, i * step, step * 0.9, type, 0.06); });
  },
  babble(n = 10) {
    for (let i = 0; i < n; i++) tone(180 + Math.random() * 260, i * 0.09, 0.07, 'square', 0.04);
  },
};
