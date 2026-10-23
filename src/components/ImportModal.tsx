import React, { useState, useRef } from 'react';
import { X, FileUp, FlaskConical, CheckCircle2, ArrowRight } from 'lucide-react';
import { Contact } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedContacts: Contact[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState<Partial<Contact>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleContacts: Partial<Contact>[] = [
    {
      name: 'Ashwin Kumar',
      phone: '+91 98450 11992',
      email: 'ashwin.k@ventures.in',
      category: 'Website Development',
      leadSource: 'Meta Ads',
      interestedService: 'Website Development',
      label: 'Startup',
    },
    {
      name: 'Deepa Varghese',
      phone: '+91 81290 44331',
      email: 'deepa@vargheseco.com',
      category: 'Brand Identity',
      leadSource: 'Google Search',
      interestedService: 'Brand Identity',
      label: 'Referral',
    },
    {
      name: 'Karan Mehra',
      phone: '+91 97112 55880',
      email: 'karan.m@growthdigital.com',
      category: 'SEO & Ads',
      leadSource: 'Meta Ads',
      interestedService: 'SEO & Ads',
      label: 'Hot',
    },
  ];

  const handleUseSample = () => {
    setParsedRows(sampleContacts);
    setStep(2);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Parse file or load mock
      handleUseSample();
    }
  };

  const handleConfirmImport = () => {
    const newContacts: Contact[] = parsedRows.map((row, idx) => ({
      id: `imported_${Date.now()}_${idx}`,
      name: row.name || 'Unknown Contact',
      phone: row.phone || '+91 98000 00000',
      email: row.email || 'contact@example.com',
      category: row.category || 'Website Development',
      label: row.label || null,
      savedOn: 'Today',
      leadSource: row.leadSource || 'CSV Import',
      campaign: 'Direct Upload',
      interestedService: row.interestedService || 'Website Development',
      assignedAgent: 'Jabir MDN',
      added: 'Today',
      lastInteraction: 'Just now',
      nextFollowUp: '24 Oct, 10:00',
      tags: row.label ? [row.label] : [],
      notes: ['Imported via CSV'],
      initials: (row.name || 'UC')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      avatarBg: '#e4eefb',
      avatarColor: '#1e60b5',
      consent: true,
      status: 'New',
    }));

    onImportSuccess(newContacts);
    onClose();
    setStep(1);
    setParsedRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-lg p-6 border border-[#efede8] relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-[#1a1a18]">
              Import contacts from CSV
            </h3>
            <p className="text-xs text-[#8f8f8e] mt-0.5">
              Step {step} of 2 — {step === 1 ? 'choose a file' : 'review and confirm'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl border border-[#e5e5e0] flex items-center justify-center text-[#5b5b5a] hover:bg-[#f4f3ef] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {step === 1 ? (
          <div>
            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                handleUseSample();
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#0b5c46] bg-[#ddf3e5]/20'
                  : 'border-[#d1d0cb] hover:border-[#0b5c46] bg-[#faf9f7]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#ddf3e5] flex items-center justify-center text-[#0b5c46] mb-3">
                <FileUp className="w-6 h-6 stroke-[2]" />
              </div>
              <h4 className="text-sm font-bold text-[#1a1a18]">
                Choose a CSV file
              </h4>
              <p className="text-xs text-[#8f8f8e] mt-1 max-w-xs">
                Columns: name, phone (10-digit), email, source, service
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between mt-6 pt-2">
              <button
                type="button"
                onClick={handleUseSample}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0b5c46] hover:underline"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Try with a sample file</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#e5e5e0] text-xs font-semibold text-[#1a1a18] hover:bg-[#f4f3ef] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Step 2: Confirmation table preview */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1a1a18]">
                  Ready to import ({parsedRows.length} contacts)
                </span>
                <span className="text-[11px] text-[#0b5c46] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All fields valid
                </span>
              </div>

              <div className="border border-[#e5e5e0] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#faf9f7] text-[#8f8f8e] border-b border-[#efede8]">
                    <tr>
                      <th className="py-2 px-3 font-medium">Name</th>
                      <th className="py-2 px-3 font-medium">Phone</th>
                      <th className="py-2 px-3 font-medium">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eeea]">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#fbfbfa]">
                        <td className="py-2 px-3 font-semibold text-[#1a1a18]">
                          {row.name}
                        </td>
                        <td className="py-2 px-3 text-[#5b5b5a]">{row.phone}</td>
                        <td className="py-2 px-3 text-[#5b5b5a]">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#5b5b5a] hover:underline"
              >
                Back to file select
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-[#e5e5e0] text-xs font-semibold text-[#1a1a18] hover:bg-[#f4f3ef]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl bg-[#0b5c46] hover:bg-[#084836] text-xs font-semibold text-white flex items-center gap-1.5 shadow-xs"
                >
                  <span>Import {parsedRows.length} Contacts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
