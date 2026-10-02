'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { getTaskUrgency } from '@/services/tasks-service';
import { Task } from '@/types';
import {
  Plus, Trash2, Check, RotateCcw, Calendar, Flag,
  ChevronDown, X, AlignLeft, Target, Tag, ArrowLeft, User
} from 'lucide-react';
import { usePeople } from '@/hooks/use-people';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import { Divider } from '@/components/editorial';
import { getLocalDateStr } from '@/lib/date-utils';

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { label: 'High',   colour: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/20' },
  medium: { label: 'Medium', colour: 'text-sharon-primary',  bg: 'bg-amber-500/10 border-amber-500/20' },
  low:    { label: 'Low',    colour: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
};

const URGENCY_LABELS: Record<string, string> = {
  overdue:  'Overdue',
  today:    'Today',
  soon:     'Due Soon',
  upcoming: 'Upcoming',
  'no-date': 'No Date',
};

// Priority sort order for within groups
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const sortByPriority = (tasks: Task[]) =>
  [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

// ─── Subcomponents ────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: Task['priority'] }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.colour}`}>
      {cfg.label}
    </span>
  );
}

function UrgencyDot({ urgency }: { urgency: string }) {
  const colours: Record<string, string> = {
    overdue: 'bg-red-500',
    today:   'bg-sharon-primary',
    soon:    'bg-amber-400',
  };
  const colour = colours[urgency];
  if (!colour) return null;
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colour} shrink-0`} />;
}

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onComplete: () => void;
  onReopen: () => void;
  onDeleteTrigger: () => void;
}

function TaskRow({ task, isSelected, onSelect, onComplete, onReopen, onDeleteTrigger }: TaskRowProps) {
  const urgency = getTaskUrgency(task);
  const isComplete = task.status === 'complete';

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
        isSelected
          ? 'border-sharon-primary/40 bg-sharon-primary/5'
          : 'border-transparent hover:border-card-border/40 hover:bg-sharon-muted-light/20'
      }`}
    >
      {/* Complete / Reopen toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); isComplete ? onReopen() : onComplete(); }}
        className={`shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
          isComplete
            ? 'bg-sharon-accent border-sharon-accent text-white'
            : 'border-card-border hover:border-sharon-accent'
        }`}
        title={isComplete ? 'Reopen' : 'Complete'}
      >
        {isComplete && <Check size={9} />}
      </button>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {!isComplete && <UrgencyDot urgency={urgency} />}
          <span className={`text-xs font-semibold truncate ${isComplete ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.due_date && (
            <span className={`text-[10px] font-medium ${urgency === 'overdue' ? 'text-red-500' : 'text-sharon-muted'}`}>
              {urgency === 'overdue' ? '⚠ ' : ''}
              {new Date(task.due_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.life_area && (
            <span className="text-[9px] font-bold text-sharon-muted/70">
              {task.life_area.name}
            </span>
          )}
          {task.person && (
            <span className="text-[9px] font-bold text-sharon-primary/90 flex items-center gap-0.5">
              👤 {task.person.name}
            </span>
          )}
        </div>
      </div>

      {/* Priority badge */}
      <PriorityBadge priority={task.priority} />

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDeleteTrigger(); }}
        className="shrink-0 text-sharon-muted hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
        title="Delete task"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ─── Task group ───────────────────────────────────────────────────────────────

