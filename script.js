/* ============================================================
   ZULFIQAR — PORTFOLIO SCRIPT
   Handles: cursor glow, glass tilt, magnetic buttons,
   sticky nav, mobile menu, scroll reveal, copy-to-clipboard,
   and the contact form fallback.
   ------------------------------------------------------------
   Everything checks `prefersReducedMotion` before running any
   mouse-driven animation, per the brief.
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const useMouseFx = !prefersReducedMotion && !isTouch;

/* ---------- Sticky / glassy nav on scroll ---------- */
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Mobile menu toggle ---------- */
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

/* ---------- Cursor-driven effects (desktop only) ---------- */
if (useMouseFx) {
  const glow = document.getElementById('cursor-glow');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX, glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  /* Smoothly ease the glow toward the cursor each frame — this is what
     gives the "sophisticated, not jumpy" feel the brief asks for. */
  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    if (glow) glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%,-50%)`;
    requestAnimationFrame(animateGlow);
  }
  requestAnimationFrame(animateGlow);

  /* Glass reflection sheen: set --mx/--my per-card so .glass::after
     radial-gradient follows the cursor within that specific card. */
  const glassEls = document.querySelectorAll('.glass');
  glassEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* Subtle 3D tilt for browser-frames and build/work cards */
  const tiltEls = document.querySelectorAll('.tilt');
  tiltEls.forEach(el => {
    let raf = null;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const maxTilt = el.classList.contains('tilt-strong') ? 8 : 4;
        el.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) translateZ(0)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    });
  });

  /* Magnetic buttons — nudge slightly toward the cursor within the button */
  const magEls = document.querySelectorAll('.magnetic');
  magEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.28;
      const y = (e.clientY - r.top - r.height / 2) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });
}

/* ---------- Copy WhatsApp number to clipboard ---------- */
const copyBtn = document.getElementById('copy-number-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const number = copyBtn.dataset.number || '03043062683';
    const feedback = document.getElementById('copy-feedback');
    try {
      await navigator.clipboard.writeText(number);
    } catch (err) {
      /* Fallback for older browsers without Clipboard API */
      const tmp = document.createElement('textarea');
      tmp.value = number;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    }
    if (feedback) {
      feedback.classList.add('show');
      setTimeout(() => feedback.classList.remove('show'), 2200);
    }
  });
}

/* ---------- Contact form: mailto fallback ----------
   There's no backend on a static site, so this builds a mailto:
   link from the filled-in fields. Swap this for a Formspree
   `action` + `fetch` call once a backend is wired up. */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const type = contactForm.projectType.value;
    const message = contactForm.message.value.trim();
    const status = document.getElementById('form-status');

    if (!name || !email || !message) {
      if (status) status.textContent = 'Please fill in your name, email and message.';
      return;
    }

    const subject = encodeURIComponent(`Website inquiry from ${name} — ${type}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject type: ${type}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:hello@zulfiqar.dev?subject=${subject}&body=${body}`;
    if (status) status.textContent = 'Opening your email app to send this message…';
  });
}
