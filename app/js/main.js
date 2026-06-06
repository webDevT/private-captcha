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

        await import(playerUrl);

        animations.forEach((animation) => {
            const src = animation.dataset.src;
            if (!src) return;

            animation.setAttribute('src', src);
            animation.removeAttribute('data-src');
        });
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

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initHeaderDropdowns();
    initHeaderMobileMenu();
    initHeroCaptcha();
    initLazyDotLottie();
});
