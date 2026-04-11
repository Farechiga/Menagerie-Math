// shared/rewards.js — card unlock logic, growth mindset messages, selection modal.
// Depends on: shared/state.js, shared/sounds.js

// Build a PAGE-RELATIVE prefix to the project root by reading the raw
// `src` attribute from the script tag that loaded this file. We want the
// literal string from the HTML (e.g. "../../shared/rewards.js") rather
// than the resolved absolute URL — absolute file:// URLs with percent-
// encoded spaces (iCloud paths) can fail to load even when the file
// exists, while page-relative paths always resolve correctly.
const REWARDS_BASE = (function () {
  try {
    const script = document.currentScript;
    if (script) {
      const raw = script.getAttribute('src');
      if (raw) return raw.replace(/shared\/rewards\.js(\?.*)?$/, '');
    }
  } catch (e) {}
  // Fallback: scan all script tags for rewards.js
  try {
    const tags = document.querySelectorAll('script[src]');
    for (const t of tags) {
      const raw = t.getAttribute('src');
      if (raw && /shared\/rewards\.js(\?.*)?$/.test(raw)) {
        return raw.replace(/shared\/rewards\.js(\?.*)?$/, '');
      }
    }
  } catch (e) {}
  return '';
})();

function animalImageURL(filename) {
  return REWARDS_BASE + 'assets/Animal_Pictures/' + filename;
}

const GROWTH_MESSAGES_SOURCE = [
  // Progress & effort
  "I'm making progress!",
  "I'll use my Aikido on you: Math!",
  'Hard work is how brains grow!',
  'My brain isnt lost; it just took an interesting route.',
  "My brain called, it said it's working on it!",
  'Practice is making this easier.',
  "I'm getting better every single round.",
  'Each answer teaches me something.',
  'I kept going and it worked!',
  'This is getting more familiar.',
  // Resilience & persistence
  'Challenging problems can be broken down!',
  'Every mistake is a stepping stone.',
  'Stick with it — it pays off!',
  'I can figure this out.',
  'Hard things get easier with practice.',
  "I didn't give up!",
  'Trying again is a superpower.',
  'I worked through something tricky today.',
  'Struggle means my brain is growing.',
  'I have outsmarted harder things than you. Math.',
  // Confidence & identity
  'I am a math learner!',
  'My brain gets stronger when I practice.',
  'I can do hard things.',
  "I'm the kind of person who keeps trying.",
  "Smart isn't something you are — it's something you build.",
  'No half blood ever got slayed by a math problem.',
  'Look how far I’ve come!',
  "I'm building something real in my brain.",
  "Plot twist: I enjoy hard things now.",
  'This is what learning feels like!',
  // Curiosity & wonder
  'Math is full of cool patterns!',
  'I love finding how numbers connect.',
  'Numbers make sense when I look closely.',
  "There's always a way through.",
  "Mistakes are just answers wearing a costume.",
  'Every problem is a little puzzle.',
  "Math is a language I'm learning to speak.",
  'I see the pattern now!',
  'I tried my best, and my best said: hold on a second.',
  'Curiosity is my best tool.'
];

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomGrowthMessage() {
  const shuffled = shuffle(GROWTH_MESSAGES_SOURCE);
  return shuffled[0];
}

function animalNameFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/_/g, ' ');
}

