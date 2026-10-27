import 'server-only';

import type { MessageTemplate } from '@/types';

export function isDemoMode(): boolean {
  const value = process.env.WHATSAPP_DEMO_MODE?.trim().toLowerCase();
  if (value === '0' || value === 'false' || value === 'off') return false;
  // Default on when Meta credentials are missing so local UI testing works.
  if (value === '1' || value === 'true' || value === 'on') return true;
  const token = process.env.META_SYSTEM_USER_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  return !token || !phoneNumberId || !wabaId;
}

export const DEMO_ACCOUNT = {
  connected: true as const,
  demo: true as const,
  displayPhone: '+91 98470 55012',
  verifiedName: 'Ziqx Connect Demo',
  qualityRating: 'GREEN',
};

export const DEMO_TEMPLATES: MessageTemplate[] = [
  {
    id: 'demo_t1',
    name: 'welcome_new_lead',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    updatedAt: '12 Oct 2026',
    body: "Hi {{1}}, thanks for your interest in {{2}} at Ziqx. I'm {{3}} — happy to help. When's a good time to talk?",
    variables: [
      { key: '1', defaultValue: 'Anjali', label: '{{1}} name' },
      { key: '2', defaultValue: 'Website Development', label: '{{2}} service' },
      { key: '3', defaultValue: 'Jabir', label: '{{3}} agent' },
    ],
  },
  {
    id: 'demo_t2',
    name: 'follow_up_reminder',
    category: 'Utility',
    status: 'Approved',
    language: 'en_US',
    updatedAt: '10 Oct 2026',
    body: 'Hi {{1}}, following up on our discussion about {{2}}. Would you like to connect tomorrow for 10 minutes?',
    variables: [
      { key: '1', defaultValue: 'Divya', label: '{{1}} name' },
      { key: '2', defaultValue: 'SEO & Ads', label: '{{2}} service' },
    ],
  },
  {
    id: 'demo_t3',
    name: 'offer_announcement',
    category: 'Marketing',
    status: 'Approved',
    language: 'en_US',
    updatedAt: '8 Oct 2026',
    body: 'Hi {{1}}, Ziqx has a limited offer on {{2}}. Reply YES to book a free consultation.',
    variables: [
      { key: '1', defaultValue: 'Priya', label: '{{1}} name' },
      { key: '2', defaultValue: 'Brand Identity', label: '{{2}} offer' },
    ],
  },
  {
    id: 'demo_t4',
    name: 'invoice_ready',
    category: 'Utility',
    status: 'Pending',
    language: 'en_US',
    updatedAt: '5 Oct 2026',
    body: 'Hi {{1}}, invoice {{2}} for {{3}} is ready. Due by {{4}}.',
    variables: [
      { key: '1', defaultValue: 'Rahul', label: '{{1}} name' },
      { key: '2', defaultValue: 'INV-4402', label: '{{2}} invoice' },
      { key: '3', defaultValue: '₹25,000', label: '{{3}} amount' },
      { key: '4', defaultValue: '15 Oct', label: '{{4}} due date' },
    ],
  },
];

export function demoMetaMessageId(prefix = 'demo'): string {
  return `wamid.${prefix}.${Date.now()}`;
}
