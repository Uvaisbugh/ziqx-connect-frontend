'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@ziqx/react-comps';
import {
  X,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ChevronDown,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { Contact } from '@/types';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
  existingContacts: Contact[];
}

const TAG_OPTIONS = [
  'Hot',
  'Startup',
  'Retail',
  'Enterprise',
  'Referral',
  'Education',
];

const LEAD_SOURCE_OPTIONS = [
  'WhatsApp',
  'Meta Ads',
  'Google Search',
  'LinkedIn',
  'Referral',
  'Direct enquiry',
];

const INTERESTED_SERVICE_OPTIONS = [
  'Website Development',
  'SEO & Ads',
  'Brand Identity',
  'Mobile App',
  'ERP Setup',
  'UI/UX Design',
];

const ASSIGNED_AGENT_OPTIONS = [
  'Jabir MDN',
  'Aswin Krishnan',
  'Nimisha Raj',
  'Rashid Pookoya',
];

type ConsentStatus = 'Opted in' | 'Pending' | 'Opted out';

export const NewContactModal: React.FC<NewContactModalProps> = ({
  isOpen,
  onClose,
  onAddContact,
  existingContacts,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [leadSource, setLeadSource] = useState('WhatsApp');
  const [campaign, setCampaign] = useState('Direct enquiry');
  const [interestedService, setInterestedService] = useState('Website Development');
  const [assignedAgent, setAssignedAgent] = useState('Jabir MDN');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [consent, setConsent] = useState<ConsentStatus>('Pending');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Duplicate phone check
  const cleanEnteredDigits = phone.replace(/\D/g, '');
  const isDuplicate =
    cleanEnteredDigits.length >= 7 &&
    existingContacts.some((c) => {
      const existingClean = c.phone.replace(/\D/g, '');
      return (
        existingClean.endsWith(cleanEnteredDigits) ||
        cleanEnteredDigits.endsWith(existingClean.slice(-10))
      );
    });

  const isNameValid = name.trim().length > 0;
  const isPhoneValid = cleanEnteredDigits.length >= 10;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isNameValid || !isPhoneValid || isDuplicate) {
      return;
    }

    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const formattedPhone = phone.trim().startsWith('+91')
      ? phone.trim()
      : `+91 ${phone.trim()}`;

    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      phone: formattedPhone,
      email:
        email.trim() ||
        `${name.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      category: interestedService,
      label: selectedTags[0] || null,
      labels: selectedTags,
      savedOn: 'Today',
      leadSource,
      campaign,
      interestedService,
      assignedAgent,
      added: 'Today',
      lastInteraction: 'Just now',
      nextFollowUp: 'Tomorrow, 10:30',
      tags: selectedTags,
      notes: notes.trim() ? [notes.trim()] : [],
      initials: initials || 'CO',
      avatarBg: '#ddf3e5',
      avatarColor: '#0b5c46',
      consent: consent === 'Opted in',
      status: 'New',
    };

    onAddContact(newContact);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setLeadSource('WhatsApp');
    setCampaign('Direct enquiry');
    setInterestedService('Website Development');
    setAssignedAgent('Jabir MDN');
    setSelectedTags([]);
    setConsent('Pending');
    setNotes('');
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed semi-transparent overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Right-side drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] md:w-[720px] max-w-[720px] bg-white rounded-l-[24px] shadow-2xl border-l border-[#efede8] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#f0eeea] flex items-start justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#1a1a18] tracking-tight">
              Add contact
            </h2>
            <p className="text-xs text-[#8f8f8e] mt-1">
              Save a new contact. We check for duplicate numbers as you type.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-[#f4f3ef] border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:bg-[#eae8e3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form
          id="new-contact-drawer-form"
          onSubmit={handleSubmit}
          className="curve-scroll flex-1 overflow-y-auto px-8 py-6 space-y-5"
        >
          <Input
            label="Full name *"
            type="text"
            required
            placeholder="e.g. Anjali Menon"
            value={name}
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            error={submitted && !isNameValid ? 'Full name is required.' : undefined}
            onChange={(e) => setName(e.target.value)}
          />

          {/* WhatsApp phone number * */}
          <div>
            <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
              WhatsApp phone number *
            </label>
            <div className="flex items-center gap-2">
              <div className="w-14 sm:w-16 px-3 py-3 rounded-xl bg-[#f4f3ef] border border-[#e5e5e0] text-xs font-semibold text-[#1a1a18] flex items-center justify-center shrink-0">
                +91
              </div>
              <input
                type="text"
                required
                placeholder="98470 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`flex-1 text-xs px-3.5 py-3 rounded-xl border outline-none bg-white transition-colors placeholder-[#b1b0ae] text-[#1a1a18] ${
                  isDuplicate
                    ? 'border-red-500 bg-red-50/20'
                    : submitted && !isPhoneValid
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-[#e5e5e0] focus:border-[#0b5c46]'
                }`}
              />
            </div>
            {isDuplicate && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>A contact with this phone number already exists.</span>
              </p>
            )}
            {!isDuplicate && submitted && !isPhoneValid && (
              <p className="text-[11px] text-red-600 mt-1">
                Please enter a valid 10-digit WhatsApp number.
              </p>
            )}
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Two-column: Lead source and Campaign */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                Lead source
              </label>
              <div className="relative">
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none bg-white text-[#1a1a18] appearance-none cursor-pointer transition-colors"
                >
                  {LEAD_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8f8f8e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                Campaign
              </label>
              <input
                type="text"
                placeholder="Direct enquiry"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none bg-white text-[#1a1a18] placeholder-[#b1b0ae] transition-colors"
              />
            </div>
          </div>

          {/* Two-column: Interested service and Assigned agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                Interested service
              </label>
              <div className="relative">
                <select
                  value={interestedService}
                  onChange={(e) => setInterestedService(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none bg-white text-[#1a1a18] appearance-none cursor-pointer transition-colors"
                >
                  {INTERESTED_SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8f8f8e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
                Assigned agent
              </label>
              <div className="relative">
                <select
                  value={assignedAgent}
                  onChange={(e) => setAssignedAgent(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none bg-white text-[#1a1a18] appearance-none cursor-pointer transition-colors"
                >
                  {ASSIGNED_AGENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#8f8f8e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#5b5b5a] mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition-colors ${
                      isSelected
                        ? 'border-[#0b5c46] bg-[#ddf3e5] text-[#0b5c46] font-semibold'
                        : 'border-[#e5e5e0] bg-white text-[#5b5b5a] font-medium hover:bg-[#faf9f7]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp messaging consent */}
          <div>
            <label className="block text-xs font-semibold text-[#5b5b5a] mb-2">
              WhatsApp messaging consent
            </label>
            <div className="space-y-2.5">
              {/* Card 1: Opted in */}
              <div
                onClick={() => setConsent('Opted in')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  consent === 'Opted in'
                    ? 'border-[#0b5c46] bg-[#f4faf6] ring-1 ring-[#0b5c46]'
                    : 'border-[#efede8] bg-white hover:border-[#d1d0cb]'
                }`}
              >
                <div className="mt-0.5 text-[#1a1a18] shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1a1a18]">
                    Opted in
                  </span>
                  <span className="text-[11px] text-[#8f8f8e] mt-0.5">
                    Contact agreed to receive WhatsApp messages
                  </span>
                </div>
              </div>

              {/* Card 2: Pending (Default) */}
              <div
                onClick={() => setConsent('Pending')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  consent === 'Pending'
                    ? 'border-[#0b5c46] bg-[#f4faf6] ring-1 ring-[#0b5c46]'
                    : 'border-[#efede8] bg-white hover:border-[#d1d0cb]'
                }`}
              >
                <div className="mt-0.5 text-[#1a1a18] shrink-0">
                  <ShieldAlert className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1a1a18]">
                    Pending
                  </span>
                  <span className="text-[11px] text-[#8f8f8e] mt-0.5">
                    No opt-in yet — templates are blocked until consent is recorded
                  </span>
                </div>
              </div>

              {/* Card 3: Opted out */}
              <div
                onClick={() => setConsent('Opted out')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  consent === 'Opted out'
                    ? 'border-[#0b5c46] bg-[#f4faf6] ring-1 ring-[#0b5c46]'
                    : 'border-[#efede8] bg-white hover:border-[#d1d0cb]'
                }`}
              >
                <div className="mt-0.5 text-[#1a1a18] shrink-0">
                  <ShieldX className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1a1a18]">
                    Opted out
                  </span>
                  <span className="text-[11px] text-[#8f8f8e] mt-0.5">
                    Do not message
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-1 pb-4">
            <label className="block text-xs font-semibold text-[#5b5b5a] mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="A short note about the enquiry."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none bg-white text-[#1a1a18] placeholder-[#b1b0ae] transition-colors resize-none"
            />
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="px-8 py-4 border-t border-[#f0eeea] bg-white flex items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-contact-drawer-form"
            disabled={isDuplicate}
            bgColor={ziqxUi.green}
            fgColor={ziqxUi.greenFg}
          >
            Add contact
          </Button>
        </div>
      </div>
    </div>
  );
};
