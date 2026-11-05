import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const legacyPostRoutes: Record<string, string> = {
  '31': '/about/',
  '33': '/contact/',
  '414': '/privacy-policy/',
  '433': '/contact/thank-you/',
  '1074': '/camps-and-lodges/',
  '1076': '/safaris/',
  '1078': '/make-a-booking/',
  '1757': '/asanja-moru/',
  '2601': '/asanja-sri-bustani/',
  '2627': '/asanja-nyasirori/',
  '2671': '/asanja-ruaha/',
  '2692': '/asanja-under-the-stars/',
  '2745': '/experiences/',
  '2747': '/faqs/',
  '2749': '/plan-my-stay/',
  '3057': '/asanja-reviews/',
  '37072': '/blogs/',
  '37383': '/terms/',
};

const legacyPathRoutes = new Map<string, string>();

function addLegacyPaths(target: string, paths: string[]) {
  for (const source of paths) legacyPathRoutes.set(source.replace(/^\/+|\/+$/g, ''), target);
}

addLegacyPaths('/safaris/', [
  'tanzania-safaris',
  'tanzania-safaris/tanzania-southern-circuit-safaris',
  'tanzania-safaris/honeymoon-safari-tanzania',
  'tanzania-safaris/asanja-7-nights-8-days-serengeti-safari',
  'tanzania-safaris/asanja-8-nights-9-days-serengeti-safari',
  'tanzania-safaris/asanja-6-nights-7-days-serengeti-safari',
  'tanzania-safaris/asanja-4-nights-5-days-serengeti-safari',
  'tanzania-safaris/serengeti-national-park-safaris',
  'tanzania-safaris/asanja-7-nights-8-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/3-nights-4-days-serengeti-safari-moru',
  'tanzania-safaris/asanja-3-nights-4-days-serengeti-safari-grumeti',
  'tanzania-safaris/asanja-5-nights-6-days-serengeti-safari',
  'tanzania-safaris/asanja-6-nights-7-days-ruaha-national-park-safari',
  'tanzania-safaris/asanja-5-nights-6-days-ruaha-national-park-safari',
  'tanzania-safaris/asanja-6-nights-7-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/asanja-5-nights-6-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/asanja-4-nights-5-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/asanja-9-nights-10-days-tanzania-northern-circuit-safari',
  'tanzania-safaris/tanzania-northern-circuit-safaris',
]);

addLegacyPaths('/', ['my-account', 'checkout', 'video-gallery']);
addLegacyPaths('/contact/', ['contact-us']);
addLegacyPaths('/plan-my-stay/', ['flights']);
addLegacyPaths('/asanja-nyasirori/', ['asanja-camps/asanja-nyasirori-camp']);
addLegacyPaths('/asanja-moru/', ['asanja-camps/asanja-moru-camp']);
addLegacyPaths('/asanja-ruaha/', ['asanja-camps/asanja-ruaha-lodge']);
addLegacyPaths('/asanja-sri-bustani/', ['asanja-camps/asanja-grumeti-camp']);
addLegacyPaths('/camps-and-lodges/', ['asanja-camps']);

function safeRoutePath(parts: string[]) {
  let clean: string[];
  try {
    clean = parts.filter(Boolean).map((part) => decodeURIComponent(part));
  } catch {
    return null;
  }
  if (clean.some((part) => part === '..' || part.includes('/') || part.includes('\\'))) {
    return null;
  }
  return clean;
}

export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
  const parts = safeRoutePath(params.path ?? []);

  if (!parts) {
    return new Response('Bad request', { status: 400 });
  }

  if (parts.length === 0) {
    const legacyPostId = new URL(request.url).searchParams.get('p');
    if (legacyPostId && legacyPostRoutes[legacyPostId]) {
      return new Response(null, {
        status: 301,
        headers: { Location: legacyPostRoutes[legacyPostId] },
      });
    }
  }

  const legacyTarget = legacyPathRoutes.get(parts.join('/'));
  if (legacyTarget) {
    return new Response(null, {
      status: 301,
      headers: { Location: legacyTarget },
    });
  }

  const filePath = path.join(process.cwd(), 'public', 'legacy', ...parts, 'index.html');

  try {
    const html = await readFile(filePath, 'utf8');
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
        'X-Migrated-From': 'WordPress',
      },
    });
  } catch {
    const notFoundPath = path.join(process.cwd(), 'public', 'legacy', '404', 'index.html');
    const fallback = await readFile(notFoundPath, 'utf8').catch(() => '<h1>Page not found</h1>');
    return new Response(fallback, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
