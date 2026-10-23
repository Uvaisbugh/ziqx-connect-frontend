import React, { useState, useMemo } from 'react';
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
import { Contact } from '../types';
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
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8f8f8e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contacts"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#e5e5e0] text-xs rounded-xl pl-8 pr-3 py-2 text-[#1a1a18] placeholder-[#8f8f8e] focus:outline-none focus:border-[#0b5c46] w-44 sm:w-52 transition-colors"
            />
          </div>

          {/* Filter button */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${
                filterOpen || selectedCategory !== 'all' || selectedLabel !== 'all'
                  ? 'border-[#0b5c46] bg-[#ddf3e5]/30 text-[#0b5c46]'
                  : 'border-[#e5e5e0] bg-white text-[#5b5b5a] hover:bg-[#faf9f7]'
              }`}
              title="Filters"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#efede8] rounded-2xl p-3 shadow-modal z-30">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#f0eeea]">
                  <span className="text-xs font-bold text-[#1a1a18]">Filters</span>
                  {(selectedCategory !== 'all' || selectedLabel !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedLabel('all');
                      }}
                      className="text-[10px] text-[#0b5c46] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#8f8f8e] block mb-1">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full text-xs p-1.5 border border-[#e5e5e0] rounded-lg outline-none bg-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="SEO & Ads">SEO & Ads</option>
                      <option value="Brand Identity">Brand Identity</option>
                      <option value="Mobile App">Mobile App</option>
                      <option value="ERP Setup">ERP Setup</option>
                      <option value="Website Development">Website Development</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#8f8f8e] block mb-1">
                      Label
                    </label>
                    <select
                      value={selectedLabel}
                      onChange={(e) => setSelectedLabel(e.target.value)}
                      className="w-full text-xs p-1.5 border border-[#e5e5e0] rounded-lg outline-none bg-white"
                    >
                      <option value="all">All Labels</option>
                      <option value="Hot">Hot</option>
                      <option value="Startup">Startup</option>
                      <option value="Referral">Referral</option>
                      <option value="Retail">Retail</option>
                      <option value="none">No label (—)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="w-9 h-9 rounded-xl border border-[#e5e5e0] bg-white flex items-center justify-center text-[#5b5b5a] hover:bg-[#faf9f7] transition-colors"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Import button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 px-3.5 rounded-xl border border-[#e5e5e0] bg-white text-xs font-semibold text-[#1a1a18] hover:bg-[#faf9f7] flex items-center gap-2 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#5b5b5a]" />
            <span>Import</span>
          </button>

          {/* + New Contact button */}
          <button
            onClick={() => setIsNewContactModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-[#0b5c46] hover:bg-[#084836] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Contact</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="flex-1 bg-white rounded-3xl border border-[#efede8] shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Table scroll container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-white border-b border-[#f0eeea] z-10">
              <tr className="text-[#8f8f8e] text-[11px] font-medium">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      currentContacts.length > 0 &&
                      selectedIds.size === currentContacts.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-[#d1d0cb] text-[#0b5c46] focus:ring-[#0b5c46] cursor-pointer"
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
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-[#d1d0cb] text-[#0b5c46] focus:ring-[#0b5c46] cursor-pointer"
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
