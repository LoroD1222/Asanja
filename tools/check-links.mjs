import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const publicRoot = path.resolve('public');
const legacyRoot = path.join(publicRoot, 'legacy');
const appRoot = path.resolve('app');
const siteOrigin = 'https://asanjaafrica.com';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

const htmlFiles = (await walk(legacyRoot)).filter((file) => file.endsWith('.html'));
const appRoutePatterns = (await walk(appRoot))
  .filter((file) => /\/(?:page|route)\.(?:js|jsx|ts|tsx)$/.test(file))
  .map((file) => path.relative(appRoot, path.dirname(file)).split(path.sep))
  .filter((segments) => !segments.includes('api') && !segments.some((segment) => segment.startsWith('[[...')))
  .map((segments) => {
    const route = segments.map((segment) => {
      if (/^\[\.\.\..+\]$/.test(segment)) return '.+';
      if (/^\[.+\]$/.test(segment)) return '[^/]+';
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('/');
    return new RegExp(`^/${route ? `${route}/?` : ''}$`);
  });
const failures = [];
let checked = 0;

for (const file of htmlFiles) {
  const relative = path.relative(legacyRoot, file);
  const route = relative === 'index.html' ? '/' : `/${path.dirname(relative).split(path.sep).join('/')}/`;
  const html = (await readFile(file, 'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const href = match[1].replaceAll('&amp;', '&').trim();
    if (!href || /^(?:#|mailto:|tel:|javascript:)/i.test(href)) continue;

    let target;
    try {
      target = new URL(href, `${siteOrigin}${route}`);
    } catch {
      failures.push({ route, href, reason: 'invalid URL' });
      continue;
    }

    if (!['asanjaafrica.com', 'www.asanjaafrica.com', '127.0.0.1', 'localhost'].includes(target.hostname)) continue;
    checked += 1;
    if (target.searchParams.has('p')) continue;

    const pathname = decodeURIComponent(target.pathname);
    const candidates = pathname.startsWith('/legacy/')
      ? [path.join(publicRoot, pathname)]
      : [
          path.join(legacyRoot, pathname, 'index.html'),
          path.join(publicRoot, pathname),
        ];
    const exists = appRoutePatterns.some((pattern) => pattern.test(pathname))
      || (await Promise.all(candidates.map((candidate) => stat(candidate).then(() => true).catch(() => false)))).some(Boolean);
    if (!exists) failures.push({ route, href, reason: `missing ${pathname}` });
  }
}

for (const failure of failures) {
  console.log(`${failure.route}\t${failure.href}\t${failure.reason}`);
}
console.log(`Checked ${checked} internal links across ${htmlFiles.length} pages; ${failures.length} broken.`);
process.exitCode = failures.length ? 1 : 0;
