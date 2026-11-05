# Homepage Final Visual Audit

Date: 2026-11-04  
Original: <https://asanjaafrica.com/>  
Local: <http://127.0.0.1:3001/>

## Scope and method

This pass was limited to the homepage. The original and local pages were captured in the same Chromium instance at 1440 × 900, 1366 × 768, 768 × 1024, and 390 × 844. Captures and DOM geometry were recorded for the header, hero, Story, Camps, Experiences, Safaris, planning section, newsletter, and footer.

The repeatable capture utility is `tools/homepage-capture.mjs`. The final comparison files were written to `/tmp/asanja-home-audit/` using the `original-*` and `local-final-*` prefixes.

## Differences found

1. The live Story section renders the subscription sentence as a plain text node. The migration had restored it as a paragraph, which added a 14.4px bottom margin and shifted every following section.
2. The archived homepage loaded the Castoro display font while the live site currently falls back to its declared sans-serif face. Conversely, the live page does resolve Commissioner for secondary headings and controls. A single global font override therefore could not reproduce both groups accurately.
3. Elementor's live Swiper stretches all mobile Camps slides to the tallest card. The fallback carousel used the active card's intrinsic height, so shorter cards moved every following mobile section upward by 51.5px.
4. The original and fallback carousel runtimes contain different internal slide structures. WordPress Swiper creates cloned slides, while the local fallback keeps only the original slides. This does not change the visible cards but invalidates comparisons based only on raw slide count.
5. Full-page captures can show different active camp, hero, or safari slides because the original and local autoplay clocks start independently. Section geometry and the correct source assets were compared separately from active-slide timing.

## Corrections implemented

- Restored the homepage subscription sentence with the same DOM structure as the live page, removing the unintended 14.4px spacing.
- Kept the live visual sans-serif fallback for H1/H2 display headings while restoring Commissioner for homepage H3-H6 headings, buttons, and navigation.
- Stabilized the mobile Camps carousel at the live Swiper stage height, without changing tablet or desktop carousel geometry.
- Kept the exact WordPress hero, camp, experience, safari, planning, newsletter, and footer assets and their original crop/position rules.
- Added a repeatable exact-viewport capture/geometry/console audit utility.

## Geometry verification

| Viewport | Original document height | Local document height | Result |
| --- | ---: | ---: | --- |
| 1440 × 900 | 4676px | 4676px | All seven homepage section Y positions and heights match |
| 1366 × 768 | 4567px | 4567px | All seven homepage section Y positions and heights match |
| 768 × 1024 | 4695px | 4695px | All seven homepage section Y positions and heights match |
| 390 × 844 | 4528px | 4528px | Section positions and heights match within 0.1px rounding |

The original and local header heights also match: 85.5px at desktop/tablet widths and 142.5px at 390px.

## Responsive improvements

- The mobile Camps carousel no longer collapses when autoplay reaches a shorter-content slide.
- The Story correction removes downstream vertical drift at every breakpoint.
- Homepage secondary-heading widths now match the original Commissioner metrics (for example, `ASANJA CAMPS` is 273.4px and `ASANJA SAFARIS` is 290.7px at 1440px in both captures).
- The hero, Story, Experiences, planning, newsletter, and footer retain their original breakpoint-specific sizing and alignment.

## Assets checked

- Hero slides use the original Ndembo, Siri Bustani, Asanja 8-2, and Nyasirori photographs with the original background size and focal positions.
- Camps, Experiences, and Safari cards use the WordPress backup photographs rather than replacement imagery.
- Header/footer logos, background textures, arrow artwork, social icons, and footer background remain the original assets.
- Automated asset validation checked 91 HTML/CSS files and found zero missing local references.

## Interaction and technical verification

- Hero autoplay advances.
- Camps and Safaris next controls advance their carousels.
- The navigation popup opens and closes correctly; its original popup template is retained.
- Gallery/lightbox, Safari tabs/carousel, FAQ accordion, Reviews carousel, booking form, and planning form passed regression checks.
- All 24 migrated routes passed layout checks at 390px, 768px, and 1440px with no overflow, missing structural regions, broken images, or heading-count failures.
- Fresh homepage runs at desktop and mobile reported zero runtime exceptions and zero console errors.
- Production build completed successfully.
- SEO audit: 24 pages, zero issue flags.
- Internal link audit: 2,028 links, zero broken links.
- Historic redirect audit: 29 redirects, all returned the expected 301 targets.

## Remaining differences and limitations

- The local carousel code is a compatibility implementation rather than Elementor Pro's exact Swiper bundle. The visible layout, controls, autoplay, fade/slide transitions, and responsive stages are matched, but internal cloned-slide markup is intentionally different.
- A single full-page screenshot is not a reliable pixel diff for autoplay content or below-fold WordPress entrance animations. The final audit therefore verifies section captures and measured geometry in addition to full-page captures.
- The original site's first-party font responses are inconsistent: computed CSS can report Castoro even when the visible glyphs use the sans-serif fallback. The local page intentionally matches the visible live result rather than forcing the nominal but visibly incorrect serif face.

No claim of 100% pixel identity is made. The verified remaining differences are implementation-level carousel/font-loading behavior, not a redesigned layout or substituted content.
