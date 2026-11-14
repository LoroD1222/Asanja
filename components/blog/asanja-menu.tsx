import {campLinks, siteMenuLinks} from './asanja-site-data'

function isCurrentPath(pathname: string, href: string) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  return normalized === href || (href === '/blogs/' && normalized.startsWith('/blogs/'))
}

export type CmsMenuLink = {label: string; href: string}

export function AsanjaMenu({
  cmsCampLinks = [],
  cmsSafariLinks = [],
  currentPath = '',
}: {
  cmsCampLinks?: CmsMenuLink[]
  cmsSafariLinks?: CmsMenuLink[]
  currentPath?: string
}) {
  const pathname = currentPath
  const allCampLinks = [...campLinks, ...cmsCampLinks].filter((item, index, items) => items.findIndex(({href}) => href === item.href) === index)
  const menuLinks = siteMenuLinks.map((item) => {
    if (item.href === '/camps-and-lodges/') return {...item, children: allCampLinks}
    if (item.href === '/safaris/' && cmsSafariLinks.length) return {...item, children: cmsSafariLinks}
    return item
  })

  return <div className="asanja-menu">
    <a className="asanja-menu-button" href="#asanja-menu-panel" aria-label="Open Asanja navigation" aria-controls="asanja-menu-panel">
      <span className="asanja-menu-icon" aria-hidden="true"><span/><span/><span/></span>
    </a>
    <div className="asanja-menu-panel" id="asanja-menu-panel" role="dialog" aria-modal="true" aria-label="Asanja navigation">
      <div className="asanja-menu-visual" aria-hidden="true">
        {menuLinks.map(({label, image}, index) => <span key={label} className={index === 0 ? 'is-active' : ''} style={{backgroundImage: `url(${image})`}} />)}
      </div>
      <div className="asanja-menu-brand">
        <a href="/" aria-label="Asanja Africa home">
          <img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="" width={409} height={314} />
        </a>
        <a className="asanja-menu-booking" href="/plan-my-stay/">Make a booking</a>
      </div>
      <div className="asanja-menu-navigation">
        <a className="asanja-menu-close" href="#" aria-label="Close navigation"><span aria-hidden="true" /></a>
        <nav aria-label="Main navigation">
          <ul className="asanja-menu-list">
            {menuLinks.map((item, index) => {
              const hasChildren = 'children' in item
              const current = isCurrentPath(pathname, item.href) || (hasChildren && item.children.some(({href}) => isCurrentPath(pathname, href)))
              const submenuId = `asanja-submenu-${index}`
              const controlId = `${submenuId}-control`
              return <li key={item.href} className={`${hasChildren ? 'has-children ' : ''}${current ? 'is-current' : ''}`}>
                {hasChildren ? <input
                  className="asanja-submenu-control"
                  id={controlId}
                  type="checkbox"
                  aria-label={`Show ${item.label} links`}
                  aria-controls={submenuId}
                /> : null}
                <div className="asanja-menu-link-row">
                  <a href={item.href} aria-current={current ? 'page' : undefined}>{item.label}</a>
                  {hasChildren ? <>
                    <span className="asanja-submenu-indicator" aria-hidden="true" />
                    <label
                      className="asanja-submenu-toggle"
                      htmlFor={controlId}
                      aria-label={`Toggle ${item.label} links`}
                    >
                      <span aria-hidden="true" />
                    </label>
                  </> : null}
                </div>
                {hasChildren ? <ul className="asanja-submenu" id={submenuId}>
                  {item.children.map((child) => {
                    const childCurrent = isCurrentPath(pathname, child.href)
                    return <li key={child.href} className={childCurrent ? 'is-current' : ''}>
                      <a href={child.href} aria-current={childCurrent ? 'page' : undefined}>{child.label}</a>
                    </li>
                  })}
                </ul> : null}
              </li>
            })}
          </ul>
        </nav>
      </div>
    </div>
  </div>
}
