# SEO Audit

Audit date: 2026-11-04

## Current results

- 24 pages audited.
- Every page has exactly one H1.
- Every page has a non-empty title, description, keywords tag, canonical URL, and image alt coverage.
- Canonical URLs are unique and use `https://asanjaafrica.com/`.
- Open Graph URLs match canonical URLs.
- No duplicate titles, descriptions, or canonical URLs were found.
- The thank-you route is `noindex, follow`.
- All other published routes are indexable with large image/snippet/video preview directives.
- Structured data is valid JSON and includes the original WebPage/Breadcrumb/WebSite/Organization graph, with ImageObject where supplied by WordPress.
- Sitemap contains 23 indexable routes and correctly excludes the noindex thank-you page.
- Robots allows public content and disallows `/api/`.
- 2,028 internal links resolve in the generated snapshot.
- All five safari itinerary documents now use a semantic `<main>` landmark.
- New-tab external links include `noopener noreferrer` protection.

## URL preservation

### Working

- Original current slugs are preserved.
- Trailing slashes are enforced by Next.js configuration.
- Selected legacy `?p=<id>` requests return permanent redirects.

### Restored in the current repair pass

- Ten active Rank Math redirect groups from the WordPress database are reproduced as 29 path mappings.
- These cover historic `/tanzania-safaris/...`, `/asanja-camps/...`, `/contact-us`, `/flights`, `/my-account/`, `/checkout/`, and `/video-gallery/` paths.
- Redirect targets are normalized from the staging domain to canonical production paths.
- `npm run redirects:check` verified all 29 paths return the expected 301 target.

## Metadata implementation note

The rendered HTML metadata is technically valid and passes the audit, but migrated pages are raw HTML responses from a Route Handler rather than React pages using the Next.js Metadata API. Replacing this architecture solely to use the Metadata API would create substantial visual/runtime risk. Any future component migration should move metadata into route-aware `generateMetadata` only when a page is converted safely.

## SEO risks and next actions

1. Keep `npm run redirects:check` alongside the restored mappings.
2. Verify Open Graph/Twitter images return 200 and have correct dimensions.
3. Compare final rendered schema against the production hostname after deployment.
4. Add sitemap `lastmod` only when reliable source dates are available.
5. Confirm the long itinerary title lengths and social previews in search/social testing tools.
6. Add automated duplicate/canonical/schema validation to CI.
7. Preserve heading visual classes when fixing semantic hierarchy.

## Performance considerations affecting SEO

- Original Elementor CSS/JS is large and includes code that is no longer needed at runtime.
- Hero images are preloaded only on the homepage; other LCP images should be measured before adding preloads.
- Static legacy assets receive one-year immutable caching.
- HTML is dynamic and re-read from disk per request; production caching/static generation should be evaluated after functional parity is complete.
- Do not remove plugin assets until browser coverage proves they are unused.
