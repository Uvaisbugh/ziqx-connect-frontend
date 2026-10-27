'use client';

import React, { useState, useMemo } from 'react';
import { Button, Checkbox, Input, Select } from '@ziqx/react-comps';
import {
  Search,
  SlidersHorizontal,
  Download,
  FileSpreadsheet,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Check,
  Filter,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { Contact } from '@/types';
import { ContactDrawer } from './ContactDrawer';
import { ImportModal } from './ImportModal';
import { NewContactModal } from './NewContactModal';

interface ContactsPageProps {
  contacts: Contact[];
  onUpdateContact: (contact: Contact) => void;
  onAddContact: (contact: Contact) => void;
  onImportContacts: (imported: Contact[]) => void;
  onOpenWhatsApp: (contact: Contact) => void;
  selectedContactId?: string | null;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({
  contacts,
  onUpdateContact,
  onAddContact,
  onImportContacts,
  onOpenWhatsApp,
  selectedContactId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLabel, setSelectedLabel] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeContact, setActiveContact] = useState<Contact | null>(
    selectedContactId
      ? contacts.find((c) => c.id === selectedContactId) || null
      : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);

  const pageSize = 10;

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const labels =
        c.labels && c.labels.length > 0
          ? c.labels
          : c.label
          ? [c.label]
          : [];

      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        labels.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || c.category === selectedCategory;
      const matchesLabel =
        selectedLabel === 'all' ||
        (selectedLabel === 'none'
          ? labels.length === 0
          : labels.includes(selectedLabel));

      return matchesSearch && matchesCat && matchesLabel;
    });
  }, [contacts, searchQuery, selectedCategory, selectedLabel]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const currentContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContacts.slice(start, start + pageSize);
  }, [filteredContacts, currentPage, pageSize]);

  // Visible page numbers (5 items sliding window)
  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - 2);
    let end = start + 4;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - 4);
    }
    const pages = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Checkbox handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(currentContacts.map((c) => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Contact Name', 'Phone Number', 'Category', 'Label', 'Saved On', 'Email', 'Lead Source'];
    const rows = filteredContacts.map((c) => [
      c.name,
      c.phone,
      c.category,
      c.label || '—',
      c.savedOn,
      c.email,
      c.leadSource,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ziqx_contacts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 px-1">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a18] tracking-tight">
            Contacts
          </h1>
          <p className="text-xs text-[#8f8f8e] mt-0.5">
            {contacts.length} contacts across all categories
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            type="text"
            placeholder="Search contacts"
            value={searchQuery}
            prefix={Search}
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            containerClassName="w-44 sm:w-52"
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />

          <div className="relative">
            <Button
              type="button"
              size="icon"
              variant="outline"
              bgColor={ziqxUi.surface}
              fgColor={
                filterOpen || selectedCategory !== 'all' || selectedLabel !== 'all'
                  ? ziqxUi.green
                  : ziqxUi.muted
              }
              prefix={SlidersHorizontal}
              aria-label="Filters"
              title="Filters"
              onClick={() => setFilterOpen(!filterOpen)}
            />

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#efede8] rounded-2xl p-3 shadow-modal z-30">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0eeea]">
                  <span className="text-xs font-bold text-[#1a1a18]">Filters</span>
                  {(selectedCategory !== 'all' || selectedLabel !== 'all') && (
                    <Button
                      type="button"
                      size="compact"
                      variant="ghost"
                      bgColor={ziqxUi.surface}
                      fgColor={ziqxUi.green}
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedLabel('all');
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <Select
                    label="Category"
                    compact
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    options={[
                      { value: 'all', label: 'All Categories' },
                      { value: 'SEO & Ads', label: 'SEO & Ads' },
                      { value: 'Brand Identity', label: 'Brand Identity' },
                      { value: 'Mobile App', label: 'Mobile App' },
                      { value: 'ERP Setup', label: 'ERP Setup' },
                      { value: 'Website Development', label: 'Website Development' },
                      { value: 'UI/UX Design', label: 'UI/UX Design' },
                    ]}
                  />

                  <Select
                    label="Label"
                    compact
                    value={selectedLabel}
                    onValueChange={setSelectedLabel}
                    options={[
                      { value: 'all', label: 'All Labels' },
                      { value: 'Hot', label: 'Hot' },
                      { value: 'Startup', label: 'Startup' },
                      { value: 'Referral', label: 'Referral' },
                      { value: 'Retail', label: 'Retail' },
                      { value: 'none', label: 'No label (—)' },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            type="button"
            size="icon"
            variant="outline"
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.muted}
            prefix={Download}
            aria-label="Export CSV"
            title="Export CSV"
            onClick={handleExportCSV}
          />

          <Button
            type="button"
            size="compact"
            variant="outline"
            bgColor={ziqxUi.surface}
            fgColor={ziqxUi.dark}
            prefix={FileSpreadsheet}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import
          </Button>

          <Button
            type="button"
            size="compact"
            bgColor={ziqxUi.green}
            fgColor={ziqxUi.greenFg}
            prefix={Plus}
            onClick={() => setIsNewContactModalOpen(true)}
          >
            New Contact
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex-1 bg-white rounded-3xl border border-[#efede8] shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Table scroll container */}
        <div className="curve-scroll flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white border-b border-[#f0eeea] z-10">
              <tr className="text-[#8f8f8e] text-[11px] font-medium">
                <th className="py-3 px-4 w-10">
                  <Checkbox
                    size={16}
                    bgColor={ziqxUi.green}
                    fgColor={ziqxUi.greenFg}
                    checked={
                      currentContacts.length > 0 &&
                      selectedIds.size === currentContacts.length
                    }
                    indeterminate={
                      selectedIds.size > 0 &&
                      selectedIds.size < currentContacts.length
                    }
                    onChange={handleSelectAll}
                    aria-label="Select all contacts"
                  />
                </th>
                <th className="py-3 px-3 font-medium">Contact Name</th>
                <th className="py-3 px-3 font-medium">Phone Number</th>
                <th className="py-3 px-3 font-medium">Category</th>
                <th className="py-3 px-3 font-medium">Label</th>
                <th className="py-3 px-3 font-medium">Saved On</th>
                <th className="py-3 px-3 font-medium text-right pr-5">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0eeea]">
              {currentContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8f8f8e]">
                    No contacts match your search or filters.
                  </td>
                </tr>
              ) : (
                currentContacts.map((contact) => {
                  const isSelected = selectedIds.has(contact.id);
                  const isRowActive = activeContact?.id === contact.id;

                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setActiveContact(contact)}
                      className={`group cursor-pointer transition-colors ${
                        isRowActive
                          ? 'bg-[#f4f3ef]/70'
                          : isSelected
                          ? 'bg-[#ddf3e5]/20'
                          : 'hover:bg-[#faf9f7]'
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-2.5 px-4"
                        onClick={(e) => handleToggleSelect(contact.id, e)}
                      >
                        <Checkbox
                          size={16}
                          bgColor={ziqxUi.green}
                          fgColor={ziqxUi.greenFg}
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select ${contact.name}`}
                        />
                      </td>

                      {/* Contact Name & Initials */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              backgroundColor: contact.avatarBg,
                              color: contact.avatarColor,
                            }}
                          >
                            {contact.initials}
                          </div>
                          <span className="font-semibold text-[#1a1a18] group-hover:text-[#0b5c46] transition-colors">
                            {contact.name}
                          </span>
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td className="py-2.5 px-3 text-[#5b5b5a] font-normal">
                        {contact.phone}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-[#5b5b5a]">
                        {contact.category}
                      </td>

                      {/* Label Pill */}
                      <td className="py-2.5 px-3">
                        {(() => {
                          const labels =
                            contact.labels && contact.labels.length > 0
                              ? contact.labels
                              : contact.label
                              ? [contact.label]
                              : [];
                          if (labels.length === 0) {
                            return <span className="text-[#8f8f8e]">—</span>;
                          }
                          return (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {labels.map((lbl) => (
                                <span
                                  key={lbl}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#f0eeea] text-[#5b5b5a]"
                                >
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Saved On */}
                      <td className="py-2.5 px-3 text-[#5b5b5a]">
                        {contact.savedOn}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right pr-5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveContact(contact);
                          }}
                          className="w-7 h-7 rounded-lg text-[#8f8f8e] hover:text-[#1a1a18] hover:bg-[#efede8] inline-flex items-center justify-center transition-colors"
                          title="Edit contact"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 px-5 border-t border-[#f0eeea] flex items-center justify-between bg-white text-xs text-[#8f8f8e]">
          <div>
            Showing {filteredContacts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredContacts.length)} of {filteredContacts.length}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] disabled:opacity-30 hover:bg-[#f4f3ef] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {visiblePages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                  currentPage === page
                    ? 'bg-[#1a1a18] text-white shadow-xs'
                    : 'text-[#5b5b5a] hover:bg-[#f4f3ef]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] disabled:opacity-30 hover:bg-[#f4f3ef] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <ContactDrawer
        contact={activeContact}
        onClose={() => setActiveContact(null)}
        onOpenWhatsApp={(c) => {
          onOpenWhatsApp(c);
        }}
        onUpdateContact={(updated) => {
          onUpdateContact(updated);
          setActiveContact(updated);
        }}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={onImportContacts}
      />

      {/* New Contact Modal */}
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        onAddContact={onAddContact}
        existingContacts={contacts}
      />
    </div>
  );
};
