import 'server-only'

/**
 * Preserve the original safari landing page without injecting a second
 * itinerary catalog between its editorial sections.
 */
export async function renderLegacySafariIndex(html: string) {
  return html
}
