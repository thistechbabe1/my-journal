'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useIdentity } from '@/hooks/use-identity';
import { useJournal } from '@/hooks/use-journal';
import { useCheckIn } from '@/hooks/use-checkin';
import { useTasks } from '@/hooks/use-tasks';
import { useEvents } from '@/hooks/use-events';
import Link from 'next/link';
import { Calendar, CheckSquare, BookOpen, Clock, AlertCircle, MapPin } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import { Divider } from '@/components/editorial';
import FormInput from '@/components/editorial/FormInput';
import { PeopleWidget } from '@/components/dashboard/people-widget';
import { ExecutiveAttentionBrief } from '@/components/dashboard/executive-attention-brief';
import { useSeasons } from '@/hooks/use-seasons';
import { getLocalDateStr, diffDaysFromToday } from '@/lib/date-utils';

export default function TodayPage() {
  const { user } = useAuth();
  const { profile, identity } = useIdentity();
  const { activeSeason, activeSeasonContext } = useSeasons();
  const { toast } = useToast();
  const {
    todayTasks,
    overdueTasks,
    loading: tasksLoading,
    completeTask,
    reopenTask,
  } = useTasks();
  const {
    todayEvents,
    loading: eventsLoading,
  } = useEvents();

  const today = new Date();
  const todayStr = getLocalDateStr(today);
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const {
    entries,
    dailyFocus,
    saveDailyFocus,
    loading: journalLoading
  } = useJournal();

  const {
    checkIn,
    loading: checkInLoading,
    saveCheckIn
  } = useCheckIn(todayStr);

  // Focus (Intention) States
  const [intentionText, setIntentionText] = useState('');
  const [isSavingIntention, setIsSavingIntention] = useState(false);

  // Evening check-in states
  const [prayed, setPrayed] = useState(false);
  const [exercised, setExercised] = useState(false);
  const [builtText, setBuiltText] = useState('');
  const [learnedNew, setLearnedNew] = useState(false);
  const [networked, setNetworked] = useState(false);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(3);
  const [winText, setWinText] = useState('');
  const [improveText, setImproveText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [nonNegotiablesCompleted, setNonNegotiablesCompleted] = useState<string[]>([]);

  // Everything else accordion state
  const [showEverythingElse, setShowEverythingElse] = useState(true);

  // Sync intention text
  useEffect(() => {
    if (dailyFocus) {
      setIntentionText(dailyFocus.top_priority || '');
    }
  }, [dailyFocus]);

  // Sync rhythms & check-in state
  useEffect(() => {
    if (checkIn) {
      setPrayed(checkIn.prayed || false);
      setExercised(checkIn.exercised || false);
      setBuiltText(checkIn.built_text || '');
      setLearnedNew(checkIn.learned_new || false);
      setNetworked(checkIn.networked || false);
      setEnergy(checkIn.energy || 7);
      setMood(checkIn.mood || 3);
      setWinText(checkIn.win || '');
      setImproveText(checkIn.improve || '');
      setNonNegotiablesCompleted(checkIn.non_negotiables_completed || []);
    }
  }, [checkIn]);

  const handleToggleNonNegotiable = async (item: string, checked: boolean) => {
    if (!user) return;
    const updated = checked
      ? [...nonNegotiablesCompleted, item]
      : nonNegotiablesCompleted.filter((i) => i !== item);

    setNonNegotiablesCompleted(updated);
    try {
      await saveCheckIn({
        prayed,
        exercised,
        learned_new: learnedNew,
        networked,
        built_text: builtText,
        energy,
        mood,
        win: winText,
        improve: improveText,
        non_negotiables_completed: updated
      });
    } catch (err: any) {
      toast(`Error updating non-negotiables: ${err.message}`, 'error');
    }
  };

  // Handle intention save
  const handleSaveIntention = async () => {
    if (!user) return;
    setIsSavingIntention(true);
    try {
      const { error } = await saveDailyFocus({
        date: todayStr,
        top_priority: intentionText,
        secondary_priority: ''
      });
      if (error) throw error;
      toast('Today\'s intention set.', 'success');
    } catch (err: any) {
      toast(`Error setting intention: ${err.message}`, 'error');
    } finally {
      setIsSavingIntention(false);
    }
  };

  // Auto-save Rhythms when toggled
  const handleToggleRhythm = async (field: 'prayed' | 'exercised' | 'learned_new' | 'networked', value: boolean) => {
    if (!user) return;
    try {
      const payload = {
        prayed: field === 'prayed' ? value : prayed,
        exercised: field === 'exercised' ? value : exercised,
        learned_new: field === 'learned_new' ? value : learnedNew,
        networked: field === 'networked' ? value : networked,
        built_text: builtText,
        energy,
        mood,
        win: winText,
        improve: improveText
      };
      
      // Update local state first
      if (field === 'prayed') setPrayed(value);
      if (field === 'exercised') setExercised(value);
      if (field === 'learned_new') setLearnedNew(value);
      if (field === 'networked') setNetworked(value);

      const { error } = await saveCheckIn(payload);
      if (error) {
        const msg = typeof error === 'string' ? error : (error.message || 'Unable to update rhythm');
        toast(msg, 'error');
      }
    } catch (err: any) {
      const msg = err?.message || 'Unable to update rhythm';
      toast(msg, 'error');
    }
  };

  // Save Evening Reflection
  const handleSaveReflection = async () => {
    if (!user) return;
    setSavingReflection(true);
    try {
      const payload = {
        prayed,
        exercised,
        learned_new: learnedNew,
        networked,
        built_text: builtText,
        energy,
        mood,
        win: winText,
        improve: improveText
      };
      const { error } = await saveCheckIn(payload);
      if (error) throw error;
      toast('Evening reflection recorded.', 'success');
    } catch (err: any) {
      toast(`Error saving reflection: ${err.message}`, 'error');
    } finally {
      setSavingReflection(false);
    }
  };

  // On This Day Memoirs filter
  const getMemoirs = () => {
    if (!entries || entries.length === 0) return [];
    
    // Find matching month and day, but different year
    const targetMonthDay = todayStr.substring(5); // "-MM-DD"
    const currentYear = today.getFullYear();

    return entries
      .filter((entry) => {
        if (!entry.date) return false;
        const entryYear = new Date(entry.date).getFullYear();
        return entry.date.endsWith(targetMonthDay) && entryYear < currentYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const memoirs = getMemoirs();
  const loadingAll = journalLoading || checkInLoading;

  if (loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 font-sans ">Opening Today...</p>
      </div>
    );
  }

  const moodEmojis = ['😢', '😔', '😐', '🙂', '✨'];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-4 text-left font-sans animate-fade-in">
      
      {/* Date Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-sharon-muted ">
          {dateFormatted}
        </p>
      </div>

      {/* Active Season Banner */}
      {activeSeason && (
        <div className="p-4 rounded-xl bg-card border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded">
                Active season
              </span>
              <span className="text-xs font-serif italic text-sharon-muted">
                {diffDaysFromToday(activeSeason.end_date) >= 0 
                  ? `${diffDaysFromToday(activeSeason.end_date)} days remaining`
                  : 'Concluding season'}
              </span>
            </div>
            <h3 className="font-serif text-lg font-medium text-foreground leading-tight">
              {activeSeason.name}
            </h3>
            <p className="text-xs text-sharon-muted italic font-serif">
              "{activeSeason.theme}"
            </p>
          </div>
          {activeSeasonContext && (
            <div className="text-left sm:text-right sm:border-l sm:border-card-border/30 sm:pl-4 space-y-0.5 shrink-0">
              <span className="text-xs font-semibold text-foreground block">
                {activeSeasonContext.activeSeasonalGoalsCount} active seasonal goal{activeSeasonContext.activeSeasonalGoalsCount === 1 ? '' : 's'}
              </span>
              <span className="text-xs text-sharon-muted block">
                {activeSeasonContext.milestonesDueThisWeekCount} milestone{activeSeasonContext.milestonesDueThisWeekCount === 1 ? '' : 's'} due this week
              </span>
            </div>
          )}
        </div>
      )}

      {/* 1. Today Attention Brief */}
      <ExecutiveAttentionBrief />

      {/* 2. Everything else Accordion Toggle Header */}
      <div className="pt-2">
        <button
          onClick={() => setShowEverythingElse(!showEverythingElse)}
          className="flex items-center justify-between w-full py-3 px-4 min-h-[44px] rounded-xl bg-card border border-card-border hover:border-sharon-primary/40 text-xs font-semibold text-sharon-muted hover:text-foreground transition-all cursor-pointer select-none"
        >
          <span className="flex items-center gap-2">
            <span className="font-serif text-sm font-medium text-foreground">Everything else</span>
            <span className="text-xs text-sharon-muted">
              Tasks · Schedule · People · Reflection
            </span>
          </span>
          <span className="text-sm font-semibold">{showEverythingElse ? '▴' : '▾'}</span>
        </button>
      </div>

      {/* 3. Everything else Collapsible Content */}
      {showEverythingElse && (
        <div className="space-y-10 animate-fade-in pt-2">
          {/* Today's Intention */}
          <div className="space-y-3">
            <h3 className="text-sm font-serif font-medium text-foreground block">
              Today's intention
            </h3>
            <div className="flex items-center gap-2">
              <FormInput
                type="text"
                placeholder="Write today's focus or intention..."
                value={intentionText}
                onChange={(e) => setIntentionText(e.target.value)}
                onBlur={handleSaveIntention}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveIntention()}
                className="text-lg sm:text-xl font-serif font-medium text-foreground outline-none transition-all placeholder:text-sharon-muted/40"
                containerClassName="w-full"
              />
            </div>
          </div>

          <Divider />

          {/* Today's Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-medium text-foreground block">
                Today's tasks
              </h3>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-sharon-primary hover:text-sharon-primary-light transition-colors min-h-[44px] flex items-center px-2 -mr-2"
              >
                View all
              </Link>
            </div>

            {tasksLoading ? (
              <div className="py-4 flex justify-start">
                <div className="w-4 h-4 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Overdue first */}
                {overdueTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-2 border-b border-card-border/30">
                    <button
                      onClick={() => completeTask(task.id)}
                      className="shrink-0 w-5 h-5 rounded border border-card-border hover:border-danger flex items-center justify-center transition-all cursor-pointer"
                      title="Complete"
                    />
                    <span className="flex-1 text-xs font-semibold text-foreground">{task.title}</span>
                    <span className="text-xs font-semibold text-danger flex items-center gap-1">
                      <AlertCircle size={11} /> Overdue
                    </span>
                  </div>
                ))}
                {/* Today's tasks */}
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 py-2 border-b border-card-border/30">
                    <button
                      onClick={() => completeTask(task.id)}
                      className="shrink-0 w-5 h-5 rounded border border-card-border hover:border-sharon-primary flex items-center justify-center transition-all cursor-pointer"
                      title="Complete"
                    />
                    <span className="flex-1 text-xs font-semibold text-foreground">{task.title}</span>
                    {task.life_area && (
                      <span className="text-xs font-medium text-sharon-muted">
                        {task.life_area.name}
                      </span>
                    )}
                  </div>
                ))}
                {/* Empty state */}
                {overdueTasks.length === 0 && todayTasks.length === 0 && (
                  <div className="py-3 space-y-2">
                    <p className="text-xs text-sharon-muted italic">All clear for today — no pending tasks due.</p>
                    <Link
                      href="/tasks"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sharon-primary hover:text-sharon-primary-light transition-colors min-h-[44px]"
                    >
                      <CheckSquare size={13} />
                      Add a task
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <Divider />

          {/* Today's Schedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-medium text-foreground block">
                Today's schedule
              </h3>
              <Link
                href="/calendar"
                className="text-xs font-semibold text-sharon-primary hover:text-sharon-primary-light transition-colors min-h-[44px] flex items-center px-2 -mr-2"
              >
                View calendar
              </Link>
            </div>

            {eventsLoading ? (
              <div className="py-4 flex justify-start">
                <div className="w-4 h-4 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg border border-card-border bg-card">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1.5 h-6 rounded-full bg-sharon-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">{ev.title}</span>
                        <div className="flex items-center gap-2 text-xs text-sharon-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {ev.is_all_day ? 'All-Day' : (ev.start_time ? `${ev.start_time.substring(0, 5)}${ev.end_time ? ` - ${ev.end_time.substring(0, 5)}` : ''}` : 'Scheduled')}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin size={11} />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-sharon-muted-light border border-card-border text-sharon-muted">
                      {ev.category}
                    </span>
                  </div>
                ))}
                {todayEvents.length === 0 && (
                  <div className="py-3 space-y-2">
                    <p className="text-xs text-sharon-muted italic">Clean schedule today — no events on your calendar.</p>
                    <Link
                      href="/calendar"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sharon-primary hover:text-sharon-primary-light transition-colors min-h-[44px]"
                    >
                      <Calendar size={13} />
                      Schedule an event
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <Divider />

          {/* People & Follow-ups */}
          <PeopleWidget />

          <Divider />

          {/* Today's Rhythm Checklist & Protected Non-Negotiables */}
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-medium text-foreground block">
              Today's rhythm
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {[
                { id: 'prayed', label: 'Prayer', value: prayed },
                { id: 'exercised', label: 'Exercise', value: exercised },
                { id: 'learned_new', label: 'Learning', value: learnedNew },
                { id: 'networked', label: 'Building', value: networked }
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 cursor-pointer text-sm font-medium text-foreground select-none py-1 min-h-[44px]"
                >
                  <input
                    type="checkbox"
                    checked={item.value}
                    onChange={(e) => handleToggleRhythm(item.id as any, e.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Protected Non-Negotiables */}
            {identity?.non_negotiables && identity.non_negotiables.length > 0 && (
              <div className="pt-3 border-t border-card-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-sharon-muted block">
                    Protected today (Non-negotiables)
                  </h4>
                  <Link
                    href="/identity"
                    className="text-xs font-semibold text-sharon-primary hover:text-sharon-primary-light min-h-[44px] flex items-center"
                  >
                    Edit manifesto
                  </Link>
                </div>
                <div className="space-y-2 max-w-md">
                  {identity.non_negotiables.map((item, idx) => {
                    const isCompleted = nonNegotiablesCompleted.includes(item);
                    return (
                      <label
                        key={idx}
                        className="flex items-center gap-3 cursor-pointer text-xs font-medium text-foreground select-none py-0.5 min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(e) => handleToggleNonNegotiable(item, e.target.checked)}
                        />
                        <span className={isCompleted ? 'line-through text-sharon-muted' : 'text-foreground'}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* Continue Writing */}
          <div className="space-y-3">
            <h3 className="text-sm font-serif font-medium text-foreground block">
              Continue writing
            </h3>
            <div className="flex items-center justify-between py-1">
              <p className="text-xs text-sharon-muted leading-relaxed font-sans max-w-sm">
                Record your thoughts, memories, and reflections for today.
              </p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors shrink-0"
              >
                <BookOpen size={13} />
                <span>Open Journal</span>
              </Link>
            </div>
          </div>

          {/* Evening Reflection Section */}
          <Divider />
          
          <div className="space-y-5">
            <h3 className="text-sm font-serif font-medium text-foreground block">
              Evening reflection
            </h3>
            
            <div className="space-y-4 max-w-md">
              {/* Mood & Energy */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sharon-muted block">Mood Status</label>
                  <div className="flex gap-2">
                    {moodEmojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setMood(idx + 1); }}
                        className={`text-lg min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          mood === idx + 1 ? 'bg-sharon-primary/20 border border-sharon-primary scale-105' : 'opacity-50 hover:opacity-100 hover:bg-sharon-muted-light/40'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-sharon-muted block">Energy ({energy}/10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer accent-sharon-primary min-h-[44px]"
                  />
                </div>
              </div>

              {/* Win & Improve */}
              <div className="space-y-4 pt-2">
                <FormInput
                  label="Today's Win"
                  placeholder="What went well today?"
                  value={winText}
                  onChange={(e) => setWinText(e.target.value)}
                />

                <FormInput
                  label="What I built / learned"
                  placeholder="Next.js auth, database tables..."
                  value={builtText}
                  onChange={(e) => setBuiltText(e.target.value)}
                />

                <FormInput
                  label="Improve tomorrow"
                  placeholder="What can be improved tomorrow?"
                  value={improveText}
                  onChange={(e) => setImproveText(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveReflection}
                  disabled={savingReflection}
                  className="px-4 py-2 border border-card-border bg-card hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingReflection ? 'Saving...' : 'Record Evening Reflection'}
                </button>
              </div>
            </div>
          </div>

          {/* On This Day Memoirs */}
          {memoirs.length > 0 && (
            <>
              <Divider />
              <div className="space-y-6">
                <span className="text-[10px] font-bold text-sharon-muted block">
                  On This Day
                </span>
                <div className="space-y-6">
                  {memoirs.map((memoir) => {
                    const year = new Date(memoir.date).getFullYear();
                    const yearsAgo = today.getFullYear() - year;
                    return (
                      <div key={memoir.id} className="space-y-2 text-left">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-sharon-primary ">
                          <Clock size={11} />
                          <span>{year} ({yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago)</span>
                        </div>
                        <p className="text-sm font-serif italic text-foreground/90 pl-3.5 border-l-2 border-sharon-primary/30 py-0.5 leading-relaxed">
                          {memoir.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
