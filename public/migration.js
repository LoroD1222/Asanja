(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function prepareLazyBackgrounds() {
    for (const container of document.querySelectorAll('.e-con.e-parent')) {
      container.classList.add('e-lazyloaded');
    }
  }

  function elementSettings(element) {
    try {
      return JSON.parse(element.dataset.settings || '{}');
    } catch {
      return {};
    }
  }

  function revealAnimatedElement(element, { reset = false } = {}) {
    const settings = elementSettings(element);
    const animation = settings._animation || settings.animation;
    if (!animation || reduceMotion) {
      element.classList.remove('elementor-invisible');
      return;
    }

    if (reset) {
      element.classList.remove('animated', animation);
      element.classList.add('elementor-invisible');
      element.style.removeProperty('animation-delay');
      return;
    }

    const delay = Number(settings._animation_delay ?? settings.animation_delay ?? 0);
    element.style.animationDelay = `${Number.isFinite(delay) ? delay : 0}ms`;
    element.classList.remove('elementor-invisible');
    element.classList.add('animated', animation);
  }

  function initializeEntranceAnimations() {
    const elements = [...document.querySelectorAll('.elementor-invisible')]
      .filter((element) => !element.closest('[data-elementor-type="popup"]'));

    if (!elements.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => revealAnimatedElement(element));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        revealAnimatedElement(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

    elements.forEach((element) => observer.observe(element));
  }

  function initializeMotionEffects() {
    const viewportDevice = () => (
      window.matchMedia('(max-width: 767px)').matches
        ? 'mobile'
        : window.matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop'
    );
    const effects = [];

    for (const element of document.querySelectorAll('[data-settings*="motion_fx"]')) {
      const settings = elementSettings(element);
      const devices = settings.motion_fx_devices || settings.background_motion_fx_devices || ['desktop', 'tablet', 'mobile'];

      if (settings.motion_fx_translateY_effect === 'yes') {
        effects.push({
          type: 'translateY',
          element,
          devices,
          speed: Number(settings.motion_fx_translateY_speed?.size || 4),
          range: settings.motion_fx_translateY_affectedRange?.sizes || { start: 0, end: 100 },
        });
        element.classList.add('elementor-motion-effects-element');
        element.style.setProperty('--e-transform-transition-duration', '100ms');
      }

      if (settings.background_motion_fx_scale_effect === 'yes') {
        let container = element.querySelector(':scope > .elementor-motion-effects-container');
        if (!container) {
          container = document.createElement('div');
          container.className = 'elementor-motion-effects-container';
          const layer = document.createElement('div');
          layer.className = 'elementor-motion-effects-layer';
          container.append(layer);
          element.prepend(container);
        }
        const layer = container.querySelector('.elementor-motion-effects-layer');
        effects.push({
          type: 'backgroundScale',
          element,
          layer,
          devices,
          speed: Number(settings.background_motion_fx_scale_speed?.size || 4),
          direction: settings.background_motion_fx_scale_direction || 'out-in',
        });
        element.classList.add(
          'elementor-motion-effects-element',
          'elementor-motion-effects-element-type-background',
          'elementor-motion-effects-parent',
        );
        element.style.setProperty('--e-transform-transition-duration', '100ms');
        if (layer) {
          layer.style.width = '100%';
          layer.style.height = '100%';
          layer.style.setProperty('--scale', '1');
          layer.style.transform = 'scale(var(--scale))';
        }
      }
    }

    if (!effects.length || reduceMotion) return;

    let frame = 0;
    function renderMotion() {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const device = viewportDevice();
      effects.forEach((effect) => {
        if (!effect.devices.includes(device)) return;
        const rect = effect.element.getBoundingClientRect();
        const progress = ((viewportHeight - rect.top) / (viewportHeight + rect.height)) * 100;

        if (effect.type === 'translateY') {
          const start = Number(effect.range.start ?? 0);
          const end = Number(effect.range.end ?? 100);
          const bounded = Math.min(end, Math.max(start, progress));
          effect.element.style.setProperty('--translateY', `${(50 - bounded) * effect.speed}px`);
          effect.element.style.transform = 'translateY(var(--translateY))';
        } else if (effect.type === 'backgroundScale' && effect.layer) {
          const outward = Math.max(0, progress - 70);
          const scale = effect.direction === 'out-in'
            ? 1 + (outward * effect.speed) / 2000
            : 1 + (Math.max(0, 70 - progress) * effect.speed) / 2000;
          effect.layer.style.setProperty('--scale', String(Math.max(1, scale)));
        }
      });
    }

    function requestMotionRender() {
      if (frame) return;
      frame = window.requestAnimationFrame(renderMotion);
    }

    window.addEventListener('scroll', requestMotionRender, { passive: true });
    window.addEventListener('resize', requestMotionRender, { passive: true });
    window.addEventListener('load', requestMotionRender, { once: true });
    requestMotionRender();
  }

  function carouselValue(settings, name, fallback) {
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const tablet = window.matchMedia('(max-width: 1024px)').matches;
    const candidates = mobile
      ? [settings[`${name}_mobile`], settings[`${name}_tablet`], settings[name]]
      : tablet ? [settings[`${name}_tablet`], settings[name]] : [settings[name]];

    for (const value of candidates) {
      const normalized = typeof value === 'object' && value !== null ? value.size : value;
      if (normalized === '' || normalized === null || normalized === undefined) continue;
      const number = Number(normalized);
      if (Number.isFinite(number)) return number;
    }
    return Number(fallback);
  }

  function initializeCarousel(widget) {
    const carousel = widget.querySelector(
      ':scope > .elementor-widget-container > .e-n-carousel, :scope > .elementor-widget-container .elementor-main-swiper, :scope > .elementor-widget-container > .elementor-loop-container',
    );
    const wrapper = carousel?.querySelector(':scope > .swiper-wrapper');
    const originalSlides = wrapper ? [...wrapper.children].filter((slide) => slide.classList.contains('swiper-slide')) : [];

    if (!carousel || !wrapper || originalSlides.length < 2 || carousel.classList.contains('swiper-initialized') || carousel.classList.contains('asanja-carousel-fallback')) return;

    const settings = elementSettings(widget);

    const pagination = widget.querySelector('.swiper-pagination');
    const previous = widget.querySelector('.elementor-swiper-button-prev');
    const next = widget.querySelector('.elementor-swiper-button-next');
    const isHomepageHero = widget.dataset.id === '84c7292';
    const speed = Number(settings.speed || 500);
    const autoplayDelay = Number(settings.autoplay_speed || 5000);
    const isMediaCarousel = widget.classList.contains('elementor-widget-media-carousel');
    const infinite = settings.infinite === 'yes' || settings.loop === 'yes';
    let visible = 1;
    let gap = 0;
    let index = 0;
    let physicalIndex = 0;
    let cloneCount = 0;
    let slides = [...originalSlides];
    let timer = 0;
    let loopResetTimer = 0;
    let userInteracted = false;

    carousel.classList.add('asanja-carousel-fallback');
    if (isHomepageHero) carousel.classList.add('asanja-carousel-fallback--hero');
    carousel.style.setProperty('--asanja-carousel-speed', `${reduceMotion ? 0 : speed}ms`);

    for (const image of carousel.querySelectorAll('[data-background]')) {
      image.style.backgroundImage = `url("${image.dataset.background}")`;
      image.classList.remove('swiper-lazy');
      image.querySelector('.swiper-lazy-preloader')?.remove();
    }

    function maxIndex() {
      return infinite ? originalSlides.length - 1 : Math.max(0, originalSlides.length - visible);
    }

    function updateAccessibility() {
      originalSlides.forEach((slide, slideIndex) => {
        const isVisible = infinite
          ? Array.from({ length: visible }, (_, offset) => (index + offset) % originalSlides.length).includes(slideIndex)
          : slideIndex >= index && slideIndex < index + visible;
        slide.setAttribute('aria-hidden', String(!isVisible));
        if ('inert' in slide) slide.inert = !isVisible;
      });

      slides.filter((slide) => slide.classList.contains('asanja-loop-clone')).forEach((slide) => {
        slide.setAttribute('aria-hidden', 'true');
        if ('inert' in slide) slide.inert = true;
      });

      pagination?.querySelectorAll('.swiper-pagination-bullet').forEach((bullet, bulletIndex) => {
        const active = bulletIndex === index;
        bullet.classList.toggle('swiper-pagination-bullet-active', active);
        bullet.setAttribute('aria-current', active ? 'true' : 'false');
      });
    }

    function render({ animate = true } = {}) {
      const firstSlide = originalSlides[0];
      if (!firstSlide) return;
      wrapper.style.transitionDuration = `${animate && !reduceMotion ? speed : 0}ms`;
      const distance = physicalIndex * (firstSlide.getBoundingClientRect().width + gap);
      wrapper.style.transform = `translate3d(${-distance}px, 0, 0)`;
      originalSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('asanja-slide-active', slideIndex === index);
      });
      updateAccessibility();
    }

    function scheduleLoopReset(targetPhysicalIndex) {
      window.clearTimeout(loopResetTimer);
      loopResetTimer = window.setTimeout(() => {
        physicalIndex = targetPhysicalIndex;
        render({ animate: false });
      }, (reduceMotion ? 0 : speed) + 30);
    }

    function goTo(nextIndex, interaction = true) {
      const limit = maxIndex();
      window.clearTimeout(loopResetTimer);
      if (infinite && nextIndex > limit) {
        index = 0;
        physicalIndex = cloneCount + originalSlides.length;
        scheduleLoopReset(cloneCount);
      } else if (infinite && nextIndex < 0) {
        index = limit;
        physicalIndex = cloneCount - 1;
        scheduleLoopReset(cloneCount + limit);
      } else {
        index = Math.max(0, Math.min(limit, nextIndex));
        physicalIndex = cloneCount + index;
      }
      render();
      if (!interaction) return;
      if (settings.pause_on_interaction === 'yes') {
        userInteracted = true;
        window.clearInterval(timer);
      } else {
        startAutoplay();
      }
    }

    function rebuildLoopClones() {
      wrapper.querySelectorAll(':scope > .asanja-loop-clone').forEach((slide) => slide.remove());
      cloneCount = infinite ? Math.min(visible, originalSlides.length) : 0;
      if (cloneCount) {
        const before = originalSlides.slice(-cloneCount).map((slide) => slide.cloneNode(true));
        const after = originalSlides.slice(0, cloneCount).map((slide) => slide.cloneNode(true));
        [...before, ...after].forEach((slide) => {
          slide.classList.add('asanja-loop-clone');
          slide.querySelectorAll('h1').forEach((heading) => {
            const visualHeading = document.createElement('div');
            for (const attribute of heading.attributes) visualHeading.setAttribute(attribute.name, attribute.value);
            visualHeading.replaceChildren(...heading.childNodes);
            heading.replaceWith(visualHeading);
          });
          slide.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
          slide.removeAttribute('id');
          slide.setAttribute('aria-hidden', 'true');
          if ('inert' in slide) slide.inert = true;
          slide.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((element) => {
            element.setAttribute('tabindex', '-1');
          });
        });
        wrapper.prepend(...before);
        wrapper.append(...after);
      }
      slides = [...wrapper.children].filter((slide) => slide.classList.contains('swiper-slide'));
    }

    function configure() {
      if (isMediaCarousel) {
        const configured = Math.max(1, carouselValue(settings, 'slides_per_view', 3));
        visible = window.matchMedia('(max-width: 767px)').matches ? 1 : window.matchMedia('(max-width: 1024px)').matches ? Math.min(2, configured) : configured;
      } else {
        visible = Math.max(1, carouselValue(settings, 'slides_to_show', 1));
      }
      gap = Math.max(0, carouselValue(settings, settings.space_between ? 'space_between' : 'image_spacing_custom', 0));
      const width = `calc((100% - ${gap * (visible - 1)}px) / ${visible})`;
      carousel.style.setProperty('--asanja-carousel-gap', `${gap}px`);
      carousel.style.setProperty('--asanja-carousel-slide-width', width);
      index = Math.min(index, maxIndex());
      rebuildLoopClones();
      physicalIndex = cloneCount + index;
      buildPagination();
      window.requestAnimationFrame(() => render({ animate: false }));
    }

    function startAutoplay() {
      window.clearInterval(timer);
      if (settings.autoplay !== 'yes' || reduceMotion || userInteracted) return;
      timer = window.setInterval(() => goTo(index + 1, false), autoplayDelay);
    }

    function buildPagination() {
      if (!pagination || settings.pagination !== 'bullets') return;
      pagination.replaceChildren();
      for (let bulletIndex = 0; bulletIndex <= maxIndex(); bulletIndex += 1) {
        const bullet = document.createElement('button');
        bullet.type = 'button';
        bullet.className = 'swiper-pagination-bullet';
        bullet.setAttribute('aria-label', `Go to slide ${bulletIndex + 1}`);
        bullet.addEventListener('click', () => goTo(bulletIndex));
        pagination.append(bullet);
      }
    }

    previous?.addEventListener('click', () => goTo(index - 1));
    next?.addEventListener('click', () => goTo(index + 1));
    for (const control of [previous, next]) {
      control?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        control.click();
      });
    }
    let pointerStart = null;
    carousel.addEventListener('pointerdown', (event) => {
      pointerStart = event.clientX;
    });
    carousel.addEventListener('pointerup', (event) => {
      if (pointerStart === null) return;
      const distance = event.clientX - pointerStart;
      pointerStart = null;
      if (Math.abs(distance) > 45) goTo(index + (distance < 0 ? 1 : -1));
    });
    if (settings.pause_on_hover === 'yes') {
      carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
      carousel.addEventListener('mouseleave', startAutoplay);
    }
    carousel.addEventListener('focusin', () => window.clearInterval(timer));
    carousel.addEventListener('focusout', startAutoplay);
    window.addEventListener('resize', configure, { passive: true });

    configure();
    startAutoplay();
  }

  function initializeCarousels() {
    for (const widget of document.querySelectorAll(
      '.elementor-widget-n-carousel, .elementor-widget-media-carousel, .elementor-widget-loop-carousel, .elementor-widget-reviews',
    )) {
      initializeCarousel(widget);
    }
  }

  function initializeTabs() {
    for (const widget of document.querySelectorAll('.elementor-widget-n-tabs')) {
      const tabs = [...widget.querySelectorAll('.e-n-tabs-heading > [role="tab"]')];
      const panels = [...widget.querySelectorAll('.e-n-tabs-content > [role="tabpanel"]')];
      if (!tabs.length || !panels.length || widget.dataset.asanjaTabsReady) continue;
      widget.dataset.asanjaTabsReady = 'true';

      function selectTab(selectedIndex, focus = false) {
        tabs.forEach((tab, index) => {
          const selected = index === selectedIndex;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
          tab.classList.toggle('e-active', selected);
          if (focus && selected) tab.focus();
        });
        panels.forEach((panel, index) => {
          const selected = index === selectedIndex;
          panel.classList.toggle('e-active', selected);
          panel.hidden = !selected;
        });
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(index));
        tab.addEventListener('keydown', (event) => {
          let nextIndex = index;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') nextIndex = 0;
          else if (event.key === 'End') nextIndex = tabs.length - 1;
          else return;
          event.preventDefault();
          selectTab(nextIndex, true);
        });
      });

      const initiallySelected = Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true'));
      selectTab(initiallySelected);
    }
  }

  function initializeAccordions() {
    for (const accordion of document.querySelectorAll('.e-n-accordion')) {
      const items = [...accordion.querySelectorAll(':scope > details')];
      const summaries = items.map((item) => item.querySelector(':scope > summary'));
      if (!items.length || accordion.dataset.asanjaAccordionReady) continue;
      accordion.dataset.asanjaAccordionReady = 'true';

      function sync() {
        items.forEach((item, index) => summaries[index]?.setAttribute('aria-expanded', String(item.open)));
      }

      summaries.forEach((summary, index) => {
        if (!summary) return;
        summary.tabIndex = index === 0 ? 0 : -1;
        summary.addEventListener('click', (event) => {
          event.preventDefault();
          const shouldOpen = !items[index].open;
          items.forEach((item) => { item.open = false; });
          items[index].open = shouldOpen;
          sync();
        });
        summary.addEventListener('keydown', (event) => {
          let nextIndex = index;
          if (event.key === 'ArrowDown') nextIndex = (index + 1) % summaries.length;
          else if (event.key === 'ArrowUp') nextIndex = (index - 1 + summaries.length) % summaries.length;
          else if (event.key === 'Home') nextIndex = 0;
          else if (event.key === 'End') nextIndex = summaries.length - 1;
          else if (event.key === 'Escape') {
            items[index].open = false;
            sync();
            return;
          } else return;
          event.preventDefault();
          summaries.forEach((item, itemIndex) => { if (item) item.tabIndex = itemIndex === nextIndex ? 0 : -1; });
          summaries[nextIndex]?.focus();
        });
      });
      sync();
    }
  }

  function initializeLightbox() {
    const links = [...document.querySelectorAll('a[data-elementor-open-lightbox="yes"]')]
      .filter((link) => !link.closest('.asanja-loop-clone'));
    if (!links.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'asanja-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image gallery');
    lightbox.innerHTML = `
      <button class="asanja-lightbox-close" type="button" aria-label="Close image gallery">&times;</button>
      <button class="asanja-lightbox-prev" type="button" aria-label="Previous image">&#8249;</button>
      <figure><img alt=""><figcaption><strong></strong><span></span></figcaption></figure>
      <button class="asanja-lightbox-next" type="button" aria-label="Next image">&#8250;</button>`;
    document.body.append(lightbox);

    const image = lightbox.querySelector('img');
    const title = lightbox.querySelector('figcaption strong');
    const description = lightbox.querySelector('figcaption span');
    let gallery = [];
    let index = 0;
    let previousFocus = null;

    function render() {
      const link = gallery[index];
      if (!link || !image) return;
      image.src = link.href;
      image.alt = link.querySelector('[role="img"]')?.getAttribute('aria-label') || link.dataset.elementorLightboxTitle || '';
      title.textContent = link.dataset.elementorLightboxTitle || '';
      description.textContent = link.dataset.elementorLightboxDescription || '';
    }

    function close() {
      lightbox.classList.remove('asanja-lightbox-visible');
      document.documentElement.classList.remove('asanja-lightbox-open');
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    }

    links.forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      const group = link.dataset.elementorLightboxSlideshow;
      gallery = links.filter((candidate) => candidate.dataset.elementorLightboxSlideshow === group);
      index = Math.max(0, gallery.indexOf(link));
      previousFocus = link;
      render();
      lightbox.classList.add('asanja-lightbox-visible');
      document.documentElement.classList.add('asanja-lightbox-open');
      lightbox.querySelector('.asanja-lightbox-close')?.focus();
    }));
    lightbox.querySelector('.asanja-lightbox-close')?.addEventListener('click', close);
    lightbox.querySelector('.asanja-lightbox-prev')?.addEventListener('click', () => {
      index = (index - 1 + gallery.length) % gallery.length;
      render();
    });
    lightbox.querySelector('.asanja-lightbox-next')?.addEventListener('click', () => {
      index = (index + 1) % gallery.length;
      render();
    });
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('asanja-lightbox-visible')) return;
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft') lightbox.querySelector('.asanja-lightbox-prev')?.click();
      else if (event.key === 'ArrowRight') lightbox.querySelector('.asanja-lightbox-next')?.click();
    });
  }

  function initializeWhatsAppWidget() {
    const trigger = document.querySelector('.asanja-whatsapp');
    if (!trigger || trigger.dataset.asanjaWhatsappReady) return;

    trigger.dataset.asanjaWhatsappReady = 'true';
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'asanja-whatsapp-panel');
    const destination = trigger.href;

    const iconHost = trigger.querySelector('.asanja-whatsapp__icon');
    if (iconHost) {
      iconHost.innerHTML = `
        <svg viewBox="0 0 478.165 478.165" aria-hidden="true">
          <path fill="currentColor" d="M478.165 232.946c0 128.567-105.057 232.966-234.679 232.966-41.102 0-79.814-10.599-113.445-28.969L0 478.165l42.437-125.04c-21.438-35.065-33.77-76.207-33.77-120.159C8.667 104.34 113.763 0 243.485 0c129.623 0 234.68 104.34 234.68 232.946zM243.485 37.098c-108.802 0-197.422 87.803-197.422 195.868 0 42.915 13.986 82.603 37.576 114.879l-24.586 72.542 75.849-23.968c31.121 20.481 68.457 32.296 108.583 32.296 108.723 0 197.323-87.843 197.323-195.908 0-107.886-88.6-195.709-197.323-195.709zM361.931 286.62c-1.395-2.331-5.22-3.746-10.898-6.814-5.917-2.849-34.089-16.497-39.508-18.37-5.16-1.913-8.986-2.849-12.811 2.829-4.005 5.638-14.903 18.629-18.23 22.354-3.546 3.785-6.854 4.264-12.552 1.435-5.618-2.809-24.267-8.866-46.203-28.391-17.055-15.042-28.67-33.711-31.997-39.508-3.427-5.758-.398-8.826 2.471-11.635 2.69-2.59 5.778-6.734 8.627-10.041 2.969-3.287 3.905-5.638 5.798-9.424 1.913-3.905.936-7.192-.478-10.141-1.415-2.849-13.01-30.881-17.752-42.337-4.841-11.416-9.543-9.523-12.871-9.523-3.467 0-7.212-.478-11.117-.478-3.785 0-10.041 1.395-15.381 7.192-5.2 5.658-20.123 19.465-20.123 47.597 0 28.052 20.601 55.308 23.55 59.053 2.869 3.785 39.747 63.197 98.303 86.07 58.476 22.872 58.476 15.321 69.115 14.365 10.38-.956 34.069-13.867 38.811-27.096 4.66-13.45 4.66-24.766 3.246-27.137z"/>
        </svg>`;
    }
    const icon = iconHost?.querySelector('svg')?.cloneNode(true);
    const panel = document.createElement('aside');
    panel.id = 'asanja-whatsapp-panel';
    panel.className = 'asanja-whatsapp-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Start a WhatsApp conversation');
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = `
      <div class="asanja-whatsapp-panel__heading">
        <span class="asanja-whatsapp-panel__mark" aria-hidden="true"></span>
        <div class="asanja-whatsapp-panel__title">Start a Conversation</div>
        <div class="asanja-whatsapp-panel__intro">Hi! Click our team member below to chat on <strong>WhatsApp</strong></div>
      </div>
      <div class="asanja-whatsapp-panel__content">
        <div class="asanja-whatsapp-panel__notice">The team typically replies in a few minutes.</div>
        <div class="asanja-whatsapp-panel__item">
          <a class="asanja-whatsapp-panel__link" target="_blank" rel="nofollow noopener noreferrer">
            <span class="asanja-whatsapp-panel__avatar" aria-hidden="true"></span>
            <span class="asanja-whatsapp-panel__text">
              <span class="asanja-whatsapp-panel__name">Asanja Whatsapp</span>
              <span class="asanja-whatsapp-panel__duty">Chat to us</span>
            </span>
          </a>
        </div>
      </div>`;
    panel.querySelector('.asanja-whatsapp-panel__link').href = destination;
    if (icon) {
      panel.querySelector('.asanja-whatsapp-panel__mark')?.append(icon.cloneNode(true));
      panel.querySelector('.asanja-whatsapp-panel__avatar')?.append(icon);
    }
    trigger.after(panel);
    let openedAt = -Infinity;

    function setOpen(open, { focus = false } = {}) {
      if (open) openedAt = performance.now();
      trigger.classList.toggle('is-active', open);
      panel.classList.toggle('is-active', open);
      trigger.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      if (open && focus) panel.querySelector('a')?.focus();
    }

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(!panel.classList.contains('is-active'));
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(!panel.classList.contains('is-active'), { focus: true });
    });
    document.addEventListener('click', (event) => {
      if (performance.now() - openedAt < 250) return;
      if (event.target instanceof Node && (trigger.contains(event.target) || panel.contains(event.target))) return;
      setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !panel.classList.contains('is-active')) return;
      setOpen(false);
      trigger.focus();
    });
  }

  function createPopupShell(template) {
    const popup = document.createElement('div');
    popup.id = 'elementor-popup-modal-1529';
    popup.className = 'dialog-widget dialog-lightbox-widget dialog-type-buttons dialog-type-lightbox elementor-popup-modal asanja-popup-fallback';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-label', 'Main navigation');
    popup.innerHTML = `
      <div class="dialog-widget-content dialog-lightbox-widget-content animated">
        <div class="dialog-header dialog-lightbox-header"></div>
        <div class="dialog-message dialog-lightbox-message"></div>
        <div class="dialog-buttons-wrapper dialog-lightbox-buttons-wrapper"></div>
      </div>`;
    popup.querySelector('.dialog-message').append(template);
    document.body.append(popup);
    return popup;
  }

  function initializePopupNavigation() {
    const template = document.querySelector('[data-elementor-type="popup"].elementor-1529');
    if (!template) return;

    let popup = document.querySelector('#elementor-popup-modal-1529');
    if (!popup) popup = createPopupShell(template);
    else if (!popup.contains(template)) popup.querySelector('.dialog-message')?.append(template);
    popup.classList.add('asanja-popup-fallback');
    popup.setAttribute('aria-hidden', 'true');

    const content = popup.querySelector('.dialog-widget-content');
    const topItems = [...popup.querySelectorAll('.menu-items-column .elementor-nav-menu--main > ul > li')];
    const images = [...popup.querySelectorAll('.menu-images-column .elementor-widget-spacer')];
    const openerSelector = 'a[href*="popup%3Aopen"], a[href*="popup:open"]';
    const closerSelector = 'a[href*="popup%3Aclose"], a[href*="popup:close"]';
    const popupSettings = (() => {
      try {
        return JSON.parse(template.dataset.elementorSettings || '{}');
      } catch {
        return {};
      }
    })();
    const entranceAnimation = popupSettings.entrance_animation || 'fadeInDown';
    const exitAnimation = popupSettings.exit_animation || entranceAnimation;
    const popupDuration = reduceMotion ? 0 : Number(popupSettings.entrance_animation_duration?.size || 0.7) * 1000;
    let previouslyFocused = null;
    let popupTimer = 0;

    function setMenuImage(itemIndex) {
      images.forEach((image, imageIndex) => image.classList.toggle('active', imageIndex === itemIndex));
      topItems.forEach((item, index) => item.querySelector(':scope > a')?.classList.toggle('active', index === itemIndex));
    }

    topItems.forEach((item, index) => {
      item.addEventListener('mouseenter', () => setMenuImage(index));
      item.querySelector(':scope > a')?.addEventListener('focus', () => setMenuImage(index));
    });

    const submenuItems = popup.querySelectorAll(
      '.menu-items-column .elementor-nav-menu--main > ul > li.menu-item-has-children, .mob-menu .elementor-nav-menu > li.menu-item-has-children',
    );

    submenuItems.forEach((item) => {
      const link = item.querySelector(':scope > a');
      link?.setAttribute('aria-haspopup', 'true');
      link?.setAttribute('aria-expanded', 'false');
      link?.addEventListener('click', (event) => {
        event.preventDefault();
        const open = item.classList.toggle('asanja-submenu-open');
        link.setAttribute('aria-expanded', String(open));
      });
    });

    function openPopup(trigger) {
      window.clearTimeout(popupTimer);
      previouslyFocused = trigger || document.activeElement;
      prepareLazyBackgrounds();
      popup.classList.add('asanja-popup-visible');
      popup.setAttribute('aria-hidden', 'false');
      content?.classList.remove('reverse', exitAnimation);
      if (content) void content.offsetWidth;
      content?.classList.add('animated', entranceAnimation);
      if (content) content.style.animationDuration = `${popupDuration}ms`;
      document.documentElement.classList.add('asanja-popup-open');
      document.body.classList.add('asanja-popup-open', 'dialog-body', 'dialog-lightbox-body', 'dialog-container', 'dialog-lightbox-container');
      setMenuImage(0);
      popup.querySelectorAll('.elementor-invisible').forEach((element) => revealAnimatedElement(element));
      popupTimer = window.setTimeout(() => content?.classList.remove(entranceAnimation), popupDuration);
      window.setTimeout(() => popup.querySelector('.menu-items-column a, .mob-menu a')?.focus(), 0);
    }

    function closePopup() {
      window.clearTimeout(popupTimer);
      content?.classList.remove(entranceAnimation);
      if (content) void content.offsetWidth;
      content?.classList.add('animated', exitAnimation, 'reverse');
      if (content) content.style.animationDuration = `${popupDuration}ms`;
      popupTimer = window.setTimeout(() => {
        popup.classList.remove('asanja-popup-visible');
        popup.setAttribute('aria-hidden', 'true');
        content?.classList.remove(exitAnimation, 'reverse');
        document.documentElement.classList.remove('asanja-popup-open');
        document.body.classList.remove('asanja-popup-open', 'dialog-body', 'dialog-lightbox-body', 'dialog-container', 'dialog-lightbox-container');
        popup.querySelectorAll('[data-settings*="_animation"]').forEach((element) => revealAnimatedElement(element, { reset: true }));
        if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
      }, popupDuration);
    }

    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('a') : null;
      if (!target) return;
      if (target.matches(openerSelector)) {
        event.preventDefault();
        openPopup(target);
      } else if (target.matches(closerSelector)) {
        event.preventDefault();
        closePopup();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!popup.classList.contains('asanja-popup-visible')) return;
      if (event.key === 'Escape') {
        closePopup();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...popup.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((element) => element instanceof HTMLElement && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    try {
      if (decodeURIComponent(window.location.hash).includes('popup:open')) openPopup();
    } catch {
      // Ignore malformed URL fragments.
    }
  }

  function initializeHomepageRuntime() {
    prepareLazyBackgrounds();
    initializeEntranceAnimations();
    initializeMotionEffects();
    initializePopupNavigation();
    initializeCarousels();
    initializeTabs();
    initializeAccordions();
    initializeLightbox();
    initializeWhatsAppWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHomepageRuntime, { once: true });
  } else {
    initializeHomepageRuntime();
  }

  const forms = document.querySelectorAll('form');

  for (const form of forms) {
    if (!form.querySelector('[name="website"]')) {
      const honeypot = document.createElement('label');
      honeypot.className = 'asanja-honeypot';
      honeypot.setAttribute('aria-hidden', 'true');
      honeypot.innerHTML = 'Leave this field empty<input name="website" type="text" tabindex="-1" autocomplete="off">';
      form.prepend(honeypot);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const submitter = form.querySelector('[type="submit"]');
      const originalLabel = submitter?.textContent;
      if (submitter) {
        submitter.setAttribute('disabled', 'disabled');
        submitter.textContent = 'Sending…';
      }

      const values = Object.fromEntries(new FormData(form).entries());
      const status = document.createElement('p');
      status.setAttribute('role', 'status');
      status.style.marginTop = '12px';
      form.append(status);

      try {
        const response = await fetch('/api/forms/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: location.pathname, form: form.getAttribute('name') || '', fields: values }),
        });
        const result = await response.json();
        status.textContent = result.message;
        status.style.color = response.ok ? '#285943' : '#8b2d2d';
        if (response.ok && result.redirect) {
          window.location.assign(result.redirect);
          return;
        }
        if (response.ok) form.reset();
      } catch {
        status.textContent = 'We could not send your request. Please try again.';
        status.style.color = '#8b2d2d';
      } finally {
        if (submitter) {
          submitter.removeAttribute('disabled');
          submitter.textContent = originalLabel;
        }
      }
    }, true);
  }
})();
