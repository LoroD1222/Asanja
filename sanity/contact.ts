// Existing public WhatsApp contact link in the legacy Asanja site.
export const legacyWhatsappNumber = '255685700000'

export function whatsappHref(number: string | undefined, message: string) {
  const digits = (number || legacyWhatsappNumber).replace(/\D/g, '')
  return /^\d{8,15}$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null
}
