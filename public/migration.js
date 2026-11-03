(() => {
  const menuItems = [
    { label: 'Asanja Story', href: '/about/', image: '/legacy/wp-content/uploads/2024/04/menu-fire_20250724093930.webp' },
    { label: 'Safaris', href: '/safaris/', image: '/legacy/wp-content/uploads/2020/08/lady-on-safari_20250805120210-e1754388375386.webp' },
    { label: 'Experiences', href: '/experiences/', image: '/legacy/wp-content/uploads/2024/04/menu-masaai-visit_20250724093647.webp' },
    { label: 'Asanja Reviews', href: '/asanja-reviews/', image: '/legacy/wp-content/uploads/2024/04/menu-reviews_20250711104945.webp' },
    { label: 'FAQs', href: '/faqs/', image: '/legacy/wp-content/uploads/2025/07/faq-asanja-header_20250711100340.webp' },
    { label: 'Contact Us', href: '/contact/', image: '/legacy/wp-content/uploads/2024/05/wade-lambert-VfdOzbZkW1w-unsplash.jpg' },
  ];
  const camps = [
    ['Asanja Moru', '/asanja-moru/'],
    ['Asanja Siri Bustani, Grumeti', '/asanja-sri-bustani/'],
    ['Asanja Nyasirori', '/asanja-nyasirori/'],
    ['Asanja Ndembo, Ruaha', '/asanja-ruaha/'],
    ['Asanja Under The Stars', '/asanja-under-the-stars/'],
  ];

  const overlay = document.createElement('div');
  overlay.className = 'asanja-menu-overlay';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Main navigation');
  overlay.innerHTML = `
    <div class="asanja-menu-art" aria-hidden="true"></div>
    <div class="asanja-menu-brand">
      <a href="/" aria-label="Asanja Africa home">
        <img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="Asanja Africa" />
      </a>
      <a class="asanja-menu-book" href="/plan-my-stay/">Make a booking</a>
    </div>
    <nav class="asanja-menu-nav" aria-label="Main navigation">
      <a href="/about/" data-menu-image="${menuItems[0].image}">Asanja Story</a>
      <div class="asanja-menu-camps-wrap">
        <button class="asanja-menu-camps" type="button" aria-expanded="false">
          <span>Camps &amp; Lodges</span><span class="asanja-menu-chevron" aria-hidden="true">⌄</span>
        </button>
        <div class="asanja-menu-submenu" hidden>
          ${camps.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
        </div>
      </div>
      ${menuItems.slice(1).map(({ label, href, image }) => `<a href="${href}" data-menu-image="${image}">${label}</a>`).join('')}
    </nav>
    <button class="asanja-menu-close" type="button" aria-label="Close menu">×</button>
  `;
  document.body.append(overlay);

  const art = overlay.querySelector('.asanja-menu-art');
  const closeButton = overlay.querySelector('.asanja-menu-close');
  const campsButton = overlay.querySelector('.asanja-menu-camps');
  const submenu = overlay.querySelector('.asanja-menu-submenu');
  let menuTrigger = null;

  const setMenuImage = (source) => {
    if (art && source) art.style.backgroundImage = `url("${source}")`;
  };
  const openMenu = (trigger) => {
    menuTrigger = trigger;
    overlay.hidden = false;
    document.documentElement.classList.add('asanja-menu-open');
    if (art) art.style.backgroundImage = '';
    closeButton?.focus();
  };
  const closeMenu = () => {
    overlay.hidden = true;
    document.documentElement.classList.remove('asanja-menu-open');
    menuTrigger?.focus();
  };

  for (const trigger of document.querySelectorAll('a[href*="elementor-action"][href*="popup"]')) {
    if (!trigger.getAttribute('href')?.includes('open')) continue;
    trigger.setAttribute('aria-label', 'Open main menu');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openMenu(trigger);
    }, true);
  }

  closeButton?.addEventListener('click', closeMenu);
  campsButton?.addEventListener('click', () => {
    const expanded = campsButton.getAttribute('aria-expanded') === 'true';
    campsButton.setAttribute('aria-expanded', String(!expanded));
    submenu.hidden = expanded;
    campsButton.querySelector('.asanja-menu-chevron').textContent = expanded ? '⌄' : '⌃';
    setMenuImage('/legacy/wp-content/uploads/2025/07/camp-slide-sri-bustani-couple-deck_20250709165549.webp');
  });
  for (const link of overlay.querySelectorAll('[data-menu-image]')) {
    const update = () => setMenuImage(link.dataset.menuImage);
    link.addEventListener('mouseenter', update);
    link.addEventListener('focus', update);
  }
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) closeMenu();
  });

  const forms = document.querySelectorAll('form');

  for (const form of forms) {
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
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page: location.pathname, fields: values }),
        });
        const result = await response.json();
        status.textContent = result.message;
        status.style.color = response.ok ? '#285943' : '#8b2d2d';
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
