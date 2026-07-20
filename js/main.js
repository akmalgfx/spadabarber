/* SPADA — shared behavior: nav, reveals, video slots, buy fork dialog */

document.documentElement.classList.add('js');

/* Purchase links. Swap the amazon values for final product URLs when ready —
   this object is the single source of truth for every Buy button on the site. */
const PRODUCT_LINKS = {
  'torq-clipper': {
    name: 'TORQ Clipper',
    empire: 'https://www.empirebarber.ca/products/spada-torq-clipper',
    amazon: 'https://www.amazon.ca/s?k=spada+torq+clipper',
  },
  'torq-trimmer': {
    name: 'TORQ Trimmer',
    empire: 'https://www.empirebarber.ca/products/spada-torq-trimmer',
    amazon: 'https://www.amazon.ca/s?k=spada+torq+trimmer',
  },
  'torq-shaver': {
    name: 'TORQ Shaver',
    empire: 'https://www.empirebarber.ca/products/spada-torq-shaver',
    amazon: 'https://www.amazon.ca/s?k=spada+torq+shaver',
  },
  'wave-blade': {
    name: 'WAVE Clipper Blade',
    empire: 'https://www.empirebarber.ca/products/spada-wave-clipper-blade',
    amazon: 'https://www.amazon.ca/s?k=spada+wave+clipper+blade',
  },
  'sonar-blade': {
    name: 'SONAR Trimmer Blade',
    empire: 'https://www.empirebarber.ca/products/spada-sonar-trimmer-blade',
    amazon: 'https://www.amazon.ca/s?k=spada+sonar+trimmer+blade',
  },
  'shaver-foil': {
    name: 'TORQ Shaver Foil + Cutters',
    empire: 'https://www.empirebarber.ca/products/spada-torq-shaver-replacement-foil-head-and-cutters',
    amazon: 'https://www.amazon.ca/s?k=spada+torq+shaver+foil',
  },
  'single-edge': {
    name: 'Single Edge Blades (100 ct)',
    empire: 'https://www.empirebarber.ca/products/spada-single-edge-razor-blade',
    amazon: 'https://www.amazon.ca/s?k=spada+single+edge+razor+blades',
  },
  'double-edge': {
    name: 'Double Edge Blades (100 ct)',
    empire: 'https://www.empirebarber.ca/products/spada-double-edge-razor-blade',
    amazon: 'https://www.amazon.ca/s?k=spada+double+edge+razor+blades',
  },
  'cam-clipper': {
    name: 'Cam Follower — Clipper',
    empire: 'https://www.empirebarber.ca/products/spada-cam-follower-for-clipper',
    amazon: 'https://www.amazon.ca/s?k=spada+cam+follower+clipper',
  },
  'cam-trimmer': {
    name: 'Cam Follower — Trimmer',
    empire: 'https://www.empirebarber.ca/products/spada-cam-follower',
    amazon: 'https://www.amazon.ca/s?k=spada+cam+follower+trimmer',
  },
  collection: {
    name: 'TORQ Collection',
    empire: 'https://www.empirebarber.ca/collections/spada',
    amazon: 'https://www.amazon.ca/s?k=spada+barber',
  },
};

/* --- Nav scroll state + mobile menu --- */
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const toggle = document.querySelector('.menu-toggle');
if (toggle) {
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', closeMenu));
  // Dropdown UX: tap anywhere off the menu, or scroll, closes it.
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('menu-open') && !e.target.closest('.nav')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('scroll', () => {
    if (document.body.classList.contains('menu-open')) closeMenu();
  }, { passive: true });
}

/* --- Scroll reveals.
   IntersectionObserver is the primary trigger; a rAF-throttled scroll/resize
   fallback performs the same visibility check so content can never stay
   hidden in environments where IO misbehaves (embeds, headless renderers). --- */
let pending = new Set(document.querySelectorAll('.reveal, .reveal-stage'));

const revealVisible = () => {
  for (const el of pending) {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92 && r.bottom > 0) {
      el.classList.add('in');
      io.unobserve(el);
      pending.delete(el);
    }
  }
};

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
        pending.delete(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
);
pending.forEach((el) => io.observe(el));

let rafQueued = false;
const onRevealScroll = () => {
  if (rafQueued || !pending.size) return;
  rafQueued = true;
  requestAnimationFrame(() => {
    rafQueued = false;
    revealVisible();
  });
};
window.addEventListener('scroll', onRevealScroll, { passive: true });
window.addEventListener('resize', onRevealScroll, { passive: true });
setTimeout(revealVisible, 700);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Hero film reel. The poster image (CSS background on .hero-film) is the
   always-on base, so the hero is never blank — it paints instantly even on a
   phone. The commercials crossfade in over it only when the device can play
   them; reduced-motion and data-saver / 2G links keep the poster and skip the
   heavy download entirely. Films run back-to-back, and the next one is fetched
   only once the current has ended. --- */
