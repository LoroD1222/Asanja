import type {Metadata} from 'next'
import Image from 'next/image'
import {BlogShell} from '../../components/blog/blog-shell'
import styles from './reviews.module.css'

const tripadvisorUrl = 'https://www.tripadvisor.com/Search?geo=6&q=asanja&ssrc=h'

const reviews = [
  {
    name: 'Jonas D',
    date: 'Sep 2026',
    published: '2026-09-01',
    detail: 'Couples',
    quote: 'Victor spots animals as if it’s the easiest thing in the world! We saw an incredible variety of wildlife and even managed to see the complete Big Five.',
    image: '/legacy/wp-content/uploads/2025/10/Asanja-Game-drives-.webp',
    imageAlt: 'Asanja safari vehicle watching a pride of lions on the Serengeti plains',
    rating: 5,
  },
  {
    name: 'Roar H',
    date: 'Jul 2026',
    published: '2026-07-01',
    detail: 'Couples · Translated from Norwegian',
    quote: 'Saw the big 5 animals several times. Stayed in a tent 2 nights. Elephants 20 meters from the camp and the zebra that went through the camp.',
    image: '/legacy/wp-content/uploads/2025/08/Elephants-Ash.webp',
    imageAlt: 'Elephant family walking together across the African savannah',
    rating: 5,
  },
  {
    name: 'Philippa H',
    date: 'Sep 2025',
    published: '2025-09-01',
    detail: 'Riverdale, Australia',
    quote: 'Hearing lions roaring through the night was a cool experience. Our chef cooked fabulous meals and our guide was knowledgeable.',
    image: '/legacy/wp-content/uploads/2025/07/Experiences-Header-gamedrive.webp',
    imageAlt: 'Asanja safari vehicle crossing a river beside a pod of hippos',
    rating: 5,
  },
] as const

const totalReviews = reviews.length
const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

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
          <a href="#guest-reviews">Read the reviews <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <section className={styles.introduction} id="guest-reviews" aria-labelledby="reviews-heading">
        <div>
          <p className={styles.eyebrow}>Don’t just take our word for it</p>
          <h2 id="reviews-heading">Guest experiences,<br />told firsthand</h2>
        </div>
        <p>Wondering what it’s really like to stay with Asanja Africa? These guest stories share the wildlife encounters, personal service and small details that made their Tanzanian safaris unforgettable.</p>
      </section>

      <section className={styles.summary} aria-label="Review summary">
        <div><strong>{averageRating.toFixed(1)}</strong><span aria-label={`${averageRating.toFixed(1)} out of 5 stars`} className={styles.summaryStars}>★★★★★</span><small>Average rating</small></div>
        <div><strong>{totalReviews}</strong><span>guest reviews</span><small>Published on this page</small></div>
        <a href={tripadvisorUrl} target="_blank" rel="noopener noreferrer">See Asanja on Tripadvisor <span aria-hidden="true">↗</span></a>
      </section>

      <section className={styles.cards} aria-label={`${totalReviews} guest reviews`}>
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
            <a href={tripadvisorUrl} target="_blank" rel="noopener noreferrer">Explore Asanja on Tripadvisor <span aria-hidden="true">→</span></a>
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
