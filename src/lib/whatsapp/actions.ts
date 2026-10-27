'use server';

import { refresh } from 'next/cache';
import { DEMO_TEMPLATES, demoMetaMessageId, isDemoMode } from '@/lib/whatsapp/demo';
import {
  getWhatsAppCredentials,
  listMessageTemplates,
  sendTemplate as graphSendTemplate,
  sendText as graphSendText,
} from '@/lib/whatsapp/graph';
import {
  appendOutbound,
  getThreadWaId,
  openOrCreateThread,
  recordBroadcast as storeBroadcast,
} from '@/lib/whatsapp/store';

export type ActionResult =
  | { ok: true; threadId?: string }
  | { ok: false; error: string };

export async function sendText(
  threadId: string,
  body: string
): Promise<ActionResult> {
  const text = body.trim();
  if (!text) return { ok: false, error: 'Message cannot be empty' };

  const waId = await getThreadWaId(threadId);
  if (!waId) return { ok: false, error: 'Conversation not found' };

  if (isDemoMode()) {
    const stored = await appendOutbound({
      threadId,
      text,
      metaMessageId: demoMetaMessageId('text'),
    });
    if (!stored.ok) return { ok: false, error: stored.error };
    refresh();
    return { ok: true, threadId: stored.conversation.id };
  }

  const creds = getWhatsAppCredentials();
  if (!creds.ok) return { ok: false, error: creds.error };

  const sent = await graphSendText(
    creds.phoneNumberId,
    creds.token,
    waId,
    text
  );
  if (!sent.ok) return { ok: false, error: sent.error };

  const stored = await appendOutbound({
    threadId,
    text,
    metaMessageId: sent.data.metaMessageId,
  });
  if (!stored.ok) return { ok: false, error: stored.error };

  refresh();
  return { ok: true, threadId: stored.conversation.id };
}

export async function sendTemplate(
  threadId: string,
  templateName: string,
  language: string,
  variables: Record<string, string>
): Promise<ActionResult> {
  const waId = await getThreadWaId(threadId);
  if (!waId) return { ok: false, error: 'Conversation not found' };

  if (isDemoMode()) {
    const template = DEMO_TEMPLATES.find(
      (item) =>
        item.name === templateName &&
        item.language === language &&
        item.status === 'Approved'
    );
    if (!template) {
      return { ok: false, error: 'Template is not approved for this language' };
    }
    for (const variable of template.variables) {
      if (!variables[variable.key]?.trim()) {
        return { ok: false, error: 'Complete all template variables' };
      }
    }
    const rendered = template.body.replace(
      /\{\{(\d+)\}\}/g,
      (_, key: string) => variables[key] || ''
    );
    const stored = await appendOutbound({
      threadId,
      text: rendered || `Template: ${templateName}`,
      metaMessageId: demoMetaMessageId('template'),
      isTemplate: true,
      templateName,
    });
    if (!stored.ok) return { ok: false, error: stored.error };
    refresh();
    return { ok: true, threadId: stored.conversation.id };
  }

  const creds = getWhatsAppCredentials();
  if (!creds.ok) return { ok: false, error: creds.error };

  const listed = await listMessageTemplates(creds.wabaId, creds.token);
  if (!listed.ok) return { ok: false, error: listed.error };

  const template = listed.data.data.find(
    (item) =>
      item.name === templateName &&
      item.language === language &&
      item.status === 'APPROVED'
  );
  if (!template) {
    return { ok: false, error: 'Template is not approved for this language' };
  }

  const bodyText =
    template.components?.find((c) => c.type?.toUpperCase() === 'BODY')?.text ||
    '';
  const headerText =
    template.components?.find((c) => c.type?.toUpperCase() === 'HEADER')
      ?.text || '';
  const needed = [
    ...new Set(
      Array.from(`${headerText}\n${bodyText}`.matchAll(/\{\{(\d+)\}\}/g)).map(
        (m) => m[1]
      )
    ),
  ];
  for (const key of needed) {
    if (!variables[key]?.trim()) {
      return { ok: false, error: 'Complete all template variables' };
    }
  }

  const ordered = needed
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => variables[key].trim());

  const components = [
    ...(headerText.match(/\{\{(\d+)\}\}/g)
      ? [
          {
            type: 'header',
            parameters: ordered
              .slice(0, (headerText.match(/\{\{(\d+)\}\}/g) || []).length)
              .map((text) => ({ type: 'text', text })),
          },
        ]
      : []),
    ...(bodyText.match(/\{\{(\d+)\}\}/g)
      ? [
          {
            type: 'body',
            parameters: ordered
              .slice((headerText.match(/\{\{(\d+)\}\}/g) || []).length)
              .map((text) => ({ type: 'text', text })),
          },
        ]
      : []),
  ];

  const sent = await graphSendTemplate(
    creds.phoneNumberId,
    creds.token,
    waId,
    {
      name: templateName,
      language,
      ...(components.length ? { components } : {}),
    },
    creds.wabaId
  );
  if (!sent.ok) return { ok: false, error: sent.error };

  const fill = (text: string) =>
    text.replace(/\{\{(\d+)\}\}/g, (_, key: string) => variables[key] || '');
  const rendered = [fill(headerText), fill(bodyText)]
    .filter(Boolean)
    .join('\n\n');

  const stored = await appendOutbound({
    threadId,
    text: rendered || `Template: ${templateName}`,
    metaMessageId: sent.data.metaMessageId,
    isTemplate: true,
    templateName,
  });
  if (!stored.ok) return { ok: false, error: stored.error };

  refresh();
  return { ok: true, threadId: stored.conversation.id };
}

export async function openThread(
  phone: string,
  name: string
): Promise<ActionResult> {
  const result = await openOrCreateThread(phone, name);
  if (!result.ok) return result;
  refresh();
  return { ok: true, threadId: result.conversation.id };
}

export async function recordBroadcast(
  name: string,
  categories: string[],
  labels: string[],
  matchedCount: number
): Promise<ActionResult> {
  if (!name.trim()) return { ok: false, error: 'Enter a campaign name' };
  const conversation = await storeBroadcast({
    name: name.trim(),
    categories,
    labels,
    matchedCount,
  });
  refresh();
  return { ok: true, threadId: conversation.id };
}
