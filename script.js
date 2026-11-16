
// ===================================
// VIRAJ GURAV - WEBSITE INTERACTIONS
// ===================================

// 1. SCROLL REVEAL ANIMATIONS

const revealElements = document.querySelectorAll(
  '.hero-text, .hero > .frame, .block > h2, .card, .item, .about .frame, .about > div, .steps li, .contact form'
);

revealElements.forEach((element) => {
  element.classList.add('reveal');
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


// 2. CUSTOM GOLD CURSOR

const finePointer = window.matchMedia(
  '(hover: hover) and (pointer: fine)'
);

if (finePointer.matches) {
  const ring = document.createElement('div');
  const dot = document.createElement('div');

  ring.className = 'cursor-ring';
  dot.className = 'cursor-dot';

  document.body.append(ring, dot);

  document.addEventListener('mousemove', (event) => {
    document.body.classList.add('cursor-active');

    ring.style.left = `${event.clientX}px`;
    ring.style.top = `${event.clientY}px`;

    dot.style.left = `${event.clientX}px`;
    dot.style.top = `${event.clientY}px`;
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });

  document.addEventListener('mouseenter', () => {
    document.body.classList.add('cursor-active');
  });

  // Cursor expands over clickable elements
  const interactiveElements = document.querySelectorAll(
    'a, button, label, select, input'
  );

  interactiveElements.forEach((element) => {
    element.addEventListener('mouseenter', () => {
      ring.classList.add('hover');
    });

    element.addEventListener('mouseleave', () => {
      ring.classList.remove('hover');
    });
  });
}
// ===================================
// VFX LAYER  (load AFTER script.js)
// ===================================

(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // 1. PAGE LOADER: hides once everything has loaded (min ~0.9s)
  const loader = document.querySelector('.loader');
  const hideLoader = () => {
    const wait = Math.max(0, 900 - performance.now());
    setTimeout(() => loader && loader.classList.add('hide'), wait);
  };
  if (document.readyState === 'complete') hideLoader();
  else window.addEventListener('load', hideLoader);


  // 2. SCROLL PROGRESS BAR + HEADER SHRINK
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.append(bar);

  const header = document.querySelector('.top');
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (header) header.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // 3. TYPING EFFECT IN THE HERO LINE
  const kicker = document.querySelector('.kicker');

  if (kicker && !reduce) {
    const words = ['Artist for hire', 'Pencil portraits', 'Wall paintings', 'Anime on denim'];
    let w = 0;
    let c = 0;
    let deleting = false;

    kicker.textContent = '';
    kicker.classList.add('typing');

    const tick = () => {
      const word = words[w];
      c += deleting ? -1 : 1;
      kicker.textContent = word.slice(0, c);

      let delay = deleting ? 45 : 90;

      if (!deleting && c === word.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && c === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 350;
      }

      setTimeout(tick, delay);
    };

    tick();
  }


  // 4. FLOATING GOLD DUST (canvas behind the page)
  if (!reduce) {
    const canvas = document.createElement('canvas');
    canvas.className = 'vfx-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    const mouse = { x: -999, y: -999 };
    let w = 0;
    let h = 0;
    let parts = [];
    let raf = 0;

    const make = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(Math.random() * 0.35 + 0.1),
      a: Math.random() * 0.5 + 0.2,
      t: Math.random() * Math.PI * 2
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, w / 18));
      parts = Array.from({ length: count }, () => make(true));
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        p.t += 0.02;
        p.x += p.vx + Math.sin(p.t) * 0.15;
        p.y += p.vy;

        // dust moves away from the mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 120) {
          const f = (120 - d) / 120;
          p.x += (dx / d) * f * 2;
          p.y += (dy / d) * f * 2;
        }

        if (p.y < -10) Object.assign(p, make(false));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,173,96,${p.a * (0.6 + 0.4 * Math.sin(p.t * 2))})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(214,173,96,.6)';
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    frame();

    window.addEventListener('resize', resize);

    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      mouse.x = -999;
      mouse.y = -999;
    });

    // pause when the tab is hidden (saves battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else frame();
    });
  }


  // 5. SOFT GOLD GLOW THAT FOLLOWS THE CURSOR
  if (fine && !reduce) {
    const glow = document.createElement('div');
    glow.className = 'spotlight';
    document.body.append(glow);

    window.addEventListener('pointermove', (e) => {
      glow.classList.add('on');
      glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    });

    document.addEventListener('mouseleave', () => glow.classList.remove('on'));
  }


  // 6. 3D TILT + MOUSE GLOW ON CARDS, GALLERY ITEMS, STEPS
  if (fine && !reduce) {
    document.querySelectorAll('.card, .item, .steps li').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;

        el.style.setProperty('--mx', `${x * 100}%`);
        el.style.setProperty('--my', `${y * 100}%`);
        el.style.transition =
          'transform .12s ease-out, border-color .35s ease, box-shadow .35s ease';
        el.style.transform =
          `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-8px)`;
      });

      el.addEventListener('pointerleave', () => {
        el.style.transition = '';
        el.style.transform = '';
      });
    });
  }


  // 7. BUTTON CLICK RIPPLE
  if (!reduce) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2;
        const ripple = document.createElement('span');

        ripple.className = 'ripple';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - r.left - size / 2}px`;
        ripple.style.top = `${e.clientY - r.top - size / 2}px`;

        btn.append(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  }
})();