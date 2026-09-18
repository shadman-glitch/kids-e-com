/**
 * MINIKIN STUDIO — Cinematic Motion & Interaction System
 * Incorporates: GSAP 3, ScrollTrigger, Lenis Smooth Scroll, 3D Card Tilt, and Confetti
 */

document.addEventListener('DOMContentLoaded', () => {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 1. Lenis Smooth Scrolling Synchronized with GSAP Ticker
  // =========================================================================
  let lenis = null;

  if (!isReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }
  }

  // =========================================================================
  // 2. Custom Interactive Cursor Follower
  // =========================================================================
  const cursor = document.getElementById('custom-cursor');
  if (cursor && !isReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.classList.add('active');
    });

    const updateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(updateCursor);
    };
    requestAnimationFrame(updateCursor);

    // Interactive target expansion
    document.querySelectorAll('a, button, .product-card, .filter-btn').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // =========================================================================
  // 3. Hero Entrance Choreography (GSAP)
  // =========================================================================
  if (typeof gsap !== 'undefined') {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });

    // Split text reveal for hero heading
    const titleWords = document.querySelectorAll('.hero-title .word-span');
    if (titleWords.length > 0) {
      heroTl
        .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6 })
        .to(titleWords, {
          opacity: 1,
          y: 0,
          stagger: 0.045,
          duration: 0.75,
        }, '-=0.3')
        .fromTo('.hero-description', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .fromTo('.hero-cta-group', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo('.hero-stats', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3')
        .fromTo('.hero-visual', { opacity: 0, scale: 0.96, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: 'power4.out' }, '-=0.9');
    }

    // ScrollTrigger reveals for sections
    if (typeof ScrollTrigger !== 'undefined' && !isReducedMotion) {
      gsap.utils.toArray('[data-reveal]').forEach((elem) => {
        gsap.fromTo(elem, 
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: elem,
              start: 'top 85%',
              toggleActions: 'play none none none',
            }
          }
        );
      });
    }
  }

  // =========================================================================
  // 4. Interactive 3D Perspective Tilt on Cards
  // =========================================================================
  if (!isReducedMotion) {
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.product-card:hover');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // Max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });
    });

    document.querySelectorAll('.product-card').forEach((card) => {
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // =========================================================================
  // 5. Celebration Confetti Burst (Add to Bag celebration)
  // =========================================================================
  window.triggerCelebration = (x, y) => {
    if (isReducedMotion) return;

    const colors = ['#E0694F', '#E09F3E', '#5F8569', '#4A8EA0', '#8E7DBE', '#FFD166'];
    const particleCount = 28;

    for (let i = 0; i < particleCount; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 6;

      p.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size * (Math.random() > 0.5 ? 1 : 1.6)}px;
        background-color: ${color};
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        pointer-events: none;
        z-index: 9999;
      `;

      document.body.appendChild(p);

      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() * 0.4 - 0.2);
      const velocity = Math.random() * 80 + 50;
      const targetX = Math.cos(angle) * velocity;
      const targetY = Math.sin(angle) * velocity + 40; // Slight gravity

      if (typeof gsap !== 'undefined') {
        gsap.to(p, {
          x: targetX,
          y: targetY,
          rotation: Math.random() * 360,
          opacity: 0,
          scale: 0.4,
          duration: Math.random() * 0.6 + 0.6,
          ease: 'power2.out',
          onComplete: () => p.remove(),
        });
      } else {
        setTimeout(() => p.remove(), 700);
      }
    }
  };
});
