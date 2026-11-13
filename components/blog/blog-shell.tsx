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
                <a href="https://www.facebook.com/Asanja.Africa/" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on Facebook">
                  <svg className="asanja-social-facebook" aria-hidden="true" viewBox="0 0 14 24" fill="none"><path d="M12.77 12.988V9.205H8.701V7.258c0-1.925.893-2.889 2.681-2.889.635 0 1.308.136 2.019.408V.79c-.711-.22-1.615-.33-2.713-.33-2.153 0-3.891.591-5.215 1.773-1.325 1.184-1.986 2.764-1.986 4.742v2.229H.498v3.784h2.987v10.365a14.56 14.56 0 0 0 5.216-.314V12.988h4.069Z" fill="currentColor"/></svg>
                </a>
                <a href="https://www.instagram.com/asanjaafrica/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on Instagram">
                  <svg className="asanja-social-instagram" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M19.364 5.9a1.614 1.614 0 1 1-3.228 0 1.614 1.614 0 0 1 3.228 0Z" fill="currentColor"/><path d="M11.796 5.901a5.954 5.954 0 1 0 0 11.908 5.954 5.954 0 0 0 0-11.908Zm0 9.743a3.79 3.79 0 1 1 0-7.578 3.79 3.79 0 0 1 0 7.578Z" fill="currentColor"/><path d="M16.64.46H6.952A6.552 6.552 0 0 0 .4 7.012v9.687a6.552 6.552 0 0 0 6.552 6.552h9.688a6.552 6.552 0 0 0 6.551-6.552V7.012A6.551 6.551 0 0 0 16.64.46Zm4.342 16.28a4.302 4.302 0 0 1-4.302 4.303H6.911a4.302 4.302 0 0 1-4.302-4.302v-9.77A4.302 4.302 0 0 1 6.91 2.669h9.77a4.302 4.302 0 0 1 4.302 4.302v9.77Z" fill="currentColor"/></svg>
                </a>
                <a href="https://www.youtube.com/channel/UCMgdhTrY5qC9-FWYX8APIsg" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on YouTube">
                  <svg className="asanja-social-youtube" aria-hidden="true" viewBox="0 0 32 24" fill="none"><path d="M27.389 1.027a116.5 116.5 0 0 0-22.979 0A4.232 4.232 0 0 0 .191 5.272v13.376a4.232 4.232 0 0 0 4.219 4.245c7.659.756 15.318.756 22.978 0a4.232 4.232 0 0 0 4.218-4.245V5.272a4.232 4.232 0 0 0-4.218-4.245ZM11.691 16.96V6.96l8.416 5.406-8.416 4.595Z" fill="currentColor"/></svg>
                </a>
                <a className="asanja-social-link-tripadvisor" href="https://www.tripadvisor.com/Search?geo=6&q=asanja&ssrc=h" target="_blank" rel="noopener noreferrer" aria-label="Asanja Africa on Tripadvisor">
                  <svg className="asanja-social-tripadvisor" aria-hidden="true" viewBox="0 0 38 24" fill="none">
                    <path d="M37.502 14.881c-.196.836-.293 1.713-.604 2.503-1.33 3.372-3.812 5.392-7.402 5.914-2.807.408-5.291-.419-7.415-2.306l-.357-.318-1.574 2.152c-.57.762-1.403.775-1.99.031l-1.729-2.21c-3.93 3.86-9.397 3.24-12.536.599C.431 18.334-.73 12.742 2.577 8.455L1.166 7.108C.618 6.625.457 6.106.752 5.558c.26-.484.704-.616 1.213-.616 1.585 0 3.171-.005 4.756.004.253.001.443-.069.645-.232C11.42 1.41 16.044-.008 21.253.595c3.604.418 6.774 1.86 9.562 4.17.123.104.317.169.48.17 1.561.012 3.124.022 4.684 0 .727-.01 1.267.212 1.522.934v.432c-.122.394-.405.653-.705.919l-1.284 1.271c.801 1.035 1.349 2.094 1.655 3.267.138.529.225 1.071.335 1.608v1.515ZM4.482 7.249c.142.259.256.455.359.656.379.738.332 1.115-.199 1.736-1.63 1.906-2.103 4.074-1.449 6.49.844 3.119 4.179 5.348 7.362 4.93 3.021-.396 5.273-2.397 6.006-5.334.875-3.509-1.381-7.29-4.88-8.213-.942-.248-1.896-.269-2.857-.266H4.482Zm29.138 0h-.372c-1.044 0-2.089-.007-3.133.002-1.234.01-2.468-.064-3.686.26-3.52.936-5.768 4.712-4.88 8.243.897 3.565 4.11 5.745 7.749 5.258 4.161-.557 6.9-4.974 5.556-8.95-.308-.912-.775-1.723-1.411-2.444-.516-.585-.556-.977-.201-1.672.108-.213.228-.42.379-.697Zm-6.544-2.264c-5.027-3.129-11.732-2.773-16.03.006 4.591.934 7.253 3.726 8.003 8.289.757-4.561 3.41-7.348 8.027-8.295Zm-6.849 13.807c-.269-.667-.555-1.265-.75-1.892-.193-.62-.294-1.269-.435-1.903l-.035.039c-.12 1.234-.48 2.394-1.045 3.495-.044.086-.051.247 0 .317.362.49.743.966 1.148 1.484l1.121-1.54Z" fill="currentColor"/>
                    <path d="M9.799 18.782c-2.54-.012-4.597-2.083-4.588-4.62.009-2.53 2.096-4.61 4.618-4.603 2.544.006 4.625 2.109 4.606 4.651-.02 2.539-2.093 4.583-4.636 4.572Zm.011-2.309a2.308 2.308 0 0 0 2.317-2.302 2.311 2.311 0 0 0-2.291-2.303 2.327 2.327 0 0 0-2.317 2.314 2.3 2.3 0 0 0 2.291 2.291ZM28.28 18.782c-2.542.002-4.609-2.054-4.617-4.591-.008-2.542 2.093-4.646 4.626-4.632 2.532.013 4.601 2.093 4.598 4.622-.003 2.538-2.067 4.598-4.607 4.601Zm-.017-2.309a2.308 2.308 0 0 0 2.316-2.302 2.311 2.311 0 0 0-2.291-2.304 2.327 2.327 0 0 0-2.316 2.315 2.3 2.3 0 0 0 2.291 2.291Z" fill="currentColor"/>
                    <path d="M9.881 15.318c-.641.007-1.158-.486-1.174-1.117-.015-.646.51-1.185 1.15-1.183.626.001 1.151.52 1.158 1.145.008.632-.501 1.149-1.134 1.155ZM28.311 15.32c-.635-.005-1.147-.516-1.147-1.145 0-.633.512-1.151 1.141-1.156.638-.004 1.179.538 1.169 1.172-.011.634-.525 1.133-1.163 1.129Z" fill="currentColor"/>
                  </svg>
                </a>
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
