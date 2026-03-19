/* ═══════════════════════════════════════════════════════
   DESTINYDLE — game.js
   Logique principale du jeu (état, règles, rendu des lignes)
   ═══════════════════════════════════════════════════════ */

// Ordre chronologique des extensions pour les flèches
const EXP_ORDER = [
  "Destiny 1", "D2 Vanilla", "Curse of Osiris", "Warmind",
  "Forsaken", "Shadowkeep", "Beyond Light", "Season",
  "Witch Queen", "Lightfall", "The Final Shape", "D2 / Saison"
];
const expIdx = e => {
  const i = EXP_ORDER.indexOf(e);
  return i === -1 ? 8 : i;
};

// ── État du jeu ───────────────────────────────────────
let target  = null;
let guesses = [];
let done    = false;

// ── Démarrage ─────────────────────────────────────────
function newGame() {
  target  = EXOTICS_DB[Math.floor(Math.random() * EXOTICS_DB.length)];
  guesses = [];
  done    = false;

  document.getElementById('guessRows').innerHTML = '';
  document.getElementById('searchInput').value   = '';
  document.getElementById('result').className    = 'result';
  document.getElementById('counterWrap').style.visibility = 'hidden';

  hideAC();
}

// ── Soumettre une tentative ───────────────────────────
function submitGuess() {
  if (done) return;

  const val   = document.getElementById('searchInput').value.trim();
  const guess = EXOTICS_DB.find(x => x.name.toLowerCase() === val.toLowerCase());

  if (!guess) { shakeInput(); return; }
  if (guesses.find(g => g.name === guess.name)) return;

  guesses.push(guess);
  document.getElementById('searchInput').value = '';
  hideAC();

  renderGuessRow(guess);
  updateCounter();

  if (guess.name === target.name) {
    done = true;
    showResult(true);
  }
}

// ── Rendu d'une ligne ─────────────────────────────────
function renderGuessRow(guess) {
  const t   = target;
  const row = document.createElement('div');
  row.className = 'guess-row';

  const di  = expIdx(guess.expansion) - expIdx(t.expansion);
  const arr = di < 0 ? ' ↑' : di > 0 ? ' ↓' : '';
  const expState = guess.expansion === t.expansion ? 'correct' : 'partial';

  const cells = [
    {
      cls:   'cell-name',
      html:  `<img src="${guess.icon}" onerror="this.style.display='none'" alt="">
              <span>${guess.name}</span>`,
      state: guess.name === t.name ? 'correct' : 'wrong'
    },
    { html: guess.type,             state: guess.type      === t.type      ? 'correct' : 'wrong' },
    { html: buildElemHtml(guess),   state: guess.element   === t.element   ? 'correct' : 'wrong' },
    { html: guess.slot,             state: guess.slot      === t.slot      ? 'correct' : 'wrong' },
    { html: guess.ammo,             state: guess.ammo      === t.ammo      ? 'correct' : 'wrong' },
    {
      html:  guess.expansion + `<span class="arrow">${arr}</span>`,
      state: expState
    },
  ];

  cells.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = `cell ${c.cls || ''} ${c.state}`;
    div.style.animationDelay = (i * 70) + 'ms';
    div.innerHTML = c.html;
    row.appendChild(div);
  });

  // Nouvelles lignes en haut
  document.getElementById('guessRows').prepend(row);
}

// ── HTML élément ──────────────────────────────────────
function buildElemHtml(item) {
  return `<span class="elem">
    <span class="dot e-${item.element}"></span>${item.element}
  </span>`;
}

// ── Compteur ──────────────────────────────────────────
function updateCounter() {
  const wrap = document.getElementById('counterWrap');
  document.getElementById('tryCount').textContent = guesses.length;
  wrap.style.visibility = guesses.length > 0 ? 'visible' : 'hidden';
}

// ── Résultat final ────────────────────────────────────
function showResult(win) {
  const el = document.getElementById('result');
  el.className = 'result show' + (win ? '' : ' fail');

  document.getElementById('resultTitle').textContent = win
    ? `Lumière trouvée en ${guesses.length} tentative${guesses.length > 1 ? 's' : ''} !`
    : "La Lumière s'est éteinte…";

  document.getElementById('resultAnswer').innerHTML =
    `<img src="${target.screenshot}" onerror="this.src='${target.icon}'" alt="">
     <div>
       <div class="aname">${target.name}</div>
       <div class="ameta">${target.type} · ${target.element} · ${target.slot} · ${target.expansion}</div>
     </div>`;

  document.getElementById('resultSub').textContent = win
    ? 'Bien joué, Gardien !'
    : `C'était : ${target.name}`;
}

// ── Shake sur mauvaise saisie ─────────────────────────
function shakeInput() {
  const inp = document.getElementById('searchInput');
  inp.style.borderColor = '#c04040';
  inp.style.animation   = 'shake .3s ease';
  setTimeout(() => {
    inp.style.borderColor = '';
    inp.style.animation   = '';
  }, 400);
}

// ── Init au chargement ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  newGame();
});
