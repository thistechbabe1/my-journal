'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGoals } from '@/hooks/use-goals';
import { usePeople } from '@/hooks/use-people';
import { useTasks } from '@/hooks/use-tasks';
import { useCampaigns } from '@/hooks/use-campaigns';
import { useSeasons } from '@/hooks/use-seasons';
import { useIdentity } from '@/hooks/use-identity';
import { strategicService } from '@/services/strategic-service';
import { identityAlignmentService } from '@/services/identity-alignment-service';
import { Goal, GoalMilestone, Task, Campaign } from '@/types';
import {
  Plus, Trash2, Calendar, Check, Target, ArrowLeft, X,
  User, Megaphone, CheckSquare, Clock, ChevronDown, ChevronRight, AlertCircle, Edit3
} from 'lucide-react';
import { getLocalDateStr } from '@/lib/date-utils';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';

type GoalCategory = 'All' | 'Career' | 'Business' | 'Finance' | 'Health' | 'Relationships' | 'Spiritual Life' | 'Education' | 'Travel';

export default function GoalsPage() {
  const {
    goals,
    loading: goalsLoading,
    saveGoal,
    deleteGoal,
    toggleMilestone,
    addMilestone,
    updateMilestone,
    deleteMilestone
  } = useGoals();

  const { activePeople } = usePeople();
  const { activeTasks, createTask, updateTask, completeTask, reopenTask } = useTasks();
  const { campaigns } = useCampaigns();
  const { seasons, activeSeason } = useSeasons();
  const { identity } = useIdentity();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<GoalCategory>('All');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);

  // Expanded goal card IDs for hierarchy drawer
  const [expandedGoalIds, setExpandedGoalIds] = useState<string[]>([]);

  // New Goal Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Career');
  const [deadline, setDeadline] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedPrinciples, setSelectedPrinciples] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  // Enhanced Milestone Add Modal State
  const [milestoneModalGoalId, setMilestoneModalGoalId] = useState<string | null>(null);
  const [msText, setMsText] = useState('');
  const [msTargetDate, setMsTargetDate] = useState('');
  const [msPersonId, setMsPersonId] = useState('');
  const [msCampaignId, setMsCampaignId] = useState('');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [savingMilestone, setSavingMilestone] = useState(false);

  // Quick Task Linker Modal State
  const [taskModalGoalId, setTaskModalGoalId] = useState<string | null>(null);
  const [taskModalMilestoneId, setTaskModalMilestoneId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('medium');
  const [taskPersonId, setTaskPersonId] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Delete Goal Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const categories: GoalCategory[] = [
    'All', 'Career', 'Business', 'Finance', 'Health', 'Relationships', 'Spiritual Life', 'Education', 'Travel'
  ];

  const filteredGoals = useMemo(() => {
    return activeCategory === 'All'
      ? goals
      : goals.filter((g) => g.category === activeCategory);
  }, [goals, activeCategory]);

  const toggleExpandGoal = (id: string) => {
    setExpandedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]
    );
  };

  // ─── Goal Handlers ─────────────────────────────────────────────────────────

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSavingGoal(true);
    const msList = milestonesInput
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    const { error } = await saveGoal(
      {
        title: title.trim(),
        description: description || null,
        category: category === 'All' ? 'Career' : (category as any),
        deadline: deadline || null,
        season_id: seasonId || null,
        core_values: selectedValues,
        life_principles: selectedPrinciples,
        notes: notes || null,
        status: 'active',
        progress: 0
      },
      msList
    );

    setSavingGoal(false);
    if (error) {
      toast(`Error establishing goal: ${error}`, 'error');
    } else {
      setTitle('');
      setDescription('');
      setDeadline('');
      setSeasonId('');
      setSelectedValues([]);
      setSelectedPrinciples([]);
      setNotes('');
      setMilestonesInput('');
      setShowAddGoal(false);
      toast('Strategic Goal established.', 'success');
    }
  };

  const confirmDeleteGoal = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteGoal(deleteTargetId);
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    if (error) {
      toast(`Error deleting goal: ${error}`, 'error');
    } else {
      toast('Goal removed.', 'success');
    }
  };

  // ─── Milestone Handlers ───────────────────────────────────────────────────

  const handleOpenAddMilestone = (goalId: string, milestoneToEdit?: GoalMilestone) => {
    setMilestoneModalGoalId(goalId);
    if (milestoneToEdit) {
      setEditingMilestoneId(milestoneToEdit.id);
      setMsText(milestoneToEdit.text);
      setMsTargetDate(milestoneToEdit.target_date || '');
      setMsPersonId(milestoneToEdit.person_id || '');
      setMsCampaignId(milestoneToEdit.campaign_id || '');
    } else {
      setEditingMilestoneId(null);
      setMsText('');
      setMsTargetDate('');
      setMsPersonId('');
      setMsCampaignId('');
    }
  };

  const handleSaveMilestoneModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneModalGoalId || !msText.trim()) return;

    setSavingMilestone(true);
    if (editingMilestoneId) {
      const { error } = await updateMilestone(milestoneModalGoalId, editingMilestoneId, {
        text: msText.trim(),
        target_date: msTargetDate || null,
        person_id: msPersonId || null,
        campaign_id: msCampaignId || null,
      });
      setSavingMilestone(false);
      if (error) toast(`Error updating milestone: ${error}`, 'error');
      else {
        toast('Milestone updated.', 'success');
        setMilestoneModalGoalId(null);
      }
    } else {
      const { error } = await addMilestone(milestoneModalGoalId, {
        text: msText.trim(),
        target_date: msTargetDate || null,
        person_id: msPersonId || null,
        campaign_id: msCampaignId || null,
      });
      setSavingMilestone(false);
      if (error) toast(`Error adding milestone: ${error}`, 'error');
      else {
        toast('Milestone added to campaign tree.', 'success');
        setMilestoneModalGoalId(null);
      }
    }
  };

  // ─── Task Linker Handlers ──────────────────────────────────────────────────

  const handleOpenAddTask = (goalId: string, milestoneId?: string) => {
    setTaskModalGoalId(goalId);
    setTaskModalMilestoneId(milestoneId || null);
    setTaskTitle('');
    setTaskDueDate('');
    setTaskPriority('medium');
    setTaskPersonId('');
  };

  const handleSaveTaskModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskModalGoalId || !taskTitle.trim()) return;

    setSavingTask(true);
    const { error } = await createTask({
      title: taskTitle.trim(),
      goal_id: taskModalGoalId,
      milestone_id: taskModalMilestoneId || null,
      due_date: taskDueDate || null,
      priority: taskPriority,
      person_id: taskPersonId || null,
    });
    setSavingTask(false);
    if (error) {
      toast(`Error creating linked task: ${error}`, 'error');
    } else {
      toast('Linked task added to execution tree.', 'success');
      setTaskModalGoalId(null);
      setTaskModalMilestoneId(null);
    }
  };

  const visionBoardImages = [
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300', title: 'Faith & Stillness' },
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300', title: 'Tech Leadership' },
    { url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=300', title: 'Strength & Endurance' },
    { url: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=300', title: 'Global Exploration' }
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left">
        <div>
          <Link
            href="/growth"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Growth Hub</span>
          </Link>
          <h1 className="text-4xl font-serif font-light text-foreground">
            Goal & Campaign Execution Engine
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Connect high-level Goals to Campaigns, Milestones, Action Tasks, and Contacts.
          </p>
        </div>
        <button
          onClick={() => setShowAddGoal(!showAddGoal)}
          className="px-3.5 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus size={13} />
          <span>Establish Goal</span>
        </button>
      </div>

      {/* Goal Establishment Form */}
      {showAddGoal && (
        <form onSubmit={handleCreateGoal} className="space-y-6 text-left font-sans py-5 px-6 bg-card border border-card-border/60 rounded-xl shadow-lg">
          <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
            <h3 className="font-serif text-lg font-medium text-foreground">Establish Strategic Goal</h3>
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
              <span className="text-[10px] font-bold text-sharon-muted block">Goal Outcome Title</span>
              <input
                type="text"
                placeholder="e.g. Get a strong Software Engineering role"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
                required
              />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted block">Life Domain Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
              >
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted block">Target Completion Date</span>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted block">Guiding Purpose (Description)</span>
              <input
                type="text"
                placeholder="Why does this outcome matter to your vision?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            {/* Parent Season Linkage */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted block">Parent Seasonal Chapter</span>
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
              >
                <option value="">No Season (Standalone Goal)</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status === 'active' ? 'Active Season' : 'Archived'})
                  </option>
                ))}
              </select>
            </div>

            {/* Explicit Core Values Selection */}
            {identity?.core_values && identity.core_values.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-sharon-muted block">Aligned Core Values</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {identity.core_values.map((val) => {
                    const isSelected = selectedValues.includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setSelectedValues(
                            isSelected ? selectedValues.filter((v) => v !== val) : [...selectedValues, val]
                          );
                        }}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-serif italic border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sharon-primary text-white border-sharon-primary'
                            : 'bg-card border-card-border/60 text-sharon-muted hover:border-sharon-primary/40'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1 md:col-span-2">
              <span className="text-[10px] font-bold text-sharon-muted block">Initial Key Milestones (one per line)</span>
              <textarea
                rows={3}
                placeholder="Draft key milestones...&#10;e.g. Job Search Applications&#10;e.g. Technical Interview Readiness&#10;e.g. Recruiter & Mentor Networking"
                value={milestonesInput}
                onChange={(e) => setMilestonesInput(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-card-border/20">
            <button
              type="button"
              onClick={() => setShowAddGoal(false)}
              className="px-4 py-2 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingGoal}
              className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            >
              Save Strategic Goal
            </button>
          </div>
        </form>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 py-1 select-none border-b border-card-border/30 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[10px] font-bold pb-1 cursor-pointer transition-all border-b-2 ${
              activeCategory === cat
                ? 'border-sharon-primary text-sharon-primary'
                : 'border-transparent text-sharon-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Goals Hierarchy Listing */}
        <div className="lg:col-span-8 space-y-6">
          {goalsLoading ? (
            <div className="py-16 text-center">
              <div className="w-6 h-6 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredGoals.length > 0 ? (
            <div className="space-y-6">
              {filteredGoals.map((goal) => {
                // Compute deterministic progress and velocity
                const goalMilestones = goal.milestones || [];
                const goalTasks = activeTasks.filter(
                  (t) => t.goal_id === goal.id || goalMilestones.some((m) => m.id === t.milestone_id)
                );
                const progressMetrics = strategicService.calculateProgress(goalMilestones, goalTasks);
                const linkedCampaigns = campaigns.filter((c) => c.goal_id === goal.id);
                const isExpanded = expandedGoalIds.includes(goal.id);

                return (
                  <div
                    key={goal.id}
                    className="bg-card border border-card-border/60 rounded-xl p-5 shadow-xs space-y-4 text-left transition-all"
                  >
                    {/* Goal Card Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 text-xs">
                          <span className="text-[9px] font-bold bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded text-sharon-primary">
                            {goal.category}
                          </span>
                          {goal.season && (
                            <span className="text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-sharon-primary flex items-center gap-1">
                              🌿 {goal.season.name}
                            </span>
                          )}
                          {goal.deadline && (
                            <span className="flex items-center gap-1 text-[10px] text-sharon-muted font-medium">
                              <Calendar size={11} />
                              <span>Target: {new Date(goal.deadline + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-2xl font-medium text-foreground ">
                          {goal.title}
                        </h3>

                        {/* Explicit Identity Alignment Badge */}
                        {(() => {
                          const alignment = identityAlignmentService.getGoalAlignment(goal, activeSeason);
                          if (alignment.rationaleLabel && alignment.rationaleLabel !== 'Unlinked to Season or Explicit Values') {
                            return (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sharon-primary bg-sharon-primary/5 px-2 py-0.5 rounded border border-sharon-primary/10">
                                🧭 {alignment.rationaleLabel}
                              </span>
                            );
                          }
                          return null;
                        })()}

                        {goal.description && (
                          <p className="text-xs text-sharon-muted leading-relaxed font-sans">
                            {goal.description}
                          </p>
                        )}
                      </div>

                      {/* Goal Progress Ring & Delete Button */}
                      <div className="shrink-0 flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-lg font-serif font-bold text-sharon-primary block">
                            {progressMetrics.progressPercentage}%
                          </span>
                          <span className="text-[9px] font-bold text-sharon-muted block">
                            Strategic Progress
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setDeleteTargetId(goal.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-sharon-muted hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Deterministic Velocity Status Label */}
                    <div className="p-2.5 rounded-lg bg-sharon-muted-light/20 border border-card-border/30 flex items-center justify-between text-xs text-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-sharon-primary" />
                        <span className="text-[11px]">{progressMetrics.statusLabel}</span>
                      </div>
                      <button
                        onClick={() => toggleExpandGoal(goal.id)}
                        className="text-[10px] font-bold text-sharon-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Collapse Hierarchy ▴' : 'Expand Execution Tree ▾'}</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-sharon-muted-light/40 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-sharon-primary h-full transition-all duration-500 rounded-full"
                        style={{ width: `${progressMetrics.progressPercentage}%` }}
                      />
                    </div>

                    {/* Expandable Execution Tree (Campaigns, Milestones, Tasks) */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-card-border/30 space-y-6">
                        {/* 1. Linked Campaigns */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
                              <Megaphone size={11} className="text-sharon-primary" /> Linked Campaigns
                            </span>
                            <Link
                              href="/growth/campaigns"
                              className="text-[10px] font-semibold text-sharon-primary hover:underline flex items-center gap-1"
                            >
                              <Plus size={10} /> Launch Campaign
                            </Link>
                          </div>

                          {linkedCampaigns.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {linkedCampaigns.map((c) => (
                                <div
                                  key={c.id}
                                  className="p-2.5 rounded-lg border border-card-border/40 bg-card hover:bg-sharon-muted-light/20 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-foreground truncate">{c.title}</p>
                                    <p className="text-[10px] text-sharon-muted italic">{c.description || 'Active campaign'}</p>
                                  </div>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-sharon-primary border border-emerald-500/20 shrink-0">
                                    {c.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-sharon-muted italic">No active campaigns linked to this goal yet.</p>
                          )}
                        </div>

                        {/* 2. Action Milestones */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
                              <Target size={11} className="text-sharon-primary" /> Key Action Milestones ({progressMetrics.completedMilestoneCount}/{progressMetrics.totalMilestoneCount})
                            </span>
                            <button
                              onClick={() => handleOpenAddMilestone(goal.id)}
                              className="text-[10px] font-bold text-sharon-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={10} /> Add Milestone
                            </button>
                          </div>

                          {goalMilestones.length > 0 ? (
                            <div className="space-y-2">
                              {goalMilestones.map((m) => {
                                const linkedPerson = activePeople.find((p) => p.id === m.person_id);
                                const linkedCampaign = campaigns.find((c) => c.id === m.campaign_id);

                                return (
                                  <div
                                    key={m.id}
                                    className="p-3 rounded-lg border border-card-border/40 bg-card hover:border-sharon-primary/30 space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <button
                                        onClick={() => toggleMilestone(goal.id, m.id, !m.completed)}
                                        className="flex items-start gap-2.5 text-left flex-1 cursor-pointer group"
                                      >
                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                          m.completed
                                            ? 'bg-sharon-accent border-sharon-accent text-white'
                                            : 'border-card-border group-hover:border-sharon-accent'
                                        }`}>
                                          {m.completed && <Check size={9} />}
                                        </div>
                                        <div>
                                          <span className={`text-xs font-semibold block ${m.completed ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
                                            {m.text}
                                          </span>
                                        </div>
                                      </button>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          onClick={() => handleOpenAddMilestone(goal.id, m)}
                                          className="text-sharon-muted hover:text-sharon-primary p-1 cursor-pointer"
                                          title="Edit Milestone"
                                        >
                                          <Edit3 size={11} />
                                        </button>
                                        <button
                                          onClick={() => deleteMilestone(goal.id, m.id)}
                                          className="text-sharon-muted hover:text-red-500 p-1 cursor-pointer"
                                          title="Delete Milestone"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Milestone Metadata Badges & Link Task */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] border-t border-card-border/10">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {m.target_date && (
                                          <span className={`font-semibold flex items-center gap-1 ${
                                            !m.completed && m.target_date < getLocalDateStr()
                                              ? 'text-red-500'
                                              : 'text-sharon-muted'
                                          }`}>
                                            <Calendar size={10} /> Target: {m.target_date}
                                          </span>
                                        )}
                                        {linkedPerson && (
                                          <span className="font-semibold text-sharon-primary flex items-center gap-1">
                                            <User size={10} /> {linkedPerson.name}
                                          </span>
                                        )}
                                        {linkedCampaign && (
                                          <span className="font-semibold text-sharon-primary flex items-center gap-1">
                                            <Megaphone size={10} /> {linkedCampaign.title}
                                          </span>
                                        )}
                                      </div>

                                      <button
                                        onClick={() => handleOpenAddTask(goal.id, m.id)}
                                        className="text-[9px] font-bold text-sharon-primary hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
                                      >
                                        <Plus size={9} /> Link Task
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[11px] text-sharon-muted italic">No milestones defined yet.</p>
                          )}
                        </div>

                        {/* 3. Linked Action Tasks */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
                              <CheckSquare size={11} className="text-sharon-primary" /> Execution Tasks ({goalTasks.filter(t => t.status === 'complete').length}/{goalTasks.length})
                            </span>
                            <button
                              onClick={() => handleOpenAddTask(goal.id)}
                              className="text-[10px] font-bold text-sharon-primary hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus size={10} /> Quick Task
                            </button>
                          </div>

                          {goalTasks.length > 0 ? (
                            <div className="space-y-1.5">
                              {goalTasks.map((t) => (
                                <div
                                  key={t.id}
                                  className="flex items-center justify-between p-2.5 rounded-lg border border-card-border/30 bg-card hover:bg-sharon-muted-light/10 text-xs"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <button
                                      onClick={() => (t.status === 'complete' ? reopenTask(t.id) : completeTask(t.id))}
                                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center cursor-pointer shrink-0 ${
                                        t.status === 'complete'
                                          ? 'bg-sharon-accent border-sharon-accent text-white'
                                          : 'border-card-border hover:border-sharon-accent'
                                      }`}
                                    >
                                      {t.status === 'complete' && <Check size={8} />}
                                    </button>
                                    <span className={`font-medium truncate ${t.status === 'complete' ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
                                      {t.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-[10px] text-sharon-muted shrink-0">
                                    {t.due_date && <span>📅 {t.due_date}</span>}
                                    {t.person && <span>👤 {t.person.name}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-sharon-muted italic">No execution tasks linked to this goal yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-card border border-card-border/40 text-center space-y-2">
              <p className="text-sm font-semibold text-foreground">No strategic goals established for this category.</p>
              <p className="text-xs text-sharon-muted">Click "Establish Goal" above to create your first operational goal.</p>
            </div>
          )}
        </div>

        {/* Right: Vision Landmarks */}
        <div className="lg:col-span-4 space-y-6 text-left font-sans">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">Vision Landmarks</h3>
            <p className="text-[11px] text-sharon-muted mt-1">
              Visual markers reminding you of your long-term focus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {visionBoardImages.map((img, idx) => (
              <div key={idx} className="space-y-1 group cursor-pointer">
                <div className="relative rounded-lg overflow-hidden border border-card-border/60 aspect-square bg-sharon-muted-light/20">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <span className="block text-[10px] font-semibold text-foreground text-center">
                  {img.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Milestone Manager Modal ───────────────────────────────────────── */}
      {Boolean(milestoneModalGoalId) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMilestoneModal}
            className="w-full max-w-md bg-card border border-card-border p-6 rounded-2xl shadow-2xl space-y-4 text-left font-sans"
          >
            <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
              <h3 className="font-serif text-lg font-medium text-foreground">
                {editingMilestoneId ? 'Edit Milestone' : 'Add Action Milestone'}
              </h3>
              <button
                type="button"
                onClick={() => setMilestoneModalGoalId(null)}
                className="text-sharon-muted hover:text-foreground cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-sharon-muted block">Milestone Description</label>
                <input
                  type="text"
                  placeholder="e.g. Recruiter & Mentor Networking"
                  value={msText}
                  onChange={(e) => setMsText(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sharon-muted block">Target Date</label>
                  <input
                    type="date"
                    value={msTargetDate}
                    onChange={(e) => setMsTargetDate(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sharon-muted block">Linked Contact</label>
                  <select
                    value={msPersonId}
                    onChange={(e) => setMsPersonId(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                  >
                    <option value="">None</option>
                    {activePeople.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {campaigns.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sharon-muted block">Linked Campaign</label>
                  <select
                    value={msCampaignId}
                    onChange={(e) => setMsCampaignId(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                  >
                    <option value="">None</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-card-border/20">
              <button
                type="button"
                onClick={() => setMilestoneModalGoalId(null)}
                className="px-4 py-1.5 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingMilestone || !msText.trim()}
                className="px-4 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              >
                {editingMilestoneId ? 'Update Milestone' : 'Save Milestone'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Task Linker Modal ─────────────────────────────────────────────── */}
      {Boolean(taskModalGoalId) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTaskModal}
            className="w-full max-w-md bg-card border border-card-border p-6 rounded-2xl shadow-2xl space-y-4 text-left font-sans"
          >
            <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
              <h3 className="font-serif text-lg font-medium text-foreground">Create Linked Task</h3>
              <button
                type="button"
                onClick={() => setTaskModalGoalId(null)}
                className="text-sharon-muted hover:text-foreground cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-sharon-muted block">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Apply to X Company"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sharon-muted block">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sharon-muted block">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Task['priority'])}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-sharon-muted block">Linked Contact</label>
                <select
                  value={taskPersonId}
                  onChange={(e) => setTaskPersonId(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
                >
                  <option value="">None</option>
                  {activePeople.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-card-border/20">
              <button
                type="button"
                onClick={() => setTaskModalGoalId(null)}
                className="px-4 py-1.5 border border-card-border hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingTask || !taskTitle.trim()}
                className="px-4 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete this Goal?"
        message="This action will remove the goal and un-link associated items."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteGoal}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
