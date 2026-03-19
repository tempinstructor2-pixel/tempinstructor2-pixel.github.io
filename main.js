(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Navbar shadow on scroll
  const navbar = $('#navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Hamburger toggle
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    // Close menu when a link is clicked (mobile)
    $$('.nav-link', navLinks).forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // Active nav link highlight
  const setActiveNav = (hrefToMatch) => {
    const normalized = (hrefToMatch || '').replace(/^\.\//, '');
    $$('.nav-link').forEach((l) => {
      const href = (l.getAttribute('href') || '').replace(/^\.\//, '');
      l.classList.toggle('active', href === normalized);
    });
  };

  const filename = (window.location.pathname || '').split('/').pop() || 'index.html';
  const isIndex = filename === '' || filename === 'index.html';

  // If we're on index and have section anchors, follow scroll position.
  if (isIndex) {
    const sections = $$('main section[id]').filter((s) => s.id);
    const navMap = new Map();
    $$('.nav-link').forEach((l) => {
      const href = l.getAttribute('href') || '';
      if (href.startsWith('#')) navMap.set(href.slice(1), l);
      if (href.startsWith('index.html#')) navMap.set(href.split('#')[1], l);
    });

    if (sections.length && navMap.size) {
      let current = '';
      const secObs = new IntersectionObserver(
        (entries) => {
          // Pick the most visible intersecting section
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
          if (!visible) return;
          const id = visible.target.id;
          if (id && id !== current && navMap.has(id)) {
            current = id;
            const nav = navMap.get(id);
            setActiveNav(nav.getAttribute('href'));
          }
        },
        { rootMargin: '-30% 0px -60% 0px', threshold: [0.12, 0.2, 0.35, 0.5] }
      );
      sections.forEach((s) => secObs.observe(s));

      // Initial state based on hash (if any)
      const hashId = (window.location.hash || '').replace('#', '');
      if (hashId && navMap.has(hashId)) setActiveNav(navMap.get(hashId).getAttribute('href'));
      else if (navMap.has('home')) setActiveNav(navMap.get('home').getAttribute('href'));
    } else {
      setActiveNav('index.html');
    }
  } else {
    // Non-index pages: just mark "Home" (index) as active by default.
    const homeLink = $$('.nav-link').find((l) => (l.getAttribute('href') || '').includes('index.html'));
    if (homeLink) setActiveNav(homeLink.getAttribute('href'));
  }

  // Fade-up scroll observer
  const fadeEls = $$('.fade-up');
  if (fadeEls.length) {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    );
    fadeEls.forEach((el) => obs.observe(el));
  }

  // Particle background (only once)
  if (!$('#particle-canvas')) {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let W = 0;
    let H = 0;
    const pts = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 55; i++) {
      pts.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.45 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45,232,120,${p.a})`;
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(45,232,120,${0.13 * (1 - d / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  // Typed tagline (home)
  const typed = $('#typed-text');
  if (typed) {
    const phrases = ['Coder & Creator', 'Basketball Player', 'Yo-Yo Enthusiast', 'Secondary Student'];
    let pi = 0;
    let ci = 0;
    let deleting = false;
    const type = () => {
      const word = phrases[pi];
      if (!deleting) {
        typed.textContent = word.slice(0, ++ci);
        if (ci === word.length) {
          deleting = true;
          window.setTimeout(type, 1800);
          return;
        }
      } else {
        typed.textContent = word.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
        }
      }
      window.setTimeout(type, deleting ? 55 : 105);
    };
    type();
  }

  // Stats counter (home)
  const statNums = $$('.stat-num');
  if (statNums.length) {
    statNums.forEach((el) => {
      const target = Number(el.dataset.target || 0);
      let cur = 0;
      const step = () => {
        if (cur < target) {
          el.textContent = String(++cur);
          window.setTimeout(step, 240);
        }
      };
      window.setTimeout(step, 900);
    });
  }

  // Education bars fill
  const barFills = $$('.bar-fill');
  if (barFills.length) {
    const fillObs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.style.width = `${e.target.dataset.pct}%`;
        }),
      { threshold: 0.25 }
    );
    barFills.forEach((el) => fillObs.observe(el));
  }

  // Contact form toast (fake submit)
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const toast = $('#toast');
      if (!toast) return;
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 3500);
      contactForm.reset();
    });
  }
})();

