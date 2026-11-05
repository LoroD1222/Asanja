const baseUrl = process.argv[2] || 'http://127.0.0.1:3001';
const debuggerUrl = process.argv[3] || 'http://127.0.0.1:9224';
let nextId = 0;

async function openPage(pathname, width = 1440, height = 900) {
  const target = await fetch(`${debuggerUrl}/json/new?${encodeURIComponent('about:blank')}`, { method: 'PUT' })
    .then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const diagnostics = { exceptions: [], consoleErrors: [] };
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') diagnostics.exceptions.push(message.params.exceptionDetails?.text || 'exception');
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') diagnostics.consoleErrors.push('console error');
    if (!message.id || !pending.has(message.id)) return;
    const handler = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) handler.reject(new Error(message.error.message));
    else handler.resolve(message.result);
  });
  function command(method, params = {}) {
    const id = ++nextId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }
  await command('Runtime.enable');
  await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 767 });
  await command('Page.navigate', { url: `${baseUrl.replace(/\/$/, '')}${pathname}` });
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ready = await command('Runtime.evaluate', {
      expression: `document.readyState === 'complete' && Boolean(document.querySelector('main'))`,
      returnByValue: true,
    });
    if (ready.result?.value) break;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    diagnostics,
    async evaluate(expression) {
      const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      }
      return result.result.value;
    },
    async click(selector) {
      const center = await this.evaluate(`(() => {
        const rect = document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();
        return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
      })()`);
      if (!center) throw new Error(`Cannot click missing selector: ${selector}`);
      await command('Input.dispatchMouseEvent', { type: 'mousePressed', x: center.x, y: center.y, button: 'left', clickCount: 1 });
      await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: center.x, y: center.y, button: 'left', clickCount: 1 });
    },
    async close() {
      socket.close();
      await fetch(`${debuggerUrl}/json/close/${target.id}`);
    },
  };
}

