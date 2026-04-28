'use strict';

// ─────────────────────────────────────────
// 1. NAVBAR — scroll shadow + active link highlight
// ─────────────────────────────────────────
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-a');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    highlightActive();
    toggleBackToTop();
  }, { passive: true });

  function highlightActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
})();


// ─────────────────────────────────────────
// 2. HAMBURGER MENU (mobile)
// ─────────────────────────────────────────
(function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    links.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });

  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      btn.classList.remove('open');
      links.classList.remove('open');
    })
  );
})();


// ─────────────────────────────────────────
// 3. SCROLL REVEAL
// ─────────────────────────────────────────
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
})();


// ─────────────────────────────────────────
// 4. SKILL BAR ANIMATIONS
// ─────────────────────────────────────────
function animateSkillBars() {
  document.querySelectorAll('.level-bar:not(.animated)').forEach((bar, i) => {
    setTimeout(() => bar.classList.add('animated'), i * 55);
  });
}

(function initSkillBars() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { animateSkillBars(); io.disconnect(); }
  }, { threshold: 0.1 });
  io.observe(grid);
})();


// ─────────────────────────────────────────
// 5. MERN CARD BAR ANIMATIONS
// ─────────────────────────────────────────
(function initMernBars() {
  const section = document.getElementById('mern');
  if (!section) return;
  const bars = section.querySelectorAll('.mern-bar-fill');
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      bars.forEach((bar, i) => setTimeout(() => bar.classList.add('animated'), i * 120));
      io.disconnect();
    }
  }, { threshold: 0.2 });
  io.observe(section);
})();


// ─────────────────────────────────────────
// 6. SKILL TAB FILTER
// ─────────────────────────────────────────
(function initTabs() {
  const tabs  = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.skill-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const sel = tab.dataset.tab;
      cards.forEach(card => {
        const show = sel === 'all' || card.dataset.category === sel;
        card.classList.toggle('hidden', !show);
      });

      // Stagger reveal for visible cards
      const visible = [...cards].filter(c => !c.classList.contains('hidden'));
      visible.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          card.style.transition = `opacity 0.3s ${i * 35}ms ease, transform 0.3s ${i * 35}ms ease`;
          card.style.opacity = '';
          card.style.transform = '';
        }));
      });

      setTimeout(() => {
        visible.forEach(c => { c.style.transition = ''; c.style.opacity = ''; c.style.transform = ''; });
        animateSkillBars();
      }, visible.length * 35 + 350);
    });
  });
})();


// ─────────────────────────────────────────
// 7. ANIMATED STAT COUNTERS
// ─────────────────────────────────────────
(function initCounters() {
  const counters = document.querySelectorAll('.num[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      let cur = 0;
      el.classList.add('counting');
      const timer = setInterval(() => {
        cur++;
        el.textContent = cur + '+';
        if (cur >= end) { clearInterval(timer); el.classList.remove('counting'); }
      }, Math.ceil(1200 / end));
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
})();


// ─────────────────────────────────────────
// 8. BACK TO TOP BUTTON
// ─────────────────────────────────────────
function toggleBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (btn) btn.classList.toggle('visible', window.scrollY > 400);
}

(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


// ─────────────────────────────────────────
// 9. CONTACT FORM — validation + submit
// ─────────────────────────────────────────
(function initForm() {
  const form    = document.getElementById('contact-form');
  if (!form) return;

  const nameEl  = form.querySelector('#cf-name');
  const emailEl = form.querySelector('#cf-email');
  const msgEl   = form.querySelector('#cf-message');
  const nameErr = form.querySelector('#name-error');
  const emailErr= form.querySelector('#email-error');
  const msgErr  = form.querySelector('#message-error');
  const success = document.getElementById('form-success');
  const btnText = form.querySelector('.btn-text');
  const btnLoad = form.querySelector('.btn-loader');

  nameEl.addEventListener('blur',  validateName);
  emailEl.addEventListener('blur', validateEmail);
  msgEl.addEventListener('blur',   validateMsg);

  function validateName() {
    const v = nameEl.value.trim();
    if (!v)        return setErr(nameEl, nameErr, 'Name is required.');
    if (v.length < 2) return setErr(nameEl, nameErr, 'Must be at least 2 characters.');
    return clrErr(nameEl, nameErr), true;
  }
  function validateEmail() {
    const v = emailEl.value.trim();
    if (!v) return setErr(emailEl, emailErr, 'Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setErr(emailEl, emailErr, 'Enter a valid email.');
    return clrErr(emailEl, emailErr), true;
  }
  function validateMsg() {
    const v = msgEl.value.trim();
    if (!v)         return setErr(msgEl, msgErr, 'Message is required.');
    if (v.length < 10) return setErr(msgEl, msgErr, 'Must be at least 10 characters.');
    return clrErr(msgEl, msgErr), true;
  }
  function setErr(el, errEl, msg) { el.classList.add('error'); if (errEl) errEl.textContent = msg; return false; }
  function clrErr(el, errEl)      { el.classList.remove('error'); if (errEl) errEl.textContent = ''; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = [validateName(), validateEmail(), validateMsg()].every(Boolean);
    if (!ok) return;

    btnText.hidden = true;
    btnLoad.hidden = false;

    // ── Replace with real API call ──────────────────────────
    // const res = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name: nameEl.value, email: emailEl.value, message: msgEl.value })
    // });
    await new Promise(r => setTimeout(r, 1400));
    // ────────────────────────────────────────────────────────

    btnText.hidden = false;
    btnLoad.hidden = true;
    form.reset();
    success.hidden = false;
    setTimeout(() => { success.hidden = true; }, 6000);
  });
})();


// ─────────────────────────────────────────
// 10. SMOOTH SCROLL for anchor links
// ─────────────────────────────────────────
(function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
    });
  });
})();


console.log('%c Portfolio ready ✓', 'color:#1a6b4a;font-weight:bold;font-size:14px;');
