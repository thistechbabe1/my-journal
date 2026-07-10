'use client';

import React, { useState, useEffect } from 'react';
import { useIdentity } from '@/hooks/use-identity';
import { useJournal } from '@/hooks/use-journal';
import { useHabits } from '@/hooks/use-habits';
import { useGoals } from '@/hooks/use-goals';
import { useCheckIn } from '@/hooks/use-checkin';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';
import { Calendar, Check, Sparkles, Award, Edit3, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import {
  SectionTitle,
  Divider,
  FieldLabel,
  QuoteBlock,
  QuietProgress,
  ActionButton
} from '@/components/editorial';
import { CampaignTask } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, loading: identityLoading } = useIdentity();
  const { toast } = useToast();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18; // Default ritual window starts at 6 PM

  const {
    entries,
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

  const {
    checkIn,
    growthLog,
    weeklyConsistency,
    loading: checkInLoading,
    saveCheckIn,
    saveGrowthLog
  } = useCheckIn(todayStr);

  const {
    activeCampaign,
    activeTasks,
    loading: campaignsLoading,
    saveTask,
    toggleTaskCompleted,
    toggleTaskPublished
  } = useCampaigns();

  // Local editor states
  const [editingFocus, setEditingFocus] = useState(false);
  const [editingTask, setEditingTask] = useState<CampaignTask | null>(null);
  const [draftText, setDraftText] = useState('');
  const [taskPublished, setTaskPublished] = useState(false);

  // Check-in form states
  const [prayed, setPrayed] = useState(false);
  const [exercised, setExercised] = useState(false);
  const [builtText, setBuiltText] = useState('');
  const [learnedNew, setLearnedNew] = useState(false);
  const [networked, setNetworked] = useState(false);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(3);
  const [winText, setWinText] = useState('');
  const [improveText, setImproveText] = useState('');
  const [savingCheckIn, setSavingCheckIn] = useState(false);

  // Intellectual Growth Reflection State
  const [growthReflection, setGrowthReflection] = useState('');
  const [savingGrowth, setSavingGrowth] = useState(false);

  // Sync Check-in local states
  useEffect(() => {
    if (checkIn) {
      setPrayed(checkIn.prayed);
      setExercised(checkIn.exercised);
      setBuiltText(checkIn.built_text || '');
      setLearnedNew(checkIn.learned_new);
      setNetworked(checkIn.networked);
      setEnergy(checkIn.energy || 7);
      setMood(checkIn.mood || 3);
      setWinText(checkIn.win || '');
      setImproveText(checkIn.improve || '');
    }
  }, [checkIn]);

  // Sync Intellectual Growth text area
  useEffect(() => {
    if (growthLog) {
      setGrowthReflection(growthLog.response || '');
    } else {
      setGrowthReflection('');
    }
  }, [growthLog]);

  const handleSaveCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCheckIn(true);
    const { error } = await saveCheckIn({
      prayed,
      exercised,
      built_text: builtText.trim() || null,
      learned_new: learnedNew,
      networked,
      energy,
      mood,
      win: winText.trim() || null,
      improve: improveText.trim() || null
    });
    setSavingCheckIn(false);

    if (error) {
      toast(`Error saving check-in: ${error}`, 'error');
    } else {
      toast('Daily check-in updated successfully.', 'success');
    }
  };

  const handleSaveGrowthLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!growthReflection.trim()) return;

    setSavingGrowth(true);
    const prompt = getDailyIntellectualPrompt();
    const { error } = await saveGrowthLog(prompt.type, growthReflection.trim());
    setSavingGrowth(false);

    if (error) {
      toast(`Error saving reflection: ${error}`, 'error');
    } else {
      toast('Intellectual Growth recorded.', 'success');
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

  const handleOpenDraftDrawer = (task: CampaignTask) => {
    setEditingTask(task);
    setDraftText(task.draft || '');
    setTaskPublished(task.published);
  };

  const handleSaveTaskDraft = async () => {
    if (!editingTask) return;
    const { error } = await saveTask({
      ...editingTask,
      draft: draftText.trim(),
      published: taskPublished
    });

    if (error) {
      toast(`Error saving draft: ${error}`, 'error');
    } else {
      toast('Campaign post draft saved.', 'success');
      setEditingTask(null);
    }
  };

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

  const getDailyIntellectualPrompt = () => {
    const day = new Date(todayStr).getDay();
    const prompts = [
      {
        type: 'reflection',
        title: 'Sunday — Reflection',
        activities: 'What went well? What didn\'t? What will I improve?',
        question: 'Reflect on this past week: what learnings, challenges, and improvements stood out?'
      },
      {
        type: 'logic',
        title: 'Monday — Logic',
        activities: 'Chess puzzle, Sudoku, Pattern recognition',
        question: 'Record today\'s logic challenge. How difficult was it? What did you learn?'
      },
      {
        type: 'reading',
        title: 'Tuesday — Reading',
        activities: 'Read for 15-20 mins (Engineering, Leadership, Psychology, Biographies)',
        question: 'What is one idea from today\'s reading that changed how you think?'
      },
      {
        type: 'writing',
        title: 'Wednesday — Writing',
        activities: 'Draft LinkedIn post, Journal, Blog idea, or Twitter/X thread',
        question: 'Explain one thing you learned or built this week.'
      },
      {
        type: 'problem-solving',
        title: 'Thursday — Problem Solving',
        activities: 'LeetCode, Frontend challenge, System design, UI critique, Product thinking',
        question: 'Record today\'s engineering problem. What did you solve? What was difficult?'
      },
      {
        type: 'creativity',
        title: 'Friday — Creativity',
        activities: 'Random idea generation (Design app, improve EventNav, church operations)',
        question: 'What is one problem you noticed today, and how would you design a solution?'
      },
      {
        type: 'strategy',
        title: 'Saturday — Strategy',
        activities: 'Career planning, Finance review, Monthly goals, Networking, Personal brand',
        question: 'Outline your strategy focus. What parameters or steps did you plan?'
      }
    ];
    return prompts[day];
  };

  const getEntryOneYearAgo = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const targetDateStr = oneYearAgo.toISOString().split('T')[0];
    return entries.find((e) => e.date === targetDateStr);
  };

  const entryOneYearAgo = getEntryOneYearAgo();

  const getCampaignDaysRemaining = () => {
    if (!activeCampaign) return 0;
    const end = new Date(activeCampaign.end_date).getTime();
    const now = new Date(todayStr).getTime();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const campaignDaysRemaining = getCampaignDaysRemaining();
  const prompt = getDailyIntellectualPrompt();

  const quotes = [
    { text: "Consistency beats motivation.", author: "Life Principle" },
    { text: "The quality of your life is the quality of your relationships.", author: "Tony Robbins" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Clarity creates confidence.", author: "Life Principle" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" }
  ];
  const currentQuote = quotes[new Date().getDate() % quotes.length];

  const loadingAll = identityLoading || journalLoading || habitsLoading || goalsLoading || checkInLoading || campaignsLoading;

  if (loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 font-sans">Opening dashboard sanctuary...</p>
      </div>
    );
  }

  const moodEmojis = ['😊', '😐', '😔', '😤', '😴'];
  const moodLabels = ['Calm/Joy', 'Neutral', 'Tired', 'Stressed', 'Sleepy'];

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
        
        {/* Left Column (Growth rhythms, check-in, history) - 7/12 width */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Intellectual Consistency Card */}
          <div className="space-y-4 text-left">
            <SectionTitle>Intellectual Consistency</SectionTitle>
            
            <div className="sharon-card p-5 border border-card-border bg-card space-y-4">
              <div className="border-b border-card-border/50 pb-3">
                <span className="text-[9px] font-bold text-sharon-primary uppercase tracking-widest block">{prompt.title}</span>
                <p className="text-xs text-sharon-muted mt-0.5 leading-relaxed italic">Focus today: {prompt.activities}</p>
              </div>

              <form onSubmit={handleSaveGrowthLog} className="space-y-3">
                <div className="space-y-1">
                  <FieldLabel>{prompt.question}</FieldLabel>
                  <textarea
                    rows={3}
                    value={growthReflection}
                    onChange={(e) => setGrowthReflection(e.target.value)}
                    placeholder="Type your reflection answer here..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                    disabled={savingGrowth}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <ActionButton type="submit" variant="primary" disabled={savingGrowth} className="text-[10px] px-3.5 py-1.5 font-semibold">
                    {savingGrowth ? 'Recording...' : 'Record Growth'}
                  </ActionButton>
                </div>
              </form>

              {/* Weekly Scorecard */}
              <div className="pt-3 border-t border-card-border/40 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-sharon-muted uppercase tracking-wider">
                  <span>Growth Rhythm Check</span>
                  <span className="text-sharon-primary">{weeklyConsistency.rate}% Consistency</span>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center select-none">
                  {weeklyConsistency.scorecard.map((day) => (
                    <div key={day.key} className="space-y-1" title={day.label}>
                      <span className="block text-[8px] text-sharon-muted font-bold tracking-wide">{day.label.slice(0, 3)}</span>
                      <div className={`mx-auto w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        day.completed
                          ? 'bg-sharon-accent border-sharon-accent text-white'
                          : 'border-card-border text-transparent bg-sharon-muted-light/20'
                      }`}>
                        <Check size={9} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

          {/* Daily Check-in Evening Questionnaire */}
          {(isEvening || checkIn) && (
            <>
              <Divider />
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <SectionTitle>Daily Check-in</SectionTitle>
                  <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Evening Review</span>
                </div>

                <form onSubmit={handleSaveCheckIn} className="space-y-5 sharon-card p-5 border border-card-border bg-card font-sans">
                  
                  {/* Binary toggles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
                    {[
                      { key: 'prayed', label: 'Prayed Today', value: prayed, setter: setPrayed },
                      { key: 'exercised', label: 'Exercised', value: exercised, setter: setExercised },
                      { key: 'learned', label: 'Learned New', value: learnedNew, setter: setLearnedNew },
                      { key: 'networked', label: 'Networked', value: networked, setter: setNetworked }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => item.setter(!item.value)}
                        className={`py-2 px-2 border rounded-lg text-[10px] font-bold uppercase tracking-wider text-center cursor-pointer transition-all ${
                          item.value
                            ? 'bg-sharon-accent border-sharon-accent text-white shadow-xs'
                            : 'border-card-border hover:bg-sharon-muted-light/30 text-sharon-muted'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Energy & Mood sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-sharon-muted uppercase tracking-widest">
                        <span>Energy level</span>
                        <span className="text-sharon-primary font-sans">{energy}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={energy}
                        onChange={(e) => setEnergy(parseInt(e.target.value))}
                        className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-sharon-primary mt-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Mood Alignment</span>
                      <div className="flex justify-between select-none">
                        {moodEmojis.map((emoji, index) => {
                          const rating = index + 1;
                          const active = mood === rating;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setMood(rating)}
                              className={`w-9 h-9 text-base rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                                active
                                  ? 'border-sharon-primary bg-sharon-primary-light/10 font-bold shadow-xs'
                                  : 'border-card-border hover:bg-sharon-muted-light/30'
                              }`}
                              title={moodLabels[index]}
                            >
                              {emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Narrative details */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <FieldLabel>What did you build today?</FieldLabel>
                      <input
                        type="text"
                        value={builtText}
                        onChange={(e) => setBuiltText(e.target.value)}
                        placeholder="e.g. Next.js pages, SQL schemas, church ops designs..."
                        className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel>One win today</FieldLabel>
                      <input
                        type="text"
                        value={winText}
                        onChange={(e) => setWinText(e.target.value)}
                        placeholder="What are you grateful for/proud of?"
                        className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <FieldLabel>One thing to improve tomorrow</FieldLabel>
                      <input
                        type="text"
                        value={improveText}
                        onChange={(e) => setImproveText(e.target.value)}
                        placeholder="Refinements, limits, or adjustments..."
                        className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1 border-t border-card-border/50">
                    <ActionButton type="submit" disabled={savingCheckIn} variant="primary" className="text-[10px] px-3.5 py-1.5 font-semibold">
                      {savingCheckIn ? 'Saving...' : 'Save Check-in'}
                    </ActionButton>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Active Campaign, Quote, Habits (5/12 width) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Campaign Widget */}
          {activeCampaign && (
            <div className="sharon-card p-5 border border-sharon-primary/30 bg-sharon-primary-light/5 text-left font-sans space-y-3.5">
              <div className="flex justify-between items-start border-b border-card-border/40 pb-2.5">
                <div>
                  <span className="text-[8px] font-bold text-sharon-primary uppercase tracking-widest bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded">
                    Active Campaign
                  </span>
                  <h3 className="font-serif text-lg font-medium text-foreground tracking-wide mt-1.5">{activeCampaign.title}</h3>
                  <span className="text-[9px] text-sharon-muted font-bold uppercase tracking-wider block mt-0.5">
                    {campaignDaysRemaining} days remaining
                  </span>
                </div>
              </div>

              {/* Tasks list summary */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {activeTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded bg-background border border-card-border/60 hover:border-sharon-primary/30 transition-all select-none">
                    <button
                      onClick={() => toggleTaskCompleted(task.id, !task.completed)}
                      className="flex items-center gap-2 flex-1 text-left cursor-pointer truncate"
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                        task.completed ? 'bg-sharon-accent border-sharon-accent text-white' : 'border-card-border bg-transparent hover:border-sharon-accent'
                      }`}>
                        {task.completed && <Check size={8} />}
                      </div>
                      <div className="truncate">
                        <span className={`text-[11px] font-bold block ${task.completed ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
                          {task.title}
                        </span>
                        <span className="text-[9px] text-sharon-muted truncate block">
                          {task.prompt}
                        </span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleOpenDraftDrawer(task)}
                      className="text-sharon-muted hover:text-foreground p-1 cursor-pointer transition-colors"
                      title="Edit Draft"
                    >
                      <Edit3 size={11} />
                    </button>
                  </div>
                ))}
              </div>

              {activeTasks.length > 3 && (
                <div className="text-center pt-1 border-t border-card-border/30">
                  <span className="text-[9px] text-sharon-muted font-bold tracking-wide uppercase">
                    and {activeTasks.length - 3} other items in pipeline
                  </span>
                </div>
              )}
            </div>
          )}

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

      {/* Campaign Post Draft Drawer / Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-card-border p-6 rounded-lg max-w-md w-full shadow-sm text-left space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-card-border pb-3">
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground">Draft Post: {editingTask.title}</h3>
                <span className="text-[9px] text-sharon-muted font-bold block">{editingTask.prompt}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <FieldLabel>Post Copy Draft</FieldLabel>
                <textarea
                  rows={6}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Draft your story telling narrative here..."
                  className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2.5 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 select-none py-1">
                <button
                  type="button"
                  onClick={() => setTaskPublished(!taskPublished)}
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                    taskPublished ? 'bg-sharon-accent border-sharon-accent text-white' : 'border-card-border bg-transparent'
                  }`}
                >
                  {taskPublished && <Check size={8} />}
                </button>
                <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-wider">
                  Published to LinkedIn / X
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTaskDraft}
                className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}

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
