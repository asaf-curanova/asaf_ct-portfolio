(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse), (hover: none)').matches;

  /* ================= Preloader ================= */
  (function preloader() {
    const el = document.getElementById('preloader');
    const countEl = document.getElementById('preloaderCount');
    if (!el) return;
    if (reduceMotion) { el.classList.add('is-done'); return; }
    let n = 0;
    const timer = setInterval(() => {
      n += Math.ceil(Math.random() * 18) + 6;
      if (n >= 100) {
        n = 100;
        clearInterval(timer);
        setTimeout(() => el.classList.add('is-done'), 180);
      }
      countEl.textContent = String(n).padStart(2, '0');
    }, 70);
  })();

  /* ================= Custom cursor ================= */
  if (!isCoarse && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    function tick() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('is-active');
        label.textContent = el.getAttribute('data-cursor');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-active');
        label.textContent = '';
      });
    });
  }

  /* ================= Live Kerala time status ================= */
  function updateStatus() {
    const timeStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
    const text = `Kerala, IN · ${timeStr}`;
    const navEl = document.getElementById('navStatusTime');
    const mobEl = document.getElementById('mobileStatusTime');
    if (navEl) navEl.textContent = text;
    if (mobEl) mobEl.textContent = text;
  }
  updateStatus();
  setInterval(updateStatus, 30000);

  /* ================= Footer year ================= */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ================= Scroll progress + nav state ================= */
  const progressBar = document.getElementById('progressBar');
  const nav = document.getElementById('nav');
  const scrollTopBtn = document.getElementById('scrollTop');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrollTop > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', scrollTop > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ================= Mobile menu ================= */
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  function closeMobileMenu() {
    burger?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('is-open');
  }
  burger?.addEventListener('click', () => {
    const isOpen = mobileMenu?.classList.toggle('is-open');
    burger.classList.toggle('is-open', !!isOpen);
    burger.setAttribute('aria-expanded', String(!!isOpen));
  });
  document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', closeMobileMenu));

  /* ================= Active nav + smooth scroll ================= */
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = navLinks.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((s) => navObserver.observe(s));

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ================= Scroll reveal ================= */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ================= Generic generative canvas (hero + AI lab) ================= */
  function initGenerativeCanvas(canvasId, sectionEl, opts) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !sectionEl || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, particles = [], running = true;
    const mouse = { x: null, y: null };
    const count = opts.count || 50;
    const linkDist = opts.linkDist || 110;
    const colorHex = opts.color || '#7c5cff';

    function hexToRgb(hex) {
      const n = parseInt(hex.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const rgb = hexToRgb(colorHex);

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = sectionEl.clientWidth;
      h = sectionEl.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      }));
    }
    resize();
    window.addEventListener('resize', resize);
    sectionEl.addEventListener('mousemove', (e) => {
      const r = sectionEl.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    sectionEl.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    const io = new IntersectionObserver((entries) => entries.forEach((en) => { running = en.isIntersecting; }), { threshold: 0 });
    io.observe(sectionEl);

    function step() {
      requestAnimationFrame(step);
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (mouse.x !== null) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < 150) { p.x += dx * 0.004; p.y += dy * 0.004; }
        }
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(1 - dist / linkDist) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.7)`;
        ctx.fill();
      });
    }
    requestAnimationFrame(step);
  }
  const isSmallScreen = window.matchMedia('(max-width: 760px)').matches;
  initGenerativeCanvas('heroCanvas', document.querySelector('.hero'), { count: isSmallScreen ? 24 : 60, linkDist: isSmallScreen ? 90 : 120, color: '#7c5cff' });
  initGenerativeCanvas('aiCanvas', document.getElementById('ai-lab'), { count: isSmallScreen ? 16 : 40, linkDist: isSmallScreen ? 80 : 100, color: '#7c5cff' });

  /* ================= Hero scroll-linked transform ================= */
  (function heroScrollLink() {
    const heroEl = document.querySelector('.hero');
    const content = document.getElementById('heroContent');
    if (!heroEl || !content || reduceMotion) return;
    let ticking = false;
    function update() {
      ticking = false;
      const h = heroEl.offsetHeight;
      const p = Math.min(Math.max(window.scrollY / h, 0), 1);
      content.style.transform = `translateY(${p * -60}px) scale(${1 - p * 0.06})`;
      content.style.opacity = String(1 - p * 1.1);
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ================= Magnetic buttons ================= */
  if (!reduceMotion && !isCoarse) {
    document.querySelectorAll('.magnetic-btn, .btn').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${dx * 10}px, ${dy * 10}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ================= AI strip scroll progress ================= */
  (function aiStripProgress() {
    const wrap = document.querySelector('.ai-strip-wrap');
    const bar = document.getElementById('aiStripProgress');
    if (!wrap || !bar) return;
    function update() {
      const max = wrap.scrollWidth - wrap.clientWidth;
      const pct = max > 0 ? (wrap.scrollLeft / max) * 100 : 0;
      bar.style.width = pct + '%';
    }
    wrap.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ================= Experience timeline illumination ================= */
  (function timelineLight() {
    const track = document.getElementById('timeline');
    const progress = document.getElementById('timelineProgress');
    const items = document.querySelectorAll('.timeline-item');
    if (!track || !items.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-lit'); });
    }, { threshold: 0.4 });
    items.forEach((i) => io.observe(i));

    function updateProgress() {
      const r = track.getBoundingClientRect();
      const viewportMid = window.innerHeight * 0.6;
      const total = r.height;
      const passed = Math.min(Math.max(viewportMid - r.top, 0), total);
      if (progress) progress.style.height = (total > 0 ? (passed / total) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  })();

  /* ================= Skills ecosystem ================= */
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
    SKILLS.forEach((group) => {
      const row = document.createElement('div');
      row.className = 'skill-category';
      const label = document.createElement('span');
      label.className = 'skill-category-label';
      label.textContent = group.cat;
      row.appendChild(label);
      group.items.forEach((item) => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.type = 'button';
        chip.textContent = item.name;
        const show = () => { skillDetailTitle.textContent = item.name; skillDetailText.textContent = item.detail; };
        chip.addEventListener('click', show);
        chip.addEventListener('mouseenter', show);
        row.appendChild(chip);
      });
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
  let currentProjectIdx = 0;

  function renderProject(idx) {
    const p = PROJECTS[idx];
    currentProjectIdx = idx;
    poIndex.textContent = `Project ${p.index}`;
    poTitle.textContent = p.title;
    poStack.textContent = p.stack;
    poMetrics.innerHTML = p.metrics.map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
    poCols.innerHTML = p.cols.map(([h, t]) => `<div><h4>${h}</h4><p>${t}</p></div>`).join('');
    poHighlights.innerHTML = p.highlights.map((h) => `<li>${h}</li>`).join('');
    poFullStack.textContent = p.fullStack;
    overlay.scrollTop = 0;
  }
  function openProject(id) {
    const idx = PROJECTS.findIndex((p) => p.id === id);
    if (idx === -1) return;
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
  }
  document.querySelectorAll('.work-item').forEach((item) => {
    item.addEventListener('click', () => openProject(item.getAttribute('data-project')));
  });
  poClose?.addEventListener('click', closeProject);
  poNext?.addEventListener('click', () => renderProject((currentProjectIdx + 1) % PROJECTS.length));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) closeProject();
  });

  /* ================= Toast ================= */
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  /* ================= Easter eggs ================= */
  // 1) Konami code
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiProgress = 0;
  document.addEventListener('keydown', (e) => {
    konamiProgress = e.key === KONAMI[konamiProgress] ? konamiProgress + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (konamiProgress === KONAMI.length) {
      konamiProgress = 0;
      document.documentElement.style.transition = 'filter 0.6s ease';
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      showToast('You found it. Let’s build something together → asafctofficial@gmail.com');
      setTimeout(() => { document.documentElement.style.filter = ''; }, 1400);
    }
  });

  // 2) Click the logo 5 times
  let logoClicks = 0, logoClickTimer;
  document.getElementById('navLogo')?.addEventListener('click', (e) => {
    logoClicks++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClicks = 0; }, 1500);
    if (logoClicks >= 5) {
      logoClicks = 0;
      e.preventDefault();
      const mark = e.currentTarget;
      mark.style.transition = 'transform 0.6s ease';
      mark.style.transform = 'rotate(360deg)';
      showToast('Hi. You clicked that way more than necessary — I respect it.');
      setTimeout(() => { mark.style.transform = ''; }, 650);
    }
  });

  // 3) Console message
  console.log('%cLooking at the code?', 'font-size:16px;font-weight:bold;color:#7c5cff;');
  console.log('%cLet\'s talk — asafctofficial@gmail.com', 'font-size:13px;color:#9a9aa4;');
})();
