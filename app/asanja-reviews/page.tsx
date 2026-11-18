import type {Metadata} from 'next'
import Image from 'next/image'
import {BlogShell} from '../../components/blog/blog-shell'
import styles from './reviews.module.css'

const tripadvisorUrl = 'https://www.tripadvisor.com/Hotel_Review-g293751-d1997580-Reviews-Asanja_Moru-Serengeti_National_Park.html'

const reviews = [
  {
    name: 'Regine F',
    date: 'Oct 2026',
    published: '2026-10-01',
    detail: 'Austria · Travelled with friends',
    quote: 'Regine describes a flawless stay at Asanja Moru and strongly recommends the camp.',
    image: '/legacy/wp-content/uploads/2025/07/camps-asanja-moru-couple_20250709163233.webp',
    imageAlt: 'Guests enjoying a welcome drink at Asanja Moru camp',
    rating: 5,
    reviewUrl: 'https://www.tripadvisor.com/ShowUserReviews-g293751-d1997580-r1082930616-Asanja_Moru-Serengeti_National_Park.html',
  },
  {
    name: 'Meike H',
    date: 'Oct 2026',
    published: '2026-10-01',
    detail: 'Couple · Translated from German',
    quote: 'Meike loved the Serengeti setting, the tented experience, the food and the exceptionally friendly team.',
    image: '/legacy/wp-content/uploads/2025/07/camps-asanja-moru-tent_20250709164250.webp',
    imageAlt: 'Private tent and veranda overlooking the Serengeti at Asanja Moru',
    rating: 5,
    reviewUrl: 'https://www.tripadvisor.com/ShowUserReviews-g293751-d1997580-r1082267929-Asanja_Moru-Serengeti_National_Park.html',
  },
  {
    name: 'Olivier S',
    date: 'Oct 2026',
    published: '2026-10-01',
    detail: 'Travelled with family',
    quote: 'Olivier highlights the remarkable Serengeti views and the kindness of the Asanja Moru staff.',
    image: '/legacy/wp-content/uploads/2025/07/camps-asanja-moru-kopjes_20250722164924.webp',
    imageAlt: 'Rocky kopjes and open wilderness surrounding Asanja Moru',
    rating: 5,
    reviewUrl: 'https://www.tripadvisor.com/ShowUserReviews-g293751-d1997580-r1081256198-Asanja_Moru-Serengeti_National_Park.html',
  },
  {
    name: 'A_KevH',
    date: 'Aug 2026',
    published: '2026-08-01',
    detail: 'Rickmansworth, United Kingdom · Family',
    quote: 'A memorable sunset, phenomenal location, welcoming staff and excellent food made this a trip of a lifetime.',
    image: '/legacy/wp-content/uploads/2024/04/menu-reviews_20250711104945.webp',
    imageAlt: 'Asanja guests raising a toast during a Serengeti sunset',
    rating: 5,
    reviewUrl: 'https://www.tripadvisor.com/ShowUserReviews-g293751-d1997580-r1071651124-Asanja_Moru-Serengeti_National_Park.html',
  },
  {
    name: 'Gajapati DSDeb',
    date: 'Jun 2026',
    published: '2026-06-01',
    detail: 'Bhubaneswar, India · Friends',
    quote: 'The secluded setting, abundant wildlife and expert guides made this an uncrowded Serengeti safari to remember.',
    image: '/legacy/wp-content/uploads/2025/10/Asanja-Game-drives-.webp',
    imageAlt: 'Asanja game-drive vehicle beside a pride of lions in the Serengeti',
    rating: 4,
    reviewUrl: 'https://www.tripadvisor.com/ShowUserReviews-g293751-d1997580-r1069720374-Asanja_Moru-Serengeti_National_Park.html',
  },
  {
    name: 'Mischi M',
    date: 'Apr 2026',
    published: '2026-04-01',
    detail: 'Family · Translated from German',
    quote: 'Mischi praises the well-equipped tents, beautiful views and the unforgettable sight of elephants near camp in the morning.',
    image: '/legacy/wp-content/uploads/2025/08/Elephants-Ash.webp',
    imageAlt: 'An elephant family crossing the open Serengeti grassland',
    rating: 5,
    reviewUrl: `${tripadvisorUrl}#REVIEWS`,
  },
] as const

