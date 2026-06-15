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
            if (!mobileQuery.matches && item.classList.contains('header__menu-item--features')) {
                closeAllDropdowns();
                return;
            }

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

    const VERIFYING_DURATION = 1600;
    let isVerifying = false;

    const showVerifiedState = () => {
        if (isVerifying) return;
        isVerifying = true;
        checkbox.checked = true;

        // Show the in-progress animation (progress ring + "Verifying...")
        // before switching to the verified widget, like the real widget does.
        defaultCaptcha.classList.add('hero__captcha--verifying');

        window.setTimeout(() => {
            hero.classList.add('hero--captcha-verified');
        }, VERIFYING_DURATION);
    };

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) showVerifiedState();
    });

    checkbox.closest('.pc-interactive-area')?.addEventListener('click', showVerifiedState);
}

const CAPTCHA_VERIFYING_DURATION = 1600;

function initTryCaptcha() {
    document.querySelectorAll('.try-captcha .pc-captcha-widget').forEach((widget) => {
        const checkbox = widget.querySelector('.pc-interactive-area input[type="checkbox"]');
        if (!checkbox) return;

        let isVerifying = false;

        const showVerifyingState = () => {
            if (isVerifying) return;
            isVerifying = true;
            checkbox.checked = true;
            widget.classList.add('is-verifying');

            window.setTimeout(() => {
                widget.classList.remove('is-verifying');
                widget.classList.add('is-verified');
            }, CAPTCHA_VERIFYING_DURATION);
        };

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) showVerifyingState();
        });

        checkbox.closest('.pc-interactive-area')?.addEventListener('click', showVerifyingState);
    });
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

function initPriceSelectDropdown() {
    const selects = document.querySelectorAll('[data-price-select]');
    if (!selects.length) return;

    const labelSuffix = 'requests / mo';

    const renderLabel = (container, label) => {
        const number = document.createElement('span');
        const unit = document.createElement('span');
        const trimmedLabel = label.trim();
        const hasSuffix = trimmedLabel.endsWith(labelSuffix);

        number.className = 'price__select-number';
        number.textContent = hasSuffix
            ? trimmedLabel.slice(0, -labelSuffix.length).trim()
            : trimmedLabel;

        unit.className = 'price__select-unit';
        unit.textContent = hasSuffix ? labelSuffix : '';

        container.replaceChildren(number);
        if (unit.textContent) container.append(unit);
    };

    selects.forEach((wrapper, selectIndex) => {
        const nativeSelect = wrapper.querySelector('[data-price-requests]');
        const toggle = wrapper.querySelector('[data-price-select-toggle]');
        const value = wrapper.querySelector('[data-price-select-value]');
        const list = wrapper.querySelector('[data-price-select-list]');
        if (!nativeSelect || !toggle || !value || !list) return;

        const options = Array.from(nativeSelect.options);
        const listId = list.id || `price-requests-list-${selectIndex + 1}`;
        let optionItems = [];
        let activeIndex = nativeSelect.selectedIndex;

        list.id = listId;
        toggle.setAttribute('aria-controls', listId);

        const updateActiveOption = (index) => {
            activeIndex = Math.max(0, Math.min(index, optionItems.length - 1));

            optionItems.forEach((item, itemIndex) => {
                item.classList.toggle('is-active', itemIndex === activeIndex);
            });
        };

        const clearActiveOption = () => {
            optionItems.forEach((item) => {
                item.classList.remove('is-active');
            });

            activeIndex = nativeSelect.selectedIndex;
            toggle.removeAttribute('aria-activedescendant');
        };

        const closeDropdown = () => {
            wrapper.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            clearActiveOption();
        };

        const focusOption = (index) => {
            if (!optionItems.length) return;

            updateActiveOption(index);
            const activeOption = optionItems[activeIndex];
            toggle.setAttribute('aria-activedescendant', activeOption.id);
            activeOption.focus({ preventScroll: true });
        };

        const openDropdown = (shouldFocusSelected = false) => {
            wrapper.classList.add('is-open');
            toggle.setAttribute('aria-expanded', 'true');

            if (shouldFocusSelected) {
                focusOption(nativeSelect.selectedIndex);
                return;
            }

            clearActiveOption();
        };

        const setDropdownOpen = (shouldOpen) => {
            if (shouldOpen) {
                openDropdown();
                return;
            }

            closeDropdown();
        };

        const updateSelection = () => {
            const selectedIndex = nativeSelect.selectedIndex;
            const selectedOption = nativeSelect.options[selectedIndex];
            if (!selectedOption) return;

            renderLabel(value, selectedOption.textContent);

            optionItems.forEach((item, itemIndex) => {
                const isSelected = itemIndex === selectedIndex;

                item.classList.toggle('is-selected', isSelected);
                item.setAttribute('aria-selected', String(isSelected));
            });

            clearActiveOption();
        };

        const selectOption = (index) => {
            nativeSelect.selectedIndex = index;
            nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            updateSelection();
            closeDropdown();
            toggle.focus({ preventScroll: true });
        };

        list.replaceChildren();

        optionItems = options.map((option, optionIndex) => {
            const item = document.createElement('li');
            const itemText = document.createElement('span');

            item.id = `${listId}-option-${optionIndex + 1}`;
            item.className = 'price__select-option';
            item.dataset.value = option.value;
            item.role = 'option';
            item.tabIndex = -1;

            itemText.className = 'price__select-option-text';
            renderLabel(itemText, option.textContent);
            item.append(itemText);

            item.addEventListener('mouseenter', clearActiveOption);
            item.addEventListener('click', () => selectOption(optionIndex));
            item.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusOption(activeIndex + 1);
                    return;
                }

                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    focusOption(activeIndex - 1);
                    return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectOption(activeIndex);
                    return;
                }

                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeDropdown();
                    toggle.focus({ preventScroll: true });
                }
            });

            list.append(item);
            return item;
        });

        toggle.addEventListener('click', () => {
            setDropdownOpen(!wrapper.classList.contains('is-open'));
        });

        toggle.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                openDropdown(true);
                return;
            }

            if (event.key === 'Escape') {
                closeDropdown();
            }
        });

        nativeSelect.addEventListener('change', updateSelection);

        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) closeDropdown();
        });

        updateSelection();
    });
}

