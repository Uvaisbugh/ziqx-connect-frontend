import { connection } from 'next/server';
import { ContactsProvider } from '@/components/contacts/ContactsProvider';
import { AppShell } from '@/components/shell/AppShell';
import { getTotalUnread } from '@/lib/whatsapp/store';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const inboxBadgeCount = await getTotalUnread();

  return (
    <ContactsProvider>
      <AppShell inboxBadgeCount={inboxBadgeCount}>{children}</AppShell>
    </ContactsProvider>
  );
}
