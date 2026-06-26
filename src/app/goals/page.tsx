'use client';

import React, { useState } from 'react';
import { useGoals } from '@/hooks/use-goals';
import { Goal } from '@/types';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  CheckSquare,
  Square,
  Target,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  X
} from 'lucide-react';

type GoalCategory = 'All' | 'Career' | 'Business' | 'Finance' | 'Health' | 'Relationships' | 'Spiritual Life' | 'Education' | 'Travel';

export default function GoalsPage() {
  const {
    goals,
    loading,
    saveGoal,
    deleteGoal,
    toggleMilestone,
    addMilestone,
    deleteMilestone
  } = useGoals();

  const [activeCategory, setActiveCategory] = useState<GoalCategory>('All');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New goal form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Career');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  // New milestone state for specific goals
  const [newMilestoneText, setNewMilestoneText] = useState<{ [goalId: string]: string }>({});

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const msList = milestonesInput
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const { error } = await saveGoal(
      {
        title,
        description,
        category: category === 'All' ? 'Career' : (category as any),
        deadline: deadline || null,
        notes,
        progress: 0
      },
      msList
    );

    setSaving(false);
    if (!error) {
      setTitle('');
      setDescription('');
      setDeadline('');
      setNotes('');
      setMilestonesInput('');
      setShowAddGoal(false);
    }
  };

  const handleAddMilestone = async (goalId: string) => {
    const text = newMilestoneText[goalId];
    if (!text || !text.trim()) return;

    const { error } = await addMilestone(goalId, text.trim());
    if (!error) {
      setNewMilestoneText({ ...newMilestoneText, [goalId]: '' });
    }
  };

  const categories: GoalCategory[] = [
    'All',
    'Career',
    'Business',
    'Finance',
    'Health',
    'Relationships',
    'Spiritual Life',
    'Education',
    'Travel'
  ];

  const filteredGoals = activeCategory === 'All'
    ? goals
    : goals.filter((g) => g.category === activeCategory);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Career': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'Business': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Finance': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Health': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Relationships': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      case 'Spiritual Life': return 'bg-sharon-primary-light/10 text-sharon-primary border-sharon-primary-light/20';
      case 'Education': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Mock Vision Board images
  const visionBoardImages = [
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300', title: 'Faith & Stillness' },
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300', title: 'Tech Leadership' },
    { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300', title: 'Strength & Run' },
    { url: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=300', title: 'Travel Explorations' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sharon-primary via-indigo-500 to-sharon-primary-light bg-clip-text text-transparent">
            Goals & Vision
          </h1>
          <p className="text-sm text-sharon-muted mt-1.5">
            Define multi-year goals, break them down into milestones, and build your visual vision board.
          </p>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-sm transition-all shadow-md shadow-sharon-primary/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>Define Goal</span>
        </button>
      </div>

      {/* Inline Goal Form Drawer */}
      {showAddGoal && (
        <form onSubmit={handleCreateGoal} className="sharon-card p-6 border-t-3 border-sharon-accent space-y-4 animate-slide-down">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h3 className="font-bold text-sm">Define New Long-Term Goal</h3>
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="text-xs text-sharon-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Goal Title</span>
                <input
                  type="text"
                  placeholder="e.g. Lead Core Product System Architecture Upgrade"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Category Area</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl p-2 text-xs outline-none text-foreground"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deadline */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Target Deadline</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl p-2 text-xs outline-none text-foreground"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Goal Description</span>
                <textarea
                  rows={2}
                  placeholder="Define the outcome and scope of this goal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground resize-none"
                />
              </div>

              {/* Milestones list inputs */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Initial Milestones (One per line)</span>
                <textarea
                  rows={3}
                  placeholder="e.g. Conduct system review&#10;Write guidelines document&#10;Deploy core module update"
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-card-border/60">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={14} />}
              <span>Establish Goal</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories slider */}
      <div className="flex flex-wrap gap-2 border-b border-card-border pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-sharon-primary text-white shadow-sm'
                : 'text-sharon-muted hover:text-foreground hover:bg-sharon-muted-light/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Goals Grid list */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGoals.map((goal) => (
                <div key={goal.id} className="sharon-card p-5 flex flex-col justify-between sharon-card-purple">
                  <div className="space-y-4">
                    {/* Top bar */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                      {goal.deadline && (
                        <span className="text-[10px] font-semibold text-sharon-muted flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{new Date(goal.deadline).toLocaleDateString(undefined, { dateStyle: 'short' })}</span>
                        </span>
                      )}
                    </div>

                    {/* Goal Title */}
                    <div>
                      <h3 className="font-bold text-sm leading-snug">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-[11px] text-sharon-muted mt-1 leading-relaxed line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-sharon-muted">Milestones Progress</span>
                        <span className="text-sharon-primary">{goal.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-sharon-muted-light rounded-full overflow-hidden border border-card-border/10">
                        <div
                          className="h-full bg-gradient-to-r from-sharon-primary to-sharon-primary-light rounded-full transition-all duration-500"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Milestones list */}
                    <div className="space-y-2 pt-2 border-t border-card-border/50">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-sharon-muted">Milestone Checklist</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {(goal.milestones || []).map((m) => (
                          <div key={m.id} className="flex items-center justify-between text-xs py-1 hover:bg-sharon-muted-light/20 rounded px-1 transition-colors">
                            <button
                              onClick={() => toggleMilestone(goal.id, m.id, !m.completed)}
                              className="flex items-center gap-2 text-left flex-1 cursor-pointer text-[11px] font-medium"
                            >
                              {m.completed ? (
                                <CheckSquare size={13} className="text-sharon-primary shrink-0" />
                              ) : (
                                <Square size={13} className="text-sharon-muted shrink-0" />
                              )}
                              <span className={m.completed ? 'line-through text-sharon-muted' : 'text-foreground'}>
                                {m.text}
                              </span>
                            </button>
                            <button
                              onClick={() => deleteMilestone(goal.id, m.id)}
                              className="text-sharon-muted hover:text-danger p-0.5"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Quick add milestone input */}
                      <div className="flex gap-1.5 pt-2">
                        <input
                          type="text"
                          placeholder="Quick add milestone..."
                          value={newMilestoneText[goal.id] || ''}
                          onChange={(e) => setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone(goal.id))}
                          className="w-full bg-[#111622]/10 border border-card-border rounded-lg px-2.5 py-1 text-[10px] outline-none text-foreground"
                        />
                        <button
                          onClick={() => handleAddMilestone(goal.id)}
                          className="px-2 py-1 rounded-lg bg-sharon-muted-light border border-card-border text-[10px] font-bold text-sharon-primary cursor-pointer hover:bg-sharon-muted-light/80"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end pt-3 border-t border-card-border/50 mt-4">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-sharon-muted hover:text-danger p-1 rounded transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-sharon-primary-light/10 flex items-center justify-center text-sharon-primary">
                <Target size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Establish Your Long-Term Goals</h3>
                <p className="text-xs mt-1">
                  Establish a goal mapping to your core life areas and break it down into checkboxes.
                </p>
              </div>
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow shadow-sharon-primary/10 cursor-pointer"
              >
                <span>Define Goal Now</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Vision Board */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sharon-card p-5 sharon-card-gold space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="text-sharon-accent animate-pulse" size={20} />
                <h3 className="font-bold text-base">Vision Board</h3>
              </div>
              <p className="text-xs text-sharon-muted mt-1">
                Visual reminders of desired states, aspirations, and visual landmarks.
              </p>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-3">
              {visionBoardImages.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden group border border-card-border/50 aspect-square shadow-sm">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2 opacity-90 transition-opacity">
                    <span className="text-[10px] font-bold text-white tracking-wide">
                      {img.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-card-border/60 text-center">
              <span className="text-[10px] text-sharon-muted font-medium">
                Upload pins from dashboard settings.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
