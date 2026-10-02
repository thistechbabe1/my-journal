'use client';

import React, { useState, useEffect } from 'react';
import { Person } from '@/types';

interface MarkContactedModalProps {
  isOpen: boolean;
  onClose: () => void;
  person: Person | null;
  onConfirm: (options: {
    nextFollowUpDate?: string | null;
    keepExistingFollowUp?: boolean;
    interaction?: {
      type: string;
      notes: string;
    } | null;
  }) => Promise<void>;
}

export function MarkContactedModal({
  isOpen,
  onClose,
  person,
  onConfirm
}: MarkContactedModalProps) {
  const [followUpStrategy, setFollowUpStrategy] = useState<'keep' | 'pick' | 'none'>('keep');
  const [pickDate, setPickDate] = useState<string>('');
  const [logInteraction, setLogInteraction] = useState(false);
  const [interactionType, setInteractionType] = useState('WhatsApp');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (person) {
      if (person.next_follow_up_date) {
        setFollowUpStrategy('keep');
      } else {
        setFollowUpStrategy('none');
      }
      setPickDate('');
      setLogInteraction(false);
      setInteractionType('WhatsApp');
      setInteractionNotes('');
    }
  }, [person, isOpen]);

  if (!isOpen || !person) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let nextFollowUpDate: string | null = null;
      let keepExistingFollowUp = false;

      if (followUpStrategy === 'keep' && person.next_follow_up_date) {
        keepExistingFollowUp = true;
      } else if (followUpStrategy === 'pick') {
        nextFollowUpDate = pickDate || null;
      } else if (followUpStrategy === 'none') {
        nextFollowUpDate = null;
      }

      await onConfirm({
        nextFollowUpDate,
        keepExistingFollowUp,
        interaction: logInteraction
          ? {
              type: interactionType,
              notes: interactionNotes
            }
          : null
      });
      onClose();
    } catch (err) {
      console.error('Error marking contacted:', err);
    } finally {
      setSaving(false);
    }
  };

  const channelTypes = ['WhatsApp', 'Call', 'Email', 'Meeting', 'Note'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Mark Contacted Today</h3>
            <p className="text-xs text-slate-400">Updating touchpoint for <span className="font-semibold text-sharon-primary">{person.name}</span></p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Follow-up Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Next Follow-Up Strategy
            </label>
            <div className="space-y-2">
              {person.next_follow_up_date && (
                <label className={`flex items-center justify-between p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                  followUpStrategy === 'keep'
                    ? 'bg-sharon-primary/10 border-teal-500/50 text-sharon-primary'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="strategy"
                      checked={followUpStrategy === 'keep'}
                      onChange={() => setFollowUpStrategy('keep')}
                      className="text-sharon-primary focus:ring-sharon-primary"
                    />
                    <span>Keep existing follow-up date</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{person.next_follow_up_date}</span>
                </label>
              )}

              <label className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                followUpStrategy === 'pick'
                  ? 'bg-sharon-primary/10 border-teal-500/50 text-sharon-primary'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
              }`}>
                <input
                  type="radio"
                  name="strategy"
                  checked={followUpStrategy === 'pick'}
                  onChange={() => setFollowUpStrategy('pick')}
                  className="text-sharon-primary focus:ring-sharon-primary"
                />
                <span>Pick a next follow-up date</span>
              </label>

              {followUpStrategy === 'pick' && (
                <div className="pl-7 pt-1">
                  <input
                    type="date"
                    required={followUpStrategy === 'pick'}
                    value={pickDate}
                    onChange={(e) => setPickDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
                  />
                </div>
              )}

              <label className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                followUpStrategy === 'none'
                  ? 'bg-sharon-primary/10 border-teal-500/50 text-sharon-primary'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
              }`}>
                <input
                  type="radio"
                  name="strategy"
                  checked={followUpStrategy === 'none'}
                  onChange={() => setFollowUpStrategy('none')}
                  className="text-sharon-primary focus:ring-sharon-primary"
                />
                <span>No follow-up needed</span>
              </label>
            </div>
          </div>

          {/* Integrated Interaction Logging */}
          <div className="border-t border-slate-800/80 pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-200">
              <input
                type="checkbox"
                checked={logInteraction}
                onChange={(e) => setLogInteraction(e.target.checked)}
                className="w-4 h-4 rounded text-sharon-primary border-slate-700 bg-slate-900 focus:ring-sharon-primary"
              />
              <span>Also log an interaction note for today</span>
            </label>

            {logInteraction && (
              <div className="mt-3 space-y-3 pl-6 border-l-2 border-teal-500/30">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Channel / Type</label>
                  <div className="flex flex-wrap gap-2">
                    {channelTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setInteractionType(type)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          interactionType === type
                            ? 'bg-sharon-primary text-slate-950 font-semibold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Interaction Notes</label>
                  <textarea
                    rows={2}
                    required={logInteraction}
                    value={interactionNotes}
                    onChange={(e) => setInteractionNotes(e.target.value)}
                    placeholder="e.g. Discussed React roadmap and scheduled review call..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary placeholder:text-slate-600 resize-none"
                  />
                </div>
              </div>
            )}
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
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-sharon-primary hover:bg-sharon-primary-light text-slate-950 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Confirm Contacted'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
