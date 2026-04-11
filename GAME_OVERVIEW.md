# 3rd Grade Math Portal — Game Design Overview
## Status: All clarifications resolved. Ready for build.

---

## Project Structure

```
3rd-grade-math-portal/
├── index.html                        # Portal home / module selector
├── assets/
│   ├── Animal_Pictures/              # PROVIDED — animal card images (mixed formats)
│   ├── Coins/                        # PROVIDED — coin PNGs randomize use of heads/tails variants (penny, nickel, dime, quarter)
│   ├── module_icons/                 # PROVIDED — module icon PNGs (Time.png, Coins.png, Facts.png, MultDiv.png)
│   └── (no sound files needed)       # Sounds synthesized via Web Audio API
├── Ref_MathFacts/
│   └── index.html                    # PROVIDED — reference for Missing Number logic
├── Ref_MathStreaks/
│   ├── index.html
│   └── script.js
├── Ref_MultiplicationDivisionMatrix/
│   ├── 8times8example.png
│   └── 12times12example.png
├── modules/
│   ├── time/index.html
│   ├── coins/index.html
│   ├── facts/index.html
│   └── multdiv/index.html
├── menagerie/index.html              # Card collection gallery
└── shared/
    ├── state.js                      # localStorage — progress + menagerie
    ├── rewards.js                    # Card unlock logic + growth mindset messages
    ├── sounds.js                     # Web Audio API sound synthesis
    └── style.css                     # Global design tokens
```

---

## Design System

**Primary accents:** `#E700FF` (magenta) · `#7FD8D7` (teal)

**Background:** Chromatic white gradient — animate slowly through:
`#E2F7F7` `#E2EDF7` `#E5E2F7` `#F1E2F7` `#F7E2F3` `#F7E2E5` `#F7EAE2` `#F7F6E2` `#E7F7E2` `#E2F7EF`

**Aesthetic:** Modern, minimal, lots of white space. Fun color highlights but never busy.

**Wrong-answer UX:** CSS shake animation + whimsical synthesized sound + grit message.
Grit messages (rotate randomly): "Stick with it!", "Try a different approach", "Almost — keep going!", "You've got this!", "Think it through!"

**Correct-answer UX:** Advance immediately on Enter. No separate submit click needed.

**Input:** Press Enter to submit on all text/digit inputs throughout.

---

## Progression & Scoring

| Rule | Detail |
|---|---|
| Points per correct answer | 1 (all modules) |
| Points to complete a module | 20 |
| Must reach 20 before switching | Yes — other modules stay locked until current completes |
| Animal card trigger — non-coin modules | Every 5 points: present 3 random cards, child picks 1 |
| Animal card trigger — coins module | Each successful purchase = 1 point + 1 card added directly |
| Cards earned per non-coin module | 4 (awarded at 5, 10, 15, 20 pts) |
| Cards earned from coins module | 20 (one per successful purchase) |
| Total possible cards | 32 (4×3 non-coin + 20 coins) |
| All 4 modules complete | Grand celebration + portal complete screen |

**Card selection flow (non-coin modules):**
On every 5th point, pause gameplay. Show 3 randomly sampled animal cards (not yet owned). Child taps one to add to menagerie. Show growth mindset message. Resume gameplay.

**Growth mindset messages (shown on card unlock):**
- "Challenging problems can be broken down!"
- "I'm making progress!"
- "I'm learning!"
- "This is getting more familiar."
- "Hard work is how brains grow!"
- "Every mistake is a stepping stone."
- "I didn't know this before — now I do!"

**Module completion event:** Confetti burst (canvas-confetti), module icon badge turns gold checkmark, prompt to pick next module.

**Portal complete event:** Grand confetti + celebratory message + full menagerie display.

---

## Sounds — Web Audio API (`shared/sounds.js`, no files needed)

All sounds synthesized programmatically. Aim for whimsical, cartoonish, kid-friendly.

| Event | Character |
|---|---|
| Wrong answer | Descending "boing" — two falling tones, comic |
| Correct answer | Quick ascending chime — bright, short |
| Card unlock / pick moment | Sparkly ascending arpeggio |
| Module complete | 4-note ascending fanfare |
| Portal complete | Extended multi-layer fanfare |

---

## Animal Cards — `assets/Animal_Pictures/`

