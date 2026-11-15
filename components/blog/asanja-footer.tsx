import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import Link from 'next/link'
import {footerGroups} from './asanja-site-data'
import {NewsletterSignup} from './newsletter-signup'
import {AsanjaWhatsApp} from './asanja-whatsapp'

const socialLinks = [
  {label: 'Facebook', href: 'https://www.facebook.com/Asanja.Africa/'},
  {label: 'Instagram', href: 'https://www.instagram.com/asanjaafrica/?hl=en'},
  {label: 'YouTube', href: 'https://www.youtube.com/channel/UCMgdhTrY5qC9-FWYX8APIsg'},
  {label: 'Tripadvisor', href: 'https://www.tripadvisor.com/Search?geo=6&q=asanja&ssrc=h'},
] as const

// The homepage is migrated WordPress HTML, not a React component. Read its actual
// footer icons so the Sanity pages use the same artwork instead of SVG redraws.
async function getHomepageFooterIcons() {
  const html = await readFile(join(process.cwd(), 'public/legacy/index.html'), 'utf8')
  const footerStart = html.indexOf('<footer data-elementor-type="footer"')
  const start = footerStart === -1 ? -1 : html.indexOf('class="elementor-social-icons-wrapper', footerStart)
  const end = html.indexOf('</div>', start)

  if (start === -1 || end === -1) {
    throw new Error('The homepage footer social icons could not be found.')
  }

  const icons = [...html.slice(start, end).matchAll(/<svg\b[\s\S]*?<\/svg>/g)]
    .map(([svg]) => svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" '))

  if (icons.length !== socialLinks.length) {
    throw new Error('The homepage footer social icons have changed; update the safari footer links.')
  }

  return icons
}

export async function AsanjaFooter() {
  const socialIcons = await getHomepageFooterIcons()

  return (
    <>
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
                {socialLinks.map((link, index) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Asanja Africa on ${link.label}`}
                    dangerouslySetInnerHTML={{__html: socialIcons[index]}}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="asanja-footer-bottom">
          <img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="" width={82} height={64} loading="lazy" />
          <div><p>© {new Date().getFullYear()} Asanja Africa. All Rights Reserved. &nbsp;|&nbsp; Created with Love by <a href="https://asanjaafrica.com/" target="_blank" rel="noopener noreferrer">ASANJA</a></p><Link href="/privacy-policy/">Privacy Policy</Link></div>
        </div>
      </footer>
      <AsanjaWhatsApp />
    </>
  )
}
