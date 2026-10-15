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
      if (overlay?.classList.contains('is-open')) closeProject();
      else if (mobileMenu?.classList.contains('is-open')) setMenu(false);
    }
  });
})();
