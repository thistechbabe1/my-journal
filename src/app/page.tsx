'use client';

import React, { useState, useEffect } from 'react';
import { useIdentity } from '@/hooks/use-identity';
import { useJournal } from '@/hooks/use-journal';
import { useHabits } from '@/hooks/use-habits';
import { useGoals } from '@/hooks/use-goals';
import { useAuth } from '@/providers/auth-provider';
import {
  Sparkles,
  Calendar,
  Quote,
  CheckCircle,
  Flame,
  Target,
  ArrowRight,
  TrendingUp,
  Award,
  ListTodo,
  User,
  Heart
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, lifeAreas, loading: identityLoading } = useIdentity();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const {
    entries,
    dailyFocus,
    saveDailyFocus,
    loading: journalLoading
  } = useJournal();
  
  const {
    habits,
    toggleHabit,
    loading: habitsLoading
  } = useHabits(todayStr);

  const {
    goals,
    toggleMilestone,
    loading: goalsLoading
  } = useGoals();

  const [mounted, setMounted] = useState(false);
  const [editingFocus, setEditingFocus] = useState(false);
  const [topPriority, setTopPriority] = useState('');
  const [secondaryPriority, setSecondaryPriority] = useState('');
  const [focusReflection, setFocusReflection] = useState('');
  const [focusMessage, setFocusMessage] = useState<string | null>(null);

  // Sync priority inputs when dailyFocus loaded
  useEffect(() => {
    setMounted(true);
    if (dailyFocus) {
      setTopPriority(dailyFocus.top_priority || '');
      setSecondaryPriority(dailyFocus.secondary_priority || '');
      setFocusReflection(dailyFocus.reflection || '');
    } else {
      setTopPriority('');
      setSecondaryPriority('');
      setFocusReflection('');
    }
  }, [dailyFocus]);

  const handleSaveFocus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topPriority.trim()) return;

    setFocusMessage(null);
    const { error } = await saveDailyFocus({
      date: todayStr,
      top_priority: topPriority,
      secondary_priority: secondaryPriority || null,
      reflection: focusReflection || null
    });

    if (error) {
      setFocusMessage(`Error: ${error}`);
    } else {
      setFocusMessage('Focus priorities logged! Growth Score updated.');
      setEditingFocus(false);
      setTimeout(() => setFocusMessage(null), 3000);
    }
  };

  const quotes = [
    { text: "Consistency beats motivation.", author: "Life Principle" },
    { text: "The quality of your life is the quality of your relationships.", author: "Tony Robbins" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "Clarity creates confidence.", author: "Life Principle" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" }
  ];

  // Select quote based on day of month
  const currentQuote = quotes[new Date().getDate() % quotes.length];

  // Radar chart formatting
  const chartData = lifeAreas.map((area) => ({
    subject: area.name,
    score: area.score,
    fullMark: 10
  }));

  // Welcome time greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const loadingAll = identityLoading || journalLoading || habitsLoading || goalsLoading;

  if (loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-sharon-muted mt-4">Assembling dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sharon-primary via-indigo-500 to-sharon-primary-light bg-clip-text text-transparent">
            {getGreeting()}, {profile?.name || 'Sharon'}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-sharon-muted font-medium mt-1">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="sharon-card p-3 flex items-center gap-2 border-sharon-accent/30 bg-sharon-accent/5">
            <Award className="text-sharon-accent-dark dark:text-sharon-accent animate-bounce" size={20} />
            <div className="text-left">
              <span className="text-[9px] font-bold text-sharon-muted block uppercase tracking-wider">Growth Score</span>
              <span className="text-sm font-black text-sharon-accent-dark dark:text-sharon-accent leading-none">
                {profile?.growth_score || 10}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Widget */}
      <div className="p-5 rounded-2xl border border-card-border bg-gradient-to-r from-sharon-primary/10 via-sharon-primary-light/5 to-sharon-accent/5 flex items-start gap-4">
        <Quote size={28} className="text-sharon-primary shrink-0 opacity-80" />
        <div className="text-left space-y-1">
          <p className="text-sm italic font-medium leading-relaxed">"{currentQuote.text}"</p>
          <p className="text-[10px] font-bold text-sharon-muted uppercase tracking-wider">— {currentQuote.author}</p>
        </div>
      </div>

      {/* Grid: Wheel of Life Radar Chart & Daily Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Life wheel radar */}
        <div className="lg:col-span-6 sharon-card p-6 sharon-card-gold flex flex-col justify-between h-[360px]">
          <div>
            <h3 className="font-bold text-sm text-sharon-muted uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-sharon-accent-dark dark:text-sharon-accent" />
              <span>Life Balance Wheel</span>
            </h3>
            <p className="text-[10px] text-sharon-muted mt-0.5">
              Visual overview of your alignment across 8 core domains. Adjust ratings in Identity.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-0 pt-2">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="var(--card-border)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: 'var(--color-sharon-muted)', fontSize: 10, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: 'var(--color-sharon-muted)', fontSize: 9 }} />
                  <Radar
                    name="Sharon"
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-sharon-muted">Chart loading...</div>
            )}
          </div>
        </div>

        {/* Daily Focus Panel */}
        <div className="lg:col-span-6 sharon-card p-6 sharon-card-purple flex flex-col justify-between min-h-[360px]">
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-sharon-muted uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo size={14} className="text-sharon-primary" />
                <span>Today's Daily Focus</span>
              </h3>
              {!editingFocus && (
                <button
                  onClick={() => setEditingFocus(true)}
                  className="text-xs font-bold text-sharon-primary hover:text-sharon-primary-light cursor-pointer"
                >
                  Edit priorities
                </button>
              )}
            </div>

            {focusMessage && (
              <div className="p-2.5 rounded-lg bg-sharon-primary-light/10 border border-sharon-primary-light/20 text-sharon-primary text-[10px] font-semibold dark:text-purple-300">
                {focusMessage}
              </div>
            )}

            {editingFocus ? (
              <form onSubmit={handleSaveFocus} className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Top Priority</span>
                  <input
                    type="text"
                    value={topPriority}
                    onChange={(e) => setTopPriority(e.target.value)}
                    placeholder="What single outcome matters most today?"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Secondary Priority</span>
                  <input
                    type="text"
                    value={secondaryPriority}
                    onChange={(e) => setSecondaryPriority(e.target.value)}
                    placeholder="Supporting priority (workout, learning block)..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-wider">Evening Reflection</span>
                  <textarea
                    rows={2}
                    value={focusReflection}
                    onChange={(e) => setFocusReflection(e.target.value)}
                    placeholder="Reflect on today's focus execution..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-card-border/60 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingFocus(false)}
                    className="px-3 py-1.5 rounded-lg border border-card-border text-[10px] font-bold hover:bg-sharon-muted-light cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-sharon-primary text-white text-[10px] font-bold cursor-pointer"
                  >
                    Log Focus
                  </button>
                </div>
              </form>
            ) : dailyFocus ? (
              <div className="space-y-4 text-left">
                <div className="p-3.5 rounded-xl border border-sharon-primary/30 bg-sharon-primary-light/5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-sharon-primary block">Top Priority</span>
                  <p className="text-xs font-semibold mt-1 leading-relaxed text-foreground">{dailyFocus.top_priority}</p>
                </div>

                {dailyFocus.secondary_priority && (
                  <div className="p-3.5 rounded-xl border border-card-border bg-card">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-sharon-muted block">Secondary Priority</span>
                    <p className="text-xs font-medium mt-1 leading-relaxed text-foreground">{dailyFocus.secondary_priority}</p>
                  </div>
                )}

                {dailyFocus.reflection && (
                  <div className="p-3.5 rounded-xl border border-card-border bg-card italic">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-sharon-muted block">Evening Reflection</span>
                    <p className="text-xs text-sharon-muted mt-1 leading-relaxed">"{dailyFocus.reflection}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-sharon-muted space-y-3">
                <div className="w-12 h-12 rounded-full bg-sharon-primary-light/10 flex items-center justify-center text-sharon-primary">
                  <ListTodo size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">No priority logged for today.</p>
                  <p className="text-[10px] mt-0.5">Define your daily focus areas below.</p>
                </div>
                <button
                  onClick={() => setEditingFocus(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  Define Today's Focus
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Quick Habits checklist & Active Goals list & Recent Journal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Habit tracker widget */}
        <div className="sharon-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sharon-muted">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>Habit Streaks</span>
            </div>
            <Link href="/habits" className="text-[10px] font-bold text-sharon-primary hover:underline">
              View all
            </Link>
          </div>

          {habits.length > 0 ? (
            <div className="space-y-2">
              {habits.slice(0, 5).map((habit) => {
                const isCompleted = habit.logs && habit.logs.length > 0 && habit.logs[0].completed;
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id, !isCompleted)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isCompleted
                        ? 'border-sharon-primary/30 bg-sharon-primary-light/5'
                        : 'border-card-border hover:border-sharon-primary-light/20'
                    }`}
                  >
                    <span className={`text-[11px] font-semibold ${isCompleted ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
                      {habit.name}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-sharon-accent-dark dark:text-sharon-accent">
                      <Flame size={11} />
                      <span>{habit.streak || 0}d</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-sharon-muted">
              No habits set. Create them in Habits.
            </div>
          )}
        </div>

        {/* Goals progress list widget */}
        <div className="sharon-card p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sharon-muted">
              <Target size={14} className="text-sharon-primary" />
              <span>Goals Progress</span>
            </div>
            <Link href="/goals" className="text-[10px] font-bold text-sharon-primary hover:underline">
              Vision Board
            </Link>
          </div>

          {goals.length > 0 ? (
            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-1.5 p-2 rounded-xl border border-card-border bg-card">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="truncate text-foreground max-w-[150px]">{goal.title}</span>
                    <span className="text-sharon-primary">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-sharon-muted-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sharon-primary to-sharon-primary-light rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-sharon-muted">
              No active goals. Set goals in Goals page.
            </div>
          )}
        </div>

        {/* Recent journal logs widget */}
        <div className="sharon-card p-5 space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center border-b border-card-border/60 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sharon-muted">
              <Calendar size={14} className="text-sharon-accent-dark dark:text-sharon-accent" />
              <span>Recent Journal Logs</span>
            </div>
            <Link href="/journal" className="text-[10px] font-bold text-sharon-primary hover:underline">
              Open Journal
            </Link>
          </div>

          {entries.length > 0 ? (
            <div className="space-y-3 text-left">
              {entries.slice(0, 2).map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal?id=${entry.id}`}
                  className="block p-2.5 rounded-xl border border-card-border bg-card hover:border-sharon-primary-light/50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-sharon-primary">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs">
                      {['😢', '😔', '😐', '🙂', '✨'][entry.mood - 1]}
                    </span>
                  </div>
                  <p className="text-[10px] text-sharon-muted mt-1 truncate leading-relaxed">
                    {entry.content}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-sharon-muted">
              No entries logged yet. Reflect in Journal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
