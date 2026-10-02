'use client';

import React, { useState, useEffect } from 'react';
import { useMemoirs } from '@/hooks/use-memoirs';
import { useSeasons } from '@/hooks/use-seasons';
import { BookOpen, Compass, Award, Star, ArrowLeft, Search, Calendar, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

export default function MemoirsPage() {
  const {
    memoirs,
    totalCount,
    onThisDayMemoirs,
    activeDossier,
    filter,
    page,
    totalPages,
    loading,
    dossierLoading,
    setPage,
    setYearFilter,
    setTypeFilter,
    setSearchQuery,
    loadSeasonalDossier
  } = useMemoirs({}, 10);

  const { archivedSeasons } = useSeasons();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');

  useEffect(() => {
    if (archivedSeasons.length > 0 && !selectedSeasonId) {
      const firstId = archivedSeasons[0].id;
      setSelectedSeasonId(firstId);
      loadSeasonalDossier(firstId);
    }
  }, [archivedSeasons, selectedSeasonId, loadSeasonalDossier]);

  const handleSelectSeason = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    if (seasonId) {
      loadSeasonalDossier(seasonId);
    }
  };

  const typeLabels = {
    journal: 'Journal Memoir',
    season_review: 'Season Concluded',
    goal_achieved: 'Goal Achieved',
    period_review: 'Period Review',
    future_letter: 'Future Letter',
    timeline_event: 'Life Milestone'
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4 font-sans text-left animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <Link
            href="/library"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Library Vault</span>
          </Link>
          <h1 className="text-4xl font-serif font-light text-foreground">
            Memoirs & Archives
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-serif italic">
            "Your life, recorded over time."
          </p>
        </div>
      </div>

      {/* 1. On This Day in Past Years */}
      {onThisDayMemoirs.length > 0 && (
        <div className="space-y-4 bg-card/40 border border-card-border/60 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-sharon-primary" />
              <h2 className="font-serif text-xl font-medium text-foreground">On This Day in Past Years</h2>
            </div>
            <span className="text-[10px] font-bold text-sharon-muted ">
              Exact Date Matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {onThisDayMemoirs.map((memoir) => (
              <div key={memoir.id} className="p-4 rounded-xl bg-card border border-card-border/40 space-y-2 text-left">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold text-sharon-primary ">
                    {new Date(memoir.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Link
                    href={memoir.linkedEntityUrl}
                    className="text-[10px] font-semibold text-sharon-muted hover:text-sharon-primary flex items-center gap-1"
                  >
                    <span>View Record</span>
                    <ExternalLink size={9} />
                  </Link>
                </div>
                <h4 className="font-serif text-base font-semibold text-foreground leading-snug">
                  {memoir.title}
                </h4>
                <p className="text-xs text-sharon-muted font-serif italic leading-relaxed line-clamp-3">
                  "{memoir.excerpt}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Seasonal Retrospective Dossier (Centerpiece) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-card-border/40 pb-3">
          <div>
            <h2 className="font-serif text-2xl font-light text-foreground">Seasonal Retrospective Dossiers</h2>
            <p className="text-xs text-sharon-muted">Deep relational retrospective archive for concluded life chapters.</p>
          </div>

          {archivedSeasons.length > 0 && (
            <select
              value={selectedSeasonId}
              onChange={(e) => handleSelectSeason(e.target.value)}
              className="bg-card border border-card-border rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              {archivedSeasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({new Date(s.start_date + 'T00:00:00').getFullYear()})
                </option>
              ))}
            </select>
          )}
        </div>

        {dossierLoading ? (
          <div className="py-12 text-center">
            <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-sharon-muted mt-3">Compiling seasonal dossier...</p>
          </div>
        ) : activeDossier ? (
          <div className="bg-card border border-card-border/60 rounded-2xl p-6 md:p-8 space-y-8 text-left shadow-xs">
            {/* Dossier Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border/30 pb-6">
              <div>
                <span className="text-[9px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2.5 py-0.5 rounded ">
                  Concluded Chapter Dossier
                </span>
                <h3 className="font-serif text-3xl font-medium text-foreground mt-2">
                  {activeDossier.season.name}
                </h3>
                <p className="text-sm font-serif italic text-sharon-muted mt-1">
                  Mantra: "{activeDossier.season.theme}"
                </p>
              </div>

              <div className="text-left md:text-right space-y-1 border-t md:border-t-0 md:border-l border-card-border/30 pt-3 md:pt-0 md:pl-6">
                <span className="text-xs font-semibold text-foreground block">
                  {new Date(activeDossier.season.start_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} — {new Date((activeDossier.season.end_date || activeDossier.season.start_date) + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-xs text-sharon-primary font-medium block">
                  🎯 Focus: {activeDossier.season.primary_focus}
                </span>
              </div>
            </div>

            {/* What Happened Breakdown Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sharon-muted-light/20 border border-card-border/30 p-4 rounded-xl">
              <div>
                <span className="text-[9px] font-bold text-sharon-muted block">Goals</span>
                <span className="text-xl font-serif font-bold text-foreground">{activeDossier.completedGoalsCount} / {activeDossier.goalsCount}</span>
                <span className="text-[10px] text-sharon-muted block">Achieved</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sharon-muted block">Campaigns</span>
                <span className="text-xl font-serif font-bold text-foreground">{activeDossier.campaignsCount}</span>
                <span className="text-[10px] text-sharon-muted block">Executed</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sharon-muted block">Milestones</span>
                <span className="text-xl font-serif font-bold text-foreground">{activeDossier.milestonesCount}</span>
                <span className="text-[10px] text-sharon-muted block">Established</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-sharon-muted block">Tasks</span>
                <span className="text-xl font-serif font-bold text-foreground">{activeDossier.completedTasksCount}</span>
                <span className="text-[10px] text-sharon-muted block">Completed</span>
              </div>
            </div>

            {/* Seasonal Goals List */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-sharon-muted block border-b border-card-border/20 pb-1">
                Seasonal Goals
              </span>
              {activeDossier.goals.length > 0 ? (
                <div className="space-y-2">
                  {activeDossier.goals.map((g) => {
                    const isCompleted = g.status === 'completed' || g.progress === 100;
                    return (
                      <div key={g.id} className="flex items-center justify-between p-3 rounded-lg border border-card-border/40 bg-card/60">
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-foreground block">{g.title}</span>
                          <span className="text-[10px] text-sharon-muted">{g.category}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-sharon-primary border-emerald-500/20'
                            : 'bg-amber-500/10 text-sharon-primary border-amber-500/20'
                        }`}>
                          {isCompleted ? 'Completed' : 'Carried Forward'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-sharon-muted italic">No goals specifically tagged to this season.</p>
              )}
            </div>

            {/* Closing Retrospective Reflection */}
            {activeDossier.season.review && (
              <div className="space-y-2 pt-2 border-t border-card-border/30">
                <span className="text-[10px] font-bold text-sharon-muted block">
                  Closing Chapter Reflection
                </span>
                <p className="text-sm font-serif italic text-foreground/90 pl-4 border-l-2 border-sharon-primary py-1 leading-relaxed bg-sharon-primary/5 rounded-r-lg">
                  "{activeDossier.season.review}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-sharon-muted italic py-6">No concluded season archives recorded yet.</p>
        )}
      </div>

      <Divider />

      {/* 3. Memoir Search & Chronological Read-Model Stream */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-light text-foreground">Complete Archive Index</h2>
            <p className="text-xs text-sharon-muted">Chronological read-model stream across all your records.</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-3 top-2.5 text-sharon-muted" />
            <input
              type="text"
              placeholder="Search archives..."
              value={filter.searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-card-border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-sharon-primary text-foreground placeholder:text-sharon-muted/40"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {['all', 'journal', 'season_review', 'goal_achieved', 'period_review', 'timeline_event'].map((typeKey) => (
            <button
              key={typeKey}
              onClick={() => setTypeFilter(typeKey as any)}
              className={`px-3 py-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                (filter.type || 'all') === typeKey
                  ? 'bg-sharon-primary text-white border-sharon-primary'
                  : 'bg-card border-card-border/60 text-sharon-muted hover:border-sharon-primary/40'
              }`}
            >
              {typeKey === 'all' ? 'All Records' : typeLabels[typeKey as keyof typeof typeLabels]}
            </button>
          ))}
        </div>

        {/* Paginated Memoirs List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : memoirs.length > 0 ? (
          <div className="space-y-4">
            {memoirs.map((memoir) => (
              <div key={memoir.id} className="p-5 rounded-xl bg-card border border-card-border/60 space-y-2 text-left hover:border-sharon-primary/30 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded">
                      {typeLabels[memoir.sourceType]}
                    </span>
                    <span className="text-xs font-semibold text-sharon-muted">
                      {new Date(memoir.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <Link
                    href={memoir.linkedEntityUrl}
                    className="text-[10px] font-semibold text-sharon-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Source</span>
                    <ExternalLink size={10} />
                  </Link>
                </div>

                <h3 className="font-serif text-xl font-medium text-foreground">
                  {memoir.title}
                </h3>

                <p className="text-xs text-sharon-muted font-serif italic leading-relaxed">
                  {memoir.excerpt}
                </p>

                {memoir.tags && memoir.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {memoir.tags.map((t, idx) => (
                      <span key={idx} className="text-[9px] font-semibold text-sharon-muted/70 bg-sharon-muted-light/40 px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-card-border/30">
              <span className="text-xs text-sharon-muted font-sans">
                Showing {memoirs.length} of {totalCount} records (Page {page} of {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs font-semibold text-foreground hover:bg-sharon-muted-light/60 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={12} /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs font-semibold text-foreground hover:bg-sharon-muted-light/60 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-sharon-muted italic py-12 text-center">No records matched your search filters.</p>
        )}
      </div>

    </div>
  );
}
