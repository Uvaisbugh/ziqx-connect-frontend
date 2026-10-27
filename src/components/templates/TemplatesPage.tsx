'use client';

import React, { useState } from 'react';
import { Button, Input } from '@ziqx/react-comps';
import {
  Search,
  SlidersHorizontal,
  RotateCw,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  FileText,
  CheckCheck,
  Send,
  Copy,
  ExternalLink,
  Info,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { MessageTemplate, Contact } from '@/types';

interface TemplatesPageProps {
  templates: MessageTemplate[];
  contacts: Contact[];
  onSendTemplateToContact: (template: MessageTemplate, contact: Contact, variables: Record<string, string>) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({
  templates,
  contacts,
  onSendTemplateToContact,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Utility' | 'Marketing'>('all');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    name: 'Anjali',
    service: 'Website Development',
    agent: 'Jabir',
    plan: 'Starter Commerce',
    date: '1 Nov',
    time: '11:00 AM',
    link: 'ziqx.cc/p/8921',
    website: 'yourbusiness.com',
    invoice_id: 'INV-4402',
    amount: '₹25,000',
    due_date: '15 Oct',
  });
  const [copied, setCopied] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedContactForSend, setSelectedContactForSend] = useState<Contact | null>(
    contacts[0] ?? null
  );
  const [mobilePane, setMobilePane] = useState<'list' | 'preview'>('list');

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const selectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setMobilePane('preview');
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: MessageTemplate['status']) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ddf3e5] text-[#0b5c46]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#b45309]">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fee2e2] text-[#b91c1c]">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      case 'Paused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0eeea] text-[#5b5b5a]">
            <PauseCircle className="w-3 h-3" />
            <span>Paused</span>
          </span>
        );
      default: {
        const _exhaustive: never = status;
        void _exhaustive;
        return null;
      }
    }
  };

  // Replace variables in body with styled highlights for preview
  const renderPreviewContent = () => {
    if (!activeTemplate) return null;
    let parts: (string | React.ReactNode)[] = [activeTemplate.body];

    activeTemplate.variables.forEach((v) => {
      const val = variableValues[v.key] || v.defaultValue;
      const targetToken = `{{${v.key}}}`;

      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach((p) => {
        if (typeof p === 'string') {
          const split = p.split(targetToken);
          split.forEach((seg, i) => {
            if (i > 0) {
              newParts.push(
                <span key={`${v.key}_${i}`} className="font-bold text-[#0b5c46]">
                  {val}
                </span>
              );
            }
            if (seg) newParts.push(seg);
          });
        } else {
          newParts.push(p);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  // Replace variables for plain text copy
  const getPopulatedText = () => {
    if (!activeTemplate) return '';
    let text = activeTemplate.body;
    activeTemplate.variables.forEach((v) => {
      const val = variableValues[v.key] || v.defaultValue;
      text = text.replace(new RegExp(`{{${v.key}}}`, 'g'), val);
    });
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getPopulatedText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmSend = () => {
    if (activeTemplate && selectedContactForSend) {
      onSendTemplateToContact(activeTemplate, selectedContactForSend, variableValues);
      setIsSendModalOpen(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 px-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a18] tracking-tight">
            Templates
          </h1>
          <p className="text-xs text-[#8f8f8e] mt-0.5">
            {templates.length} templates synced from WhatsApp Manager
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search templates"
            value={searchQuery}
            prefix={Search}
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            containerClassName="w-full sm:w-56 flex-1 sm:flex-none min-w-0"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Button
            type="button"
            size="compact"
            variant="outline"
            bgColor={ziqxUi.surface}
            fgColor={categoryFilter !== 'all' ? ziqxUi.green : ziqxUi.muted}
            prefix={SlidersHorizontal}
            onClick={() => {
              setCategoryFilter(
                categoryFilter === 'all'
                  ? 'Utility'
                  : categoryFilter === 'Utility'
                    ? 'Marketing'
                    : 'all'
              );
            }}
          >
            {categoryFilter === 'all' ? 'Filters' : categoryFilter}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="outline"
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.muted}
            prefix={RotateCw}
            aria-label="Refresh templates"
            title="Refresh templates"
          />

          <Button
            type="button"
            size="compact"
            bgColor={ziqxUi.green}
            fgColor={ziqxUi.greenFg}
            prefix={Plus}
            onClick={() =>
              window.open(
                'https://business.facebook.com/wa/manage/message-templates/',
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            New template
          </Button>
        </div>
      </div>

      {/* Main Container: 2 Columns */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-0 min-w-0">
        {/* Left Column: Templates Table Card */}
        <div
          className={`${
            mobilePane === 'list' ? 'flex' : 'hidden'
          } lg:flex flex-1 min-w-0 bg-white rounded-3xl border border-[#efede8] shadow-sm flex-col justify-between overflow-hidden`}
        >
          <div className="curve-scroll flex-1 overflow-y-auto min-w-0">
            <table className="w-full text-left text-xs border-collapse min-w-0">
              <thead className="sticky top-0 bg-white border-b border-[#f0eeea] z-10">
                <tr className="text-[#8f8f8e] text-[11px] font-medium">
                  <th className="py-3 px-3 sm:px-5 font-medium">Template</th>
                  <th className="py-3 px-2 sm:px-4 font-medium">Category</th>
                  <th className="py-3 px-2 sm:px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eeea]">
                {filteredTemplates.map((tpl) => {
                  const isSelected = activeTemplate?.id === tpl.id;
                  return (
                    <tr
                      key={tpl.id}
                      onClick={() => selectTemplate(tpl.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#f4f3ef]/80'
                          : 'hover:bg-[#faf9f7]'
                      }`}
                    >
                      <td className="py-3 px-3 sm:px-5 font-bold text-[#1a1a18] break-words max-w-[10rem] sm:max-w-none">
                        {tpl.name}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${
                            tpl.category === 'Marketing'
                              ? 'bg-[#efeafb] text-[#6b38c2]'
                              : 'bg-[#f0eeea] text-[#5b5b5a]'
                          }`}
                        >
                          {tpl.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 sm:px-4">{getStatusBadge(tpl.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sync Notice Footer */}
          <div className="p-3 sm:p-3.5 sm:px-5 border-t border-[#f0eeea] flex items-center gap-2 text-xs text-[#8f8f8e] bg-white">
            <Info className="w-3.5 h-3.5 text-[#8f8f8e] shrink-0" />
            <span>
              Templates are created and approved in WhatsApp Manager. Changes there sync here automatically.
            </span>
          </div>
        </div>

        {/* Right Column: Template Preview Card */}
        {activeTemplate && (
          <div
            className={`${
              mobilePane === 'preview' ? 'flex' : 'hidden'
            } lg:flex curve-scroll w-full lg:w-[420px] bg-white rounded-3xl border border-[#efede8] p-4 sm:p-5 shadow-sm flex-col justify-between overflow-y-auto shrink-0 min-h-0 min-w-0`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setMobilePane('list')}
                  className="lg:hidden flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e0] text-[#5b5b5a] hover:bg-[#f4f3ef] transition-colors"
                  aria-label="Back to templates"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#1a1a18] break-words">
                    {activeTemplate.name}
                  </h3>
                  {getStatusBadge(activeTemplate.status)}
                </div>
              </div>
              <p className="text-[11px] text-[#8f8f8e] mb-4">
                {activeTemplate.category} · {activeTemplate.language} · Updated {activeTemplate.updatedAt}
              </p>

              {/* WhatsApp Bubble Preview */}
              <div className="bg-[#faf9f7] border border-[#efede8] rounded-2xl p-4 mb-5">
                <div className="bg-[#ddf3e5] rounded-2xl p-3.5 shadow-xs text-xs space-y-1.5 text-[#1a1a18]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0b5c46]">
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="truncate">Template · {activeTemplate.name}</span>
                  </div>
                  <p className="leading-relaxed text-xs break-words">
                    {renderPreviewContent()}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-[#5b5b5a] pt-1">
                    <span>10:42</span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#3b82f6]" />
                  </div>
                </div>
              </div>

              {/* Sample Variables Inputs */}
              {activeTemplate.variables.length > 0 && (
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-bold text-[#5b5b5a]">
                    Sample values · {activeTemplate.variables.length} variables
                  </p>

                  <div className="space-y-2">
                    {activeTemplate.variables.map((v) => (
                      <div key={v.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <label className="text-xs font-mono text-[#6b38c2] bg-[#efeafb] px-2 py-1 rounded-md shrink-0 sm:w-24 truncate text-center self-start">
                          {`{{${v.key}}}`}
                        </label>
                        <input
                          type="text"
                          value={variableValues[v.key] ?? v.defaultValue}
                          onChange={(e) =>
                            setVariableValues({
                              ...variableValues,
                              [v.key]: e.target.value,
                            })
                          }
                          className="flex-1 min-w-0 text-xs px-3 py-1.5 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none text-[#1a1a18] bg-white transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#f0eeea]">
              <Button
                type="button"
                full
                bgColor={ziqxUi.green}
                fgColor={ziqxUi.greenFg}
                prefix={Send}
                onClick={() => setIsSendModalOpen(true)}
              >
                Send to a contact
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button
                  type="button"
                  size="compact"
                  variant="outline"
                  bgColor={ziqxUi.surface}
                  fgColor={copied ? ziqxUi.green : ziqxUi.dark}
                  prefix={copied ? Check : Copy}
                  onClick={handleCopyText}
                >
                  {copied ? 'Copied!' : 'Copy text'}
                </Button>

                <Button
                  type="button"
                  size="compact"
                  variant="outline"
                  bgColor={ziqxUi.surface}
                  fgColor={ziqxUi.dark}
                  prefix={ExternalLink}
                  onClick={() =>
                    window.open(
                      'https://business.facebook.com/wa/manage/message-templates/',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  WhatsApp Manager
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Template to Contact Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-template-title"
            className="bg-white rounded-3xl shadow-modal w-full max-w-md max-h-[min(90dvh,640px)] overflow-y-auto p-4 sm:p-6 border border-[#efede8]"
          >
            <h3 id="send-template-title" className="text-base font-bold text-[#1a1a18] mb-1">
              Send Template to Contact
            </h3>
            <p className="text-xs text-[#8f8f8e] mb-4">
              Select which contact receives this {activeTemplate?.name} WhatsApp template.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-semibold text-[#5b5b5a] block">
                Choose Contact
              </label>
              <div className="curve-scroll border border-[#e5e5e0] rounded-xl max-h-48 overflow-y-auto divide-y divide-[#f0eeea]">
                {contacts.map((c) => {
                  const isChosen = selectedContactForSend?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContactForSend(c)}
                      className={`p-2.5 px-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isChosen ? 'bg-[#ddf3e5]/30' : 'hover:bg-[#faf9f7]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{ backgroundColor: c.avatarBg, color: c.avatarColor }}
                        >
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1a1a18]">{c.name}</p>
                          <p className="text-[10px] text-[#5b5b5a]">{c.phone}</p>
                        </div>
                      </div>
                      {isChosen && <Check className="w-4 h-4 text-[#0b5c46]" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 flex-wrap">
              <Button
                type="button"
                size="compact"
                variant="outline"
                bgColor={ziqxUi.surface}
                fgColor={ziqxUi.dark}
                onClick={() => setIsSendModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="compact"
                bgColor={ziqxUi.green}
                fgColor={ziqxUi.greenFg}
                prefix={Send}
                onClick={handleConfirmSend}
              >
                Send WhatsApp Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
