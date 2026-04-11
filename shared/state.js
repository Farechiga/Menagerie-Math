// shared/state.js — localStorage-backed progress + menagerie state.
// Schema:
// {
//   modules: {
//     time:    { points: 0, complete: false },
//     coins:   { points: 0, complete: false },
//     facts:   { points: 0, complete: false },
//     multdiv: { points: 0, complete: false }
//   },
//   menagerie: ["filename.jpg", ...]
// }

const STORAGE_KEY = 'mathPortalState';

const DEFAULT_STATE = {
  modules: {
    time:    { points: 0, complete: false },
    coins:   { points: 0, complete: false },
    facts:   { points: 0, complete: false },
    multdiv: { points: 0, complete: false }
  },
  menagerie: []
};

// Hard-coded manifest of every image file in assets/Animal_Pictures/.
// Files are named Animal1..Animal235 with original extension preserved.
// Regenerate if files are added or removed.
const ANIMAL_MANIFEST = (function () {
  // Non-.jpg files keep their original formats
  const SPECIAL = {
    156: 'png',
    203: 'webp',
    206: 'webp',
    234: 'jpeg',
    235: 'jpeg'
  };
  // Animal92.heic was removed (unsupported in Chrome/Firefox)
  const SKIP = new Set([92]);
  const list = [];
  for (let i = 1; i <= 235; i++) {
    if (SKIP.has(i)) continue;
    const ext = SPECIAL[i] || 'jpg';
    list.push(`Animal${i}.${ext}`);
  }
  return list;
})();

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

const State = {
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneDefault();
      const parsed = JSON.parse(raw);
      const fresh = cloneDefault();
      if (parsed && parsed.modules) {
        // Locally-scoped cap — kept inside get() so the constant does not
        // leak into the shared classic-script lexical environment where it
        // would collide with other scripts that declare the same name.
        const GOAL_CAP = 10;
        for (const key of Object.keys(fresh.modules)) {
          if (parsed.modules[key]) {
            let pts = parsed.modules[key].points || 0;
            if (pts > GOAL_CAP) pts = GOAL_CAP;
            fresh.modules[key].points = pts;
            fresh.modules[key].complete =
              !!parsed.modules[key].complete || pts >= GOAL_CAP;
          }
        }
      }
      if (parsed && Array.isArray(parsed.menagerie)) {
        fresh.menagerie = parsed.menagerie.slice();
      }
      return fresh;
    } catch (e) {
      return cloneDefault();
    }
  },

  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  getAnimalManifest() {
    return ANIMAL_MANIFEST.slice();
  }
};

window.State = State;
