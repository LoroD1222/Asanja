import Link from 'next/link'
import {BlogShell} from '../blog/blog-shell'
import type {CampPage} from '../../sanity/camp-types'
import type {PageMedia} from '../../sanity/page-types'
import {RelatedBlogs, RelatedCards} from './page-sections'
import {PageImage} from './page-image'
import {PortablePageText} from './portable-page-text'
import {SafariGallery} from './safari-gallery'
import styles from './camp-page.module.css'

function photoAt(items: PageMedia[] | undefined, index: number) {
  return (items || []).filter((item) => item.kind === 'photo' && item.image?.asset?.url)[index]?.image
}

export function CampPageView({page}: {page: CampPage}) {
  const storyImage = page.storyImage || photoAt(page.gallery, 0) || page.heroImage
  const locationImage = page.locationImage || photoAt(page.gallery, 1) || page.heroImage
  const storyPoints = (page.storyPoints || []).filter((point) => point.title)
  const facilities = (page.facilities || []).filter(Boolean)
  const locationName = page.location || page.destination?.title
  const heroTitle = page.heroEyebrow || `Welcome to ${page.title}`

  return <BlogShell className="camp-site">
    <article className={styles.page}>
      <header className={styles.hero}>
        <PageImage image={page.heroImage} className={styles.heroImage} priority sizes="100vw" />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <h1>{heroTitle}</h1>
          <a href="#camp-introduction" className={styles.scrollCue} aria-label={`Discover ${page.title}`}>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </header>

      <section className={styles.introduction} id="camp-introduction">
        <div className={styles.narrow}>
          <p className={styles.eyebrow}>{page.tagline || locationName || 'An Asanja wilderness sanctuary'}</p>
          <h2>{page.title}</h2>
          {page.description?.length ? <PortablePageText value={page.description} /> : page.summary ? <p className={styles.lead}>{page.summary}</p> : null}
        </div>
      </section>

      {(storyImage?.asset?.url || page.storyHeading || storyPoints.length) ? <section className={styles.story} aria-labelledby="camp-story-heading">
        <div className={styles.storyImage}>{storyImage?.asset?.url ? <PageImage image={storyImage} sizes="(max-width: 900px) 100vw, 48vw" /> : null}</div>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>About {page.title}</p>
          <h2 id="camp-story-heading">{page.storyHeading || 'Discover a landscape of luxury'}</h2>
          {storyPoints.length ? <div className={styles.storyPoints}>{storyPoints.map((point) => <section key={point._key}>
            <h3>{point.title}</h3>
            {point.description ? <p>{point.description}</p> : null}
          </section>)}</div> : page.summary ? <p className={styles.storyFallback}>{page.summary}</p> : null}
        </div>
      </section> : null}

      {page.gallery?.length ? <section className={styles.gallery} aria-labelledby="camp-gallery-heading">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Inside the camp</p>
          <h2 id="camp-gallery-heading">A closer look</h2>
        </div>
        <SafariGallery items={page.gallery} />
      </section> : null}

      {facilities.length ? <section className={styles.amenities} aria-labelledby="camp-amenities-heading">
        <div className={styles.amenitiesIntro}>
          <p className={styles.eyebrow}>Amenities</p>
          <h2 id="camp-amenities-heading">Included in your stay</h2>
          {page.amenitiesIntroduction?.length ? <PortablePageText value={page.amenitiesIntroduction} /> : <p>Thoughtful comforts and attentive Asanja hospitality make every stay feel effortless.</p>}
        </div>
        <ol className={styles.facilityList}>{facilities.map((facility, index) => <li key={facility}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{facility}</strong>
        </li>)}</ol>
      </section> : null}

      {(locationImage?.asset?.url || locationName || page.locationDescription?.length) ? <section className={styles.location} aria-labelledby="camp-location-heading">
        <div className={styles.locationMedia}>{locationImage?.asset?.url ? <PageImage image={locationImage} sizes="(max-width: 900px) 100vw, 46vw" /> : null}</div>
        <div className={styles.locationCard}>
          <p className={styles.eyebrow}>Location</p>
          <h2 id="camp-location-heading">{locationName || 'In the heart of the wild'}</h2>
          {page.locationDescription?.length ? <PortablePageText value={page.locationDescription} /> : page.destination?.summary ? <p>{page.destination.summary}</p> : page.summary ? <p>{page.summary}</p> : null}
          {page.destination?.slug ? <Link href={`/destinations/${page.destination.slug}/`}>Explore the destination</Link> : null}
        </div>
      </section> : null}

      {(page.relatedSafariTrips?.length || page.relatedBlogs?.length) ? <div className={styles.related}>
        <RelatedCards eyebrow="Continue your journey" title="Safari journeys" items={page.relatedSafariTrips} label="Safari trip" />
        <RelatedBlogs eyebrow="Asanja journal" title="Stories from the wild" articles={page.relatedBlogs} />
      </div> : null}

      <section className={styles.booking}>
        {page.bookingImage?.asset?.url ? <>
          <PageImage image={page.bookingImage} className={styles.bookingImage} sizes="100vw" />
          <div className={styles.bookingWash} />
        </> : null}
        <div className={styles.bookingContent}>
          <p className={styles.eyebrow}>Stay with us</p>
          <h2>{page.bookingHeading || 'Make a booking'}</h2>
          {page.bookingText?.length ? <PortablePageText value={page.bookingText} /> : <p>Let our safari specialists create a personalised journey around your stay at {page.title}.</p>}
          <Link href="/plan-my-stay/">{page.bookingButtonLabel || 'Make a booking'}</Link>
        </div>
      </section>
    </article>
  </BlogShell>
}
