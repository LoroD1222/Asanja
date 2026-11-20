import type {Metadata} from 'next'
import Image from 'next/image'
import {BlogShell} from '../../components/blog/blog-shell'
import styles from './reviews.module.css'

type GuestReview = {
  name: string
  date: string
  published: string
  detail: string
  summary: string
  image: string
  imageAlt: string
  rating: number
}

type ReviewedCamp = {
  id: string
  name: string
  location: string
  campUrl: string
  tripadvisorUrl: string
  rating: number
  reviewCount: number
  reviews: readonly GuestReview[]
}

const reviewedCamps: readonly ReviewedCamp[] = [
  {
    id: 'asanja-moru',
    name: 'Asanja Moru',
    location: 'Central Serengeti',
    campUrl: '/asanja-moru/',
    tripadvisorUrl: 'https://www.tripadvisor.com/Hotel_Review-g293751-d1997580-Reviews-Asanja_Moru-Serengeti_National_Park.html',
    rating: 4.9,
    reviewCount: 400,
    reviews: [
      {
        name: 'A_KevH',
        date: 'Aug 2026',
        published: '2026-08-01',
        detail: 'Family stay',
        summary: 'A phenomenal Serengeti setting, excellent food and attentive service made the stay feel like a trip of a lifetime.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-moru-couple_20250709163233.webp',
        imageAlt: 'Guests enjoying a welcome drink at Asanja Moru',
        rating: 5,
      },
      {
        name: 'Mischi M',
        date: 'Apr 2026',
        published: '2026-04-01',
        detail: 'Family stay · Translated from German',
        summary: 'Beautiful views, well-equipped tents and elephants appearing near camp made the morning especially memorable.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-moru-tent_20250709164250.webp',
        imageAlt: 'Private tent and veranda overlooking the Serengeti at Asanja Moru',
        rating: 5,
      },
      {
        name: 'Dream26550658099',
        date: 'Feb 2026',
        published: '2026-02-01',
        detail: 'Safari stay',
        summary: 'The atmospheric wilderness camp, a private bush lunch and breakfast overlooking zebras created a distinctive safari experience.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-moru-kopjes_20250722164924.webp',
        imageAlt: 'Rocky kopjes and open wilderness surrounding Asanja Moru',
        rating: 5,
      },
    ],
  },
  {
    id: 'asanja-nyasirori',
    name: 'Asanja Nyasirori',
    location: 'Western Serengeti',
    campUrl: '/asanja-nyasirori/',
    tripadvisorUrl: 'https://www.tripadvisor.com/Hotel_Review-g23014177-d33238548-Reviews-Asanja_Nyasirori-Ikoma_Serengeti_National_Park.html',
    rating: 5,
    reviewCount: 44,
    reviews: [
      {
        name: 'L. H.',
        date: 'Sep 2026',
        published: '2026-09-01',
        detail: 'Couple · Switzerland',
        summary: 'Excellent food, a remarkable location and a knowledgeable guide made their wildlife experience especially rewarding.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-nyasirori-pool_20250710103614.webp',
        imageAlt: 'Infinity pool and Serengeti view at Asanja Nyasirori',
        rating: 5,
      },
      {
        name: 'Eirin K. Ø.',
        date: 'Aug 2026',
        published: '2026-08-01',
        detail: 'Family stay · Norway',
        summary: 'A beautiful family retreat with spacious villas, private pools, warm service and wildlife sounds across the savannah.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-nyasirori-boma-exterior_20250710103614.webp',
        imageAlt: 'Private boma suite at Asanja Nyasirori',
        rating: 5,
      },
      {
        name: 'Shae',
        date: 'Aug 2026',
        published: '2026-08-01',
        detail: 'Serengeti stay',
        summary: 'Professional, thoughtful staff and striking, comfortable rooms made the whole experience feel magical.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-nyasirori-sunset-dining_20250710103614.webp',
        imageAlt: 'Sunset dining experience at Asanja Nyasirori',
        rating: 5,
      },
    ],
  },
  {
    id: 'asanja-siri-bustani',
    name: 'Asanja Siri Bustani, Grumeti',
    location: 'Western Serengeti',
    campUrl: '/asanja-sri-bustani/',
    tripadvisorUrl: 'https://www.tripadvisor.com/Hotel_Review-g293751-d13438288-Reviews-Asanja_Grumeti-Serengeti_National_Park.html',
    rating: 4.8,
    reviewCount: 56,
    reviews: [
      {
        name: 'Øivind Urdal',
        date: 'Jul 2026',
        published: '2026-07-01',
        detail: 'Couple stay',
        summary: 'Exceptional service, a Serengeti sunset and a heartfelt farewell provided a perfect ending to an unforgettable journey.',
        image: '/legacy/wp-content/uploads/2025/07/camp-slide-sri-bustani-evening-deck_20250723103055.webp',
        imageAlt: 'Evening deck and fire at Asanja Siri Bustani',
        rating: 5,
      },
      {
        name: 'Matt S',
        date: 'Jul 2026',
        published: '2026-07-01',
        detail: 'Family stay',
        summary: 'Warm hospitality, a superb guide and thoughtful attention to detail exceeded the family’s expectations.',
        image: '/legacy/wp-content/uploads/2025/07/camp-slide-sri-bustani-couple-deck_20250709165549.webp',
        imageAlt: 'Guests relaxing on the deck at Asanja Siri Bustani',
        rating: 5,
      },
      {
        name: 'h_casa',
        date: 'Jul 2026',
        published: '2026-07-01',
        detail: 'Couple stay · Translated from German',
        summary: 'An intimate three-tent camp, memorable outdoor dining and an attentive team made the short stay feel very special.',
        image: '/legacy/wp-content/uploads/2025/07/camp-slide-sri-bustani-service-with-a-smile_20250723103055-e1753259588189.webp',
        imageAlt: 'Personal service at Asanja Siri Bustani',
        rating: 5,
      },
    ],
  },
  {
    id: 'asanja-ndembo',
    name: 'Asanja Ndembo, Ruaha',
    location: 'Ruaha National Park',
    campUrl: '/asanja-ruaha/',
    tripadvisorUrl: 'https://www.tripadvisor.com/Hotel_Review-g488126-d17626284-Reviews-Asanja_Ruaha-Ruaha_National_Park_Iringa_Region.html',
    rating: 4.9,
    reviewCount: 37,
    reviews: [
      {
        name: 'Haavard G',
        date: 'Aug 2025',
        published: '2025-08-01',
        detail: 'Family stay · Norway',
        summary: 'High standards, a dedicated crew and breathtaking lodge views made Ruaha a magical family safari base.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-ndembo-pool_20250710113515.webp',
        imageAlt: 'Private pool overlooking the Ruaha wilderness at Asanja Ndembo',
        rating: 5,
      },
      {
        name: 'Ries1967',
        date: 'Jun 2025',
        published: '2025-06-01',
        detail: 'Safari stay',
        summary: 'Creative meals, friendly service and expert guiding delivered a genuine Tanzania experience with exceptional wildlife sightings.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-ndembo-outdoor-dining_20250710111917.webp',
        imageAlt: 'Outdoor dining overlooking the Great Ruaha River at Asanja Ndembo',
        rating: 5,
      },
      {
        name: 'Jemma C',
        date: 'Nov 2024',
        published: '2024-11-01',
        detail: 'Safari stay',
        summary: 'Spectacular views, extraordinary rooms, welcoming staff and beautifully presented food made this a favourite lodge experience.',
        image: '/legacy/wp-content/uploads/2025/07/camps-asanja-ndembo-couple-by-the-pool_20250710111917.webp',
        imageAlt: 'Guests beside a plunge pool at Asanja Ndembo',
        rating: 5,
      },
    ],
  },
] as const