async function homeDesktop() {
  const page = await openPage('/');
  try {
    const carousel = await page.evaluate(`(() => {
      const widget = document.querySelector('.elementor-element-84c7292');
      const carousel = widget.querySelector('.e-n-carousel');
      const wrapper = widget.querySelector('.swiper-wrapper');
      const initial = wrapper.style.transform;
      const initiallyVisible = wrapper.querySelector(':scope > .swiper-slide:not(.asanja-loop-clone)[aria-hidden="false"]');
      const background = initiallyVisible?.querySelector('.e-con');
      const backgroundStyle = background ? getComputedStyle(background) : null;
      const backgroundRect = background?.getBoundingClientRect();
      const visual = {
        backgroundImage: backgroundStyle?.backgroundImage || '',
        backgroundColor: backgroundStyle?.backgroundColor || '',
        display: backgroundStyle?.display || '',
        visibility: backgroundStyle?.visibility || '',
        opacity: backgroundStyle?.opacity || '',
        width: backgroundRect?.width || 0,
        height: backgroundRect?.height || 0,
        resource: performance.getEntriesByType('resource')
          .find((entry) => entry.name.includes('Home-Asanja-Ndembo.webp'))?.name || '',
      };
      for (let count = 0; count < 4; count += 1) {
        carousel.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 800 }));
        carousel.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 200 }));
      }
      return new Promise((resolve) => setTimeout(() => resolve({
        initial,
        final: wrapper.style.transform,
        duration: wrapper.style.transitionDuration,
        originals: wrapper.querySelectorAll(':scope > .swiper-slide:not(.asanja-loop-clone)').length,
        clones: wrapper.querySelectorAll(':scope > .asanja-loop-clone').length,
        active: [...wrapper.querySelectorAll(':scope > .swiper-slide:not(.asanja-loop-clone)')]
          .findIndex((slide) => slide.classList.contains('asanja-slide-active')),
        visual,
      }), 650));
    })()`);
    const popup = await page.evaluate(`(() => {
      const opener = document.querySelector('a[href*="popup%3Aopen"], a[href*="popup:open"]');
      opener.click();
      const modal = document.querySelector('#elementor-popup-modal-1529');
      const content = modal.querySelector('.dialog-widget-content');
      const inner = modal.querySelector('[data-settings*="_animation"]');
      const opened = {
        visible: modal.classList.contains('asanja-popup-visible'),
        ariaHidden: modal.getAttribute('aria-hidden'),
        entrance: content.classList.contains('fadeInDown'),
        duration: content.style.animationDuration,
        innerDelay: inner?.style.animationDelay || '',
        bodyLocked: document.body.classList.contains('asanja-popup-open'),
      };
      return new Promise((resolve) => setTimeout(() => {
        const settled = {
          visible: modal.classList.contains('asanja-popup-visible'),
          entrance: content.classList.contains('fadeInDown'),
        };
        modal.querySelector('a[href*="popup%3Aclose"], a[href*="popup:close"]').click();
        const closing = content.classList.contains('reverse');
        setTimeout(() => resolve({ opened, settled, closing, closed: {
          visible: modal.classList.contains('asanja-popup-visible'),
          ariaHidden: modal.getAttribute('aria-hidden'),
          bodyLocked: document.body.classList.contains('asanja-popup-open'),
        } }), 750);
      }, 750));
    })()`);
    const whatsapp = await page.evaluate(`(() => {
      const trigger = document.querySelector('.asanja-whatsapp');
      const label = trigger?.querySelector('.asanja-whatsapp__label');
      const icon = trigger?.querySelector('.asanja-whatsapp__icon');
      const panel = document.querySelector('.asanja-whatsapp-panel');
      const rect = trigger?.getBoundingClientRect();
      const labelRect = label?.getBoundingClientRect();
      const iconStyle = icon ? getComputedStyle(icon) : null;
      trigger?.click();
      return new Promise((resolve) => setTimeout(() => {
        const link = panel?.querySelector('.asanja-whatsapp-panel__link');
        const panelRect = panel?.getBoundingClientRect();
        const opened = {
          triggerActive: trigger?.classList.contains('is-active') || false,
          panelActive: panel?.classList.contains('is-active') || false,
          expanded: trigger?.getAttribute('aria-expanded') || '',
          panelHidden: panel?.getAttribute('aria-hidden') || '',
          right: Math.round(document.documentElement.clientWidth - (rect?.right || 0)),
          bottom: Math.round(innerHeight - (rect?.bottom || 0)),
          width: Math.round(rect?.width || 0),
          height: Math.round(rect?.height || 0),
          labelWidth: Math.round(labelRect?.width || 0),
          iconBackground: iconStyle?.backgroundColor || '',
          panelWidth: Math.round(panelRect?.width || 0),
          destination: link?.href || '',
        };
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        resolve({ opened, closed: {
          panelActive: panel?.classList.contains('is-active') || false,
          expanded: trigger?.getAttribute('aria-expanded') || '',
          focusRestored: document.activeElement === trigger,
        } });
      }, 450));
    })()`);
    await page.click('.asanja-whatsapp');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const whatsappPointer = await page.evaluate(`(() => ({
      triggerActive: document.querySelector('.asanja-whatsapp')?.classList.contains('is-active') || false,
      panelActive: document.querySelector('.asanja-whatsapp-panel')?.classList.contains('is-active') || false,
      expanded: document.querySelector('.asanja-whatsapp')?.getAttribute('aria-expanded') || '',
    }))()`);
    const pass = carousel.originals === 4 && carousel.clones === 2 && carousel.active === 0
      && carousel.initial === carousel.final && carousel.duration === '0ms'
      && popup.opened.visible && popup.opened.ariaHidden === 'false' && popup.opened.entrance
      && popup.opened.duration === '700ms' && popup.opened.innerDelay === '500ms' && popup.opened.bodyLocked
      && popup.settled.visible && !popup.settled.entrance && popup.closing
      && !popup.closed.visible && popup.closed.ariaHidden === 'true' && !popup.closed.bodyLocked
      && whatsapp.opened.triggerActive && whatsapp.opened.panelActive
      && whatsapp.opened.expanded === 'true' && whatsapp.opened.panelHidden === 'false'
      && whatsapp.opened.right === 30 && whatsapp.opened.bottom === 30
      && whatsapp.opened.width === 56 && whatsapp.opened.height === 56
      && whatsapp.opened.labelWidth === 156 && whatsapp.opened.iconBackground === 'rgb(45, 183, 66)'
      && whatsapp.opened.panelWidth === 351
      && whatsapp.opened.destination === 'https://api.whatsapp.com/send?phone=255685700000'
      && !whatsapp.closed.panelActive && whatsapp.closed.expanded === 'false' && whatsapp.closed.focusRestored
      && whatsappPointer.triggerActive && whatsappPointer.panelActive && whatsappPointer.expanded === 'true'
      && !page.diagnostics.exceptions.length && !page.diagnostics.consoleErrors.length;
    return { name: 'desktop carousel, navigation and WhatsApp lifecycle', pass, carousel, popup, whatsapp, whatsappPointer, diagnostics: page.diagnostics };
  } finally {
    await page.close();
  }
}

