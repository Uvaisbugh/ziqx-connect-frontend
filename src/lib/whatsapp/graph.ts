import 'server-only';

import { toWaId } from './phone';

export type WaResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

type GraphError = {
  error?: { message?: string; type?: string; code?: number };
};

export type WaPhoneNumberInfo = {
  id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating?: string;
};

export type WaMessageTemplate = {
  id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components?: {
    type?: string;
    format?: string;
    text?: string;
  }[];
};

export type WaTemplateInput = {
  name: string;
  language: string;
  components?: unknown[];
};

const getEnv = (key: string) => process.env[key]?.trim() || '';

export const metaGraphVersion = () => getEnv('META_GRAPH_VERSION') || 'v21.0';

const GRAPH_BASE = () => `https://graph.facebook.com/${metaGraphVersion()}`;

export function getWhatsAppCredentials():
  | {
      ok: true;
      token: string;
      phoneNumberId: string;
      wabaId: string;
    }
  | { ok: false; error: string } {
  const token = getEnv('META_SYSTEM_USER_TOKEN');
  const phoneNumberId = getEnv('WHATSAPP_PHONE_NUMBER_ID');
  const wabaId = getEnv('WHATSAPP_BUSINESS_ACCOUNT_ID');
  if (!token || !phoneNumberId || !wabaId) {
    return {
      ok: false,
      error:
        'WhatsApp is disconnected. Set META_SYSTEM_USER_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_BUSINESS_ACCOUNT_ID.',
    };
  }
  return { ok: true, token, phoneNumberId, wabaId };
}

export async function graphRequest<T>(
  path: string,
  options: {
    method?: string;
    token: string;
    body?: BodyInit | null;
    headers?: Record<string, string>;
  }
): Promise<WaResult<T>> {
  const { method = 'GET', token, body, headers: extraHeaders } = options;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
  if (body && !(body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(`${GRAPH_BASE()}${path}`, {
      method,
      headers,
      body,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const json = (await res.json().catch(() => ({}))) as T & GraphError;
    if (!res.ok || json.error) {
      console.error('WhatsApp graph request failed');
      return {
        ok: false,
        error: json.error?.message || `Graph request failed (${res.status})`,
      };
    }
    return { ok: true, data: json as T };
  } catch {
    console.error('WhatsApp graph request failed');
    return { ok: false, error: 'Could not reach Meta Graph API' };
  }
}

export const getPhoneNumber = async (
  phoneNumberId: string,
  token: string
): Promise<WaResult<WaPhoneNumberInfo>> =>
  graphRequest<WaPhoneNumberInfo>(
    `/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`,
    { token }
  );

export const listMessageTemplates = async (wabaId: string, token: string) => {
  const query = new URLSearchParams({
    fields: 'id,name,language,category,status,components',
    limit: '100',
  });
  return graphRequest<{ data: WaMessageTemplate[] }>(
    `/${wabaId}/message_templates?${query}`,
    { token }
  );
};

type SendResponse = {
  messages?: { id: string }[];
  contacts?: { wa_id: string }[];
};

const sendPayload = async (
  phoneNumberId: string,
  token: string,
  payload: Record<string, unknown>,
  endpoint: 'messages' | 'marketing_messages' = 'messages'
): Promise<
  WaResult<{
    metaMessageId: string;
    waId?: string;
    apiProduct: 'cloud_api' | 'marketing_messages';
  }>
> => {
  const result = await graphRequest<SendResponse>(
    `/${phoneNumberId}/${endpoint}`,
    {
      method: 'POST',
      token,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        ...payload,
      }),
    }
  );
  if (!result.ok) return result;
  const metaMessageId = result.data.messages?.[0]?.id;
  if (!metaMessageId) return { ok: false, error: 'Meta returned no message id' };
  return {
    ok: true,
    data: {
      metaMessageId,
      waId: result.data.contacts?.[0]?.wa_id,
      apiProduct:
        endpoint === 'marketing_messages' ? 'marketing_messages' : 'cloud_api',
    },
  };
};

export const sendText = (
  phoneNumberId: string,
  token: string,
  to: string,
  body: string
) => {
  const waId = toWaId(to);
  if (!waId) return Promise.resolve({ ok: false as const, error: 'Enter a valid phone number' });
  return sendPayload(phoneNumberId, token, {
    to: waId,
    type: 'text',
    text: { body, preview_url: true },
  });
};

export const sendTemplate = async (
  phoneNumberId: string,
  token: string,
  to: string,
  template: WaTemplateInput,
  wabaId: string
) => {
  const waId = toWaId(to);
  if (!waId) return { ok: false as const, error: 'Enter a valid phone number' };

  const query = new URLSearchParams({
    name: template.name,
    fields: 'name,language,category,status',
    limit: '100',
  });
  const result = await graphRequest<{ data: WaMessageTemplate[] }>(
    `/${wabaId}/message_templates?${query}`,
    { token }
  );
  if (!result.ok) return result;
  const approved = result.data.data.find(
    (item) =>
      item.name === template.name &&
      item.language === template.language &&
      item.status === 'APPROVED'
  );
  if (!approved) {
    return {
      ok: false as const,
      error: 'Template is not approved for this account and language',
    };
  }
  if (!['MARKETING', 'UTILITY', 'AUTHENTICATION'].includes(approved.category)) {
    return {
      ok: false as const,
      error: 'Meta returned an unsupported template category',
    };
  }
  const marketing = approved.category === 'MARKETING';
  const policy =
    getEnv('META_MARKETING_PRODUCT_POLICY') || 'CLOUD_API_FALLBACK';
  if (marketing && policy !== 'CLOUD_API_FALLBACK' && policy !== 'STRICT') {
    return {
      ok: false as const,
      error: 'Invalid marketing product policy configuration',
    };
  }
  return sendPayload(
    phoneNumberId,
    token,
    {
      to: waId,
      type: 'template',
      ...(marketing ? { product_policy: policy } : {}),
      template: {
        name: template.name,
        language: { code: template.language },
        ...(template.components ? { components: template.components } : {}),
      },
    },
    marketing ? 'marketing_messages' : 'messages'
  );
};
