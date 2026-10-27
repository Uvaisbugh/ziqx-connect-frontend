'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Contact } from '@/types';
import { INITIAL_CONTACTS } from '@/data/mockData';

type ContactsContextValue = {
  contacts: Contact[];
  updateContact: (contact: Contact) => void;
  addContact: (contact: Contact) => void;
  importContacts: (imported: Contact[]) => void;
};

const ContactsContext = createContext<ContactsContextValue | null>(null);

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);

  const value = useMemo<ContactsContextValue>(
    () => ({
      contacts,
      updateContact: (updated) =>
        setContacts((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        ),
      addContact: (newContact) => setContacts((prev) => [newContact, ...prev]),
      importContacts: (imported) =>
        setContacts((prev) => [...imported, ...prev]),
    }),
    [contacts]
  );

  return (
    <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) {
    throw new Error('useContacts must be used within ContactsProvider');
  }
  return ctx;
}
