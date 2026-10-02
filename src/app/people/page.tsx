'use client';

import React, { useState, useMemo } from 'react';
import { usePeople, usePersonInteractions } from '@/hooks/use-people';
import { getFollowUpUrgency, diffDays } from '@/services/people-service';
import { Person } from '@/types';
import { PersonFormModal } from '@/components/people/person-form-modal';
import { MarkContactedModal } from '@/components/people/mark-contacted-modal';
import { AddInteractionModal } from '@/components/people/add-interaction-modal';
import { RelatedContextCard } from '@/components/people/related-context-card';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import { useToast } from '@/components/feedback/ToastProvider';

export default function PeoplePage() {
  const {
    people,
    activePeople,
    followUpDuePeople,
    overdueFollowUps,
    waitingOnPeople,
    archivedPeople,
    loading,
    error,
    createPerson,
    updatePerson,
    deletePerson,
    markContacted
  } = usePeople();

  const { toast } = useToast();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'due' | 'waiting' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isMarkContactedOpen, setIsMarkContactedOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
  const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);

  // Active selected person object
  const selectedPerson = useMemo(
    () => people.find((p) => p.id === selectedPersonId) || (people.length > 0 ? people[0] : null),
    [people, selectedPersonId]
  );

  // Sync selected person ID if list updates or first load
  React.useEffect(() => {
    if (!selectedPersonId && people.length > 0) {
      setSelectedPersonId(people[0].id);
    }
  }, [people, selectedPersonId]);

  // Interaction timeline hook for selected person
  const {
    interactions,
    loading: interactionsLoading,
    addInteraction,
    deleteInteraction
  } = usePersonInteractions(selectedPerson ? selectedPerson.id : null);

  // Quick inline interaction form
  const [inlineType, setInlineType] = useState('WhatsApp');
  const [inlineNotes, setInlineNotes] = useState('');
  const [addingInline, setAddingInline] = useState(false);

  // Filtered people list
  const filteredPeople = useMemo(() => {
    let list: Person[] = [];
    if (filterTab === 'due') {
      list = followUpDuePeople;
    } else if (filterTab === 'waiting') {
      list = waitingOnPeople;
    } else if (filterTab === 'archived') {
      list = archivedPeople;
    } else {
      list = activePeople;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.type && p.type.toLowerCase().includes(q)) ||
          (p.context && p.context.toLowerCase().includes(q)) ||
          (p.next_action && p.next_action.toLowerCase().includes(q)) ||
          (p.waiting_on && p.waiting_on.toLowerCase().includes(q))
      );
    }
    return list;
  }, [filterTab, activePeople, followUpDuePeople, waitingOnPeople, archivedPeople, searchQuery]);

  // Quick inline interaction save
  const handleInlineInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineNotes.trim() || !selectedPerson) return;
    setAddingInline(true);
    try {
      await addInteraction(inlineType, inlineNotes.trim());
      setInlineNotes('');
      toast('Interaction logged successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to log interaction', 'error');
    } finally {
      setAddingInline(false);
    }
  };

  const channelBadges: Record<string, string> = {
    WhatsApp: 'bg-emerald-500/10 text-sharon-primary border-emerald-500/30',
    Call: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Email: 'bg-purple-500/10 text-sharon-primary border-purple-500/30',
    Meeting: 'bg-amber-500/10 text-sharon-primary border-amber-500/30',
    Note: 'bg-slate-700/50 text-slate-300 border-slate-600'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              People & Follow-ups
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sharon-primary/10 border border-teal-500/30 text-sharon-primary font-semibold">
              Secretary CRM
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track key relationships, explicit follow-ups, waiting items, and interaction timelines.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPerson(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <span className="text-base">+</span> Add Person
        </button>
      </div>

      {/* Main Two-panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Directory & Search */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-4 shadow-xl">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, type, or context..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sharon-primary"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-xs font-medium">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                filterTab === 'all'
                  ? 'bg-slate-800 text-sharon-primary font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({activePeople.length})
            </button>
            <button
              onClick={() => setFilterTab('due')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all relative ${
                filterTab === 'due'
                  ? 'bg-slate-800 text-sharon-primary font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Due
              {followUpDuePeople.length > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  overdueFollowUps.length > 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-sharon-primary'
                }`}>
                  {followUpDuePeople.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab('waiting')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                filterTab === 'waiting'
                  ? 'bg-slate-800 text-sharon-primary font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Waiting
              {waitingOnPeople.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-sharon-primary font-bold">
                  {waitingOnPeople.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterTab('archived')}
              className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                filterTab === 'archived'
                  ? 'bg-slate-800 text-sharon-primary font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Archived ({archivedPeople.length})
            </button>
          </div>

          {/* Directory List */}
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {error ? (
              <div className="text-center py-8 text-rose-400 text-xs bg-rose-950/20 border border-rose-500/30 rounded-xl p-4">
                Couldn't load contacts. ({error})
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-slate-500 text-sm animate-pulse">
                Loading directory...
              </div>
            ) : filteredPeople.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm bg-slate-950/40 rounded-xl border border-slate-800/50 p-6 font-medium">
                🤝 No contacts found matching criteria.
              </div>
            ) : (
              filteredPeople.map((person) => {
                const urgency = getFollowUpUrgency(person);
                const isSelected = selectedPerson?.id === person.id;

                return (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500/60 shadow-md ring-1 ring-teal-500/30'
                        : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-sharon-primary text-sm shrink-0">
                          {person.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100 text-sm">{person.name}</span>
                            {person.type && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-300">
                                {person.type}
                              </span>
                            )}
                          </div>
                          {person.context && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{person.context}</p>
                          )}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {urgency === 'overdue' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                            Follow-up Overdue
                          </span>
                        )}
                        {urgency === 'today' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-sharon-primary text-[10px] font-bold">
                            Follow-up Today
                          </span>
                        )}
                        {person.waiting_on && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-sharon-primary text-[10px] font-medium">
                            Waiting On
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Touchpoint Footer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Last contacted:{' '}
                        <strong className="text-slate-400 font-normal">
                          {person.last_contacted_date ? person.last_contacted_date : 'Never'}
                        </strong>
                      </span>
                      {person.next_follow_up_date && (
                        <span>
                          Next:{' '}
                          <strong className={`font-medium ${urgency === 'overdue' ? 'text-rose-400' : 'text-slate-300'}`}>
                            {person.next_follow_up_date}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Detailed View & Interaction History */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedPerson ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <div className="text-4xl">👥</div>
              <p className="text-base font-medium">No contact selected</p>
              <p className="text-xs text-slate-500">Select a person from the left directory or add a new person to start tracking.</p>
            </div>
          ) : (
            <>
              {/* Selected Contact Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 via-cyan-500/20 to-sky-500/20 border border-teal-500/40 flex items-center justify-center font-extrabold text-sharon-primary text-xl shadow-inner">
                      {selectedPerson.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-100">{selectedPerson.name}</h2>
                        {selectedPerson.type && (
                          <span className="px-2.5 py-0.5 rounded-full bg-sharon-primary/10 border border-teal-500/30 text-sharon-primary text-xs font-semibold">
                            {selectedPerson.type}
                          </span>
                        )}
                        {selectedPerson.status === 'archived' && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Last Contacted:{' '}
                        <span className="text-slate-200 font-medium">
                          {selectedPerson.last_contacted_date ? selectedPerson.last_contacted_date : 'Not recorded'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Primary Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsMarkContactedOpen(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sharon-primary/20 hover:bg-sharon-primary/30 text-sharon-primary border border-teal-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>✓</span> Mark Contacted Today
                    </button>
                    <button
                      onClick={() => setIsAddInteractionOpen(true)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>💬</span> Log Interaction
                    </button>
                    <button
                      onClick={() => {
                        setEditingPerson(selectedPerson);
                        setIsFormOpen(true);
                      }}
                      className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                      title="Edit Person"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingPersonId(selectedPerson.id)}
                      className="p-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
                      title="Delete Person"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Secretary State Cards: Next Action & Waiting On */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What Sharon Needs To Do */}
                  <div className="bg-slate-950/70 border border-teal-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sharon-primary flex items-center gap-1.5">
                        <span>📌</span> Next Action
                      </span>
                      <span className="text-[10px] text-slate-500">Sharon's Commitment</span>
                    </div>
                    {selectedPerson.next_action ? (
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {selectedPerson.next_action}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No next action specified.</p>
                    )}
                  </div>

                  {/* What Sharon is Waiting On */}
                  <div className="bg-slate-950/70 border border-amber-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sharon-primary flex items-center gap-1.5">
                        <span>⏳</span> Waiting On
                      </span>
                      <span className="text-[10px] text-slate-500">From {selectedPerson.name.split(' ')[0]}</span>
                    </div>
                    {selectedPerson.waiting_on ? (
                      <p className="text-sm font-medium text-slate-200 leading-relaxed">
                        {selectedPerson.waiting_on}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Nothing currently pending.</p>
                    )}
                  </div>
                </div>

                {/* Follow-up Date Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📅</span>
                    <div>
                      <span className="text-xs font-medium text-slate-400">Next Planned Follow-Up</span>
                      <p className="text-sm font-bold text-slate-200">
                        {selectedPerson.next_follow_up_date || 'No follow-up date scheduled'}
                      </p>
                    </div>
                  </div>
                  {getFollowUpUrgency(selectedPerson) === 'overdue' && (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold self-start sm:self-auto">
                      Overdue by {Math.abs(diffDays(selectedPerson.next_follow_up_date!))} days
                    </span>
                  )}
                  {getFollowUpUrgency(selectedPerson) === 'today' && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-sharon-primary text-xs font-bold self-start sm:self-auto">
                      Due Today
                    </span>
                  )}
                </div>

                {/* Context & Notes */}
                {(selectedPerson.context || selectedPerson.notes || selectedPerson.life_area) && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-400">Personal Context</h4>
                    {selectedPerson.context && (
                      <p className="text-sm text-slate-300 leading-relaxed">{selectedPerson.context}</p>
                    )}
                    {selectedPerson.notes && (
                      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                        <strong className="text-slate-300 block mb-1">Notes:</strong>
                        {selectedPerson.notes}
                      </div>
                    )}
                    {selectedPerson.life_area && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Life Area:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium">
                          {selectedPerson.life_area.name}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 360-Degree Context Linker Card */}
              <RelatedContextCard
                personId={selectedPerson.id}
                personName={selectedPerson.name}
              />

              {/* Interaction History Timeline */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>📜</span> Interaction History Timeline
                    </h3>
                    <p className="text-xs text-slate-400">Chronological touchpoint logs with {selectedPerson.name}</p>
                  </div>
                  <button
                    onClick={() => setIsAddInteractionOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sharon-primary border border-slate-700 transition-all cursor-pointer"
                  >
                    + Log Touchpoint
                  </button>
                </div>

                {/* Inline Quick Add Form */}
                <form onSubmit={handleInlineInteractionSubmit} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Quick Log Touchpoint Today</span>
                    <div className="flex gap-1">
                      {['WhatsApp', 'Call', 'Email', 'Meeting', 'Note'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setInlineType(t)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                            inlineType === t
                              ? 'bg-sharon-primary text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add brief interaction note..."
                      value={inlineNotes}
                      onChange={(e) => setInlineNotes(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sharon-primary"
                    />
                    <button
                      type="submit"
                      disabled={addingInline || !inlineNotes.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sharon-primary hover:bg-sharon-primary-light text-slate-950 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {addingInline ? 'Saving...' : 'Add'}
                    </button>
                  </div>
                </form>

                {/* Timeline Stream */}
                <div className="space-y-4 pt-2">
                  {interactionsLoading ? (
                    <div className="text-center py-6 text-slate-500 text-xs animate-pulse">
                      Loading interaction history...
                    </div>
                  ) : interactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/40 p-4">
                      No logged interactions yet. Click "Log Touchpoint" to add the first note.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {interactions.map((interaction) => {
                        const badgeStyle =
                          channelBadges[interaction.type] || channelBadges['Note'];

                        return (
                          <div key={interaction.id} className="relative group">
                            {/* Timeline bullet dot */}
                            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-teal-500 group-hover:scale-125 transition-transform" />

                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-all">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${badgeStyle}`}>
                                    {interaction.type}
                                  </span>
                                  <span className="font-mono text-slate-400 text-[11px]">
                                    {interaction.interaction_date}
                                  </span>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      await deleteInteraction(interaction.id);
                                      toast('Interaction removed', 'info');
                                    } catch (err: any) {
                                      toast(err.message || 'Failed to remove', 'error');
                                    }
                                  }}
                                  className="text-slate-600 hover:text-rose-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                  title="Delete note"
                                >
                                  🗑️
                                </button>
                              </div>

                              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                                {interaction.notes}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <PersonFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPerson(null);
        }}
        person={editingPerson}
        onSave={async (data) => {
          if (editingPerson) {
            await updatePerson(editingPerson.id, data);
            toast('Person updated successfully', 'success');
          } else {
            const created = await createPerson(data);
            if (created) setSelectedPersonId(created.id);
            toast('Person created successfully', 'success');
          }
        }}
      />

      <MarkContactedModal
        isOpen={isMarkContactedOpen}
        onClose={() => setIsMarkContactedOpen(false)}
        person={selectedPerson}
        onConfirm={async (options) => {
          if (selectedPerson) {
            await markContacted(selectedPerson.id, options);
            toast(`Marked ${selectedPerson.name} contacted today`, 'success');
          }
        }}
      />

      <AddInteractionModal
        isOpen={isAddInteractionOpen}
        onClose={() => setIsAddInteractionOpen(false)}
        person={selectedPerson}
        onAdd={async (type, notes, date) => {
          if (selectedPerson) {
            await addInteraction(type, notes, date);
            toast('Interaction logged', 'success');
          }
        }}
      />

      <ConfirmationModal
        isOpen={Boolean(deletingPersonId)}
        onCancel={() => setDeletingPersonId(null)}
        onConfirm={async () => {
          if (deletingPersonId) {
            await deletePerson(deletingPersonId);
            setDeletingPersonId(null);
            setSelectedPersonId(null);
            toast('Person removed', 'info');
          }
        }}
        title="Delete Contact"
        message="Are you sure you want to delete this person? This will also remove their interaction history."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
