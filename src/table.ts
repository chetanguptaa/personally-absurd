import { sfx } from './audio';
import { addHonor, firstName, pick } from './state';

// The site does what Chetan does: it remembers your legend and brings it up next time.
const KEY = 'airgoat.legend';

export function savedLegend(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function saveLegend(deed: string) {
  try {
    localStorage.setItem(KEY, deed);
  } catch {
    // private mode: the legend lives on in spirit
  }
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const STORIES: ((who: string, deed: string) => string)[] = [
  (who, deed) => `It was a day like any other. Then ${who} ${deed}. Historians are still arguing about it.`,
  (who, deed) => `Alexander conquered most of the known world. ${cap(who)} ${deed}. Alexander has asked that the two never be compared.`,
  (who, deed) => `They say the sky went quiet the moment ${who} ${deed}. They are correct.`,
  (who, deed) => `Songs will be written about the day ${who} ${deed}. Prince has already started one.`,
  (who, deed) => `Of all the great deeds in human history, the table brings one up the most: the time ${who} ${deed}.`,
];

const REACTIONS = [
  'Alexander the Great pulls out a chair.',
  'Napoleon stands up. He is still not very tall, but he stands.',
  'Ayrton Senna nods slowly. That is the highest honour he gives.',
  'Amelia Earhart wants to hear it again. From the top.',
  'Muhammad Ali calls it the greatest thing he has ever heard. He would know.',
  'Michael Jackson does a little spin. Prince rolls his eyes, then also does a spin.',
  'Leonardo da Vinci is sketching it on a napkin.',
  'Genghis Khan is crying a little. Nobody mentions it.',
  'Cleopatra has ordered another round for the table.',
];

// "I made tea." -> "made tea"
function normalise(raw: string) {
  let deed = raw.trim().replace(/[.!]+$/, '');
  deed = deed.replace(/^i\s+/i, '');
  return deed && deed[0].toLowerCase() + deed.slice(1);
}

export function initTable() {
  const card = document.getElementById('reserved')!;
  const story = document.getElementById('legendStory')!;
  const react = document.getElementById('legendReact')!;
  const foot = document.getElementById('legendFoot')!;

  const tell = (who: string, deed: string, seat: string, note = '') => {
    story.textContent = pick(STORIES)(who, deed);
    react.textContent = pick(REACTIONS);
    foot.textContent = `TABLE 1 · HEAVEN · SEAT RESERVED FOR: ${seat}${note}`;
    card.hidden = false;
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
    sfx.ding();
    addHonor(3);
  };

  document.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) =>
    chip.addEventListener('click', () => tell('Chetan', chip.dataset.deed!, 'CHETAN')),
  );

  const form = document.getElementById('legendForm') as HTMLFormElement;
  const input = document.getElementById('legendDeed') as HTMLInputElement;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const deed = normalise(input.value);
    if (!deed) return;
    input.value = '';
    saveLegend(deed);
    const name = firstName();
    tell(name || 'you', deed, name.toUpperCase() || 'YOU', ' · THE CAPTAIN WILL BRING THIS UP NEXT TIME YOU VISIT');
  });
}
