# Original WordPress vs Next.js Comparison

Audit date: 2026-11-04

## Method

The audit used the restored WordPress database, raw `site-snapshot` HTML, original Elementor CSS/JS/templates, committed `public/legacy` output, the live original homepage, and local browser rendering. Structural parity means the original and generated pages have matching text, Elementor parent-section IDs, form counts, carousel/widget counts, image counts, and link counts. It does not by itself prove that an interaction works.

## Page comparison report

| Route | Original source | Structure/content parity | Functionality/visual status |
|---|---|---:|---|
| `/` | Page 9 | Verified | Homepage desktop/mobile, menu, carousels, sections, sticky header, and footer repaired and browser-tested |
| `/about/` | Page 31 | Verified | Desktop/mobile layout checks pass |
| `/contact/` | Page 33 | Verified | Telephone/email links and restored newsletter form preserved; delivery awaits deployment webhook |
| `/privacy-policy/` | Page 414 | Verified | Long-content desktop/mobile layout checks pass |
| `/contact/thank-you/` | Page 433 | Verified | Preserved, noindex, and external links secured |
| `/camps-and-lodges/` | Page 1074 | Verified | Nested carousel browser-tested |
| `/safaris/` | Page 1076 | Verified | Nested tabs and loop carousel repaired and browser-tested |
| `/make-a-booking/` | Page 1078 | Verified | Raw unavailable shortcode hidden; complete retained form restored, validated, and redirect-ready |
| `/asanja-moru/` | Page 1757 | Verified | Media gallery/lightbox and nested carousel repaired and browser-tested |
| `/asanja-sri-bustani/` | Page 2601 | Verified | Shared media gallery/lightbox and carousel runtime restored |
| `/asanja-nyasirori/` | Page 2627 | Verified | Shared media gallery/lightbox and carousel runtime restored |
| `/asanja-ruaha/` | Page 2671 | Verified | Shared media gallery/lightbox and carousel runtime restored |
| `/asanja-under-the-stars/` | Page 2692 | Verified | Shared media gallery/lightbox and carousel runtime restored |
| `/experiences/` | Page 2745 | Verified | Original native video controls and responsive sizing preserved; deployment playback check remains |
| `/faqs/` | Page 2747 | Verified | Accordion mouse/keyboard behavior and ARIA state browser-tested |
| `/plan-my-stay/` | Page 2749 | Verified | Raw unavailable shortcode hidden; complete retained form restored, validated, and redirect-ready |
| `/asanja-reviews/` | Page 3057 | Verified | Embedded review navigation/autoplay repaired and browser-tested |
| `/blogs/` | Page 37072 | Verified | Layout preserved; database contains no published blog posts |
| `/terms/` | Page 37383 | Verified | Raw `terms.html` normalized to `/terms/index.html`; desktop/mobile checks pass |
| `/asanja_safaris/tanzania-a-journey-through-natures-masterpieces/` | Safari 4247 | Verified with semantic heading transform | Visual heading equivalence and `<main>` landmark preserved |
| `/asanja_safaris/from-i-do-to-dreams-come-true-the-perfect-honeymoon/` | Safari 4252 | Verified with semantic heading transform | Visual heading equivalence and `<main>` landmark preserved |
| `/asanja_safaris/migration-madness/` | Safari 4253 | Verified with semantic heading transform | Visual heading equivalence and `<main>` landmark preserved |
| `/asanja_safaris/wild-treasures-of-tanzania/` | Safari 4254 | Verified with semantic heading transform | Visual heading equivalence and `<main>` landmark preserved |
| `/asanja_safaris/an-exclusive-safari-escape-a-family-or-friends-adventure-in-the-serengeti-with-just-3-tents-its-yours-alone/` | Safari 4255 | Verified with semantic heading transform | Visual heading equivalence and `<main>` landmark preserved |

## Shared template comparison

- Header: original template 23 is present on every page. Homepage desktop and mobile rendering have been compared and corrected.
- Footer: original template 38 is present on every page. Layout, newsletter row, navigation columns, social links, copyright area, and responsive stacking are preserved.
- Menu popup: original template 1529 is preserved. A Next-compatible wrapper now restores desktop three-panel and mobile single-column behavior.
- Typography/colors: original Elementor kit variables and color rules are preserved. The local compatibility layer deliberately matches the sans-serif fallback visible on the live site because its declared Castoro Titling and Commissioner files do not resolve there. SEO tag changes retain the original visual sizing and spacing.
- Responsive CSS: original Elementor desktop/tablet/mobile rules remain page-specific and are not replaced with a generic template.

## Known comparison limitations

- Automated mobile/tablet/desktop layout checks and 72 local screenshots cover every route; a final deployed-host screenshot diff remains a deployment-preview task.
- Live WordPress can be slow because archived plugins attempt unavailable external services; the raw snapshot and restored database are therefore the primary structural reference.
- Functionality that depended on WordPress AJAX, Elementor Pro server handlers, MailerLite, SMTP, or plugin APIs requires a Next.js/server replacement and cannot be certified from static markup alone.
