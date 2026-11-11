import {article} from './documents/article'
import {author} from './documents/author'
import {camp} from './documents/camp'
import {category} from './documents/category'
import {destination} from './documents/destination'
import {safariTrip} from './documents/safariTrip'
import {seoLandingPage} from './documents/seoLandingPage'
import {siteSettings} from './documents/siteSettings'
import {tag} from './documents/tag'
import {articleImage} from './objects/articleImage'
import {articleTable} from './objects/articleTable'
import {blockContent} from './objects/blockContent'
import {faqItem} from './objects/faqItem'
import {guestReview} from './objects/guestReview'
import {itineraryDay} from './objects/itineraryDay'
import {pageRichText} from './objects/pageRichText'
import {pageSection} from './objects/pageSection'
import {routeStop} from './objects/routeStop'
import {tripMedia} from './objects/tripMedia'
import {tripPricingOption} from './objects/tripPricingOption'
import {tripSection} from './objects/tripSection'
import {legacyShortcode} from './objects/legacyShortcode'
import {migrationMetadata} from './objects/migrationMetadata'
import {migrationNote} from './objects/migrationNote'
import {seo} from './objects/seo'
import {tableRow} from './objects/tableRow'

export const schemaTypes = [
  article,
  author,
  camp,
  destination,
  safariTrip,
  seoLandingPage,
  siteSettings,
  category,
  tag,
  seo,
  migrationMetadata,
  blockContent,
  faqItem,
  guestReview,
  itineraryDay,
  pageRichText,
  pageSection,
  routeStop,
  tripMedia,
  tripPricingOption,
  tripSection,
  articleImage,
  articleTable,
  tableRow,
  legacyShortcode,
  migrationNote,
]
