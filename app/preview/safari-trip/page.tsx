import {redirect} from 'next/navigation'

// The former design fixture was not editable in Sanity. Keep its familiar URL,
// but take editors to the CMS-backed sample itinerary instead.
export default function SafariTripTemplatePreview() {
  redirect('/safaris/wild-treasures-of-tanzania-sample/')
}
