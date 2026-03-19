/* ═══════════════════════════════════════════════════════
   DESTINYDLE — ui.js
   Interactions UI : autocomplete, modal, navigation
   ═══════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════
//  AUTOCOMPLETE
// ══════════════════════════════════════════════════════

function onSearch() {
  const val = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!val) { hideAC(); return; }

  const used    = new Set(guesses.map(g => g.name));
  const matches = EXOTICS_DB
    .filter(x => x.name.toLowerCase().includes(val) && !used.has(x.name))
    .slice(0, 8);

  if (!matches.length) { hideAC(); return; }

  const ac = document.getElementById('acList');
  ac.innerHTML = matches.map(x => `
    <div class="ac-item" onclick="pickSuggestion('${escapeAttr(x.name)}')">
      <img class="ac-icon" src="${x.icon}" onerror="this.style.display='none'" alt="">
      <span class="ac-name">${x.name}</span>
      <span class="ac-type">${x.type}</span>
    </div>
  `).join('');
  ac.style.display = 'block';
}

function pickSuggestion(name) {
  document.getElementById('searchInput').value = name;
  hideAC();
}

function hideAC() {
  document.getElementById('acList').style.display = 'none';
}

function onSearchKey(e) {
  if (e.key === 'Enter')  submitGuess();
  if (e.key === 'Escape') hideAC();
}

// Ferme l'AC en cliquant hors du champ
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap')) hideAC();
});

// ── Échappe les quotes pour les attributs HTML ────────
function escapeAttr(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ══════════════════════════════════════════════════════
//  MODAL RÉPONSE
// ══════════════════════════════════════════════════════

function openModal() {
  document.getElementById('modalImg').src              = target.icon;
  document.getElementById('modalName').textContent     = target.name;
  document.getElementById('modalMeta').innerHTML       =
    `<span>${target.type}</span> · <span>${target.element}</span> · <span>${target.slot}</span><br>
     Munitions : <span>${target.ammo}</span> &nbsp;·&nbsp; Extension : <span>${target.expansion}</span>`;

  document.getElementById('modalOverlay').classList.add('open');
  // Empêche le scroll du fond
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  // Ferme si clic sur l'overlay ou le bouton ✕
  if (!e || e.target === document.getElementById('modalOverlay') ||
      e.currentTarget?.classList.contains('modal-close')) {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Ferme avec Echap
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ══════════════════════════════════════════════════════
//  NAVIGATION ENTRE MODES
// ══════════════════════════════════════════════════════

function switchMode(mode) {
  // Tous les boutons
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));

  // Active le bouton cliqué
  const btn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
  if (btn) btn.classList.add('active');

  // Pour l'instant seul "exo" est disponible
  if (mode !== 'exo') {
    showComingSoon(mode);
    // Remet l'actif sur "exo"
    document.querySelector('.mode-btn[data-mode="exo"]').classList.add('active');
    if (btn) btn.classList.remove('active');
  }
}

function showComingSoon(mode) {
  const labels = {
    citation: 'Citation',
    art:      'Art rogné',
    icon:     'Icône',
  };
  // Petit toast discret plutôt qu'un alert()
  showToast(`Mode ${labels[mode] || mode} — bientôt disponible 🔜`);
}

// ══════════════════════════════════════════════════════
//  TOAST NOTIFICATION
// ══════════════════════════════════════════════════════

function showToast(msg) {
  // Supprime un toast existant
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #0d1628; border: 1px solid rgba(201,168,76,.4);
    color: #c9a84c; padding: 10px 20px; border-radius: 4px;
    font-family: 'Exo 2', sans-serif; font-size: .82rem;
    letter-spacing: .05em; z-index: 300;
    animation: toastIn .3s ease, toastOut .3s ease 2s forwards;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(0,0,0,.4);
  `;

  // Ajoute les keyframes si pas déjà là
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      @keyframes toastIn  { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
      @keyframes toastOut { from { opacity:1; } to { opacity:0; } }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}
