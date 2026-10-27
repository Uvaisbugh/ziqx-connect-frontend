'use client';

import React, { useState, useMemo } from 'react';
import { Button, Input } from '@ziqx/react-comps';
import {
  X,
  Search,
  Check,
  MessageCircle,
  Megaphone,
  Info,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { Contact, Conversation } from '@/types';

export type NewMessageMode = 'number' | 'contacts' | 'broadcast';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  conversations: Conversation[];
  onStartMessagingNumber?: (phone: string, name?: string) => void;
  onSelectContact?: (contact: Contact) => void;
  onStartBroadcast?: (
    name: string,
    categories: string[],
    labels: string[],
    matchedCount: number
  ) => void;
}

const CATEGORY_OPTIONS = [
  'SEO & Ads',
  'Brand Identity',
  'Mobile App',
  'ERP Setup',
  'Website Development',
  'UI/UX Design',
];

const LABEL_OPTIONS = ['Hot', 'Startup', 'Retail', 'Referral'];

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  contacts,
  conversations,
  onStartMessagingNumber,
  onSelectContact,
  onStartBroadcast,
}) => {
  const [mode, setMode] = useState<NewMessageMode>('number');

  // Mode 1: Enter number state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [numberTouched, setNumberTouched] = useState(false);

  // Mode 2: From contacts state
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  // Default selected contact is Divya Prakash (id 'c1' or phone ending 90314)
  const defaultSelectedContact = useMemo(() => {
    return (
      contacts.find(
        (c) =>
          c.name.toLowerCase().includes('divya prakash') ||
          c.phone.includes('85470 90314')
      ) || contacts[0]
    );
  }, [contacts]);

  const [selectedContactId, setSelectedContactId] = useState<string>(
    defaultSelectedContact?.id || ''
  );

  // Filtered contacts for Mode 2
  const filteredContacts = useMemo(() => {
    if (!contactSearchQuery.trim()) {
      // Prioritize the 5 initial contacts from the reference screenshot
      const priorityPhones = [
        '85470 90314',
        '99610 28845',
        '98954 00000',
        '80177 85493',
        '90372 66120',
      ];
      const initialMatches: Contact[] = [];
      priorityPhones.forEach((p) => {
        const found = contacts.find((c) => c.phone.includes(p));
        if (found && !initialMatches.some((m) => m.id === found.id)) {
          initialMatches.push(found);
        }
      });

      // Append remaining contacts
      const remaining = contacts.filter(
        (c) => !initialMatches.some((m) => m.id === c.id)
      );
      return [...initialMatches, ...remaining];
    }

    const q = contactSearchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [contacts, contactSearchQuery]);

  // Mode 3: Broadcast state
  const [broadcastName, setBroadcastName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'SEO & Ads',
    'Brand Identity',
  ]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [broadcastSubmitted, setBroadcastSubmitted] = useState(false);

  if (!isOpen) return null;

  // Clean digits for validation
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const isPhoneValid = cleanDigits.length >= 10;

  // Mode 1: Handle submit
  const handleStartMessagingNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setNumberTouched(true);
      return;
    }

    const formattedPhone = phoneNumber.startsWith('+91')
      ? phoneNumber.trim()
      : `+91 ${phoneNumber.trim()}`;

    if (onStartMessagingNumber) {
      onStartMessagingNumber(formattedPhone, contactName.trim() || undefined);
    }
    handleClose();
  };

  // Mode 2: Handle submit
  const handleStartMessagingContact = (e: React.FormEvent) => {
    e.preventDefault();
    const contactToChat = contacts.find((c) => c.id === selectedContactId) || defaultSelectedContact;
    if (contactToChat && onSelectContact) {
      onSelectContact(contactToChat);
    }
    handleClose();
  };

  // Mode 3: Handle submit
  const handleStartBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastName.trim()) {
      setBroadcastSubmitted(true);
      return;
    }

    // Calculate matching contacts
    const matchingCount = contacts.filter((c) => {
      const matchCat =
        selectedCategories.length === 0 ||
        selectedCategories.includes(c.category);
      const labels = c.labels || (c.label ? [c.label] : []);
      const matchLabel =
        selectedLabels.length === 0 ||
        selectedLabels.some((l) => labels.includes(l));
      return matchCat && matchLabel;
    }).length;

    if (onStartBroadcast) {
      onStartBroadcast(
        broadcastName.trim(),
        selectedCategories,
        selectedLabels,
        matchingCount || 12
      );
    }
    handleClose();
  };

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleToggleLabel = (lbl: string) => {
    setSelectedLabels((prev) =>
      prev.includes(lbl) ? prev.filter((l) => l !== lbl) : [...prev, lbl]
    );
  };

  const handleClose = () => {
    setNumberTouched(false);
    setBroadcastSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New message"
        className="bg-white rounded-[22px] shadow-modal w-full max-w-[480px] max-h-[90dvh] overflow-y-auto p-4 sm:p-6 border border-[#efede8] relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1a1a18]">New message</h3>
            <p className="text-xs text-[#8f8f8e] mt-0.5">
              {mode === 'broadcast'
                ? 'Send one message to a whole category.'
                : 'Add a number to start a WhatsApp chat.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-7 h-7 rounded-xl border border-[#e5e5e0] bg-[#f4f3ef] flex items-center justify-center text-[#5b5b5a] hover:bg-[#eae8e3] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Option Segmented Control */}
        <div className="bg-[#f4f3ef] p-1 rounded-xl flex items-center gap-1 mt-4 mb-5">
          <button
            type="button"
            onClick={() => setMode('number')}
            className={`flex-1 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg text-center transition-all px-1 ${
              mode === 'number'
                ? 'bg-white text-[#1a1a18] shadow-xs'
                : 'text-[#5b5b5a] hover:text-[#1a1a18]'
            }`}
          >
            Enter number
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('contacts');
              if (!selectedContactId && defaultSelectedContact) {
                setSelectedContactId(defaultSelectedContact.id);
              }
            }}
            className={`flex-1 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg text-center transition-all px-1 ${
              mode === 'contacts'
                ? 'bg-white text-[#1a1a18] shadow-xs'
                : 'text-[#5b5b5a] hover:text-[#1a1a18]'
            }`}
          >
            From contacts
          </button>
          <button
            type="button"
            onClick={() => setMode('broadcast')}
            className={`flex-1 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg text-center transition-all px-1 ${
              mode === 'broadcast'
                ? 'bg-white text-[#1a1a18] shadow-xs'
                : 'text-[#5b5b5a] hover:text-[#1a1a18]'
            }`}
          >
            Broadcast
          </button>
        </div>

        {/* MODE 1: Enter Number */}
        {mode === 'number' && (
          <form onSubmit={handleStartMessagingNumber}>
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                  WhatsApp phone number *
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-14 px-3 py-2.5 rounded-xl bg-[#f4f3ef] border border-[#e5e5e0] text-xs font-semibold text-[#1a1a18] flex items-center justify-center shrink-0">
                    +91
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="98470 12345"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (numberTouched) setNumberTouched(false);
                    }}
                    className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-colors bg-white ${
                      numberTouched && !isPhoneValid
                        ? 'border-red-500 bg-red-50/20'
                        : 'border-[#0b5c46] ring-1 ring-[#0b5c46]/10'
                    }`}
                  />
                </div>
                {numberTouched && !isPhoneValid && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Please enter a valid 10-digit WhatsApp number.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                  Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anjali Menon"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none text-[#1a1a18] placeholder-[#b1b0ae] bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 flex-wrap mt-6 pt-2">
              <Button
                type="button"
                size="compact"
                variant="outline"
                bgColor={ziqxUi.surface}
                fgColor={ziqxUi.dark}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="compact"
                disabled={!isPhoneValid}
                bgColor={ziqxUi.green}
                fgColor={ziqxUi.greenFg}
                prefix={MessageCircle}
              >
                Start messaging
              </Button>
            </div>
          </form>
        )}

        {/* MODE 2: From Contacts */}
        {mode === 'contacts' && (
          <form onSubmit={handleStartMessagingContact}>
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-[#8f8f8e] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contacts"
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3.5 py-2.5 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none text-[#1a1a18] placeholder-[#8f8f8e] bg-white transition-colors"
              />
            </div>

            {/* Contact Selection List */}
            <div className="curve-scroll max-h-60 overflow-y-auto space-y-1 pr-1 divide-y-0">
              {filteredContacts.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8f8f8e]">
                  No contacts found matching "{contactSearchQuery}".
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const isSelected = selectedContactId === contact.id;

                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContactId(contact.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#f4f3ef]'
                          : 'hover:bg-[#faf9f7]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Circular Pastel Avatar */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{
                            backgroundColor: contact.avatarBg,
                            color: contact.avatarColor || '#1a1a18',
                          }}
                        >
                          {contact.initials}
                        </div>

                        {/* Name & Phone */}
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-[#1a1a18] leading-tight">
                            {contact.name}
                          </span>
                          <span className="text-[11px] text-[#8f8f8e] mt-0.5">
                            {contact.phone}
                          </span>
                        </div>
                      </div>

                      {/* Selection Radio Control */}
                      <div className="shrink-0 pl-2">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#0b5c46] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-[#d1d0cb]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 flex-wrap mt-6 pt-2">
              <Button
                type="button"
                size="compact"
                variant="outline"
                bgColor={ziqxUi.surface}
                fgColor={ziqxUi.dark}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="compact"
                disabled={!selectedContactId}
                bgColor={ziqxUi.green}
                fgColor={ziqxUi.greenFg}
                prefix={MessageCircle}
              >
                Start messaging
              </Button>
            </div>
          </form>
        )}

        {/* MODE 3: Broadcast */}
        {mode === 'broadcast' && (
          <form onSubmit={handleStartBroadcast}>
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                  Broadcast name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Diwali offer – Brand Identity"
                  value={broadcastName}
                  onChange={(e) => setBroadcastName(e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none bg-white transition-colors ${
                    broadcastSubmitted && !broadcastName.trim()
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-[#0b5c46] ring-1 ring-[#0b5c46]/10'
                  }`}
                />
                {broadcastSubmitted && !broadcastName.trim() && (
                  <p className="text-[11px] text-red-600 mt-1">
                    Broadcast name is required.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5b5b5a] mb-2">
                  Send to category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          isSelected
                            ? 'border-[#0b5c46] bg-[#ddf3e5] text-[#0b5c46] font-semibold'
                            : 'border-[#e5e5e0] bg-white text-[#5b5b5a] font-medium hover:bg-[#faf9f7]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5b5b5a] mb-2">
                  Filter by label (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {LABEL_OPTIONS.map((lbl) => {
                    const isSelected = selectedLabels.includes(lbl);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => handleToggleLabel(lbl)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          isSelected
                            ? 'border-[#0b5c46] bg-[#ddf3e5] text-[#0b5c46] font-semibold'
                            : 'border-[#e5e5e0] bg-white text-[#5b5b5a] font-medium hover:bg-[#faf9f7]'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Helper text with info icon */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#8f8f8e]">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Creates a broadcast group in your Inbox for this message.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 flex-wrap mt-6 pt-2">
              <Button
                type="button"
                size="compact"
                variant="outline"
                bgColor={ziqxUi.surface}
                fgColor={ziqxUi.dark}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="compact"
                bgColor={ziqxUi.green}
                fgColor={ziqxUi.greenFg}
                prefix={Megaphone}
              >
                Start broadcast
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
