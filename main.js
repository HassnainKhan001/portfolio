/* ============================================================
   main.js — Muhammad Hasnain Portfolio
   v2.0 — clean rewrite
   ============================================================

   CONFIGURATION
   ─────────────
   CONTACT_ENDPOINT: replace YOUR_FORMSPREE_ID with your form ID.
   Steps:
     1. Create a free account at https://formspree.io
     2. Click "New Form", give it a name
     3. Copy the form ID (the part after /f/ in the endpoint URL)
     4. Paste it below

   Alternatively, to use the existing FastAPI /api/contact endpoint:
     const CONTACT_ENDPOINT = '/api/contact';
   ============================================================ */

'use strict';

// ── [ADD: replace YOUR_FORMSPREE_ID with your actual Formspree form ID]
const CONTACT_ENDPOINT = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveNav();
  initFAQ();
  initContactForm();
});

// ─────────────────────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────────────────────
function initMobileNav() {
  const btn  = document.querySelector('.mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  function open() {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close navigation menu');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', () => {
    menu.classList.contains('open') ? close() : open();
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) close();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
}

// ─────────────────────────────────────────────────────────────
// ACTIVE NAV ON SCROLL  (IntersectionObserver)
// ─────────────────────────────────────────────────────────────
function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!navLinks.length) return;

  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (!sections.length) return;

  function setActive(id) {
    navLinks.forEach(link => {
      const matches = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', matches);
      if (matches) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    {
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0,
    }
  );

  sections.forEach(s => observer.observe(s));
}

// ─────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────
function initFAQ() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId   = btn.getAttribute('aria-controls');
      const answer     = document.getElementById(answerId);
      if (!answer) return;

      // Collapse all others
      questions.forEach(other => {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        const id = other.getAttribute('aria-controls');
        const el = document.getElementById(id);
        if (el) el.classList.remove('open');
      });

      // Toggle this one
      const next = !isExpanded;
      btn.setAttribute('aria-expanded', String(next));
      answer.classList.toggle('open', next);
    });
  });
}

// ─────────────────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────────────────
function initContactForm() {
  const form      = document.getElementById('contact-form');
  const statusEl  = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  if (!form || !statusEl || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';
    statusEl.className    = 'form-status';
    statusEl.textContent  = '';

    const payload = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        statusEl.className   = 'form-status success';
        statusEl.textContent = 'Message sent. I will respond within the timeframe noted above.';
        form.reset();
      } else {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('[contact-form]', err);
      statusEl.className   = 'form-status error';
      statusEl.textContent = 'Could not send your message. Please try again or use PGP email.';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send message';
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}