function initPriceToggle() {
    const section = document.querySelector('[data-price-section]');
    if (!section) return;

    const toggle = section.querySelector('[data-price-toggle]');
    const requestsSelect = section.querySelector('[data-price-requests]');
    const value = section.querySelector('[data-price-value]');
    const billed = section.querySelector('[data-price-billed]');
    const billingLabels = section.querySelectorAll('.price__billing-label');
    const discount = section.querySelector('.price__discount');
    if (!toggle || !requestsSelect || !value || !billed) return;

    const calculateMonthlyPrice = (annualPrice) => Math.ceil(annualPrice / 0.7);

    const updatePrice = () => {
        const isAnnual = toggle.checked;
        const selectedOption = requestsSelect.options[requestsSelect.selectedIndex];
        const annualPrice = Number(selectedOption.dataset.annualPrice);
        const monthlyPrice = calculateMonthlyPrice(annualPrice);
        const displayedPrice = isAnnual ? annualPrice : monthlyPrice;
        const yearlyTotal = annualPrice * 12;

        value.textContent = String(displayedPrice);
        billed.textContent = isAnnual ? `\u20ac${yearlyTotal} billed yearly` : 'billed monthly';

        billingLabels.forEach((label) => {
            const shouldBeActive = isAnnual
                ? label.textContent.trim() === 'Annually'
                : label.textContent.trim() === 'Monthly';

            label.classList.toggle('price__billing-label--active', shouldBeActive);
        });

        discount?.classList.toggle('price__discount--muted', !isAnnual);
    };

    toggle.addEventListener('change', updatePrice);
    requestsSelect.addEventListener('change', updatePrice);
    updatePrice();
}

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initHeaderDropdowns();
    initHeaderMobileMenu();
    initHeroCaptcha();
    initTryCaptcha();
    initLazyDotLottie();
    initFaq();
    initChoosePrivateSlider();
    initPriceSelectDropdown();
    initPriceToggle();
});
