import {campLinks, siteMenuLinks} from '../components/blog/asanja-site-data'
import type {CmsMenuLink} from '../components/blog/asanja-menu'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function isCurrentPath(pathname: string, href: string) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  return normalized === href || (href === '/blogs/' && normalized.startsWith('/blogs/'))
}

export function renderAsanjaHeaderMarkup({
  cmsCampLinks = [],
  cmsSafariLinks = [],
  currentPath = '',
}: {
  cmsCampLinks?: CmsMenuLink[]
  cmsSafariLinks?: CmsMenuLink[]
  currentPath?: string
}) {
  const allCampLinks = [...campLinks, ...cmsCampLinks]
    .filter((item, index, items) => items.findIndex(({href}) => href === item.href) === index)
  const menuLinks = siteMenuLinks.map((item) => {
    if (item.href === '/camps-and-lodges/') return {...item, children: allCampLinks}
    if (item.href === '/safaris/' && cmsSafariLinks.length) return {...item, children: cmsSafariLinks}
    return item
  })
  const menuImages = menuLinks.map(({label, image}, index) => (
    `<span${index === 0 ? ' class="is-active"' : ''} style="background-image:url(&quot;${escapeHtml(image)}&quot;)" aria-label="${escapeHtml(label)}"></span>`
  )).join('')
  const menuItems = menuLinks.map((item) => {
    const hasChildren = 'children' in item
    const current = isCurrentPath(currentPath, item.href)
      || (hasChildren && item.children.some(({href}) => isCurrentPath(currentPath, href)))
    const children = hasChildren
      ? `<ul class="asanja-submenu">${item.children.map((child) => {
        const childCurrent = isCurrentPath(currentPath, child.href)
        return `<li${childCurrent ? ' class="is-current"' : ''}><a href="${escapeHtml(child.href)}"${childCurrent ? ' aria-current="page"' : ''}>${escapeHtml(child.label)}</a></li>`
      }).join('')}</ul>`
      : ''

    return `<li class="${hasChildren ? 'has-children ' : ''}${current ? 'is-current' : ''}">
      <div class="asanja-menu-link-row">
        <a href="${escapeHtml(item.href)}"${current ? ' aria-current="page"' : ''}>${escapeHtml(item.label)}</a>
        ${hasChildren ? '<span class="asanja-submenu-indicator" aria-hidden="true"></span>' : ''}
      </div>
      ${children}
    </li>`
  }).join('')

  return `<header class="asanja-site-header" data-asanja-shared-header="true">
    <a class="asanja-header-logo" href="/" aria-label="Asanja Africa home">
      <img src="/legacy/wp-content/uploads/2020/08/Asanja_Logo_clean.svg" alt="Asanja Africa" width="281" height="52" />
    </a>
    <div class="asanja-header-actions">
      <a class="asanja-quote-link" href="/plan-my-stay/">Request a quote</a>
      <div class="asanja-menu">
        <a class="asanja-menu-button" href="#asanja-menu-panel" aria-label="Open Asanja navigation" aria-controls="asanja-menu-panel">
          <span class="asanja-menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
        </a>
        <div class="asanja-menu-panel" id="asanja-menu-panel" role="dialog" aria-modal="true" aria-label="Asanja navigation">
          <div class="asanja-menu-visual" aria-hidden="true">${menuImages}</div>
          <div class="asanja-menu-brand">
            <a href="/" aria-label="Asanja Africa home"><img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="" width="409" height="314" /></a>
            <a class="asanja-menu-booking" href="/plan-my-stay/">Make a booking</a>
          </div>
          <div class="asanja-menu-navigation">
            <a class="asanja-menu-close" href="#" aria-label="Close navigation"><span aria-hidden="true"></span></a>
            <nav aria-label="Main navigation"><ul class="asanja-menu-list">${menuItems}</ul></nav>
          </div>
        </div>
      </div>
    </div>
  </header>`
}
