/* =====================================================
   SOFTWISE SOLUTIONS — script.js
   ===================================================== */

'use strict';

/* ========== UTILITY FUNCTIONS ========== */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ========== NAVBAR ========== */
(function initNavbar() {
  const navbar     = $('#navbar');
  const hamburger  = $('#hamburger');
  const navLinks   = $('#nav-links');
  const allLinks   = $$('.nav-link');
  const sections   = $$('section[id]');

  const handleScroll = debounce(() => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    highlightActiveLink();
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.matches('a')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  function highlightActiveLink() {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    allLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const target = $(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();

/* ========== SCROLL TO TOP ========== */
(function initScrollTop() {
  const btn = $('#scrollTop');

  window.addEventListener('scroll', debounce(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, 80), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ========== AOS — ANIMATE ON SCROLL ========== */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.aosDelay || 0, 10);
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
})();

/* ========== PROGRESS BARS ANIMATION ========== */
(function initProgressBars() {
  const fills = $$('.progress-fill');
  if (!fills.length) return;

  const targets = Array.from(fills).map((el) => el.style.width);
  fills.forEach((el) => { el.style.width = '0'; });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fills.forEach((el, i) => {
            setTimeout(() => {
              el.style.transition = 'width 1s ease';
              el.style.width = targets[i];
            }, i * 150);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const card = $('.progress-card');
  if (card) observer.observe(card);
})();

/* ========== STATS COUNTER ANIMATION ========== */
(function initCounters() {
  const statNumbers = $$('.stat-number, .team-stats strong, .satisfaction-badge strong');
  if (!statNumbers.length) return;

  function parseNum(text) {
    const match = text.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }

  function animateCounter(el, target, suffix, duration = 1500) {
    const start = performance.now();
    const isDecimal = (target % 1 !== 0);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.textContent.trim();
        const num = parseNum(raw);
        if (num === null) { observer.unobserve(el); return; }
        const suffix = raw.replace(/[\d.]+/, '').trim();
        animateCounter(el, num, suffix);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => observer.observe(el));
})();

/* ========== PRICING MODAL ========== */
const PLAN_DATA = {
  starter: {
    name: 'Starter Plan',
    price: 'R4,999/mo',
    waText: "Hello! I'd like to get started with the *Starter Plan (R4,999/mo)* on SoftWise Solutions. Can we schedule a call?",
    emailSubject: 'Getting Started – Starter Plan (R4,999/mo)',
    emailBody:
      'Hello SoftWise Team,%0A%0AI am interested in getting started with the Starter Plan (R4,999/mo).%0A%0APlease contact me to discuss the next steps.%0A%0AThank you.',
  },
  growth: {
    name: 'Growth Plan',
    price: 'R12,999/mo',
    waText: "Hello! I'd like to get started with the *Growth Plan (R12,999/mo)* on SoftWise Solutions. Can we schedule a call?",
    emailSubject: 'Getting Started – Growth Plan (R12,999/mo)',
    emailBody:
      'Hello SoftWise Team,%0A%0AI am interested in getting started with the Growth Plan (R12,999/mo).%0A%0APlease contact me to discuss the next steps.%0A%0AThank you.',
  },
  enterprise: {
    name: 'Enterprise Plan',
    price: 'Custom pricing',
    waText: "Hello! I'd like to enquire about the *Enterprise Plan* on SoftWise Solutions. Can we schedule a call?",
    emailSubject: 'Enterprise Plan Enquiry – SoftWise Solutions',
    emailBody:
      'Hello SoftWise Team,%0A%0AI am interested in the Enterprise Plan and would like to discuss a custom solution for my business.%0A%0APlease contact me.%0A%0AThank you.',
  },
};

function openModal(planKey) {
  const plan = PLAN_DATA[planKey];
  if (!plan) return;

  const overlay   = $('#modalOverlay');
  const planInfo  = $('#modalPlanInfo');
  const waBtn     = $('#modalWhatsApp');
  const emailBtn  = $('#modalEmail');

  planInfo.textContent = `${plan.name} · ${plan.price}`;

  const waEncoded = encodeURIComponent(plan.waText);
  waBtn.href = `https://wa.me/27735224964?text=${waEncoded}`;

  emailBtn.href =
    `mailto:info@softwise.co.za?subject=${encodeURIComponent(plan.emailSubject)}&body=${plan.emailBody}`;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  const focusable = overlay.querySelectorAll('button, a');
  if (focusable.length) focusable[0].focus();
}

function closeModal() {
  const overlay = $('#modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

window.openModal = openModal;

(function initModal() {
  const overlay = $('#modalOverlay');
  const closeBtn = $('#modalClose');

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });
})();

/* ========== TOAST NOTIFICATION ========== */
function showToast(message, type = 'default', duration = 4000) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.offsetHeight;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ========== CONTACT FORM ========== */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  function validateField(field) {
    const val = field.value.trim();
    let valid = true;

    if (!val) {
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      valid = false;
    }

    field.classList.toggle('error', !valid);
    return valid;
  }

  function validateAll() {
    let allValid = true;
    requiredFields.forEach((field) => {
      if (!validateField(field)) allValid = false;
    });
    return allValid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateAll()) {
      showToast('Please fill in all required fields correctly.', 'error');
      return;
    }

    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const phone   = $('#phone').value.trim();
    const company = $('#company').value.trim();
    const service = $('#service').value;
    const message = $('#message').value.trim();

    const emailSubject = encodeURIComponent(`Business Call Booking from ${name}`);
    const emailBody = encodeURIComponent(
      `Hello SoftWise Team,\n\nI would like to book a business call.\n\n` +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      (phone   ? `Phone: ${phone}\n` : '') +
      (company ? `Company: ${company}\n` : '') +
      (service ? `Service: ${service}\n` : '') +
      `\nProject Brief:\n${message}\n\nThank you.`
    );

    const waMessage = encodeURIComponent(
      `Hello SoftWise! My name is *${name}*. I'd like to book a business call.\n\n` +
      `Email: ${email}\n` +
      (phone   ? `Phone: ${phone}\n` : '') +
      (company ? `Company: ${company}\n` : '') +
      (service ? `Service interest: ${service}\n` : '') +
      `\nMessage: ${message}`
    );

    window.location.href = `mailto:info@softwise.co.za?subject=${emailSubject}&body=${emailBody}`;

    showToast(`✅ Thank you, ${name}! We'll be in touch within 24 hours.`, 'success', 5000);

    setTimeout(() => {
      window.open(`https://wa.me/27735224964?text=${waMessage}`, '_blank');
    }, 1200);

    form.reset();
    requiredFields.forEach((f) => f.classList.remove('error'));
  });
})();

/* ========== NAVBAR CTA ========== */
(function initBookCall() {
  const ctaBtn = $('.nav-cta');
  if (!ctaBtn) return;

  ctaBtn.addEventListener('click', (e) => {
    setTimeout(() => {
      showToast('Scroll down to fill the form or tap WhatsApp to connect instantly 👇', 'default', 4000);
    }, 600);
  });
})();

/* ========== RIPPLE EFFECT ========== */
(function initRipple() {
  $$('.service-card, .pricing-card').forEach((card) => {
    card.addEventListener('mouseenter', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--ripple-x', `${x}px`);
      card.style.setProperty('--ripple-y', `${y}px`);
    });
  });
})();

/* ========== KEYBOARD ACCESSIBILITY ========== */
(function initA11y() {
  $$('[role="button"]').forEach((el) => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
})();

/* ========== PREFERS REDUCED MOTION ========== */
(function respectReducedMotion() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    document.documentElement.style.setProperty('--transition', '0s');
    $$('[data-aos]').forEach((el) => {
      el.classList.add('aos-animate');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
})();

/* ========== LAZY LOAD IMAGES ========== */
(function initLazyImages() {
  const images = $$('img[loading="lazy"]');
  if (!images.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => observer.observe(img));
})();

/* ========== SECTION REVEAL ========== */
(function initSectionReveal() {
  const sections = $$('.section');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 }
  );

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    } else {
      section.style.opacity = '0';
      section.style.transform = 'translateY(16px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    }
  });
})();

/* ========== PAGE LOAD ========== */
window.addEventListener('load', () => {
  document.body.classList.add('loaded');

  $$('[data-aos]').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      const delay = parseInt(el.dataset.aosDelay || 0, 10);
      setTimeout(() => el.classList.add('aos-animate'), delay);
    }
  });
});

console.log('%c🚀 SoftWise Solutions', 'color:#1565C0;font-size:1.2rem;font-weight:bold;');
console.log('%cSmart Software. Real Results. | info@softwise.co.za | +27 73 522 4964', 'color:#42A5F5;font-size:0.85rem;');