const totalReviews = 404
const averageRating = 4.9
const ratingBreakdown = [
  {label: 'Excellent', count: 370},
  {label: 'Good', count: 24},
  {label: 'Average', count: 4},
  {label: 'Poor', count: 3},
  {label: 'Terrible', count: 3},
] as const

export const metadata: Metadata = {
  title: 'Asanja Reviews | Guest Experiences and Safari Testimonials',
  description: 'Read genuine Asanja Africa guest reviews and safari stories from travellers who experienced Tanzania’s wildlife, camps and personalised hospitality.',
  alternates: {canonical: 'https://asanjaafrica.com/asanja-reviews/'},
  openGraph: {
    title: 'Asanja Reviews | Guest Experiences and Safari Testimonials',
    description: 'Firsthand stories from guests who travelled with Asanja Africa.',
    url: 'https://asanjaafrica.com/asanja-reviews/',
    type: 'website',
    images: [{url: '/legacy/wp-content/uploads/2024/04/menu-reviews_20250711104945.webp', alt: 'Guests enjoying an Asanja Africa safari'}],
  },
}

export default function AsanjaReviewsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Asanja Africa',
    url: 'https://asanjaafrica.com/',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: totalReviews,
    },
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {'@type': 'Person', name: review.name},
      datePublished: review.published,
      reviewBody: review.quote,
      reviewRating: {'@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1},
    })),
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
          <h1>Stories from<br />our guests</h1>
          <p>Real moments, remarkable wildlife and the warm Asanja hospitality our travellers remember long after returning home.</p>
          <a href="#guest-reviews">Explore guest stories</a>
        </div>
      </header>

      <section className={styles.introduction} id="guest-reviews" aria-labelledby="reviews-heading">
        <div>
          <p className={styles.eyebrow}>Don’t just take our word for it</p>
          <h2 id="reviews-heading">Guest experiences,<br />told firsthand</h2>
        </div>
        <p>Wondering what it’s really like to stay with Asanja Africa? These guest stories share the wildlife encounters, personal service and small details that made their Tanzanian safaris unforgettable.</p>
      </section>

      <section className={styles.summary} aria-label="Asanja Moru Tripadvisor review summary">
        <div className={styles.summaryLead}>
          <p className={styles.summaryKicker}>Asanja Moru on Tripadvisor</p>
          <div className={styles.summaryScore}><strong>{averageRating.toFixed(1)}</strong><span aria-label={`${averageRating.toFixed(1)} out of 5 stars`}>★★★★★</span></div>
          <p><b>{totalReviews} traveller reviews</b> · Tripadvisor data checked November 2026</p>
          <a href={tripadvisorUrl} target="_blank" rel="noopener noreferrer">Read all {totalReviews} reviews <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.breakdown} aria-label="Rating breakdown">
          {ratingBreakdown.map((item) => <div key={item.label}>
            <span>{item.label}</span>
            <i><b style={{width: `${(item.count / totalReviews) * 100}%`}} /></i>
            <strong>{item.count}</strong>
          </div>)}
        </div>
      </section>

      <section className={styles.cards} aria-label={`${reviews.length} featured Tripadvisor reviews`}>
        {reviews.map((review) => <article className={styles.card} key={review.name}>
          <div className={styles.cardImage}>
            <Image src={review.image} alt={review.imageAlt} fill sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw" />
          </div>
          <div className={styles.cardBody}>
            <div className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}</div>
            <blockquote>“{review.quote}”</blockquote>
            <div className={styles.reviewer}>
              <strong>{review.name}</strong>
              <span>{review.detail} · {review.date}</span>
            </div>
            <a href={review.reviewUrl} target="_blank" rel="noopener noreferrer">Read this review on Tripadvisor <span aria-hidden="true">→</span></a>
          </div>
        </article>)}
      </section>

      <section className={styles.closing}>
        <p className={styles.eyebrow}>Your story starts here</p>
        <h2>Ready to experience<br />Asanja for yourself?</h2>
        <a href="/plan-my-stay/">Plan your stay</a>
      </section>
    </article>
  </BlogShell>
}