async function parallax() {
  const page = await openPage('/asanja-moru/');
  try {
    await page.evaluate('new Promise((resolve) => setTimeout(resolve, 2000))');
    const result = await page.evaluate(`(() => {
      const foreground = document.querySelector('[data-settings*="motion_fx_translateY_effect"]');
      const background = document.querySelector('[data-settings*="background_motion_fx_scale_effect"]');
      const layer = background?.querySelector('.elementor-motion-effects-layer');
      const before = {
        foreground: foreground?.style.getPropertyValue('--translateY'),
        scale: layer?.style.getPropertyValue('--scale'),
        background: getComputedStyle(layer).backgroundImage,
        top: background?.getBoundingClientRect().top,
        height: background?.getBoundingClientRect().height,
        scrollY,
        documentHeight: document.documentElement.scrollHeight,
        bodyClass: document.body.className,
      };
      window.scrollTo(0, 500);
      return new Promise((resolve) => setTimeout(() => resolve({ before, after: {
        foreground: foreground?.style.getPropertyValue('--translateY'),
        scale: layer?.style.getPropertyValue('--scale'),
        background: getComputedStyle(layer).backgroundImage,
        top: background?.getBoundingClientRect().top,
        height: background?.getBoundingClientRect().height,
        scrollY,
        documentHeight: document.documentElement.scrollHeight,
        bodyClass: document.body.className,
      } }), 750));
    })()`);
    const pass = result.before.foreground !== result.after.foreground
      && Number(result.after.scale) > Number(result.before.scale)
      && result.after.background !== 'none'
      && !page.diagnostics.exceptions.length && !page.diagnostics.consoleErrors.length;
    return { name: 'scroll-linked foreground and background hero motion', pass, ...result, diagnostics: page.diagnostics };
  } finally {
    await page.close();
  }
}

async function mobile() {
  const page = await openPage('/', 390, 844);
  try {
    const result = await page.evaluate(`(() => {
      const hero = document.querySelector('.elementor-element-84c7292 .e-n-carousel');
      const wrapper = hero.querySelector('.swiper-wrapper');
      const before = wrapper.style.transform;
      hero.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 320 }));
      hero.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 80 }));
      const after = wrapper.style.transform;
      const whatsapp = document.querySelector('.asanja-whatsapp');
      const whatsappRect = whatsapp?.getBoundingClientRect();
      document.querySelector('a[href*="popup%3Aopen"], a[href*="popup:open"]').click();
      const submenuLink = document.querySelector('#elementor-popup-modal-1529 .mob-menu li.menu-item-has-children > a');
      submenuLink?.click();
      return {
        swipeMoves: before !== after,
        submenuOpen: submenuLink?.parentElement.classList.contains('asanja-submenu-open') || false,
        submenuExpanded: submenuLink?.getAttribute('aria-expanded') || '',
        whatsapp: {
          right: Math.round(document.documentElement.clientWidth - (whatsappRect?.right || 0)),
          bottom: Math.round(innerHeight - (whatsappRect?.bottom || 0)),
          width: Math.round(whatsappRect?.width || 0),
          height: Math.round(whatsappRect?.height || 0),
        },
        overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth + 3,
      };
    })()`);
    const pass = result.swipeMoves && result.submenuOpen && result.submenuExpanded === 'true' && !result.overflow
      && result.whatsapp.right === 30 && result.whatsapp.bottom === 30
      && result.whatsapp.width === 56 && result.whatsapp.height === 56
      && !page.diagnostics.exceptions.length && !page.diagnostics.consoleErrors.length;
    return { name: 'mobile swipe and popup submenu', pass, ...result, diagnostics: page.diagnostics };
  } finally {
    await page.close();
  }
}

for (const result of [await homeDesktop(), await parallax(), await mobile()]) {
  console.log(JSON.stringify(result));
  if (!result.pass) process.exitCode = 1;
}
