'use client';

import React, { useState } from 'react';
import { Person } from '@/types';
import { getLocalDateStr } from '@/services/people-service';

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onAdd: (type: string, notes: string, date: string) => Promise<void>;
}

export function AddInteractionModal({
  isOpen,
  onClose,
  person,
  onAdd
}: AddInteractionModalProps) {
  const [type, setType] = useState('WhatsApp');
  const [customType, setCustomType] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(getLocalDateStr());
  const [saving, setSaving] = useState(false);

  if (!isOpen || !person) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    setSaving(true);
    try {
      const finalType = type === 'Other' ? (customType.trim() || 'Other') : type;
      await onAdd(finalType, notes.trim(), date);
      onClose();
    } catch (err) {
      console.error('Error logging interaction:', err);
    } finally {
      setSaving(false);
    }
  };

  const channelTypes = ['WhatsApp', 'Call', 'Email', 'Meeting', 'Note', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Log Interaction</h3>
            <p className="text-xs text-slate-400">Record touchpoint with <span className="font-semibold text-sharon-primary">{person.name}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Interaction Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Channel / Type
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {channelTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    type === t
                      ? 'bg-sharon-primary text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {type === 'Other' && (
              <input
                type="text"
                placeholder="Specify type (e.g. Lunch, Conference)..."
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Notes / Summary
            </label>
            <textarea
              rows={4}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was discussed? Any follow-up agreements or takeaways?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary placeholder:text-slate-600 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !notes.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-sharon-primary hover:bg-sharon-primary-light text-slate-950 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
