(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Theme toggle ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'asaf-portfolio-theme';

  function applyStoredTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored === 'light' || stored === 'dark') {
      root.setAttribute('data-theme', stored);
    }
  }
  applyStoredTheme();

  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }
  themeToggle?.addEventListener('click', toggleTheme);

  /* ---------------- Cursor glow ---------------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && !reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });
  }

  /* ---------------- Hero parallax background ---------------- */
  const heroBg = document.querySelector('.hero-bg');
  const heroSection = document.querySelector('.hero');
  if (heroBg && heroSection && !reduceMotion) {
    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5) * 40;
      const py = ((e.clientY - r.top) / r.height - 0.5) * 40;
      heroBg.style.setProperty('--px', px.toFixed(1) + 'px');
      heroBg.style.setProperty('--py', py.toFixed(1) + 'px');
    }, { passive: true });
    heroSection.addEventListener('mouseleave', () => {
      heroBg.style.setProperty('--px', '0px');
      heroBg.style.setProperty('--py', '0px');
    });
  }

  /* ---------------- Hero role typewriter ---------------- */
  const heroRoleText = document.getElementById('heroRoleText');
  const ROLE_WORDS = ['AI Data Engineer', 'AI/ML Engineer', 'Generative AI Creator'];
  if (heroRoleText && !reduceMotion) {
    let wordIndex = 0;
    let charIndex = ROLE_WORDS[0].length;
    let deleting = false;

    function typeTick() {
      const word = ROLE_WORDS[wordIndex];
      if (!deleting) {
        charIndex++;
        if (charIndex > word.length) {
          charIndex = word.length;
          deleting = true;
          setTimeout(typeTick, 1600);
          return;
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          charIndex = 0;
          deleting = false;
          wordIndex = (wordIndex + 1) % ROLE_WORDS.length;
          setTimeout(typeTick, 300);
          return;
        }
      }
      heroRoleText.textContent = word.slice(0, charIndex);
      setTimeout(typeTick, deleting ? 35 : 65);
    }
    setTimeout(typeTick, 2000);
  }

  /* ---------------- Scroll progress + nav state ---------------- */
  const progressBar = document.getElementById('progressBar');
  const nav = document.getElementById('nav');

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
    if (nav) nav.classList.toggle('is-scrolled', scrollTop > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- Mobile menu ---------------- */
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
  document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', closeMobileMenu));

  /* ---------------- Active nav link on scroll ---------------- */
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = navLinks
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => navObserver.observe(s));

  /* ---------------- Decode/scramble text effect ---------------- */
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function scrambleText(el) {
    const original = el.textContent;
    const len = original.length;
    const totalFrames = 16;
    let frame = 0;
    function tick() {
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = original[i];
        if (ch === ' ') { out += ' '; continue; }
        const revealAt = (i / len) * totalFrames * 0.7;
        out += frame >= revealAt ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      el.textContent = out;
      frame++;
      if (frame <= totalFrames) requestAnimationFrame(tick);
      else el.textContent = original;
    }
    tick();
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (entry.target.classList.contains('section-kicker')) scrambleText(entry.target);
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---------------- Identity flow ---------------- */
  const identityNodes = document.querySelectorAll('.identity-node');
  const identityDetail = document.getElementById('identityDetail');
  identityNodes.forEach(node => {
    node.addEventListener('click', () => {
      identityNodes.forEach(n => n.classList.remove('is-active'));
      node.classList.add('is-active');
      if (identityDetail) identityDetail.textContent = node.getAttribute('data-detail');
    });
  });

  /* ---------------- Experience timeline accordion ---------------- */
  document.querySelectorAll('.timeline-item').forEach(item => {
    const head = item.querySelector('.timeline-head');
    head.addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!isOpen));
    });
  });
  // Open the current role by default
  const currentItem = document.querySelector('.timeline-item.is-current');
  if (currentItem) currentItem.setAttribute('data-open', 'true');

  /* ---------------- Project cards accordion ---------------- */
  document.querySelectorAll('.project-card').forEach(card => {
    const toggleBtn = card.querySelector('.project-toggle');
    const top = card.querySelector('.project-top');
    function toggle() {
      const isOpen = card.getAttribute('data-open') === 'true';
      card.setAttribute('data-open', String(!isOpen));
    }
    toggleBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    top?.addEventListener('click', toggle);
  });

  /* ---------------- Skills ecosystem ---------------- */
  const SKILLS = [
    { cat: 'Programming', items: [
      { name: 'Python', detail: 'Core language across every ML model, data pipeline, and automation script built in each role.' },
      { name: 'SQL', detail: 'Used for data extraction, transformation, and standardizing experiment workflows alongside Git/GitHub.' },
      { name: 'C', detail: 'Foundational systems programming from the B.Tech curriculum.' },
      { name: 'HTML', detail: 'Markup for building and structuring interactive front-end interfaces and dashboards.' },
    ]},
    { cat: 'Machine Learning', items: [
      { name: 'Scikit-learn', detail: 'Built regression, classification, and clustering models — including the Logistic Regression core of the review-detection system.' },
      { name: 'TensorFlow', detail: 'Engineered deep-learning models reaching up to 92% accuracy at Aesthetix Edu-Tech.' },
      { name: 'PyTorch', detail: 'Used alongside TensorFlow for deep-learning model development and experimentation.' },
      { name: 'Pandas', detail: 'Built data pipelines that cut data loading times by 25% and accelerated training cycles.' },
      { name: 'NumPy', detail: 'Numerical backbone for analyzing and visualizing 10,000+ records during cloud/data internships.' },
    ]},
    { cat: 'Computer Vision / NLP', items: [
      { name: 'OpenCV', detail: 'Powered image enhancement and plate localization in the License Plate Detection System.' },
      { name: 'Tesseract OCR', detail: 'Integrated for text extraction in the portable license-plate recognition pipeline.' },
      { name: 'TF-IDF', detail: 'Feature extraction technique behind the Fake Product Review Detection classifier.' },
      { name: 'Object Detection', detail: 'Applied for plate localization ahead of OCR in the license-plate pipeline.' },
      { name: 'Image Enhancement', detail: 'Used to improve input quality before detection and OCR stages.' },
    ]},
    { cat: 'Generative AI', items: [
      { name: 'AI Image Generation', detail: 'Directed AI-generated images for creative and brand-focused projects at Peblo.' },
      { name: 'AI Video Generation', detail: 'Produced AI video content with a focus on visual storytelling and consistency.' },
      { name: 'Prompt Engineering', detail: 'Refined prompts to keep characters, scenes, and visual styles consistent across deliverables.' },
    ]},
    { cat: 'MLOps / Development', items: [
      { name: 'Git', detail: 'Version control across all ML and data engineering work.' },
      { name: 'GitHub', detail: 'Collaboration and workflow standardization with the Aesthetix ML team.' },
      { name: 'Docker', detail: 'Used for model packaging as part of MLOps practice.' },
      { name: 'GitHub Actions', detail: 'CI/CD automation supporting experiment and deployment workflows.' },
      { name: 'CI/CD', detail: 'Applied to standardize and speed up deployment cycles, improving efficiency by 20%.' },
      { name: 'Streamlit', detail: 'Built the interactive real-time app for the Fake Product Review Detection project.' },
    ]},
    { cat: 'Analytics / Cloud', items: [
      { name: 'Power BI', detail: 'Built executive dashboards with RLS and mobile layouts, cutting ad-hoc reporting requests by 35%.' },
      { name: 'Excel', detail: 'Used for early-stage data analysis and reporting.' },
      { name: 'Azure ML', detail: 'Worked with pipelines covering ingestion, training schedules, and monitoring.' },
      { name: 'Azure Data Factory', detail: 'Built automated KPI refresh pipelines, shortening reporting cycles by 40%.' },
      { name: 'Raspberry Pi', detail: 'Deployment target for the lightweight, portable License Plate Detection System.' },
    ]},
    { cat: 'Design / AI Tools', items: [
      { name: 'Figma', detail: 'Used for design and layout work supporting creative deliverables.' },
      { name: 'Midjourney', detail: 'One of the generative tools used for AI image creation at Peblo.' },
      { name: 'Leonardo AI', detail: 'Generative image tool used for creative and brand-focused visual assets.' },
      { name: 'Gemini', detail: 'Used in the generative AI toolkit for creative and prompt-engineering work.' },
      { name: 'VEO 3', detail: 'AI video generation tool applied to production-ready visual content.' },
      { name: 'ChatGPT', detail: 'Used daily for ideation, prompt drafting, and accelerating research across projects.' },
      { name: 'Claude', detail: 'Used for reasoning-heavy tasks, code assistance, and structured writing.' },
      { name: 'Codex', detail: 'Used as an AI coding assistant to speed up implementation and debugging.' },
    ]},
  ];

  const skillsGrid = document.getElementById('skillsGrid');
  const skillDetailTitle = document.getElementById('skillDetailTitle');
  const skillDetailText = document.getElementById('skillDetailText');
  const allChips = [];

  if (skillsGrid) {
    SKILLS.forEach(group => {
      const row = document.createElement('div');
      row.className = 'skill-category';
      const label = document.createElement('span');
      label.className = 'skill-category-label';
      label.textContent = group.cat;
      row.appendChild(label);

      group.items.forEach(item => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.type = 'button';
        chip.textContent = item.name;
        chip.addEventListener('click', () => {
          allChips.forEach(c => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          if (skillDetailTitle) skillDetailTitle.textContent = item.name;
          if (skillDetailText) skillDetailText.textContent = item.detail;
        });
        allChips.push(chip);
        row.appendChild(chip);
      });

      skillsGrid.appendChild(row);
    });
  }

  /* ---------------- Animated counters ---------------- */
  const metricNums = document.querySelectorAll('.metric-num');
  function animateCount(el) {
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  metricNums.forEach(el => counterObserver.observe(el));

  /* ---------------- Smooth-scroll for in-page anchors (mobile menu + nav) ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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

  /* ---------------- Live status chip (Kerala local time) ---------------- */
  function updateStatus() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusTime');
    if (!dot || !text) return;
    const now = new Date();
    const hourParts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).formatToParts(now);
    const hour = parseInt(hourParts.find(p => p.type === 'hour').value, 10);
    const timeStr = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(now);
    const isActive = hour >= 9 && hour < 22;
    dot.classList.toggle('is-away', !isActive);
    text.textContent = `Kerala, IN · ${timeStr}`;
  }
  updateStatus();
  setInterval(updateStatus, 30000);

  /* ---------------- Magnetic buttons ---------------- */
  if (!reduceMotion) {
    document.querySelectorAll('.btn, .contact-chip, .cmdk-trigger').forEach(el => {
      const strength = 12;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${dx * strength}px, ${dy * strength - 2}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- Pointer tilt on showcase cards ---------------- */
  if (!reduceMotion) {
    document.querySelectorAll('.project-card, .cert-card, .focus-card, .fact-card').forEach(el => {
      const max = 4;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-3px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- AI Lab gallery flip cards ---------------- */
  document.querySelectorAll('.gallery-tile').forEach(tile => {
    function toggleFlip() {
      const flipped = tile.classList.toggle('is-flipped');
      tile.setAttribute('aria-pressed', String(flipped));
    }
    tile.addEventListener('click', toggleFlip);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFlip(); }
    });
  });

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2400);
  }


  /* ---------------- Command palette ---------------- */
  const cmdkOverlay = document.getElementById('cmdkOverlay');
  const cmdkInput = document.getElementById('cmdkInput');
  const cmdkList = document.getElementById('cmdkList');
  const cmdkTrigger = document.getElementById('cmdkTrigger');

  const iconSection = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
  const iconTheme = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const iconMail = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>';
  const iconDownload = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>';
  const iconExternal = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7M21 3l-9 9M5 5h6v0H5v14h14v-6"/></svg>';

  const COMMANDS = [
    { label: 'Go to About', hint: 'Section', icon: iconSection, run: () => scrollToId('about') },
    { label: 'Go to Experience', hint: 'Section', icon: iconSection, run: () => scrollToId('experience') },
    { label: 'Go to Projects', hint: 'Section', icon: iconSection, run: () => scrollToId('projects') },
    { label: 'Go to AI Lab', hint: 'Section', icon: iconSection, run: () => scrollToId('ai-lab') },
    { label: 'Go to Skills', hint: 'Section', icon: iconSection, run: () => scrollToId('skills') },
    { label: 'Go to Education', hint: 'Section', icon: iconSection, run: () => scrollToId('education') },
    { label: 'Go to Contact', hint: 'Section', icon: iconSection, run: () => scrollToId('contact') },
    { label: 'Toggle light / dark theme', hint: 'Action', icon: iconTheme, run: () => toggleTheme() },
    { label: 'Copy email address', hint: 'asafctofficial@gmail.com', icon: iconMail, run: () => copyEmail() },
    { label: 'Download CV', hint: 'PDF', icon: iconDownload, run: () => { const a = document.createElement('a'); a.href = 'assets/Mohammed_Asaf_CT_CV.pdf'; a.download = ''; a.click(); showToast('Downloading CV…'); } },
    { label: 'Open LinkedIn', hint: '↗', icon: iconExternal, run: () => window.open('https://in.linkedin.com/in/mohammed-asaf-ct-40b7132b4', '_blank', 'noopener') },
    { label: 'Open GitHub', hint: '↗', icon: iconExternal, run: () => window.open('https://github.com/asafct2003', '_blank', 'noopener') },
  ];

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function copyEmail() {
    try {
      navigator.clipboard.writeText('asafctofficial@gmail.com');
      showToast('Email copied to clipboard');
    } catch (e) {
      showToast('Could not copy — email is asafctofficial@gmail.com');
    }
  }

  let filtered = COMMANDS.slice();
  let selectedIndex = 0;

  function renderCmdkList() {
    cmdkList.innerHTML = '';
    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'cmdk-empty';
      empty.textContent = 'No matching command.';
      cmdkList.appendChild(empty);
      return;
    }
    filtered.forEach((cmd, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cmdk-item' + (i === selectedIndex ? ' is-selected' : '');
      btn.innerHTML = `<span class="cmdk-icon">${cmd.icon}</span><span class="cmdk-label">${cmd.label}</span><span class="cmdk-hint">${cmd.hint}</span>`;
      btn.addEventListener('click', () => runCommand(cmd));
      btn.addEventListener('mouseenter', () => { selectedIndex = i; renderCmdkList(); });
      li.appendChild(btn);
      cmdkList.appendChild(li);
    });
  }

  function runCommand(cmd) {
    cmd.run();
    closeCmdk();
  }

  function filterCommands(query) {
    const q = query.trim().toLowerCase();
    filtered = q === '' ? COMMANDS.slice() : COMMANDS.filter(c => c.label.toLowerCase().includes(q));
    selectedIndex = 0;
    renderCmdkList();
  }

  function openCmdk() {
    cmdkOverlay.classList.add('is-open');
    cmdkInput.value = '';
    filterCommands('');
    setTimeout(() => cmdkInput.focus(), 50);
  }

  function closeCmdk() {
    cmdkOverlay.classList.remove('is-open');
  }

  cmdkTrigger?.addEventListener('click', openCmdk);
  cmdkOverlay?.addEventListener('click', (e) => { if (e.target === cmdkOverlay) closeCmdk(); });
  cmdkInput?.addEventListener('input', () => filterCommands(cmdkInput.value));

  document.addEventListener('keydown', (e) => {
    const isOpen = cmdkOverlay?.classList.contains('is-open');
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      isOpen ? closeCmdk() : openCmdk();
      return;
    }
    if (!isOpen) return;
    if (e.key === 'Escape') { closeCmdk(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1); renderCmdkList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex - 1, 0); renderCmdkList(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[selectedIndex]) runCommand(filtered[selectedIndex]); }
  });

})();
