import { sfx } from './audio';
import { CONFIG } from './config';
import { moonwalk, purpleRain, shadowClones, shake } from './effects';
import { announce } from './intercom';
import { addHonor, firstName, wait } from './state';

/* ---------- 03 in-flight magazine ---------- */
const MONOLOGUE = [
  "...and that's when I realised I was right. Again.",
  "...anyway, enough about me. Let's talk about my deadlift.",
  "...hour two of this. I've barely started.",
  "...one day I'm flying my own Cessna. Today I fly this website.",
  '...Arthur Morgan had honor. I have honor and a gym membership.',
  "...my dream car's an F1 car. Technically any car is, if I'm driving.",
  "...Harvey doesn't settle. Neither do I. I forgot what we were arguing about.",
  "...the box was five feet. I'm five nine. I'd do it again.",
  "...Alexander's saving me a seat. I've got stories ready. Some of them are about Maggi.",
  "...my WHOOP says I'm 15. I've chosen to believe it.",
];

export function initIfe() {
  const now = document.getElementById('nowPlaying')!;
  const chans = document.querySelectorAll<HTMLButtonElement>('.chan');
  let monologue: number | undefined;

  chans.forEach((chan) =>
    chan.addEventListener('click', () => {
      chans.forEach((c) => c.classList.toggle('is-on', c === chan));
      clearInterval(monologue);
      addHonor(2);

      switch (chan.dataset.chan) {
        case 'weeknd': {
          const on = document.body.classList.toggle('after-hours');
          sfx.melody([220, 261.6, 329.6, 261.6, 196, 246.9, 293.7, 246.9], 0.18, 'sawtooth');
          now.textContent = on
            ? 'NOW PLAYING: AFTER HOURS MODE. The aircraft is now red neon and emotionally unavailable. Tap CH 1 again for daylight.'
            : 'AFTER HOURS MODE: OFF. Daylight restored.';
          break;
        }
        case 'mj':
          sfx.melody([110, 0, 110, 130.8, 0, 146.8, 110, 0], 0.14, 'square');
          now.textContent = 'NOW PLAYING: The entire website is moonwalking. Please hold on to your scroll wheel.';
          moonwalk();
          break;
        case 'prince':
          sfx.melody([392, 466.2, 523.3, 466.2, 392, 349.2], 0.24, 'triangle');
          now.textContent = 'NOW PLAYING: Weather update. Precipitation: purple.';
          purpleRain();
          break;
        case 'chetan': {
          let i = 0;
          const say = () => {
            now.textContent = `NOW PLAYING: CHETAN ON CHETAN (LIVE) · ${MONOLOGUE[i++ % MONOLOGUE.length]}`;
            sfx.babble();
          };
          say();
          monologue = window.setInterval(say, 2600);
          break;
        }
      }
    }),
  );
}

/* ---------- 05 court ---------- */
const RULINGS = [
  'OVERRULED.',
  'OVERRULED.',
  'SUSTAINED. ...NO WAIT. OVERRULED.',
  'PASSIONATE. STILL OVERRULED.',
  'COUNSEL, THE DEFENCE IS ALSO THE JUDGE. OVERRULED.',
  'SIX OBJECTIONS. RESPECT. OVERRULED.',
];

export function initCourt() {
  document.querySelectorAll<HTMLElement>('.record').forEach((rec) =>
    rec.addEventListener('click', () => {
      if (!rec.classList.contains('open')) addHonor(1);
      rec.classList.toggle('open');
      sfx.blip();
    }),
  );

  const verdict = document.getElementById('verdict')!;
  const rule = (text: string) => {
    verdict.textContent = text;
    verdict.classList.remove('slam');
    void verdict.offsetWidth;
    verdict.classList.add('slam');
  };

  let objections = 0;
  document.getElementById('objection')!.addEventListener('click', () => {
    sfx.stamp();
    setTimeout(() => sfx.stamp(), 140);
    addHonor(1);
    rule(RULINGS[Math.min(objections++, RULINGS.length - 1)]);
  });

  document.getElementById('witness')!.addEventListener('click', () => {
    rule('THE DEFENCE CALLS... HIMSELF.');
    setTimeout(() => {
      shadowClones();
      rule('FORTY TIMES.');
    }, 700);
    addHonor(3);
  });

  document.getElementById('truth')!.addEventListener('click', async () => {
    const overlay = document.createElement('div');
    overlay.className = 'truth';
    overlay.innerHTML = '<div class="truth-shout">YOU CAN’T<br />HANDLE THE<br />TRUTH.</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    sfx.stamp();
    shake(overlay);
    await wait(2200);

    // the one sincere beat on the whole site
    overlay.innerHTML = `
      <div class="truth-real">
        <small>...OKAY, FINE. REAL TALK.</small>
        <p>One day I'm getting my private pilot's licence. Then a Cessna of my own. I'm driving an F1 car
        at least once, and I'm finishing an Ironman.<br /><br />And yes, I'm genuinely saving stories for that table.
        Until then, I fly this website.</p>
        <button class="btn btn--hot" type="button">BACK TO THE BIT →</button>
      </div>`;
    addHonor(10);
    overlay.querySelector('button')!.addEventListener('click', () => {
      overlay.remove();
      document.body.style.overflow = '';
      rule('CASE DISMISSED. THE JURY LIKES HIM. NOBODY KNOWS WHY.');
    });
  });
}

/* ---------- 06 landing ---------- */
export function initLanding() {
  const stars = [...document.querySelectorAll<HTMLButtonElement>('#stars button')];
  const rateMsg = document.getElementById('rateMsg')!;

  stars.forEach((star) =>
    star.addEventListener('click', () => {
      const given = Number(star.dataset.star);
      stars.forEach((s, i) => s.classList.toggle('on', i < given));
      sfx.blip();
      // every rating is corrected to five, one star at a time
      stars.forEach((s, i) => setTimeout(() => { s.classList.add('on'); sfx.blip(); }, 300 + i * 120));
      setTimeout(() => {
        rateMsg.textContent = given === 5
          ? 'Five stars. You get it.'
          : `Your rating of ${given} has been corrected to 5. Thank you for your honesty.`;
        sfx.stamp();
      }, 950);
      addHonor(given === 5 ? 10 : 5);
    }),
  );

  const links = document.getElementById('links')!;
  for (const { label, href } of CONFIG.links) {
    const a = document.createElement('a');
    a.href = href;
    if (href.startsWith('http')) a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = '<span></span><span>↗</span>';
    a.firstElementChild!.textContent = label;
    links.appendChild(a);
  }

  document.getElementById('again')!.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: 'smooth' });
    announce(`Back for another flight${firstName() ? `, ${firstName()}` : ''}? Knew you would be.`);
  });
}
