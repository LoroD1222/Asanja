import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/legacy');

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

function text(match) {
  return match?.[1]?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? '';
}

const pages = (await walk(root)).filter((file) => {
  if (!file.endsWith('index.html')) return false;
  const relative = path.relative(root, file);
  return !relative.startsWith('wp-content/') && !relative.startsWith('wp-includes/');
});

let issues = 0;
for (const page of pages.sort()) {
  const html = await readFile(page, 'utf8');
  const relative = path.relative(root, page);
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const h3s = [...html.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)];
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((item) => item[0]);
  const missingAlt = images.filter((image) => {
    if (!/\balt\s*=/i.test(image)) return true;
    if (/\balt\s*=\s*["']["']/i.test(image) && !/\baria-hidden\s*=\s*["']true["']/i.test(image)) return true;
    return false;
  }).length;
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i));
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1] ?? '';
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)/i)?.[1] ?? '';
  const keywords = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']*)/i)?.[1] ?? '';
  const pageIssues = [];
  if (h1s.length !== 1) pageIssues.push(`h1=${h1s.length}`);
  if (!title) pageIssues.push('title');
  if (!description) pageIssues.push('description');
  if (!canonical.startsWith('https://asanjaafrica.com/')) pageIssues.push('canonical');
  if (!keywords) pageIssues.push('keywords');
  if (missingAlt) pageIssues.push(`alt=${missingAlt}`);
  issues += pageIssues.length;
  console.log(`${relative}\tH1:${h1s.length} H2:${h2s.length} H3:${h3s.length}\t${pageIssues.join(',') || 'OK'}\t${text(h1s[0])}`);
}

console.log(`Audited ${pages.length} pages; ${issues} issue flags.`);
process.exitCode = issues ? 1 : 0;
