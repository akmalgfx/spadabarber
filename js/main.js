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
  toggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach((a) =>
    a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
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

/* --- Hero film reel: the commercials run back-to-back in an endless loop,
   crossfading at low opacity behind the centered copy. The second film only
   starts downloading once the first is playing. --- */
const filmWrap = document.querySelector('.hero-film');
if (filmWrap) {
  const films = [...filmWrap.querySelectorAll('video')];
  let idx = 0;

  films.forEach((v) =>
    v.addEventListener('ended', () => {
      v.classList.remove('playing');
      idx = (idx + 1) % films.length;
      const next = films[idx];
      next.currentTime = 0;
      next.classList.add('playing');
      next.play().catch(() => {});
    })
  );

  const start = () => {
    films[0].classList.add('playing');
    if (reduceMotion) return;
    films[0].play().catch(() => {});
    films.slice(1).forEach((v) => {
      if (v.preload === 'none') {
        v.preload = 'auto';
        v.load();
      }
    });
  };
  if (films[0].readyState >= 2) start();
  else films[0].addEventListener('canplay', start, { once: true });
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
