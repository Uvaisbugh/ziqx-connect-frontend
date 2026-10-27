'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@ziqx/react-comps';
import {
  Search,
  SlidersHorizontal,
  MessageSquarePlus,
  UserRound,
  PanelRight,
  X,
  Paperclip,
  FileText,
  SendHorizontal,
  Check,
  CheckCheck,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { Conversation, MessageTemplate, Contact } from '@/types';
import { NewMessageModal } from './NewMessageModal';

interface InboxPageProps {
  conversations: Conversation[];
  templates: MessageTemplate[];
  contacts: Contact[];
  onSendMessage: (conversationId: string, text: string, isTemplate?: boolean, templateName?: string) => void;
  activeConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onOpenContactDetails?: (contact: Contact) => void;
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
  onOpenContactDetails,
  onStartNewChat,
  onOpenWhatsApp,
  onStartBroadcast,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeConversationId || conversations[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversationId) {
      setSelectedId(activeConversationId);
    }
  }, [activeConversationId]);

  const activeConv = conversations.find((c) => c.id === selectedId) || conversations[0];

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

  const openContact = () => {
    if (!activeConv) return;
    const match = contacts.find(
      (c) => c.phone === activeConv.phone || c.name === activeConv.name
    );
    if (match && onOpenContactDetails) {
      onOpenContactDetails(match);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-[18px] shrink-0">
        <div>
          <h1 className="text-[30px] font-bold leading-[33px] tracking-[-0.84px] text-ziqx-dark">
            Inbox
          </h1>
          <p className="mt-[7px] text-[14.5px] leading-[19px] text-ziqx-muted">
            WhatsApp conversations with your contacts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            prefix={Search}
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            className="!border-transparent !shadow-none hover:!border-transparent focus:!border-transparent"
            containerClassName="w-[220px]"
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
          >
            New message
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        <div className="flex h-full w-[331px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-ziqx-card">
          <div className="curve-scroll flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-ziqx-muted">
                No chats found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedId(conv.id);
                      if (onSelectConversation) onSelectConversation(conv.id);
                    }}
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
          <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-ziqx-card">
            <div className="flex h-[67px] shrink-0 items-center justify-between bg-ziqx-card px-[18px]">
              <div className="flex items-center min-w-0">
                <div
                  className="size-[42px] rounded-full flex items-center justify-center text-[14px] font-bold leading-[19px] shrink-0"
                  style={{
                    backgroundColor: activeConv.avatarBg,
                    color: activeConv.avatarColor,
                  }}
                >
                  {activeConv.initials}
                </div>
                <div className="ml-3 min-w-0">
                  <h3 className="truncate text-[15.5px] font-bold leading-[20.9px] tracking-[-0.16px] text-ziqx-dark">
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
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={openContact}
                  className="flex size-9 items-center justify-center rounded-[10px] bg-ziqx-bg text-ziqx-dark transition-colors hover:bg-ziqx-border"
                  title="Contact details"
                >
                  <UserRound className="w-4 h-4" />
                </button>
                <button
                  className="flex size-9 items-center justify-center rounded-[10px] bg-ziqx-bg text-ziqx-dark transition-colors hover:bg-ziqx-border"
                  title="Sidebar info"
                >
                  <PanelRight className="w-4 h-4" />
                </button>
                <button
                  className="flex size-9 items-center justify-center rounded-[10px] bg-ziqx-bg text-ziqx-dark transition-colors hover:bg-ziqx-border"
                  title="Close conversation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="curve-scroll flex-1 overflow-y-auto bg-ziqx-thread px-6 pb-4 pt-7">
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
                        className={`max-w-[min(480px,78%)] px-3 pb-1.5 pt-2 text-ziqx-dark ${
                          isAgent
                            ? 'rounded-bl-[14px] rounded-br-[4px] rounded-tl-[14px] rounded-tr-[14px] bg-ziqx-green-light'
                            : 'rounded-bl-[4px] rounded-br-[14px] rounded-tl-[14px] rounded-tr-[14px] bg-ziqx-card'
                        }`}
                      >
                        {isAgent && msg.isTemplate && (
                          <div className="mb-0.5 flex items-center gap-[5px] text-[11px] font-bold leading-[15px] text-ziqx-green">
                            <FileText className="size-3 shrink-0" />
                            <span>Template · {msg.templateName || 'welcome_new_lead'}</span>
                          </div>
                        )}
                        <p className="text-[14px] leading-[20.3px] whitespace-pre-wrap">{msg.text}</p>
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

            <div className="relative shrink-0 bg-ziqx-card px-4 py-[11px]">
              {isTemplateDropdownOpen && (
                <div className="curve-scroll absolute bottom-full left-4 z-30 mb-2 max-h-72 w-80 overflow-y-auto rounded-2xl bg-ziqx-card p-3 shadow-modal">
                  <div className="mb-2 flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-ziqx-dark">
                      Choose a Message Template
                    </span>
                    <button
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
                        onClick={() => handleSelectTemplate(tpl)}
                        className="w-full rounded-xl p-2 text-left transition-colors hover:bg-ziqx-bg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ziqx-green">
                            {tpl.name}
                          </span>
                          <span className="rounded-full bg-ziqx-bg px-1.5 py-0.5 text-[10px] text-ziqx-secondary">
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

              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  bgColor={ziqxUi.canvas}
                  fgColor={ziqxUi.dark}
                  prefix={Paperclip}
                  aria-label="Attach file"
                  title="Attach file"
                />

                <Button
                  type="button"
                  variant="ghost"
                  bgColor={ziqxUi.canvas}
                  fgColor={ziqxUi.dark}
                  prefix={FileText}
                  onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
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
                />
              </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-[20px] bg-ziqx-card text-[13px] text-ziqx-muted">
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
            setSelectedId(existing.id);
            if (onSelectConversation) onSelectConversation(existing.id);
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
              setSelectedId(existing.id);
              if (onSelectConversation) onSelectConversation(existing.id);
            }
          }
        }}
        onStartBroadcast={(name, categories, labels, count) => {
          if (onStartBroadcast) {
            onStartBroadcast(name, categories, labels, count);
          }
        }}
      />
    </div>
  );
};
