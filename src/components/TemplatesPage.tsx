import React, { useState } from 'react';
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
  Users,
} from 'lucide-react';
import { MessageTemplate, Contact } from '../types';

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
  const [selectedContactForSend, setSelectedContactForSend] = useState<Contact>(contacts[0]);

  const activeTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

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
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8f8f8e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-[#e5e5e0] text-xs rounded-xl pl-8 pr-3 py-2 text-[#1a1a18] placeholder-[#8f8f8e] focus:outline-none focus:border-[#0b5c46] w-48 sm:w-56 transition-colors"
            />
          </div>

          <button
            onClick={() => {
              setCategoryFilter(
                categoryFilter === 'all'
                  ? 'Utility'
                  : categoryFilter === 'Utility'
                  ? 'Marketing'
                  : 'all'
              );
            }}
            className={`h-9 px-3.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              categoryFilter !== 'all'
                ? 'border-[#0b5c46] bg-[#ddf3e5]/30 text-[#0b5c46]'
                : 'border-[#e5e5e0] bg-white text-[#5b5b5a] hover:bg-[#faf9f7]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {categoryFilter === 'all' ? 'Filters' : categoryFilter}
            </span>
          </button>

          <button
            onClick={() => {
              // Refresh simulation
            }}
            className="w-9 h-9 rounded-xl border border-[#e5e5e0] bg-white flex items-center justify-center text-[#5b5b5a] hover:bg-[#faf9f7] transition-colors"
            title="Refresh templates"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => window.open('https://business.facebook.com/wa/manage/message-templates/', '_blank')}
            className="h-9 px-3.5 rounded-xl bg-[#0b5c46] hover:bg-[#084836] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New template</span>
          </button>
        </div>
      </div>

      {/* Main Container: 2 Columns */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* Left Column: Templates Table Card */}
        <div className="flex-1 bg-white rounded-3xl border border-[#efede8] shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-white border-b border-[#f0eeea] z-10">
                <tr className="text-[#8f8f8e] text-[11px] font-medium">
                  <th className="py-3 px-5 font-medium">Template</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eeea]">
                {filteredTemplates.map((tpl) => {
                  const isSelected = activeTemplate?.id === tpl.id;
                  return (
                    <tr
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#f4f3ef]/80'
                          : 'hover:bg-[#faf9f7]'
                      }`}
                    >
                      <td className="py-3 px-5 font-bold text-[#1a1a18]">
                        {tpl.name}
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4">{getStatusBadge(tpl.status)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sync Notice Footer */}
          <div className="p-3.5 px-5 border-t border-[#f0eeea] flex items-center gap-2 text-xs text-[#8f8f8e] bg-white">
            <Info className="w-3.5 h-3.5 text-[#8f8f8e] shrink-0" />
            <span>
              Templates are created and approved in WhatsApp Manager. Changes there sync here automatically.
            </span>
          </div>
        </div>

        {/* Right Column: Template Preview Card */}
        {activeTemplate && (
          <div className="w-full lg:w-[420px] bg-white rounded-3xl border border-[#efede8] p-5 shadow-sm flex flex-col justify-between overflow-y-auto shrink-0">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-[#1a1a18]">
                  {activeTemplate.name}
                </h3>
                {getStatusBadge(activeTemplate.status)}
              </div>
              <p className="text-[11px] text-[#8f8f8e] mb-4">
                {activeTemplate.category} · {activeTemplate.language} · Updated {activeTemplate.updatedAt}
              </p>

              {/* WhatsApp Bubble Preview */}
              <div className="bg-[#faf9f7] border border-[#efede8] rounded-2xl p-4 mb-5">
                <div className="bg-[#ddf3e5] rounded-2xl p-3.5 shadow-xs text-xs space-y-1.5 text-[#1a1a18]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#0b5c46]">
                    <FileText className="w-3 h-3" />
                    <span>Template · {activeTemplate.name}</span>
                  </div>
                  <p className="leading-relaxed text-xs">
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
                      <div key={v.key} className="flex items-center gap-3">
                        <label className="text-xs font-mono text-[#6b38c2] bg-[#efeafb] px-2 py-1 rounded-md shrink-0 w-24 truncate text-center">
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
                          className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-[#e5e5e0] focus:border-[#0b5c46] outline-none text-[#1a1a18] bg-white transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-4 border-t border-[#f0eeea]">
              <button
                onClick={() => setIsSendModalOpen(true)}
                className="w-full bg-[#0b5c46] hover:bg-[#084836] text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to a contact</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyText}
                  className="py-2 px-3 rounded-xl border border-[#e5e5e0] hover:bg-[#f4f3ef] text-xs font-semibold text-[#1a1a18] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0b5c46]" />
                      <span className="text-[#0b5c46]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#5b5b5a]" />
                      <span>Copy text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    window.open(
                      'https://business.facebook.com/wa/manage/message-templates/',
                      '_blank'
                    )
                  }
                  className="py-2 px-3 rounded-xl border border-[#e5e5e0] hover:bg-[#f4f3ef] text-xs font-semibold text-[#1a1a18] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#5b5b5a]" />
                  <span>WhatsApp Manager</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Template to Contact Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-md p-6 border border-[#efede8]">
            <h3 className="text-base font-bold text-[#1a1a18] mb-1">
              Send Template to Contact
            </h3>
            <p className="text-xs text-[#8f8f8e] mb-4">
              Select which contact receives this {activeTemplate.name} WhatsApp template.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-semibold text-[#5b5b5a] block">
                Choose Contact
              </label>
              <div className="border border-[#e5e5e0] rounded-xl max-h-48 overflow-y-auto divide-y divide-[#f0eeea]">
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

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#e5e5e0] text-xs font-semibold text-[#1a1a18]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="px-4 py-2 rounded-xl bg-[#0b5c46] hover:bg-[#084836] text-xs font-semibold text-white shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
