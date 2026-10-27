'use client';

import { useRouter } from 'next/navigation';
import { openThread } from '@/lib/whatsapp/actions';
import { ContactsPage } from './ContactsPage';
import { useContacts } from './ContactsProvider';

export function ContactsScreen() {
  const router = useRouter();
  const { contacts, updateContact, addContact, importContacts } = useContacts();

  return (
    <ContactsPage
      contacts={contacts}
      onUpdateContact={updateContact}
      onAddContact={addContact}
      onImportContacts={importContacts}
      onOpenWhatsApp={async (contact) => {
        const result = await openThread(contact.phone, contact.name);
        if (result.ok && result.threadId) {
          router.push(`/inbox?thread=${encodeURIComponent(result.threadId)}`);
        }
      }}
    />
  );
}
