'use client'

import Image from 'next/image'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
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

function AmenityIcon({index}: {index: number}) {
  const icons = [
    <><path d="M5 18v-7h14v7M7 11V8h10v3M4 18h16" /></>,
    <><circle cx="9" cy="8" r="2.5"/><circle cx="16" cy="9" r="2"/><path d="M4 19c.3-4 2-6 5-6s4.7 2 5 6M14 14c3 0 5 1.8 5 5"/></>,
    <><path d="M7 4v11M12 4v11M7 8h5M4 16c1.5 0 1.5 1.5 3 1.5S8.5 16 10 16s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5"/></>,
    <><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></>,
    <><path d="M9 4c1 3 1 5-1 7l-3 3c-1 1-.5 3 1 3h4l3-4M15 5c-.5 3 0 5 2 7l2 2c1 1 .5 3-1 3h-3"/></>,
    <><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></>,
    <><path d="M19 15a7 7 0 0 1-10-10 8 8 0 1 0 10 10Z"/><path d="M17 4v3M15.5 5.5h3"/></>,
    <><circle cx="8" cy="13" r="4"/><circle cx="16" cy="13" r="4"/><path d="M12 13h0M4 13l2-7h3l3 7M20 13l-2-7h-3l-3 7"/></>,
  ]
  return <svg viewBox="0 0 24 24" aria-hidden="true">{icons[index % icons.length]}</svg>
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
        <AmenityIcon index={index} />
        <strong>{facility}</strong>
      </div>)}
    </div>
    <CarouselControls active={carousel.active} count={facilities.length} label="amenities" move={carousel.move} goTo={carousel.goTo} />
  </div>
}
