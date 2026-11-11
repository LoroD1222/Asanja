'use client'

import {useState, type FormEvent} from 'react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setMessage('')
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({page: window.location.pathname, form: 'form_newsletter', fields: {email}}),
      })
      const result = await response.json() as {message?: string; redirect?: string}
      if (!response.ok) {
        setMessage(result.message || 'Please try again later.')
      } else if (result.redirect) {
        window.location.assign(result.redirect)
      } else {
        setMessage(result.message || 'Thank you for joining us.')
        setEmail('')
      }
    } catch {
      setMessage('Please try again later.')
    } finally {
      setPending(false)
    }
  }

  return <div className="asanja-newsletter"><h2>Join the<br/>Asanja family</h2><form onSubmit={submit}><label className="asanja-visually-hidden" htmlFor="asanja-newsletter-email">Email address</label><input id="asanja-newsletter-email" type="email" autoComplete="email" placeholder="Email..." value={email} onChange={(event) => setEmail(event.target.value)} required /><button type="submit" disabled={pending}>{pending ? 'Sending...' : 'Send'}</button></form>{message ? <p role="status">{message}</p> : null}</div>
}