const totalReviews = reviewedCamps.reduce((total, camp) => total + camp.reviewCount, 0)
const averageRating = reviewedCamps.reduce((total, camp) => total + camp.rating * camp.reviewCount, 0) / totalReviews

export const metadata: Metadata = {
  title: 'Asanja Reviews by Camp | Verified Tripadvisor Guest Stories',
  description: 'Explore verified Tripadvisor guest reviews for Asanja Moru, Nyasirori, Siri Bustani and Ndembo, organised camp by camp.',
  alternates: {canonical: 'https://asanjaafrica.com/asanja-reviews/'},
  openGraph: {
    title: 'Asanja Reviews by Camp | Verified Tripadvisor Guest Stories',
    description: 'Real guest stories from Asanja Africa’s safari camps across Tanzania.',
    url: 'https://asanjaafrica.com/asanja-reviews/',
    type: 'website',
    images: [{url: '/legacy/wp-content/uploads/2024/04/menu-reviews_20250711104945.webp', alt: 'Guests enjoying an Asanja Africa safari'}],
  },
}

export default function AsanjaReviewsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Asanja Africa reviews by camp',
    url: 'https://asanjaafrica.com/asanja-reviews/',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: reviewedCamps.map((camp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'LodgingBusiness',
          name: camp.name,
          url: `https://asanjaafrica.com${camp.campUrl}`,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: camp.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: camp.reviewCount,
          },
          review: camp.reviews.map((review) => ({
            '@type': 'Review',
            author: {'@type': 'Person', name: review.name},
            datePublished: review.published,
            reviewBody: review.summary,
            reviewRating: {'@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1},
          })),
        },
      })),
    },
  }

  return <BlogShell className={styles.shell} currentPath="/asanja-reviews/">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData).replace(/</g, '\\u003c')}} />
    <article className={styles.page}>
      <header className={styles.hero}>
        <Image
          src="/legacy/wp-content/uploads/2024/04/menu-reviews_20250711104945.webp"
          alt="Asanja guests looking across Tanzania's wilderness"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Open hearts. Wild spirits.</p>
          <h1><span>Stories from</span><span>our guests</span></h1>
          <p>Real moments, remarkable wildlife and the warm Asanja hospitality our travellers remember long after returning home.</p>
          <a href="#guest-reviews">Explore guest stories</a>
        </div>
      </header>

      <section className={styles.introduction} id="guest-reviews" aria-labelledby="reviews-heading">
        <div>
          <p className={styles.eyebrow}>Don’t just take our word for it</p>
          <h2 id="reviews-heading">Guest experiences,<br />camp by camp</h2>
        </div>
        <p>Every story below is connected to a real Tripadvisor guest review. We’ve grouped them by camp and paired them with authentic Asanja photography from the property they describe.</p>
      </section>

      <section className={styles.summary} aria-label="Asanja Africa Tripadvisor review summary">
        <div className={styles.summaryLead}>
          <p className={styles.summaryKicker}>Asanja Africa on Tripadvisor</p>
          <div className={styles.summaryScore}><strong>{averageRating.toFixed(1)}</strong><span aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>★★★★★</span></div>
          <p><b>{totalReviews} traveller reviews</b> across four verified camp listings · checked 20 November 2026</p>
        </div>
        <div className={styles.propertyRatings} aria-label="Tripadvisor rating by camp">
          {reviewedCamps.map((camp) => <a href={`#${camp.id}`} key={camp.id}>
            <span>{camp.name}</span>
            <strong>{camp.rating.toFixed(1)} <i aria-hidden="true">★</i></strong>
            <small>{camp.reviewCount} reviews</small>
          </a>)}
        </div>
      </section>

      <div className={styles.reviewSections}>
        {reviewedCamps.map((camp, index) => <section className={styles.campReviews} id={camp.id} aria-labelledby={`${camp.id}-heading`} key={camp.id}>
          <header className={styles.campHeading}>
            <div>
              <span>{String(index + 1).padStart(2, '0')} · {camp.location}</span>
              <h2 id={`${camp.id}-heading`}>{camp.name}</h2>
            </div>
            <div className={styles.campMeta}>
              <p><strong>{camp.rating.toFixed(1)}</strong><span aria-label={`${camp.rating.toFixed(1)} out of 5 stars`}>★★★★★</span><small>{camp.reviewCount} reviews</small></p>
              <a href={camp.tripadvisorUrl} target="_blank" rel="noopener noreferrer">All reviews on Tripadvisor <span aria-hidden="true">↗</span></a>
            </div>
          </header>

          <div className={styles.cards} aria-label={`Three featured ${camp.name} Tripadvisor reviews`}>
            {camp.reviews.map((review) => <article className={styles.card} key={`${camp.id}-${review.name}`}>
              <div className={styles.cardImage}>
                <Image src={review.image} alt={review.imageAlt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}</div>
                <span className={styles.reviewLabel}>Verified review summary</span>
                <p className={styles.reviewText}>{review.summary}</p>
                <div className={styles.reviewer}>
                  <strong>{review.name}</strong>
                  <span>{review.detail} · {review.date}</span>
                </div>
                <a href={`${camp.tripadvisorUrl}#REVIEWS`} target="_blank" rel="noopener noreferrer">View on Tripadvisor <span aria-hidden="true">→</span></a>
              </div>
            </article>)}
          </div>
          <a className={styles.campLink} href={camp.campUrl}>Explore {camp.name} <span aria-hidden="true">↗</span></a>
        </section>)}

      </div>

      <section className={styles.closing}>
        <p className={styles.eyebrow}>Your story starts here</p>
        <h2>Ready to experience<br />Asanja for yourself?</h2>
        <a href="/plan-my-stay/">Plan your stay</a>
      </section>
    </article>
  </BlogShell>
}
