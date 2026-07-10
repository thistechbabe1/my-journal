'use client';

import React, { useState, useEffect } from 'react';
import { useLetters } from '@/hooks/use-letters';
import { Mail, Check, Calendar, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import {
  SectionTitle,
  Divider,
  FieldLabel,
  ActionButton,
  NotebookPage
} from '@/components/editorial';

export default function LettersPage() {
  const {
    letters,
    loading,
    saveLetter
  } = useLetters();

  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeLetter, setActiveLetter] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states matching table columns
  const [becomingWoman, setBecomingWoman] = useState('');
  const [habitsBuilt, setHabitsBuilt] = useState('');
  const [fearsSmaller, setFearsSmaller] = useState('');
  const [relationshipsGrown, setRelationshipsGrown] = useState('');
  const [futureThanks, setFutureThanks] = useState('');

  // Default month selection: current month
  useEffect(() => {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
  }, []);

  // Sync states when letter is loaded/selected
  useEffect(() => {
    if (activeLetter) {
      setBecomingWoman(activeLetter.becoming_woman || '');
      setHabitsBuilt(activeLetter.habits_built || '');
      setFearsSmaller(activeLetter.fears_smaller || '');
      setRelationshipsGrown(activeLetter.relationships_grown || '');
      setFutureThanks(activeLetter.future_thanks || '');
    } else {
      setBecomingWoman('');
      setHabitsBuilt('');
      setFearsSmaller('');
      setRelationshipsGrown('');
      setFutureThanks('');
    }
  }, [activeLetter]);

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth) return;

    setSaving(true);
    const { error, data } = await saveLetter({
      month: selectedMonth,
      becoming_woman: becomingWoman.trim() || null,
      habits_built: habitsBuilt.trim() || null,
      fears_smaller: fearsSmaller.trim() || null,
      relationships_grown: relationshipsGrown.trim() || null,
      future_thanks: futureThanks.trim() || null
    });

    setSaving(false);
    if (error) {
      toast(`Error saving letter: ${error}`, 'error');
    } else {
      toast(`Letter to self for ${formatMonthLabel(selectedMonth)} saved.`, 'success');
      setActiveLetter(data);
      setIsEditing(false);
    }
  };

  const handleSelectLetter = (letter: any) => {
    setActiveLetter(letter);
    setSelectedMonth(letter.month);
    setIsEditing(false);
  };

  const handleWriteNew = () => {
    setActiveLetter(null);
    setIsEditing(true);
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
  };

  const formatMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 font-sans">Opening time capsule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-2 max-w-full text-left font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Future Letters
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Write monthly milestones and intentions. A time capsule recording how your identity, habits, and relationships evolve.
          </p>
        </div>
        <button
          onClick={handleWriteNew}
          className="px-4 py-2 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Mail size={14} />
          <span>Write Letter</span>
        </button>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Envelope Archives (5/12 width) */}
        <div className="lg:col-span-4 space-y-6">
          <SectionTitle>Sealed Envelopes</SectionTitle>

          {letters.length > 0 ? (
            <div className="space-y-3.5">
              {letters.map((letter) => {
                const active = activeLetter?.id === letter.id;
                return (
                  <button
                    key={letter.id}
                    onClick={() => handleSelectLetter(letter)}
                    className={`w-full flex items-center justify-between p-4 border rounded-lg bg-card transition-all cursor-pointer text-left ${
                      active
                        ? 'border-sharon-primary shadow-sm'
                        : 'border-card-border hover:border-sharon-primary/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-sharon-primary">
                        <Mail size={12} className={active ? 'text-sharon-primary' : 'text-sharon-muted'} />
                        <span>Letter to Future Sharon</span>
                      </div>
                      <p className="text-[10px] text-sharon-muted font-bold uppercase tracking-wider">
                        {formatMonthLabel(letter.month)}
                      </p>
                    </div>
                    <ArrowRight size={12} className={active ? 'text-sharon-primary' : 'text-sharon-muted'} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="sharon-card p-8 text-center text-sharon-muted rounded-lg bg-sharon-muted-light/30">
              <p className="text-xs italic">No letters written yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Writing Desk / Letterhead View (8/12 width) */}
        <div className="lg:col-span-8">
          {isEditing || !activeLetter ? (
            /* Letter writing form */
            <form onSubmit={handleSaveLetter} className="sharon-card p-6 space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-4">
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground">
                    Draft Letter to Self
                  </h3>
                  <p className="text-[10px] text-sharon-muted font-sans mt-0.5">Reflect deeply, record honestly.</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-sharon-muted-light/40 border border-card-border rounded-lg px-2.5 py-1 text-xs outline-none text-foreground font-bold"
                    required
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3.5 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Check size={12} />
                    <span>Seal Letter</span>
                  </button>
                </div>
              </div>

              {/* Questionnaire */}
              <div className="space-y-4 font-sans">
                <div className="space-y-1">
                  <FieldLabel>Am I becoming the woman I wanted to be?</FieldLabel>
                  <textarea
                    rows={3}
                    value={becomingWoman}
                    onChange={(e) => setBecomingWoman(e.target.value)}
                    placeholder="Assess your values, emotional boundaries, and maturity..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <FieldLabel>What habits have I actually built?</FieldLabel>
                  <textarea
                    rows={3}
                    value={habitsBuilt}
                    onChange={(e) => setHabitsBuilt(e.target.value)}
                    placeholder="Compare intended habits against actual practice this month..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <FieldLabel>What fears have become smaller?</FieldLabel>
                  <textarea
                    rows={3}
                    value={fearsSmaller}
                    onChange={(e) => setFearsSmaller(e.target.value)}
                    placeholder="Identify areas of anxious friction that you handled with calm..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <FieldLabel>What relationships have grown?</FieldLabel>
                  <textarea
                    rows={3}
                    value={relationshipsGrown}
                    onChange={(e) => setRelationshipsGrown(e.target.value)}
                    placeholder="Family connections, team bonds, mentorship updates..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <FieldLabel>What did I do this month that my future self will thank me for?</FieldLabel>
                  <textarea
                    rows={3}
                    value={futureThanks}
                    onChange={(e) => setFutureThanks(e.target.value)}
                    placeholder="Important system building, writing, planning, or focus choices..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* Stationary Letterhead Read-only view */
            <NotebookPage className="border border-card-border p-8 sm:p-12 shadow-sm font-serif max-w-2xl mx-auto bg-card text-left">
              <div className="flex justify-between items-start border-b border-card-border pb-4 mb-6">
                <div>
                  <span className="text-[10px] text-sharon-muted font-sans tracking-widest uppercase">
                    Unsealed envelope
                  </span>
                  <h2 className="text-3xl font-serif font-light text-foreground mt-1 tracking-wide">
                    Letter to Future Sharon
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-sharon-muted-light/50 border border-card-border rounded-lg text-xs font-bold text-sharon-primary font-sans uppercase">
                    {formatMonthLabel(activeLetter.month)}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg border border-card-border hover:bg-sharon-muted-light text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
                    title="Edit letter"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>

              {/* Display Fields */}
              <div className="space-y-6 leading-relaxed text-foreground font-journal font-light">
                {activeLetter.becoming_woman && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest font-sans block">Becoming the woman I want to be:</span>
                    <p className="text-sm font-serif italic whitespace-pre-line pl-1">{activeLetter.becoming_woman}</p>
                  </div>
                )}

                {activeLetter.habits_built && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest font-sans block">Habits built this month:</span>
                    <p className="text-sm font-serif italic whitespace-pre-line pl-1">{activeLetter.habits_built}</p>
                  </div>
                )}

                {activeLetter.fears_smaller && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest font-sans block">Fears made smaller:</span>
                    <p className="text-sm font-serif italic whitespace-pre-line pl-1">{activeLetter.fears_smaller}</p>
                  </div>
                )}

                {activeLetter.relationships_grown && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest font-sans block">Relational connections:</span>
                    <p className="text-sm font-serif italic whitespace-pre-line pl-1">{activeLetter.relationships_grown}</p>
                  </div>
                )}

                {activeLetter.future_thanks && (
                  <div className="space-y-1 bg-sharon-accent/5 border border-sharon-accent/15 p-4 rounded-lg">
                    <span className="text-[9px] font-bold text-sharon-accent uppercase tracking-widest font-sans block">My future self will thank me for:</span>
                    <p className="text-sm font-serif italic whitespace-pre-line mt-1">{activeLetter.future_thanks}</p>
                  </div>
                )}
              </div>
            </NotebookPage>
          )}
        </div>
      </div>
    </div>
  );
}
