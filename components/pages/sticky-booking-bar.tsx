'use client'

import {useEffect, useState} from 'react'

export function StickyBookingBar({title, whatsapp, preview = false}: {title: string; whatsapp: string | null; preview?: boolean}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('.safari-trip-page .safari-hero')
    const booking = document.querySelector('.safari-trip-page #booking')
    if (!hero || !booking) return

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const pastHero = hero.getBoundingClientRect().bottom < 0
        const beforeBooking = booking.getBoundingClientRect().top > window.innerHeight
        setVisible(pastHero && beforeBooking)
      })
    }

    update()
    window.addEventListener('scroll', update, {passive: true})
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return <div className={`safari-sticky${visible ? ' is-visible' : ''}`}>
    <span>{title}</span>
    <div><a href="#booking">{preview ? 'View quote form ↗' : 'Plan this safari ↗'}</a>{whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a> : null}</div>
  </div>
}
