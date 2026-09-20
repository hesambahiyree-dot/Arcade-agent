import type { FileMap } from "./fs";

/** A complete three-file project so editor + preview work without an API key. */
export const SAMPLE_FILES: FileMap = {
  "index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pulse Grid</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main>
      <header>
        <p class="kicker">ArcadeAgent sample</p>
        <h1>Pulse Grid</h1>
        <p class="meta">Clear the board. Each tap flips a cell and its neighbours.</p>
      </header>
      <section class="hud">
        <span>Moves <strong id="moves">0</strong></span>
        <span>Lit <strong id="lit">0</strong></span>
        <button type="button" id="reset">Reset</button>
      </section>
      <div id="board" class="board" role="grid" aria-label="Pulse Grid"></div>
      <p id="status" class="status">Tap a cell to begin.</p>
    </main>
    <script src="game.js"></script>
  </body>
</html>
`,
  "styles.css": `:root {
  --bg: #0b0c0e;
  --panel: #141518;
  --ink: #f2f1ee;
  --muted: #8b8d93;
  --line: rgba(242, 241, 238, 0.1);
  --cell: #1c1d22;
  --on: #d8dce4;
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  min-height: 100%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(1200px 500px at 50% -10%, rgba(216, 220, 228, 0.08), transparent 50%),
    var(--bg);
  color: var(--ink);
  font: 15px/1.5 "IBM Plex Sans", "Segoe UI", sans-serif;
}
main {
  width: min(420px, calc(100% - 32px));
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 24px;
}
.kicker {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
h1 { margin: 0; font-size: 28px; letter-spacing: -0.04em; font-weight: 600; }
.meta { margin: 8px 0 0; color: var(--muted); }
.hud {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0 16px;
  color: var(--muted);
  font-size: 13px;
}
.hud strong { color: var(--ink); font-variant-numeric: tabular-nums; }
#reset {
  margin-inline-start: auto;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: var(--ink);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
}
.board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.cell {
  aspect-ratio: 1;
  border: 0;
  border-radius: 12px;
  background: var(--cell);
  box-shadow: inset 0 0 0 1px var(--line);
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}
.cell.on { background: var(--on); }
.cell:active { transform: scale(0.96); }
.status { margin: 16px 0 0; min-height: 1.5em; color: var(--muted); }
`,
  "game.js": `const SIZE = 5;
const boardEl = document.getElementById("board");
const movesEl = document.getElementById("moves");
const litEl = document.getElementById("lit");
const statusEl = document.getElementById("status");
const resetEl = document.getElementById("reset");

let cells = [];
let moves = 0;

function index(x, y) { return y * SIZE + x; }

function neighbors(i) {
  const x = i % SIZE;
  const y = Math.floor(i / SIZE);
  const next = [i];
  if (x > 0) next.push(index(x - 1, y));
  if (x < SIZE - 1) next.push(index(x + 1, y));
  if (y > 0) next.push(index(x, y - 1));
  if (y < SIZE - 1) next.push(index(x, y + 1));
  return next;
}

function render() {
  let lit = 0;
  for (let i = 0; i < cells.length; i += 1) {
    const on = cells[i];
    boardEl.children[i].classList.toggle("on", on);
    if (on) lit += 1;
  }
  movesEl.textContent = String(moves);
  litEl.textContent = String(lit);
  if (lit === 0) {
    statusEl.textContent = "Clear. " + moves + " moves.";
  }
}

function press(i) {
  if (cells.every((cell) => !cell) && moves > 0) return;
  for (const n of neighbors(i)) cells[n] = !cells[n];
  moves += 1;
  render();
}

function scramble() {
  cells = Array.from({ length: SIZE * SIZE }, () => false);
  moves = 0;
  const taps = 8 + Math.floor(Math.random() * 7);
  for (let n = 0; n < taps; n += 1) {
    const i = Math.floor(Math.random() * cells.length);
    for (const nb of neighbors(i)) cells[nb] = !cells[nb];
  }
  statusEl.textContent = "Tap a cell to begin.";
  render();
}

boardEl.innerHTML = "";
for (let i = 0; i < SIZE * SIZE; i += 1) {
  const btn = document.createElement("button");
  btn.className = "cell";
  btn.type = "button";
  btn.setAttribute("aria-label", "Cell " + (i + 1));
  btn.addEventListener("click", () => press(i));
  boardEl.appendChild(btn);
}
resetEl.addEventListener("click", scramble);
scramble();
`,
};

export const SAMPLE_ACTIVE = "index.html";
