(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  /* ================= Loader ================= */
  (function loader() {
    const el = document.getElementById('loader');
    const countEl = document.getElementById('loaderCount');
    const lineEl = document.getElementById('loaderLine');
    const finish = () => {
      el?.classList.add('is-done');
      document.body.classList.add('is-loaded');
      document.dispatchEvent(new Event('portfolio:loaded'));
    };
    if (!el || reduceMotion) { finish(); return; }
    let n = 0;
    const timer = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 16) + 8);
      if (countEl) countEl.textContent = String(n).padStart(3, '0');
      if (lineEl) lineEl.style.width = n + '%';
      if (n >= 100) { clearInterval(timer); setTimeout(finish, 220); }
    }, 70);
  })();

  /* ================= Kerala time + footer year ================= */
  const timeFmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true });
  function updateTime() {
    const t = timeFmt.format(new Date());
    document.querySelectorAll('[data-time]').forEach((el) => { el.textContent = t; });
  }
  updateTime();
  setInterval(updateTime, 30000);
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ================= Fit name to one line ================= */
  (function fitName() {
    const h = document.getElementById('wordmark');
    const inner = h?.querySelector('.rise > span');
    if (!h || !inner) return;
    function fit() {
      const avail = h.parentElement.clientWidth
        - parseFloat(getComputedStyle(h.parentElement).paddingLeft) * 2;
      if (avail <= 0) return;
      h.style.fontSize = '100px';
      inner.style.display = 'inline-block';
      const w = inner.getBoundingClientRect().width;
      inner.style.display = '';
      if (w > 0) h.style.fontSize = Math.floor(100 * (avail * 0.985) / w) + 'px';
    }
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts?.ready) document.fonts.ready.then(fit);
  })();

  /* ================= Nav state, to-top ================= */
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');
  function onScroll() {
    const y = window.scrollY;
    nav?.classList.toggle('is-scrolled', y > 40);
    toTop?.classList.toggle('is-visible', y > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior }));

  /* ================= Mobile menu ================= */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    mobileMenu?.classList.toggle('is-open', open);
    burger?.classList.toggle('is-open', open);
    burger?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  }
  burger?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ================= Active nav + smooth anchors ================= */
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = [...new Set(navLinks.map((l) => l.getAttribute('href')))]
    .map((h) => document.querySelector(h)).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((s) => navObserver.observe(s));

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    });
  });

  /* ================= Scroll reveal ================= */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ================= Skills ================= */
  const SKILLS = [
    { cat: 'AI / ML', items: [
      { name: 'TensorFlow', detail: 'Used in: AI/ML Intern work at Aesthetix — deep-learning models reaching up to 92% accuracy.' },
      { name: 'PyTorch', detail: 'Used in: Order Evidence System — backing framework for Grounding DINO zero-shot detection.' },
      { name: 'Scikit-learn', detail: 'Used in: Fake Product Review Detection — the Logistic Regression core of the classifier.' },
      { name: 'Hugging Face Transformers', detail: 'Used in: Order Evidence System — running Grounding DINO for zero-shot object detection.' },
      { name: 'Grounding DINO', detail: 'Used in: Order Evidence System — zero-shot item detection with no labeled training data.' },
    ]},
    { cat: 'Creative AI', items: [
      { name: 'AI Image Generation', detail: 'Used in: Peblo — creative and brand-focused image generation.' },
      { name: 'AI Video Generation', detail: 'Used in: Peblo — AI video content with a focus on visual storytelling.' },
      { name: 'Prompt Engineering', detail: 'Used in: Peblo — keeping characters and visual styles consistent across deliverables.' },
      { name: 'Midjourney', detail: 'One of the generative tools used for AI image creation at Peblo.' },
      { name: 'VEO 3', detail: 'AI video generation tool applied to production-ready visual content.' },
    ]},
    { cat: 'Development', items: [
      { name: 'Python', detail: 'Core language across every ML model, data pipeline, and automation script built in each role.' },
      { name: 'SQL', detail: 'Used for data extraction, transformation, and experiment workflows.' },
      { name: 'HTML / Web', detail: 'Built the Streamlit web UI for the CCTV order-verification tool, plus this portfolio.' },
      { name: 'Git / GitHub', detail: 'Version control across all ML work, including Git worktrees for isolated experiments.' },
      { name: 'Docker / CI/CD', detail: 'Used in: Aesthetix ML work — standardized deployment, improving efficiency by 20%.' },
    ]},
    { cat: 'Data', items: [
      { name: 'Pandas', detail: 'Used in: Aesthetix Edu-Tech — pipelines that cut data loading time by 25%.' },
      { name: 'NumPy', detail: 'Used in: Edunet Data Science internship — analyzed 10,000+ records.' },
      { name: 'Power BI', detail: 'Used in: Edunet Power BI internship — dashboards cutting ad-hoc reports by 35%.' },
      { name: 'Azure ML / Data Factory', detail: 'Used in: Edunet Cloud internships — ingestion, training schedules, and KPI pipelines.' },
      { name: 'OpenCV', detail: 'Used in: License Plate Detection — image enhancement and plate localization.' },
    ]},
    { cat: 'Design', items: [
      { name: 'Figma', detail: 'Used for design and layout work supporting creative deliverables.' },
      { name: 'Leonardo AI', detail: 'Generative image tool used for creative and brand-focused visual assets.' },
      { name: 'Visual Storytelling', detail: 'Used in: Peblo — sequencing AI visuals into coherent brand narratives.' },
      { name: 'Image Enhancement', detail: 'Used in: License Plate Detection and Peblo creative work.' },
    ]},
    { cat: 'Tools', items: [
      { name: 'Streamlit', detail: 'Used in: Fake Product Review Detection and Order Evidence System web apps.' },
      { name: 'Tesseract OCR', detail: 'Used in: License Plate Detection — text extraction from plate images.' },
      { name: 'ffmpeg', detail: 'Used in: Order Evidence System — extracting frames from CCTV footage.' },
      { name: 'Raspberry Pi', detail: 'Used in: License Plate Detection — lightweight, portable deployment target.' },
      { name: 'ChatGPT / Claude / Codex', detail: 'Used daily for ideation, reasoning-heavy tasks, and AI-assisted coding.' },
    ]},
  ];
  const skillsGrid = document.getElementById('skillsGrid');
  const skillDetailTitle = document.getElementById('skillDetailTitle');
  const skillDetailText = document.getElementById('skillDetailText');
  if (skillsGrid) {
    let activeChip = null;
    SKILLS.forEach((group) => {
      const row = document.createElement('div');
      row.className = 'skill-category';
      const label = document.createElement('span');
      label.className = 'skill-category-label';
      label.textContent = group.cat;
      const chips = document.createElement('div');
      chips.className = 'skill-chips';
      group.items.forEach((item) => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.type = 'button';
        chip.textContent = item.name;
        const show = () => {
          activeChip?.classList.remove('is-active');
          activeChip = chip;
          chip.classList.add('is-active');
          skillDetailTitle.textContent = item.name;
          skillDetailText.textContent = item.detail;
        };
        chip.addEventListener('click', show);
        chip.addEventListener('mouseenter', show);
        chips.appendChild(chip);
      });
      row.append(label, chips);
      skillsGrid.appendChild(row);
    });
  }

  /* ================= Project overlay ================= */
  const PROJECTS = [
    {
      id: 'order-evidence', index: '01', title: 'Order Evidence System — CCTV-Based Order Verification',
      stack: 'Computer Vision · Zero-Shot Detection · Streamlit',
      metrics: [['90%+', 'fewer false positives'], ['Zero-shot', 'no training data needed'], ['Human-in-the-loop', 'ambiguous cases reviewed']],
      cols: [
        ['Problem', 'Customer-service agents had to manually scrub through CCTV footage to resolve delivery-order complaints like "my order was missing an item" for a quick-service restaurant client — slow, inconsistent, and hard to scale.'],
        ['Approach', 'Took over a partially-built prototype and productionized it: a zero-shot object-detection pipeline (Grounding DINO) identifies packed items from overhead CCTV with no labeled training data, then a timestamp/sequence-first matching algorithm — never by content alone — links detected packing events to the order, surfacing an explicit ambiguous state for human review instead of guessing.'],
        ['Result', 'Root-caused a false-positive problem to overly loose region-of-interest cropping and cut false positives by over 90% while preserving true detections, then shipped a plain-language checklist UI so non-technical customer-service agents can review evidence and log verdicts.'],
      ],
      highlights: [
        'Benchmarked Grounding DINO against YOLO — found YOLO missed a real, photo-verified item on the production camera zone and carried an AGPL-3.0 licence that would force open-sourcing the product; documented the decision to reject it.',
        'Fixed a duplicate-detection bug (two touching items counted as one), traced to an overly aggressive bounding-box merge threshold, and re-verified against the full regression suite.',
        'Built automatic checks that flag when a camera’s saved calibration doesn’t match its actual footage — catching two real mislabeled video files before they could produce misleading results.',
      ],
      fullStack: 'Stack: Python, Streamlit, OpenCV, ffmpeg, Grounding DINO (via Hugging Face Transformers), PyTorch, Git worktrees for isolated experimentation.',
    },
    {
      id: 'his', index: '02', title: 'Hospital Information System (HIS) Development',
      stack: 'Healthcare Software · System Development · AI/ML Environment',
      metrics: [],
      cols: [
        ['Problem', 'Hospitals run on paper-adjacent, fragmented workflows that slow down staff and introduce errors in day-to-day operations.'],
        ['Contribution', 'Contributed to system requirements, workflow implementation, testing, and development as part of a healthcare technology team building the HIS.'],
        ['Result', 'Ongoing contribution to hospital workflow digitization within a live healthcare technology environment. (Details limited by client confidentiality.)'],
      ],
      highlights: [],
      fullStack: '',
    },
    {
      id: 'fake-review', index: '03', title: 'Fake Product Review Detection',
      stack: 'Machine Learning · NLP · Streamlit',
      metrics: [['10K+', 'reviews classified'], ['TF-IDF', 'feature extraction'], ['Log. Regression', 'core model']],
      cols: [
        ['Problem', 'E-commerce platforms are flooded with fake reviews that distort purchasing decisions and erode trust.'],
        ['Solution', 'Built an NLP pipeline with text preprocessing and TF-IDF, feeding a tuned Logistic Regression model with confidence scoring, validated via cross-validation and holdout tests.'],
        ['Result', 'Classified 10,000+ e-commerce reviews as fake or real, delivered through an interactive Streamlit app with explainable indicators, dashboards, and bulk CSV detection.'],
      ],
      highlights: [],
      fullStack: '',
    },
    {
      id: 'license-plate', index: '04', title: 'License Plate Detection System',
      stack: 'Python · OpenCV · Tesseract OCR · Raspberry Pi',
      metrics: [['92%', 'accuracy'], ['1,000+', 'images tested'], ['<2 sec', 'avg. inference']],
      cols: [
        ['Problem', 'Low-cost, portable license-plate recognition needed to run reliably outside a data center — on constrained hardware.'],
        ['Solution', 'Engineered an image enhancement, plate-localization, and OCR pipeline (OpenCV + Tesseract), deployed lightweight on a Raspberry Pi.'],
        ['Result', 'Reached 92% accuracy across 1,000+ images with under 2 seconds average inference time on portable hardware.'],
      ],
      highlights: [],
      fullStack: '',
    },
  ];

  const overlay = document.getElementById('projectOverlay');
  const poClose = document.getElementById('poClose');
  const poIndex = document.getElementById('poIndex');
  const poTitle = document.getElementById('poTitle');
  const poStack = document.getElementById('poStack');
  const poMetrics = document.getElementById('poMetrics');
  const poCols = document.getElementById('poCols');
  const poHighlights = document.getElementById('poHighlights');
  const poFullStack = document.getElementById('poFullStack');
  const poNext = document.getElementById('poNext');
  let currentIdx = 0;
  let opener = null;

  function renderProject(idx) {
    const p = PROJECTS[idx];
    currentIdx = idx;
    poIndex.textContent = `Project ${p.index}`;
    poTitle.textContent = p.title;
    poStack.textContent = p.stack;
    poMetrics.innerHTML = p.metrics.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
    poCols.innerHTML = p.cols.map(([h, t]) => `<div><h4>${h}</h4><p>${t}</p></div>`).join('');
    poHighlights.innerHTML = p.highlights.map((h) => `<li>${h}</li>`).join('');
    poFullStack.textContent = p.fullStack;
    overlay.scrollTop = 0;
  }
  function openProject(id, from) {
    const idx = PROJECTS.findIndex((p) => p.id === id);
    if (idx === -1 || !overlay) return;
    opener = from || null;
    renderProject(idx);
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    poClose.focus();
  }
  function closeProject() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    opener?.focus();
  }
  document.querySelectorAll('.wc-open[data-project]').forEach((btn) => {
    btn.addEventListener('click', () => openProject(btn.getAttribute('data-project'), btn));
  });
  poClose?.addEventListener('click', closeProject);
  poNext?.addEventListener('click', () => renderProject((currentIdx + 1) % PROJECTS.length));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (overlay?.classList.contains('is-open')) { closeProject(); e.stopImmediatePropagation(); }
      else if (mobileMenu?.classList.contains('is-open')) setMenu(false);
    }
  });

  /* ================= 3D studio walkthrough =================
     An opt-in spatial view. Every room is built from the page's own
     content (cloned from the DOM), so nothing is duplicated or invented;
     the normal page stays the accessible default. */
  (function studio() {
    const openBtn = document.getElementById('studioOpen');
    if (!openBtn) return;
    const DEPTH = 1500;
    const txt = (el, sel) => el?.querySelector(sel)?.textContent.trim() || '';
    const mk = (tag, cls, text) => {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text) e.textContent = text;
      return e;
    };

    const ROOMS = [
      { id: 'work', ra: '#7c5cff', art: "<rect x=\"150\" y=\"110\" width=\"320\" height=\"230\"/><path d=\"M150 150v-40h40M470 150v-40h-40M150 300v40h40M470 300v40h-40\" stroke-width=\"3\"/><rect x=\"520\" y=\"190\" width=\"230\" height=\"160\"/><rect x=\"330\" y=\"260\" width=\"150\" height=\"110\" stroke-dasharray=\"6 6\"/><path d=\"M310 225h40M330 205v40\"/><path d=\"M60 410h780\" stroke-dasharray=\"2 10\"/><path d=\"M60 60h780M60 450h780\" opacity=\".4\"/>", label: 'Work', title: 'Selected work', build(body) {
        const grid = mk('div', 'room-grid');
        document.querySelectorAll('.work-card').forEach((card) => {
          const src = card.querySelector('.wc-open[data-project]');
          if (!src) return;
          const p = mk('button', 'room-panel');
          p.type = 'button';
          p.dataset.project = src.dataset.project;
          const art = card.querySelector('.wc-visual');
          if (art) {
            const thumb = mk('div', 'room-thumb');
            thumb.setAttribute('aria-hidden', 'true');
            thumb.appendChild(art.cloneNode(true).firstElementChild || art.cloneNode(true));
            p.appendChild(thumb);
          }
          p.append(mk('span', 'hud', txt(card, '.wc-top span')), mk('h3', '', src.textContent.trim()), mk('p', '', txt(card, '.wc-desc')));
          p.addEventListener('click', () => openProject(p.dataset.project, p));
          grid.appendChild(p);
        });
        body.appendChild(grid);
      } },
      { id: 'about', ra: '#4cc9f0', art: "<circle cx=\"450\" cy=\"250\" r=\"60\"/><circle cx=\"450\" cy=\"250\" r=\"130\"/><circle cx=\"450\" cy=\"250\" r=\"210\" stroke-dasharray=\"4 8\"/><circle cx=\"450\" cy=\"250\" r=\"290\" opacity=\".5\"/><circle cx=\"580\" cy=\"250\" r=\"9\"/><circle cx=\"318\" cy=\"168\" r=\"7\"/><circle cx=\"560\" cy=\"75\" r=\"6\"/><circle cx=\"262\" cy=\"410\" r=\"8\"/><circle cx=\"700\" cy=\"380\" r=\"6\"/><path d=\"M450 250L580 250M450 250L318 168M450 250L560 75M450 250L262 410M450 250L700 380M580 250L700 380M318 168L560 75\" opacity=\".7\"/>", label: 'About', title: 'About', build(body) {
        body.appendChild(mk('p', 'room-statement', txt(document, '.about-statement')));
        document.querySelectorAll('.about-copy p').forEach((p) => body.appendChild(mk('p', 'room-panel', p.textContent.trim())));
      } },
      { id: 'capabilities', ra: '#3fd9a8', art: "<path d=\"M450 90L720 190L450 290L180 190Z\"/><path d=\"M450 150L720 250L450 350L180 250Z\" opacity=\".75\"/><path d=\"M450 210L720 310L450 410L180 310Z\" opacity=\".5\"/><path d=\"M180 190v120M720 190v120M450 290v120\" opacity=\".5\"/><path d=\"M450 40v50\" stroke-dasharray=\"3 6\"/><circle cx=\"450\" cy=\"190\" r=\"6\"/>", label: 'Capabilities', title: 'What I build', build(body) {
        const grid = mk('div', 'room-grid');
        document.querySelectorAll('.cap-row').forEach((row) => {
          const p = mk('div', 'room-panel');
          p.append(mk('span', 'hud', txt(row, '.cap-num')), mk('h3', '', txt(row, 'h3')), mk('p', '', row.querySelector('p')?.textContent.trim()));
          grid.appendChild(p);
        });
        body.appendChild(grid);
      } },
      { id: 'experience', ra: '#f4b942', art: "<path d=\"M80 400H260V330H420V260H580V190H740V120H850\" stroke-width=\"2\"/><circle cx=\"80\" cy=\"400\" r=\"9\"/><circle cx=\"260\" cy=\"330\" r=\"9\"/><circle cx=\"420\" cy=\"260\" r=\"9\"/><circle cx=\"580\" cy=\"190\" r=\"9\"/><circle cx=\"740\" cy=\"120\" r=\"12\"/><path d=\"M80 400v60M260 330v130M420 260v200M580 190v270M740 120v340\" stroke-dasharray=\"3 8\" opacity=\".5\"/><path d=\"M60 460h800\" opacity=\".6\"/>", label: 'Experience', title: 'Career', build(body) {
        const grid = mk('div', 'room-grid');
        document.querySelectorAll('.exp-row').forEach((row) => {
          const p = mk('div', 'room-panel');
          p.append(mk('span', 'hud', txt(row, '.exp-date')), mk('h3', '', (() => { const h = row.querySelector('h3').cloneNode(true); h.querySelectorAll('br').forEach((b) => b.replaceWith(' ')); return h.textContent.replace(/\s+/g, ' ').trim(); })()), mk('p', '', txt(row, '.exp-org')), mk('p', '', txt(row, '.exp-desc')));
          grid.appendChild(p);
        });
        body.appendChild(grid);
      } },
      { id: 'contact', ra: '#ff6b8b', art: "<circle cx=\"200\" cy=\"250\" r=\"12\"/><path d=\"M200 190a60 60 0 0 1 0 120M200 150a100 100 0 0 1 0 200M200 110a140 140 0 0 1 0 280M200 70a180 180 0 0 1 0 360M200 30a220 220 0 0 1 0 440\" opacity=\".8\"/><rect x=\"560\" y=\"170\" width=\"260\" height=\"160\"/><path d=\"M560 170L690 260L820 170\" /><path d=\"M200 250H540\" stroke-dasharray=\"4 8\"/>", label: 'Contact', title: 'Contact', build(body) {
        const mail = document.querySelector('.contact-mail');
        if (mail) {
          const a = mk('a', 'room-mail', mail.textContent.replace('↗', '').trim());
          a.href = mail.getAttribute('href');
          body.appendChild(a);
        }
        const links = mk('div', 'room-links');
        document.querySelectorAll('.contact-actions a').forEach((src) => links.appendChild(src.cloneNode(true)));
        body.appendChild(links);
      } },
    ];

    const root = mk('div', 'studio');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', '3D walkthrough of the portfolio');
    root.setAttribute('aria-hidden', 'true');
    const scene = mk('div', 'studio-scene');
    const world = mk('div', 'studio-world');
    const floor = mk('div', 'studio-floor');
    floor.style.height = (ROOMS.length * DEPTH + 3000) + 'px';
    world.appendChild(floor);
    for (let i = 0; i <= ROOMS.length * 3; i++) {
      const ring = mk('div', 'studio-ring' + (i % 3 === 0 ? ' is-key' : ''));
      ring.style.transform = `translateZ(${600 - i * (DEPTH / 3)}px)`;
      world.appendChild(ring);
    }
    const roomEls = ROOMS.map((r, i) => {
      const el = mk('section', 'room');
      el.setAttribute('aria-label', r.label);
      el.style.setProperty('--ra', r.ra);
      const art = mk('div', 'room-art');
      art.setAttribute('aria-hidden', 'true');
      art.style.setProperty('--ra', r.ra);
      art.style.transform = `translate(-50%, -50%) translateZ(${-i * DEPTH - 650}px)`;
      art.innerHTML = `<svg viewBox="0 0 900 500" fill="none" stroke="currentColor" stroke-width="1.2" preserveAspectRatio="xMidYMid meet">${r.art}</svg>`;
      world.appendChild(art);
      const big = mk('span', 'room-bignum', String(i + 1).padStart(2, '0'));
      big.setAttribute('aria-hidden', 'true');
      el.appendChild(big);
      el.style.transform = `translate(-50%, -50%) translateZ(${-i * DEPTH}px)`;
      const head = mk('div', 'room-head');
      head.append(mk('h2', 'room-title', r.title), mk('span', 'hud', `${String(i + 1).padStart(2, '0')} / ${String(ROOMS.length).padStart(2, '0')}`));
      const body = mk('div', 'room-body');
      r.build(body);
      el.append(head, body);
      world.appendChild(el);
      el._art = art;
      return el;
    });
    scene.appendChild(world);

    const top = mk('div', 'studio-top');
    const hint = mk('span', 'hud studio-hint', 'Arrow keys · scroll · swipe to move');
    const closeBtn = mk('button', 'btn btn-line');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Exit studio ×';
    top.append(hint, closeBtn);

    const hud = mk('div', 'studio-hud');
    const prev = mk('button', 'studio-step', '←');
    const next = mk('button', 'studio-step', '→');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Previous room');
    next.setAttribute('aria-label', 'Next room');
    const dots = mk('div', 'studio-dots');
    const dotEls = ROOMS.map((r, i) => {
      const d = mk('button', 'studio-dot', r.label);
      d.type = 'button';
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
      return d;
    });
    hud.append(prev, dots, next);
    root.append(scene, top, hud);
    document.body.appendChild(root);

    let idx = 0, lastMove = 0, lastFocus = null, pushed = false;
    function go(i) {
      idx = Math.max(0, Math.min(ROOMS.length - 1, i));
      world.style.transform = `translateZ(${idx * DEPTH}px)`;
      roomEls.forEach((el, n) => {
        const d = Math.abs(n - idx);
        el.style.opacity = d === 0 ? 1 : 0;
        el._art.style.opacity = d === 0 ? 1 : 0;
        el.toggleAttribute('inert', d !== 0);
      });
      dotEls.forEach((d, n) => d.setAttribute('aria-current', String(n === idx)));
      prev.disabled = idx === 0;
      next.disabled = idx === ROOMS.length - 1;
      lastMove = Date.now();
    }
    function open(auto) {
      lastFocus = document.activeElement;
      go(0);
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      closeBtn.focus();
      if (auto !== true) { history.pushState({ studio: true }, '', '#studio'); pushed = true; }
    }
    function close(fromPop) {
      if (!root.classList.contains('is-open')) return;
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      if (pushed && !fromPop) history.back();
      pushed = false;
      lastFocus?.focus();
    }
    openBtn.addEventListener('click', () => open());
    closeBtn.addEventListener('click', () => close(false));
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    window.addEventListener('popstate', () => close(true));
    // Contact links inside the studio should leave the studio before jumping.
    root.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a) close(false);
    });

    // Default entry: the studio opens on first load. Skipped for reduced motion
    // and for deep links to a specific section, which get the normal page.
    const deepLink = location.hash && location.hash !== '#studio' && location.hash !== '#top';
    if (!reduceMotion && !deepLink) {
      const auto = () => open(true);
      if (document.body.classList.contains('is-loaded')) auto();
      else document.addEventListener('portfolio:loaded', auto, { once: true });
    }

    document.addEventListener('keydown', (e) => {
      if (!root.classList.contains('is-open') || overlay?.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(false);
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(idx + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(idx - 1); }
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(ROOMS.length - 1);
    });

    function scrollableAt(target, dir) {
      const body = target.closest?.('.room-body');
      if (!body || body.scrollHeight <= body.clientHeight + 1) return false;
      return dir > 0 ? body.scrollTop + body.clientHeight < body.scrollHeight - 1 : body.scrollTop > 0;
    }
    root.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 25 || Date.now() - lastMove < 900) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      if (scrollableAt(e.target, dir)) { e.target.closest('.room-body').scrollTop += e.deltaY; return; }
      go(idx + dir);
    }, { passive: false });

    let touchY = null, touchX = null;
    root.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; touchX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      const dx = touchX - e.changedTouches[0].clientX;
      const dir = dy > 0 ? 1 : -1;
      const horizontal = Math.abs(dx) > Math.abs(dy);
      const delta = horizontal ? dx : dy;
      if (Math.abs(delta) > 70 && Date.now() - lastMove > 700 && !(!horizontal && scrollableAt(e.target, dir))) {
        go(idx + (delta > 0 ? 1 : -1));
      }
      touchY = touchX = null;
    }, { passive: true });
  })();
})();
