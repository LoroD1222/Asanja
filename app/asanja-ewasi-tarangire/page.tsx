import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {BlogShell} from '../../components/blog/blog-shell'
import styles from './ewasi.module.css'

const title = 'Asanja Ewasi Tarangire'
const description = 'Opening in 2027 in Tarangire National Park, Asanja Ewasi is an intimate 10-room luxury safari camp with private plunge pools and personalised Asanja hospitality.'
const canonical = 'https://asanjaafrica.com/asanja-ewasi-tarangire/'

export const metadata: Metadata = {
  title,
  description,
  alternates: {canonical},
  keywords: ['Asanja Ewasi', 'Tarangire luxury camp', 'Tarangire National Park accommodation', 'luxury safari camp Tanzania', 'Asanja Africa'],
  openGraph: {
    type: 'website',
    url: canonical,
    title,
    description,
    images: [{url: '/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp', width: 1920, height: 1081, alt: 'Asanja Ewasi private suite and plunge pool in Tarangire'}],
  },
  twitter: {card: 'summary_large_image', title, description, images: ['/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp']},
}

const facts = [
  {value: '2027', label: 'Opening in Tarangire National Park'},
  {value: '10', label: 'Rooms, including one family unit'},
  {value: '30 min', label: 'From Kuro Airstrip'},
  {value: 'Private', label: 'Plunge pool for every room'},
]

const experiences = [
  'Guided nature walks',
  'Sundowner experiences',
  'Night game drives',
  'Immersive bush activities',
]

const gallery = [
  {src: '/camps/asanja-ewasi-tarangire/ewasi-safari-001.webp', alt: 'Spacious Asanja Ewasi suite with a four-poster bed and open wilderness views', width: 2560, height: 1441},
  {src: '/camps/asanja-ewasi-tarangire/ewasi-safari-002.webp', alt: 'Asanja Ewasi suite exterior with a private plunge pool', width: 2560, height: 1441},
  {src: '/camps/asanja-ewasi-tarangire/ewasi-safari-001-social.webp', alt: 'Interior of an Asanja Ewasi guest suite in Tarangire', width: 1920, height: 1081},
  {src: '/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp', alt: 'Private suite and plunge pool at Asanja Ewasi Tarangire', width: 1920, height: 1081},
]

export default function AsanjaEwasiTarangirePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: title,
    description,
    url: canonical,
    image: gallery.map((image) => new URL(image.src, canonical).toString()),
    address: { '@type': 'PostalAddress', addressLocality: 'Tarangire National Park', addressCountry: 'TZ' },
    numberOfRooms: 10,
    amenityFeature: [
      {'@type': 'LocationFeatureSpecification', name: 'Private plunge pool', value: true},
      {'@type': 'LocationFeatureSpecification', name: 'Family unit', value: true},
    ],
  }

  return <BlogShell>
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData).replace(/</g, '\\u003c')}} />

      <header className={styles.hero}>
        <Image src="/camps/asanja-ewasi-tarangire/ewasi-safari-002.webp" alt="Asanja Ewasi luxury suite and plunge pool in Tarangire National Park" fill priority sizes="100vw" />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p>Opening 2027 · Tarangire National Park</p>
          <h1>Asanja Ewasi<br />Tarangire</h1>
          <span>A new expression of open hearts and wild spirits</span>
          <Link href="/plan-my-stay/">Plan your stay</Link>
        </div>
      </header>

      <section className={styles.introduction}>
        <div>
          <p className={styles.eyebrow}>The spirit of the plains</p>
          <h2>Rooted in Tarangire</h2>
        </div>
        <div className={styles.lead}>
          <p>Opening in 2027 within Tarangire National Park, Asanja Ewasi will feature 10 rooms, including one family unit.</p>
          <p>“Ewasi,” a place in Tarangire and a Maa word meaning “plain ground,” reflects the camp’s deep connection to the land and its rich heritage.</p>
          <p>Guests will discover the unique wonders of Tarangire, from vast plains dotted with ancient baobabs and immense elephant herds to seasonal migrations and the rare sight of tree-climbing pythons, all while enjoying Asanja’s signature personalised hospitality.</p>
        </div>
      </section>

      <section className={styles.facts} aria-label="Asanja Ewasi camp facts">
        {facts.map((fact) => <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}
      </section>

      <section className={styles.split}>
        <div className={styles.imageFrame}>
          <Image src="/camps/asanja-ewasi-tarangire/ewasi-safari-001.webp" alt="Asanja Ewasi guest suite with a four-poster bed and wilderness views" fill sizes="(max-width: 800px) 100vw, 55vw" />
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Asanja Ewasi Tarangire</p>
          <h2>Intimate luxury in the heart of the wild</h2>
          <p>Nestled within the heart of Tarangire National Park, just a 30-minute drive from Kuro Airstrip, Asanja Ewasi will open in 2027, offering an exclusive safari experience that combines luxury, authenticity, and a deep connection to the surrounding wilderness.</p>
        </div>
      </section>

      <section className={styles.heritage}>
        <p className={styles.eyebrow}>Cultural heritage</p>
        <h2>A name born from the land</h2>
        <p>The name “Ewasi,” derived from a Maa word meaning “plain ground,” reflects the camp’s strong connection to the land, its people, and the rich cultural heritage of northern Tanzania.</p>
      </section>

      <section className={`${styles.split} ${styles.splitReverse}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Storytelling through design</p>
          <h2>Privacy, exclusivity and a sense of place</h2>
          <p>Designed for privacy and exclusivity, the camp will feature 10 luxurious rooms, including one family unit, each with its own private plunge pool. Thoughtfully positioned to maximise privacy and sweeping views of the surrounding wilderness, the camp offers personalised service and an intimate atmosphere in the heart of Tarangire National Park.</p>
          <p>Every room has been carefully designed to blend contemporary luxury with authentic Tanzanian influences, creating elegant spaces that celebrate the landscapes, cultures, and stories of the land and its people.</p>
        </div>
        <div className={styles.imageFrame}>
          <Image src="/camps/asanja-ewasi-tarangire/ewasi-safari-002-social.webp" alt="Asanja Ewasi private suite and plunge pool surrounded by Tarangire wilderness" fill sizes="(max-width: 800px) 100vw, 55vw" />
        </div>
      </section>

      <section className={styles.encounters}>
        <div>
          <p className={styles.eyebrow}>Beyond the drive</p>
          <h2>Unforgettable encounters</h2>
          <p>Guests can experience the unique wonders of Tarangire, from immense elephant herds and iconic baobab-dotted plains to seasonal wildlife migrations and the rare sighting of tree-climbing pythons. From camp, it is not uncommon to witness giraffes, zebras, predators, and other wildlife passing through the surrounding wilderness.</p>
          <p>Asanja Ewasi offers more than traditional game drives. Guests can further connect with the wilderness through experiences that reveal Tarangire from a new perspective.</p>
        </div>
        <ul>{experiences.map((experience) => <li key={experience}>{experience}</li>)}</ul>
      </section>

      <section className={styles.gallery} aria-labelledby="ewasi-gallery-title">
        <div className={styles.galleryHeading}><p className={styles.eyebrow}>A first look</p><h2 id="ewasi-gallery-title">Asanja Ewasi</h2></div>
        <div className={styles.galleryGrid}>
          {gallery.map((image, index) => <figure key={image.src} className={index < 2 ? styles.galleryWide : undefined}>
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes={index < 2 ? '(max-width: 800px) 100vw, 50vw' : '(max-width: 800px) 100vw, 25vw'} />
          </figure>)}
        </div>
      </section>

      <section className={styles.cta}>
        <p>Opening in 2027</p>
        <h2>Be among the first to experience Ewasi</h2>
        <Link href="/plan-my-stay/">Start planning your safari</Link>
      </section>
    </article>
  </BlogShell>
}
