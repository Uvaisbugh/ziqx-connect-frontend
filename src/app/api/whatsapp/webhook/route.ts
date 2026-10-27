import { NextRequest } from 'next/server';
import { applyWebhookPayload, verifyWebhookSignature } from '@/lib/whatsapp/webhook';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN?.trim();

  if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
    return new Response(challenge ?? '', { status: 200 });
  }
  return new Response('Verification failed', { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody) as unknown;
    await applyWebhookPayload(body);
  } catch {
    // Valid signature still gets 200 even when payload cannot be applied.
  }

  return new Response('EVENT_RECEIVED', { status: 200 });
}
