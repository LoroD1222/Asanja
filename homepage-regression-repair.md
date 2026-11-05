# Homepage Regression Repair

Date: 2026-11-05  
Original reference: <https://asanjaafrica.com/>  
Local implementation: <http://127.0.0.1:3001/>

## Investigation and cause

The Git history does not contain a commit for the last visually approved homepage; the recent reconstruction and animation work are still part of the current uncommitted migration. I therefore compared:

- the current source and runtime;
- the pre-animation captures and geometry records in `/tmp/asanja-home-audit/local-final-*`;
- the original live site at matching viewport sizes;
- the current post-animation captures in `/tmp/asanja-motion-audit/`.

The principal regression was caused by the interaction between the new infinite-loop carousel implementation and an archived WordPress/Swiper style:

- the animation runtime cloned slides and translated `.swiper-wrapper` horizontally;
- the archived style kept `overflow: hidden` on that same moving wrapper;
- the active slide was consequently translated into the wrapper's own clipped area;
- hero, Camps and Safari content remained in the DOM and accessibility tree but was not painted.

A second mobile-only issue came from Elementor's responsive setting inheritance. The mobile slide-spacing value is intentionally blank and inherits the 30px tablet value. The fallback treated the blank value as numeric zero, so its transform distance did not match the rendered 30px CSS gap and exposed a strip of the previous card.

## Corrections made

### Homepage and carousel repair

- Allowed translated slides to paint outside the moving wrapper while retaining clipping on the stationary carousel viewport.
- Preserved the existing cloned-loop animation rather than reverting all animation work.
- Corrected responsive value resolution so an empty mobile setting inherits tablet and then desktop values, matching Elementor.
- Restored full hero painting and the correctly aligned Camps and Safari stages at desktop, laptop, tablet and mobile widths.
- Retained the previously corrected imagery, typography, section geometry, header, footer, Story spacing, responsive Camps height and original card layouts.

### WhatsApp reconstruction

The live WordPress widget was inspected directly. Its measured closed-state values are:

- 56px × 56px circular button;
- 30px from the right and bottom edges;
- `rgb(45, 183, 66)` / `#2db742` background;
- `0 6px 8px 2px rgb(0 0 0 / 14%)` shadow;
- the exact white WhatsApp silhouette used by the live plugin, rendered at 30px;
- 156px tooltip, 12px Arial, `#f5f7f9` background;
- 400ms tooltip and open/close transitions.

The original click behavior was also restored instead of linking immediately to WhatsApp:

- clicking the floating button opens a 351px conversation panel at 102px from the bottom;
- the icon rotates between the WhatsApp mark and close state;
- the panel includes the original heading, response notice, `Asanja Whatsapp` contact and `Chat to us` label;
- the contact opens `https://api.whatsapp.com/send?phone=255685700000` in a new tab;
- outside click and Escape close the panel;
- ARIA expanded/hidden state and keyboard focus are synchronized;
- the same 56px button and 30px edge offsets are retained on mobile without creating horizontal overflow.

## Files corrected

- `public/migration.css`
  - carousel clipping repair;
  - faithful WhatsApp button, tooltip and conversation-panel styling.
- `public/migration.js`
  - Elementor responsive carousel inheritance fix;
  - WhatsApp popup lifecycle, keyboard and outside-click behavior.
- `tools/animation-interaction-smoke.mjs`
  - added desktop and mobile assertions for the WhatsApp dimensions, state transitions and destination.
- `homepage-regression-repair.md`
  - this repair record.

The existing snapshot preparation continues to inject the shared WhatsApp trigger on every migrated page; the runtime progressively enhances it into the original popup behavior. No page-specific legacy HTML was rewritten for this repair.

## Animations preserved

- Hero, Camps, Safari, media and review carousel transforms.
- Infinite-loop clone reset behavior.
- Autoplay, pause-on-hover/focus, arrows, pagination and swipe.
- Original entrance animation delays.
- Header navigation popup entrance/exit animation and submenu interaction.
- Scroll-linked foreground and background motion on camp pages.
- Lightbox, tabs and accordion interactions.
- Reduced-motion handling.

The carousel animation styles are now separated from the stationary viewport's clipping behavior, preventing motion from hiding the layout.

## Responsive visual verification

Final local captures are in `/tmp/asanja-regression-audit/`. They were taken with the same four viewports used by the prior approved audit.

| Viewport | Final document height | Comparison with pre-regression implementation |
| --- | ---: | --- |
| 1440 × 900 | 4676px | Header and all homepage section positions/heights match exactly |
| 1366 × 768 | 4567px | Header and all homepage section positions/heights match exactly |
| 768 × 1024 | 4695px | Header and all homepage section positions/heights match exactly |
| 390 × 844 | 4529px | Visual stages align; 1px total-height difference is subpixel rounding, with section values differing by at most 0.1px |

The final captures show populated hero, Camps and Safari slides at all widths. The corrected mobile Camps capture no longer exposes the previous-slide strip and matches the earlier full-width stage.

Browser diagnostics for all four homepage captures reported zero runtime exceptions and zero console errors.

## Interaction and cross-page verification

Automated browser interaction checks passed for:

- desktop carousel loop and visible hero asset;
- navigation popup open/settle/close lifecycle;
- WhatsApp dimensions, tooltip, genuine mouse-pointer open, panel state, destination, Escape close and focus restoration;
- mobile swipe, navigation submenu and WhatsApp positioning;
- camp-page parallax foreground/background motion.

The cross-page runtime audit checked 24 routes at 390px, 768px and 1440px. Mobile and desktop completed with zero failures. One tablet request for `/asanja-sri-bustani/` transiently returned an incomplete document during the long first run; an isolated repeat at all three widths passed with footer, WhatsApp, heading, imagery and overflow checks intact.

Additional verification:

- production build: passed;
- SEO audit: 24 pages, zero issue flags;
- asset audit: 91 HTML/CSS files, zero missing local references;
- internal-link audit: 2,028 links, zero broken links;
- redirect audit: 29 historic redirects, all expected 301 targets.

## Remaining differences and limitations

- The migration uses a compatibility carousel runtime rather than the original licensed Elementor Pro Swiper bundle. Visible layout, stage sizes, controls, looping and transitions are matched, but internal markup is not identical.
- The WhatsApp popup is a local reconstruction of the live plugin rather than the WordPress plugin itself. The measured geometry, styling, labels, transition behavior and destination are reproduced; plugin analytics and WordPress administration features are intentionally absent.
- Autoplay means a screenshot may show a different valid hero, camp or safari slide from the live site depending on capture timing.
- The original site continues to load third-party fonts and scripts inconsistently. This migration preserves the previously verified visible typography rather than reproducing those network failures.

No claim of absolute pixel identity is made. The reported homepage regression is repaired, the previously improved design geometry is restored, the validated animations remain enabled, and the WhatsApp control now follows the live site's measured design and interaction model.