Enumerate all images at runtime via a hard-coded manifest array (generated once by inspecting the folder).

**Menagerie gallery layout:**
- Uniform square slots — `aspect-ratio: 1 / 1`
- `object-fit: cover` fills the square cleanly for both portrait and landscape source images
- 3–4 columns, responsive grid
- Collected: full image + animal name (derive from filename, strip extension, replace underscores with spaces)
- Uncollected: soft gray square with padlock icon (same dimensions)
- Clicking a collected card → modal with larger image

---

## Coin Assets — `assets/Coins/`

Four denominations: penny (1¢), nickel (5¢), dime (10¢), quarter (25¢).

**Heads/tails randomization:** Each coin has both heads and tails PNG variants. Randomly pick one each time a coin is rendered. Re-randomize per round.

**Relative display sizing** — proportional to real-world diameters, consistent scale:
| Coin | Real diameter | Display size |
|---|---|---|

---

## Module 1 — Time Telling

**Goal:** 20 correct answers.

### Difficulty distribution
| Type | Weight |
|---|---|
| Quarter hours only (0, 15, 30, 45 min) | 20% |
| Any 5-minute increment | 60% |
| Any 1-minute increment | 20% |

### Question type A — Read and type
Static SVG analog clock displayed. Child types time in `H:MM` or `HH:MM` format. Press Enter.

### Question type B — Set the clock
Written time prompt displayed in varied phrasing. Child drags hour and minute hands to correct position. Press Enter or "Check" button.

Phrasing variants:
- Numeric: "3:45", "11:05", "7:30"
- Quarter phrases: "quarter past [hour]", "half past [hour]", "quarter to [hour]", "[hour] o'clock"
- Minute phrases: "ten minutes after [hour]", "twenty minutes to [hour]", "[N] minutes past [hour]"

### Question type C — Elapsed time
Clock shows a start time + a word scenario. Child types the number of minutes.
Example: Clock shows 8:40 AM. "School starts at 9:00 AM — how many minutes until school starts?" → 20.

### Clock SVG spec
- Clean analog face, 12 numerals
- Hour hand: shorter, thicker, color `#E700FF`
- Minute hand: longer, thinner, color `#7FD8D7`
- Type B draggable hands: minute hand snaps to nearest minute or 5-min interval per round difficulty. Hour hand moves proportionally as minute hand is dragged (at 6:30 the hour hand sits halfway between 6 and 7).

---

## Module 2 — Coins

**Goal:** 20 correct answers = 20 successful purchases = 20 animal cards.

Every transaction is purchasing an animal card for the menagerie. One point per successful purchase.

**Price range:** All prices ≤ $2.00 using realistic coin combinations.

### Sub-game A — Exact change (60% of rounds)
- One animal card shown with a price tag
- Coin tray shown with a randomized set of available coins (always sufficient to make exact change)
- Child drags coins from tray to a "counter" drop zone; running total updates live
- Press Enter or "Pay" button to submit
- **Correct:** Chime + card added to menagerie + growth mindset message + next round
- **Incorrect:** Shake + boing + "Try adding or removing a coin"

### Sub-game B — Which can I afford? (40% of rounds)
- Fixed coin set shown (e.g., 1 quarter + 2 dimes); total displayed prominently
- Three animal cards shown with different price tags (only one is affordable)
- Child taps the affordable card
- **Wrong answer:** Immediately generate new round with different prices + different coin set
- **Correct:** Award card + point + growth mindset message

---

## Module 3 — Fact Family (Missing Number)

**Goal:** 20 correct answers.

### Logic source
Adapted directly from `Ref_MathFacts/index.html`. **Use only the FILL (Missing Number) mode.**

Functions to extract and adapt:
- `generateFamily()` — generates trio (a, b, c) where a + b = c OR a × b = c
- `renderTriangle()` — SVG triangle: three circle nodes (peak = sum/product, base nodes = operands)
- `checkAnswer()` — universal check: does the user's number make any valid math rule true?
- Hidden node chosen randomly from {a, b, c}
- Label: "MULTIPLY / DIVIDE" or "ADD / SUBTRACT" per which node is hidden

**Do NOT include** Imposter Hunt or Add or Multiply? modes.

### Visual adaptation
Keep the triangle visualization. Restyle to match the portal design system (white space, accent colors). Remove the animated gradient background from the reference — use the portal's chromatic white gradient instead. Replace the 10-point scoring with the portal's 1-point system.

