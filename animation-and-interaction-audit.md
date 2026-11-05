# Asanja Africa Animation and Interaction Audit

Audit date: 4–5 November 2026  
Original reference: <https://asanjaafrica.com/>  
Current implementation: existing Next.js migration in this repository

## Scope and method

The live WordPress site was inspected interactively rather than inferred from screenshots alone. The inspection covered load behavior, normal and rapid scrolling, carousel transitions, popup navigation opening and closing, menu-image changes, hover behavior, FAQ interaction, and the scroll-linked hero effects. Elementor settings and the archived WordPress CSS/HTML were then used to recover the exact animation names, durations, delays, device rules, and carousel configuration.

The current implementation was tested at:

- 1440 × 900 desktop
- 1366 × 768 laptop screenshots
- 768 × 1024 tablet
- 390 × 844 mobile

The automated animation audit covered all 24 migrated routes at desktop, tablet, and mobile widths. Focused browser tests covered popup timing, infinite carousel boundaries, parallax, touch swiping, the mobile submenu, reduced motion, keyboard-accessible controls, and console errors.

## Original behavior discovered

### Page and scroll entrances

- The original site does not use a separate loading screen or page-transition animation.
- Elementor content entrances trigger when the target reaches approximately 90% of the viewport height.
- Standard Elementor animation duration is 1.25 seconds; `slow` is 2 seconds and `fast` is 0.75 seconds.
- Homepage Camps and Safaris use `fadeInUp`.
- Camp/lodge detail sections, Experiences rows, and FAQ blocks use `fadeInUp` where specified in their saved Elementor settings.
- Experiences uses a 300 ms delay on the configured targets.
- `fadeInUp` starts from opacity 0 and `translateY(100%)`; `fadeInDown` starts from opacity 0 and `translateY(-100%)`.
- The backup contains 32 primary content `fadeInUp` settings and 2 homepage widget entrance settings. Repeated popup content contains the saved `fadeIn` settings across the migrated pages.

### Hero and scroll-linked effects

- Five camp/lodge pages and Blogs use the same Elementor scrolling-motion pattern.
- Foreground content translates vertically with speed 4 and a saved affected range of 0–80%.
- The background uses an `out-in` scale effect with speed 4 and a saved range of 20–80%.
- The recovered foreground progress calculation is based on the element position across the combined viewport and element height. Translation clamps at the saved end range.
- Homepage hero slides contain an enabled mouse-effects flag but no concrete mouse-effect settings. No visible mouse animation was present to reproduce.

### Carousels and galleries

- Homepage Hero, Camps, and Safaris use horizontal Swiper-style movement, not cross-fades.
- Hero autoplay delay is 5 seconds, transition duration is 500 ms, looping is enabled, and autoplay pauses on hover and after interaction.
- The original creates loop clones to make the boundary transition seamless.
- Camps uses one visible slide. Homepage Safaris uses three on desktop and one at smaller breakpoints, following its saved responsive settings.
- Camp gallery carousels use the saved per-breakpoint slide counts, gaps, arrows, bullets, looping, and lazy background images.
- The original gallery opens images in a modal lightbox.

### Navigation and hover behavior

- The live header is static; it is not sticky during scrolling.
- The full-screen navigation popup enters with `fadeInDown` over 0.7 seconds.
- Closing plays the same animation in reverse before the popup is hidden.
- Popup logo and booking-button content use `fadeIn`, a 500 ms delay, and the saved slow duration.
- Desktop menu focus/hover changes the associated background image with the original 0.4 second CSS opacity transition.
- Mobile parent menu items expand and collapse their submenu.
- Existing Elementor hover classes use their original transitions: `grow` scales over 0.3 seconds and `float` moves up 8 px with a 0.3 second ease-out.

## Behavior reconstructed

### Entrance animation runtime

- Replaced the previous global removal of `.elementor-invisible` with an IntersectionObserver implementation using the original 90% viewport trigger.
- Reads each element's archived Elementor animation name and delay rather than assigning a generic effect.
- Preserves Elementor's original keyframes and duration classes.
- Popup entrance targets are excluded from page scrolling and start only when the popup opens.
- Each scroll entrance is observed once, preventing duplicate triggers.

### Scroll-linked hero motion

