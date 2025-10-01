// Main interactions: theme toggle, mobile nav, scroll reveal, smooth anchors, contact form
(function () {
  const root = document.documentElement;
  // JS active: remove no-js for CSS fallbacks
  root.classList.remove('no-js');
  const themeToggle = document.getElementById('themeToggle');
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-menu');
  const year = document.getElementById('year');

  // Persisted theme
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
    themeToggle && themeToggle.setAttribute('aria-pressed', 'true');
  }

  // Theme toggle
  themeToggle?.addEventListener('click', () => {
    const isDark = root.classList.toggle('dark');
    themeToggle.setAttribute('aria-pressed', String(isDark));
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // Mobile nav
  const closeMenu = () => {
    menu?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  };
  navToggle?.addEventListener('click', () => {
    const open = menu?.classList.toggle('open');
    const isOpen = !!open;
    navToggle.setAttribute('aria-expanded', String(isOpen));
    const label = navToggle.querySelector('.label');
    if (label) label.textContent = isOpen ? 'إغلاق' : 'القائمة';
    navToggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
    navToggle.setAttribute('title', isOpen ? 'إغلاق' : 'القائمة');
  });
  // Close menu on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('open')) {
      menu.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
      const label = navToggle?.querySelector('.label');
      if (label) label.textContent = 'القائمة';
      navToggle?.setAttribute('aria-label', 'فتح القائمة');
      navToggle?.setAttribute('title', 'القائمة');
      navToggle?.focus();
    }
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Smooth scroll for anchors with 3D entry effect
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        // Add directional 3D hint class based on relative position
        const currentY = window.scrollY;
        const targetY = target.getBoundingClientRect().top + window.scrollY;
        const dirClass = (targetY > currentY) ? 'enter-from-bottom' : 'enter-from-top';
        target.classList.add(dirClass);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', id);
        // Remove focus so :focus styles don't linger after scroll
        a.blur();
        // Clean up the 3D hint after transition
        const cleanup = () => target.classList.remove('enter-from-top', 'enter-from-bottom');
        setTimeout(cleanup, 700);
        // maintain active state updates after smooth scroll
        setTimeout(bottomObserveUpdate, 50);
        setTimeout(bottomObserveUpdate, 350);
      }
    });
  });

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Footer year
  if (year) year.textContent = new Date().getFullYear().toString();

  // Contact form is now just CTA links (no submission handling)

  // Hero image loader: try multiple extensions if the primary is missing
  const heroImg = document.querySelector('.hero-photo img');
  if (heroImg) {
    const base = 'assets/images/profile';
    const candidates = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
    let tried = 0;
    const applyFallback = () => {
      const tpl = document.getElementById('hero-fallback');
      if (tpl) {
        const host = heroImg.closest('.hero-art');
        if (host) host.innerHTML = '';
        host?.appendChild(tpl.content.cloneNode(true));
      }
    };
    heroImg.addEventListener('error', () => {
      tried++;
      const next = candidates[tried];
      if (next) {
        heroImg.src = base + next;
      } else {
        applyFallback();
      }
    }, { once: false });
    // Kick off with .jpg then others on demand
    heroImg.src = base + candidates[0];
  }

  // Active nav tab with IntersectionObserver for reliability
  const initNavObserver = () => {
    const header = document.querySelector('.site-header');
    const navLinks = Array.from(document.querySelectorAll('.menu a[href^="#"]'));
    const secs = Array.from(document.querySelectorAll('main section[id]'));
    const linkMap = new Map(navLinks.map(a => [a.getAttribute('href'), a]));

    // Clear previous active
    navLinks.forEach(a => a.classList.remove('active'));

    const headerH = header ? header.offsetHeight : 0;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = `#${en.target.id}`;
          navLinks.forEach(a => a.classList.remove('active'));
          const link = linkMap.get(id);
          if (link) link.classList.add('active');
        }
      });
    }, { threshold: 0.25, rootMargin: `-${headerH + 8}px 0px 0px 0px` });

    secs.forEach(s => io.observe(s));
    return io;
  };

  let navIO = initNavObserver();
  // Set initial active tab: hash if present, otherwise #hero
  (function setInitialActive() {
    const all = document.querySelectorAll('.menu a');
    all.forEach(a => a.classList.remove('active'));
    const hash = location.hash && document.querySelector(location.hash) ? location.hash : '#hero';
    document.querySelector(`.menu a[href="${hash}"]`)?.classList.add('active');
  })();
  window.addEventListener('resize', () => {
    // Re-init on resize to account for header height changes
    if (navIO && typeof navIO.disconnect === 'function') navIO.disconnect();
    navIO = initNavObserver();
  });

  // Helper: toggle back-to-top visibility and update active nav at bottom
  const bottomObserveUpdate = () => {
    const doc = document.documentElement;
    const scrollable = Math.max(0, doc.scrollHeight - window.innerHeight);
    const nearBottom = scrollable > 240 && window.scrollY >= scrollable - 8;
    if (nearBottom) {
      document.querySelectorAll('.menu a.active').forEach(a => a.classList.remove('active'));
      document.querySelector('.menu a[href="#contact"]')?.classList.add('active');
    }
  };
  // Run once on DOM ready and again after full load to set initial state
  bottomObserveUpdate();
  window.addEventListener('load', bottomObserveUpdate);
  window.addEventListener('scroll', bottomObserveUpdate, { passive: true });
  // Re-evaluate on resize (viewport changes affect thresholds)
  window.addEventListener('resize', bottomObserveUpdate);

  // 3D directional hint when scrolling between sections
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const down = y > lastY;
    lastY = y;
    // Find the closest section to the top
    const header = document.querySelector('.site-header');
    const anchorY = (header ? header.offsetHeight : 0) + 8;
    const secs = Array.from(document.querySelectorAll('main section[id]'));
    let current = secs[0];
    for (const s of secs) {
      if (s.getBoundingClientRect().top <= anchorY) current = s; else break;
    }
    if (!current) return;
    const cls = down ? 'enter-from-bottom' : 'enter-from-top';
    current.classList.add(cls);
    setTimeout(() => current.classList.remove('enter-from-top', 'enter-from-bottom'), 500);
  }, { passive: true });


  // (old simple highlighter removed in favor of updateActive)
})();
