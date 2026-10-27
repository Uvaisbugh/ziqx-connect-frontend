import 'server-only';

/** Digits-only WhatsApp id, matching the reference phone parser. */
export function toWaId(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return digits;
}

export function formatDisplayPhone(waId: string): string {
  if (waId.length === 12 && waId.startsWith('91')) {
    return `+${waId.slice(0, 2)} ${waId.slice(2, 7)} ${waId.slice(7)}`;
  }
  if (waId.length === 10) {
    return `+91 ${waId.slice(0, 5)} ${waId.slice(5)}`;
  }
  return `+${waId}`;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'WA';
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
