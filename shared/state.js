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

// ---- Animal-picture manifest ----
// Reward images live in assets/Animal_Pictures/. A static site cannot list a
// directory itself, so the manifest is sourced in this order of preference:
//   1. A live listing from the GitHub repo's contents API — this picks up ANY
//      image added to the folder with no code change at all.
//   2. A cached copy of the last successful listing (localStorage).
//   3. A hard-coded fallback, used offline or if the API is unreachable.
// getAnimalManifest() always returns synchronously; the GitHub refresh runs in
// the background and updates the list for this and future loads.
const GITHUB_CONTENTS_URL =
  'https://api.github.com/repos/Farechiga/Menagerie-Math/contents/assets/Animal_Pictures';
const MANIFEST_CACHE_KEY = 'menagerie_animal_manifest_v1';
const IMAGE_FILE_RE = /\.(jpe?g|png|webp|gif)$/i;

// Hard-coded fallback, kept roughly in sync with what is committed to the repo
// so the game still works offline. The live GitHub listing is authoritative;
// this only needs updating if you want offline coverage of newer uploads.
// Covers Animal1..235 and Animal300..349.
const FALLBACK_MANIFEST = (function () {
  // Non-.jpg files keep their original formats
  const SPECIAL = { 156: 'png', 203: 'webp', 206: 'webp', 234: 'jpeg', 235: 'jpeg' };
  // Animal92.heic removed (unsupported in Chrome/Firefox); Animal335 never uploaded
  const SKIP = new Set([92, 335]);
  const list = [];
  function pushRange(from, to) {
    for (let i = from; i <= to; i++) {
      if (SKIP.has(i)) continue;
      list.push('Animal' + i + '.' + (SPECIAL[i] || 'jpg'));
    }
  }
  pushRange(1, 235);
  pushRange(300, 349);
  return list;
})();

// Live manifest: start from the cached listing if present, else the fallback.
let animalManifest = (function () {
  try {
    const cached = JSON.parse(localStorage.getItem(MANIFEST_CACHE_KEY));
    if (Array.isArray(cached) && cached.length) return cached;
  } catch (e) { /* ignore malformed cache */ }
  return FALLBACK_MANIFEST.slice();
})();

// Background refresh from GitHub — updates animalManifest in place on success
// and caches the result. Failures (offline, rate limit) keep the current list.
(function refreshAnimalManifest() {
  if (typeof fetch !== 'function') return;
  fetch(GITHUB_CONTENTS_URL, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (res) { return res.ok ? res.json() : null; })
    .then(function (items) {
      if (!Array.isArray(items)) return;
      const names = items
        .filter(function (it) { return it && it.type === 'file' && IMAGE_FILE_RE.test(it.name); })
        .map(function (it) { return it.name; });
      if (!names.length) return;
      animalManifest = names;
      try { localStorage.setItem(MANIFEST_CACHE_KEY, JSON.stringify(names)); } catch (e) { /* ignore */ }
    })
    .catch(function () { /* offline or rate-limited — keep cached/fallback list */ });
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
    return animalManifest.slice();
  }
};

window.State = State;
