(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- Header + mobile menu ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.menu-toggle');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Shared color helpers ---------- */
  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => {
    const [r1, g1, b1] = hexToRgb(a), [r2, g2, b2] = hexToRgb(b);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  };
  // Sample a multi-stop palette at position t (0..1)
  const sample = (stops, t) => {
    if (stops.length === 1) return stops[0];
    const seg = (stops.length - 1) * Math.min(Math.max(t, 0), 0.9999);
    const i = Math.floor(seg);
    return mix(stops[i], stops[i + 1], seg - i);
  };

  /* ---------- Logo roof LEDs ---------- */
  const roofDots = document.querySelector('.brand-roof .roof-dots');
  if (roofDots) {
    const n = 11;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      // two sides of the roof peak, inset just under the white stroke
      const x = 14 + t * 92;
      const y = t <= 0.5 ? 46 - (t / 0.5) * 32 : 14 + ((t - 0.5) / 0.5) * 32;
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', x.toFixed(1));
      c.setAttribute('cy', (y + 6).toFixed(1));
      c.setAttribute('r', '2.6');
      c.setAttribute('fill', sample(['#1e9bff', '#8a4dff', '#ff2fb3'], t));
      roofDots.appendChild(c);
    }
  }

  /* ---------- Roofline designer ---------- */
  const THEMES = {
    signature: { name: 'Signature', stops: ['#1e9bff', '#8a4dff', '#ff2fb3'], blend: true },
    christmas: { name: 'Christmas', stops: ['#ff2a3d', '#20d36b', '#ffffff'] },
    halloween: { name: 'Halloween', stops: ['#ff7a00', '#9b3dff', '#39ff6a'] },
    july4: { name: '4th of July', stops: ['#ff2a3d', '#ffffff', '#2b6bff'] },
    gameday: { name: 'Game Day', stops: ['#7a2cff', '#ffc627'] },
    valentine: { name: "Valentine's", stops: ['#ff2f7d', '#ff9cc2', '#ffffff'] },
    security: { name: 'Security', stops: ['#f4f7ff'], warm: true },
    warm: { name: 'Warm White', stops: ['#ffc98a'], warm: true },
  };

  const ledGroup = document.getElementById('leds');
  const roofPath = document.getElementById('roof-path');
  const groundGlow = document.getElementById('ground-glow');
  const themeName = document.getElementById('theme-name');
  const modeName = document.getElementById('mode-name');

  if (ledGroup && roofPath) {
    const total = roofPath.getTotalLength();
    const spacing = 15;
    const count = Math.floor(total / spacing) + 1;
    const leds = [];
    for (let i = 0; i < count; i++) {
      const p = roofPath.getPointAtLength((i / (count - 1)) * total);
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', p.x.toFixed(1));
      c.setAttribute('cy', p.y.toFixed(1));
      c.setAttribute('r', '4.2');
      ledGroup.appendChild(c);
      leds.push(c);
    }

    let theme = THEMES.signature;
    let mode = reduceMotion ? 'steady' : 'chase';
    const twinkleSeed = leds.map(() => Math.random() * Math.PI * 2);

    const colorFor = (i, time) => {
      const { stops } = theme;
      if (theme.blend || theme.warm) {
        const base = i / (count - 1);
        const shift = mode === 'chase' ? time * 0.00012 : 0;
        // ping-pong so the gradient flows smoothly back and forth
        const t = theme.warm ? 0 : Math.abs(((base + shift) % 2) - 1) * -1 + 1;
        return sample(stops, theme.warm ? 0 : (mode === 'chase' ? t : base));
      }
      // Banded themes: repeating groups of each color
      const band = 3;
      const offset = mode === 'chase' ? Math.floor(time / 180) : 0;
      return stops[Math.floor((i + offset) / band) % stops.length];
    };

    let brightness = 1;
    const render = (time = 0) => {
      leds.forEach((c, i) => {
        c.setAttribute('fill', colorFor(i, time));
        let o = brightness;
        if (mode === 'twinkle') o *= 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.004 + twinkleSeed[i] * 3));
        c.setAttribute('opacity', o.toFixed(2));
      });
    };

    let rafId = null;
    let visible = true;
    const loop = (time) => {
      render(time);
      rafId = mode !== 'steady' && visible ? requestAnimationFrame(loop) : null;
    };
    const restart = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      groundGlow.setAttribute('fill', sample(theme.stops, 0.5));
      groundGlow.setAttribute('opacity', (0.25 * brightness * (lightsOn ? 1 : 0)).toFixed(2));
      themeName.textContent = theme.name;
      modeName.textContent = mode[0].toUpperCase() + mode.slice(1);
      if (mode === 'steady' || !visible) render(0);
      else rafId = requestAnimationFrame(loop);
    };

    // Only animate while on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); })
        .observe(document.getElementById('house'));
    }

    const wireGroup = (selector, attr, onPick) => {
      const btns = document.querySelectorAll(selector);
      btns.forEach((btn) => btn.addEventListener('click', () => {
        btns.forEach((b) => { b.classList.toggle('active', b === btn); b.setAttribute('aria-checked', String(b === btn)); });
        onPick(btn.dataset[attr]);
        restart();
      }));
    };
    wireGroup('.theme', 'theme', (key) => { theme = THEMES[key]; setPower(true); });
    wireGroup('.mode', 'mode', (key) => { mode = key; setPower(true); });

    // Power + brightness (app-style controls)
    let lightsOn = true;
    const stage = document.querySelector('.designer-stage');
    const power = document.getElementById('power');
    function setPower(on) {
      lightsOn = on;
      power.classList.toggle('on', on);
      power.setAttribute('aria-pressed', String(on));
      stage.classList.toggle('off', !on);
    }
    power.addEventListener('click', () => { setPower(!lightsOn); restart(); });

    const bright = document.getElementById('brightness');
    const brightVal = document.getElementById('bright-val');
    bright.addEventListener('input', () => {
      brightness = bright.value / 100;
      brightVal.textContent = `${bright.value}%`;
      setPower(true);
      restart();
    });

    if (reduceMotion) {
      document.querySelectorAll('.mode').forEach((b) => {
        const on = b.dataset.mode === 'steady';
        b.classList.toggle('active', on); b.setAttribute('aria-checked', String(on));
      });
    }
    restart();
  }

  /* ---------- Reviews ---------- */
  // Add real customer reviews here (copied from Google/Facebook with permission).
  // The section stays hidden until this list has at least one entry.
  // Example: { name: 'Jane D.', place: 'Maple Grove', stars: 5, text: 'Our house has never looked better...' }
  const REVIEWS = [];
  const reviewSection = document.getElementById('reviews');
  if (REVIEWS.length && reviewSection) {
    const list = document.getElementById('review-list');
    REVIEWS.forEach((r) => {
      const fig = document.createElement('figure');
      fig.className = 'review';
      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('aria-label', `${r.stars} out of 5 stars`);
      stars.textContent = '★'.repeat(r.stars);
      const quote = document.createElement('blockquote');
      quote.textContent = `“${r.text}”`;
      const cap = document.createElement('figcaption');
      cap.textContent = r.name;
      if (r.place) { const s = document.createElement('span'); s.textContent = r.place; cap.appendChild(s); }
      fig.append(stars, quote, cap);
      list.appendChild(fig);
    });
    reviewSection.hidden = false;
  }

  /* ---------- Estimate form → pre-filled email ---------- */
  const form = document.getElementById('estimate-form');
  const note = document.getElementById('form-note');

  // "Service Request" links pre-select the matching interest chip
  document.querySelectorAll('[data-pick]').forEach((link) => link.addEventListener('click', () => {
    form.querySelectorAll('input[name="interest"]').forEach((cb) => { cb.checked = cb.value === link.dataset.pick; });
  }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = ['name', 'phone'];
    let ok = true;
    required.forEach((n) => {
      const el = form.elements[n];
      const bad = !el.value.trim();
      el.classList.toggle('invalid', bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    if (!ok) { note.textContent = 'Please add your name and phone so we can reach you.'; return; }

    const data = new FormData(form);
    const interests = data.getAll('interest').join(', ') || 'Not specified';
    const body = [
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Email: ${data.get('email') || '-'}`,
      `Address/City: ${data.get('address') || '-'}`,
      `Interested in: ${interests}`,
      '',
      `${data.get('message') || ''}`,
    ].join('\n');
    const subject = `Free estimate request - ${data.get('name')}`;
    window.location.href = `mailto:maclights@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should open now. Just hit send! No email app? Call or text 612-229-7148.';
  });
  form.addEventListener('input', (e) => e.target.classList.remove('invalid'));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
