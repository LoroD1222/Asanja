# Asanja Africa — Next.js migration

This project serves the restored Asanja Africa WordPress website through Next.js while preserving the original design, pages, media, and URLs.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production checks

```bash
npm run seo:audit
npm run assets:check
npm run links:check
npm run build
npm start
```

## Forms

The browser submits migrated forms to `/api/forms`. Set `FORM_WEBHOOK_URL` in the deployment environment to the HTTPS endpoint that should receive the form data. Without it, the pages still work but form delivery returns a configuration error.

Safari itinerary PDFs include CMS photos and an illustrated route map. Visitors enter a name and email before downloading; a signed, HTTP-only cookie remembers access in the same browser for 90 days. A successful safari quote, trip-planning, or booking form also unlocks the PDF in that browser. The download form uses the same Resend or webhook delivery as other forms and only unlocks after delivery succeeds. Set `PDF_ACCESS_SECRET` in the deployment environment (or use the purpose-derived `SANITY_REVALIDATE_SECRET` fallback), plus working form-delivery settings. Direct PDF URLs return 403 without the cookie.

## SEO and performance

- Every indexable page has one H1, a logical heading hierarchy, a unique title, description, keywords, canonical URL, Open Graph metadata, image alt text, and structured data.
- `sitemap.xml` contains the public pages; the form confirmation page is excluded and marked `noindex`.
- `robots.txt`, production canonicals, legacy redirects, compressed responses, immutable asset caching, lazy-loaded images, async image decoding, and security headers are included.
- WordPress admin/API dependencies, tracking scripts, and unused generator metadata were removed from the delivered pages.
- The responsive WordPress layouts, typography, hamburger navigation, camp submenu, sliders, and internal page connections are preserved without requiring WordPress at runtime.

The original extracted backup and temporary WordPress restore are intentionally excluded from Git. The production website snapshot lives under `public/legacy`.
