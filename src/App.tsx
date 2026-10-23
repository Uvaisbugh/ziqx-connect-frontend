import React, { useState } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { ContactsPage } from './components/ContactsPage';
import { InboxPage } from './components/InboxPage';
import { TemplatesPage } from './components/TemplatesPage';
import { SettingsPage } from './components/SettingsPage';
import {
  INITIAL_CONTACTS,
  INITIAL_CONVERSATIONS,
  INITIAL_TEMPLATES,
} from './mockData';
import { Contact, Conversation, MessageTemplate, ChatMessage } from './types';
import { Menu, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('contacts');
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [templates, setTemplates] = useState<MessageTemplate[]>(INITIAL_TEMPLATES);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv1');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Total unread count for Inbox badge
  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Handler: When clicking "Open WhatsApp conversation" on contact
  const handleOpenWhatsAppFromContact = (contact: Contact) => {
    let existingConv = conversations.find(
      (c) => c.phone === contact.phone || c.contactId === contact.id
    );

    if (!existingConv) {
      existingConv = {
        id: `conv_${Date.now()}`,
        contactId: contact.id,
        name: contact.name,
        phone: contact.phone,
        category: contact.category,
        status: contact.status,
        unreadCount: 0,
        isOnline: true,
        initials: contact.initials,
        avatarBg: contact.avatarBg,
        avatarColor: contact.avatarColor,
        messages: [
          {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: `Hi ${contact.name.split(' ')[0]}, thanks for reaching out to Ziqx! How can I assist you with ${contact.interestedService || contact.category}?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateGroup: 'Today',
            status: 'read',
          },
        ],
      };
      setConversations([existingConv, ...conversations]);
    }

    setActiveConversationId(existingConv.id);
    setActiveTab('inbox');
    setMobileMenuOpen(false);
  };

  // Handler: Sending message in Inbox
  const handleSendMessage = (
    convId: string,
    text: string,
    isTemplate = false,
    templateName?: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: timeStr,
      dateGroup: 'Today',
      isTemplate,
      templateName,
      status: 'read',
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: 0,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Realistic auto-reply simulation for contact after 1.5s
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const replies = [
              'Thanks for the quick response! That sounds good.',
              'Received! Let me review this with our team and get back to you shortly.',
              'Perfect, could you share the link or schedule a quick demo call?',
              'Great, that works for us!',
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const replyMsg: ChatMessage = {
              id: `reply_${Date.now()}`,
              sender: 'contact',
              text: randomReply,
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              dateGroup: 'Today',
            };
            return {
              ...c,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Handler: Send Template to Contact from Templates tab
  const handleSendTemplateToContact = (
    template: MessageTemplate,
    contact: Contact,
    variables: Record<string, string>
  ) => {
    let populatedText = template.body;
    template.variables.forEach((v) => {
      const val = variables[v.key] || v.defaultValue;
      populatedText = populatedText.replace(new RegExp(`{{${v.key}}}`, 'g'), val);
    });

    let conv = conversations.find(
      (c) => c.phone === contact.phone || c.contactId === contact.id
    );

    if (!conv) {
      conv = {
        id: `conv_${Date.now()}`,
        contactId: contact.id,
        name: contact.name,
        phone: contact.phone,
        category: contact.category,
        status: contact.status,
        unreadCount: 0,
        isOnline: true,
        initials: contact.initials,
        avatarBg: contact.avatarBg,
        avatarColor: contact.avatarColor,
        messages: [],
      };
      setConversations([conv, ...conversations]);
    }

    handleSendMessage(conv.id, populatedText, true, template.name);
    setActiveConversationId(conv.id);
    setActiveTab('inbox');
  };

  // Handler: Start New Chat
  const handleStartNewChat = (phone: string, name: string) => {
    const initials = name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      contactId: `c_${Date.now()}`,
      name,
      phone,
      category: 'General Inquiry',
      status: 'New',
      unreadCount: 0,
      isOnline: true,
      initials: initials || 'CO',
      avatarBg: '#ddf3e5',
      avatarColor: '#0b5c46',
      messages: [
        {
          id: `m_${Date.now()}`,
          sender: 'agent',
          text: `Hi ${name}, welcome to Ziqx! How can our team help your business today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateGroup: 'Today',
          status: 'read',
        },
      ],
    };

    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
  };

  // Handler: Start Broadcast Campaign
  const handleStartBroadcast = (
    name: string,
    categories: string[],
    labels: string[],
    matchedCount: number
  ) => {
    const newConv: Conversation = {
      id: `conv_bc_${Date.now()}`,
      contactId: `bc_${Date.now()}`,
      name: name,
      phone: `${matchedCount} contacts`,
      category: categories.join(', ') || 'Broadcast',
      status: 'Qualified',
      unreadCount: 0,
      isOnline: true,
      initials: 'BC',
      avatarBg: '#ddf3e5',
      avatarColor: '#0b5c46',
      messages: [
        {
          id: `m_${Date.now()}`,
          sender: 'agent',
          text: `[Broadcast Campaign] ${name}\nCategories: ${categories.join(', ')}${
            labels.length ? ` · Labels: ${labels.join(', ')}` : ''
          }\nRecipients: ${matchedCount} contacts.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateGroup: 'Today',
          status: 'sent',
        },
      ],
    };

    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
  };

  return (
    <div className="h-screen w-screen bg-[#f4f3ef] p-3 sm:p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5 overflow-hidden text-[#1a1a18]">
      {/* Mobile Top Bar (visible on small screens) */}
      <div className="md:hidden flex items-center justify-between pb-2 border-b border-[#e5e5e0]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-white border border-[#e5e5e0] flex items-center justify-center text-[#1a1a18]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-extrabold text-base tracking-tight">ziqx connect</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1a1a18] text-white capitalize">
          {activeTab}
        </span>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-xs flex">
          <div className="w-64 bg-white h-full p-4 flex flex-col justify-between shadow-modal">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(t) => {
                setActiveTab(t);
                setMobileMenuOpen(false);
              }}
              inboxBadgeCount={totalUnread || 4}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(t) => setActiveTab(t)}
          inboxBadgeCount={totalUnread || 4}
        />
      </div>

      {/* Main Screen Content */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        {activeTab === 'contacts' && (
          <ContactsPage
            contacts={contacts}
            onUpdateContact={(updated) =>
              setContacts((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              )
            }
            onAddContact={(newContact) =>
              setContacts([newContact, ...contacts])
            }
            onImportContacts={(imported) =>
              setContacts([...imported, ...contacts])
            }
            onOpenWhatsApp={handleOpenWhatsAppFromContact}
            selectedContactId={selectedContactId}
          />
        )}

        {activeTab === 'inbox' && (
          <InboxPage
            conversations={conversations}
            templates={templates}
            contacts={contacts}
            onSendMessage={handleSendMessage}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => setActiveConversationId(id)}
            onOpenContactDetails={(contact) => {
              setSelectedContactId(contact.id);
              setActiveTab('contacts');
            }}
            onStartNewChat={handleStartNewChat}
            onOpenWhatsApp={handleOpenWhatsAppFromContact}
            onStartBroadcast={handleStartBroadcast}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesPage
            templates={templates}
            contacts={contacts}
            onSendTemplateToContact={handleSendTemplateToContact}
          />
        )}

        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
};

export default App;
