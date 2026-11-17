/**
 * ANUSHA M CHALAGERI — EXECUTIVE CREATIVE PORTFOLIO
 * Principal Creative Motion & Interaction Engine
 * Palette: Nocturne Obsidian Slate & Astral Champagne
 * Vanilla JS • Zero External Dependencies • 60fps Hardware-Accelerated Physics
 */

(function () {
    'use strict';

    // Mark JS ready on document element to enable choreographed reveal states
    document.documentElement.classList.add('js-ready');

    // Check user accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    /* ==========================================================================
       0. CINEMATIC "PORTFOLIO" KEYNOTE INTRO & PAGE LANDING ENGINE
       ========================================================================== */
    const introCurtain = document.getElementById('intro-curtain');
    const introCounter = document.getElementById('intro-counter');
    const introProgressBar = document.getElementById('intro-progress-bar');
    let introFinished = false;

    function finishIntroAndLandPage() {
        if (introFinished) return;
        introFinished = true;

        // Always return to top before releasing overflow (prevents scroll-jump)
        window.scrollTo(0, 0);

        if (introCurtain) {
            introCurtain.classList.add('curtain-lift');
            setTimeout(() => {
                introCurtain.style.display = 'none';
            }, 950);
        }

        // Release overflow AFTER scroll-to-top is applied
        document.body.style.overflow = '';

        // Trigger page landing sequence — hero CSS animations fire from here
        document.body.classList.add('page-landed');

        // Dispatch a custom event so later-registered listeners can react
        // (fixes the updateNavSpy reference-before-definition bug)
        setTimeout(() => {
            document.dispatchEvent(new Event('page-landed'));
        }, 400);

        // Register scroll-triggered section observer AFTER curtain finishes lifting
        // (prevents premature firing while body still had overflow:hidden)
        setTimeout(initSectionObserver, 900);
    }

    if (prefersReducedMotion || !introCurtain) {
        if (introCurtain) introCurtain.style.display = 'none';
        document.body.classList.add('page-landed');
        document.body.style.overflow = '';
        // Fire immediately — no curtain delay needed
        setTimeout(() => {
            document.dispatchEvent(new Event('page-landed'));
            initSectionObserver();
        }, 100);
    } else {
        document.body.style.overflow = 'hidden';

        // Count up from 0% to 100%
        const totalDuration = 900; // ms (reduced from 1200ms for snappier feel)
        const startTime = performance.now();

        function stepIntroProgress(now) {
            if (introFinished) return;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
            
            // EaseOutQuad
            const eased = 1 - (1 - progress) * (1 - progress);
            const currentCount = Math.floor(eased * 100);

            if (introCounter) {
                introCounter.textContent = `${String(currentCount).padStart(2, '0')}%`;
            }
            if (introProgressBar) {
                introProgressBar.style.width = `${currentCount}%`;
            }

            if (progress < 1) {
                requestAnimationFrame(stepIntroProgress);
            } else {
                if (introCounter) introCounter.textContent = '100%';
                if (introProgressBar) introProgressBar.style.width = '100%';
                // Do NOT auto-dismiss — wait for user click or keypress
                // Make the skip hint more visible once loading is done
                const skipHint = document.querySelector('.intro-skip-hint');
                if (skipHint) {
                    skipHint.style.opacity = '1';
                    skipHint.style.animation = 'none';
                    skipHint.textContent = 'Click anywhere to enter →';
                }
                const introStatus = document.querySelector('.intro-status');
                if (introStatus) {
                    introStatus.innerHTML = '<span class="intro-status-pulse"></span> READY';
                }
            }
        }

        requestAnimationFrame(stepIntroProgress);

        // Click or keydown anywhere to skip and land immediately
        introCurtain.addEventListener('click', finishIntroAndLandPage);
        window.addEventListener('keydown', (e) => {
            if (!introFinished && (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape')) {
                finishIntroAndLandPage();
            }
        });
    }

    /* ==========================================================================
       1. AMBIENT PARTICLES & CONSTELLATION CANVAS
       ========================================================================== */
    const canvas = document.getElementById('ambient-canvas');
    let ctx = null;
    let particles = [];
    let animationFrameId = null;
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
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.6 + 0.6;
                this.alpha = Math.random() * 0.45 + 0.15;
                
                // Astral Champagne, Warm Amber & Ice Frost Palette
                const rand = Math.random();
                if (rand > 0.5) {
                    this.color = '#f3d098'; // Astral Champagne
                } else if (rand > 0.25) {
                    this.color = '#e5973b'; // Warm Amber
                } else if (rand > 0.1) {
                    this.color = '#38bdf8'; // Cerulean Frost
                } else {
                    this.color = '#cbd5e1'; // Warm Titanium
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Screen Wrap
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;

                // Gentle Cursor Repulsion / Flow
                const dx = mousePosition.x - this.x;
                const dy = mousePosition.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    const force = (130 - dist) / 130;
                    this.x -= (dx / dist) * force * 1.8;
                    this.y -= (dy / dist) * force * 1.8;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.shadowBlur = 6;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function initParticles() {
            particles = [];
            const count = Math.min(Math.floor((canvas.width * canvas.height) / 28000), 52);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            const maxDistance = 115;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDistance) {
                        const alpha = (1 - dist / maxDistance) * 0.14;
                        ctx.strokeStyle = `rgba(243, 208, 152, ${alpha})`;
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

            // Direct 1:1 position for focal central dot
            cursorDot.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
        });

        // Smooth trailing loop for ambient halo ring
        function animateCursorRing() {
            const ease = 0.18;
            ringPos.x += (mousePos.x - ringPos.x) * ease;
            ringPos.y += (mousePos.y - ringPos.y) * ease;

            cursorRing.style.left = `${ringPos.x}px`;
            cursorRing.style.top = `${ringPos.y}px`;

            requestAnimationFrame(animateCursorRing);
        }
        animateCursorRing();

        // Hover expansions for clickable and interactive surfaces
        const hoverTargets = document.querySelectorAll(
            'a, button, .tilt-card, .gallery-photo-frame, .proof-card, .art-card, .skill-pill, .status-pill, video, .marquee-item'
        );

        hoverTargets.forEach((target) => {
            target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    /* ==========================================================================
       3. SCROLL PROGRESS INDICATOR
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
       4. SLIDING NAV INDICATOR PILL & ACTIVE SECTION NAVBAR SPY
       ========================================================================== */
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navIndicator = document.getElementById('nav-indicator-pill');
    const navLinksContainer = document.querySelector('.nav-links');

    function positionIndicator(linkEl) {
        if (!navIndicator || !linkEl || !navLinksContainer) return;
        const containerRect = navLinksContainer.getBoundingClientRect();
        const linkRect = linkEl.getBoundingClientRect();

        const offsetLeft = linkRect.left - containerRect.left;
        const width = linkRect.width;

        navIndicator.style.transform = `translate(${offsetLeft}px, -50%)`;
        navIndicator.style.width = `${width}px`;
        navIndicator.style.opacity = '1';
    }

    function hideIndicator() {
        if (!navIndicator) return;
        const activeLink = document.querySelector('.nav-link.active-nav');
        if (activeLink) {
            positionIndicator(activeLink);
        } else {
            navIndicator.style.opacity = '0';
        }
    }

    function updateNavSpy() {
        let currentSection = '';
        const scrollPosition = window.scrollY + 260;

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSection = section.getAttribute('id');
            }
        });

        let currentActiveLink = null;
        navLinks.forEach((link) => {
            link.classList.remove('active-nav');
            if (link.getAttribute('data-section') === currentSection) {
                link.classList.add('active-nav');
                currentActiveLink = link;
            }
        });

        if (currentActiveLink) {
            positionIndicator(currentActiveLink);
        } else if (window.scrollY < 200) {
            if (navIndicator) navIndicator.style.opacity = '0';
        }
    }

    // Hover glide across nav links
    navLinks.forEach((link) => {
        link.addEventListener('mouseenter', () => positionIndicator(link));
    });
    if (navLinksContainer) {
        navLinksContainer.addEventListener('mouseleave', hideIndicator);
    }

    window.addEventListener('scroll', updateNavSpy, { passive: true });
    window.addEventListener('resize', updateNavSpy);
    // Listen for page-landed event (fired from finishIntroAndLandPage)
    document.addEventListener('page-landed', () => {
        setTimeout(updateNavSpy, 150);
    });
    // Initial position on load
    setTimeout(updateNavSpy, 250);

    /* ==========================================================================
       5. INTERACTIVE 3D CARD TILT & RADIAL SPOTLIGHT
       ========================================================================== */
    const spotlightCards = document.querySelectorAll('.tilt-card');

    spotlightCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set CSS Custom Properties for cursor-following radial spotlight
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            if (prefersReducedMotion || isTouchDevice) return;

            // Subtle 3D perspective tilt
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const maxRotate = 4.0; // degrees

            const rotateX = ((y - centerY) / centerY) * -maxRotate;
            const rotateY = ((x - centerX) / centerX) * maxRotate;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
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

                const pullFactor = 0.26;
                el.style.transform = `translate(${x * pullFactor}px, ${y * pullFactor}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    /* ==========================================================================
       7. DIRECTIONAL SCROLL-TRIGGERED SLIDINGS (INTERSECTION OBSERVER)
       - Section Header slides from left (translateX(-32px) to 0)
       - Cards cascade with 90ms stagger (--card-stagger)
       - Inner elements glide in with 50ms micro-stagger (--pill-stagger)
       ========================================================================== */

    function initSectionObserver() {
        const observableSections = document.querySelectorAll('section.section, footer.footer');

        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    section.classList.add('section-active');

                    // Content cards staggered upward sliding (90ms cascade stagger)
                    const cards = section.querySelectorAll(
                        '.experience-card, .bento-large, .bento-stat, .bento-wide, .skill-box, .project-card, .timeline-card, .art-card, .footer-cta-card'
                    );
                    cards.forEach((card, cardIndex) => {
                        card.style.setProperty('--card-stagger', `${(cardIndex * 0.09).toFixed(2)}s`);

                        // Inner element glide-in (50ms micro-stagger)
                        const microElements = card.querySelectorAll(
                            '.tech-tag, .tech-pill, .skill-pill, .kpi-pill, .trait-chip, .icon-link, .zoom-tag, .inspect-btn'
                        );
                        microElements.forEach((el, pillIndex) => {
                            el.style.setProperty('--pill-stagger', `${(pillIndex * 0.05).toFixed(2)}s`);
                        });
                    });

                    observer.unobserve(section);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.08
        });

        observableSections.forEach((sec) => sectionObserver.observe(sec));

        // Immediately activate any section already in the viewport after landing
        observableSections.forEach((sec) => {
            const rect = sec.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                sectionObserver.unobserve(sec);
                sec.classList.add('section-active');
                const cards = sec.querySelectorAll(
                    '.experience-card, .bento-large, .bento-stat, .bento-wide, .skill-box, .project-card, .timeline-card, .art-card, .footer-cta-card'
                );
                cards.forEach((card, cardIndex) => {
                    card.style.setProperty('--card-stagger', `${(cardIndex * 0.09).toFixed(2)}s`);
                    const microElements = card.querySelectorAll(
                        '.tech-tag, .tech-pill, .skill-pill, .kpi-pill, .trait-chip, .icon-link, .zoom-tag, .inspect-btn'
                    );
                    microElements.forEach((el, pillIndex) => {
                        el.style.setProperty('--pill-stagger', `${(pillIndex * 0.05).toFixed(2)}s`);
                    });
                });
            }
        });
    }

    // initSectionObserver() is called from finishIntroAndLandPage() after curtain lifts.
    // For reduced-motion / no-curtain path, call it immediately below.


    /* Legacy .reveal observer support */
    const legacyReveals = document.querySelectorAll('.reveal');
    const legacyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    legacyReveals.forEach((el) => legacyObserver.observe(el));

    /* ==========================================================================
       8. ANIMATED STATS NUMBER COUNT-UP
       ========================================================================== */
    const counterElements = document.querySelectorAll('.counter');

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const targetEl = entry.target;
                const targetValue = parseFloat(targetEl.getAttribute('data-target'));
                animateValue(targetEl, 0, targetValue, 1500);
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
       10. UNIVERSAL INTERACTIVE LIGHTBOX WITH SLIDE-ZOOM ANIMATION
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

        // Ensure transition is set for the slide-zoom effect
        lightboxImg.style.transition = 'opacity 0.28s var(--ease-editorial, cubic-bezier(0.16,1,0.3,1)), transform 0.28s var(--ease-editorial, cubic-bezier(0.16,1,0.3,1))';

        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.94) translateY(12px)';

        setTimeout(() => {
            lightboxImg.src = item.src;
            lightboxCaption.textContent = item.caption;
            if (lightboxCounter) {
                lightboxCounter.textContent = `${currentMediaIndex + 1} / ${mediaRegistry.length}`;
            }
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1) translateY(0)';
        }, 110);
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

    // Console Signature
    console.log(
        '%c Anusha M Chalageri %c Engineered in Nocturne Obsidian & Astral Champagne ',
        'background: #f3d098; color: #07080b; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-family: monospace;',
        'background: #07080b; color: #f3d098; border: 1px solid #f3d098; padding: 4px 8px; border-radius: 4px; font-family: monospace;'
    );
})();