function TaskGroup({ label, tasks, selectedId, onSelect, onComplete, onReopen, onDeleteTrigger }: {
  label: string;
  tasks: Task[];
  selectedId: string | null;
  onSelect: (t: Task) => void;
  onComplete: (id: string) => void;
  onReopen: (id: string) => void;
  onDeleteTrigger: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 text-[10px] font-bold text-sharon-muted hover:text-foreground transition-colors cursor-pointer select-none w-full text-left py-1"
      >
        <ChevronDown size={12} className={`transition-transform ${collapsed ? '-rotate-90' : ''}`} />
        {label}
        <span className="ml-auto font-normal">{tasks.length}</span>
      </button>
      {!collapsed && (
        <div className="space-y-0.5">
          {sortByPriority(tasks).map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isSelected={selectedId === task.id}
              onSelect={() => onSelect(task)}
              onComplete={() => onComplete(task.id)}
              onReopen={() => onReopen(task.id)}
              onDeleteTrigger={() => onDeleteTrigger(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Quick-add form ───────────────────────────────────────────────────────────

interface QuickAddProps {
  lifeAreas: { id: string; name: string }[];
  people?: { id: string; name: string }[];
  onAdd: (task: { title: string; due_date: string | null; priority: Task['priority']; life_area_id: string | null; person_id: string | null }) => Promise<void>;
}

function QuickAdd({ lifeAreas, people = [], onAdd }: QuickAddProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [lifeAreaId, setLifeAreaId] = useState('');
  const [personId, setPersonId] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const todayStr = getLocalDateStr();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({
      title: title.trim(),
      due_date: dueDate || null,
      priority,
      life_area_id: lifeAreaId || null,
      person_id: personId || null,
    });
    setSaving(false);
    setTitle('');
    setDueDate('');
    setPriority('medium');
    setLifeAreaId('');
    setPersonId('');
    setExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-4 border-t border-card-border/20">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setExpanded(true)}
          className="flex-1 bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/40"
        />
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-3 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-colors shrink-0"
        >
          <Plus size={12} />
          <span>Add</span>
        </button>
      </div>

      {expanded && (
        <div className="flex flex-wrap gap-3 items-center pt-1">
          {/* Due date */}
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-sharon-muted" />
            <input
              type="date"
              value={dueDate}
              min={todayStr}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent border-0 text-[10px] outline-none text-foreground font-medium cursor-pointer"
            />
          </div>
          {/* Priority */}
          <div className="flex items-center gap-1.5">
            <Flag size={11} className="text-sharon-muted" />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className="bg-transparent border-0 text-[10px] outline-none text-foreground font-medium cursor-pointer"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          {/* Life area */}
          {lifeAreas.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag size={11} className="text-sharon-muted" />
              <select
                value={lifeAreaId}
                onChange={(e) => setLifeAreaId(e.target.value)}
                className="bg-transparent border-0 text-[10px] outline-none text-foreground font-medium cursor-pointer"
              >
                <option value="">No area</option>
                {lifeAreas.map((la) => (
                  <option key={la.id} value={la.id}>{la.name}</option>
                ))}
              </select>
            </div>
          )}
          {/* Person / Contact */}
          <div className="flex items-center gap-1.5">
            <User size={11} className="text-sharon-muted" />
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="bg-transparent border-0 text-[10px] outline-none text-foreground font-medium cursor-pointer"
            >
              <option value="">No contact</option>
              {people.length === 0 ? (
                <option value="" disabled>No contacts (Add in /people)</option>
              ) : (
                people.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))
              )}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-[10px] text-sharon-muted hover:text-foreground cursor-pointer ml-auto"
          >
            Collapse
          </button>
        </div>
      )}
    </form>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  task: Task;
  lifeAreas: { id: string; name: string }[];
  goals: { id: string; title: string }[];
  people?: { id: string; name: string }[];
  onUpdate: (updates: Partial<Task>) => Promise<void>;
  onComplete: () => void;
  onReopen: () => void;
  onDeleteTrigger: () => void;
  onClose: () => void;
}

function DetailPanel({ task, lifeAreas, goals, people = [], onUpdate, onComplete, onReopen, onDeleteTrigger, onClose }: DetailPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [lifeAreaId, setLifeAreaId] = useState(task.life_area_id || '');
  const [goalId, setGoalId] = useState(task.goal_id || '');
  const [personId, setPersonId] = useState(task.person_id || '');
  const [saving, setSaving] = useState(false);

  // Sync when task changes
  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes || '');
    setDueDate(task.due_date || '');
    setPriority(task.priority);
    setLifeAreaId(task.life_area_id || '');
    setGoalId(task.goal_id || '');
    setPersonId(task.person_id || '');
  }, [task.id]);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate({
      title: title.trim() || task.title,
      notes: notes || null,
      due_date: dueDate || null,
      priority,
      life_area_id: lifeAreaId || null,
      goal_id: goalId || null,
      person_id: personId || null,
    });
    setSaving(false);
  };

  const urgency = getTaskUrgency(task);
  const isComplete = task.status === 'complete';
  const urgencyColour = urgency === 'overdue' ? 'text-red-500' : urgency === 'today' ? 'text-sharon-primary' : 'text-sharon-muted';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-card-border/20 pb-4">
        <div className="space-y-1 flex-1 min-w-0">
          {urgency !== 'complete' && urgency !== 'no-date' && (
            <span className={`text-[10px] font-bold ${urgencyColour}`}>
              {URGENCY_LABELS[urgency]}
            </span>
          )}
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            rows={2}
            className="w-full bg-transparent border-0 rounded-none py-0 px-0 text-lg font-serif font-medium text-foreground outline-none resize-none leading-snug placeholder:text-sharon-muted/40"
          />
        </div>
        <button onClick={onClose} className="shrink-0 text-sharon-muted hover:text-foreground p-1 cursor-pointer transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {/* Due date */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
            <Calendar size={10} /> Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={handleSave}
            className="bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground font-semibold cursor-pointer w-full"
          />
        </div>

        {/* Priority */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
            <Flag size={10} /> Priority
          </label>
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value as Task['priority']); }}
            onBlur={handleSave}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Life area */}
        {lifeAreas.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
              <Tag size={10} /> Life Area
            </label>
            <select
              value={lifeAreaId}
              onChange={(e) => setLifeAreaId(e.target.value)}
              onBlur={handleSave}
              className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground font-semibold cursor-pointer"
            >
              <option value="">None</option>
              {lifeAreas.map((la) => (
                <option key={la.id} value={la.id}>{la.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Person / Contact link */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
            <User size={10} /> Connected Person / Contact
          </label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground font-semibold cursor-pointer"
          >
            <option value="">None</option>
            {people.length === 0 ? (
              <option value="" disabled>No contacts found — add contacts in /people</option>
            ) : (
              people.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))
            )}
          </select>
        </div>

        {/* Goal link */}
        {goals.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
              <Target size={10} /> Connected Goal
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              onBlur={handleSave}
              className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground font-semibold cursor-pointer"
            >
              <option value="">None</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted flex items-center gap-1.5">
            <AlignLeft size={10} /> Notes
          </label>
          <textarea
            placeholder="Add context, links, or next steps..."
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1 px-0 text-xs outline-none text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
          />
          <span className="text-[9px] text-sharon-muted/60 italic">Saves on blur</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-card-border/20">
        {isComplete ? (
          <button
            onClick={onReopen}
            className="flex items-center gap-1.5 px-4 py-2 border border-card-border bg-card hover:bg-sharon-muted-light/60 text-foreground text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Reopen
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-4 py-2 bg-sharon-accent hover:bg-sharon-accent/90 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Check size={12} />
            Mark Complete
          </button>
        )}
        <button
          onClick={onDeleteTrigger}
          className="flex items-center gap-1.5 px-3 py-2 text-sharon-muted hover:text-red-500 text-xs font-semibold rounded-lg transition-colors cursor-pointer ml-auto"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      {task.completed_at && (
        <p className="text-[10px] text-sharon-muted italic">
          Completed {new Date(task.completed_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FilterTab = 'active' | 'today' | 'overdue' | 'completed';

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePeople } = usePeople();
  const {
    loading,
    activeTasks, overdueTasks, todayTasks, soonTasks, upcomingTasks, noDateTasks, completedTasks,
    createTask, updateTask, completeTask, reopenTask, deleteTask,
  } = useTasks();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('active');
  const [lifeAreas, setLifeAreas] = useState<{ id: string; name: string }[]>([]);
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Fetch life areas + goals for dropdowns
  useEffect(() => {
    if (!user) return;
    supabase.from('life_areas').select('id, name').eq('user_id', user.id).order('name')
      .then(async ({ data }: any) => {
        if (data && data.length > 0) {
          setLifeAreas(data);
        } else if (user) {
          // Auto-seed standard life areas if user has none yet
          const defaults = ['Career', 'Personal', 'Health', 'Finance', 'Faith', 'Learning', 'YPS'];
          const { data: inserted } = await supabase
            .from('life_areas')
            .insert(defaults.map((name) => ({ user_id: user.id, name, score: 5 })))
            .select('id, name');
          if (inserted) setLifeAreas(inserted);
        }
      });
    supabase.from('goals').select('id, title').eq('user_id', user.id).order('title')
      .then(({ data }: any) => { if (data) setGoals(data); });
  }, [user]);

  // When completing a task that's currently selected, clear selection
  const handleComplete = async (taskId: string) => {
    const { error } = await completeTask(taskId);
    if (error) { toast(`Error: ${error}`, 'error'); return; }
    if (selectedTask?.id === taskId) setSelectedTask((t: any) => t ? { ...t, status: 'complete', completed_at: new Date().toISOString() } : null);
  };

  const handleReopen = async (taskId: string) => {
    const { error } = await reopenTask(taskId);
    if (error) { toast(`Error: ${error}`, 'error'); return; }
    if (selectedTask?.id === taskId) setSelectedTask((t: any) => t ? { ...t, status: 'active', completed_at: null } : null);
  };

  const handleDeleteTrigger = (taskId: string) => {
    setDeleteTargetId(taskId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteTask(deleteTargetId);
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    if (error) { toast(`Error: ${error}`, 'error'); return; }
    if (selectedTask?.id === deleteTargetId) setSelectedTask(null);
    toast('Task deleted.', 'success');
  };

  const handleQuickAdd = async (task: { title: string; due_date: string | null; priority: Task['priority']; life_area_id: string | null; person_id?: string | null }) => {
    const { error } = await createTask(task);
    if (error) { toast(`Error: ${error}`, 'error'); return; }
    toast('Task added.', 'success');
  };

  const handleUpdate = async (updates: Partial<Task>) => {
    if (!selectedTask) return;
    const { data, error } = await updateTask(selectedTask.id, updates);
    if (error) { toast(`Error saving: ${error}`, 'error'); return; }
    if (data) setSelectedTask(data);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask((prev) => prev?.id === task.id ? null : task);
  };

  // Which groups to show per tab
  const renderGroups = () => {
    const commonProps = {
      selectedId: selectedTask?.id ?? null,
      onSelect: handleSelectTask,
      onComplete: handleComplete,
      onReopen: handleReopen,
      onDeleteTrigger: handleDeleteTrigger,
    };

    if (filterTab === 'today') {
      return (
        <>
          <TaskGroup label="Overdue" tasks={overdueTasks} {...commonProps} />
          <TaskGroup label="Today" tasks={todayTasks} {...commonProps} />
        </>
      );
    }
    if (filterTab === 'overdue') {
      return <TaskGroup label="Overdue" tasks={overdueTasks} {...commonProps} />;
    }
    if (filterTab === 'completed') {
      return <TaskGroup label="Completed" tasks={completedTasks} {...commonProps} />;
    }
    // Default: 'active' — all groups
    return (
      <>
        <TaskGroup label="Overdue" tasks={overdueTasks} {...commonProps} />
        <TaskGroup label="Today" tasks={todayTasks} {...commonProps} />
        <TaskGroup label="Due Soon" tasks={soonTasks} {...commonProps} />
        <TaskGroup label="Upcoming" tasks={upcomingTasks} {...commonProps} />
        <TaskGroup label="No Date" tasks={noDateTasks} {...commonProps} />
      </>
    );
  };

  const totalActive = activeTasks.length;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'active', label: 'All Active', count: activeTasks.length },
    { key: 'today', label: 'Today', count: todayTasks.length + overdueTasks.length },
    { key: 'overdue', label: 'Overdue', count: overdueTasks.length },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground">Tasks</h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            {activeTasks.length} active · {overdueTasks.length > 0 && (
              <span className="text-red-500 font-semibold">{overdueTasks.length} overdue · </span>
            )}{completedTasks.length} completed
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-5 border-b border-card-border/10 pb-1.5 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`text-[10px] font-bold pb-1.5 cursor-pointer transition-all border-b-2 flex items-center gap-1.5 ${
              filterTab === tab.key
                ? 'border-sharon-primary text-sharon-primary'
                : 'border-transparent text-sharon-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[9px] px-1 rounded font-bold ${
                tab.key === 'overdue' ? 'bg-red-500/20 text-red-500' : 'bg-sharon-muted-light text-sharon-muted'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Task list */}
        <div className="lg:col-span-5 space-y-4">
          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {renderGroups()}
              {filterTab !== 'completed' && activeTasks.length === 0 && (
                <p className="text-xs text-sharon-muted italic py-6">✨ You're all clear! No active tasks pending. Add one below.</p>
              )}
              {filterTab === 'completed' && completedTasks.length === 0 && (
                <p className="text-xs text-sharon-muted italic py-6">✨ No completed tasks yet. Check off active tasks to track completed items!</p>
              )}
            </>
          )}

          {filterTab !== 'completed' && (
            <QuickAdd lifeAreas={lifeAreas} people={activePeople} onAdd={handleQuickAdd} />
          )}
        </div>

        {/* Right: Detail panel */}
        <div className="lg:col-span-7">
          {selectedTask ? (
            <div className="sticky top-4">
              <DetailPanel
                task={selectedTask}
                lifeAreas={lifeAreas}
                goals={goals}
                people={activePeople}
                onUpdate={handleUpdate}
                onComplete={() => handleComplete(selectedTask.id)}
                onReopen={() => handleReopen(selectedTask.id)}
                onDeleteTrigger={() => handleDeleteTrigger(selectedTask.id)}
                onClose={() => setSelectedTask(null)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-sharon-muted-light/10 rounded-xl border border-card-border/20">
              <p className="text-xs text-sharon-muted italic">Select a task to see its details.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete this task?"
        message="This action can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setDeleteTargetId(null); }}
      />
    </div>
  );
}
