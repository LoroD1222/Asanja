'use client'

import Image from 'next/image'
import {useCallback, useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import type {PageMedia} from '../../sanity/page-types'
import type {SanityImage} from '../../sanity/types'
import styles from './camp-carousels.module.css'

function nearestSlide(track: HTMLDivElement) {
  const slides = Array.from(track.children) as HTMLElement[]
  if (!slides.length) return 0
  return slides.reduce((closest, slide, index) => {
    const currentDistance = Math.abs(slide.offsetLeft - track.scrollLeft)
    const closestDistance = Math.abs(slides[closest].offsetLeft - track.scrollLeft)
    return currentDistance < closestDistance ? index : closest
  }, 0)
}

function useCarousel(length: number) {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const frame = useRef<number | null>(null)

  const goTo = useCallback((index: number) => {
    const element = track.current?.children[index] as HTMLElement | undefined
    if (!element || !track.current) return
    track.current.scrollTo({left: element.offsetLeft, behavior: 'smooth'})
    setActive(index)
  }, [])

  const move = useCallback((direction: -1 | 1) => {
    goTo((active + direction + length) % length)
  }, [active, goTo, length])

  const onScroll = useCallback(() => {
    if (!track.current) return
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      if (track.current) setActive(nearestSlide(track.current))
    })
  }, [])

  return {active, goTo, move, onScroll, track}
}

function CarouselControls({active, count, label, unit = 'slide', move, goTo}: {
  active: number
  count: number
  label: string
  unit?: 'slide' | 'group'
  move: (direction: -1 | 1) => void
  goTo: (index: number) => void
}) {
  return <div className={styles.controls}>
    <button type="button" onClick={() => move(-1)} aria-label={`Previous ${label}`} className={styles.arrow}>‹</button>
    <div className={styles.dots} role="group" aria-label={`${label} slides`}>
      {Array.from({length: count}, (_, index) => <button
        key={index}
        type="button"
        className={index === active ? styles.activeDot : styles.dot}
        onClick={() => goTo(index)}
        aria-label={`Show ${label} ${unit} ${index + 1} of ${count}`}
        aria-current={index === active ? 'true' : undefined}
      />)}
    </div>
    <button type="button" onClick={() => move(1)} aria-label={`Next ${label}`} className={styles.arrow}>›</button>
  </div>
}

export function CampGalleryCarousel({items}: {items?: PageMedia[]}) {
  const photos = (items || []).filter((item) => item.kind === 'photo' && item.image?.asset?.url)
  const carousel = useCarousel(photos.length)
  if (!photos.length) return null
  const photoSizes = photos.length === 1
    ? '100vw'
    : photos.length === 2
      ? '(max-width: 600px) 88vw, (max-width: 900px) 68vw, 50vw'
      : '(max-width: 600px) 88vw, (max-width: 900px) 68vw, 34vw'

  return <div className={styles.galleryShell} data-photo-count={photos.length}>
    <div
      className={styles.galleryTrack}
      ref={carousel.track}
      onScroll={carousel.onScroll}
      role="region"
      aria-label={`Camp gallery, ${photos.length} photographs`}
      tabIndex={0}
    >
      {photos.map((item, index) => <figure className={styles.gallerySlide} key={item._key}>
        <Image
          src={item.image!.asset!.url!}
          alt={item.image?.alt || item.caption || ''}
          fill
          sizes={photoSizes}
          quality={90}
        />
        {item.caption ? <figcaption>{item.caption}</figcaption> : null}
        <span className={styles.slideNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </figure>)}
    </div>
    {photos.length > 1 ? <CarouselControls active={carousel.active} count={photos.length} label="gallery" move={carousel.move} goTo={carousel.goTo} /> : null}
  </div>
}

export function CampLocationCarousel({images, label}: {images: SanityImage[]; label: string}) {
  const slides = useMemo(() => images.filter((image, index, all) => {
    const url = image.asset?.url
    return Boolean(url) && all.findIndex((candidate) => candidate.asset?.url === url) === index
  }), [images])
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5200)
    return () => window.clearInterval(interval)
  }, [slides.length])

  if (!slides.length) return null

  const move = (direction: -1 | 1) => setActive((current) => (current + direction + slides.length) % slides.length)

  return <div className={styles.locationCarousel} role="region" aria-roledescription="carousel" aria-label={`${label} location gallery`}>
    {slides.map((image, index) => <Image
      key={image.asset!.url}
      src={image.asset!.url!}
      alt={image.alt || `${label} location view ${index + 1}`}
      fill
      sizes="(max-width: 900px) 100vw, 50vw"
      quality={90}
      className={index === active ? styles.locationImageActive : styles.locationImage}
      aria-hidden={index !== active}
    />)}
    {slides.length > 1 ? <>
      <button type="button" className={`${styles.locationArrow} ${styles.locationArrowPrevious}`} onClick={() => move(-1)} aria-label="Previous location image">‹</button>
      <button type="button" className={`${styles.locationArrow} ${styles.locationArrowNext}`} onClick={() => move(1)} aria-label="Next location image">›</button>
      <div className={styles.locationDots} role="group" aria-label="Location images">
        {slides.map((image, index) => <button
          key={image.asset!.url}
          type="button"
          className={index === active ? styles.locationDotActive : styles.locationDot}
          onClick={() => setActive(index)}
          aria-label={`Show location image ${index + 1} of ${slides.length}`}
          aria-current={index === active ? 'true' : undefined}
        />)}
      </div>
    </> : null}
  </div>
}

