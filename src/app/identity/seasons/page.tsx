'use client';

import React, { useState } from 'react';
import { useSeasons } from '@/hooks/use-seasons';
import { Calendar, Compass, Plus, Check, Archive, ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import Link from 'next/link';
import { Divider, FieldLabel, ActionButton } from '@/components/editorial';
import { getLocalDateStr, diffDaysFromToday } from '@/lib/date-utils';

export default function SeasonsPage() {
  const {
    activeSeason,
    archivedSeasons,
    activeSeasonContext,
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
  const [startDate, setStartDate] = useState(getLocalDateStr());
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
    <div className="space-y-10 py-2 max-w-4xl mx-auto text-left font-sans animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <Link
            href="/identity"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Identity Constitution</span>
          </Link>
          <h1 className="text-4xl font-serif font-light text-foreground">
            Seasonal Chapters
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Segment your life timeline into custom seasonal themes with singular focus.
          </p>
        </div>
        {!activeSeason && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-3.5 py-1.5 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Begin New Season</span>
          </button>
        )}
      </div>

      {showCreate ? (
        /* Create form view (borderless input slots) */
        <form onSubmit={handleStartSeason} className="space-y-6 max-w-xl py-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-light text-foreground">Begin New Season Chapter</h3>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-xs font-semibold text-sharon-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 col-span-1 md:col-span-2">
              <FieldLabel>Season Name</FieldLabel>
              <input
                type="text"
                placeholder="e.g. Autumn of Integration"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
                required
              />
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <FieldLabel>Seasonal Theme & Mantra</FieldLabel>
              <input
                type="text"
                placeholder="e.g. Focus on deep systems building and quiet spiritual grounding"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
                required
              />
            </div>

            <div className="space-y-1">
              <FieldLabel>Target End Date</FieldLabel>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                required
              />
            </div>

            <div className="space-y-1">
              <FieldLabel>Primary Focus Area</FieldLabel>
              <select
                value={primaryFocus}
                onChange={(e) => setPrimaryFocus(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              >
                <option value="Career">Career & Tech</option>
                <option value="Relationships">Relationships & Love</option>
                <option value="Spiritual Life">Spiritual Life & Stillness</option>
                <option value="Health">Health & Exercise</option>
                <option value="Education">Education & Study</option>
              </select>
            </div>

            <div className="space-y-1">
              <FieldLabel>Supporting Focus Area</FieldLabel>
              <input
                type="text"
                placeholder="e.g. Family connection, endurance running"
                value={supportingFocus}
                onChange={(e) => setSupportingFocus(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <FieldLabel>Core Seasonal Intentions (one per line)</FieldLabel>
              <textarea
                placeholder="What changes deserve your energy in this chapter?"
                rows={4}
                value={intentions}
                onChange={(e) => setIntentions(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            >
              Start Season
            </button>
          </div>
        </form>
      ) : activeSeason ? (
        /* Active Season Display (typography-focused layout) */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          <div className="md:col-span-8 space-y-6">
            <div>
              <span className="text-[9px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2.5 py-0.5 rounded ">
                Current Active Chapter
              </span>
              <h2 className="font-serif text-3xl font-light text-foreground mt-2 ">
                {activeSeason.name}
              </h2>
              <p className="text-sm font-serif italic text-sharon-muted mt-2 leading-relaxed">
                Mantra: "{activeSeason.theme}"
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-sharon-muted block border-b border-card-border/10 pb-1.5">
                Core Chapter Intentions
              </span>
              
              <div className="space-y-3 pl-1">
                {activeSeason.intentions.split('\n').map((intent, idx) => (
                  <p key={idx} className="text-sm font-serif italic text-foreground/90 pl-3.5 border-l-2 border-sharon-primary/30 py-0.5 leading-relaxed">
                    {intent}
                  </p>
                ))}
              </div>
            </div>

            {showArchiveForm ? (
              /* Reflection Form */
              <form onSubmit={handleConfirmArchive} className="pt-4 border-t border-card-border/10 space-y-4">
                <div className="space-y-1">
                  <FieldLabel>Retrospective Reflection (lessons & rating)</FieldLabel>
                  <textarea
                    placeholder="Reflect on this season. What did it teach you about your values, work, and spiritual grounding?"
                    rows={4}
                    value={archiveReviewText}
                    onChange={(e) => setArchiveReviewText(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-sharon-accent hover:bg-sharon-accent/90 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Confirm Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowArchiveForm(false)}
                    className="px-3 py-1.5 border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-4 border-t border-card-border/10">
                <button
                  onClick={() => setShowArchiveForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Archive size={12} className="text-sharon-primary" />
                  <span>Archive & Conclude Chapter</span>
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-4 space-y-5 text-left border-l border-card-border/15 pl-6">
            <div>
              <span className="text-[10px] font-bold text-sharon-muted block">Chapter Timeline</span>
              <p className="text-xs text-foreground font-semibold mt-1">
                {new Date(activeSeason.start_date + 'T00:00:00').toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})} - {new Date(activeSeason.end_date + 'T00:00:00').toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
              </p>
              <span className="text-[10px] text-sharon-primary font-medium block mt-0.5 font-serif italic">
                {diffDaysFromToday(activeSeason.end_date) >= 0
                  ? `⌛ ${diffDaysFromToday(activeSeason.end_date)} days remaining`
                  : '⚠️ Season deadline reached'}
              </span>
            </div>

            {activeSeasonContext && (
              <div className="p-3 rounded-lg bg-card/60 border border-card-border/60 space-y-1">
                <span className="text-[9px] font-bold text-sharon-muted block">Strategic Operational Context</span>
                <span className="text-xs font-semibold text-foreground block">
                  🎯 {activeSeasonContext.activeSeasonalGoalsCount} active seasonal goal{activeSeasonContext.activeSeasonalGoalsCount === 1 ? '' : 's'}
                </span>
                <span className="text-[10px] text-sharon-muted block">
                  🚩 {activeSeasonContext.milestonesDueThisWeekCount} milestone{activeSeasonContext.milestonesDueThisWeekCount === 1 ? '' : 's'} due this week
                </span>
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold text-sharon-muted block">Primary Focus</span>
              <p className="text-xs text-foreground font-semibold mt-1">
                🎯 {activeSeason.primary_focus}
              </p>
            </div>

            {activeSeason.supporting_focus && (
              <div>
                <span className="text-[10px] font-bold text-sharon-muted block">Supporting Focus</span>
                <p className="text-xs text-foreground font-semibold mt-1">
                  🌱 {activeSeason.supporting_focus}
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <p className="text-xs text-sharon-muted italic py-6">No active seasons chapters running. Click "Begin New Season" to start one.</p>
      )}

      {/* Season Archives (Chronological List Index) */}
      <Divider />
      
      <div className="space-y-6 text-left">
        <div>
          <h3 className="font-serif text-xl font-medium text-foreground">Season Archives</h3>
          <p className="text-xs text-sharon-muted mt-1 font-sans">
            Your retrospected past chapters.
          </p>
        </div>

        {archivedSeasons.length > 0 ? (
          <div className="space-y-4 max-w-2xl divide-y divide-card-border/10">
            {archivedSeasons.map((season) => (
              <div key={season.id} className="pt-4 space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-foreground leading-tight">
                      {season.name}
                    </h4>
                    <p className="text-[10px] text-sharon-muted font-bold mt-0.5">
                      {new Date(season.start_date).getFullYear()} • Focus: {season.primary_focus}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold text-sharon-muted bg-sharon-muted-light/60 border border-card-border/40 px-1.5 py-0.5 rounded">
                    Concluded
                  </span>
                </div>
                
                {season.review && (
                  <p className="text-xs text-sharon-muted font-serif italic pl-3 border-l border-card-border leading-relaxed py-0.5">
                    Reflections: {season.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-sharon-muted italic py-4">No concluded season archives recorded.</p>
        )}
      </div>

    </div>
  );
}
