// 1) Nama di hero: huruf menebal saat kursor mendekat, dan lampu sorot mengikuti kursor.
(() => {
  const h1 = document.querySelector('.name');
  const hero = document.querySelector('.hero');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = 650, MIN = 200, MAX = 800;
  const letters = [];
  let idx = 0;

  h1.querySelectorAll('.line').forEach(line => {
    const text = line.textContent.trim();
    line.textContent = '';
    for (const c of text) {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      line.appendChild(s);
      letters.push({ el: s, cur: reduce ? BASE : MIN, target: BASE, start: idx * 70 });
      idx++;
    }
  });

  const apply = l => {
    l.el.style.fontVariationSettings = `"wght" ${Math.round(l.cur)}`;
  };
  letters.forEach(apply);
  if (reduce) return;

  const t0 = performance.now();
  let running = false;

  const tick = now => {
    let busy = false;
    for (const l of letters) {
      if (now - t0 < l.start) { busy = true; continue; }
      const d = l.target - l.cur;
      if (Math.abs(d) > 0.4) { l.cur += d * 0.1; busy = true; } else { l.cur = l.target; }
      apply(l);
    }
    if (busy) requestAnimationFrame(tick); else running = false;
  };
  const kick = () => {
    if (!running) { running = true; requestAnimationFrame(tick); }
  };
  kick();

  hero.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;

    const box = hero.getBoundingClientRect();
    hero.style.setProperty('--x', `${e.clientX - box.left}px`);
    hero.style.setProperty('--y', `${e.clientY - box.top}px`);

    const R = Math.max(200, innerWidth * 0.2);
    for (const l of letters) {
      const r = l.el.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      l.target = BASE + (MAX - BASE) * Math.pow(Math.max(0, 1 - d / R), 2);
    }
    kick();
  });
  hero.addEventListener('pointerleave', () => {
    letters.forEach(l => { l.target = BASE; });
    kick();
  });
})();


// 2) Cahaya mengikuti kursor di kartu "Tentang".
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});


// 3) Elemen muncul halus saat di-scroll.
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();
