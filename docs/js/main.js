const mainScriptUrl = document.currentScript?.src || new URL('js/main.js', document.baseURI).href;

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const updateHeaderState = () => {
        header.classList.toggle('header--scrolled', window.scrollY > 0);
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function addMediaChangeListener(mediaQuery, callback) {
    if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', callback);
        return;
    }

    mediaQuery.addListener(callback);
}

function initHeaderDropdowns() {
    const header = document.querySelector('.header');
    if (!header) return;

    const menu = header.querySelector('.header__menu');
    const dropdownItems = header.querySelectorAll('.header__menu-item--has-dropdown');
    const mobileQuery = window.matchMedia('(max-width: 992px)');

    const closeDropdown = (item) => {
        const trigger = item.querySelector('.header__menu-link--dropdown');

        item.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        header.classList.remove('header--submenu-open');
        menu?.classList.remove('is-submenu-open');
    };

    const closeAllDropdowns = () => {
        dropdownItems.forEach(closeDropdown);
    };

    dropdownItems.forEach((item) => {
        const trigger = item.querySelector('.header__menu-link--dropdown');
        if (!trigger) return;

        trigger.addEventListener('click', (event) => {
            event.preventDefault();

            const isOpen = item.classList.contains('is-open');
            closeAllDropdowns();

            item.classList.toggle('is-open', !isOpen);
            trigger.setAttribute('aria-expanded', String(!isOpen));

            if (!isOpen && mobileQuery.matches) {
                header.classList.add('header--submenu-open');
                menu?.classList.add('is-submenu-open');
            }
        });

        const backButton = item.querySelector('.header__submenu-back');
        if (backButton) {
            backButton.addEventListener('click', () => {
                closeDropdown(item);
            });
        }
    });

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) closeAllDropdowns();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeAllDropdowns();
    });

    addMediaChangeListener(mobileQuery, closeAllDropdowns);
}

