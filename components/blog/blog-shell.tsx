import Link from 'next/link'
import type {ReactNode} from 'react'
import '../../app/sanity-blog.css'

export function BlogShell({children}: {children: ReactNode}) {
  return (
    <div className="sanity-blog">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="blog-header">
        <Link className="blog-logo" href="/" aria-label="Asanja Africa home">
          <img
            src="/legacy/wp-content/uploads/2020/08/Asanja_Logo_clean.svg"
            alt="Asanja Africa"
            width={184}
            height={52}
          />
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/about/">Asanja Story</Link>
          <Link href="/camps-and-lodges/">Camps &amp; Lodges</Link>
          <Link href="/safaris/">Safaris</Link>
          <Link href="/experiences/">Experiences</Link>
          <Link href="/blogs/">Journal</Link>
        </nav>
        <Link className="outline-button" href="/make-a-booking/">Request a quote</Link>
      </header>
      <main id="main-content">{children}</main>
      <footer className="blog-footer">
        <div>
          <img
            src="/legacy/wp-content/uploads/2024/04/asanja_logo_with_slogan_dark-03.svg"
            alt="Asanja Africa — Open hearts and wild spirits"
            width={210}
            height={90}
          />
          <p>Unforgettable safari experiences in Tanzania.</p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/camps-and-lodges/">Our Camps</Link>
          <Link href="/safaris/">Safaris</Link>
          <Link href="/experiences/">Experiences</Link>
        </div>
        <div>
          <h2>About</h2>
          <Link href="/about/">Our Story</Link>
          <Link href="/faqs/">FAQ</Link>
          <Link href="/contact/">Contact</Link>
        </div>
        <div>
          <h2>Plan your stay</h2>
          <Link href="/make-a-booking/">Make a booking</Link>
          <Link href="/plan-my-stay/">Help me plan</Link>
          <Link href="/terms/">Terms &amp; conditions</Link>
        </div>
        <p className="blog-copyright">© {new Date().getFullYear()} Asanja Africa. All rights reserved.</p>
      </footer>
    </div>
  )
}
