'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@ziqx/react-comps';
import {
  Search,
  SlidersHorizontal,
  MessageSquarePlus,
  UserRound,
  X,
  Paperclip,
  FileText,
  SendHorizontal,
  Check,
  CheckCheck,
  ChevronLeft,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { Conversation, MessageTemplate, Contact } from '@/types';
import { ContactDrawer } from '@/components/contacts/ContactDrawer';
import { NewMessageModal } from './NewMessageModal';

function contactFromConversation(conv: Conversation): Contact {
  return {
    id: conv.contactId || conv.id,
    name: conv.name,
    phone: conv.phone,
    email: '',
    category: conv.category,
    label: null,
    savedOn: '—',
    leadSource: 'WhatsApp',
    campaign: '—',
    interestedService: conv.category,
    assignedAgent: '—',
    added: '—',
    lastInteraction: '—',
    nextFollowUp: '—',
    tags: [],
    notes: [],
    initials: conv.initials,
    avatarBg: conv.avatarBg,
    avatarColor: conv.avatarColor,
    consent: true,
    status: conv.status,
  };
}

interface InboxPageProps {
  conversations: Conversation[];
  templates: MessageTemplate[];
  contacts: Contact[];
  onSendMessage: (conversationId: string, text: string, isTemplate?: boolean, templateName?: string) => void;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onCloseConversation?: () => void;
  onUpdateContact?: (contact: Contact) => void;
  onStartNewChat?: (phone: string, name: string) => void;
  onOpenWhatsApp?: (contact: Contact) => void;
  onStartBroadcast?: (name: string, categories: string[], labels: string[], matchedCount: number) => void;
}

export const InboxPage: React.FC<InboxPageProps> = ({
  conversations,
  templates,
  contacts,
  onSendMessage,
  activeConversationId,
  onSelectConversation,
  onCloseConversation,
  onUpdateContact,
  onStartNewChat,
  onOpenWhatsApp,
  onStartBroadcast,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeConversationId || '');
  const [mobilePane, setMobilePane] = useState<'list' | 'thread'>(
    activeConversationId ? 'thread' : 'list'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailsContact, setDetailsContact] = useState<Contact | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      setSelectedId(activeConversationId);
      setMobilePane('thread');
      return;
    }
    setSelectedId('');
    setMobilePane('list');
  }, [activeConversationId]);

  const activeConv = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    let populated = template.body;
    template.variables.forEach((v) => {
      populated = populated.replace(`{{${v.key}}}`, v.defaultValue);
    });
    if (activeConv) {
      onSendMessage(activeConv.id, populated, true, template.name);
    }
    setIsTemplateDropdownOpen(false);
  };

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setMobilePane('thread');
    if (onSelectConversation) onSelectConversation(id);
  };

  const closeConversation = () => {
    setSelectedId('');
    setMobilePane('list');
    setIsTemplateDropdownOpen(false);
    setDetailsContact(null);
    if (onCloseConversation) onCloseConversation();
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusTone: Record<Conversation['status'], string> = {
    Qualified: 'bg-ziqx-badge-purple text-ziqx-badge-purple-text',
    New: 'bg-ziqx-badge-blue text-ziqx-badge-blue-text',
    Contacted: 'bg-ziqx-badge-yellow text-ziqx-badge-yellow-text',
    Converted: 'bg-ziqx-badge-green text-ziqx-badge-green-text',
    Lost: 'bg-ziqx-badge-red text-ziqx-badge-red-text',
  };

  const resolveContact = (conv: Conversation): Contact => {
    const byId = contacts.find((c) => c.id === conv.contactId);
    if (byId) return byId;
    const clean = conv.phone.replace(/\D/g, '').slice(-10);
    const byPhone = contacts.find(
      (c) => c.phone.replace(/\D/g, '').slice(-10) === clean
    );
    if (byPhone) return byPhone;
    const byName = contacts.find((c) => c.name === conv.name);
    if (byName) return byName;
    return contactFromConversation(conv);
  };

  const openContactDetails = () => {
    if (!activeConv) return;
    setDetailsContact(resolveContact(activeConv));
  };

  const showList = mobilePane === 'list';
  const showThread = mobilePane === 'thread';

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-3 sm:mb-[18px] shrink-0">
        <div className="min-w-0">
          <h1 className="text-[24px] sm:text-[30px] font-bold leading-[28px] sm:leading-[33px] tracking-[-0.84px] text-ziqx-dark">
            Inbox
          </h1>
          <p className="mt-[7px] text-[13px] sm:text-[14.5px] leading-[19px] text-ziqx-muted">
            WhatsApp conversations with your contacts.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            prefix={Search}
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            className="!border-transparent !shadow-none hover:!border-transparent focus:!border-transparent"
            containerClassName="w-full sm:w-[220px] flex-1 sm:flex-none min-w-0"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              bgColor={ziqxUi.canvas}
              fgColor={statusFilter !== 'all' ? ziqxUi.green : ziqxUi.dark}
              prefix={SlidersHorizontal}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters
            </Button>

            {filterOpen && (
              <div className="absolute right-0 z-30 mt-2 w-48 rounded-2xl bg-ziqx-card p-2.5 shadow-modal">
                <p className="px-2 py-1 text-xs font-bold text-ziqx-dark">Filter by status</p>
                {['all', 'New', 'Qualified', 'Contacted', 'Converted', 'Lost'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st);
                      setFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${
                      statusFilter === st
                        ? 'bg-ziqx-green-lighter font-bold text-ziqx-green'
                        : 'text-ziqx-secondary hover:bg-ziqx-bg'
                    }`}
                  >
                    <span>{st === 'all' ? 'All statuses' : st}</span>
                    {statusFilter === st && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            type="button"
            bgColor={ziqxUi.green}
            fgColor={ziqxUi.greenFg}
            prefix={MessageSquarePlus}
            onClick={() => setIsNewChatModalOpen(true)}
            aria-label="New message"
            className="sm:hidden"
            size="icon"
          />
          <Button
            type="button"
            bgColor={ziqxUi.green}
            fgColor={ziqxUi.greenFg}
            prefix={MessageSquarePlus}
            onClick={() => setIsNewChatModalOpen(true)}
            className="hidden sm:inline-flex"
          >
            New message
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0 min-w-0">
        <div
          className={`${
            showList ? 'flex' : 'hidden'
          } lg:flex h-full w-full lg:w-[300px] xl:w-[331px] lg:shrink-0 flex-col overflow-hidden rounded-[20px] bg-ziqx-card min-w-0`}
        >
          <div className="curve-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-ziqx-muted">
                No chats found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = selectedId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`flex h-16 w-full cursor-pointer items-center rounded-[14px] pl-[10px] pr-[10px] transition-colors ${
                      isActive ? 'bg-ziqx-border' : 'hover:bg-ziqx-bg'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="size-[42px] rounded-full flex items-center justify-center text-[14px] font-bold leading-[19px]"
                        style={{
                          backgroundColor: conv.avatarBg,
                          color: conv.avatarColor,
                        }}
                      >
                        {conv.initials}
                      </div>
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 size-[11px] rounded-full bg-ziqx-badge-green-text ring-2 ring-ziqx-card" />
                      )}
                    </div>

                    <div className="ml-3 min-w-0 flex-1">
                      <p
                        className={`truncate text-[14px] leading-[18.2px] text-ziqx-dark ${
                          conv.unreadCount > 0 ? 'font-bold' : 'font-semibold'
                        }`}
                      >
                        {conv.name}
                      </p>
                      <span
                        className={`mt-1 inline-flex h-[19px] items-center rounded-full px-2 text-[11px] font-bold leading-[14.3px] ${statusTone[conv.status]}`}
                      >
                        {conv.status}
                      </span>
                    </div>

                    {conv.unreadCount > 0 && (
                      <div className="ml-2 flex size-[19px] shrink-0 items-center justify-center rounded-full bg-ziqx-green text-[11px] font-bold text-white">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {activeConv ? (
          <div
            className={`${
              showThread ? 'flex' : 'hidden'
            } lg:flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-ziqx-card`}
          >
            <div className="flex h-[67px] shrink-0 items-center justify-between bg-ziqx-card px-3 sm:px-[18px] gap-2">
              <div className="flex items-center min-w-0">
                <button
                  type="button"
                  onClick={() => setMobilePane('list')}
                  className="lg:hidden mr-1.5 flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-ziqx-bg text-ziqx-dark transition-colors hover:bg-ziqx-border"
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={openContactDetails}
                  className="size-[42px] rounded-full flex items-center justify-center text-[14px] font-bold leading-[19px] shrink-0 transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: activeConv.avatarBg,
                    color: activeConv.avatarColor,
                  }}
                  aria-label={`View ${activeConv.name} details`}
                >
                  {activeConv.initials}
                </button>
                <button
                  type="button"
                  onClick={openContactDetails}
                  className="ml-3 min-w-0 text-left"
                >
                  <h3 className="truncate text-[15.5px] font-bold leading-[20.9px] tracking-[-0.16px] text-ziqx-dark hover:text-ziqx-green transition-colors">
                    {activeConv.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-[12.5px] leading-[16.9px] text-ziqx-muted">
                    <span className="truncate">{activeConv.phone}</span>
                    {activeConv.isOnline && (
                      <>
                        <span className="size-[3px] shrink-0 rounded-full bg-ziqx-dim" />
                        <span className="shrink-0 font-semibold text-ziqx-green">online</span>
                      </>
                    )}
                  </p>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={openContactDetails}
                  className="flex size-9 items-center justify-center rounded-[10px] bg-ziqx-bg text-ziqx-dark transition-colors hover:bg-ziqx-border"
                  title="Contact details"
                  aria-label="Contact details"
                >
                  <UserRound className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={closeConversation}
                  className="flex size-9 items-center justify-center rounded-[10px] bg-ziqx-bg text-ziqx-dark transition-colors hover:bg-ziqx-border"
                  title="Close conversation"
                  aria-label="Close conversation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="curve-scroll flex-1 overflow-y-auto bg-ziqx-thread px-3 sm:px-6 pb-4 pt-7">
              {activeConv.messages.map((msg, index) => {
                const isFirstOfGroup =
                  index === 0 ||
                  activeConv.messages[index - 1].dateGroup !== msg.dateGroup;
                const isAgent = msg.sender === 'agent';

                return (
                  <React.Fragment key={msg.id}>
                    {isFirstOfGroup && (
                      <div className={`flex justify-center ${index === 0 ? 'mb-2.5' : 'my-4'}`}>
                        <span className="inline-flex h-[23px] items-center rounded-[10px] bg-ziqx-border px-3 text-[11.5px] font-bold leading-[15px] text-ziqx-secondary">
                          {msg.dateGroup}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-1.5`}>
                      <div
                        className={`max-w-[min(480px,85%)] sm:max-w-[min(480px,78%)] px-3 pb-1.5 pt-2 text-ziqx-dark ${
                          isAgent
                            ? 'rounded-bl-[14px] rounded-br-[4px] rounded-tl-[14px] rounded-tr-[14px] bg-ziqx-green-light'
                            : 'rounded-bl-[4px] rounded-br-[14px] rounded-tl-[14px] rounded-tr-[14px] bg-ziqx-card'
                        }`}
                      >
                        {isAgent && msg.isTemplate && (
                          <div className="mb-0.5 flex items-center gap-[5px] text-[11px] font-bold leading-[15px] text-ziqx-green">
                            <FileText className="size-3 shrink-0" />
                            <span className="truncate">Template · {msg.templateName || 'welcome_new_lead'}</span>
                          </div>
                        )}
                        <p className="text-[14px] leading-[20.3px] whitespace-pre-wrap break-words">{msg.text}</p>
                        <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] leading-[15px] text-ziqx-muted">
                          <span>{msg.timestamp}</span>
                          {isAgent &&
                            (msg.status === 'read' || msg.status === 'delivered' ? (
                              <CheckCheck
                                className={`size-3.5 ${
                                  msg.status === 'read'
                                    ? 'text-ziqx-badge-blue-text'
                                    : 'text-ziqx-muted'
                                }`}
                              />
                            ) : (
                              <Check className="size-3.5 text-ziqx-muted" />
                            ))}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="relative shrink-0 bg-ziqx-card px-2 sm:px-4 py-[11px]">
              {isTemplateDropdownOpen && (
                <div className="curve-scroll absolute bottom-full left-2 sm:left-4 z-30 mb-2 max-h-72 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl bg-ziqx-card p-3 shadow-modal">
                  <div className="mb-2 flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-ziqx-dark">
                      Choose a Message Template
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsTemplateDropdownOpen(false)}
                      className="text-ziqx-muted hover:text-ziqx-dark"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className="w-full rounded-xl p-2 text-left transition-colors hover:bg-ziqx-bg"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-ziqx-green truncate">
                            {tpl.name}
                          </span>
                          <span className="rounded-full bg-ziqx-bg px-1.5 py-0.5 text-[10px] text-ziqx-secondary shrink-0">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-ziqx-secondary">
                          {tpl.body}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  bgColor={ziqxUi.canvas}
                  fgColor={ziqxUi.dark}
                  prefix={Paperclip}
                  aria-label="Attach file"
                  title="Attach file"
                  className="shrink-0"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  bgColor={ziqxUi.canvas}
                  fgColor={ziqxUi.dark}
                  prefix={FileText}
                  onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                  aria-label="Template"
                  title="Template"
                  className="sm:hidden shrink-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  bgColor={ziqxUi.canvas}
                  fgColor={ziqxUi.dark}
                  prefix={FileText}
                  onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                  className="hidden sm:inline-flex shrink-0"
                >
                  Template
                </Button>

                <Input
                  type="text"
                  placeholder="Type a message"
                  value={inputText}
                  bgColor={ziqxUi.canvas}
                  fgColor={ziqxUi.dark}
                  className="!border-transparent !shadow-none hover:!border-transparent focus:!border-transparent"
                  containerClassName="flex-1 min-w-0"
                  onChange={(e) => setInputText(e.target.value)}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputText.trim()}
                  bgColor={inputText.trim() ? ziqxUi.green : ziqxUi.dim}
                  fgColor={ziqxUi.greenFg}
                  prefix={SendHorizontal}
                  aria-label="Send message"
                  className="shrink-0"
                />
              </form>
            </div>
          </div>
        ) : (
          <div
            className={`${
              showThread ? 'flex' : 'hidden'
            } lg:flex flex-1 items-center justify-center rounded-[20px] bg-ziqx-card text-[13px] text-ziqx-muted px-4 text-center`}
          >
            Select a conversation to start chatting.
          </div>
        )}
      </div>

      <NewMessageModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        contacts={contacts}
        conversations={conversations}
        onStartMessagingNumber={(phone, name) => {
          const clean = phone.replace(/\D/g, '').slice(-10);
          const existing = conversations.find(
            (c) => c.phone.replace(/\D/g, '').slice(-10) === clean
          );
          if (existing) {
            selectConversation(existing.id);
          } else if (onStartNewChat) {
            onStartNewChat(phone, name || phone);
          }
        }}
        onSelectContact={(contact) => {
          if (onOpenWhatsApp) {
            onOpenWhatsApp(contact);
          } else {
            const existing = conversations.find(
              (c) => c.phone === contact.phone || c.contactId === contact.id
            );
            if (existing) {
              selectConversation(existing.id);
            }
          }
        }}
        onStartBroadcast={(name, categories, labels, count) => {
          if (onStartBroadcast) {
            onStartBroadcast(name, categories, labels, count);
          }
        }}
      />

      <ContactDrawer
        contact={detailsContact}
        onClose={() => setDetailsContact(null)}
        onOpenWhatsApp={(contact) => {
          setDetailsContact(null);
          if (onOpenWhatsApp) {
            onOpenWhatsApp(contact);
          }
        }}
        onUpdateContact={(updated) => {
          setDetailsContact(updated);
          if (onUpdateContact) onUpdateContact(updated);
        }}
      />
    </div>
  );
};
