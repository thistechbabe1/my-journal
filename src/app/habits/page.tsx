'use client';

import React, { useState } from 'react';
import { useHabits } from '@/hooks/use-habits';
import {
  Plus,
  Trash2,
  Check,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';

export default function HabitsPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [newHabitName, setNewHabitName] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
    if (error) {
      toast(`Error creating rhythm: ${error}`, 'error');
    } else {
      setNewHabitName('');
      toast('Rhythm created.', 'success');
    }
  };

  const handleToggle = async (habitId: string, completed: boolean) => {
    await toggleHabit(habitId, completed);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteHabit(deleteTargetId);
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    if (error) {
      toast(`Error deleting rhythm: ${error}`, 'error');
    } else {
      toast('Rhythm deleted.', 'success');
    }
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
    <div className="space-y-10 max-w-4xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Daily Rhythms
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            A quiet space to capture daily intentions and track consistent steps.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-card-border px-3 py-1.5 rounded-lg">
          <Calendar size={13} className="text-sharon-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-0 text-xs outline-none text-foreground font-medium cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Checklist & Habit Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sharon-card p-6 space-y-6">
            <div className="text-left font-sans">
              <h3 className="font-serif text-lg font-medium text-foreground">{formatHeaderDate(selectedDate)}</h3>
              <p className="text-[11px] text-sharon-muted mt-1">
                Review and check off your daily intentions.
              </p>
            </div>

            {/* Checklist */}
            {loading ? (
              <div className="py-10 text-center">
                <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : habits.length > 0 ? (
              <div className="space-y-3 text-left">
                {habits.map((habit) => {
                  const isCompleted = habit.logs && habit.logs.length > 0 && habit.logs[0].completed;
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-card transition-all hover:border-sharon-primary/50"
                    >
                      <button
                        onClick={() => handleToggle(habit.id, !isCompleted)}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer"
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                            isCompleted
                              ? 'bg-sharon-accent border-sharon-accent text-white'
                              : 'border-card-border bg-transparent hover:border-sharon-primary'
                          }`}
                        >
                          {isCompleted && <Check size={11} />}
                        </div>
                        <span className={`text-xs font-medium font-sans ${isCompleted ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
                          {habit.name}
                        </span>
                      </button>

                      <div className="flex items-center gap-3 font-sans">
                        {/* Streak label */}
                        {habit.streak !== undefined && habit.streak > 0 && (
                          <span className="font-serif italic text-xs text-sharon-muted">
                            {habit.streak}d streak
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleDeleteTrigger(habit.id)}
                          className="text-sharon-muted hover:text-danger p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-sharon-muted font-sans italic text-xs">
                No rhythms established for today.
              </div>
            )}

            {/* Quick Add Form */}
            <form onSubmit={handleCreateHabit} className="flex gap-2 pt-4 border-t border-card-border/60 font-sans">
              <input
                type="text"
                placeholder="Establish new rhythm..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="flex-1 bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-medium"
                required
              />
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg border border-transparent text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Consistency Grid (30 Day) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="sharon-card p-6 space-y-6 text-left font-sans">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">30-Day Consistency</h3>
              <p className="text-[11px] text-sharon-muted mt-1">
                Visualizing your consistent practice over the past month.
              </p>
            </div>

            {loading ? (
              <div className="py-10 text-center">
                <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : habits.length > 0 ? (
              <div className="space-y-6">
                {habits.map((habit) => {
                  const completedDates = habit.logs
                    ? habit.logs.filter((l) => l.completed).map((l) => l.date)
                    : [];
                  
                  return (
                    <div key={habit.id} className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-foreground">{habit.name}</span>
                        <div className="flex items-center gap-1.5 text-sharon-muted text-[10px]">
                          <span>{completedDates.length} of 30 days completed</span>
                          {habit.streak !== undefined && habit.streak > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-serif italic">{habit.streak}d streak</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Heatmap Grid */}
                      <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-card-border bg-card">
                        {last30Days.map((dateStr) => {
                          const isCompleted = completedDates.includes(dateStr);
                          const dayNum = new Date(dateStr).getDate();
                          const shortDateStr = new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          
                          return (
                            <div
                              key={dateStr}
                              className={`w-6 h-6 rounded text-[9px] flex items-center justify-center font-medium select-none cursor-pointer transition-all ${
                                isCompleted
                                  ? 'bg-sharon-accent text-white font-semibold'
                                  : 'bg-sharon-muted-light/40 hover:bg-sharon-muted-light text-sharon-muted/50 border border-card-border/30'
                              }`}
                              title={`${shortDateStr}: ${isCompleted ? 'Completed' : 'Unfinished'}`}
                            >
                              {dayNum}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sharon-muted italic text-xs">
                No rhythm records available. Add rhythms to start tracking.
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete this rhythm?"
        message="This action can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
