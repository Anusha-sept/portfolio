/**
 * ANUSHA M CHALAGERI — AWWWARDS-CALIBER PORTFOLIO
 * Principal Creative Motion & Interaction Engine
 * Vanilla JS • Zero External Dependencies • 60fps Physics
 */

(function () {
    'use strict';

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ==========================================================================
       1. AMBIENT PARTICLES & CONSTELLATION CANVAS
       ========================================================================== */
    const canvas = document.getElementById('ambient-canvas');
    let ctx = null;
    let particles = [];
    let animationFrameId = null;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let mousePosition = { x: -1000, y: -1000 };

    if (canvas && !prefersReducedMotion) {
        ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.45;
                this.vy = (Math.random() - 0.5) * 0.45;
                this.radius = Math.random() * 1.8 + 0.6;
                this.alpha = Math.random() * 0.45 + 0.15;
                this.color = Math.random() > 0.4 ? '#e879f9' : (Math.random() > 0.5 ? '#9333ea' : '#38bdf8');
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Screen Wrap
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Mouse Repulsion / Influence
                const dx = mousePosition.x - this.x;
                const dy = mousePosition.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.shadowBlur = 8;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function initParticles() {
            particles = [];
            // Particle density scaled to screen resolution
            const count = Math.min(Math.floor((canvas.width * canvas.height) / 26000), 55);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            const maxDistance = 110;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const alpha = (1 - dist / maxDistance) * 0.18;
                        ctx.strokeStyle = '#e879f9';
                        ctx.globalAlpha = alpha;
                        ctx.lineWidth = 0.65;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        }

        function renderCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.update();
                p.draw();
            });
            connectParticles();
            animationFrameId = requestAnimationFrame(renderCanvas);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        renderCanvas();

        // Pause animation when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                renderCanvas();
            }
        });
    }

    /* ==========================================================================
       2. DUAL-LAYER CUSTOM CURSOR WITH LERP PHYSICS
       ========================================================================== */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    let ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    if (!isTouchDevice && cursorDot && cursorRing) {
        window.addEventListener('mousemove', (e) => {
            mousePos.x = e.clientX;
            mousePos.y = e.clientY;
            mousePosition.x = e.clientX;
            mousePosition.y = e.clientY;

            // Direct move for crisp central dot
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        });

        // Smooth trailing loop for ambient ring
        function animateCursorRing() {
            const ease = 0.18;
            ringPos.x += (mousePos.x - ringPos.x) * ease;
            ringPos.y += (mousePos.y - ringPos.y) * ease;

            cursorRing.style.left = `${ringPos.x}px`;
            cursorRing.style.top = `${ringPos.y}px`;

            requestAnimationFrame(animateCursorRing);
        }
        animateCursorRing();

        // Hover expansions for all clickable and interactive surfaces
        const hoverTargets = document.querySelectorAll(
            'a, button, .tilt-card, .gallery-photo-frame, .proof-card, .art-card, .skill-pill, .status-pill, video'
        );

        hoverTargets.forEach((target) => {
            target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    /* ==========================================================================
       3. SCROLL PROGRESS READING BAR
       ========================================================================== */
    const progressBar = document.getElementById('scroll-progress');
    function updateScrollProgress() {
        if (!progressBar) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) return;
        const scrolled = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${Math.min(scrolled, 100)}%`;
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    /* ==========================================================================
       4. ACTIVE SECTION NAVBAR SPY
       ========================================================================== */
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateNavSpy() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 250;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active-nav');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active-nav');
            }
        });
    }
    window.addEventListener('scroll', updateNavSpy, { passive: true });
    updateNavSpy();

    /* ==========================================================================
       5. INTERACTIVE 3D CARD TILT & RADIAL SPOTLIGHT
       ========================================================================== */
    const spotlightCards = document.querySelectorAll('.tilt-card');

    spotlightCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update CSS Custom Properties for dynamic radial spotlight
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            if (prefersReducedMotion || isTouchDevice) return;

            // 3D Perspective Tilt Physics
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const maxRotate = 4.5; // degrees

            const rotateX = ((y - centerY) / centerY) * -maxRotate;
            const rotateY = ((x - centerX) / centerX) * maxRotate;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        });

        card.addEventListener('mouseleave', () => {
            if (prefersReducedMotion || isTouchDevice) return;
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    /* ==========================================================================
       6. MAGNETIC BUTTONS (SPRING TRANSLATION ON HOVER)
       ========================================================================== */
    if (!isTouchDevice && !prefersReducedMotion) {
        const magneticElements = document.querySelectorAll('.magnetic-target');

        magneticElements.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);

                const pullFactor = 0.28;
                el.style.transform = `translate(${x * pullFactor}px, ${y * pullFactor}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    /* ==========================================================================
       7. SCROLL REVEAL OBSERVER WITH STAGGER
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach((el) => revealObserver.observe(el));

    /* ==========================================================================
       8. ANIMATED STATS NUMBER COUNT-UP
       ========================================================================== */
    const counterElements = document.querySelectorAll('.counter');
    let countersStarted = false;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const targetEl = entry.target;
                const targetValue = parseFloat(targetEl.getAttribute('data-target'));
                animateValue(targetEl, 0, targetValue, 1600);
                observer.unobserve(targetEl);
            }
        });
    }, { threshold: 0.4 });

    function animateValue(element, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // EaseOutCubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * (end - start) + start);
            element.textContent = current;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = end;
            }
        };
        window.requestAnimationFrame(step);
    }

    counterElements.forEach((el) => counterObserver.observe(el));

    /* ==========================================================================
       9. RESPONSIVE MOBILE DRAWER
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const drawerClose = document.getElementById('drawer-close');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    drawerLinks.forEach((link) => {
        link.addEventListener('click', closeDrawer);
    });

    /* ==========================================================================
       10. UNIVERSAL INTERACTIVE LIGHTBOX & ALBUM NAVIGATION
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');

    // Registry of all inspectable visual items across the portfolio
    const mediaRegistry = [
        { src: 'images/skillsync_1.jpg', caption: 'SkillSync Nexus – Peer-to-Peer Skill Exchange Dashboard' },
        { src: 'images/skillsync_2.jpg', caption: 'SkillSync Nexus – Live WebRTC Video & Multilingual Subtitles' },
        { src: 'images/skillsync_3.jpg', caption: 'SkillSync Nexus – Smart Scheduling & Credit Wallet' },
        { src: 'images/cert_technova.jpg', caption: '2nd Prize – Event Horizon (AI Prompt Engineering), Tech Nova 2026' },
        { src: 'images/leadership_iic.jpg', caption: 'IIC Secretary – KLE JT BCA College, Gadag' },
        { src: 'images/cert_ballari.jpg', caption: '3rd Prize – Chakravyuha 2.0 (Tech Spectra), BITM Ballari' },
        { src: 'images/mandala1.jpg', caption: 'Intricate Ink Mandala – Fine-liner pen on paper' },
        { src: 'images/calligraphy1.jpg', caption: 'Custom Ink Calligraphy – Hand-lettered layout design' },
        { src: 'images/sketch1.jpg', caption: 'Detailed Pencil Sketch – Graphite & shading study' }
    ];

    let currentMediaIndex = 0;

    window.openLightbox = function (imageSrc, captionText) {
        if (!lightbox || !lightboxImg) return;

        // Find index in registry, or add dynamically
        let foundIdx = mediaRegistry.findIndex((item) => item.src === imageSrc);
        if (foundIdx === -1) {
            mediaRegistry.push({ src: imageSrc, caption: captionText });
            foundIdx = mediaRegistry.length - 1;
        }

        currentMediaIndex = foundIdx;
        renderLightboxItem();

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function () {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    window.navigateLightbox = function (direction) {
        currentMediaIndex += direction;
        if (currentMediaIndex < 0) currentMediaIndex = mediaRegistry.length - 1;
        if (currentMediaIndex >= mediaRegistry.length) currentMediaIndex = 0;
        renderLightboxItem();
    };

    function renderLightboxItem() {
        const item = mediaRegistry[currentMediaIndex];
        if (!item) return;

        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.96)';

        setTimeout(() => {
            lightboxImg.src = item.src;
            lightboxCaption.textContent = item.caption;
            if (lightboxCounter) {
                lightboxCounter.textContent = `${currentMediaIndex + 1} / ${mediaRegistry.length}`;
            }
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 120);
    }

    // Keyboard controls (Escape, ArrowLeft, ArrowRight)
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            navigateLightbox(1);
        }
    });

    console.log(
        '%c Anusha M Chalageri %c Portfolio elevated into Cyber-Royal Obsidian & Luminous Violet ',
        'background: #9333ea; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        'background: #05020a; color: #e879f9; padding: 4px 8px; border-radius: 4px;'
    );
})();
