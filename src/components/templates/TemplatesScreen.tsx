'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { openThread, sendTemplate } from '@/lib/whatsapp/actions';
import type { MessageTemplate } from '@/types';
import { TemplatesPage } from './TemplatesPage';
import { useContacts } from '@/components/contacts/ContactsProvider';

export function TemplatesScreen({
  templates,
  loadError,
}: {
  templates: MessageTemplate[];
  loadError?: string;
}) {
  const router = useRouter();
  const { contacts } = useContacts();
  const [error, setError] = useState<string | null>(loadError || null);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {error && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold">
          {error}
        </div>
      )}
      <TemplatesPage
        templates={templates}
        contacts={contacts}
        onSendTemplateToContact={async (template, contact, variables) => {
          setError(null);
          const opened = await openThread(contact.phone, contact.name);
          if (!opened.ok || !opened.threadId) {
            setError(opened.ok ? 'Could not open conversation' : opened.error);
            return;
          }
          const result = await sendTemplate(
            opened.threadId,
            template.name,
            template.language,
            variables
          );
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.push(`/inbox?thread=${encodeURIComponent(opened.threadId)}`);
        }}
      />
    </div>
  );
}
