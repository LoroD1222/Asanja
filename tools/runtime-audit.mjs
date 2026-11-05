import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.argv[2] || 'http://127.0.0.1:3001';
const debuggerUrl = process.argv[3] || 'http://127.0.0.1:9224';
const screenshotDir = process.env.ASANJA_SCREENSHOT_DIR;

if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

let nextId = 0;

async function openPage(pathname, { width = 1440, height = 1000, waitMs = 2500 } = {}) {
  const target = await fetch(`${debuggerUrl}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  function command(method, params = {}) {
    const id = ++nextId;
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  }

  await command('Runtime.enable');
  await command('Network.enable');
  await command('Network.setCacheDisabled', { cacheDisabled: true });
  await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 767,
  });
  await command('Page.navigate', { url: `${baseUrl}${pathname}` });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const readiness = await command('Runtime.evaluate', {
      expression: `location.href.startsWith(${JSON.stringify(`${baseUrl}${pathname}`)}) && document.readyState === 'complete' && Boolean(document.body?.children.length)`,
      returnByValue: true,
    });
    if (readiness.result?.value) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  return {
    async evaluate(expression) {
      const result = await command('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) {
        throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      }
      return result.result.value;
    },
    async screenshot(filePath) {
      const result = await command('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 82,
        fromSurface: true,
      });
      await writeFile(filePath, Buffer.from(result.data, 'base64'));
    },
    close() {
      socket.close();
      return fetch(`${debuggerUrl}/json/close/${target.id}`);
    },
  };
}

const checks = [
  {
    path: '/asanja-moru/',
    expression: `(() => {
      const widget = document.querySelector('.elementor-widget-media-carousel');
      const carousel = widget?.querySelector('.elementor-main-swiper');
      const image = widget?.querySelector('.elementor-carousel-image');
      const before = carousel?.querySelector(':scope > .swiper-wrapper')?.style.transform;
      widget?.querySelector('.swiper-pagination-bullet:nth-child(2)')?.click();
      const after = carousel?.querySelector(':scope > .swiper-wrapper')?.style.transform;
      const originalLightboxLink = [...(widget?.querySelectorAll('a[data-elementor-open-lightbox="yes"]') || [])]
        .find((link) => !link.closest('.asanja-loop-clone'));
      originalLightboxLink?.click();
      return {
        mediaCarousel: Boolean(widget),
        initialized: carousel?.classList.contains('swiper-initialized') || carousel?.classList.contains('asanja-carousel-fallback'),
        slideCount: widget?.querySelectorAll('.swiper-slide:not(.asanja-loop-clone)').length || 0,
        firstImage: getComputedStyle(image).backgroundImage,
        width: Math.round(carousel?.getBoundingClientRect().width || 0),
        paginationMoves: before !== after,
        lightboxOpens: document.querySelector('.asanja-lightbox')?.classList.contains('asanja-lightbox-visible'),
      };
    })()`,
  },
  {
    path: '/safaris/',
    expression: `(() => {
      const tabs = [...document.querySelectorAll('.e-n-tab-title')];
      const panels = [...document.querySelectorAll('.e-n-tabs-content > [role="tabpanel"]')];
      const second = tabs[1];
      second?.click();
      const loop = document.querySelector('.elementor-widget-loop-carousel .elementor-loop-container');
      const before = [...(loop?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide') || [])]
        .findIndex((slide) => slide.classList.contains('asanja-slide-active'));
      document.querySelector('.elementor-widget-loop-carousel .elementor-swiper-button-next')?.click();
      const after = [...(loop?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide') || [])]
        .findIndex((slide) => slide.classList.contains('asanja-slide-active'));
      return {
        tabs: tabs.length,
        selectedTab: tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true') + 1,
        activePanels: panels.filter((panel) => panel.classList.contains('e-active') && !panel.hidden).length,
        loopInitialized: loop?.classList.contains('swiper-initialized') || loop?.classList.contains('asanja-carousel-fallback'),
        loopSlides: loop?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide').length || 0,
        loopArrowMoves: before !== after,
      };
    })()`,
  },
  {
    path: '/faqs/',
    expression: `(() => {
      const accordion = document.querySelector('.e-n-accordion');
      const items = [...(accordion?.querySelectorAll(':scope > details') || [])];
      items[0]?.querySelector('summary')?.click();
      items[1]?.querySelector('summary')?.click();
      return {
        itemCount: document.querySelectorAll('.e-n-accordion-item').length,
        openInFirstGroup: items.filter((item) => item.open).length,
        expandedMatchesOpen: items.every((item) => item.querySelector('summary')?.getAttribute('aria-expanded') === String(item.open)),
      };
    })()`,
  },
  {
    path: '/asanja-reviews/',
    expression: `(() => {
      const carousel = document.querySelector('.elementor-widget-reviews .elementor-main-swiper');
      const before = [...(carousel?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide') || [])]
        .findIndex((slide) => slide.classList.contains('asanja-slide-active'));
      document.querySelector('.elementor-widget-reviews .elementor-swiper-button-next')?.click();
      const after = [...(carousel?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide') || [])]
        .findIndex((slide) => slide.classList.contains('asanja-slide-active'));
      return {
        initialized: carousel?.classList.contains('swiper-initialized') || carousel?.classList.contains('asanja-carousel-fallback'),
        slideCount: carousel?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide').length || 0,
        width: Math.round(carousel?.getBoundingClientRect().width || 0),
        arrowMoves: before !== after,
      };
    })()`,
  },
  {
    path: '/make-a-booking/',
    expression: `(() => {
      const fallback = document.querySelector('form[name="Booking_request_form"]');
      const shortcode = document.querySelector('.elementor-element-a852b01');
      return {
        fallbackVisible: Boolean(fallback && fallback.getBoundingClientRect().height > 0),
        shortcodeHidden: Boolean(shortcode && getComputedStyle(shortcode).display === 'none'),
        requiredFields: fallback?.querySelectorAll('[required]').length || 0,
        honeypot: Boolean(fallback?.querySelector('[name="website"]')),
      };
    })()`,
  },
  {
    path: '/plan-my-stay/',
    expression: `(() => {
      const fallback = document.querySelector('form[name="Plan_your_trip_form"]');
      const shortcode = document.querySelector('.elementor-element-56de3f5');
      return {
        fallbackVisible: Boolean(fallback && fallback.getBoundingClientRect().height > 0),
        shortcodeHidden: Boolean(shortcode && getComputedStyle(shortcode).display === 'none'),
        requiredFields: fallback?.querySelectorAll('[required]').length || 0,
        honeypot: Boolean(fallback?.querySelector('[name="website"]')),
      };
    })()`,
  },
];

for (const check of checks) {
  const page = await openPage(check.path);
  try {
    console.log(JSON.stringify({ path: check.path, ...(await page.evaluate(check.expression)) }));
  } finally {
    await page.close();
  }
}

const requestedRoute = process.argv[4];
const routes = requestedRoute ? [requestedRoute] : [
  '/', '/about/', '/asanja-moru/', '/asanja-nyasirori/', '/asanja-reviews/', '/asanja-ruaha/',
  '/asanja-sri-bustani/', '/asanja-under-the-stars/', '/camps-and-lodges/', '/contact/',
  '/contact/thank-you/', '/experiences/', '/faqs/', '/make-a-booking/', '/plan-my-stay/',
  '/privacy-policy/', '/safaris/', '/terms/', '/blogs/',
  '/asanja_safaris/an-exclusive-safari-escape-a-family-or-friends-adventure-in-the-serengeti-with-just-3-tents-its-yours-alone/',
  '/asanja_safaris/from-i-do-to-dreams-come-true-the-perfect-honeymoon/',
  '/asanja_safaris/migration-madness/',
  '/asanja_safaris/tanzania-a-journey-through-natures-masterpieces/',
  '/asanja_safaris/wild-treasures-of-tanzania/',
];

for (const width of [390, 768, 1440]) {
  const failures = [];
  for (const route of routes) {
    const page = await openPage(route, { width, height: width === 390 ? 844 : 1000, waitMs: 900 });
    try {
      const result = await page.evaluate(`(() => ({
        h1: document.querySelectorAll('h1').length,
        main: Boolean(document.querySelector('main')),
        footer: Boolean(document.querySelector('footer')),
        whatsapp: Boolean(document.querySelector('.asanja-whatsapp')),
        liveIntroCopy: ${JSON.stringify(route !== '/blogs/')}
          ? document.body.innerText.includes("Thank you for reading this post, don't forget to subscribe!")
          : !document.body.innerText.includes("Thank you for reading this post, don't forget to subscribe!"),
        headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
        overflow: Math.max(document.documentElement?.scrollWidth || 0, document.body?.scrollWidth || 0) > innerWidth + 3,
        brokenImages: [...document.images].filter((image) => image.hasAttribute('src') && image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
      }))()`);
      if (screenshotDir) {
        const slug = route === '/' ? 'home' : route.replace(/^\/+|\/+$/g, '').replaceAll('/', '__');
        await page.screenshot(path.join(screenshotDir, `${width}-${slug}.jpg`));
      }
      if (result.h1 !== 1 || !result.main || !result.footer || !result.whatsapp || !result.liveIntroCopy
        || !/Arial|Helvetica|sans-serif/i.test(result.headingFont) || result.overflow || result.brokenImages.length) {
        failures.push({ route, ...result });
      }
    } finally {
      await page.close();
    }
  }
  console.log(JSON.stringify({ layoutWidth: width, checked: routes.length, failures }));
}
