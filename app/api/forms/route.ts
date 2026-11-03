export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return Response.json({ ok: false, message: 'Invalid form submission.' }, { status: 400 });
  }

  const webhook = process.env.FORM_WEBHOOK_URL;
  if (!webhook) {
    return Response.json(
      {
        ok: false,
        message: 'The form is ready, but FORM_WEBHOOK_URL must be configured before submissions can be delivered.',
      },
      { status: 503 },
    );
  }

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return Response.json({ ok: false, message: 'Submission delivery failed.' }, { status: 502 });
  }

  return Response.json({ ok: true, message: 'Thank you. Your request has been received.' });
}
