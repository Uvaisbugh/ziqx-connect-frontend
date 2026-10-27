'use client';

import React, { useState } from 'react';
import { Button } from '@ziqx/react-comps';
import {
  X,
  Plus,
  Pencil,
  Phone,
  Mail,
  Send,
  Calendar,
  Clock,
  Tag,
  UserCheck,
  Check,
} from 'lucide-react';
import { ziqxUi } from '@/lib/ui';
import { Contact } from '@/types';

interface ContactDrawerProps {
  contact: Contact | null;
  onClose: () => void;
  onOpenWhatsApp: (contact: Contact) => void;
  onUpdateContact?: (updated: Contact) => void;
}

export const ContactDrawer: React.FC<ContactDrawerProps> = ({
  contact,
  onClose,
  onOpenWhatsApp,
  onUpdateContact,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Contact>>({});

  if (!contact) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updatedNotes = [...contact.notes, newNote.trim()];
    if (onUpdateContact) {
      onUpdateContact({ ...contact, notes: updatedNotes });
    }
    setNewNote('');
    setIsAddingNote(false);
  };

  const handleStartEdit = () => {
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      interestedService: contact.interestedService,
      assignedAgent: contact.assignedAgent,
      nextFollowUp: contact.nextFollowUp,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateContact && editForm.name) {
      onUpdateContact({
        ...contact,
        ...editForm,
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] md:w-[500px] bg-white shadow-drawer border-l border-[#efede8] flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Content */}
      <div className="curve-scroll p-6 overflow-y-auto flex-1">
        {/* Header with Avatar and Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-xs shrink-0"
              style={{ backgroundColor: contact.avatarBg, color: contact.avatarColor }}
            >
              {contact.initials}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#8f8f8e]">
                {contact.category} · {contact.leadSource}
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-bold text-[#1a1a18] border-b border-[#0b5c46] outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-[#1a1a18] leading-tight">
                  {contact.name}
                </h2>
              )}
              <p className="text-xs text-[#5b5b5a] mt-0.5">{contact.phone}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:text-[#1a1a18] hover:bg-[#f4f3ef] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e4eefb] text-[#1e60b5]">
            {contact.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 mb-6">
          <Button
            type="button"
            full
            bgColor={ziqxUi.green}
            fgColor={ziqxUi.greenFg}
            prefix={Plus}
            onClick={() => onOpenWhatsApp(contact)}
          >
            Open WhatsApp conversation
          </Button>

          {isEditing ? (
            <Button
              type="button"
              size="compact"
              bgColor={ziqxUi.green}
              fgColor={ziqxUi.greenFg}
              prefix={Check}
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          ) : (
            <Button
              type="button"
              size="compact"
              variant="outline"
              bgColor={ziqxUi.surface}
              fgColor={ziqxUi.dark}
              prefix={Pencil}
              onClick={handleStartEdit}
            >
              Edit
            </Button>
          )}
        </div>

        {/* Details 2-Column Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 py-2 border-t border-[#f0eeea] text-xs">
          <div>
            <p className="text-[#8f8f8e] mb-1">Phone</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full text-xs font-medium text-[#1a1a18] border rounded px-1.5 py-1"
              />
            ) : (
              <p className="font-semibold text-[#1a1a18]">{contact.phone}</p>
            )}
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Email</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full text-xs font-medium text-[#1a1a18] border rounded px-1.5 py-1"
              />
            ) : (
              <p className="font-semibold text-[#1a1a18] truncate">{contact.email}</p>
            )}
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Lead source</p>
            <p className="font-semibold text-[#1a1a18]">{contact.leadSource}</p>
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Campaign</p>
            <p className="font-semibold text-[#1a1a18]">{contact.campaign}</p>
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Interested service</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.interestedService || ''}
                onChange={(e) => setEditForm({ ...editForm, interestedService: e.target.value })}
                className="w-full text-xs font-medium text-[#1a1a18] border rounded px-1.5 py-1"
              />
            ) : (
              <p className="font-semibold text-[#1a1a18]">{contact.interestedService}</p>
            )}
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Assigned agent</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.assignedAgent || ''}
                onChange={(e) => setEditForm({ ...editForm, assignedAgent: e.target.value })}
                className="w-full text-xs font-medium text-[#1a1a18] border rounded px-1.5 py-1"
              />
            ) : (
              <p className="font-semibold text-[#1a1a18]">{contact.assignedAgent}</p>
            )}
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Added</p>
            <p className="font-semibold text-[#1a1a18]">{contact.added}</p>
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Last interaction</p>
            <p className="font-semibold text-[#1a1a18]">{contact.lastInteraction}</p>
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Next follow-up</p>
            {isEditing ? (
              <input
                type="text"
                value={editForm.nextFollowUp || ''}
                onChange={(e) => setEditForm({ ...editForm, nextFollowUp: e.target.value })}
                className="w-full text-xs font-medium text-[#d93829] border rounded px-1.5 py-1"
              />
            ) : (
              <p className="font-semibold text-[#d93829]">{contact.nextFollowUp}</p>
            )}
          </div>

          <div>
            <p className="text-[#8f8f8e] mb-1">Tags</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {contact.tags.length > 0 ? (
                contact.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#f0eeea] text-[#1a1a18]"
                  >
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-[#8f8f8e]">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="mt-5 pt-4 border-t border-[#f0eeea]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#5b5b5a]">Notes</label>
            {!isAddingNote && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="text-[11px] font-semibold text-[#0b5c46] hover:underline"
              >
                + Add note
              </button>
            )}
          </div>

          {contact.notes && contact.notes.length > 0 ? (
            <div className="space-y-2 mb-2">
              {contact.notes.map((note, idx) => (
                <div
                  key={idx}
                  className="bg-[#faf9f7] border border-[#e5e5e0] rounded-xl p-3 text-xs text-[#1a1a18]"
                >
                  {note}
                </div>
              ))}
            </div>
          ) : (
            !isAddingNote && (
              <div className="bg-[#faf9f7] border border-[#e5e5e0] rounded-xl p-3 text-xs text-[#8f8f8e]">
                No notes yet.
              </div>
            )
          )}

          {isAddingNote && (
            <form onSubmit={handleAddNote} className="mt-2 flex flex-col gap-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note about this contact..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-xl border border-[#0b5c46] outline-none resize-none bg-white"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="text-xs text-[#5b5b5a] px-2.5 py-1 hover:bg-[#f4f3ef] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs bg-[#0b5c46] text-white px-3 py-1 rounded-lg font-medium"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
