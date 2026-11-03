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

  const filePath = path.join(process.cwd(), 'public', 'legacy', ...parts, 'index.html');

  try {
    const html = await readFile(filePath, 'utf8');
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
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