---

## Module 4 — Multiplication & Division

**Goal:** 20 correct answers.

### Factor distribution (confirmed, sums to 100%)
| Factor | Weight |
|---|---|
| 1 | 2% |
| 2 | 3% |
| 3 | 8% |
| 4 | 10% |
| 5 | 15% |
| 6 | 10% |
| 7 | 15% |
| 8 | 10% |
| 9 | 15% |
| 10 | 2% |
| 11 | 5% |
| 12 | 5% |

Mix multiplication and division questions ~50/50. For each question, sample one factor using the table above, then sample a second factor independently using the same table.

### Grid visualization spec

**Row color key (match reference images exactly):**
| Row | Color |
|---|---|
| 1 | `#8B0000` dark red |
| 2 | `#CC2200` red |
| 3 | `#E85500` orange |
| 4 | `#C8900A` gold |
| 5 | `#1A6B1A` dark green |
| 6 | `#1A8C5A` teal-green |
| 7 | `#1A8C8C` teal |
| 8 | `#1A5CB8` blue |
| 9 | `#1A1A8C` dark navy |
| 10 | `#4B0082` indigo |
| 11 | `#7B1FA2` purple |
| 12 | `#C2185B` magenta-pink |

**Always render:**
- Black header bar: column indices 0→N in white text
- Black left bar: row indices 1→N in white text
- Color-filled grid cells; muted numbers inside each cell
- Far-right column: white bold skip-count running total per row

**Multiplication (e.g. 5 × 7 = ?):**
- Render 5 rows × 7 columns
- Skip-count column shows 7, 14, 21, 28 for rows 1–4
- Row 5 skip-count cell is **blank** — child fills in the answer
- Prompt: "5 × 7 = ?"

**Division (e.g. 63 ÷ 7 = ?):**
- Render full grid (9 rows × 7 cols = 63 squares)
- Skip-count column shows 7, 14 … 63 (final cell shown — dividend is given)
- Headers show 7 columns; child reads 9 rows → answer is 9
- Prompt: "63 ÷ 7 = ?"

Child types answer, presses Enter.

---

## Menagerie — `menagerie/index.html`

Accessible at all times via persistent icon on portal home and a small icon within each module.

**Grid:** Uniform square slots, `aspect-ratio: 1/1`, `object-fit: cover`, 3–4 columns responsive.
Collected card: image + name label. Uncollected: gray square + padlock icon.
Click collected card → modal with larger image.

**Header:** "You have [N] animals in your menagerie!"

---

## State & Persistence — `shared/state.js`

Stored in `localStorage` under key `mathPortalState`:

```js
{
  modules: {
    time:    { points: 0, complete: false },
    coins:   { points: 0, complete: false },
    facts:   { points: 0, complete: false },
    multdiv: { points: 0, complete: false }
  },
  menagerie: ["filename1.jpg", "filename2.png"]
}
```

All modules use a single `State.get()` / `State.save()` interface. No reset button exposed in UI.

---

## GitHub / Deployment

```
Stack:    Pure HTML + CSS + Vanilla JS — no build step, no framework
Deploy:   GitHub Pages (serve /docs or gh-pages branch)
CDN dep:  canvas-confetti
          cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js
```

---

## Recommended Build Order for Claude Code

1. `shared/style.css` — design tokens, chromatic gradient, shake + transition animations
2. `shared/state.js` — localStorage read/write interface
3. `shared/sounds.js` — Web Audio API synthesis (wrong, correct, card unlock, complete)
4. `shared/rewards.js` — card unlock logic, growth mindset messages, 3-card selection modal
5. `index.html` — portal home: displays the 4 PNGs from `assets/module_icons/` (Time, Coins, Facts, MultDiv) as the module tiles with lock/progress/complete states (no text labels under the icons — the artwork carries the meaning). Menagerie button. Each module page also shows its icon in the header.
6. `menagerie/index.html` — card gallery grid + modal
7. `modules/multdiv/index.html` — grid visualization (most visual, good to nail early)
8. `modules/facts/index.html` — adapt FILL mode from Ref_MathFacts
9. `modules/time/index.html` — analog clock SVG + draggable hands
10. `modules/coins/index.html` — drag-and-drop coins, two sub-games
