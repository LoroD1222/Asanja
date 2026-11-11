import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = path.resolve('site-snapshot');
const root = path.resolve('public/legacy');
const productionOrigin = 'https://asanjaafrica.com';

// Refresh the generated pages from the untouched WordPress export while
// preserving the larger media library that was extracted separately.
await mkdir(root, { recursive: true });
await cp(sourceRoot, root, { recursive: true, force: true });
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
  const addVisualClass = (attributes, className) => {
    const classAttribute = attributes.match(/\bclass=(["'])(.*?)\1/i);
    if (classAttribute) {
      return attributes.replace(
        classAttribute[0],
        `class=${classAttribute[1]}${classAttribute[2]} ${className}${classAttribute[1]}`,
      );
    }
    return `${attributes} class="${className}"`;
  };

  const h1Matches = [...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)];
  if (h1Matches.length > 1) {
    let seen = 0;
    html = html.replace(/<h1(\b[^>]*)>([\s\S]*?)<\/h1>/gi, (_match, attributes, contents) => {
      seen += 1;
      return seen === 1
        ? `<h1${attributes}>${contents}</h1>`
        : `<h2${addVisualClass(attributes, 'asanja-visual-h1')}>${contents}</h2>`;
    });
  }

  if (!/<h1\b/i.test(html)) {
    const dynamicTitle = /<h4(\b[^>]*)>([\s\S]*?)<\/h4>/i;
    const firstSectionTitle = /<h2(\b[^>]*)>([\s\S]*?)<\/h2>/i;
    html = dynamicTitle.test(html)
      ? html.replace(dynamicTitle, (_match, attributes, contents) => (
          `<h1${addVisualClass(attributes, 'asanja-visual-h4')}>${contents}</h1>`
        ))
      : html.replace(firstSectionTitle, (_match, attributes, contents) => (
          `<h1${addVisualClass(attributes, 'asanja-visual-h2')}>${contents}</h1>`
        ));
  }

  // Upgrade the real section title without changing its original appearance.
  // Decorative H6 labels stay H6 so the WordPress typography remains exact.
  html = html.replace(
    /<h6(\b[^>]*)>\s*highlights\s*<\/h6>/gi,
    (_match, attributes) => `<h2${addVisualClass(attributes, 'asanja-visual-h6')}>Highlights</h2>`,
  );
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

function secureExternalLinks(html) {
  return html.replace(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi, (tag) => {
    if (/\brel=["']/i.test(tag)) return tag;
    return tag.replace(/>$/, ' rel="noopener noreferrer">');
  });
}

function removeDivByDataId(html, dataId) {
  const openingPattern = new RegExp(`<div\\b[^>]*\\bdata-id=["']${dataId}["'][^>]*>`, 'i');
  const opening = openingPattern.exec(html);
  if (!opening) return html;

  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = opening.index;
  let depth = 0;
  let match;
  while ((match = tags.exec(html))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(0, opening.index) + html.slice(tags.lastIndex);
  }
  return html;
}

const contactForm = `
<form id="contact-form" class="asanja-contact-form" method="post" name="Contact_form" aria-label="Send us a message">
  <div class="asanja-contact-form__grid">
    <label><span>Full name</span><input type="text" name="name" autocomplete="name" placeholder="Your name" required></label>
    <label><span>Email address</span><input type="email" name="email" autocomplete="email" placeholder="you@example.com" required></label>
    <label><span>Phone / WhatsApp</span><input type="tel" name="phone" autocomplete="tel" placeholder="+255 ..."></label>
    <label><span>Subject</span><input type="text" name="subject" placeholder="How can we help?"></label>
    <label class="asanja-contact-form__message"><span>Your message</span><textarea name="message" rows="6" placeholder="Tell us about your safari plans" required></textarea></label>
  </div>
  <button class="asanja-form-button" type="submit"><span>Send message</span><span aria-hidden="true">↗</span></button>
</form>`;

const planYourTripForm = `
<section class="asanja-trip-planner" aria-labelledby="asanja-trip-planner-title">
  <div class="asanja-trip-planner__intro">
    <p class="asanja-trip-planner__eyebrow">Tailor-made by Asanja</p>
    <h2 id="asanja-trip-planner-title">Plan your trip</h2>
    <p class="asanja-trip-planner__lead">Tell us a little about your safari. A planner who knows every Asanja camp will send you a tailored itinerary and price, with no obligation.</p>
    <ol class="asanja-trip-planner__steps" aria-label="How planning works">
      <li><span>1</span><div><strong>Tell us your plans</strong><small>Dates, who’s coming and what you’d love to see.</small></div></li>
      <li><span>2</span><div><strong>Get your itinerary within 24 hours</strong><small>Tailored to you, by email or WhatsApp.</small></div></li>
      <li><span>3</span><div><strong>Book and pack</strong><small>We’ll take care of everything from the airstrip onwards.</small></div></li>
    </ol>
    <a class="asanja-trip-planner__whatsapp" href="https://api.whatsapp.com/send?phone=255685700000" target="_blank" rel="noopener noreferrer">WhatsApp us <span aria-hidden="true">↗</span></a>
    <p class="asanja-trip-planner__agent-note">Booking through an agent? We work with travel agents worldwide.</p>
  </div>
  <form class="asanja-plan-form" method="post" name="Plan_your_trip_form" aria-label="Plan your safari">
    <div class="asanja-plan-form__heading"><h3>Your safari</h3><span data-plan-step-label>Step 1 of 2</span></div>
    <div class="asanja-plan-form__progress" aria-hidden="true"><span data-plan-progress></span></div>
    <div class="asanja-plan-form__panel" data-plan-step="1">
      <div class="asanja-plan-form__grid">
        <label><span>When would you like to travel?</span><select name="travel_time"><option value="Not sure yet">Not sure yet</option><option value="January to March">January to March</option><option value="April to June">April to June</option><option value="July to September">July to September</option><option value="October to December">October to December</option></select></label>
        <label><span>How many nights?</span><select name="nights"><option value="3 to 4">3 to 4</option><option value="5 to 7" selected>5 to 7</option><option value="8 to 10">8 to 10</option><option value="More than 10">More than 10</option></select></label>
        <label><span>Adults</span><select name="adults"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6+</option></select></label>
        <label><span>Children under 12</span><select name="children"><option selected>0</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></label>
      </div>
      <fieldset class="asanja-plan-form__choices"><legend>Which camps interest you?</legend><div>
        <label><input type="checkbox" name="camp_moru" value="Moru"><span>Moru</span></label>
        <label><input type="checkbox" name="camp_siri_bustani" value="Siri Bustani"><span>Siri Bustani</span></label>
        <label><input type="checkbox" name="camp_nyasirori" value="Nyasirori"><span>Nyasirori</span></label>
        <label><input type="checkbox" name="camp_ewasi_tarangire" value="Ewasi Tarangire"><span>Ewasi Tarangire</span></label>
        <label><input type="checkbox" name="camp_ndembo_ruaha" value="Ndembo Ruaha"><span>Ndembo Ruaha</span></label>
        <label><input type="checkbox" name="camp_under_the_stars" value="Under the Stars"><span>Under the Stars</span></label>
      </div></fieldset>
      <fieldset class="asanja-plan-form__choices"><legend>What’s the occasion?</legend><div>
        <label><input type="radio" name="occasion" value="Honeymoon"><span>Honeymoon</span></label>
        <label><input type="radio" name="occasion" value="Family safari"><span>Family safari</span></label>
        <label><input type="radio" name="occasion" value="The migration"><span>The migration</span></label>
        <label><input type="radio" name="occasion" value="Photography"><span>Photography</span></label>
        <label><input type="radio" name="occasion" value="Anniversary"><span>Anniversary</span></label>
        <label><input type="radio" name="occasion" value="Safari and Zanzibar"><span>Safari and Zanzibar</span></label>
      </div></fieldset>
      <div class="asanja-plan-form__actions asanja-plan-form__actions--end"><button class="asanja-form-button" type="button" data-plan-next>Continue <span aria-hidden="true">↗</span></button></div>
    </div>
    <div class="asanja-plan-form__panel" data-plan-step="2" hidden>
      <p class="asanja-plan-form__prompt">Where should we send your personalised safari plan?</p>
      <div class="asanja-plan-form__grid">
        <label><span>First name</span><input type="text" name="first_name" autocomplete="given-name" required></label>
        <label><span>Last name</span><input type="text" name="last_name" autocomplete="family-name" required></label>
        <label><span>Email address</span><input type="email" name="email" autocomplete="email" required></label>
        <label><span>Phone / WhatsApp</span><input type="tel" name="phone" autocomplete="tel"></label>
        <label class="asanja-plan-form__message"><span>Anything else we should know?</span><textarea name="message" rows="5" placeholder="Interests, mobility needs, dietary requirements or a special celebration"></textarea></label>
      </div>
      <div class="asanja-plan-form__actions"><button class="asanja-plan-form__back" type="button" data-plan-back>← Back</button><button class="asanja-form-button" type="submit">Send my plans <span aria-hidden="true">↗</span></button></div>
    </div>
  </form>
</section>`;

function restoreFormsAndRequestedContent(html, route) {
  if (route === '/contact/') {
    html = html.replace(/<div class="elementor-shortcode">\s*\[wpforms id="5818" title="false"\]\s*<\/div>/i, contactForm);
  }
  if (route === '/plan-my-stay/') {
    html = html.replace(/<div class="elementor-shortcode">\s*\[wpforms id="5916" title="false"\]\s*<\/div>/i, planYourTripForm);
  }
  if (route === '/experiences/') html = removeDivByDataId(html, '245e745');
  return html;
}

function optimizeSeo(html, route) {
  html = restoreFormsAndRequestedContent(html, route);
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
    .replace(/<script[^>]+id=["']elementor-frontend-js["'][^>]*><\/script>\s*/gi, '')
    .replace(/<script>\s*\/\/ Select the elements[\s\S]*?window\.addEventListener\(['"]scroll['"],\s*toggleMenuVisibility\);\s*<\/script>/gi, '')
    .replace(/\s*hoveDefault\(\);/g, '')
    .replaceAll('https://asanjaafrica.exsb.site/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('http://new.asanjaafrica.com/wp-content/uploads/', '/legacy/wp-content/uploads/')
    .replaceAll('https://asanjaafrica.exsb.site/help-me-plan/', '/plan-my-stay/')
    .replaceAll('© [YEAR]', '© 2026');

  // The live WordPress theme injects this line into the first introductory
  // text widget on nearly every content page. It is not present in the static
  // export, so restore it in the same widget instead of silently dropping
  // visible production content.
  if (route !== '/blogs/' && !html.includes("Thank you for reading this post, don't forget to subscribe!")) {
    const subscriptionLine = route === '/'
      ? "Thank you for reading this post, don't forget to subscribe!"
      : "<p>Thank you for reading this post, don't forget to subscribe!</p>";
    html = html.replace(
      /(<div\s+class=["'][^"']*elementor-widget-text-editor[^"']*["'][^>]*>[\s\S]*?<div\s+class=["']elementor-widget-container["'][^>]*>\s*<p>[\s\S]*?<\/p>)/i,
      `$1${subscriptionLine}`,
    );
  }

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
  if (route.startsWith('/asanja_safaris/')) {
    html = html
      .replace('<div data-elementor-type="single-post"', '<main data-elementor-type="single-post"')
      .replace(/<\/div>(\s*<footer data-elementor-type="footer")/, '</main>$1');
  }
  html = optimizeImages(html);
  html = optimizeSchema(html);
  html = secureExternalLinks(html);
  html = html
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-content\\/', '\\/legacy\\/wp-content\\/')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-includes\\/', '\\/legacy\\/wp-includes\\/')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-admin\\/admin-ajax.php', '\\/api\\/forms')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/wp-json\\/', '\\/')
    .replaceAll('http:\\/\\/127.0.0.1:8080\\/', '\\/')
    .replaceAll('https:\\/\\/asanjaafrica.exsb.site\\/wp-content\\/uploads\\/', '\\/legacy\\/wp-content\\/uploads\\/')
    .replaceAll('http:\\/\\/asanjaafrica.exsb.site\\/wp-content\\/uploads\\/', '\\/legacy\\/wp-content\\/uploads\\/');
  if (!html.includes('asanja-whatsapp')) {
    const whatsapp = `
<a class="asanja-whatsapp" href="https://api.whatsapp.com/send?phone=255685700000" target="_blank" rel="noopener noreferrer" aria-label="Chat with Asanja Africa on WhatsApp">
  <span class="asanja-whatsapp__label">Need Help? <strong>Chat with us</strong></span>
  <span class="asanja-whatsapp__icon" aria-hidden="true">
    <svg viewBox="0 0 32 32"><path fill="currentColor" d="M16 3a12.7 12.7 0 0 0-10.9 19.2L3.4 29l7-1.8A12.8 12.8 0 1 0 16 3Zm0 22.8c-2 0-3.9-.6-5.5-1.6l-.4-.2-4.1 1.1 1.1-4-.3-.4A10.2 10.2 0 1 1 16 25.8Zm5.6-7.6c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.4 8.4 0 0 1-2.5-1.6 9.3 9.3 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6.3-.6c.1-.2 0-.4 0-.6l-1-2.3c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-1 .5-.3.4-1.3 1.3-1.3 3.1 0 1.9 1.4 3.7 1.6 3.9.2.2 2.7 4.1 6.5 5.7.9.4 1.6.6 2.2.7.9.3 1.7.2 2.4.1.7-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z"/></svg>
  </span>
</a>`;
    html = html.replace('</body>', `${whatsapp}\n</body>`);
  }
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
    .replaceAll('href="/#booking-request"', 'href="/make-a-booking/#booking-request"')
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
    .replaceAll('http://127.0.0.1:8080', '/')
    .replaceAll('href="/#booking-request"', 'href="/make-a-booking/#booking-request"');

  if (extension === '.html') {
    output = output
      .replace(/<link[^>]+rel=["']alternate["'][^>]*>/gi, '')
      .replace(/<link[^>]+rel=["']EditURI["'][^>]*>/gi, '');
    if (!/src=["']\/migration\.js["']/i.test(output)) {
      output = output.replace(/<\/body>/i, '<script src="/migration.js" defer></script></body>');
    }
    if (!/href=["']\/migration\.css["']/i.test(output)) {
      output = output.replace(
        /<\/head>/i,
        '\t<link rel="stylesheet" href="/migration.css" />\n\t<noscript><style>.elementor-invisible{visibility:visible!important}</style></noscript>\n</head>',
      );
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
  if (cleanExists && path.extname(file).toLowerCase() === '.html') {
    // Query-form HTML exports are legacy aliases of the clean route, not the
    // canonical page itself. Keep the clean page and discard the alias file.
    await rm(file, { force: true });
    continue;
  }
  if (cleanExists) await rm(cleanPath, { force: true });
  await rename(file, cleanPath);
}

const termsSource = path.join(root, 'terms.html');
if (await stat(termsSource).then(() => true).catch(() => false)) {
  await mkdir(path.join(root, 'terms'), { recursive: true });
  const termsDestination = path.join(root, 'terms', 'index.html');
  await rm(termsDestination, { force: true });
  await rename(termsSource, termsDestination);
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