const filmWrap = document.querySelector('.hero-film');
if (filmWrap) {
  const films = [...filmWrap.querySelectorAll('video')];
  const conn = navigator.connection || {};
  const slowLink = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

  let idx = 0;
  films.forEach((v) =>
    v.addEventListener('ended', () => {
      v.classList.remove('playing');
      idx = (idx + 1) % films.length;
      const next = films[idx];
      if (next.preload === 'none') {
        next.preload = 'auto';
        next.load();
      }
      next.currentTime = 0;
      next.classList.add('playing');
      next.play().catch(() => {});
    })
  );

  if (!reduceMotion && !slowLink) {
    const first = films[0];
    const play = () => {
      first.classList.add('playing');
      filmWrap.classList.add('film-live'); // fade the poster out as the film comes in
      first.play().catch(() => {});
    };
    first.preload = 'auto';
    if (first.readyState >= 2) play();
    else {
      first.addEventListener('canplay', play, { once: true });
      first.load();
    }
  }
}

/* --- PDP gallery scroll buttons --- */
document.querySelectorAll('.pdp-gallery').forEach((gallery) => {
  const strip = gallery.querySelector('.pdp-strip');
  const prev = gallery.querySelector('.strip-prev');
  const next = gallery.querySelector('.strip-next');
  if (!strip || !prev || !next) return;

  const step = () => {
    const fig = strip.querySelector('figure');
    return fig ? fig.getBoundingClientRect().width : strip.clientWidth * 0.8;
  };
  const update = () => {
    const max = strip.scrollWidth - strip.clientWidth - 2;
    prev.disabled = strip.scrollLeft <= 2;
    next.disabled = strip.scrollLeft >= max;
  };

  prev.addEventListener('click', () => strip.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => strip.scrollBy({ left: step(), behavior: 'smooth' }));
  strip.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

/* --- Buy fork dialog --- */
const dialog = document.getElementById('buy-dialog');
if (dialog) {
  const nameEl = dialog.querySelector('.buy-product-name');
  const empireLink = dialog.querySelector('[data-door="empire"]');
  const amazonLink = dialog.querySelector('[data-door="amazon"]');

  const open = (key) => {
    const p = PRODUCT_LINKS[key] || PRODUCT_LINKS.collection;
    nameEl.textContent = p.name;
    empireLink.href = p.empire;
    amazonLink.href = p.amazon;
    const last = localStorage.getItem('spada-door');
    empireLink.classList.toggle('door-pro', last !== 'amazon');
    dialog.showModal();
  };

  document.querySelectorAll('[data-buy]').forEach((btn) =>
    btn.addEventListener('click', () => open(btn.dataset.buy))
  );
  [empireLink, amazonLink].forEach((link) =>
    link.addEventListener('click', () => {
      localStorage.setItem('spada-door', link.dataset.door);
      dialog.close();
    })
  );
  dialog.querySelector('.buy-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

/* --- Smooth inertia scroll (desktop mouse/trackpad only).
   Eases every wheel tick toward a lerped target instead of jumping straight
   there — the buttery, momentum feel. Deliberately narrow in scope so it
   never fights the browser:
   - reduced-motion and touch devices are untouched (mobile's native scroll
     is already the right feel; this is desktop-only, pointer:fine).
   - ctrl+wheel (pinch-zoom) and any gesture that's more horizontal than
     vertical pass straight through to the browser.
   - anything inside its own scrollable ancestor (the horizontal racks and
     galleries, the armory table, the open buy dialog, the mobile nav
     dropdown) is left to native nested scrolling.
   - every scrollTo call forces behavior:'instant' so it doesn't double up
     with the global `scroll-behavior: smooth` CSS (that would stack two
     competing easings and make scrolling laggy/rubbery).
   - anchor-link jumps and keyboard scrolling (Page Down, arrows, Tab) never
     touch this — they stay native, immediate, and fully accessible; the
     scroll listener just resyncs the lerp target afterward so the next
     wheel tick doesn't jump. */
if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const EASE = 0.1;
  const scroller = document.scrollingElement;
  let target = scrollY;
  let current = target;
  let ticking = false;

  const maxScroll = () => scroller.scrollHeight - innerHeight;

  const nestedScrollAncestor = (el, vertical) => {
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.tagName === 'DIALOG') return true;
      const cs = getComputedStyle(el);
      if (vertical && el.scrollHeight > el.clientHeight && /(auto|scroll)/.test(cs.overflowY)) return true;
      if (!vertical && el.scrollWidth > el.clientWidth && /(auto|scroll)/.test(cs.overflowX)) return true;
      el = el.parentElement;
    }
    return false;
  };

  const normalizeDelta = (e) => {
    // deltaMode 1 = lines, 2 = pages (mostly Firefox); 0 = pixels (everyone else).
    if (e.deltaMode === 1) return e.deltaY * 16;
    if (e.deltaMode === 2) return e.deltaY * innerHeight;
    return e.deltaY;
  };

  const raf = () => {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      ticking = false;
    } else {
      requestAnimationFrame(raf);
    }
    window.scrollTo({ top: current, left: 0, behavior: 'instant' });
  };

  window.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) return; // pinch-zoom
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // intentional horizontal scroll
      if (nestedScrollAncestor(e.target, true)) return; // let nested scrollers handle themselves

      target = Math.min(Math.max(target + normalizeDelta(e), 0), maxScroll());
      e.preventDefault();
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(raf);
      }
    },
    { passive: false }
  );

  // Recalibrate after any scroll we didn't drive ourselves (anchor jumps,
  // keyboard, browser scroll restoration) so the next wheel tick picks up
  // from the real position instead of an out-of-date target.
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        target = scrollY;
        current = target;
      }
    },
    { passive: true }
  );
  window.addEventListener('resize', () => {
    target = Math.min(target, maxScroll());
  });
}