function AmenityIcon({facility, index}: {facility: string; index: number}) {
  const label = facility.toLowerCase()
  let icon: ReactNode

  if (label.includes('suite') || label.includes('room')) {
    icon = <>
      <path d="M8 40V20c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4v20M8 29h32M6 40h36M11 40v3m26-3v3" />
      <rect x="12" y="21" width="11" height="6" rx="2" />
      <rect x="25" y="21" width="11" height="6" rx="2" />
    </>
  } else if (label.includes('family')) {
    icon = <>
      <path d="M6 16 24 5l18 11M9 14v28h30V14" />
      <circle cx="16" cy="22" r="4" /><circle cx="32" cy="22" r="4" /><circle cx="24" cy="27" r="3" />
      <path d="M10 38c.4-6.2 2.4-9 6-9 2.7 0 4.5 1.6 5.3 4.8M38 38c-.4-6.2-2.4-9-6-9-2.7 0-4.5 1.6-5.3 4.8M19 39c.3-5 2-7.5 5-7.5s4.7 2.5 5 7.5" />
    </>
  } else if (label.includes('pool') || label.includes('plunge')) {
    icon = <>
      <path d="M13 7v27m11-27v27M13 15h11M13 23h11" />
      <path d="M4 34c3.3 0 3.3 3 6.6 3s3.3-3 6.6-3 3.3 3 6.6 3 3.3-3 6.6-3 3.3 3 6.6 3 3.3-3 6.6-3M4 42c3.3 0 3.3 3 6.6 3s3.3-3 6.6-3 3.3 3 6.6 3 3.3-3 6.6-3 3.3 3 6.6 3 3.3-3 6.6-3" />
    </>
  } else if (label.includes('airstrip') || label.includes('minute')) {
    icon = <>
      <circle cx="24" cy="24" r="18" />
      <path d="M24 12v12l8 5M24 6v3M42 24h-3M24 42v-3M6 24h3" />
    </>
  } else if (label.includes('walk')) {
    icon = <>
      <circle cx="23" cy="8" r="3.5" />
      <path d="m22 13-7 9 7 5-5 12M22 14l7 8 7 2M22 27l9 5 4 8M15 22l-6 5M38 18l2 25M5 43h38" />
      <path d="M31 10c5-4 9-2 10 2-4 2-7 2-10-2Z" />
    </>
  } else if (label.includes('sundowner')) {
    icon = <>
      <path d="M4 34h40M8 41h32M10 34a10 10 0 0 1 20 0" />
      <path d="M20 8v6M7 14l4 4M33 14l-4 4M3 27h6m22 0h5" />
      <path d="M32 21h11l-5.5 7v9M33 41h9M37.5 28l-3-4" />
      <circle cx="34" cy="22" r="2.5" />
    </>
  } else if (label.includes('night') || label.includes('drive')) {
    icon = <>
      <path d="M33 4a8 8 0 1 0 9 11 9 9 0 0 1-9-11Z" />
      <path d="M14 22h20l4 10H10l4-10ZM18 22v-5h12v5" />
      <path d="M8 32h32v6H8z" />
      <circle cx="15" cy="38" r="3" /><circle cx="33" cy="38" r="3" />
    </>
  } else if (label.includes('bush') || label.includes('activit')) {
    icon = <>
      <circle cx="13" cy="32" r="8" /><circle cx="35" cy="32" r="8" />
      <path d="m5 29 5-17h7l5 17M26 29l5-17h7l5 17M20 24h8M13 12V8m22 4V8" />
    </>
  } else {
    icon = <>
      <path d="M24 42V24M24 32C12 32 7 24 7 13c10 0 17 6 17 19ZM24 28c0-10 6-17 17-18 0 11-5 18-17 18Z" />
    </>
  }

  return <span className={styles.amenityIcon} data-icon={index + 1}><svg viewBox="0 0 48 48" aria-hidden="true">{icon}</svg></span>
}

export function CampAmenitiesCarousel({facilities}: {facilities: string[]}) {
  const carousel = useCarousel(facilities.length)
  const [visibleCount, setVisibleCount] = useState(4)

  useEffect(() => {
    const track = carousel.track.current
    if (!track) return

    const updateVisibleCount = () => {
      const firstSlide = track.firstElementChild as HTMLElement | null
      if (!firstSlide) return
      const slideWidth = firstSlide.getBoundingClientRect().width
      if (slideWidth) setVisibleCount(Math.max(1, Math.min(facilities.length, Math.round(track.clientWidth / slideWidth))))
    }

    updateVisibleCount()
    const observer = new ResizeObserver(updateVisibleCount)
    observer.observe(track)
    return () => observer.disconnect()
  }, [carousel.track, facilities.length])

  if (!facilities.length) return null

  const maxStart = Math.max(0, facilities.length - visibleCount)
  const pageStarts = Array.from(
    {length: Math.ceil(facilities.length / visibleCount)},
    (_, index) => Math.min(index * visibleCount, maxStart),
  )
  const activePage = pageStarts.reduce((nearest, start, index) =>
    Math.abs(start - carousel.active) < Math.abs(pageStarts[nearest] - carousel.active) ? index : nearest, 0)
  const goToPage = (index: number) => carousel.goTo(pageStarts[index])
  const movePage = (direction: -1 | 1) => goToPage((activePage + direction + pageStarts.length) % pageStarts.length)

  return <div className={styles.amenitiesShell}>
    <div
      className={styles.amenitiesTrack}
      ref={carousel.track}
      onScroll={carousel.onScroll}
      role="region"
      aria-label={`Camp amenities, ${facilities.length} items`}
      tabIndex={0}
    >
      {facilities.map((facility, index) => <div className={styles.amenitySlide} key={facility}>
        <AmenityIcon facility={facility} index={index} />
        <strong>{facility}</strong>
      </div>)}
    </div>
    {pageStarts.length > 1 ? <CarouselControls active={activePage} count={pageStarts.length} label="amenities" unit="group" move={movePage} goTo={goToPage} /> : null}
  </div>
}
