import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { applyInboundMessage, applyMessageStatus } from './store';

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.META_APP_SECRET?.trim();
  if (!secret || !signatureHeader?.startsWith('sha256=')) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const provided = signatureHeader.slice('sha256='.length);
  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(provided, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

type WebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: {
          id?: string;
          from?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }[];
        statuses?: {
          id?: string;
          status?: string;
        }[];
      };
    }[];
  }[];
};

export async function applyWebhookPayload(body: unknown): Promise<void> {
  const payload = body as WebhookPayload;
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value) continue;

      const profileName = value.contacts?.[0]?.profile?.name;

      for (const message of value.messages || []) {
        if (!message.id || !message.from) continue;
        const text =
          message.type === 'text'
            ? message.text?.body || ''
            : `[${message.type || 'message'}]`;
        if (!text) continue;
        await applyInboundMessage({
          waId: message.from,
          profileName,
          text,
          metaMessageId: message.id,
          timestampMs: message.timestamp
            ? Number(message.timestamp)
            : undefined,
        });
      }

      for (const status of value.statuses || []) {
        if (!status.id || !status.status) continue;
        const normalized = status.status.toLowerCase();
        if (
          normalized === 'sent' ||
          normalized === 'delivered' ||
          normalized === 'read'
        ) {
          await applyMessageStatus({
            metaMessageId: status.id,
            status: normalized,
          });
        }
      }
    }
  }
}
