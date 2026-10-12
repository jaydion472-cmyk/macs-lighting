(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- Header + menu ---------- */
  const hdr = document.querySelector('.hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Color helpers ---------- */
  const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => {
    const [r1, g1, b1] = hexToRgb(a), [r2, g2, b2] = hexToRgb(b);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  };
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

  /* ---------- Shared illustrated house ---------- */
  let houseCount = 0;
  const buildHouse = (container) => {
    const uid = `h${houseCount++}`;
    container.insertAdjacentHTML('afterbegin', `
      <svg viewBox="0 0 640 360" role="img" aria-label="Illustrated house at night with roofline lights" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1340"/><stop offset="1" stop-color="#05060a"/></linearGradient>
          <filter id="${uid}-bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <radialGradient id="${uid}-wash" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="640" height="360" fill="url(#${uid}-sky)"/>
        <g fill="#fff" opacity=".5"><circle cx="70" cy="40" r="1"/><circle cx="160" cy="26" r="1.2"/><circle cx="470" cy="34" r="1"/><circle cx="560" cy="70" r="1.3"/><circle cx="330" cy="18" r="1"/><circle cx="30" cy="100" r="1"/><circle cx="610" cy="20" r="1"/></g>
        <g fill="#03050c"><path d="M10 300 34 200 58 300zM40 300 72 170 104 300zM540 300 572 160 604 300zM590 300 612 220 634 300z"/></g>
        <path d="M130 200 L250 110 L320 162 L390 80 L520 180 L520 310 L130 310 Z" fill="#161c2e"/>
        <path class="wash" d="M130 200 L250 110 L320 162 L390 80 L520 180 L520 310 L130 310 Z" fill="url(#${uid}-wash)" opacity="0"/>
        <path d="M130 200 L250 110 L320 162 L390 80 L520 180" fill="none" stroke="#2a3149" stroke-width="10" stroke-linejoin="round"/>
        <rect x="150" y="235" width="140" height="75" rx="4" fill="#0d1120" stroke="#2a3149" stroke-width="3"/>
        <g fill="#ffcf7a" opacity=".85"><rect x="162" y="246" width="18" height="9" rx="1"/><rect x="186" y="246" width="18" height="9" rx="1"/><rect x="210" y="246" width="18" height="9" rx="1"/><rect x="234" y="246" width="18" height="9" rx="1"/><rect x="258" y="246" width="18" height="9" rx="1"/></g>
        <g fill="#ffcf7a"><rect x="370" y="128" width="40" height="42" rx="2"/><rect x="232" y="158" width="30" height="34" rx="2"/><rect x="420" y="228" width="60" height="54" rx="2"/></g>
        <g stroke="#161c2e" stroke-width="3"><path d="M390 128v42M370 149h40M247 158v34M450 228v54M420 255h60"/></g>
        <rect x="340" y="236" width="44" height="74" rx="2" fill="#ffb95c" opacity=".9"/>
        <ellipse class="ground-glow" cx="325" cy="318" rx="270" ry="20" fill="#8a4dff" opacity=".25"/>
        <rect y="310" width="640" height="50" fill="#070910"/>
        <path class="roof-path" d="M138 196 L250 115 L320 166 L390 85 L514 178" fill="none" stroke="none"/>
        <g class="leds" filter="url(#${uid}-bloom)"></g>
      </svg>`);
    const svg = container.querySelector('svg');
    const path = svg.querySelector('.roof-path');
    const group = svg.querySelector('.leds');
    const total = path.getTotalLength();
    const count = Math.floor(total / 15) + 1;
    const leds = [];
    for (let i = 0; i < count; i++) {
      const p = path.getPointAtLength((i / (count - 1)) * total);
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', p.x.toFixed(1));
      c.setAttribute('cy', p.y.toFixed(1));
      c.setAttribute('r', '4.2');
      group.appendChild(c);
      leds.push(c);
    }
    return { svg, leds, glow: svg.querySelector('.ground-glow'), wash: svg.querySelector('.wash') };
  };

  /* ---------- Everyday vs Holiday compare ---------- */
  const compare = document.querySelector('.compare');
  if (compare) {
    const everyday = buildHouse(compare.querySelector('[data-house="everyday"]'));
    everyday.leds.forEach((c) => c.setAttribute('fill', '#ffd29a'));
    everyday.glow.setAttribute('fill', '#ffc98a');
    everyday.wash.setAttribute('opacity', '.5');

    const holiday = buildHouse(compare.querySelector('[data-house="holiday"]'));
    const xmas = ['#ff2a3d', '#20d36b', '#ffffff'];
    holiday.leds.forEach((c, i) => c.setAttribute('fill', xmas[Math.floor(i / 2) % 3]));
    holiday.glow.setAttribute('fill', '#ff2a3d');

    const range = compare.querySelector('.compare-range');
    const update = () => compare.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  }

  /* ---------- Interactive designer ---------- */
  const THEMES = {
    signature: { name: 'Signature', stops: ['#1e9bff', '#8a4dff', '#ff2fb3'], blend: true },
    christmas: { name: 'Christmas', stops: ['#ff2a3d', '#20d36b', '#ffffff'] },
    halloween: { name: 'Halloween', stops: ['#ff7a00', '#9b3dff', '#39ff6a'] },
    july4: { name: '4th of July', stops: ['#ff2a3d', '#ffffff', '#2b6bff'] },
    gameday: { name: 'Game Day', stops: ['#7a2cff', '#ffc627'] },
    valentine: { name: "Valentine's", stops: ['#ff2f7d', '#ff9cc2', '#ffffff'] },
    security: { name: 'Security', stops: ['#f4f7ff'], solid: true },
    warm: { name: 'Warm White', stops: ['#ffc98a'], solid: true },
  };

  const stage = document.getElementById('designer-stage');
  let setScene = () => {};
  if (stage) {
    const house = buildHouse(stage);
    const { leds } = house;
    const count = leds.length;
    const themeName = document.getElementById('theme-name');
    const modeName = document.getElementById('mode-name');
    const power = document.getElementById('power');
    const bright = document.getElementById('brightness');
    const brightVal = document.getElementById('bright-val');

    let theme = THEMES.signature;
    let mode = reduceMotion ? 'steady' : 'chase';
    let brightness = 1;
    let lightsOn = true;
    let visible = true;
    let rafId = null;
    const seeds = leds.map(() => Math.random() * Math.PI * 2);

    const colorFor = (i, time) => {
      if (theme.solid) return theme.stops[0];
      if (theme.blend) {
        const base = i / (count - 1);
        if (mode !== 'chase') return sample(theme.stops, base);
        const x = (base + time * 0.00012) % 2;
        return sample(theme.stops, 1 - Math.abs(x - 1));
      }
      const offset = mode === 'chase' ? Math.floor(time / 180) : 0;
      return theme.stops[Math.floor((i + offset) / 3) % theme.stops.length];
    };

    const render = (time = 0) => {
      leds.forEach((c, i) => {
        c.setAttribute('fill', colorFor(i, time));
        let o = brightness;
        if (mode === 'twinkle') o *= 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 0.004 + seeds[i] * 3));
        c.setAttribute('opacity', o.toFixed(2));
      });
    };
    const loop = (time) => {
      render(time);
      rafId = mode !== 'steady' && visible && lightsOn ? requestAnimationFrame(loop) : null;
    };
    const restart = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      house.glow.setAttribute('fill', sample(theme.stops, 0.5));
      house.glow.setAttribute('opacity', (0.25 * brightness * (lightsOn ? 1 : 0)).toFixed(2));
      house.wash.setAttribute('opacity', theme.solid && lightsOn ? (0.5 * brightness).toFixed(2) : '0');
      themeName.textContent = theme.name;
      modeName.textContent = mode[0].toUpperCase() + mode.slice(1);
      if (mode === 'steady' || !visible || !lightsOn) render(0);
      else rafId = requestAnimationFrame(loop);
    };
    const setPower = (on) => {
      lightsOn = on;
      power.classList.toggle('on', on);
      power.setAttribute('aria-pressed', String(on));
      stage.classList.toggle('off', !on);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; restart(); }).observe(stage);
    }

    const select = (selector, attr, value) => {
      document.querySelectorAll(selector).forEach((b) => {
        const on = b.dataset[attr] === value;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', String(on));
      });
    };
    document.querySelectorAll('.theme').forEach((btn) => btn.addEventListener('click', () => {
      theme = THEMES[btn.dataset.theme];
      select('.theme', 'theme', btn.dataset.theme);
      setPower(true); restart();
    }));
    document.querySelectorAll('.mode').forEach((btn) => btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      select('.mode', 'mode', mode);
      setPower(true); restart();
    }));
    power.addEventListener('click', () => { setPower(!lightsOn); restart(); });
    bright.addEventListener('input', () => {
      brightness = bright.value / 100;
      brightVal.textContent = `${bright.value}%`;
      setPower(true); restart();
    });
    if (reduceMotion) select('.mode', 'mode', 'steady');

    setScene = (key, newMode) => {
      if (!THEMES[key]) return;
      theme = THEMES[key];
      select('.theme', 'theme', key);
      if (newMode && !reduceMotion) { mode = newMode; select('.mode', 'mode', newMode); }
      setPower(true); restart();
    };
    restart();
  }

  /* ---------- Hero slideshow (our photos; phones also get our vertical videos) ---------- */
  const hsAll = [...document.querySelectorAll('.hs')];
  const hdotsBox = document.querySelector('.hero-dots');
  if (hsAll.length) {
    const PHOTO_MS = 6500;
    const phoneMq = window.matchMedia('(max-width: 860px)');
    let slides = [];
    let cur = 0;
    let started = 0;
    let rafId = null;
    let heroVisible = true;
    const vidOf = (s) => s.querySelector('video');
    const load = (s) => { const v = vidOf(s); if (v && !v.src) { v.src = v.dataset.src; v.preload = 'auto'; } return v; };
    const bars = () => [...hdotsBox.querySelectorAll('.hdot-bar i')];

    const paint = () => {
      const s = slides[cur];
      const v = vidOf(s);
      let pct;
      if (v) pct = v.duration ? (v.currentTime / v.duration) * 100 : 0;
      else { pct = ((performance.now() - started) / PHOTO_MS) * 100; if (pct >= 100) { go(cur + 1); return; } }
      const b = bars()[cur]; if (b) b.style.width = `${Math.min(100, pct)}%`;
      rafId = requestAnimationFrame(paint);
    };
    const go = (i) => {
      const prev = slides[cur];
      cur = (i + slides.length) % slides.length;
      const s = slides[cur];
      hsAll.forEach((x) => x.classList.toggle('is-active', x === s));
      bars().forEach((b, k) => { b.style.width = k < cur ? '100%' : '0'; });
      [...hdotsBox.children].forEach((d, k) => d.classList.toggle('is-active', k === cur));
      started = performance.now();
      if (reduceMotion) return;
      const v = load(s);
      if (v) { v.currentTime = 0; if (heroVisible) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } }
      load(slides[(cur + 1) % slides.length]);
      if (prev && prev !== s && vidOf(prev)) setTimeout(() => { if (slides[cur] !== prev) vidOf(prev).pause(); }, 1200);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = heroVisible ? requestAnimationFrame(paint) : null;
    };
    const build = () => {
      hsAll.forEach((x) => { const v = vidOf(x); if (v) v.pause(); });
      slides = hsAll.filter((x) => phoneMq.matches || !x.classList.contains('phone-only'));
      hdotsBox.innerHTML = slides.map((_, k) => `<button class="hdot" aria-label="Show slide ${k + 1}"><span class="hdot-bar"><i></i></span></button>`).join('');
      [...hdotsBox.children].forEach((d, k) => d.addEventListener('click', () => go(k)));
      cur = 0; go(0);
    };
    hsAll.forEach((x) => { const v = vidOf(x); if (v) v.addEventListener('ended', () => { if (slides[cur] === x) go(cur + 1); }); });
    if (phoneMq.addEventListener) phoneMq.addEventListener('change', build);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        heroVisible = e.isIntersecting;
        if (reduceMotion) return;
        const v = vidOf(slides[cur]);
        if (heroVisible) {
          if (v) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
          started = performance.now();
          if (!rafId) rafId = requestAnimationFrame(paint);
        } else {
          if (v) v.pause();
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        }
      }).observe(document.querySelector('.hero'));
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden || !heroVisible || reduceMotion) return;
      const v = vidOf(slides[cur]); if (v) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    });
    build();
  }

  /* ---------- Background videos ---------- */
  // Videos load only when near the screen and pause when off-screen.
  // Reduced-motion users and data-saver connections keep the still poster.
  const saveData = navigator.connection && navigator.connection.saveData;
  const videos = document.querySelectorAll('video[data-src]:not(.hs video)');
  if (!reduceMotion && !saveData) {
    const start = (v) => {
      if (!v.src) v.src = v.dataset.src;
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    };
    if ('IntersectionObserver' in window) {
      const vio = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) start(target);
          else if (target.src) target.pause();
        });
      }, { rootMargin: '200px 0px' });
      videos.forEach((v) => { if ('eager' in v.dataset) start(v); vio.observe(v); });
    } else {
      videos.forEach(start);
    }
  }

  /* ---------- Clickable cards → designer scenes ---------- */
  const designerSection = document.getElementById('designer');
  const showScene = (el) => {
    setScene(el.dataset.scene, el.dataset.mode);
    designerSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  };
  document.querySelectorAll('.fcard[data-scene], .duo-card[data-scene]').forEach((el) => {
    el.addEventListener('click', () => showScene(el));
    el.addEventListener('keydown', (e) => {
      if (el.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showScene(el); }
    });
  });

  /* ---------- Steps → jump into the form ---------- */
  document.querySelectorAll('.step-btn').forEach((btn) => btn.addEventListener('click', () => {
    const field = document.querySelector(`#estimate-form [name="${btn.dataset.focus}"]`);
    if (field) field.focus({ preventScroll: false });
  }));

  /* ---------- Service popup ---------- */
  const modal = document.getElementById('modal');
  if (modal && typeof modal.showModal === 'function') {
    const mMedia = document.getElementById('modal-media');
    const mTitle = document.getElementById('modal-title');
    const mText = document.getElementById('modal-text');
    const mQuote = document.getElementById('modal-quote');
    let pick = '';

    document.querySelectorAll('.tile[data-modal]').forEach((tile) => tile.addEventListener('click', (e) => {
      e.preventDefault();
      const vid = tile.querySelector('video');
      const img = tile.querySelector('img');
      mMedia.replaceChildren();
      if (vid) {
        const v = document.createElement('video');
        v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = !reduceMotion;
        v.poster = vid.poster;
        v.src = vid.dataset.src;
        mMedia.appendChild(v);
      } else if (img) {
        mMedia.appendChild(img.cloneNode());
      }
      modal.classList.toggle('is-tall', 'tall' in tile.dataset);
      mTitle.textContent = tile.dataset.title;
      mText.textContent = tile.dataset.text;
      pick = tile.dataset.pick || '';
      modal.showModal();
    }));

    const close = () => modal.close();
    modal.querySelector('.modal-x').addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });   // click on backdrop
    modal.addEventListener('close', () => mMedia.replaceChildren());               // stop the video
    mQuote.addEventListener('click', () => {
      if (pick) document.getElementById('estimate-form').elements.interest.value = pick;
      close();
    });
  }

  /* ---------- Rails: arrow buttons ---------- */
  document.querySelectorAll('[data-scroll]').forEach((btn) => btn.addEventListener('click', () => {
    const rail = document.getElementById(btn.dataset.scroll);
    const card = rail.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 16 : 320;
    rail.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- Next-holiday countdown ---------- */
  const nthWeekday = (y, m, weekday, n) => {
    const d = new Date(y, m, 1);
    const shift = (weekday - d.getDay() + 7) % 7;
    return new Date(y, m, 1 + shift + 7 * (n - 1));
  };
  const holidaysFor = (y) => [
    { name: "New Year's", emoji: '🎆', date: new Date(y, 0, 1), scene: 'signature' },
    { name: "Valentine's", emoji: '💘', date: new Date(y, 1, 14), scene: 'valentine' },
    { name: "St. Patrick's", emoji: '☘️', date: new Date(y, 2, 17), scene: 'christmas' },
    { name: 'July 4th', emoji: '🎇', date: new Date(y, 6, 4), scene: 'july4' },
    { name: 'Halloween', emoji: '🎃', date: new Date(y, 9, 31), scene: 'halloween' },
    { name: 'Thanksgiving', emoji: '🦃', date: nthWeekday(y, 10, 4, 4), scene: 'warm' },
    { name: 'Christmas', emoji: '🎄', date: new Date(y, 11, 25), scene: 'christmas' },
  ];
  const cd = document.getElementById('countdown');
  if (cd) {
    const now = new Date();
    const next = [...holidaysFor(now.getFullYear()), ...holidaysFor(now.getFullYear() + 1)]
      .find((h) => h.date.getTime() + 864e5 > now.getTime());
    document.getElementById('cd-emoji').textContent = next.emoji;
    document.getElementById('cd-name').textContent = next.name;
    const timeEl = document.getElementById('cd-time');
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const ms = Math.max(0, next.date - new Date());
      if (ms === 0) { timeEl.textContent = 'Today'; return; }
      const s = Math.floor(ms / 1000);
      timeEl.textContent = `${Math.floor(s / 86400)}D ${pad(Math.floor(s / 3600) % 24)}H ${pad(Math.floor(s / 60) % 60)}M ${pad(s % 60)}S`;
    };
    tick();
    setInterval(tick, 1000);
    cd.addEventListener('click', () => setScene(next.scene));
  }

  /* ---------- Reviews ---------- */
  // Add real customer reviews here (copied from Google/Facebook with permission).
  // Until this list has an entry, the section shows a "be one of our first reviews" note.
  // New reviews arrive by email from the form below; paste the ones you approve here.
  // Example: { name: 'Jane D.', place: 'Maple Grove', stars: 5, text: 'Our house has never looked better...' }
  const REVIEWS = [];
  const reviewSection = document.getElementById('reviews');
  if (REVIEWS.length && reviewSection) {   // newest first
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
    const empty = document.getElementById('review-empty');
    if (empty) empty.remove();
  }

  /* ---------- Quote form ---------- */
  // Put the address that should receive quote requests here, e.g. 'you@example.com'.
  // While it's empty, the form opens the visitor's own email app instead (photos can't attach that way).
  // With an address, requests (photo included) are delivered by FormSubmit (formsubmit.co).
  // The very first request sends a one-time "confirm your email" message to that inbox: click it once.
  const FORM_EMAIL = 'macpaulmesseh@gmail.com';

  const form = document.getElementById('estimate-form');
  const note = document.getElementById('form-note');
  const photoInput = document.getElementById('photo-input');
  const MAX_PHOTO_MB = 10;

  if (FORM_EMAIL) {
    form.action = `https://formsubmit.co/${FORM_EMAIL}`;
    form.method = 'POST';
    form.enctype = 'multipart/form-data';
    const hidden = { _subject: 'New free quote request - macslight.com', _template: 'table', _next: `${location.origin}${location.pathname}?sent=1#quote` };
    Object.entries(hidden).forEach(([k, v]) => {
      const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; form.appendChild(i);
    });
    document.getElementById('send-btn').textContent = 'Send my request';
  }
  if (new URLSearchParams(location.search).get('sent')) {
    note.textContent = 'Thanks! Your request was sent. We\'ll be in touch soon.';
  }

  // photo picker: show the file name and a small preview
  photoInput.addEventListener('change', () => {
    const f = photoInput.files[0];
    const thumb = document.getElementById('photo-thumb');
    const name = document.getElementById('photo-name');
    const hint = document.getElementById('photo-hint');
    if (!f) { thumb.hidden = true; name.textContent = 'Add a photo of your home'; hint.textContent = 'Optional \u00b7 helps us price your design'; return; }
    if (f.size > MAX_PHOTO_MB * 1024 * 1024) {
      photoInput.value = ''; thumb.hidden = true;
      name.textContent = 'Add a photo of your home';
      hint.textContent = `That photo is over ${MAX_PHOTO_MB} MB. Please pick a smaller one.`;
      return;
    }
    name.textContent = f.name;
    hint.textContent = 'Tap to change photo';
    thumb.src = URL.createObjectURL(f); thumb.hidden = false;
  });

  document.querySelectorAll('[data-pick]').forEach((link) => link.addEventListener('click', () => {
    form.elements.interest.value = link.dataset.pick;
  }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    ['first', 'phone'].forEach((n) => {
      const el = form.elements[n];
      const bad = !el.value.trim();
      el.closest('.fld').classList.toggle('invalid', bad);
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); note.textContent = 'Please add your first name and phone so we can reach you.'; return; }

    const d = new FormData(form);
    const name = `${d.get('first')} ${d.get('last') || ''}`.trim();
    const lines = [
      `Name: ${name}`,
      `Phone: ${d.get('phone')}`,
      d.get('email') ? `Email: ${d.get('email')}` : '',
      d.get('address') || d.get('city') || d.get('zip') ? `Address: ${[d.get('address'), d.get('city'), d.get('zip')].filter(Boolean).join(', ')}` : '',
      `Interested in: ${d.get('interest')}`,
      d.get('message') ? `\n${d.get('message')}` : '',
    ].filter(Boolean);

    // The button the visitor pressed decides which app opens
    const via = (e.submitter && e.submitter.dataset.via) || 'email';
    const hasPhoto = photoInput.files.length > 0;
    if (via === 'email' && FORM_EMAIL) {
      note.textContent = 'Sending...';
      form.submit();   // real upload, photo included
      return;
    }
    const photoTip = hasPhoto ? ' Remember to attach your home photo before sending.' : '';
    if (via === 'sms') {
      const text = `Hi Mac's! Free quote request:\n${lines.join('\n')}`;
      // "?&body=" works on both iPhone and Android
      window.location.href = `sms:+16122297148?&body=${encodeURIComponent(text)}`;
      note.textContent = 'Your messages app should open with everything filled in. Just hit send!' + photoTip;
    } else {
      const subject = `Free quote request - ${name}`;
      window.location.href = `mailto:macpaulmesseh@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      note.textContent = 'Your email app should open with everything filled in. Just hit send!' + photoTip;
    }
  });
  form.addEventListener('input', (e) => { const f = e.target.closest('.fld'); if (f) f.classList.remove('invalid'); });

  /* ---------- Leave a review ---------- */
  const rForm = document.getElementById('review-form');
  if (rForm) {
    const rNote = document.getElementById('review-note');
    const rPhoto = document.getElementById('rv-photo');
    if (FORM_EMAIL) {
      rForm.action = `https://formsubmit.co/${FORM_EMAIL}`;
      rForm.method = 'POST';
      rForm.enctype = 'multipart/form-data';
      const hidden = { _subject: 'New review - macslight.com', _template: 'table', _next: `${location.origin}${location.pathname}?reviewed=1#reviews` };
      Object.entries(hidden).forEach(([k, v]) => {
        const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; rForm.appendChild(i);
      });
    }
    if (new URLSearchParams(location.search).get('reviewed')) {
      rNote.textContent = 'Thank you! We got your review and really appreciate it.';
    }
    rPhoto.addEventListener('change', () => {
      const f = rPhoto.files[0];
      const thumb = document.getElementById('rv-photo-thumb');
      const name = document.getElementById('rv-photo-name');
      const hint = document.getElementById('rv-photo-hint');
      if (f && f.size > MAX_PHOTO_MB * 1024 * 1024) { rPhoto.value = ''; hint.textContent = `That photo is over ${MAX_PHOTO_MB} MB. Please pick a smaller one.`; }
      const ok = rPhoto.files[0];
      thumb.hidden = !ok;
      if (ok) { thumb.src = URL.createObjectURL(ok); name.textContent = ok.name; hint.textContent = 'Tap to change photo'; }
      else { name.textContent = 'Add a photo of your lights'; if (!f) hint.textContent = 'Optional'; }
    });
    rForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(rForm);
      const missing = !d.get('rating') ? 'Please pick a star rating.'
        : !String(d.get('name')).trim() ? 'Please add your name.'
        : !String(d.get('review')).trim() ? 'Please write a few words about your lights.' : '';
      if (missing) { rNote.textContent = missing; return; }
      if (FORM_EMAIL) { rNote.textContent = 'Sending...'; rForm.submit(); return; }
      const body = `Rating: ${d.get('rating')}/5\nName: ${d.get('name')}\nPlace: ${d.get('place') || '-'}\nOK to publish: ${d.get('ok_to_publish') ? 'Yes' : 'No'}\n\n${d.get('review')}`;
      window.location.href = `mailto:macpaulmesseh@gmail.com?subject=${encodeURIComponent('New review')}&body=${encodeURIComponent(body)}`;
      rNote.textContent = 'Your email app should open with your review filled in. Just hit send!';
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
