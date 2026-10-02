'use client';

import React from 'react';
import { useMemoirs } from '@/hooks/use-memoirs';
import { Clock, ArrowLeft, Award, Book, Compass, Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TimelinePage() {
  const {
    memoirs,
    totalCount,
    filter,
    page,
    totalPages,
    loading,
    setPage,
    setYearFilter,
    setTypeFilter
  } = useMemoirs({}, 15);

  const icons = {
    journal: Book,
    season_review: Compass,
    goal_achieved: Award,
    period_review: Star,
    future_letter: Book,
    timeline_event: Clock
  };

  const colors = {
    journal: 'text-foreground bg-sharon-muted-light/60 border-card-border/40',
    season_review: 'text-sharon-accent bg-sharon-accent/10 border-sharon-accent/20',
    goal_achieved: 'text-sharon-primary bg-emerald-500/10 border-emerald-500/20',
    period_review: 'text-sharon-primary bg-sharon-primary/10 border-sharon-primary/20',
    future_letter: 'text-sharon-primary bg-purple-400/10 border-purple-400/20',
    timeline_event: 'text-sharon-primary bg-amber-500/10 border-amber-500/20'
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
    <div className="space-y-10 max-w-2xl mx-auto py-2 font-sans text-left animate-fade-in">
      
      {/* Page Header */}
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
            Life Timeline
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-serif italic">
            "Your life, recorded over time." — Chronological autobiography stream.
          </p>
        </div>
        <Link
          href="/library/memoirs"
          className="px-3.5 py-1.5 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Compass size={13} className="text-sharon-primary" />
          <span>Memoirs & Archives</span>
        </Link>
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
            {typeKey === 'all' ? 'All Milestones' : typeLabels[typeKey as keyof typeof typeLabels]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : memoirs.length > 0 ? (
        <div className="space-y-6">
          <div className="relative border-l border-card-border/30 pl-6 ml-3 space-y-8 text-left">
            {memoirs.map((item) => {
              const Icon = icons[item.sourceType] || Clock;
              const dateLabel = new Date(item.date + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={item.id} className="relative group space-y-1">
                  {/* Timeline node icon */}
                  <div className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${colors[item.sourceType]}`}>
                    <Icon size={12} />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-sharon-muted ">
                      <span>{dateLabel}</span>
                      <span>•</span>
                      <span className="text-sharon-primary">{typeLabels[item.sourceType]}</span>
                    </div>

                    <Link
                      href={item.linkedEntityUrl}
                      className="text-[10px] font-semibold text-sharon-muted hover:text-sharon-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span>Open Source</span>
                      <ExternalLink size={9} />
                    </Link>
                  </div>

                  <h3 className="text-sm font-semibold text-foreground leading-snug">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-sharon-muted leading-relaxed font-serif italic max-w-xl">
                    {item.excerpt}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-card-border/30">
            <span className="text-xs text-sharon-muted">
              Showing {memoirs.length} of {totalCount} events (Page {page} of {totalPages})
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
        <p className="text-xs text-sharon-muted italic py-12 text-center">Timeline index is empty. Complete goals, conclude seasons, or log journal entries to populate records here.</p>
      )}

    </div>
  );
}
