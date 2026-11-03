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

## SEO and performance

- Every indexable page has one H1, a logical heading hierarchy, a unique title, description, keywords, canonical URL, Open Graph metadata, image alt text, and structured data.
- `sitemap.xml` contains the public pages; the form confirmation page is excluded and marked `noindex`.
- `robots.txt`, production canonicals, legacy redirects, compressed responses, immutable asset caching, lazy-loaded images, async image decoding, and security headers are included.
- WordPress admin/API dependencies, tracking scripts, and unused generator metadata were removed from the delivered pages.
- The responsive WordPress layouts, typography, hamburger navigation, camp submenu, sliders, and internal page connections are preserved without requiring WordPress at runtime.

The original extracted backup and temporary WordPress restore are intentionally excluded from Git. The production website snapshot lives under `public/legacy`.
