/**
 * #game-portfolio-section — self-contained bonus mini-game.
 * Canvas-based: move an avatar into a zone to pop up a summary modal.
 * Isolated in its own IIFE/file so it can be dropped or removed without
 * touching the rest of the site's script.
 */
(() => {
  'use strict';

  const root = document.getElementById('game-portfolio-section');
  const canvas = document.getElementById('gameCanvas');
  if (!root || !canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const toggleBtn = document.getElementById('gameToggleBtn');
  const hintEl = document.getElementById('gameHint');
  const dpad = document.getElementById('gameDpad');

  const modal = document.getElementById('gameModal');
  const modalPanel = modal?.querySelector('.game-modal-panel');
  const modalClose = document.getElementById('gameModalClose');
  const modalKicker = document.getElementById('gameModalKicker');
  const modalTitle = document.getElementById('gameModalTitle');
  const modalBody = document.getElementById('gameModalBody');
  const modalLink = document.getElementById('gameModalLink');

  const BASE_W = 720;
  const BASE_H = 420;

  /* ---------------- Zone content (real portfolio facts only) ---------------- */
  const ZONES = [
    {
      id: 'about', label: 'About', href: '#about',
      x: 36, y: 36, w: 168, h: 112, color: '#5b7fff',
      kicker: 'Zone · About',
      title: 'About Asaf CT',
      html: `<p>Computer Science &amp; Engineering graduate (B.Tech, 2021–2025) focused on
        AI/ML, data-driven solutions, and creative technology.</p>
        <p>Currently an <b>AI Data Engineer</b> at CuraNova Global Med, working on AI/ML
        initiatives and Hospital Information System development.</p>`,
    },
    {
      id: 'skills', label: 'Skills', href: '#skills',
      x: 516, y: 36, w: 168, h: 112, color: '#9b6bff',
      kicker: 'Zone · Skills',
      title: 'Skills Snapshot',
      html: `<ul>
        <li><b>Programming:</b> Python, SQL, HTML</li>
        <li><b>AI / ML:</b> TensorFlow, PyTorch, Scikit-learn</li>
        <li><b>Computer Vision:</b> OpenCV, Grounding DINO</li>
        <li><b>Tools:</b> Git, Docker, Streamlit</li>
        <li><b>Creative Tech:</b> Figma, Midjourney, Prompt Engineering</li>
      </ul>`,
    },
    {
      id: 'projects', label: 'Projects', href: '#projects',
      x: 276, y: 256, w: 168, h: 112, color: '#5b7fff',
      kicker: 'Zone · Projects',
      title: 'Projects',
      html: `<ul>
        <li><b>Order Evidence System</b> — zero-shot CCTV order verification (Featured)</li>
        <li><b>Hospital Information System</b> — healthcare workflow development</li>
        <li><b>Fake Product Review Detection</b> — NLP + TF-IDF classifier</li>
        <li><b>License Plate Detection</b> — OpenCV + OCR on Raspberry Pi</li>
      </ul>`,
    },
  ];

  /* ---------------- State ---------------- */
  const player = { x: BASE_W / 2 - 14, y: BASE_H / 2 - 14, w: 28, h: 28, speed: 3 };
  const heldKeys = new Set();
  const heldDirs = new Set();
  let controlsEnabled = false;
  let modalOpen = false;
  let insideZoneId = null;
  let sectionVisible = true;
  let rafRunning = false;

  /* ---------------- Canvas setup (crisp, responsive via CSS) ---------------- */
  function setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = BASE_W * dpr;
    canvas.height = BASE_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setupCanvas();
  window.addEventListener('resize', setupCanvas);

  /* ---------------- Controls toggle ---------------- */
  function setControlsEnabled(on) {
    controlsEnabled = on;
    toggleBtn.setAttribute('aria-pressed', String(on));
    toggleBtn.textContent = on ? 'Pause Game Controls' : 'Enable Game Controls';
    hintEl.textContent = on
      ? 'Arrow keys / WASD to move — click Pause to scroll normally again.'
      : 'Click "Enable Controls" to play — arrow keys / WASD to move.';
    if (!on) heldKeys.clear();
  }
  toggleBtn?.addEventListener('click', () => setControlsEnabled(!controlsEnabled));

  const MOVE_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']);

  window.addEventListener('keydown', (e) => {
    if (!controlsEnabled) return;
    if (!MOVE_KEYS.has(e.key)) return;
    e.preventDefault(); // only swallow scroll while the player opted in
    heldKeys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', (e) => {
    if (!MOVE_KEYS.has(e.key)) return;
    heldKeys.delete(e.key.toLowerCase());
  });
  // Stop drifting if the tab/window loses focus mid-press.
  window.addEventListener('blur', () => heldKeys.clear());

  /* ---------------- Touch / on-screen D-pad ---------------- */
  dpad?.querySelectorAll('.dpad-btn').forEach((btn) => {
    const dir = btn.getAttribute('data-dir');
    const press = (e) => { e.preventDefault(); heldDirs.add(dir); btn.classList.add('is-pressed'); };
    const release = () => { heldDirs.delete(dir); btn.classList.remove('is-pressed'); };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
  });

  /* ---------------- Modal ---------------- */
  function openModal(zone) {
    modalOpen = true;
    insideZoneId = zone.id;
    modalKicker.textContent = zone.kicker;
    modalTitle.textContent = zone.title;
    modalBody.innerHTML = zone.html;
    modalLink.href = zone.href;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modalClose.focus();
  }
  function closeModal() {
    modalOpen = false;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    toggleBtn?.focus();
  }
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  modalLink?.addEventListener('click', () => closeModal());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  /* ---------------- Pause rendering when scrolled away ---------------- */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      sectionVisible = entry.isIntersecting;
      if (sectionVisible && !rafRunning) { rafRunning = true; requestAnimationFrame(loop); }
    });
  }, { threshold: 0 });
  sectionObserver.observe(root);

  /* ---------------- Game loop ---------------- */
  function update() {
    if (modalOpen) return;

    let vx = 0, vy = 0;
    if (controlsEnabled) {
      if (heldKeys.has('arrowup') || heldKeys.has('w')) vy -= 1;
      if (heldKeys.has('arrowdown') || heldKeys.has('s')) vy += 1;
      if (heldKeys.has('arrowleft') || heldKeys.has('a')) vx -= 1;
      if (heldKeys.has('arrowright') || heldKeys.has('d')) vx += 1;
    }
    if (heldDirs.has('up')) vy -= 1;
    if (heldDirs.has('down')) vy += 1;
    if (heldDirs.has('left')) vx -= 1;
    if (heldDirs.has('right')) vx += 1;

    if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }
    player.x = Math.max(0, Math.min(BASE_W - player.w, player.x + vx * player.speed));
    player.y = Math.max(0, Math.min(BASE_H - player.h, player.y + vy * player.speed));

    const pcx = player.x + player.w / 2;
    const pcy = player.y + player.h / 2;
    const hit = ZONES.find((z) => pcx > z.x && pcx < z.x + z.w && pcy > z.y && pcy < z.y + z.h);

    if (hit) {
      if (insideZoneId !== hit.id) openModal(hit);
    } else {
      insideZoneId = null;
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, BASE_W, BASE_H);

    // background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BASE_W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, BASE_H); ctx.stroke(); }
    for (let y = 0; y <= BASE_H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BASE_W, y); ctx.stroke(); }

    // zones
    ZONES.forEach((z) => {
      const active = insideZoneId === z.id;
      ctx.fillStyle = active ? `${z.color}33` : `${z.color}14`;
      roundRect(z.x, z.y, z.w, z.h, 16);
      ctx.fill();
      ctx.strokeStyle = active ? z.color : `${z.color}88`;
      ctx.lineWidth = active ? 2.5 : 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f1f1f4';
      ctx.font = '600 15px Sora, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(z.label, z.x + z.w / 2, z.y + z.h / 2);
    });

    // player
    const grad = ctx.createLinearGradient(player.x, player.y, player.x + player.w, player.y + player.h);
    grad.addColorStop(0, '#5b7fff');
    grad.addColorStop(1, '#9b6bff');
    ctx.fillStyle = grad;
    roundRect(player.x, player.y, player.w, player.h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // idle hint overlay
    if (!controlsEnabled && !modalOpen) {
      ctx.fillStyle = 'rgba(5,5,8,0.4)';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
      ctx.fillStyle = '#e8e9ee';
      ctx.font = '600 16px Sora, Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Click "Enable Game Controls" to play', BASE_W / 2, BASE_H / 2);
    }
  }

  function loop() {
    if (!sectionVisible) { rafRunning = false; return; }
    update();
    draw();
    requestAnimationFrame(loop);
  }

  rafRunning = true;
  requestAnimationFrame(loop);
})();
