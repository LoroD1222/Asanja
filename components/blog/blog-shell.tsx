import Link from 'next/link'
import type {ReactNode} from 'react'
import {AsanjaMenu} from './asanja-menu'
import {NewsletterSignup} from './newsletter-signup'
import {footerGroups} from './asanja-site-data'
import {getCampMenuItems} from '../../sanity/camp-data'
import '../../app/sanity-blog.css'

export async function BlogShell({children, className = ''}: {children: ReactNode; className?: string}) {
  const cmsCampLinks = await getCampMenuItems().catch(() => [])

  return (
    <div className={`sanity-blog asanja-shared-shell ${className}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="asanja-site-header">
        <Link className="asanja-header-logo" href="/" aria-label="Asanja Africa home">
          <img src="/legacy/wp-content/uploads/2020/08/Asanja_Logo_clean.svg" alt="Asanja Africa" width={281} height={52} />
        </Link>
        <div className="asanja-header-actions">
          <Link className="asanja-quote-link" href="/plan-my-stay/">Request a quote</Link>
          <AsanjaMenu cmsCampLinks={cmsCampLinks} />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="asanja-site-footer">
        <div className="asanja-footer-landscape" aria-hidden="true" />
        <div className="asanja-footer-main">
          <div className="asanja-footer-top">
            <Link href="/" aria-label="Asanja Africa home">
              <img className="asanja-footer-logo" src="/legacy/wp-content/uploads/2024/04/asanja_logo_with_slogan_dark-03.svg" alt="Asanja Africa — Open Hearts and Wild Spirits" width={430} height={108} loading="lazy" />
            </Link>
            <NewsletterSignup />
          </div>
          <div className="asanja-footer-links">
            {footerGroups.map((group) => <div key={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
            </div>)}
            <div>
              <h2>Socials</h2>
              <div className="asanja-footer-socials">
                <a href="https://www.facebook.com/Asanja.Africa/" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on Facebook"><span aria-hidden="true" className="asanja-social-facebook">f</span></a>
                <a href="https://www.instagram.com/asanjaafrica/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on Instagram"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none"/></svg></a>
                <a href="https://www.youtube.com/channel/UCMgdhTrY5qC9-FWYX8APIsg" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on YouTube"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="4" width="22" height="16" rx="4"/><path d="m10 8 6 4-6 4z" fill="#f5f2ee"/></svg></a>
                <a href="https://www.tripadvisor.com/Search?geo=6&q=asanja&ssrc=h" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on Tripadvisor"><span aria-hidden="true" className="asanja-social-tripadvisor">◉◉</span></a>
              </div>
            </div>
          </div>
        </div>
        <div className="asanja-footer-bottom">
          <img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="" width={82} height={64} loading="lazy" />
          <div><p>© {new Date().getFullYear()} Asanja Africa. All Rights Reserved. &nbsp;|&nbsp; Created with Love by <a href="https://asanjaafrica.com/" target="_blank" rel="noopener noreferrer">ASANJA</a></p><Link href="/privacy-policy/">Privacy Policy</Link></div>
        </div>
      </footer>
    </div>
  )
}
