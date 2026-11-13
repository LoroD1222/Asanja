'use client'

import {useState, type FormEvent, type ReactNode} from 'react'
import type {OptionalExperience, PageCard, TripPricingOption} from '../../sanity/page-types'
import {whatsappHref} from '../../sanity/contact'
import {indicativePrice} from '../../sanity/price'

const previewCamps = ['Moru', 'Siri Bustani', 'Nyasirori', 'Ewasi Tarangire', 'Ndembo Ruaha', 'Under the Stars']
const occasions = ['Honeymoon', 'Family safari', 'The migration', 'Photography', 'Anniversary', 'Safari and Zanzibar']
const travelWindows = ['Not sure yet', 'Within 3 months', 'In 3 to 6 months', 'In 6 to 12 months', 'More than a year away']
const nightChoices = ['3 to 4', '5 to 7', '8 to 10', '11 to 14', '15 or more']

function toggle(value: string, values: string[], update: (next: string[]) => void) {
  update(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
}

export function QuoteForm({tripTitle, slug, durationDays, durationNights, currency = 'USD', options = [], experiences = [], camps = [], whatsappNumber, preview = false, intro, heading}: {tripTitle: string; slug: string; durationDays: number; durationNights?: number; currency?: string; options?: TripPricingOption[]; experiences?: OptionalExperience[]; camps?: PageCard[]; whatsappNumber?: string; preview?: boolean; intro?: ReactNode; heading?: string}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [travelWindow, setTravelWindow] = useState('Not sure yet')
  const [nights, setNights] = useState(typeof durationNights === 'number' ? String(durationNights) : durationDays > 1 ? String(durationDays - 1) : '5 to 7')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [selectedCamps, setSelectedCamps] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [optionIndex, setOptionIndex] = useState(0)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const option = options[optionIndex] || null
  const extras = experiences.filter((experience) => selectedExtras.includes(experience._key))
  const days = /^\d+$/.test(nights) ? Number(nights) + 1 : 0
  const amount = indicativePrice({date, adults, children, days, option, extras}, durationDays)
  const campChoices = preview ? previewCamps : camps.filter((camp) => camp?.title).map((camp) => camp.title)
  const whatsapp = whatsappHref(whatsappNumber, preview ? 'Hello Asanja Africa, I saw the safari template preview and would like help planning a trip.' : `Hello Asanja Africa, I would like a quote for ${tripTitle}. Travel: ${date || travelWindow}. Travellers: ${adults} adults and ${children} children. Nights: ${nights}. Camps: ${selectedCamps.join(', ') || 'please advise'}. Interests: ${selectedOccasions.join(', ') || 'please advise'}.`)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step === 1) {setStep(2); return}
    if (preview) return
    setSending(true); setStatus('')
    const form = new FormData(event.currentTarget)
    const fields = {
      name: String(form.get('name') || ''), email: String(form.get('email') || ''), phone: String(form.get('phone') || ''),
      travelDate: date, travelWindow, nights, adults: String(adults), children: String(children), days: days ? String(days) : 'Flexible',
      camps: selectedCamps.join(', ') || 'Please advise', occasions: selectedOccasions.join(', ') || 'Not specified',
      accommodation: option?.name || 'Custom / not selected', extras: extras.map((item) => item.name).join(', '),
      estimatedPrice: amount === null ? 'Quotation required' : `${currency} ${amount}`,
      message: String(form.get('message') || ''), website: String(form.get('website') || ''),
    }
    try {
      const response = await fetch('/api/forms/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({page: `/safaris/${slug}/`, form: 'Safari_trip_quote_form', fields})})
      const result: {ok?: boolean; message?: string; redirect?: string} = await response.json()
      setStatus(result.message || (response.ok ? 'Thank you. We received your request.' : 'We could not send the request. Please try again.'))
      if (response.ok && result.redirect) window.location.assign(result.redirect)
    } catch {setStatus('We could not send the request. Please try again or use WhatsApp.')}
    finally {setSending(false)}
  }

  return <div className="trip-plan" id="safari-quote">
    <div className="trip-plan-copy">
      <h2>{heading || 'Plan your trip'}</h2>
      <div className="trip-plan-intro">{intro || <p>Tell us a little about your safari. A planner who knows every Asanja camp will send you a tailored itinerary and price, with no obligation.</p>}</div>
      <ol className="trip-plan-steps">
        <li><span>1</span><div><strong>Tell us your plans</strong><small>Dates, who’s coming and what you’d love to see.</small></div></li>
        <li><span>2</span><div><strong>Get your itinerary within 24 hours</strong><small>Tailored to you, by email or WhatsApp.</small></div></li>
        <li><span>3</span><div><strong>Book and pack</strong><small>We’ll take care of everything from the airstrip onwards.</small></div></li>
      </ol>
      {whatsapp ? <a className="trip-plan-pill" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp us <span aria-hidden="true">↗</span></a> : null}
      <p className="trip-plan-agent">Booking through an agent? We work with travel agents worldwide.</p>
    </div>
    <form className="trip-plan-form" onSubmit={submit}>
      <div className="trip-plan-form-top"><h3>{step === 1 ? 'Your safari' : 'Your details'}</h3><span>Step {step} of 2</span></div>
      <div className="trip-plan-progress" aria-label={`Step ${step} of 2`}><span style={{width: step === 1 ? '50%' : '100%'}} /></div>
      {step === 1 ? <>
        <div className="trip-plan-fields">
          <label>When would you like to travel?<select value={travelWindow} onChange={(event) => setTravelWindow(event.target.value)}>{travelWindows.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
          <label>How many nights?<select value={nights} onChange={(event) => setNights(event.target.value)}>{!nightChoices.includes(nights) ? <option value={nights}>{nights} nights — this trip</option> : null}{nightChoices.map((choice) => <option key={choice}>{choice}</option>)}</select></label>
          <label>Adults<select value={adults} onChange={(event) => setAdults(Number(event.target.value))}>{Array.from({length: 12}, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Children under 12<select value={children} onChange={(event) => setChildren(Number(event.target.value))}>{Array.from({length: 11}, (_, index) => index).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        </div>
        {campChoices.length ? <fieldset className="trip-plan-choice"><legend>Which camps interest you?</legend><div>{campChoices.map((camp) => <button type="button" key={camp} aria-pressed={selectedCamps.includes(camp)} onClick={() => toggle(camp, selectedCamps, setSelectedCamps)}>{camp}</button>)}</div></fieldset> : null}
        <fieldset className="trip-plan-choice"><legend>What’s the occasion?</legend><div>{occasions.map((occasion) => <button type="button" key={occasion} aria-pressed={selectedOccasions.includes(occasion)} onClick={() => toggle(occasion, selectedOccasions, setSelectedOccasions)}>{occasion}</button>)}</div></fieldset>
        <div className="trip-plan-actions"><button className="trip-plan-pill" type="submit">Continue <span aria-hidden="true">↗</span></button></div>
      </> : <>
        <p className="trip-plan-step-note">A few details and we can shape the right journey for you.</p>
        <div className="trip-plan-fields">
          <label>Your name<input name="name" required={!preview} maxLength={120} autoComplete="name" placeholder="Your name" /></label>
          <label>Email address<input name="email" type="email" required={!preview} maxLength={254} autoComplete="email" placeholder="you@example.com" /></label>
          <label>Phone or WhatsApp<input name="phone" type="tel" maxLength={50} autoComplete="tel" placeholder="Include country code" /></label>
          <label>Exact date, if known<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
          {options.length ? <label>Package preference<select value={optionIndex} onChange={(event) => setOptionIndex(Number(event.target.value))}>{options.map((item, index) => <option value={index} key={item._key}>{item.name}</option>)}</select></label> : null}
          <label className="trip-plan-message">Anything else we should know?<textarea name="message" rows={3} maxLength={5000} placeholder="Tell us what matters most to you" /></label>
        </div>
        {experiences.length ? <fieldset className="trip-plan-choice"><legend>Optional experiences</legend><div>{experiences.map((experience) => <button type="button" key={experience._key} aria-pressed={selectedExtras.includes(experience._key)} onClick={() => toggle(experience._key, selectedExtras, setSelectedExtras)}>{experience.name}</button>)}</div></fieldset> : null}
        {option ? <p className="trip-plan-estimate" aria-live="polite">{amount === null ? 'We’ll prepare a tailored price for your dates.' : `Indicative total: ${new Intl.NumberFormat('en-US', {style: 'currency', currency, maximumFractionDigits: 0}).format(amount)}. Final rate confirmed by Asanja Africa.`}</p> : null}
        {preview ? <p className="trip-plan-step-note">This is a layout preview; use the live booking page to send an enquiry.</p> : null}
        <div className="trip-plan-actions trip-plan-actions-final"><button type="button" className="trip-plan-back" onClick={() => setStep(1)}>← Back</button>{preview ? <a className="trip-plan-pill" href="/make-a-booking/">Open live booking <span aria-hidden="true">↗</span></a> : <button className="trip-plan-pill" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send my plans'} <span aria-hidden="true">↗</span></button>}</div>
      </>}
      <input name="website" tabIndex={-1} autoComplete="off" className="safari-honeypot" aria-hidden="true" />
      {status ? <p className="safari-form-status" role="status">{status}</p> : null}
    </form>
  </div>
}
