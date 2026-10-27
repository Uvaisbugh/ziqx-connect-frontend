import 'server-only';

import type { MessageTemplate } from '@/types';
import { DEMO_ACCOUNT, DEMO_TEMPLATES, isDemoMode } from './demo';
import {
  getWhatsAppCredentials,
  listMessageTemplates,
  type WaMessageTemplate,
} from './graph';

function mapStatus(status: string): MessageTemplate['status'] {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'Approved';
    case 'PENDING':
    case 'IN_APPEAL':
      return 'Pending';
    case 'REJECTED':
      return 'Rejected';
    case 'PAUSED':
    case 'DISABLED':
      return 'Paused';
    default:
      return 'Pending';
  }
}

function mapCategory(category: string): MessageTemplate['category'] {
  return category.toUpperCase() === 'MARKETING' ? 'Marketing' : 'Utility';
}

function extractVariables(body: string): MessageTemplate['variables'] {
  const matches = Array.from(body.matchAll(/\{\{(\d+)\}\}/g));
  const keys = [...new Set(matches.map((m) => m[1]))].sort(
    (a, b) => Number(a) - Number(b)
  );
  return keys.map((key) => ({
    key,
    defaultValue: '',
    label: `Variable {{${key}}}`,
  }));
}

export function mapGraphTemplate(template: WaMessageTemplate): MessageTemplate {
  const body =
    template.components?.find((c) => c.type?.toUpperCase() === 'BODY')?.text ||
    '';
  const header =
    template.components?.find((c) => c.type?.toUpperCase() === 'HEADER')
      ?.text || '';
  const combined = [header, body].filter(Boolean).join('\n\n');
  return {
    id: template.id,
    name: template.name,
    category: mapCategory(template.category),
    status: mapStatus(template.status),
    language: template.language,
    updatedAt: new Date().toLocaleDateString(),
    body: combined || template.name,
    variables: extractVariables(combined),
  };
}

export async function loadTemplates(): Promise<{
  items: MessageTemplate[];
  error?: string;
  demo?: boolean;
}> {
  if (isDemoMode()) {
    return { items: DEMO_TEMPLATES, demo: true };
  }
  const creds = getWhatsAppCredentials();
  if (!creds.ok) return { items: [], error: creds.error };
  const result = await listMessageTemplates(creds.wabaId, creds.token);
  if (!result.ok) return { items: [], error: result.error };
  return { items: result.data.data.map(mapGraphTemplate) };
}

export async function loadAccount(): Promise<{
  connected: boolean;
  demo?: boolean;
  displayPhone?: string;
  verifiedName?: string;
  qualityRating?: string;
  error?: string;
}> {
  if (isDemoMode()) {
    return { ...DEMO_ACCOUNT };
  }
  const creds = getWhatsAppCredentials();
  if (!creds.ok) {
    return { connected: false, error: creds.error };
  }
  const { getPhoneNumber } = await import('./graph');
  const phone = await getPhoneNumber(creds.phoneNumberId, creds.token);
  if (!phone.ok) {
    return { connected: false, error: phone.error };
  }
  return {
    connected: true,
    displayPhone: phone.data.display_phone_number,
    verifiedName: phone.data.verified_name,
    qualityRating: phone.data.quality_rating,
  };
}
