import { mkdir, readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('public/legacy');
const productionOrigin = 'https://asanjaafrica.com';
const routeById = new Map([
  ['9', '/'],
  ['31', '/about/'],
  ['33', '/contact/'],
  ['414', '/privacy-policy/'],
  ['433', '/contact/thank-you/'],
  ['1074', '/camps-and-lodges/'],
  ['1076', '/safaris/'],
  ['1078', '/make-a-booking/'],
  ['1757', '/asanja-moru/'],
  ['2601', '/asanja-sri-bustani/'],
  ['2627', '/asanja-nyasirori/'],
  ['2671', '/asanja-ruaha/'],
  ['2692', '/asanja-under-the-stars/'],
  ['2745', '/experiences/'],
  ['2747', '/faqs/'],
  ['2749', '/plan-my-stay/'],
  ['3057', '/asanja-reviews/'],
  ['37072', '/blogs/'],
  ['37383', '/terms/'],
]);

const seoByRoute = {
  '/': {
    keywords: 'Tanzania luxury safaris, private Tanzania safari, Serengeti luxury camps, tailor-made African safari, Asanja Africa',
  },
  '/about/': {
    keywords: 'Asanja Africa story, Tanzania safari company, luxury safari experts, authentic African safaris',
  },
  '/camps-and-lodges/': {
    keywords: 'luxury safari camps Tanzania, Serengeti camps, Ruaha safari lodge, Asanja Africa camps',
  },
  '/asanja-moru/': {
    keywords: 'Asanja Moru, Moru Kopjes camp, luxury Serengeti camp, Central Serengeti accommodation',
  },
  '/asanja-sri-bustani/': {
    keywords: 'Asanja Siri Bustani, Grumeti safari camp, Great Migration camp, Western Serengeti accommodation',
  },
  '/asanja-nyasirori/': {
    keywords: 'Asanja Nyasirori, Western Serengeti camp, luxury safari accommodation Tanzania',
  },
  '/asanja-ruaha/': {
    keywords: 'Asanja Ndembo Ruaha, Ruaha safari camp, luxury Ruaha accommodation, southern Tanzania safari',
  },
  '/asanja-under-the-stars/': {
    keywords: 'Asanja Under the Stars, fly camping Tanzania, luxury wilderness camping, Serengeti stargazing',
  },
  '/safaris/': {
    keywords: 'Tanzania safari itineraries, luxury African safari packages, Serengeti safari, private Tanzania tours',
  },
  '/experiences/': {
    keywords: 'Tanzania safari experiences, game drives, Great Migration, walking safari, authentic African experiences',
  },
  '/asanja-reviews/': {
    keywords: 'Asanja Africa reviews, Tanzania safari testimonials, luxury safari guest reviews',
  },
  '/faqs/': {
    keywords: 'Tanzania safari FAQ, safari planning questions, Tanzania travel advice, Asanja Africa',
  },
  '/contact/': {
    keywords: 'contact Asanja Africa, Tanzania safari enquiry, safari travel specialists',
  },
  '/plan-my-stay/': {
    keywords: 'plan Tanzania safari, custom safari itinerary, request safari quote, Asanja Africa booking',
  },
  '/make-a-booking/': {
    keywords: 'book Tanzania safari, Asanja Africa booking, luxury safari reservation, safari enquiry',
  },
  '/blogs/': {
    keywords: 'Tanzania safari blog, Serengeti travel guide, African wildlife stories, safari planning tips',
  },
  '/privacy-policy/': {
    keywords: 'Asanja Africa privacy policy, safari website privacy',
  },
  '/terms/': {
    keywords: 'Asanja Africa terms and conditions, Tanzania safari booking terms',
  },
  '/contact/thank-you/': {
    keywords: 'Asanja Africa enquiry confirmation',
    noindex: true,
  },
  '/asanja_safaris/tanzania-a-journey-through-natures-masterpieces/': {
    description: 'Explore Tanzania’s natural masterpieces on a private Asanja Africa safari featuring exceptional wildlife, iconic landscapes and luxury camps.',
    keywords: 'Tanzania safari itinerary, northern Tanzania safari, luxury wildlife safari, Asanja Africa itinerary',
  },
  '/asanja_safaris/from-i-do-to-dreams-come-true-the-perfect-honeymoon/': {
    description: 'Celebrate your honeymoon with a romantic private safari through Tanzania, combining remarkable wildlife encounters with intimate luxury camps.',
    keywords: 'Tanzania honeymoon safari, romantic African safari, luxury safari honeymoon, Asanja Africa honeymoon',
  },
  '/asanja_safaris/migration-madness/': {
    description: 'Follow the Great Migration through the Serengeti on a private seven-night Asanja Africa safari staying at Moru and Siri Bustani.',
    keywords: 'Great Migration safari, Serengeti migration itinerary, Asanja Moru, Asanja Siri Bustani',
  },
  '/asanja_safaris/wild-treasures-of-tanzania/': {
    description: 'Discover Tanzania’s wild treasures on a tailor-made luxury safari with private game drives, expert guiding and authentic Asanja camps.',
    keywords: 'Tanzania luxury safari itinerary, private game drives, Serengeti wildlife safari, Asanja Africa',
  },
  '/asanja_safaris/an-exclusive-safari-escape-a-family-or-friends-adventure-in-the-serengeti-with-just-3-tents-its-yours-alone/': {
    description: 'Enjoy an exclusive Serengeti safari escape for family or friends with a private three-tent camp and a tailor-made Asanja Africa adventure.',
    keywords: 'exclusive Serengeti safari, private safari camp, family Tanzania safari, friends safari adventure',
  },
};

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

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
}

