'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  openThread,
  recordBroadcast,
  sendTemplate,
  sendText,
} from '@/lib/whatsapp/actions';
import type { Conversation, MessageTemplate } from '@/types';
import { InboxPage } from './InboxPage';
import { useContacts } from '@/components/contacts/ContactsProvider';

export function InboxScreen({
  conversations,
  templates,
  activeConversationId,
}: {
  conversations: Conversation[];
  templates: MessageTemplate[];
  activeConversationId?: string;
}) {
  const router = useRouter();
  const { contacts, updateContact } = useContacts();
  const [sendError, setSendError] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {sendError && (
        <div className="mb-2 rounded-xl bg-ziqx-badge-red px-3 py-2 text-xs font-semibold text-ziqx-badge-red-text">
          {sendError}
        </div>
      )}
      <InboxPage
        conversations={conversations}
        templates={templates}
        contacts={contacts}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          router.push(`/inbox?thread=${encodeURIComponent(id)}`);
        }}
        onCloseConversation={() => {
          router.push('/inbox');
        }}
        onUpdateContact={updateContact}
        onSendMessage={async (conversationId, text, isTemplate, templateName) => {
          setSendError(null);
          if (isTemplate && templateName) {
            const tpl = templates.find((t) => t.name === templateName);
            const variables: Record<string, string> = {};
            tpl?.variables.forEach((v) => {
              variables[v.key] = v.defaultValue || v.key;
            });
            const result = await sendTemplate(
              conversationId,
              templateName,
              tpl?.language || 'en_US',
              variables
            );
            if (!result.ok) setSendError(result.error);
            return;
          }
          const result = await sendText(conversationId, text);
          if (!result.ok) setSendError(result.error);
        }}
        onStartNewChat={async (phone, name) => {
          setSendError(null);
          const result = await openThread(phone, name);
          if (!result.ok) {
            setSendError(result.error);
            return;
          }
          if (result.threadId) {
            router.push(`/inbox?thread=${encodeURIComponent(result.threadId)}`);
          }
        }}
        onOpenWhatsApp={async (contact) => {
          setSendError(null);
          const result = await openThread(contact.phone, contact.name);
          if (!result.ok) {
            setSendError(result.error);
            return;
          }
          if (result.threadId) {
            router.push(`/inbox?thread=${encodeURIComponent(result.threadId)}`);
          }
        }}
        onStartBroadcast={async (name, categories, labels, matchedCount) => {
          setSendError(null);
          const result = await recordBroadcast(
            name,
            categories,
            labels,
            matchedCount
          );
          if (!result.ok) {
            setSendError(result.error);
            return;
          }
          if (result.threadId) {
            router.push(`/inbox?thread=${encodeURIComponent(result.threadId)}`);
          }
        }}
      />
    </div>
  );
}
