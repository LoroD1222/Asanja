# Broken Functionality Audit

Audit date: 2026-11-04

## Priority 0 — blocks production behavior

### Form delivery is not configured

- All migrated Elementor forms are intercepted and posted to `/api/forms/`.
- `/api/forms/` returns 503 unless `FORM_WEBHOOK_URL` is configured.
- The endpoint validates email/payload shape, classifies the form, rate-limits, applies a honeypot, supports an authenticated webhook, and restores per-form redirects; it intentionally does not send mail by itself.
- Newsletter, booking, and plan-my-stay forms therefore cannot be marked complete.
- Required work: configure a production delivery provider/webhook with new credentials, map its destinations, and test actual receipt.

### Original success redirects — repaired

- Booking and newsletter submissions return `/contact/thank-you/` after confirmed delivery.
- Trip-planning submissions return `/contact/thank-you/?plan-my-stay` after confirmed delivery.

### Original Rank Math redirect groups — repaired and verified

- The WordPress database contains 10 active redirect groups covering old safari, camp, contact, flight, account, checkout, and gallery URLs.
- All 29 exact source paths are now mapped to canonical local targets with 301 responses.
- `npm run redirects:check` verifies all 29 mappings return the correct 301 target.

## Repaired visible page interactions

### Camp media carousels and lightboxes

- Affected routes: all five individual camp/lodge pages.
- Original widgets: `media-carousel`, `nested-carousel`, and video.
- Media images, responsive slide counts, pagination, autoplay, pointer swipes, and keyboard-controlled lightboxes are restored and browser-tested.

### Safari tabs and loop carousel

- Affected route: `/safaris/`.
- Original widgets: `nested-tabs` and `loop-carousel`.
- Tab selection, active panel visibility, arrow-key navigation, and the loop carousel are restored and browser-tested.

### FAQ accordion

- Affected route: `/faqs/`.
- All question/answer content is present.
- Single-item expand/collapse, initial state, keyboard navigation, Escape close, and ARIA state are restored and browser-tested.

### Reviews widget

- Affected route: `/asanja-reviews/`.
- The original review-widget markup is present.
- Embedded reviews render and navigation/autoplay are restored; the preserved widget does not require an external feed.

## Priority 2 — shared behavior and accessibility

- Popup focus trapping, focus restoration, and Escape close are implemented.
- Shared header and popup navigation behavior is verified on homepage and secondary-page templates; the same template is present on all routes.
- Verify mobile submenu height/scroll behavior on short screens.
- The Experiences video has working native controls, responsive sizing, full readiness, and no media error.
- Social/external new-tab links now receive appropriate `rel` protection.
- Lightbox triggers are native links; dialog close/previous/next and arrow/Escape keys are implemented.
- Inactive fallback carousel slides are marked `aria-hidden` and inert when supported.

## Confirmed working

- Homepage nested carousels autoplay and expose arrows/pagination.
- Homepage menu opens/closes on desktop and mobile.
- Camps & Lodges submenu toggles on desktop and mobile.
- Homepage lazy backgrounds and animated sections are revealed.
- Internal route links resolve in the generated output.
- Telephone and mailto links remain present on the contact page.
- Form failures are reported honestly; the frontend does not simulate a successful delivery.
- Booking and trip-planning pages no longer expose raw unavailable WPForms shortcodes; complete retained Elementor forms are visible instead.
- Browser checks pass for all 24 routes at 390px, 768px, and 1440px without horizontal overflow or missing loaded assets.

## External configuration required

- Production form delivery endpoint or email service.
- Destination mapping for booking, trip planning, and newsletter submissions.
- Any newsletter/MailerLite subscription behavior the owner wants to preserve.
- Optional production-grade CAPTCHA/edge anti-abuse provider if traffic warrants it.

Do not reuse credentials found in the WordPress backup. Configure new or rotated secrets in deployment environment variables.
