'use client';

import React, { useState } from 'react';
import { useGoals } from '@/hooks/use-goals';
import {
  Plus,
  Trash2,
  Calendar,
  Check,
  Target,
  ArrowRight,
  X
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';

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
  const { toast } = useToast();

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

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
    if (error) {
      toast(`Error establishing goal: ${error}`, 'error');
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
      setNotes('');
      setMilestonesInput('');
      setShowAddGoal(false);
      toast('Goal established.', 'success');
    }
  };

  const handleAddMilestone = async (goalId: string) => {
    const text = newMilestoneText[goalId];
    if (!text || !text.trim()) return;

    const { error } = await addMilestone(goalId, text.trim());
    if (error) {
      toast(`Error adding milestone: ${error}`, 'error');
    } else {
      setNewMilestoneText({ ...newMilestoneText, [goalId]: '' });
    }
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteGoal(deleteTargetId);
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    if (error) {
      toast(`Error deleting goal: ${error}`, 'error');
    } else {
      toast('Goal deleted.', 'success');
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
      case 'Career':
      case 'Business':
        return 'bg-sharon-accent/10 text-sharon-accent-dark border-sharon-accent/20';
      case 'Spiritual Life':
      case 'Relationships':
        return 'bg-sharon-primary/10 text-sharon-primary border-sharon-primary/20';
      default:
        return 'bg-sharon-muted-light/60 text-sharon-muted border-card-border/60';
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
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Goals & Vision
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            Clarify your aspirations, outline core milestones, and curate visual landmarks.
          </p>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="px-4 py-2 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Establish Goal</span>
        </button>
      </div>

      {/* Inline Goal Form Drawer */}
      {showAddGoal && (
        <form onSubmit={handleCreateGoal} className="sharon-card p-6 space-y-4 text-left font-sans">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <h3 className="font-serif text-lg font-medium text-foreground">Establish New Long-Term Goal</h3>
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="text-sharon-muted hover:text-foreground cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Goal Title</span>
              <input
                type="text"
                placeholder="e.g. Publish Editorial Essays Series"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                required
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              >
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Target Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Guiding Intention (Description)</span>
              <input
                type="text"
                placeholder="Why does this goal deserve your energy?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Context & Resources (Notes)</span>
              <textarea
                rows={3}
                placeholder="Grounding materials, links, reference reading..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest">Initial Milestones (one per line)</span>
              <textarea
                rows={3}
                placeholder="Draft checklist actions...&#10;Action item 1&#10;Action item 2"
                value={milestonesInput}
                onChange={(e) => setMilestonesInput(e.target.value)}
                className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-card-border/60">
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="px-4 py-2 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 py-1 font-sans">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase border rounded-full cursor-pointer transition-all ${
              activeCategory === cat
                ? 'bg-sharon-primary border-transparent text-white'
                : 'border-card-border hover:border-sharon-primary-light/50 bg-card text-sharon-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Goals listing */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border-2 border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-6">
              {filteredGoals.map((goal) => (
                <div key={goal.id} className="sharon-card p-6 border border-card-border text-left">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center flex-wrap gap-2 font-sans">
                        <span className={`text-[8px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </span>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-[9px] text-sharon-muted font-bold">
                            <Calendar size={10} />
                            <span>Target: {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-medium text-foreground tracking-wide">{goal.title}</h3>
                      {goal.description && <p className="text-xs text-sharon-muted leading-relaxed font-sans">{goal.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 font-sans">
                      {/* Quiet Circular Progress Indicator */}
                      <div className="flex items-center gap-1.5 border border-card-border bg-sharon-muted-light/30 px-2.5 py-1 rounded-full text-[10px] font-bold text-sharon-primary">
                        <span>{goal.progress}% Done</span>
                      </div>
                    </div>
                  </div>

                  {goal.notes && (
                    <div className="mt-3 bg-sharon-muted-light/20 border border-card-border/40 p-3 rounded-lg text-xs text-sharon-muted leading-relaxed font-sans">
                      <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block mb-1">Notes & Context</span>
                      {goal.notes}
                    </div>
                  )}

                  {/* Milestones list */}
                  <div className="mt-5 space-y-3 font-sans">
                    <span className="text-[9px] font-bold text-sharon-muted uppercase tracking-widest block">Action Milestones</span>
                    
                    {goal.milestones && goal.milestones.length > 0 ? (
                      <div className="space-y-2">
                        {goal.milestones.map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-2 rounded bg-sharon-muted-light/25 border border-card-border/30 hover:border-sharon-accent/40 transition-colors">
                            <button
                              onClick={() => toggleMilestone(goal.id, m.id, !m.completed)}
                              className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                m.completed ? 'bg-sharon-accent border-sharon-accent text-white' : 'border-card-border bg-transparent hover:border-sharon-accent'
                              }`}>
                                {m.completed && <Check size={10} />}
                              </div>
                              <span className={`text-xs font-semibold ${m.completed ? 'line-through text-sharon-muted font-medium' : 'text-foreground font-semibold'}`}>
                                {m.text}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => deleteMilestone(goal.id, m.id)}
                              className="text-sharon-muted/60 hover:text-danger p-0.5 transition-colors cursor-pointer"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-sharon-muted italic pl-1">No action items defined. Add milestones below.</p>
                    )}

                    {/* Add Milestone Inline */}
                    <div className="pt-2">
                      <div className="flex gap-1.5 pt-2">
                        <input
                          type="text"
                          placeholder="Quick add milestone..."
                          value={newMilestoneText[goal.id] || ''}
                          onChange={(e) => setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone(goal.id))}
                          className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg px-2.5 py-1 text-[10px] outline-none text-foreground"
                        />
                        <button
                          onClick={() => handleAddMilestone(goal.id)}
                          className="px-2.5 py-1 rounded-lg bg-sharon-muted-light border border-card-border text-[10px] font-semibold text-sharon-primary cursor-pointer hover:bg-sharon-muted-light/80 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end pt-3 border-t border-card-border/50 mt-4">
                    <button
                      onClick={() => handleDeleteTrigger(goal.id)}
                      className="text-sharon-muted hover:text-danger p-1 rounded transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-sharon-muted-light flex items-center justify-center text-sharon-primary">
                <Target size={22} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground">Establish Your Long-Term Goals</h3>
                <p className="text-xs mt-1 font-sans">
                  Create a goal mapping to your core life areas and break it down into checkboxes.
                </p>
              </div>
              <button
                onClick={() => setShowAddGoal(true)}
                className="px-4 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Define Goal Now</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Vision Board */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sharon-card p-6 space-y-6 text-left">
            <div>
              <h3 className="font-serif text-lg font-medium text-foreground">Vision Board</h3>
              <p className="text-[11px] text-sharon-muted mt-1 font-sans">
                Visual reminders of desired states, aspirations, and visual landmarks.
              </p>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              {visionBoardImages.map((img, idx) => (
                <div key={idx} className="space-y-1.5 group">
                  <div className="relative rounded-lg overflow-hidden border border-card-border aspect-square bg-sharon-muted-light/20">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <span className="block text-[10px] font-semibold text-foreground tracking-wide text-center font-sans">
                    {img.title}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-card-border/60 text-center font-sans">
              <span className="text-[10px] text-sharon-muted font-medium">
                Upload pins from dashboard settings.
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete this goal?"
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
