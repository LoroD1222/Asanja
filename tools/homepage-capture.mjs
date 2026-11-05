import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.argv[2];
const outputRoot = process.argv[3];
const label = process.argv[4] || 'homepage';
const debuggerUrl = process.argv[5] || 'http://127.0.0.1:9224';
const viewportFilter = process.argv[6];

if (!baseUrl || !outputRoot) {
  throw new Error('Usage: node tools/homepage-capture.mjs <baseUrl> <outputDir> [label] [debuggerUrl]');
}

await mkdir(outputRoot, { recursive: true });

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
].filter((viewport) => !viewportFilter || viewport.name === viewportFilter);

if (viewportFilter && viewports.length === 0) {
  throw new Error(`Unknown viewport "${viewportFilter}".`);
}

let nextId = 0;

async function openPage(viewport) {
  const target = await fetch(`${debuggerUrl}/json/new?${encodeURIComponent('about:blank')}`, {
    method: 'PUT',
  }).then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const diagnostics = { exceptions: [], consoleErrors: [] };

  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') {
      diagnostics.exceptions.push(
        message.params?.exceptionDetails?.exception?.description
          || message.params?.exceptionDetails?.text
          || 'Unknown runtime exception',
      );
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
      diagnostics.consoleErrors.push(
        (message.params.args || []).map((argument) => argument.value || argument.description || '').join(' '),
      );
    }
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
  await command('Page.enable');
  await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width <= 767,
  });
  await command('Page.navigate', { url: `${baseUrl.replace(/\/$/, '')}/` });

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const result = await command('Runtime.evaluate', {
      expression: `document.readyState === 'complete' && Boolean(document.querySelector('main')) && Boolean(document.querySelector('footer'))`,
      returnByValue: true,
    });
    if (result.result?.value) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  await new Promise((resolve) => setTimeout(resolve, 5500));

  return {
    command,
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
    async screenshot(filePath, clip) {
      const result = await command('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 88,
        fromSurface: true,
        captureBeyondViewport: true,
        ...(clip ? { clip: { ...clip, scale: 1 } } : {}),
      });
      await writeFile(filePath, Buffer.from(result.data, 'base64'));
    },
    diagnostics,
    async close() {
      socket.close();
      await fetch(`${debuggerUrl}/json/close/${target.id}`);
    },
  };
}

const metricsExpression = `(() => {
  const rect = (element) => {
    if (!element) return null;
    const box = element.getBoundingClientRect();
    return {
      x: Number((box.x + scrollX).toFixed(1)),
      y: Number((box.y + scrollY).toFixed(1)),
      width: Number(box.width.toFixed(1)),
      height: Number(box.height.toFixed(1)),
    };
  };
  const text = (element) => (element?.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 120);
  const main = document.querySelector('main');
  const topSections = [...main.querySelectorAll('.e-con.e-parent')]
    .filter((element) => !element.parentElement?.closest('.e-con.e-parent'));
  const hero = document.querySelector('.elementor-element-84c7292');
  const camps = document.querySelector('.elementor-element-24265c3');
  const safaris = document.querySelector('.elementor-element-bafd258');
  const footer = document.querySelector('footer');
  const widgetState = (widget) => {
    const carousel = widget?.querySelector('.e-n-carousel, .elementor-main-swiper, .elementor-loop-container');
    const slides = [...(carousel?.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide') || [])];
    return {
      rect: rect(carousel),
      className: carousel?.className || '',
      gap: carousel ? getComputedStyle(carousel.querySelector(':scope > .swiper-wrapper')).gap : null,
      transform: carousel?.querySelector(':scope > .swiper-wrapper')?.style.transform || '',
      slides: slides.map((slide, index) => ({
        index,
        rect: rect(slide),
        hidden: slide.getAttribute('aria-hidden'),
        opacity: getComputedStyle(slide).opacity,
        visibility: getComputedStyle(slide).visibility,
        text: text(slide),
      })),
    };
  };
  return {
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight },
    documentHeight: document.documentElement.scrollHeight,
    header: rect(document.querySelector('header')),
    sections: topSections.map((section, index) => ({
      index,
      id: section.className.match(/elementor-element-([\\w]+)/)?.[1] || '',
      rect: rect(section),
      text: text(section),
      background: getComputedStyle(section).backgroundColor,
    })),
    headings: [...main.querySelectorAll('h1,h2,h3')].filter((heading) => {
      const box = heading.getBoundingClientRect();
      return box.x > -100 && box.x < innerWidth + 100;
    }).map((heading) => ({
      tag: heading.tagName,
      text: text(heading),
      rect: rect(heading),
      fontFamily: getComputedStyle(heading).fontFamily,
      fontSize: getComputedStyle(heading).fontSize,
      lineHeight: getComputedStyle(heading).lineHeight,
      fontWeight: getComputedStyle(heading).fontWeight,
      textAlign: getComputedStyle(heading).textAlign,
    })),
    hero: {
      ...widgetState(hero),
      backgrounds: [...(hero?.querySelectorAll('.swiper-slide') || [])].map((slide) => (
        [...slide.querySelectorAll('.e-con')].map((element) => ({
          id: element.className.match(/elementor-element-([\\w]+)/)?.[1] || '',
          image: getComputedStyle(element).backgroundImage,
          position: getComputedStyle(element).backgroundPosition,
          size: getComputedStyle(element).backgroundSize,
        })).filter((item) => item.image !== 'none')
      )),
    },
    camps: widgetState(camps),
    safaris: widgetState(safaris),
    footer: {
      rect: rect(footer),
      elements: ['.elementor-widget-image', '.elementor-widget-heading', '.elementor-widget-form']
        .flatMap((selector) => [...footer.querySelectorAll(selector)].map((element) => ({
          selector,
          id: element.className.match(/elementor-element-([\\w]+)/)?.[1] || '',
          rect: rect(element),
          text: text(element),
        }))),
    },
    performance: {
      navigation: performance.getEntriesByType('navigation').map((entry) => ({
        domContentLoaded: Math.round(entry.domContentLoadedEventEnd),
        load: Math.round(entry.loadEventEnd),
        transferSize: entry.transferSize,
      })),
      resources: performance.getEntriesByType('resource').length,
    },
  };
})()`;

for (const viewport of viewports) {
  const page = await openPage(viewport);
  try {
    let metrics = await page.evaluate(metricsExpression);
    const sections = [...metrics.sections, { id: 'footer', rect: metrics.footer.rect }];

    await page.screenshot(path.join(outputRoot, `${label}-${viewport.name}-top.jpg`), {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });
    for (const section of sections) {
      if (!section.rect || section.rect.height <= 0) continue;
      await page.evaluate(`window.scrollTo(0, ${Math.max(0, section.rect.y - 20)})`);
      await new Promise((resolve) => setTimeout(resolve, 700));
      const height = Math.min(viewport.height, section.rect.height + 40);
      await page.screenshot(path.join(outputRoot, `${label}-${viewport.name}-${section.id}.jpg`), {
        x: 0,
        y: Math.max(0, section.rect.y - 20),
        width: viewport.width,
        height,
      });
    }
    metrics = await page.evaluate(metricsExpression);
    metrics.diagnostics = page.diagnostics;
    await writeFile(
      path.join(outputRoot, `${label}-${viewport.name}.json`),
      `${JSON.stringify(metrics, null, 2)}\n`,
    );
    console.log(JSON.stringify({ label, viewport: viewport.name, ...metrics.viewport, documentHeight: metrics.documentHeight }));
  } finally {
    await page.close();
  }
}
