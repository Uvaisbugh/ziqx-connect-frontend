export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  label: string | null;
  labels?: string[];
  savedOn: string;
  leadSource: string;
  campaign: string;
  interestedService: string;
  assignedAgent: string;
  added: string;
  lastInteraction: string;
  nextFollowUp: string;
  tags: string[];
  notes: string[];
  initials: string;
  avatarBg: string;
  avatarColor: string;
  consent: boolean;
  status: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';
}

export interface ChatMessage {
  id: string;
  sender: 'contact' | 'agent';
  text: string;
  timestamp: string;
  dateGroup: 'Yesterday' | 'Today';
  isTemplate?: boolean;
  templateName?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  contactId: string;
  name: string;
  phone: string;
  category: string;
  status: 'New' | 'Qualified' | 'Contacted' | 'Converted' | 'Lost';
  unreadCount: number;
  isOnline: boolean;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  messages: ChatMessage[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: 'Utility' | 'Marketing';
  status: 'Approved' | 'Pending' | 'Rejected' | 'Paused';
  language: string;
  updatedAt: string;
  body: string;
  variables: {
    key: string;
    defaultValue: string;
    label: string;
  }[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  title: string;
  access: 'Admin' | 'Manager' | 'Agent';
  status: 'Active' | 'Invited';
  initials: string;
  avatarBg: string;
  avatarColor?: string;
}