- Restored foreground vertical translation and background scale layers from the archived Elementor motion settings.
- Creates the same motion-layer structure expected by the recovered Elementor CSS, so original images, cropping, overlays, and responsive device rules remain in use.
- Scroll and resize work is throttled with `requestAnimationFrame`; passive listeners are used.

### Carousel motion

- Replaced the inaccurate fade/stack fallback with horizontal transforms and the original saved transition speeds.
- Added responsive slide widths and gaps, infinite loop clones, loop-boundary resets, arrows, bullets, autoplay, hover/focus pausing, interaction pausing, and pointer swiping.
- Preserved lazy background assets and removed obsolete lazy preloaders once initialized.
- Loop clones are inert and `aria-hidden`. Duplicate IDs, keyboard targets, and cloned `<h1>` semantics are removed while retaining the exact visual clone. This fixed the only SEO/accessibility regression found during runtime testing.

### Popup, menus, and modal interaction

- Restored the original 0.7 second popup entrance and reverse exit lifecycle.
- Restored the 500 ms delayed inner `fadeIn` elements and original slow duration.
- Kept the popup visible and page scrolling locked until the exit animation completes.
- Restored desktop menu-image hover/focus states and mobile submenu toggles.
- Added Escape close, focus trapping, focus restoration, and accurate `aria-hidden`/`aria-expanded` state.
- Restored the image lightbox with previous/next controls, keyboard arrows, Escape close, captions, and focus return.

### Other interactive components

- Tabs support click plus Arrow, Home, and End keyboard navigation.
- FAQ accordions preserve the original single-open behavior and expose synchronized `aria-expanded` state.
- Forms retain submit progress, success/error feedback, disabled-button state, reset behavior, redirect support, and spam honeypots.
- Original button and image hover classes remain in use instead of being replaced by a new motion style.

## Accessibility and failure behavior

- `prefers-reduced-motion: reduce` disables autoplay, entrance transforms, scroll-linked motion, and long modal/carousel transitions.
- Reduced-motion tests passed at 1440, 768, and 390 px widths; hero transforms remained unchanged after an autoplay interval.
- A generated `<noscript>` rule exposes any Elementor entrance content when JavaScript is unavailable.
- Carousel clones are removed from keyboard and accessibility navigation.
- Tabs, accordions, popup navigation, carousel buttons, and the lightbox have keyboard behavior and current ARIA state.
- No tested route retained invisible entrance content after it was brought into view.

## Verification results

### Animation and interaction tests

- 24 routes × 3 widths: all configured entrance targets revealed, no horizontal overflow, static header behavior matched, and no runtime exceptions or console errors were recorded.
- Desktop popup lifecycle: passed 700 ms entrance, 500 ms inner delay, settled-open state, reverse exit, body unlock, and final hidden state.
- Infinite homepage hero boundary: passed; four forward movements returned to the first logical slide through the loop clone and reset without a visible jump.
- Scroll-linked camp hero: foreground translation changed and clamped correctly; background scale increased while retaining the original background asset.
- Mobile pointer swipe and expandable popup submenu: passed.
- Lightbox, carousel arrows/pagination, tabs, accordions, booking form, and trip-planning form runtime checks: passed.
- Targeted post-fix homepage checks at 390, 768, and 1440 px report one document H1, no broken images, and no horizontal overflow.

### Build and content integrity

- `npm run build`: passed with Next.js 16.4.4.
- SEO audit: 24 pages, 0 flags.
- Asset audit: 91 HTML/CSS files, 0 missing local references.
- Internal link audit: 2,028 links across 24 pages, 0 broken.
- Historic redirect audit: 29 redirects, all returned the expected 301 target.
- Final homepage captures were produced at desktop, laptop, tablet, and mobile dimensions after the motion changes.

## Remaining differences

- The WordPress site uses Elementor Pro's bundled Swiper and popup runtime. The migration reproduces the observed behavior with a small dependency-free compatibility runtime, so internal generated class names and library bookkeeping are not byte-for-byte identical even though the tested behavior, geometry, timing, and controls match.
- The saved homepage mouse-motion flag has no configured axis, track, tilt, or transparency effect and produced no observable movement on the original. It remains intentionally inactive rather than inventing motion.
- Exact animation progression can vary slightly with browser frame scheduling, image decode timing, and device refresh rate. The configured durations, delays, trigger position, transform distances, and responsive rules match the original settings and measured live behavior.

No unresolved broken interaction, invisible-content state, overflow issue, or console error was found in the final test set.
