'use client'

import Image from 'next/image'
import {useCallback, useEffect, useRef, useState} from 'react'
import type {PageMedia} from '../../sanity/page-types'

function videoEmbed(href?: string) {
  if (!href) return null
  try {
    const url = new URL(href)
    if (url.hostname === 'youtu.be') return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(url.pathname.slice(1))}`
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      const id = url.searchParams.get('v') || (url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : '')
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
    if (['vimeo.com', 'www.vimeo.com'].includes(url.hostname)) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {return null}
  return null
}

export function SafariGallery({items}: {items?: PageMedia[]}) {
  const media = (items || []).filter((item) => item.kind === 'photo' ? Boolean(item.image?.asset?.url) : Boolean(videoEmbed(item.videoUrl)))
  const [active, setActive] = useState<number | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [canPrevious, setCanPrevious] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const carousel = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const updateCarousel = useCallback(() => {
    const viewport = carousel.current
    if (!viewport) return
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('.safari-gallery-item'))
    if (!slides.length) return

    const nearest = slides.reduce((best, slide, index) =>
      Math.abs(slide.offsetLeft - viewport.scrollLeft) < Math.abs(slides[best].offsetLeft - viewport.scrollLeft)
        ? index
        : best, 0)
    const maximumScroll = viewport.scrollWidth - viewport.clientWidth

    setCarouselIndex(nearest)
    setCanPrevious(viewport.scrollLeft > 2)
    setCanNext(viewport.scrollLeft < maximumScroll - 2)
  }, [])

  const moveCarousel = (direction: -1 | 1) => {
    const viewport = carousel.current
    if (!viewport) return
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>('.safari-gallery-item'))
    const target = slides[Math.max(0, Math.min(carouselIndex + direction, slides.length - 1))]
    if (!target) return

    viewport.scrollTo({
      left: target.offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  useEffect(() => {
    const viewport = carousel.current
    if (!viewport) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateCarousel)
    }
    const observer = new ResizeObserver(updateCarousel)
    viewport.addEventListener('scroll', onScroll, {passive: true})
    observer.observe(viewport)
    updateCarousel()
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [media.length, updateCarousel])

  useEffect(() => {
    if (active === null) dialog.current?.close()
    else if (!dialog.current?.open) dialog.current?.showModal()
  }, [active])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (active === null) return
      if (event.key === 'ArrowRight') setActive((active + 1) % media.length)
      if (event.key === 'ArrowLeft') setActive((active + media.length - 1) % media.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, media.length])
  if (!media.length) return null
  const selected = active === null ? null : media[active]
  return <>
    <div className="safari-gallery-shell">
      <div
        className="safari-gallery"
        ref={carousel}
        role="region"
        aria-label="Safari image gallery"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {event.preventDefault(); moveCarousel(-1)}
          if (event.key === 'ArrowRight') {event.preventDefault(); moveCarousel(1)}
        }}
      >
        {media.map((item, index) => <button className="safari-gallery-item" key={item._key} type="button" onClick={() => setActive(index)} aria-label={`Open ${item.kind === 'video' ? 'video' : 'photo'} ${index + 1}${item.caption ? `: ${item.caption}` : ''}`}>
          <span className="safari-gallery-media">
            {item.image?.asset?.url ? <Image src={item.image.asset.url} alt={item.image.alt || ''} fill sizes="(max-width: 650px) calc(100vw - 2rem), (max-width: 980px) 50vw, 33vw" quality={78} /> : <span className="safari-video-placeholder">Play video</span>}
            {item.kind === 'video' ? <span className="safari-play" aria-hidden="true">▶</span> : null}
          </span>
          {item.caption ? <span className="safari-gallery-caption">{item.caption}</span> : null}
        </button>)}
      </div>
      {media.length > 1 ? <div className="safari-gallery-controls">
        <button type="button" onClick={() => moveCarousel(-1)} disabled={!canPrevious} aria-label="Previous gallery image">←</button>
        <span aria-live="polite">{carouselIndex + 1} / {media.length}</span>
        <button type="button" onClick={() => moveCarousel(1)} disabled={!canNext} aria-label="Next gallery image">→</button>
      </div> : null}
    </div>
    <dialog className="safari-lightbox" ref={dialog} onClose={() => setActive(null)} onClick={(event) => {if (event.target === dialog.current) setActive(null)}} aria-label="Media gallery">
      {selected ? <><button className="safari-lightbox-close" type="button" onClick={() => setActive(null)} aria-label="Close gallery">×</button>
        <div className="safari-lightbox-media">{selected.kind === 'video' ? <iframe src={videoEmbed(selected.videoUrl) || undefined} title={selected.caption || 'Safari video'} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : selected.image?.asset?.url ? <Image src={selected.image.asset.url} alt={selected.image.alt || ''} width={selected.image.asset.metadata?.dimensions?.width || 1600} height={selected.image.asset.metadata?.dimensions?.height || 1000} sizes="95vw" /> : null}</div>
        <div className="safari-lightbox-controls"><button type="button" onClick={() => setActive((active! + media.length - 1) % media.length)} aria-label="Previous item">←</button><span>{active! + 1} / {media.length}{selected.caption ? ` · ${selected.caption}` : ''}</span><button type="button" onClick={() => setActive((active! + 1) % media.length)} aria-label="Next item">→</button></div>
      </> : null}
    </dialog>
  </>
}
