'use client';

import React, { useState } from 'react';
import { useHabits } from '@/hooks/use-habits';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
  Flame,
  TrendingUp,
  X
} from 'lucide-react';

export default function HabitsPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [newHabitName, setNewHabitName] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    habits,
    loading,
    addHabit,
    deleteHabit,
    toggleHabit
  } = useHabits(selectedDate);

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    setSaving(true);
    const { error } = await addHabit(newHabitName);
    setSaving(false);
    if (!error) {
      setNewHabitName('');
    }
  };

  const handleToggle = async (habitId: string, completed: boolean) => {
    await toggleHabit(habitId, completed);
  };

  // Helper: Generate calendar blocks for the last 30 days
  const getLast30Days = () => {
    const list = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      list.push(d.toISOString().split('T')[0]);
    }
    return list;
  };

  const last30Days = getLast30Days();

  // Helper: Format date for headers
  const formatHeaderDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sharon-primary via-indigo-500 to-sharon-primary-light bg-clip-text text-transparent">
            Habit Operating System
          </h1>
          <p className="text-sm text-sharon-muted mt-1.5">
            Log daily micro-habits, build streaks, and maintain high performance consistency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-sharon-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#111622]/10 border border-card-border rounded-xl px-3 py-1.5 text-xs outline-none text-foreground font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Checklist & Habit Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sharon-card p-5 space-y-6 border-t-3 border-sharon-primary">
            <div>
              <h3 className="font-bold text-base">Checklist - {formatHeaderDate(selectedDate)}</h3>
              <p className="text-xs text-sharon-muted mt-1">
                Toggle completion to update daily stats.
              </p>
            </div>

            {/* Checklist */}
            {loading ? (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : habits.length > 0 ? (
              <div className="space-y-3">
                {habits.map((habit) => {
                  const isCompleted = habit.logs && habit.logs.length > 0 && habit.logs[0].completed;
                  return (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        isCompleted
                          ? 'border-sharon-primary/40 bg-sharon-primary-light/5'
                          : 'border-card-border hover:border-sharon-primary-light/30'
                      }`}
                    >
                      <button
                        onClick={() => handleToggle(habit.id, !isCompleted)}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                            isCompleted
                              ? 'bg-sharon-primary border-sharon-primary text-white'
                              : 'border-card-border bg-card hover:border-sharon-primary'
                          }`}
                        >
                          {isCompleted && <CheckCircle size={14} />}
                        </div>
                        <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-sharon-muted' : ''}`}>
                          {habit.name}
                        </span>
                      </button>

                      <div className="flex items-center gap-3">
                        {/* Streak fire badge */}
                        <div className="flex items-center gap-0.5 text-xs font-bold text-sharon-accent-dark dark:text-sharon-accent bg-sharon-accent/10 px-2 py-0.5 rounded">
                          <Flame size={12} className="animate-pulse" />
                          <span>{habit.streak || 0}d</span>
                        </div>
                        
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-sharon-muted hover:text-danger p-1 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sharon-muted bg-sharon-muted-light/20 rounded-xl">
                <p className="text-xs font-bold">No habits registered.</p>
                <p className="text-[10px] mt-1">Register a habit using the input below.</p>
              </div>
            )}

            {/* Create new habit */}
            <form onSubmit={handleCreateHabit} className="flex gap-2 border-t border-card-border/60 pt-4">
              <input
                type="text"
                placeholder="e.g. Exercise, Morning Prayer, Deep Work..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-3.5 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white text-xs font-bold shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                <Plus size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Month Heatmaps & Stats */}
        <div className="lg:col-span-7 space-y-6">
          <div className="sharon-card p-5 sharon-card-gold space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-sharon-accent" size={20} />
                <h3 className="font-bold text-base">Consistency Tracking (Last 30 Days)</h3>
              </div>
              <p className="text-xs text-sharon-muted mt-1">
                Visual grid grids plotting completion records over the last 30 consecutive days.
              </p>
            </div>

            {loading ? (
              <div className="py-10 text-center">
                <div className="w-6 h-6 border-2 border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : habits.length > 0 ? (
              <div className="space-y-6">
                {habits.map((habit) => {
                  // Fetch list of dates completed for this habit
                  const completedDates = (habit.logs || [])
                    .filter((l) => l.completed)
                    .map((l) => l.date);

                  return (
                    <div key={habit.id} className="space-y-2 border-b border-card-border/50 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">{habit.name}</span>
                        <div className="flex items-center gap-2 text-sharon-muted font-semibold text-[10px]">
                          <span>Rate: {habit.completionRate || 0}%</span>
                          <span>|</span>
                          <span className="flex items-center text-sharon-accent-dark dark:text-sharon-accent">
                            <Flame size={10} className="mr-0.5" />
                            {habit.streak || 0} day streak
                          </span>
                        </div>
                      </div>

                      {/* Heatmap Grid */}
                      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-sharon-muted-light/10 border border-card-border/50">
                        {last30Days.map((dateStr) => {
                          // In mock mode, check if completed (logs has completions)
                          // Since in use-habits mock load we pass all completions merged in logs, 
                          // we can look up completedDates.
                          const isCompleted = completedDates.includes(dateStr);
                          
                          // Tooltip date description
                          const shortDateStr = new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          
                          return (
                            <div
                              key={dateStr}
                              className={`w-5 h-5 rounded-md text-[8px] flex items-center justify-center font-bold select-none cursor-pointer transition-all ${
                                isCompleted
                                  ? 'bg-sharon-primary text-white shadow-sm'
                                  : 'bg-sharon-muted-light/60 hover:bg-sharon-muted-light text-sharon-muted/50 border border-card-border/20'
                              }`}
                              title={`${shortDateStr}: ${isCompleted ? 'Completed' : 'Missed'}`}
                            >
                              {new Date(dateStr).getDate()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sharon-muted">
                No habit consistency data available. Add habits first.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
