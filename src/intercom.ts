import { sfx } from './audio';
import { wait } from './state';

const box = document.getElementById('intercom')!;
const text = document.getElementById('intercomText')!;
const queue: string[] = [];
let busy = false;
let skip = false;

// tapping the box shuts the captain up (for now)
box.addEventListener('click', () => (skip = true));

export function isTalking() {
  return busy;
}

export function announce(msg: string, urgent = false) {
  if (urgent) queue.unshift(msg);
  else queue.push(msg);
  queue.length = Math.min(queue.length, 3);
  if (!busy) void next();
}

async function next() {
  const msg = queue.shift();
  if (!msg) {
    busy = false;
    return;
  }
  busy = true;
  sfx.ding();
  text.textContent = '';
  box.classList.add('on');
  skip = false;
  for (const ch of msg) {
    if (skip) break;
    text.textContent += ch;
    await wait(16);
  }
  for (let t = 0; t < Math.max(2400, msg.length * 42) && !skip; t += 100) await wait(100);
  box.classList.remove('on');
  await wait(420);
  void next();
}
