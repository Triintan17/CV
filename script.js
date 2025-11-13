// script.js
// Intersection Observer untuk animasi masuk (reveal) & skill progress.
// Smooth scrolling & navigasi aktif otomatis.

document.addEventListener('DOMContentLoaded', () => {
  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  navToggle && navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    primaryNav.classList.toggle('open');
  });

  // Smooth scroll for nav links (also respects user prefers-reduced-motion)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      // Allow default behavior for external anchors
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (!target) return;
        // Close mobile nav when link clicked
        if (primaryNav && primaryNav.classList.contains('open')) {
          primaryNav.classList.remove('open');
          navToggle && navToggle.setAttribute('aria-expanded', 'false');
        }
        if (prefersReduced) {
          target.scrollIntoView();
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // Reveal on scroll (IntersectionObserver)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // if element is a progress bar, animate its fill
        if (entry.target.matches('.progress')) {
          animateProgress(entry.target);
        }
        // for nested progress elements within reveal wrappers, find them
        entry.target.querySelectorAll && entry.target.querySelectorAll('.progress').forEach(el => animateProgress(el));
        // unobserve to avoid repeated triggers
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -8% 0px', // trigger a little before fully in view
    threshold: 0.08
  });

  // Observe all revealable elements
  document.querySelectorAll('.reveal, .progress, .slide-left, .slide-right, .slide-up, .hero-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Skill progress animation helper
  function animateProgress(progressEl) {
    const fill = progressEl.querySelector('.progress-fill');
    if (!fill) return;
    const target = Number(progressEl.dataset.skill || 0);
    fill.style.width = Math.max(0, Math.min(100, target)) + '%';
    // update aria-valuenow for accessibility
    try {
      progressEl.setAttribute('aria-valuenow', String(target));
    } catch (e) { /* nothing */ }
  }

  // Navigation active state: observe sections and update nav links
  const navLinks = Array.from(document.querySelectorAll('.nav-link[data-target]'));
  const sections = navLinks.map(l => document.getElementById(l.dataset.target)).filter(Boolean);

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.dataset.target === id;
          link.classList.toggle('active', isActive);
          if (isActive) {
            link.setAttribute('aria-current', 'page');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, {
    root: null,
    threshold: [0.5, 0.8] // consider a section active when roughly in view
  });

  sections.forEach(s => activeObserver.observe(s));

  // Simple contact form handling (non-submitting demo)
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Basic validation
      const formData = new FormData(contactForm);
      const name = formData.get('name')?.toString().trim();
      const email = formData.get('email')?.toString().trim();
      const message = formData.get('message')?.toString().trim();
      if (!name || !email || !message) {
        updateStatus('Mohon lengkapi semua kolom.', true);
        return;
      }
      // Simulate send
      updateStatus('Mengirim...', false);
      setTimeout(() => {
        updateStatus('Pesan terkirim. Terima kasih!', false);
        contactForm.reset();
      }, 900);
    });
  }

  function updateStatus(text, isError) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.style.color = isError ? '#ff6b6b' : 'var(--muted)';
  }

  // Improve keyboard UX: close mobile nav on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (primaryNav && primaryNav.classList.contains('open')) {
        primaryNav.classList.remove('open');
        navToggle && navToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

});