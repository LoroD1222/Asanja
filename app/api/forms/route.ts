type Submission = {
  page: string;
  form: string;
  fields: Record<string, string>;
};

const attempts = new Map<string, number[]>();
const windowMs = 10 * 60 * 1000;
const maxAttempts = 5;

function isSubmission(value: unknown): value is Submission {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<Submission>;
  return typeof payload.page === 'string'
    && typeof payload.form === 'string'
    && Boolean(payload.fields)
    && typeof payload.fields === 'object'
    && !Array.isArray(payload.fields)
    && Object.values(payload.fields).every((field) => typeof field === 'string' && field.length <= 5000);
}

function submissionType(form: string) {
  if (form === 'Booking_request_form') return 'booking';
  if (form === 'Plan_your_trip_form') return 'trip-planning';
  if (form === 'form_newsletter') return 'newsletter';
  return 'enquiry';
}

function successRedirect(type: string) {
  if (type === 'trip-planning') return '/contact/thank-you/?plan-my-stay';
  if (type === 'booking' || type === 'newsletter') return '/contact/thank-you/';
  return null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function fieldLabel(value: string) {
  return value
    .replace(/^form_fields\[|\]$/g, '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formTitle(type: string) {
  if (type === 'trip-planning') return 'New safari planning request';
  if (type === 'booking') return 'New booking request';
  if (type === 'newsletter') return 'New newsletter signup';
  return 'New website enquiry';
}

async function deliverWithResend(payload: Submission, type: string, email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FORM_FROM_EMAIL;
  const to = (process.env.FORM_TO_EMAIL || '').split(',').map((value) => value.trim()).filter(Boolean);
  if (!apiKey || !from || !to.length) return null;

  const visibleFields = Object.entries(payload.fields).filter(([key]) => key !== 'website');
  const subject = formTitle(type);
  const text = [
    subject,
    `Page: ${payload.page}`,
    '',
    ...visibleFields.map(([key, value]) => `${fieldLabel(key)}: ${value}`),
  ].join('\n');
  const rows = visibleFields.map(([key, value]) => (
    `<tr><th align="left" style="padding:8px 14px 8px 0;vertical-align:top">${escapeHtml(fieldLabel(key))}</th>`
    + `<td style="padding:8px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`
  )).join('');

  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      reply_to: email,
      text,
      html: `<h1>${escapeHtml(subject)}</h1><p><strong>Page:</strong> ${escapeHtml(payload.page)}</p><table>${rows}</table>`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
}

async function deliverWithWebhook(payload: Submission, type: string) {
  const webhook = process.env.FORM_WEBHOOK_URL;
  if (!webhook) return null;
  return fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.FORM_WEBHOOK_SECRET ? { Authorization: `Bearer ${process.env.FORM_WEBHOOK_SECRET}` } : {}),
    },
    body: JSON.stringify({ ...payload, type, submittedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(10_000),
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 50_000) {
    return Response.json({ ok: false, message: 'Submission is too large.' }, { status: 413 });
  }

  const payload = await request.json().catch(() => null);
  if (!isSubmission(payload)) {
    return Response.json({ ok: false, message: 'Invalid form submission.' }, { status: 400 });
  }

  if (payload.fields.website) {
    return Response.json({ ok: true, message: 'Thank you. Your request has been received.' });
  }

  const email = Object.entries(payload.fields).find(([key]) => /email/i.test(key))?.[1]?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, message: 'Please enter a valid email address.' }, { status: 400 });
  }

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const client = forwarded || 'local';
  const now = Date.now();
  const recent = (attempts.get(client) || []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= maxAttempts) {
    return Response.json({ ok: false, message: 'Please wait before sending another request.' }, { status: 429 });
  }
  attempts.set(client, [...recent, now]);

  const type = submissionType(payload.form);
  let response: Response | null;
  try {
    response = await deliverWithResend(payload, type, email) ?? await deliverWithWebhook(payload, type);
  } catch {
    return Response.json({ ok: false, message: 'Submission delivery failed.' }, { status: 502 });
  }

  if (!response) {
    return Response.json(
      {
        ok: false,
        message: 'The form is ready, but email delivery must be configured before submissions can be delivered.',
      },
      { status: 503 },
    );
  }

  if (!response.ok) {
    return Response.json({ ok: false, message: 'Submission delivery failed.' }, { status: 502 });
  }

  return Response.json({
    ok: true,
    message: 'Thank you. Your request has been received.',
    redirect: successRedirect(type),
  });
}
