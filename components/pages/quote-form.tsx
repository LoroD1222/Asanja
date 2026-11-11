'use client'

import {useState, type FormEvent} from 'react'
import type {OptionalExperience, TripPricingOption} from '../../sanity/page-types'
import {whatsappHref} from '../../sanity/contact'
import {indicativePrice} from '../../sanity/price'

export function QuoteForm({tripTitle, slug, durationDays, currency = 'USD', options = [], experiences = [], whatsappNumber, preview = false}: {tripTitle: string; slug: string; durationDays: number; currency?: string; options?: TripPricingOption[]; experiences?: OptionalExperience[]; whatsappNumber?: string; preview?: boolean}) {
  const [date, setDate] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [days, setDays] = useState(durationDays)
  const [optionIndex, setOptionIndex] = useState(0)
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const option = options[optionIndex] || null
  const extras = experiences.filter((experience) => selectedExtras.includes(experience._key))
  const amount = indicativePrice({date, adults, children, days, option, extras}, durationDays)
  const whatsapp = preview ? null : whatsappHref(whatsappNumber, `Hello Asanja Africa, I would like a quote for ${tripTitle}. Travel date: ${date || 'to be confirmed'}. Travellers: ${adults} adults and ${children} children. Duration: ${days} days. Accommodation: ${option?.name || 'please advise'}. Additional experiences: ${extras.map((item) => item.name).join(', ') || 'none selected'}.`)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (preview) return
    setSending(true); setStatus('')
    const form = new FormData(event.currentTarget)
    const fields = {
      name: String(form.get('name') || ''), email: String(form.get('email') || ''),
      travelDate: date, adults: String(adults), children: String(children), days: String(days),
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

  return <form id="safari-quote" className="safari-quote" onSubmit={submit}>
    <div><p className="safari-kicker">Tailor your journey</p><h3>{preview ? 'Quote form preview' : 'Request your safari quote'}</h3><p>{preview ? 'This sample trip is not published, so the form will not send an inquiry. You can use the live booking page to contact Asanja Africa.' : 'Tell us how you want to travel. When all selected prices are available, the estimate below is indicative; our team confirms the final quotation.'}</p></div>
    <div className="safari-quote-grid">
      <label>Travel date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <label>Adults<input type="number" min="1" max="30" value={adults} onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))} /></label>
      <label>Children<input type="number" min="0" max="20" value={children} onChange={(event) => setChildren(Math.max(0, Number(event.target.value) || 0))} /></label>
      <label>Safari days<input type="number" min="1" max="60" value={days} onChange={(event) => setDays(Math.max(1, Number(event.target.value) || 1))} /></label>
      {options.length ? <label>Accommodation preference<select value={optionIndex} onChange={(event) => setOptionIndex(Number(event.target.value))}>{options.map((item, index) => <option value={index} key={item._key}>{item.name}</option>)}</select></label> : null}
      <label>Your name<input name="name" required maxLength={120} autoComplete="name" /></label>
      <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label className="safari-quote-message">Anything else we should know?<textarea name="message" rows={3} maxLength={5000} /></label>
    </div>
    {experiences.length ? <fieldset><legend>Optional experiences</legend>{experiences.map((experience) => <label key={experience._key}><input type="checkbox" checked={selectedExtras.includes(experience._key)} onChange={(event) => setSelectedExtras(event.target.checked ? [...selectedExtras, experience._key] : selectedExtras.filter((key) => key !== experience._key))} /> {experience.name}{typeof experience.pricePerPerson === 'number' ? ` · ${currency} ${experience.pricePerPerson} per person` : ' · quote required'}</label>)}</fieldset> : null}
    <input name="website" tabIndex={-1} autoComplete="off" className="safari-honeypot" aria-hidden="true" />
    <div className="safari-quote-footer"><div aria-live="polite"><span>Indicative total</span><strong>{amount === null ? 'Custom quote' : new Intl.NumberFormat('en-US', {style: 'currency', currency, maximumFractionDigits: 0}).format(amount)}</strong><small>{amount === null ? 'We will calculate a tailored price.' : 'Final price confirmed by Asanja Africa.'}</small></div>{preview ? <a href="/make-a-booking/">Open live booking page ↗</a> : <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Request my quote ↗'}</button>}{whatsapp ? <a href={whatsapp} target="_blank" rel="noopener noreferrer">Ask on WhatsApp ↗</a> : null}</div>
    {status ? <p className="safari-form-status" role="status">{status}</p> : null}
  </form>
}
