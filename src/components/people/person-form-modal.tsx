'use client';

import React, { useState, useEffect } from 'react';
import { Person } from '@/types';
import { useLifeAreas } from '@/hooks/use-life-areas';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  person?: Person | null;
  onSave: (data: Omit<Partial<Person>, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
}

const PRESET_TYPES = [
  'Mentor',
  'Mentee',
  'Sponsor',
  'Recruiter',
  'Client',
  'Colleague',
  'Manager',
  'Vendor',
  'Church',
  'Friend',
  'Family',
  'Collaborator',
  'YPS'
];

export function PersonFormModal({
  isOpen,
  onClose,
  person,
  onSave
}: PersonFormModalProps) {
  const { lifeAreas } = useLifeAreas();
  const [name, setName] = useState('');
  const [type, setType] = useState('Mentor');
  const [customType, setCustomType] = useState('');
  const [context, setContext] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [waitingOn, setWaitingOn] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [status, setStatus] = useState<'active' | 'waiting' | 'archived'>('active');
  const [lifeAreaId, setLifeAreaId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (person) {
      setName(person.name || '');
      if (PRESET_TYPES.includes(person.type || '')) {
        setType(person.type || 'Mentor');
        setCustomType('');
      } else {
        setType('Other');
        setCustomType(person.type || '');
      }
      setContext(person.context || '');
      setNextAction(person.next_action || '');
      setWaitingOn(person.waiting_on || '');
      setNextFollowUpDate(person.next_follow_up_date || '');
      setStatus(person.status || 'active');
      setLifeAreaId(person.life_area_id || '');
      setNotes(person.notes || '');
    } else {
      setName('');
      setType('Mentor');
      setCustomType('');
      setContext('');
      setNextAction('');
      setWaitingOn('');
      setNextFollowUpDate('');
      setStatus('active');
      setLifeAreaId('');
      setNotes('');
    }
  }, [person, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const finalType = type === 'Other' ? customType.trim() || 'Other' : type;
      await onSave({
        name: name.trim(),
        type: finalType,
        context: context.trim() || null,
        next_action: nextAction.trim() || null,
        waiting_on: waitingOn.trim() || null,
        next_follow_up_date: nextFollowUpDate || null,
        status,
        life_area_id: lifeAreaId || null,
        notes: notes.trim() || null
      });
      onClose();
    } catch (err) {
      console.error('Error saving person:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl text-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {person ? 'Edit Contact' : 'Add New Person'}
            </h3>
            <p className="text-xs text-slate-400">
              {person ? 'Update contact details and follow-ups' : 'Add someone key to your personal or professional network'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary placeholder:text-slate-600"
            />
          </div>

          {/* Relationship Type (Flexible String) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Relationship Type
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setCustomType('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    type === t
                      ? 'bg-sharon-primary text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setType('Other')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  type === 'Other'
                    ? 'bg-sharon-primary text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                + Custom
              </button>
            </div>
            {type === 'Other' && (
              <input
                type="text"
                placeholder="Type custom relationship category (e.g. Co-founder, Investor)..."
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
              />
            )}
          </div>

          {/* Context */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Context / Overview
            </label>
            <input
              type="text"
              placeholder="e.g. YPS Mentor & Advisor. Guides software engineering leadership."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary placeholder:text-slate-600"
            />
          </div>

          {/* Next Action & Waiting On */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-sharon-primary mb-1">
                Next Action (What Sharon needs to do)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Send React resources & draft proposal"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary placeholder:text-slate-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sharon-primary mb-1">
                Waiting On (What Sharon is waiting for)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Feedback on project roadmap"
                value={waitingOn}
                onChange={(e) => setWaitingOn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/50 placeholder:text-slate-600 resize-none"
              />
            </div>
          </div>

          {/* Follow-up date & Status & Life Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
              >
                <option value="active">Active</option>
                <option value="waiting">Waiting On</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Life Area
              </label>
              <select
                value={lifeAreaId}
                onChange={(e) => setLifeAreaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sharon-primary"
              >
                <option value="">None</option>
                {lifeAreas.map((la) => (
                  <option key={la.id} value={la.id}>
                    {la.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              General Notes & Preferences
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Prefers WhatsApp updates, highly values punctual follow-ups..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              disabled={saving || !name.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-sharon-primary hover:bg-sharon-primary-light text-slate-950 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {saving ? 'Saving...' : person ? 'Save Changes' : 'Create Person'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