function initHeaderMobileMenu() {
    const header = document.querySelector('.header');
    if (!header) return;

    const toggle = header.querySelector('.header__toggle');
    const mobileQuery = window.matchMedia('(max-width: 992px)');
    if (!toggle) return;

    const dropdownItems = header.querySelectorAll('.header__menu-item--has-dropdown');

    const closeDropdowns = () => {
        dropdownItems.forEach((item) => {
            const trigger = item.querySelector('.header__menu-link--dropdown');

            item.classList.remove('is-open');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });

        header.classList.remove('header--submenu-open');
        header.querySelector('.header__menu')?.classList.remove('is-submenu-open');
    };

    const closeMenu = () => {
        header.classList.remove('header--menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('is-menu-open');
        closeDropdowns();
    };

    const openMenu = () => {
        header.classList.add('header--menu-open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('is-menu-open');
    };

    toggle.addEventListener('click', () => {
        if (header.classList.contains('header--menu-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    header.querySelectorAll('.header__dropdown-link, .header__menu-item:not(.header__menu-item--has-dropdown) .header__menu-link, .header__mobile-signup').forEach((link) => {
        link.addEventListener('click', () => {
            if (mobileQuery.matches) closeMenu();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    addMediaChangeListener(mobileQuery, () => {
        if (!mobileQuery.matches) closeMenu();
    });
}

function initHeroCaptcha() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const defaultCaptcha = hero.querySelector('.hero__captcha--defoult');
    const verifiedCaptcha = hero.querySelector('.hero__captcha--verified');
    const checkbox = defaultCaptcha?.querySelector('.pc-interactive-area input[type="checkbox"]');

    if (!defaultCaptcha || !verifiedCaptcha || !checkbox) return;

    const showVerifiedState = () => {
        checkbox.checked = true;
        hero.classList.add('hero--captcha-verified');
    };

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) showVerifiedState();
    });

    checkbox.closest('.pc-interactive-area')?.addEventListener('click', showVerifiedState);
}

function initLazyDotLottie() {
    const section = document.querySelector('.switch-comparison');
    const animations = document.querySelectorAll('dotlottie-player[data-src]');
    if (!section || !animations.length) return;

    const playerUrl = new URL('vendor/dotlottie-player/dotlottie-player.mjs', mainScriptUrl).href;
    let isLoaded = false;

    const loadAnimations = async () => {
        if (isLoaded) return;
        isLoaded = true;

        animations.forEach((animation) => {
            const src = animation.dataset.src;
            if (!src) return;

            animation.setAttribute('src', src);
            animation.removeAttribute('data-src');
        });

        try {
            await import(playerUrl);
        } catch (error) {
            isLoaded = false;
            // eslint-disable-next-line no-console
            console.error('Failed to load dotLottie player.', error);
        }
    };

    if (!('IntersectionObserver' in window)) {
        loadAnimations();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();
        loadAnimations();
    }, {
        rootMargin: '300px 0px'
    });

    observer.observe(section);
}

function initFaq() {
    const triggers = document.querySelectorAll('.faq__trigger');
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
        const answerId = trigger.getAttribute('aria-controls');
        const answer = answerId ? document.getElementById(answerId) : null;
        if (!answer) return;

        trigger.addEventListener('click', () => {
            const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

            trigger.setAttribute('aria-expanded', String(shouldOpen));
            answer.hidden = !shouldOpen;
        });
    });
}

function initChoosePrivateSlider() {
    const section = document.querySelector('[data-choose-private]');
    if (!section) return;

    const scroller = section.querySelector('[data-choose-scroller]');
    const slides = scroller ? Array.from(scroller.querySelectorAll('.choose-private__slide')) : [];
    const scrollerColumns = scroller ? Array.from(scroller.querySelectorAll('.choose-private__column')) : [];
    const dots = section.querySelectorAll('[data-choose-dot]');
    const prevButton = section.querySelector('[data-choose-prev]');
    const nextButton = section.querySelector('[data-choose-next]');
    const slidesCount = slides.length;
    let currentSlide = 0;
    let animationFrame = null;

    if (!scroller || !slidesCount || !prevButton || !nextButton) return;

    const equalizeColumnHeights = () => {
        scrollerColumns.forEach((column) => {
            column.style.minHeight = '';
        });

        if (!scroller.offsetParent) return;

        const maxHeight = scrollerColumns.reduce((height, column) => {
            return Math.max(height, column.offsetHeight);
        }, 0);

        scrollerColumns.forEach((column) => {
            column.style.minHeight = `${maxHeight}px`;
        });
    };

    const updateDots = () => {
        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === currentSlide;

            dot.classList.toggle('is-active', isActive);
            if (isActive) {
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.removeAttribute('aria-current');
            }
        });
    };

    const updateArrows = () => {
        prevButton.disabled = currentSlide === 0;
        nextButton.disabled = currentSlide === slidesCount - 1;
    };

    const updateControls = () => {
        updateDots();
        updateArrows();
    };

    const setSlide = (index, shouldScroll = true) => {
        currentSlide = Math.max(0, Math.min(index, slidesCount - 1));
        updateControls();

        if (!shouldScroll) return;

        scroller.scrollTo({
            left: slides[currentSlide].offsetLeft - slides[0].offsetLeft,
            behavior: 'smooth'
        });
    };

    const updateCurrentSlideFromScroll = () => {
        animationFrame = null;

        const closestSlide = slides.reduce((closest, slide, index) => {
            const slidePosition = slide.offsetLeft - slides[0].offsetLeft;
            const distance = Math.abs(slidePosition - scroller.scrollLeft);

            if (distance < closest.distance) {
                return { distance, index };
            }

            return closest;
        }, { distance: Number.POSITIVE_INFINITY, index: 0 });

        if (closestSlide.index !== currentSlide) {
            currentSlide = closestSlide.index;
            updateControls();
        }
    };

    prevButton.addEventListener('click', () => setSlide(currentSlide - 1));
    nextButton.addEventListener('click', () => setSlide(currentSlide + 1));

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = Number(dot.dataset.chooseDot);
            if (Number.isNaN(index)) return;

            setSlide(index);
        });
    });

    scroller.addEventListener('scroll', () => {
        if (animationFrame) return;

        animationFrame = window.requestAnimationFrame(updateCurrentSlideFromScroll);
    }, { passive: true });

    window.addEventListener('resize', () => {
        equalizeColumnHeights();
        setSlide(currentSlide, false);
    });

    window.addEventListener('load', equalizeColumnHeights);

    if (document.fonts) {
        document.fonts.ready.then(equalizeColumnHeights);
    }

    equalizeColumnHeights();
    updateControls();
}

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initHeaderDropdowns();
    initHeaderMobileMenu();
    initHeroCaptcha();
    initLazyDotLottie();
    initFaq();
    initChoosePrivateSlider();
});
