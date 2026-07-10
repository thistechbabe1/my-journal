'use client';

import React, { useState } from 'react';
import { useSeasons } from '@/hooks/use-seasons';
import { Calendar, Compass, Shield, Plus, Check, Archive, BookOpen } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import {
  SectionTitle,
  Divider,
  FieldLabel,
  ActionButton,
  EditorialCard
} from '@/components/editorial';

export default function SeasonsPage() {
  const {
    activeSeason,
    archivedSeasons,
    loading,
    saveSeason,
    archiveSeason
  } = useSeasons();

  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [archiveReviewText, setArchiveReviewText] = useState('');

  // Create Season Form States
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [primaryFocus, setPrimaryFocus] = useState('Career');
  const [supportingFocus, setSupportingFocus] = useState('');
  const [intentions, setIntentions] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStartSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !theme.trim() || !intentions.trim() || !endDate) {
      toast('Please fill out all required fields.', 'warning');
      return;
    }

    setSaving(true);
    const { error } = await saveSeason({
      name: name.trim(),
      theme: theme.trim(),
      start_date: startDate,
      end_date: endDate,
      primary_focus: primaryFocus,
      supporting_focus: supportingFocus.trim() || null,
      intentions: intentions.trim(),
      status: 'active'
    });

    setSaving(false);
    if (error) {
      toast(`Error starting season: ${error}`, 'error');
    } else {
      toast('A new season has begun.', 'success');
      setName('');
      setTheme('');
      setIntentions('');
      setSupportingFocus('');
      setShowCreate(false);
    }
  };

  const handleConfirmArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSeason) return;

    if (!archiveReviewText.trim()) {
      toast('Please record a reflection before archiving.', 'warning');
      return;
    }

    const { error } = await archiveSeason(activeSeason.id, archiveReviewText.trim());
    if (error) {
      toast(`Error archiving season: ${error}`, 'error');
    } else {
      toast('Season archived successfully.', 'success');
      setArchiveReviewText('');
      setShowArchiveForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 font-sans">Aligning life seasons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-2 max-w-full text-left font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Life Seasons
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Define the thematic chapters of your journey, focusing energy on what matters in this season of life.
          </p>
        </div>
        {!activeSeason && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Begin New Season</span>
          </button>
        )}
      </div>

      {/* Active Season Panel */}
      {activeSeason ? (
        <div className="space-y-6">
          <EditorialCard className="p-6 border-sharon-primary/40 bg-sharon-primary-light/5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-card-border/50 pb-4 mb-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-sharon-primary uppercase tracking-widest bg-sharon-primary/10 border border-sharon-primary/20 px-2.5 py-0.5 rounded">
                  Current Chapter
                </span>
                <h2 className="text-2xl font-serif font-medium text-foreground tracking-wide mt-1.5">{activeSeason.name}</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-sharon-muted font-bold uppercase tracking-wider">
                  <Calendar size={12} />
                  <span>Started: {new Date(activeSeason.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {activeSeason.end_date && (
                    <>
                      <span>·</span>
                      <span>Target: {new Date(activeSeason.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </>
                  )}
                </div>
              </div>

              {!showArchiveForm && (
                <button
                  onClick={() => setShowArchiveForm(true)}
                  className="px-3 py-1.5 rounded-lg border border-sharon-primary text-sharon-primary hover:bg-sharon-primary/5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Archive size={12} />
                  <span>Archive & Review</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block mb-0.5">Seasonal Theme</span>
                  <p className="text-base font-serif italic text-foreground font-light leading-relaxed">
                    "{activeSeason.theme}"
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block mb-0.5">Core Intentions</span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {activeSeason.intentions}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 border-t md:border-t-0 md:border-l border-card-border/60 pt-4 md:pt-0 md:pl-6">
                <div>
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block mb-0.5">Primary Focus</span>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-sharon-accent/10 border border-sharon-accent/20 text-sharon-accent-dark rounded">
                    {activeSeason.primary_focus}
                  </span>
                </div>
                {activeSeason.supporting_focus && (
                  <div>
                    <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block mb-0.5">Supporting Focus</span>
                    <span className="text-xs text-foreground font-semibold">
                      {activeSeason.supporting_focus}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </EditorialCard>

          {/* Archive Reflection Form */}
          {showArchiveForm && (
            <form onSubmit={handleConfirmArchive} className="sharon-card p-6 space-y-4 border-card-border bg-card animate-fade-in">
              <div className="flex items-center justify-between border-b border-card-border pb-3">
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground">Archive Chapter: {activeSeason.name}</h3>
                  <p className="text-[10px] text-sharon-muted mt-0.5">Record a closing reflection to encapsulate this season before beginning another.</p>
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel>Closing Review & Retrospective</FieldLabel>
                <textarea
                  rows={4}
                  value={archiveReviewText}
                  onChange={(e) => setArchiveReviewText(e.target.value)}
                  placeholder="Summarize this season: What major milestones did you reach? What habits were solidified? What did you build? How did your priorities shift?"
                  className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2.5 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
                <button
                  type="button"
                  onClick={() => setShowArchiveForm(false)}
                  className="px-4 py-2 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Archive Season
                </button>
              </div>
            </form>
          )}
        </div>
      ) : showCreate ? (
        /* Create Season Form */
        <form onSubmit={handleStartSeason} className="sharon-card p-6 space-y-4 border-card-border bg-card">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">Begin a New Season</h3>
              <p className="text-[10px] text-sharon-muted mt-0.5">Establish focus boundaries and themes for your next chapter.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Season Name</span>
              <input
                type="text"
                placeholder="e.g. Building Foundations"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Theme / Quote</span>
              <input
                type="text"
                placeholder="e.g. Consistency over intensity"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Target End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Primary Focus Area</span>
              <select
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2.5 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              >
                {['Career', 'Learning', 'Prayer', 'Exercise', 'Relationships', 'Networking', 'Finances', 'Projects', 'Health'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Supporting Focus Area</span>
              <input
                type="text"
                placeholder="e.g. Health, Learning"
                value={supportingFocus}
                onChange={(e) => setSupportingFocus(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Core Intentions (What are you trying to become this season?)</span>
            <textarea
              rows={4}
              value={intentions}
              onChange={(e) => setIntentions(e.target.value)}
              placeholder="Detail your growth goals, parameters, and indicators for this season..."
              className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
            >
              Start Season
            </button>
          </div>
        </form>
      ) : (
        /* Empty State */
        <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-sharon-muted-light flex items-center justify-center text-sharon-primary">
            <Compass size={22} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">No Active Chapter</h3>
            <p className="text-xs mt-1 font-sans">
              There is currently no active season. Define a new chapter to prioritize focus.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Begin New Season</span>
            <Plus size={12} />
          </button>
        </div>
      )}

      {/* Archived Seasons List */}
      <div className="space-y-6 pt-4">
        <SectionTitle>Archived Chapters</SectionTitle>

        {archivedSeasons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {archivedSeasons.map((season) => (
              <EditorialCard key={season.id} className="p-5 flex flex-col justify-between border-card-border bg-card">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg font-medium text-foreground">{season.name}</h3>
                      <span className="text-[9px] text-sharon-muted font-bold uppercase tracking-wider">
                        {new Date(season.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        {season.end_date && ` - ${new Date(season.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-sharon-muted italic font-serif">
                    Theme: "{season.theme}"
                  </p>

                  <div className="pt-2 border-t border-card-border/40 space-y-2">
                    <div>
                      <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block">Closing Reflection</span>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-line bg-sharon-muted-light/10 p-2.5 rounded border border-card-border/30 mt-1">
                        {season.review}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-3 border-t border-card-border/40 mt-3 text-[9px] text-sharon-muted font-bold uppercase tracking-wider">
                  <span>Focus: {season.primary_focus}</span>
                </div>
              </EditorialCard>
            ))}
          </div>
        ) : (
          <div className="sharon-card p-8 text-center text-sharon-muted rounded-lg bg-sharon-muted-light/30">
            <p className="text-xs italic">No archived chapters in your history log yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