function humanizeImageName(source) {
  const filename = decodeURIComponent(source.split('/').pop()?.split('?')[0] ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-\d+x\d+$/i, '')
    .replace(/-scaled$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\d{8,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/logo|favicon/i.test(filename)) return 'Asanja Africa';
  if (/icon banner arrow|tear\d*/i.test(filename)) return '';
  return filename || 'Asanja Africa safari experience';
}

function optimizeImages(html) {
  let seen = 0;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    seen += 1;
    const source = tag.match(/\bsrc=["']([^"']+)/i)?.[1] ?? '';
    const inferredAlt = humanizeImageName(source);
    let optimized = tag;

    if (/\balt=["']["']/i.test(optimized)) {
      optimized = optimized.replace(/\balt=["']["']/i, `alt="${escapeAttribute(inferredAlt)}"`);
    } else if (!/\balt=/i.test(optimized)) {
      optimized = optimized.replace(/\s*\/>$/, ` alt="${escapeAttribute(inferredAlt)}" />`);
    }

    if (!/\bdecoding=/i.test(optimized)) {
      optimized = optimized.replace(/\s*\/>$/, ' decoding="async" />');
    }
    if (seen > 2 && !/\bloading=/i.test(optimized)) {
      optimized = optimized.replace(/\s*\/>$/, ' loading="lazy" />');
    }
    if (!inferredAlt && !/\baria-hidden=/i.test(optimized)) {
      optimized = optimized.replace(/\s*\/>$/, ' aria-hidden="true" />');
    }
    return optimized;
  });
}

function normalizeHeadings(html) {
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)];
  if (h1Matches.length > 1) {
    let seen = 0;
    html = html.replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi, (_match, attributes, contents) => {
      seen += 1;
      return seen === 1 ? `<h1${attributes}>${contents}</h1>` : `<div${attributes}>${contents}</div>`;
    });
  }

  if (!/<h1\b/i.test(html)) {
    const dynamicTitle = /<h4(\b[^>]*)>([\s\S]*?)<\/h4>/i;
    const firstSectionTitle = /<h2(\b[^>]*)>([\s\S]*?)<\/h2>/i;
    html = dynamicTitle.test(html)
      ? html.replace(dynamicTitle, '<h1$1>$2</h1>')
      : html.replace(firstSectionTitle, '<h1$1>$2</h1>');
  }

  html = html.replace(/<h6(\b[^>]*)>\s*highlights\s*<\/h6>/gi, '<h2$1>Highlights</h2>');
  html = html.replace(/<h6(\b[^>]*)>([\s\S]*?)<\/h6>/gi, '<p$1>$2</p>');
  return html;
}

function optimizeSchema(html) {
  return html.replace(
    /(<script[^>]+type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,
    (match, opening, json, closing) => {
      try {
        const schema = JSON.parse(json);
        const visit = (value) => {
          if (Array.isArray(value)) return value.map(visit);
          if (value && typeof value === 'object') {
            for (const [key, item] of Object.entries(value)) {
              if (key === 'potentialAction' && value['@type'] === 'WebSite') {
                delete value[key];
              } else {
                value[key] = visit(item);
              }
            }
            return value;
          }
          if (typeof value === 'string') {
            return value
              .replace(/^http:\/\/127\.0\.0\.1:8080/, productionOrigin)
              .replace(/^https?:\/\/(?:new\.)?asanjaafrica\.com/, productionOrigin);
          }
          return value;
        };
        return `${opening}${JSON.stringify(visit(schema))}${closing}`;
      } catch {
        return match;
      }
    },
  );
}

function optimizeSeo(html, route) {
  const seo = seoByRoute[route] ?? {
    keywords: 'Tanzania luxury safaris, Serengeti safari, private African safari, Asanja Africa',
  };
  const canonical = `${productionOrigin}${route}`;
  const existingDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1];
  const description = seo.description ?? existingDescription ?? 'Plan an authentic luxury Tanzania safari with Asanja Africa, featuring private game drives, remarkable wildlife and intimate wilderness camps.';

  html = html
    .replace(/<meta\s+name=["']keywords["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']theme-color["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']alternate["']\s+hreflang=["'](?:en|x-default)["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']preload["']\s+as=["']image["'][^>]+Home-Asanja-Ndembo\.webp[^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeAttribute(description)}" />`)
    .replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="${seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}" />`)
    .replace(/<meta\s+name=["']generator["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']https:\/\/api\.w\.org\/["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']shortlink["'][^>]*>\s*/gi, '')
    .replace(/<!-- This site is optimized with the Yoast SEO plugin[\s\S]*?-->/gi, '')
    .replace(/<!-- \/ Yoast SEO plugin\. -->/gi, '')
    .replace(/<!-- MailerLite Universal -->[\s\S]*?<!-- End MailerLite Universal -->/gi, '')
    .replace(/<!-- Hotjar Tracking Code[\s\S]*?<\/script>/gi, '')
    .replace(/<script\s+type=["']speculationrules["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<p>Thank you for reading this post, don.?t forget to subscribe!<\/p>/gi, '')
    .replaceAll('https://asanjaafrica.exsb.site/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('http://new.asanjaafrica.com/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('https://asanjaafrica.exsb.site/help-me-plan/', '/plan-my-stay/')
    .replaceAll('© [YEAR]', '© 2026');

  if (!/<meta\s+name=["']description["']/i.test(html)) {
    html = html.replace('</title>', `</title>\n\t<meta name="description" content="${escapeAttribute(description)}" />`);
  }
  if (!/<link\s+rel=["']canonical["']/i.test(html)) {
    html = html.replace('</title>', `</title>\n\t<link rel="canonical" href="${canonical}" />`);
  }
  if (!/<meta\s+property=["']og:url["']/i.test(html)) {
    html = html.replace('</title>', `</title>\n\t<meta property="og:url" content="${canonical}" />`);
  }

  const seoTags = [
    `<meta name="keywords" content="${escapeAttribute(seo.keywords)}" />`,
    '<meta name="theme-color" content="#f3efe7" />',
    `<link rel="alternate" hreflang="en" href="${canonical}" />`,
    `<link rel="alternate" hreflang="x-default" href="${canonical}" />`,
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  ];
  if (route === '/') {
    seoTags.push('<link rel="preload" as="image" href="/legacy/wp-content/uploads/2025/07/Home-Asanja-Ndembo.webp" fetchpriority="high" />');
  }
  html = html.replace('</head>', `\t${seoTags.join('\n\t')}\n</head>`);
  html = normalizeHeadings(html);
  html = optimizeImages(html);
  html = optimizeSchema(html);
  html = html
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-content\\/', '\\/legacy\\/wp-content\\/')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-includes\\/', '\\/legacy\\/wp-includes\\/')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-admin\\/admin-ajax.php', '\\/api\\/forms')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-json\\/', '\\/')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/', '\\/')
    .replaceAll('https:\\/\\/asanjaafrica.exsb.site\\/wp-content\\/uploads\\/', '\\/legacy\\/wp-content\\/uploads\\/')
    .replaceAll('http:\\/\\/asanjaafrica.exsb.site\\/wp-content\\/uploads\\/', '\\/legacy\\/wp-content\\/uploads\\/');
  return html;
}

function rewriteText(content, extension, route = null) {
  let output = content
    .replaceAll('https://asanjaafrica.com/wp-content/', '/legacy/wp-content/')
    .replaceAll('http://asanjaafrica.com/wp-content/', '/legacy/wp-content/')
    .replaceAll('http://127.0.0.1:8080/wp-content/', '/legacy/wp-content/')
    .replaceAll('http://127.0.0.1:8080/wp-includes/', '/legacy/wp-includes/')
    .replaceAll('https://asanjaafrica.exsb.site/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('http://asanjaafrica.exsb.site/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('http://new.asanjaafrica.com/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('https://asanjaafrica.exsb.site/make-a-booking/', '/make-a-booking/')
    .replaceAll('reservations@new.asanjaafrica.com', 'reservations@asanjaafrica.com')
    .replaceAll('© [YEAR]', `© ${new Date().getFullYear()}`)
    .replace(/(?:\.\.\/)+wp-content\//g, '/legacy/wp-content/')
    .replace(/(?:\.\.\/)+wp-includes\//g, '/legacy/wp-includes/')
    .replace(/(["'(=])\/wp-content\//g, '$1/legacy/wp-content/')
    .replace(/(["'(=])\/wp-includes\//g, '$1/legacy/wp-includes/')
    .replace(/(["'(=])(?:\.\.\/)*wp-content\//g, '$1/legacy/wp-content/')
    .replace(/(["'(=])(?:\.\.\/)*wp-includes\//g, '$1/legacy/wp-includes/')
    .replace(/(?:\.\.\/)*index\.html%3Fp=(\d+)\.html/g, (_match, id) => routeById.get(id) ?? '/')
    .replace(/%3F[^"'\s)>]+/gi, '')
    .replace(/\?ver=[^"'\s)>]+/gi, '')
    .replace(/(?:\.\.\/)*index\.html/g, '/')
    .replace(/(?:\.\.\/)*terms\.html/g, '/terms/')
    .replaceAll('http://127.0.0.1:8080/', '/')
    .replaceAll('http://127.0.0.1:8080', '/');

  if (extension === '.html') {
    output = output
      .replace(/<link[^>]+rel=["']alternate["'][^>]*>/gi, '')
      .replace(/<link[^>]+rel=["']EditURI["'][^>]*>/gi, '');
    if (!/src=["']\/migration\.js["']/i.test(output)) {
      output = output.replace(/<\/body>/i, '<script src="/migration.js" defer></script></body>');
    }
    if (!/href=["']\/migration\.css["']/i.test(output)) {
      output = output.replace(/<\/head>/i, '\t<link rel="stylesheet" href="/migration.css" />\n</head>');
    }
    if (route) output = optimizeSeo(output, route);
  }

  return output;
}

const originalFiles = await walk(root);
for (const file of originalFiles) {
  if (!path.basename(file).includes('?')) continue;
  const cleanPath = path.join(path.dirname(file), path.basename(file).split('?')[0]);
  const cleanExists = await stat(cleanPath).then(() => true).catch(() => false);
  if (!cleanExists) await rename(file, cleanPath);
  else await unlink(file);
}

const termsSource = path.join(root, 'terms.html');
if (await stat(termsSource).then(() => true).catch(() => false)) {
  await mkdir(path.join(root, 'terms'), { recursive: true });
  await rename(termsSource, path.join(root, 'terms', 'index.html'));
}

for (const file of await walk(root)) {
  const extension = path.extname(file).toLowerCase();
  if (!['.html', '.css', '.js'].includes(extension)) continue;
  const content = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  const route = extension === '.html' && path.basename(file) === 'index.html'
    ? relative === 'index.html' ? '/' : `/${path.dirname(relative).split(path.sep).join('/')}/`
    : null;
  const rewritten = rewriteText(content, extension, route);
  if (rewritten !== content) await writeFile(file, rewritten);
}

console.log('Prepared the WordPress snapshot for Next.js routing.');
