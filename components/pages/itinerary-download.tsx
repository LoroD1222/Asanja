'use client'

import {useEffect, useState, type FormEvent} from 'react'

type AccessState = 'checking' | 'locked' | 'ready'

export function ItineraryDownload({href, page, tripTitle}: {href: string; page: string; tripTitle: string}) {
  const [access, setAccess] = useState<AccessState>('checking')
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/itinerary-access/', {cache: 'no-store', signal: controller.signal})
      .then((response) => response.ok ? response.json() : {authorized: false})
      .then((result: {authorized?: boolean}) => setAccess(result.authorized ? 'ready' : 'locked'))
      .catch(() => {if (!controller.signal.aborted) setAccess('locked')})
    return () => controller.abort()
  }, [])

  async function requestAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true)
    setMessage('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/forms/', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({page, form: 'Safari_itinerary_pdf', fields: {
          name: String(form.get('name') || '').trim(),
          email: String(form.get('email') || '').trim(),
          phone: String(form.get('phone') || '').trim(),
          tripTitle, website: String(form.get('website') || ''),
        }}),
      })
      const result: {ok?: boolean; message?: string} = await response.json()
      if (!response.ok || !result.ok) {
        setMessage(result.message || 'We could not unlock the PDF. Please try again.')
        return
      }
      setAccess('ready')
      setOpen(false)
      setMessage('Your PDF is ready. Use the download button below; this browser will remember your access for 90 days.')
    } catch {
      setMessage('We could not connect. Please try again in a moment.')
    } finally {setSending(false)}
  }

  return <div className="safari-pdf-download">
    {access === 'ready'
      ? <a className="safari-pdf-download-trigger" href={href} download>Download illustrated itinerary <span aria-hidden="true">↓</span></a>
      : <button className="safari-pdf-download-trigger" type="button" disabled={access === 'checking'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{access === 'checking' ? 'Checking download access…' : 'Get the illustrated itinerary'} <span aria-hidden="true">↓</span></button>}
    {access === 'locked' && open ? <form className="safari-pdf-download-form" onSubmit={requestAccess}>
      <h3>Your safari, in your hands</h3>
      <p>Share your details once to download the photo itinerary and route map. We’ll send your request to the Asanja team; this is not a newsletter signup.</p>
      <div className="safari-pdf-download-fields">
        <label>Your name<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
        <label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        <label>Phone or WhatsApp <span>(optional)</span><input name="phone" type="tel" maxLength={50} autoComplete="tel" /></label>
      </div>
      <input className="safari-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="safari-pdf-download-bottom"><small>Your details are used for this enquiry. See our <a href="/privacy-policy/">privacy policy</a>.</small><button type="submit" disabled={sending}>{sending ? 'Preparing…' : 'Unlock PDF'} <span aria-hidden="true">↗</span></button></div>
    </form> : null}
    {message ? <p className="safari-pdf-download-status" role="status">{message}</p> : null}
  </div>
}
