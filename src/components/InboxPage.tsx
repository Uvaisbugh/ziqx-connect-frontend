import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  UserRound,
  PanelRight,
  X,
  Paperclip,
  FileText,
  Send,
  Check,
  CheckCheck,
  Smile,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { Conversation, ChatMessage, MessageTemplate, Contact } from '../types';
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
  const [newChatPhone, setNewChatPhone] = useState('+91 ');
  const [newChatName, setNewChatName] = useState('');
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

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim() || !newChatName.trim()) return;
    if (onStartNewChat) {
      onStartNewChat(newChatPhone.trim(), newChatName.trim());
    }
    setIsNewChatModalOpen(false);
    setNewChatPhone('+91 ');
    setNewChatName('');
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status: Conversation['status']) => {
    switch (status) {
      case 'Qualified':
        return 'bg-[#efeafb] text-[#6b38c2]';
      case 'New':
        return 'bg-[#e4eefb] text-[#1e60b5]';
      case 'Contacted':
        return 'bg-[#fef3c7] text-[#b45309]';
      case 'Converted':
        return 'bg-[#dcfce7] text-[#15803d]';
      case 'Lost':
        return 'bg-[#fee2e2] text-[#b91c1c]';
      default:
        return 'bg-[#f0eeea] text-[#5b5b5a]';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 px-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a18] tracking-tight">
            Inbox
          </h1>
          <p className="text-xs text-[#8f8f8e] mt-0.5">
            WhatsApp conversations with your contacts.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8f8f8e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-[#e5e5e0] text-xs rounded-xl pl-8 pr-3 py-2 text-[#1a1a18] placeholder-[#8f8f8e] focus:outline-none focus:border-[#0b5c46] w-48 sm:w-56 transition-colors"
            />
          </div>

          {/* Filters button */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`h-9 px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                statusFilter !== 'all' || filterOpen
                  ? 'border-[#0b5c46] bg-[#ddf3e5]/30 text-[#0b5c46]'
                  : 'border-[#e5e5e0] bg-white text-[#5b5b5a] hover:bg-[#faf9f7]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-[#efede8] rounded-2xl p-2.5 shadow-modal z-30">
                <p className="text-xs font-bold text-[#1a1a18] px-2 py-1">Filter by status</p>
                {['all', 'New', 'Qualified', 'Contacted', 'Converted', 'Lost'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      statusFilter === st
                        ? 'bg-[#f4f3ef] font-bold text-[#0b5c46]'
                        : 'text-[#5b5b5a] hover:bg-[#faf9f7]'
                    }`}
                  >
                    <span>{st === 'all' ? 'All statuses' : st}</span>
                    {statusFilter === st && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New message button */}
          <button
            onClick={() => setIsNewChatModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-[#0b5c46] hover:bg-[#084836] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New message</span>
          </button>
        </div>
      </div>

      {/* Main Container Card (Split: Thread List + Chat View) */}
      <div className="flex-1 bg-white rounded-3xl border border-[#efede8] shadow-sm flex overflow-hidden">
        {/* Left: Conversations Thread List */}
        <div className="w-64 sm:w-72 md:w-80 border-r border-[#efede8] flex flex-col h-full bg-white shrink-0">
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8f8f8e]">
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
                    className={`group w-full p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#f4f3ef]'
                        : 'hover:bg-[#faf9f7]'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Avatar with Online Green Dot */}
                      <div className="relative shrink-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor: conv.avatarBg,
                            color: conv.avatarColor,
                          }}
                        >
                          {conv.initials}
                        </div>
                        {conv.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full ring-2 ring-white" />
                        )}
                      </div>

                      {/* Name & Status Pill */}
                      <div className="flex flex-col overflow-hidden text-left">
                        <span className="text-xs font-bold text-[#1a1a18] truncate leading-tight">
                          {conv.name}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getStatusBadgeStyle(
                              conv.status
                            )}`}
                          >
                            {conv.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Unread Message Badge */}
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-[#0b5c46] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            {/* Chat Top Header */}
            <div className="p-3.5 px-6 border-b border-[#f0eeea] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: activeConv.avatarBg,
                    color: activeConv.avatarColor,
                  }}
                >
                  {activeConv.initials}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1a1a18] leading-tight">
                    {activeConv.name}
                  </h3>
                  <p className="text-[11px] text-[#5b5b5a] flex items-center gap-1.5 mt-0.5">
                    <span>{activeConv.phone}</span>
                    <span>·</span>
                    <span className="text-[#0b5c46] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full inline-block" />
                      online
                    </span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const match = contacts.find(
                      (c) => c.phone === activeConv.phone || c.name === activeConv.name
                    );
                    if (match && onOpenContactDetails) {
                      onOpenContactDetails(match);
                    }
                  }}
                  className="w-8 h-8 rounded-xl border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:bg-[#f4f3ef] transition-colors"
                  title="Contact details"
                >
                  <UserRound className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 rounded-xl border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:bg-[#f4f3ef] transition-colors"
                  title="Sidebar info"
                >
                  <PanelRight className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 rounded-xl border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:bg-[#f4f3ef] transition-colors"
                  title="Close conversation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fbfbfa]/50">
              {/* Grouped messages by date */}
              {activeConv.messages.map((msg, index) => {
                const isFirstOfGroup =
                  index === 0 ||
                  activeConv.messages[index - 1].dateGroup !== msg.dateGroup;

                return (
                  <React.Fragment key={msg.id}>
                    {isFirstOfGroup && (
                      <div className="flex justify-center my-3">
                        <span className="bg-[#f0eeea] text-[#6b6b69] text-[10px] font-semibold px-3 py-1 rounded-full shadow-2xs">
                          {msg.dateGroup}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex ${
                        msg.sender === 'agent' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender === 'agent' ? (
                        /* Outgoing Agent Bubble (WhatsApp light mint green) */
                        <div className="max-w-[75%] sm:max-w-[65%] rounded-2xl p-3.5 bg-[#ddf3e5] text-[#1a1a18] shadow-xs text-xs space-y-1 relative">
                          {msg.isTemplate && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0b5c46] pb-1 border-b border-[#0b5c46]/10 mb-1">
                              <FileText className="w-3 h-3" />
                              <span>Template · {msg.templateName || 'welcome_new_lead'}</span>
                            </div>
                          )}
                          <p className="leading-relaxed text-xs">{msg.text}</p>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-[#5b5b5a] pt-0.5">
                            <span>{msg.timestamp}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
                          </div>
                        </div>
                      ) : (
                        /* Incoming User Bubble (White card) */
                        <div className="max-w-[75%] sm:max-w-[65%] rounded-2xl p-3.5 bg-white text-[#1a1a18] border border-[#efede8] shadow-xs text-xs space-y-1">
                          <p className="leading-relaxed text-xs">{msg.text}</p>
                          <div className="flex items-center justify-end text-[10px] text-[#8f8f8e] pt-0.5">
                            <span>{msg.timestamp}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Composer */}
            <div className="p-3.5 px-5 border-t border-[#f0eeea] bg-white relative shrink-0">
              {/* Template Quick Picker Popover */}
              {isTemplateDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-6 w-80 bg-white border border-[#efede8] rounded-2xl p-3 shadow-modal z-30 max-h-72 overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0eeea]">
                    <span className="text-xs font-bold text-[#1a1a18]">
                      Choose a Message Template
                    </span>
                    <button
                      onClick={() => setIsTemplateDropdownOpen(false)}
                      className="text-[#8f8f8e] hover:text-[#1a1a18]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#f4f3ef] transition-colors border border-transparent hover:border-[#e5e5e0]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#0b5c46]">
                            {tpl.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f0eeea] text-[#5b5b5a]">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5b5b5a] line-clamp-1 mt-0.5">
                          {tpl.body}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-center gap-2">
                {/* Paperclip */}
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:bg-[#f4f3ef] transition-colors shrink-0"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Template Button */}
                <button
                  type="button"
                  onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                  className="h-9 px-3 rounded-xl border border-[#e5e5e0] flex items-center gap-1.5 text-xs font-semibold text-[#1a1a18] hover:bg-[#f4f3ef] transition-colors shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-[#5b5b5a]" />
                  <span>Template</span>
                </button>

                {/* Text input */}
                <input
                  type="text"
                  placeholder="Type a message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none text-[#1a1a18] placeholder-[#8f8f8e] transition-colors"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-9 h-9 rounded-full bg-[#b1b0ae] hover:bg-[#0b5c46] disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-[#8f8f8e]">
            Select a conversation to start chatting.
          </div>
        )}
      </div>

      {/* New Message Modal with Enter number, From contacts, and Broadcast modes */}
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
