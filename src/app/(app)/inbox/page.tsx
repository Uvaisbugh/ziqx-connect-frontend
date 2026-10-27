import { connection } from 'next/server';
import { InboxScreen } from '@/components/inbox/InboxScreen';
import { listConversations } from '@/lib/whatsapp/store';
import { loadTemplates } from '@/lib/whatsapp/templates';

export default async function InboxRoute({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const conversations = await listConversations();
  const { items: templates } = await loadTemplates();

  return (
    <InboxScreen
      conversations={conversations}
      templates={templates}
      activeConversationId={params.thread}
    />
  );
}
