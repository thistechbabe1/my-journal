'use client';

import React, { useState } from 'react';
import { useGoals } from '@/hooks/use-goals';
import { Plus, Trash2, Calendar, Check, Target, ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

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
    'All', 'Career', 'Business', 'Finance', 'Health', 'Relationships', 'Spiritual Life', 'Education', 'Travel'
  ];

  const filteredGoals = activeCategory === 'All'
    ? goals
    : goals.filter((g) => g.category === activeCategory);

  const visionBoardImages = [
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300', title: 'Faith & Stillness' },
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300', title: 'Tech Leadership' },
    { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300', title: 'Strength & Run' },
    { url: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=300', title: 'Travel Explorations' }
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-2">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <Link
            href="/growth"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light uppercase tracking-wider flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Growth Hub</span>
          </Link>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Goals & Vision
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Clarify your aspirations, outline core milestones, and curate visual landmarks.
          </p>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="px-3.5 py-1.5 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={13} />
          <span>Establish Goal</span>
        </button>
      </div>

      {/* Goal Form Drawer (Borderless layout) */}
      {showAddGoal && (
        <form onSubmit={handleCreateGoal} className="space-y-6 text-left font-sans py-4 border-b border-card-border/20">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-medium text-foreground">Establish Long-Term Goal</h3>
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="text-sharon-muted hover:text-foreground cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Goal Title</span>
              <input
                type="text"
                placeholder="e.g. Publish Editorial Essays Series"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
                required
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
              >
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Target Deadline</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Guiding Intention (Description)</span>
              <input
                type="text"
                placeholder="Why does this goal deserve your energy?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Context (Notes)</span>
              <textarea
                rows={3}
                placeholder="Grounding materials, reference reading..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Initial Milestones (one per line)</span>
              <textarea
                rows={3}
                placeholder="Draft checklist actions...&#10;Action item 1&#10;Action item 2"
                value={milestonesInput}
                onChange={(e) => setMilestonesInput(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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

      {/* Category List */}
      <div className="flex flex-wrap gap-3 py-1 font-sans select-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] font-bold tracking-wider uppercase pb-1 cursor-pointer transition-all border-b-2 ${
              activeCategory === cat
                ? 'border-sharon-primary text-sharon-primary'
                : 'border-transparent text-sharon-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Goals listing */}
        <div className="lg:col-span-8 space-y-8">
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-8 divide-y divide-card-border/20">
              {filteredGoals.map((goal, idx) => (
                <div key={goal.id} className={`space-y-4 text-left ${idx > 0 ? 'pt-8' : ''}`}>
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center flex-wrap gap-2.5 font-sans">
                        <span className="text-[8px] font-bold uppercase tracking-widest bg-sharon-primary/10 border border-sharon-primary/20 px-1.5 py-0.5 rounded text-sharon-primary">
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

                    <div className="shrink-0 flex items-center font-sans text-xs font-bold text-sharon-primary">
                      <span>{goal.progress}% completed</span>
                    </div>
                  </div>

                  {goal.notes && (
                    <div className="p-3 bg-sharon-muted-light/20 rounded-lg text-xs text-sharon-muted leading-relaxed font-sans border-l-2 border-sharon-primary/30">
                      {goal.notes}
                    </div>
                  )}

                  {/* Milestones list */}
                  <div className="space-y-3 font-sans pl-1">
                    <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Action Milestones</span>
                    
                    {goal.milestones && goal.milestones.length > 0 ? (
                      <div className="space-y-1.5">
                        {goal.milestones.map((m) => (
                          <div key={m.id} className="flex items-center justify-between py-1 px-1 border-b border-card-border/10 hover:bg-sharon-muted-light/10">
                            <button
                              onClick={() => toggleMilestone(goal.id, m.id, !m.completed)}
                              className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                m.completed ? 'bg-sharon-accent border-sharon-accent text-white' : 'border-card-border bg-transparent hover:border-sharon-accent'
                              }`}>
                                {m.completed && <Check size={8} />}
                              </div>
                              <span className={`text-xs font-semibold ${m.completed ? 'line-through text-sharon-muted font-normal' : 'text-foreground'}`}>
                                {m.text}
                              </span>
                            </button>
                            
                            <button
                              onClick={() => deleteMilestone(goal.id, m.id)}
                              className="text-sharon-muted hover:text-danger p-0.5 transition-colors cursor-pointer"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-sharon-muted italic pl-1">No action items defined.</p>
                    )}

                    {/* Add Milestone Inline */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Quick add milestone..."
                        value={newMilestoneText[goal.id] || ''}
                        onChange={(e) => setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone(goal.id))}
                        className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none text-foreground placeholder:text-sharon-muted/30 focus:border-sharon-primary"
                      />
                      <button
                        onClick={() => handleAddMilestone(goal.id)}
                        className="px-2.5 py-1 rounded bg-sharon-muted-light border border-card-border text-[10px] font-semibold text-sharon-primary cursor-pointer hover:bg-sharon-muted-light/80 transition-colors shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end pt-2">
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
            <p className="text-xs text-sharon-muted italic py-6">No goals established for this category.</p>
          )}
        </div>

        {/* Right: Vision Board */}
        <div className="lg:col-span-4 space-y-6 text-left font-sans">
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">Vision Board</h3>
            <p className="text-[11px] text-sharon-muted mt-1">
              Visual landmarks and reminders of your aspirations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {visionBoardImages.map((img, idx) => (
              <div key={idx} className="space-y-1.5 group">
                <div className="relative rounded-lg overflow-hidden border border-card-border/60 aspect-square bg-sharon-muted-light/20">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="block text-[10px] font-semibold text-foreground tracking-wide text-center">
                  {img.title}
                </span>
              </div>
            ))}
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
