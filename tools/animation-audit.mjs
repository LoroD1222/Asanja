const baseUrl = process.argv[2] || 'http://127.0.0.1:3001';
const debuggerUrl = process.argv[3] || 'http://127.0.0.1:9224';
const requestedWidth = Number(process.argv[4] || 1440);

const routes = [
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

let nextId = 0;

async function openPage(pathname, { width = requestedWidth, reducedMotion = false } = {}) {
  const height = width <= 767 ? 844 : width <= 1024 ? 1024 : 900;
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
    if (message.method === 'Runtime.exceptionThrown') {
      diagnostics.exceptions.push(message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text);
    }
    if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
      diagnostics.consoleErrors.push((message.params.args || []).map((argument) => argument.value || argument.description || '').join(' '));
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
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 767 });
  if (reducedMotion) {
    await command('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  }
  await command('Page.navigate', { url: `${baseUrl.replace(/\/$/, '')}${pathname}` });
  await command('Page.bringToFront');
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ready = await command('Runtime.evaluate', {
      expression: `document.readyState === 'complete' && Boolean(document.querySelector('main')) && Boolean(document.querySelector('footer'))`,
      returnByValue: true,
    });
    if (ready.result?.value) break;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  await new Promise((resolve) => setTimeout(resolve, 900));

  return {
    height,
    diagnostics,
    async evaluate(expression) {
      const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    },
    async close() {
      socket.close();
      await fetch(`${debuggerUrl}/json/close/${target.id}`);
    },
  };
}

const motionState = `(() => {
  const main = document.querySelector('main');
  const animationTargets = [...main.querySelectorAll('[data-settings*="animation"]')]
    .filter((element) => {
      try {
        const settings = JSON.parse(element.dataset.settings || '{}');
        return Boolean(settings._animation || settings.animation);
      } catch { return false; }
    });
  const carousels = [...main.querySelectorAll('.e-n-carousel, .elementor-main-swiper, .elementor-loop-container')];
  return {
    animationTargets: animationTargets.length,
    invisible: animationTargets.filter((element) => element.classList.contains('elementor-invisible')).length,
    animated: animationTargets.filter((element) => element.classList.contains('animated')).length,
    unresolved: animationTargets
      .filter((element) => element.classList.contains('elementor-invisible'))
      .map((element) => ({
        id: [...element.classList].find((name) => name.startsWith('elementor-element-')) || '',
        top: Math.round(element.getBoundingClientRect().top),
        bottom: Math.round(element.getBoundingClientRect().bottom),
      })),
    motionLayers: main.querySelectorAll('.elementor-motion-effects-layer').length,
    motionElements: main.querySelectorAll('.elementor-motion-effects-element').length,
    carousels: carousels.length,
    fallbackCarousels: carousels.filter((element) => element.classList.contains('asanja-carousel-fallback')).length,
    loopClones: main.querySelectorAll('.asanja-loop-clone').length,
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth + 3,
    headerPosition: getComputedStyle(document.querySelector('header')).position,
  };
})()`;

for (const route of routes) {
  const page = await openPage(route);
  try {
    const initial = await page.evaluate(motionState);
    await page.evaluate(`document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')`);
    for (let targetIndex = 0; targetIndex < initial.animationTargets; targetIndex += 1) {
      await page.evaluate(`(() => {
        const targets = [...document.querySelectorAll('main [data-settings*="animation"]')]
          .filter((element) => {
            try {
              const settings = JSON.parse(element.dataset.settings || '{}');
              return Boolean(settings._animation || settings.animation);
            } catch { return false; }
          });
        const target = targets[${targetIndex}];
        if (!target) return;
        const rect = target.getBoundingClientRect();
        window.scrollTo(0, window.scrollY + rect.top - (window.innerHeight * 0.2));
      })()`);
      await new Promise((resolve) => setTimeout(resolve, 220));
    }
    await page.evaluate(`window.scrollTo(0, document.documentElement.scrollHeight)`);
    await new Promise((resolve) => setTimeout(resolve, 180));
    const final = await page.evaluate(motionState);
    console.log(JSON.stringify({
      route,
      width: requestedWidth,
      initial,
      final,
      diagnostics: page.diagnostics,
      pass: final.invisible === 0
        && final.animationTargets === final.animated
        && !final.overflow
        && final.headerPosition === 'static'
        && page.diagnostics.exceptions.length === 0
        && page.diagnostics.consoleErrors.length === 0,
    }));
  } finally {
    await page.close();
  }
}

if (baseUrl.includes('127.0.0.1') || baseUrl.includes('localhost')) {
  const page = await openPage('/', { width: requestedWidth, reducedMotion: true });
  try {
    const before = await page.evaluate(`(() => {
      const hero = document.querySelector('.elementor-element-84c7292 .swiper-wrapper');
      return { state: ${motionState}, heroTransform: hero?.style.transform || '' };
    })()`);
    await new Promise((resolve) => setTimeout(resolve, 5600));
    const after = await page.evaluate(`(() => {
      const hero = document.querySelector('.elementor-element-84c7292 .swiper-wrapper');
      return { state: ${motionState}, heroTransform: hero?.style.transform || '' };
    })()`);
    console.log(JSON.stringify({
      route: '/',
      width: requestedWidth,
      reducedMotion: true,
      before,
      after,
      pass: before.state.invisible === 0
        && before.heroTransform === after.heroTransform
        && page.diagnostics.exceptions.length === 0,
    }));
  } finally {
    await page.close();
  }
}
