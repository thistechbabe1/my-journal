'use client';

import React, { useState, useEffect } from 'react';
import { useIdentity } from '@/hooks/use-identity';
import { useJournal } from '@/hooks/use-journal';
import { useHabits } from '@/hooks/use-habits';
import { useGoals } from '@/hooks/use-goals';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Calendar, Check, Sparkles, Award } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import {
  SectionTitle,
  Divider,
  FieldLabel,
  QuoteBlock,
  QuietProgress,
  ActionButton
} from '@/components/editorial';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, lifeAreas, loading: identityLoading } = useIdentity();
  const { toast } = useToast();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const {
    entries,
    dailyFocus,
    saveDailyFocus,
    saveEntry,
    loading: journalLoading
  } = useJournal();
  
  const {
    habits,
    toggleHabit,
    loading: habitsLoading
  } = useHabits(todayStr);

  const {
    goals,
    loading: goalsLoading
  } = useGoals();

  const [mounted, setMounted] = useState(false);
  const [editingFocus, setEditingFocus] = useState(false);
  const [topPriority, setTopPriority] = useState('');
  const [secondaryPriority, setSecondaryPriority] = useState('');

  // Evening Reflection states
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatChallenged, setWhatChallenged] = useState('');
  const [whatCarry, setWhatCarry] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  // Sync priorities when dailyFocus loads
  useEffect(() => {
    setMounted(true);
    if (dailyFocus) {
      setTopPriority(dailyFocus.top_priority || '');
      setSecondaryPriority(dailyFocus.secondary_priority || '');
    } else {
      setTopPriority('');
      setSecondaryPriority('');
    }
  }, [dailyFocus]);

  // Sync evening reflections when today's journal entry loads
  useEffect(() => {
    const todayEntry = entries.find((e) => e.date === todayStr);
    if (todayEntry) {
      setWhatWentWell(todayEntry.grateful || '');
      setWhatChallenged(todayEntry.challenged || '');
      setWhatCarry(todayEntry.better || '');
    }
  }, [entries, todayStr]);

  const handleSaveFocus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topPriority.trim()) return;

    const { error } = await saveDailyFocus({
      date: todayStr,
      top_priority: topPriority,
      secondary_priority: secondaryPriority || null,
      reflection: null
    });

    if (error) {
      toast(`Error updating focus: ${error}`, 'error');
    } else {
      toast('Focus priorities updated.', 'success');
      setEditingFocus(false);
    }
  };

  const handleSaveEveningReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReflection(true);
    const todayEntry = entries.find((e) => e.date === todayStr);

    const { error } = await saveEntry({
      ...todayEntry,
      date: todayStr,
      grateful: whatWentWell.trim() || null,
      challenged: whatChallenged.trim() || null,
      better: whatCarry.trim() || null,
      content: todayEntry?.content || '',
      mood: todayEntry?.mood || 3,
      tags: todayEntry?.tags || []
    });

    setSavingReflection(false);
    if (error) {
      toast(`Error saving evening reflection: ${error}`, 'error');
    } else {
      toast('Evening reflection saved successfully.', 'success');
    }
  };

  const handleToggleHabit = async (habitId: string, currentCompleted: boolean) => {
    const { error } = await toggleHabit(habitId, !currentCompleted);
    if (error) {
      toast(`Error toggling rhythm: ${error}`, 'error');
    } else {
      toast('Rhythm status updated.', 'success');
    }
  };

  const quotes = [
    { text: "Consistency beats motivation.", author: "Life Principle" },
    { text: "The quality of your life is the quality of your relationships.", author: "Tony Robbins" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Clarity creates confidence.", author: "Life Principle" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" }
  ];

  const currentQuote = quotes[new Date().getDate() % quotes.length];

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getSeasonalTheme = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const quarter = Math.ceil((month + 1) / 3);
    
    const seasonTheme = "Building Foundations";
    const quarterThemes = ["Learning", "Consistency", "Courage", "Stewardship"];
    const qTheme = quarterThemes[quarter - 1];

    return {
      year,
      seasonTheme,
      quarter,
      qTheme
    };
  };

  const themeInfo = getSeasonalTheme();

  const getEntryOneYearAgo = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const targetDateStr = oneYearAgo.toISOString().split('T')[0];
    return entries.find((e) => e.date === targetDateStr);
  };

  const entryOneYearAgo = getEntryOneYearAgo();
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18; // Reflect starting at 6 PM

  const loadingAll = identityLoading || journalLoading || habitsLoading || goalsLoading;

  if (loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 font-sans">Opening dashboard sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2 max-w-full text-left font-sans">
      {/* Page Header */}
      <div className="space-y-2 text-left border-b border-card-border/60 pb-6">
        <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
          {getGreeting()}, {profile?.name || 'Sharon'}.
        </h1>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-sharon-muted font-medium tracking-wide">
            <Calendar size={13} />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="text-[11px] font-serif italic text-sharon-muted">
            {themeInfo.year} Season: {themeInfo.seasonTheme} — Q{themeInfo.quarter}: {themeInfo.qTheme}
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Focus, journaling, history (7/12 width) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Today's Focus */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <SectionTitle>Today's Focus</SectionTitle>
              {!editingFocus && (
                <button
                  onClick={() => setEditingFocus(true)}
                  className="text-xs font-bold uppercase tracking-wider text-sharon-primary hover:text-sharon-primary-light transition-colors cursor-pointer"
                >
                  {dailyFocus ? 'Refine' : 'Define'}
                </button>
              )}
            </div>

            {editingFocus ? (
              <form onSubmit={handleSaveFocus} className="space-y-4 border border-card-border p-5 rounded-lg bg-card text-left font-sans">
                <div className="space-y-1">
                  <FieldLabel>Top Priority</FieldLabel>
                  <input
                    type="text"
                    value={topPriority}
                    onChange={(e) => setTopPriority(e.target.value)}
                    placeholder="What single outcome matters most today?"
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <FieldLabel>Secondary Priority</FieldLabel>
                  <input
                    type="text"
                    value={secondaryPriority}
                    onChange={(e) => setSecondaryPriority(e.target.value)}
                    placeholder="Supporting action..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-medium"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
                  <button
                    type="button"
                    onClick={() => setEditingFocus(false)}
                    className="px-3 py-1.5 rounded-lg border border-card-border text-[10px] font-semibold hover:bg-sharon-muted-light cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-sharon-primary text-white border border-transparent text-[10px] font-semibold cursor-pointer hover:bg-sharon-primary-light transition-colors"
                  >
                    Save Focus
                  </button>
                </div>
              </form>
            ) : dailyFocus ? (
              <div className="space-y-3 pl-1">
                <div className="py-0.5">
                  <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Top Priority</span>
                  <p className="text-base font-serif italic text-foreground mt-0.5">{dailyFocus.top_priority}</p>
                </div>

                {dailyFocus.secondary_priority && (
                  <div className="py-0.5">
                    <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Secondary Priority</span>
                    <p className="text-xs text-foreground mt-0.5 font-sans">{dailyFocus.secondary_priority}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-2 text-left space-y-2">
                <p className="text-xs text-sharon-muted italic">Silence. What single outcome deserves your focus today?</p>
              </div>
            )}
          </div>

          <Divider />

          {/* Continue Writing */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <SectionTitle>Continue Writing</SectionTitle>
              {entries.length > 0 && (
                <Link
                  href="/journal"
                  className="text-xs font-bold uppercase tracking-wider text-sharon-primary hover:text-sharon-primary-light transition-colors"
                >
                  Write Entry
                </Link>
              )}
            </div>

            {entries.length > 0 ? (
              <Link
                href={`/journal?id=${entries[0].id}`}
                className="block group"
              >
                <div className="text-[10px] text-sharon-muted font-bold tracking-widest uppercase">
                  Your latest journal entry...
                </div>
                <p className="text-sm font-serif italic text-foreground mt-1.5 line-clamp-3 leading-relaxed group-hover:text-sharon-primary transition-colors">
                  {entries[0].content}
                </p>
              </Link>
            ) : (
              <div className="py-1 text-xs text-sharon-muted italic">
                No reflections recorded yet.{' '}
                <Link href="/journal" className="underline hover:text-foreground">
                  Let down your thoughts
                </Link>.
              </div>
            )}
          </div>

          <Divider />

          {/* On This Day */}
          <div className="space-y-4 text-left">
            <SectionTitle>On This Day</SectionTitle>
            
            {entryOneYearAgo ? (
              <div className="space-y-3">
                <div className="text-[10px] text-sharon-muted font-bold tracking-widest uppercase">
                  One year ago today...
                </div>
                <p className="text-sm font-serif italic text-foreground leading-relaxed">
                  {entryOneYearAgo.content}
                </p>
                {entryOneYearAgo.learned && (
                  <div className="border-l border-card-border pl-3 py-0.5 mt-2">
                    <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Lesson Learned</span>
                    <p className="text-xs text-sharon-muted mt-0.5 font-serif italic">{entryOneYearAgo.learned}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 pl-0.5">
                <p className="text-xs text-sharon-muted leading-relaxed">
                  You haven't written anything for this date yet.
                </p>
                <p className="text-xs text-sharon-muted leading-relaxed">
                  In a year's time, today's reflections will appear here. Take a moment to write something your future self will appreciate reading.
                </p>
              </div>
            )}
          </div>

          {/* Evening Reflection */}
          {(isEvening || whatWentWell || whatChallenged || whatCarry) && (
            <>
              <Divider />
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <SectionTitle>Daily Closing Reflection</SectionTitle>
                  <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Evening Ritual</span>
                </div>

                <form onSubmit={handleSaveEveningReflection} className="space-y-4 font-sans">
                  <div className="space-y-1">
                    <FieldLabel>What went well today?</FieldLabel>
                    <textarea
                      rows={2}
                      value={whatWentWell}
                      onChange={(e) => setWhatWentWell(e.target.value)}
                      placeholder="Record appreciation, breakthroughs, or grace..."
                      className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>What challenged you?</FieldLabel>
                    <textarea
                      rows={2}
                      value={whatChallenged}
                      onChange={(e) => setWhatChallenged(e.target.value)}
                      placeholder="Obstacles, tensions, or lessons learned from friction..."
                      className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <FieldLabel>What will you carry into tomorrow?</FieldLabel>
                    <textarea
                      rows={2}
                      value={whatCarry}
                      onChange={(e) => setWhatCarry(e.target.value)}
                      placeholder="Adjustments, refinements, or grounding ideas..."
                      className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <ActionButton type="submit" disabled={savingReflection} variant="primary" className="text-[10px] px-3.5 py-1.5 font-semibold">
                      {savingReflection ? 'Saving...' : 'Save Reflection'}
                    </ActionButton>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Quotes, rhythms checklist, goals progress (5/12 width) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Rhythms Checklist */}
          <div className="sharon-card p-5 space-y-4 border border-card-border bg-card">
            <div className="flex items-center justify-between">
              <SectionTitle className="flex items-center gap-1">
                <Award size={14} className="text-sharon-accent" />
                <span>Daily Rhythms</span>
              </SectionTitle>
              <Link
                href="/habits"
                className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light uppercase tracking-wider"
              >
                Refine
              </Link>
            </div>
            
            {habits.length > 0 ? (
              <div className="space-y-2.5">
                {habits.slice(0, 5).map((habit) => {
                  const isCompleted = habit.logs && habit.logs.length > 0 && habit.logs[0].completed;
                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id, !!isCompleted)}
                      className="flex items-center gap-2.5 w-full text-left cursor-pointer group py-0.5 transition-all select-none"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                        isCompleted ? 'bg-sharon-accent border-sharon-accent text-white' : 'border-card-border bg-transparent group-hover:border-sharon-accent'
                      }`}>
                        {isCompleted && <Check size={9} />}
                      </div>
                      <span className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-sharon-muted font-medium' : 'text-foreground'}`}>
                        {habit.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-sharon-muted italic pl-0.5">
                No rhythms established today.{' '}
                <Link href="/habits" className="underline hover:text-foreground">
                  Create a habit
                </Link>.
              </div>
            )}
          </div>

          {/* Quote Card */}
          <div className="sharon-card p-5 space-y-3.5 border border-card-border bg-card">
            <SectionTitle>Quote of the Day</SectionTitle>
            <QuoteBlock quote={currentQuote.text} author={currentQuote.author} />
          </div>

          {/* Goals Card */}
          <div className="sharon-card p-5 space-y-4 border border-card-border bg-card">
            <div className="flex items-center justify-between">
              <SectionTitle>Upcoming Goals</SectionTitle>
              <Link
                href="/goals"
                className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light uppercase tracking-wider"
              >
                Track
              </Link>
            </div>
            
            {goals.length > 0 ? (
              <div className="space-y-3.5">
                {goals.slice(0, 3).map((goal) => (
                  <QuietProgress key={goal.id} label={goal.title} value={goal.progress} />
                ))}
              </div>
            ) : (
              <div className="text-xs text-sharon-muted italic pl-0.5">
                No active targets.{' '}
                <Link href="/goals" className="underline hover:text-foreground">
                  Define a goal
                </Link>.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Links Footer */}
      <div className="flex items-center justify-center gap-6 text-xs text-sharon-muted font-serif italic py-6 border-t border-card-border/40 mt-8">
        <Link href="/journal" className="hover:text-foreground transition-colors">
          Journal
        </Link>
        <span>•</span>
        <Link href="/habits" className="hover:text-foreground transition-colors">
          Habits
        </Link>
        <span>•</span>
        <Link href="/goals" className="hover:text-foreground transition-colors">
          Goals
        </Link>
        <span>•</span>
        <Link href="/reviews" className="hover:text-foreground transition-colors">
          Reviews
        </Link>
      </div>
    </div>
  );
}
