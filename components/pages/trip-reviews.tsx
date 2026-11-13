'use client'

import {useState} from 'react'
import Image from 'next/image'
import type {Review} from '../../sanity/page-types'
import type {SanityImage} from '../../sanity/types'
import {safeExternalHref} from '../../sanity/page-routes'
import {PageImage} from './page-image'

export function TripReviews({items, fallbackImage, preview = false, id}: {items?: Review[]; fallbackImage?: SanityImage; preview?: boolean; id: string}) {
  const visible = (items || []).filter((item) => item.name && item.quote)
  const [activeIndex, setActiveIndex] = useState(0)
  if (!visible.length) return null
  const current = visible[Math.min(activeIndex, visible.length - 1)]
  const photo = current.settingImage?.asset?.url ? current.settingImage : fallbackImage
  const source = visible.find((item) => item.source?.toLowerCase().includes('tripadvisor') && safeExternalHref(item.sourceUrl))
  const reviewLink = source ? safeExternalHref(source.sourceUrl) : preview ? 'https://www.tripadvisor.com/Search?geo=6&q=asanja&ssrc=h' : null
  const rated = visible.filter((item) => typeof item.rating === 'number')
  const averageRating = rated.length ? rated.reduce((sum, item) => sum + item.rating!, 0) / rated.length : null
  const showFiveStars = preview || (averageRating !== null && averageRating >= 4.5)
  const ratingCaption = preview ? 'Rated excellent by guests on TripAdvisor' : source ? 'Guest stories shared on TripAdvisor' : 'Stories from Asanja travellers'
  const move = (direction: number) => setActiveIndex((index) => (index + direction + visible.length) % visible.length)

  return <section className="trip-stories" id={id} aria-label="Guest stories">
    <div className="trip-stories-inner">
      <div className="trip-stories-title"><span aria-hidden="true" /><h2>Guest stories</h2><span aria-hidden="true" /></div>
      <div className="trip-stories-rating">{showFiveStars ? <Image className="trip-stories-stars" src="/figma-trip-review/green-stars.svg" width={142} height={22} alt="" /> : averageRating !== null ? <span className="trip-stories-average">{averageRating.toFixed(1)} / 5</span> : null}<p>{ratingCaption}</p></div>
      <div className="trip-story-card" key={current._key}>
        <div className="trip-story-photo">
          {photo?.asset?.url ? <picture>{preview && activeIndex === 0 ? <source media="(max-width: 700px)" srcSet="/figma-trip-review/mobile-camp.jpg" /> : null}<PageImage image={photo} sizes="(max-width: 700px) 100vw, 50vw" /></picture> : <div className="trip-story-photo-placeholder" />}
          {current.locationLabel ? <span className="trip-story-location"><Image src="/figma-trip-review/green-location.svg" width={13} height={18} alt="" />{current.locationLabel}</span> : null}
        </div>
        <div className="trip-story-content">
          <div className="trip-story-quote"><span aria-hidden="true">“</span><blockquote><p className={current.mobileQuote ? 'trip-story-desktop-quote' : undefined}>{current.quote}</p>{current.mobileQuote ? <p className="trip-story-mobile-quote">{current.mobileQuote}</p> : null}</blockquote></div>
          <div className="trip-story-attribution">
            {current.image?.asset?.url ? <PageImage image={current.image} sizes="52px" /> : <span className="trip-story-initials" aria-hidden="true">{current.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>}
            <div><strong>{current.name}</strong>{current.guestDescription || current.country ? <small>{current.guestDescription || current.country}</small> : null}</div>
          </div>
          <div className="trip-story-navigation">
            <div className="trip-story-thumbnails" aria-label="Choose a guest story">{visible.map((item, index) => {const thumbnail = item.settingImage?.asset?.url ? item.settingImage : fallbackImage; return <button type="button" key={item._key} className={index === activeIndex ? 'is-active' : ''} aria-label={`Show review from ${item.name}`} aria-current={index === activeIndex ? 'true' : undefined} onClick={() => setActiveIndex(index)}>{thumbnail?.asset?.url ? <PageImage image={thumbnail} sizes="66px" /> : <span />}</button>})}</div>
            <div className="trip-story-arrows"><button type="button" aria-label="Previous review" onClick={() => move(-1)}><Image src="/figma-trip-review/green-previous.svg" width={40} height={40} alt="" /></button><button type="button" aria-label="Next review" onClick={() => move(1)}><Image src="/figma-trip-review/green-next.svg" width={40} height={40} alt="" /></button></div>
          </div>
        </div>
      </div>
      {reviewLink ? <a className="trip-stories-link" href={reviewLink} target="_blank" rel="noopener noreferrer">Read more reviews on TripAdvisor<Image src="/figma-trip-review/green-tripadvisor.svg" width={110} height={17} alt="TripAdvisor" /></a> : null}
      {preview ? <p className="trip-stories-preview-note">Design preview: replace the example stories with approved guest reviews in Sanity.</p> : null}
    </div>
  </section>
}