const Rewards = {
  // Shuffled on every access
  get GROWTH_MESSAGES() {
    return shuffle(GROWTH_MESSAGES_SOURCE);
  },

  pickCards(n = 3) {
    const owned = new Set(State.get().menagerie);
    const available = State.getAnimalManifest().filter(f => !owned.has(f));
    const shuffled = shuffle(available);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  },

  addCard(filename) {
    const s = State.get();
    if (!s.menagerie.includes(filename)) {
      s.menagerie.push(filename);
      State.save(s);
    }
  },

  // 3-card picker modal. Resolves when child picks; invokes onPicked(filename).
  showCardPickModal(onPicked) {
    const cards = Rewards.pickCards(3);
    if (cards.length === 0) {
      if (onPicked) onPicked(null);
      return;
    }

    Sounds.cardUnlock();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Pick a card');

    const title = document.createElement('h2');
    title.className = 'modal__title';
    title.textContent = 'Pick a card for your menagerie!';

    const growth = document.createElement('p');
    growth.className = 'feedback feedback--growth fade-in-up';
    growth.textContent = randomGrowthMessage();

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    grid.style.gap = 'var(--space-4)';
    grid.style.marginTop = 'var(--space-5)';

    cards.forEach((filename) => {
      const frame = document.createElement('button');
      frame.type = 'button';
      frame.className = 'pop-in';
      frame.style.aspectRatio = '1 / 1';
      frame.style.width = '100%';
      frame.style.padding = '0';
      frame.style.border = '3px solid var(--line)';
      frame.style.borderRadius = 'var(--radius-md)';
      frame.style.overflow = 'hidden';
      frame.style.background = 'var(--white)';
      frame.style.cursor = 'pointer';
      frame.style.boxShadow = 'var(--shadow-sm)';
      frame.style.transition = 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease';

      const img = document.createElement('img');
      img.src = animalImageURL(filename);
      img.alt = animalNameFromFilename(filename);
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';
      img.onerror = function () {
        console.error('[Rewards] failed to load image:', this.src);
      };

      frame.appendChild(img);

      frame.addEventListener('mouseenter', () => {
        frame.style.transform = 'translateY(-4px)';
        frame.style.borderColor = 'var(--magenta)';
        frame.style.boxShadow = 'var(--shadow-md)';
      });
      frame.addEventListener('mouseleave', () => {
        frame.style.transform = '';
        frame.style.borderColor = 'var(--line)';
        frame.style.boxShadow = 'var(--shadow-sm)';
      });

      frame.addEventListener('click', () => {
        if (frame.dataset.picked === 'true') return;
        // Lock all options so only one pick registers
        grid.querySelectorAll('button').forEach((b) => {
          b.dataset.picked = 'true';
          b.style.pointerEvents = 'none';
          if (b !== frame) {
            b.style.opacity = '0.25';
          } else {
            b.style.transform = 'scale(1.06)';
            b.style.borderColor = 'var(--magenta)';
            b.style.boxShadow = 'var(--shadow-lg)';
          }
        });
        Rewards.addCard(filename);
        Sounds.correct();
        // Keep the modal open briefly so the child can see her picked card
        // and read the growth-mindset phrase before the round advances.
        setTimeout(() => {
          if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
          if (onPicked) onPicked(filename);
        }, 1800);
        return;
      });

      grid.appendChild(frame);
    });

    modal.appendChild(title);
    modal.appendChild(growth);
    modal.appendChild(grid);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  },

  // Coins module — add a specific card directly and celebrate briefly.
  showDirectCard(filename) {
    Rewards.addCard(filename);
    Sounds.cardUnlock();

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'New card added');

    const title = document.createElement('h2');
    title.className = 'modal__title';
    title.textContent = 'New card added to your menagerie!';

    const frame = document.createElement('div');
    frame.className = 'pop-in';
    frame.style.aspectRatio = '1 / 1';
    frame.style.width = '220px';
    frame.style.margin = 'var(--space-4) auto';
    frame.style.borderRadius = 'var(--radius-md)';
    frame.style.overflow = 'hidden';
    frame.style.border = '3px solid var(--magenta)';
    frame.style.boxShadow = 'var(--shadow-md)';

    const img = document.createElement('img');
    img.src = `../assets/Animal_Pictures/${filename}`;
    img.alt = animalNameFromFilename(filename);
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    frame.appendChild(img);

    const name = document.createElement('p');
    name.style.fontWeight = '800';
    name.style.fontSize = 'var(--text-lg)';
    name.textContent = animalNameFromFilename(filename);

    const growth = document.createElement('p');
    growth.className = 'feedback feedback--growth fade-in-up';
    growth.textContent = randomGrowthMessage();

    modal.appendChild(title);
    modal.appendChild(frame);
    modal.appendChild(name);
    modal.appendChild(growth);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    setTimeout(() => {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }, 3600);
  }
};

window.Rewards = Rewards;
