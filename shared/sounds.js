// shared/sounds.js — Web Audio API sound synthesis. No audio files.

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Schedule a single tone: type, freq, start offset (s), duration (s), peak gain.
function tone(type, freq, start, dur, peak = 0.2, endFreq = null) {
  const c = getCtx();
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t0 + dur);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const Sounds = {
  // Descending comic boing — two falling tones, cartoony
  wrong() {
    tone('sine',     520, 0.00, 0.22, 0.28, 260);
    tone('triangle', 300, 0.18, 0.30, 0.22, 140);
  },

  // Quick bright ascending chime
  correct() {
    tone('triangle', 880,  0.00, 0.12, 0.22);
    tone('triangle', 1320, 0.08, 0.18, 0.22);
  },

  // Sparkly ascending arpeggio, 4 notes
  cardUnlock() {
    const notes = [784, 988, 1175, 1568]; // G5 B5 D6 G6
    notes.forEach((f, i) => {
      tone('triangle', f, i * 0.09, 0.25, 0.18);
      tone('sine',     f * 2, i * 0.09, 0.20, 0.08); // shimmer harmonic
    });
  },

  // 4-note ascending fanfare
  moduleComplete() {
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      tone('triangle', f, i * 0.14, 0.32, 0.22);
      tone('sine',     f * 1.5, i * 0.14, 0.28, 0.08);
    });
  },

  // Extended multi-layer fanfare
  portalComplete() {
    // Layer 1: melody
    const melody = [
      [523, 0.00, 0.20],  // C5
      [659, 0.18, 0.20],  // E5
      [784, 0.36, 0.20],  // G5
      [1047, 0.54, 0.30], // C6
      [988, 0.88, 0.18],  // B5
      [1047, 1.08, 0.18], // C6
      [1319, 1.28, 0.50], // E6
      [1568, 1.78, 0.80], // G6 — sustained
    ];
    melody.forEach(([f, s, d]) => tone('triangle', f, s, d, 0.22));

    // Layer 2: supporting fifth harmonics
    melody.forEach(([f, s, d]) => tone('sine', f * 1.5, s, d, 0.07));

    // Layer 3: bass pulses
    tone('sine', 131, 0.00, 0.50, 0.20); // C3
    tone('sine', 131, 0.60, 0.50, 0.18);
    tone('sine', 196, 1.20, 0.50, 0.20); // G3
    tone('sine', 262, 1.80, 0.80, 0.22); // C4

    // Layer 4: sparkle arpeggio on top
    const sparkle = [2093, 2637, 3136, 2637, 3136, 3951]; // C7 E7 G7 E7 G7 B7
    sparkle.forEach((f, i) => tone('triangle', f, 1.0 + i * 0.08, 0.18, 0.09));
  }
};

window.Sounds = Sounds;
