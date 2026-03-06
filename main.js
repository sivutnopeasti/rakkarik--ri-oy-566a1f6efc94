/* ===========================
   RAKKARIKÖÖRI OY – MAIN.JS
   =========================== */

'use strict';

/* ---- HEADER SCROLL ---- */
const siteHeader = document.getElementById('site-header');

window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ---- MOBILE MENU ---- */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');

function openMobileMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
});

mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

document.addEventListener('click', (e) => {
  if (!siteHeader.contains(e.target)) closeMobileMenu();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

/* ---- HERO TITLE CHAR ANIMATION ---- */
(function injectCharKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes charDrop {
      from { opacity: 0; transform: translateY(-30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

function animateHeroTitle() {
  const title = document.getElementById('hero-title');
  if (!title) return;

  const originalText = title.textContent;
  title.textContent = '';

  [...originalText].forEach((char, i) => {
    const span = document.createElement('span');
    span.classList.add('char');

    if (char === ' ') {
      span.classList.add('space');
      span.textContent = '\u00A0';
    } else {
      span.textContent = char;
    }

    span.style.opacity = '0';
    span.style.transform = 'translateY(-30px)';
    span.style.animation = `charDrop 0.5s ease forwards`;
    span.style.animationDelay = `${0.3 + i * 0.05}s`;

    title.appendChild(span);
  });
}

animateHeroTitle();

/* ---- SCROLL-IN OBSERVER ---- */
const scrollItems = document.querySelectorAll('.scroll-in');

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el    = entry.target;
    const delay = el.dataset.delay ? parseFloat(el.dataset.delay) * 0.08 : 0;

    setTimeout(() => {
      el.classList.add('visible');
    }, delay * 1000);

    scrollObserver.unobserve(el);
  });
}, { threshold: 0.12 });

scrollItems.forEach(el => scrollObserver.observe(el));

/* ---- STAT BARS – luvut_stats ---- */
const statBars = document.querySelectorAll('.stat-bar');

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const bar         = entry.target;
    const targetWidth = bar.dataset.width || '0';

    setTimeout(() => {
      bar.style.width = targetWidth + '%';
    }, 200);

    statObserver.unobserve(bar);
  });
}, { threshold: 0.4 });

statBars.forEach(bar => statObserver.observe(bar));

/* ---- CARD TILT – hover_kortit ---- */
function initCardTilt() {
  const tiltTargets = document.querySelectorAll(
    '.palvelu-card, .takuu-item, .kohde-card'
  );

  tiltTargets.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const cx      = rect.width  / 2;
      const cy      = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -8;
      const rotateY = ((x - cx) / cx) *  8;

      card.style.transform =
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
      card.style.transition = 'transform 0.08s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.35s ease, box-shadow 0.25s ease';
    });
  });
}

initCardTilt();

/* ---- SMOOTH SCROLL – ankkurilinkit ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href   = anchor.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const headerH = siteHeader.offsetHeight;
    const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ---- CONTACT FORM – lomake ---- */
const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');
const formError   = document.getElementById('form-error');

if (form && submitBtn) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    formSuccess.hidden = true;
    formError.hidden   = true;

    const name  = form.querySelector('#name')?.value.trim()  || '';
    const email = form.querySelector('#email')?.value.trim() || '';

    if (!name) {
      showFormError('Kirjoita nimesi.');
      form.querySelector('#name')?.focus();
      return;
    }
    if (!email || !email.includes('@')) {
      showFormError('Kirjoita kelvollinen sähköpostiosoite.');
      form.querySelector('#email')?.focus();
      return;
    }

    setLoadingState(true);

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      setLoadingState(false);

      if (response.ok) {
        setSuccessState();
        form.reset();
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        const data = await response.json().catch(() => ({}));
        const msg  = data?.errors?.map(err => err.message).join(', ')
                     || 'Lähetys epäonnistui. Kokeile uudelleen tai soita meille.';
        showFormError(msg);
      }
    } catch (_) {
      setLoadingState(false);
      showFormError('Verkkovirhe. Tarkista yhteytesi ja yritä uudelleen.');
    }
  });
}

function setLoadingState(loading) {
  if (!submitBtn) return;

  if (loading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function setSuccessState() {
  if (!submitBtn) return;
  submitBtn.classList.remove('loading');
  submitBtn.classList.add('success');
}

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.hidden = false;
  formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---- NAV ACTIVE STATE scrollatessa ---- */
const sections    = document.querySelectorAll('section[id]');
const navLinks    = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const id = entry.target.getAttribute('id');
    navLinks.forEach(link => {
      const matches = link.getAttribute('href') === `#${id}`;
      link.style.color = matches ? '#fff' : '';

      if (matches) {
        link.style.setProperty('--link-active', '1');
      } else {
        link.style.removeProperty('--link-active');
      }
    });
  });
}, {
  rootMargin: `-${72}px 0px -60% 0px`,
  threshold: 0
});

sections.forEach(section => navObserver.observe(section));