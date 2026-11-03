import { copyFile, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const publicRoot = path.resolve('public');
const legacyRoot = path.join(publicRoot, 'legacy');
const restore = process.argv.includes('--restore');

function backupSourceFor(reference) {
  const uploadPrefix = '/legacy/wp-content/uploads/';
  const pluginPrefix = '/legacy/wp-content/plugins/';
  if (reference.startsWith(uploadPrefix)) {
    return path.resolve('wordpress-source/uploads', reference.slice(uploadPrefix.length));
  }
  if (reference.startsWith(pluginPrefix)) {
    return path.resolve('wordpress-source/plugins', reference.slice(pluginPrefix.length));
  }
  return null;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

const missing = new Map();
const files = (await walk(legacyRoot)).filter((file) => /\.(?:html|css)$/i.test(file));

for (const file of files) {
  const content = (await readFile(file, 'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const references = [];
  for (const match of content.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) references.push(match[1]);
  for (const match of content.matchAll(/url\(\s*["']?([^)'"\s]+)["']?\s*\)/gi)) references.push(match[1]);

  for (const rawReference of references) {
    const reference = rawReference.replaceAll('&amp;', '&').split('#')[0].split('?')[0];
    if (!reference || /^(?:data:|https?:|mailto:|tel:|javascript:|#)/i.test(reference)) continue;

    let target;
    if (reference.startsWith('/legacy/')) target = path.join(publicRoot, reference);
    else if (reference.startsWith('/')) continue;
    else target = path.resolve(path.dirname(file), decodeURIComponent(reference));

    let exists = await stat(target).then((value) => value.isFile()).catch(() => false);
    if (!exists && restore) {
      const source = backupSourceFor(reference);
      const sourceExists = source && await stat(source).then((value) => value.isFile()).catch(() => false);
      if (sourceExists) {
        await mkdir(path.dirname(target), { recursive: true });
        await copyFile(source, target);
        exists = true;
      }
    }
    if (!exists) {
      const sources = missing.get(reference) ?? new Set();
      sources.add(path.relative(legacyRoot, file));
      missing.set(reference, sources);
    }
  }
}

for (const [reference, sources] of missing) {
  console.log(`${reference}\t${[...sources].slice(0, 3).join(', ')}`);
}

console.log(`Checked ${files.length} HTML/CSS files; ${missing.size} missing local asset references.`);
process.exitCode = missing.size ? 1 : 0;
