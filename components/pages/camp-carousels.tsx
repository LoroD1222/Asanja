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

function CarouselControls({active, count, label, move, goTo}: {
  active: number
  count: number
  label: string
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
        aria-label={`Show ${label} slide ${index + 1} of ${count}`}
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

  return <div className={styles.galleryShell}>
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
          sizes="(max-width: 600px) 88vw, (max-width: 900px) 68vw, 34vw"
          quality={75}
        />
        {item.caption ? <figcaption>{item.caption}</figcaption> : null}
        <span className={styles.slideNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      </figure>)}
    </div>
    <CarouselControls active={carousel.active} count={photos.length} label="gallery" move={carousel.move} goTo={carousel.goTo} />
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
      quality={75}
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
      <path d="M10 40V11m28 29V11M8 11h32M14 11v9m20-9v9" />
      <path d="M13 34v-9h22v9M13 29h22M17 25v-4h14v4M7 40h34" />
    </>
  } else if (label.includes('family')) {
    icon = <>
      <circle cx="24" cy="15" r="5" /><circle cx="12.5" cy="20" r="3.5" /><circle cx="35.5" cy="20" r="3.5" />
      <path d="M15 38c.5-8 3.5-12 9-12s8.5 4 9 12M5.5 38c.4-6 2.8-9 7-9 2 0 3.8.8 5 2.2M42.5 38c-.4-6-2.8-9-7-9-2 0-3.8.8-5 2.2" />
    </>
  } else if (label.includes('pool') || label.includes('plunge')) {
    icon = <>
      <path d="M13 9v23m10-23v23M13 17h10M13 24h10" />
      <path d="M5 34c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3 3 3 6 3 3-3 8-3M5 41c3 0 3 3 6 3s3-3 6-3 3 3 6 3 3-3 6-3 3 3 6 3 3-3 8-3" />
    </>
  } else if (label.includes('airstrip') || label.includes('minute')) {
    icon = <>
      <circle cx="24" cy="24" r="19" /><path d="M24 13v11l7 5" />
      <path d="M8 9l5 1m-4 4 4-.2" />
      <path d="M35 12l-7 2-5-5-2 1 2 6-7 3-4-2-1 1 4 5 8-1 6 8 2-1-2-9 8-4c2-1 3-2 2-3-.6-1.2-2-1.5-4-1Z" />
    </>
  } else if (label.includes('walk')) {
    icon = <>
      <path d="M19 7c4 5 4 10 1 15l-4 6c-1.8 2.8-5.7 1.2-5.2-2l1.1-7.2C12.6 13.8 14.8 9.8 19 7Z" />
      <path d="M31 21c4 4 5.2 8.5 3.7 13.5l-1.8 5.8c-.9 3-5.1 2.8-5.8-.1l-1.5-6.6C24.5 28.7 26.2 24.2 31 21Z" />
      <circle cx="11" cy="11" r="2" /><circle cx="14" cy="7" r="1.7" /><circle cx="18" cy="5" r="1.5" />
      <circle cx="28" cy="14" r="1.8" /><circle cx="33" cy="13" r="1.6" /><circle cx="37" cy="15" r="1.4" />
    </>
  } else if (label.includes('sundowner')) {
    icon = <>
      <path d="M5 34h38M9 40h30M17 34a7 7 0 0 1 14 0" />
      <path d="M24 8v5M11.5 13.5l3.5 3.5M36.5 13.5 33 17M7 25h5m24 0h5" />
      <path d="M19 23h10l-2 9h-6l-2-9Zm5-7v7" />
    </>
  } else if (label.includes('night') || label.includes('drive')) {
    icon = <>
      <path d="M34 13a7 7 0 0 1-8.5-8.5A8 8 0 1 0 34 13Z" />
      <path d="M39 5v5m-2.5-2.5h5M13 9v4m-2-2h4" />
      <path d="M7 35v-8l5-8h18l7 8v8M10 27h25M15 19v-4h12v4M17 27l2-5h7l4 5M12 35h20" />
      <circle cx="12" cy="35" r="3" /><circle cx="32" cy="35" r="3" />
      <path d="M7 31H4m36 0h-3" />
    </>
  } else {
    icon = <>
      <circle cx="15" cy="30" r="7" /><circle cx="33" cy="30" r="7" /><path d="M22 30h4M8 30l4-15h6l6 15M40 30l-4-15h-6l-6 15" />
      <path d="M24 15v-7m0 0-3 4m3-4 3 4" />
    </>
  }

  return <span className={styles.amenityIcon} data-icon={index + 1}><svg viewBox="0 0 48 48" aria-hidden="true">{icon}</svg></span>
}

export function CampAmenitiesCarousel({facilities}: {facilities: string[]}) {
  const carousel = useCarousel(facilities.length)
  if (!facilities.length) return null

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
    <CarouselControls active={carousel.active} count={facilities.length} label="amenities" move={carousel.move} goTo={carousel.goTo} />
  </div>
}
