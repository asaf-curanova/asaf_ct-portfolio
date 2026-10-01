(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Footer year ---------------- */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

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
  document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', closeMobileMenu));

  /* ---------------- Active nav link on scroll ---------------- */
  const navLinks = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = navLinks
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach((s) => navObserver.observe(s));

  /* ---------------- Scroll reveal ---------------- */
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

  /* ---------------- Smooth-scroll for in-page anchors ---------------- */
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

  /* ---------------- Experience timeline accordion ---------------- */
  document.querySelectorAll('.timeline-item').forEach((item) => {
    item.querySelector('.timeline-head').addEventListener('click', () => {
      const isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!isOpen));
    });
  });
  const currentItem = document.querySelector('.timeline-item.is-current');
  if (currentItem) currentItem.setAttribute('data-open', 'true');

  /* ---------------- Project cards accordion ---------------- */
  document.querySelectorAll('.project-card').forEach((card) => {
    const toggleBtn = card.querySelector('.project-toggle');
    toggleBtn?.addEventListener('click', () => {
      const isOpen = card.getAttribute('data-open') === 'true';
      card.setAttribute('data-open', String(!isOpen));
      toggleBtn.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------------- Skills ecosystem ---------------- */
  const SKILLS = [
    { cat: 'Programming', items: [
      { name: 'Python', detail: 'Core language across every ML model, data pipeline, and automation script built in each role.' },
      { name: 'SQL', detail: 'Used for data extraction, transformation, and standardizing experiment workflows alongside Git/GitHub.' },
      { name: 'C', detail: 'Foundational systems programming from the B.Tech curriculum.' },
      { name: 'HTML', detail: 'Markup for building and structuring interactive front-end interfaces and dashboards.' },
      { name: 'Web Development', detail: 'Built the Streamlit web UI for the CCTV order-verification tool, plus this portfolio site itself.' },
    ]},
    { cat: 'Data & Analytics', items: [
      { name: 'Pandas', detail: 'Built data pipelines that cut data loading times by 25% and accelerated training cycles.' },
      { name: 'NumPy', detail: 'Numerical backbone for analyzing and visualizing 10,000+ records during cloud/data internships.' },
      { name: 'Power BI', detail: 'Built executive dashboards with RLS and mobile layouts, cutting ad-hoc reporting requests by 35%.' },
      { name: 'Excel', detail: 'Used for early-stage data analysis and reporting.' },
      { name: 'Azure Data Factory', detail: 'Built automated KPI refresh pipelines, shortening reporting cycles by 40%.' },
    ]},
    { cat: 'AI / Machine Learning', items: [
      { name: 'Scikit-learn', detail: 'Built regression, classification, and clustering models — including the Logistic Regression core of the review-detection system.' },
      { name: 'TensorFlow', detail: 'Engineered deep-learning models reaching up to 92% accuracy at Aesthetix Edu-Tech.' },
      { name: 'PyTorch', detail: 'Backing framework for Grounding DINO in the CCTV order-verification system, and used alongside TensorFlow for deep-learning experimentation.' },
      { name: 'Hugging Face Transformers', detail: 'Used to run Grounding DINO for zero-shot object detection in the CCTV order-verification system.' },
      { name: 'Azure ML', detail: 'Worked with pipelines covering ingestion, training schedules, and monitoring.' },
      { name: 'Prompt Engineering', detail: 'Refined prompts to keep characters, scenes, and visual styles consistent across deliverables.' },
    ]},
    { cat: 'Computer Vision', items: [
      { name: 'OpenCV', detail: 'Powered image enhancement and plate localization in the License Plate Detection System.' },
      { name: 'Tesseract OCR', detail: 'Integrated for text extraction in the portable license-plate recognition pipeline.' },
      { name: 'TF-IDF', detail: 'Feature extraction technique behind the Fake Product Review Detection classifier.' },
      { name: 'Object Detection', detail: 'Applied for plate localization ahead of OCR, and for zero-shot item detection in the CCTV order-verification system.' },
      { name: 'Grounding DINO', detail: 'Zero-shot object detector chosen for the CCTV order-verification system — no labeled training data needed, items prompted in natural language.' },
      { name: 'Image Enhancement', detail: 'Used to improve input quality before detection and OCR stages.' },
      { name: 'ffmpeg', detail: 'Used to extract and process frames from CCTV footage in the order-verification pipeline.' },
    ]},
    { cat: 'Tools & Platforms', items: [
      { name: 'Git', detail: 'Version control across all ML and data engineering work — including Git worktrees for isolated model-evaluation experiments.' },
      { name: 'GitHub', detail: 'Collaboration and workflow standardization with the Aesthetix ML team.' },
      { name: 'Docker', detail: 'Used for model packaging as part of MLOps practice.' },
      { name: 'GitHub Actions', detail: 'CI/CD automation supporting experiment and deployment workflows.' },
      { name: 'CI/CD', detail: 'Applied to standardize and speed up deployment cycles, improving efficiency by 20%.' },
      { name: 'Streamlit', detail: 'Built interactive real-time apps for the Fake Product Review Detection and CCTV order-verification projects.' },
      { name: 'Raspberry Pi', detail: 'Deployment target for the lightweight, portable License Plate Detection System.' },
    ]},
    { cat: 'Design / Creative Technology', items: [
      { name: 'AI Image Generation', detail: 'Directed AI-generated images for creative and brand-focused projects at Peblo.' },
      { name: 'AI Video Generation', detail: 'Produced AI video content with a focus on visual storytelling and consistency.' },
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
        chip.addEventListener('click', () => {
          allChips.forEach((c) => c.classList.remove('is-active'));
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

  /* ---------------- Hero visual: confined ambient particles ---------------- */
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas && !reduceMotion && window.matchMedia('(min-width: 901px)').matches) {
    const ctx = heroCanvas.getContext('2d');
    const panel = heroCanvas.parentElement;
    let w = 0, h = 0, dpr = 1, particles = [], running = true;

    function hexToRgb(hex) {
      const n = parseInt(hex.replace('#', ''), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const styles = getComputedStyle(document.documentElement);
    const rgbBlue = hexToRgb(styles.getPropertyValue('--accent-1').trim() || '#5b7fff');
    const rgbPurple = hexToRgb(styles.getPropertyValue('--accent-2').trim() || '#9b6bff');

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = panel.clientWidth;
      h = panel.clientHeight;
      heroCanvas.width = w * dpr;
      heroCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(26, Math.floor((w * h) / 9000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        purple: Math.random() < 0.35,
      }));
    }

    function step() {
      requestAnimationFrame(step);
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const linkDist = 90;

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < linkDist) {
            ctx.strokeStyle = `rgba(${rgbBlue[0]},${rgbBlue[1]},${rgbBlue[2]},${(1 - dist / linkDist) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        const c = p.purple ? rgbPurple : rgbBlue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.purple ? 2 : 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.75)`;
        ctx.fill();
      });
    }

    resize();
    window.addEventListener('resize', resize);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { running = entry.isIntersecting; });
    }, { threshold: 0 });
    io.observe(panel);
    requestAnimationFrame(step);
  }
})();
