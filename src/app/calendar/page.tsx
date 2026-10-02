'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEvents } from '@/hooks/use-events';
import { usePeople } from '@/hooks/use-people';
import { useAuth } from '@/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { getLocalDateStr, validateEventTimes } from '@/services/events-service';
import { CalendarEvent, EventCategory, EventStatus } from '@/types';
import {
  Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, Check, X,
  ChevronLeft, ChevronRight, Tag, Target, Edit3, AlertCircle, List, Grid, User
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import { Divider } from '@/components/editorial';

// ─── Category Configuration ──────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<EventCategory, { label: string; colour: string; bg: string; dot: string }> = {
  meeting:     { label: 'Meeting',     colour: 'text-blue-500',   bg: 'bg-blue-500/10 border-blue-500/20',   dot: 'bg-blue-500' },
  appointment: { label: 'Appointment', colour: 'text-sharon-primary', bg: 'bg-purple-500/10 border-purple-500/20', dot: 'bg-purple-500' },
  church:      { label: 'Church',      colour: 'text-sharon-primary',  bg: 'bg-amber-500/10 border-amber-500/20',  dot: 'bg-amber-500' },
  personal:    { label: 'Personal',    colour: 'text-sharon-primary',bg: 'bg-emerald-500/10 border-emerald-500/20',dot: 'bg-emerald-500' },
  deadline:    { label: 'Deadline',    colour: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/20',     dot: 'bg-red-500' },
  other:       { label: 'Other',       colour: 'text-gray-400',   bg: 'bg-gray-400/10 border-gray-400/20',   dot: 'bg-gray-400' },
};

function CategoryBadge({ category }: { category: EventCategory }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.colour}`}>
      {cfg.label}
    </span>
  );
}

// Format "17:00" to "5:00 PM"
function formatTimeString(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// ─── Inner Calendar Component ─────────────────────────────────────────────────

function CalendarContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activePeople } = usePeople();
  const searchParams = useSearchParams();

  // Selected date state (defaults to today or ?date= query param)
  const todayStr = useMemo(() => getLocalDateStr(), []);
  const initialDate = searchParams?.get('date') || todayStr;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [currentYearMonth, setCurrentYearMonth] = useState<{ year: number; month: number }>(() => {
    const d = new Date(initialDate + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Life areas & Goals dropdown options
  const [lifeAreas, setLifeAreas] = useState<{ id: string; name: string }[]>([]);
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([]);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Events Hook
  const {
    events,
    loading,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    getEventsForDate,
  } = useEvents();

  // Auto-seed or fetch dropdown options
  useEffect(() => {
    if (!user) return;
    supabase.from('life_areas').select('id, name').eq('user_id', user.id).order('name')
      .then(async ({ data }: any) => {
        if (data && data.length > 0) {
          setLifeAreas(data);
        } else if (user) {
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

  // Sync date from URL searchParams if changed externally
  useEffect(() => {
    const paramDate = searchParams?.get('date');
    if (paramDate) {
      setSelectedDate(paramDate);
      const d = new Date(paramDate + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setCurrentYearMonth({ year: d.getFullYear(), month: d.getMonth() });
      }
    }
  }, [searchParams]);

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const { year, month } = currentYearMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        dateStr: getLocalDateStr(prevDate),
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const currDate = new Date(year, month, d);
      days.push({
        dateStr: getLocalDateStr(currDate),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 35 or 42 cells grid
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateStr: getLocalDateStr(nextDate),
        dayNumber: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYearMonth]);

  // Month navigation
  const prevMonth = () => {
    setCurrentYearMonth((prev) =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }
    );
  };

  const nextMonth = () => {
    setCurrentYearMonth((prev) =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }
    );
  };

  const goToToday = () => {
    const d = new Date();
    setSelectedDate(todayStr);
    setCurrentYearMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const monthLabel = new Date(currentYearMonth.year, currentYearMonth.month, 1).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' }
  );

  const selectedDateEvents = useMemo(() => getEventsForDate(selectedDate), [getEventsForDate, selectedDate]);

  // Handlers
  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteEvent(deleteTargetId);
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    if (error) { toast(`Error: ${error}`, 'error'); return; }
    if (selectedEvent?.id === deleteTargetId) setSelectedEvent(null);
    toast('Event deleted.', 'success');
  };

  const handleStatusToggle = async (eventId: string, currentStatus: EventStatus) => {
    const nextStatus: EventStatus = currentStatus === 'completed' ? 'scheduled' : 'completed';
    const { error } = await updateEventStatus(eventId, nextStatus);
    if (error) toast(`Error updating status: ${error}`, 'error');
    else {
      toast(`Event status updated to ${nextStatus}.`, 'success');
      if (selectedEvent?.id === eventId) setSelectedEvent((e: any) => e ? { ...e, status: nextStatus } : null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-light text-foreground">Calendar</h1>
          <p className="text-xs text-sharon-muted mt-1.5 font-sans">
            Schedule appointments, meetings, church events, and key life milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-card border border-card-border/60 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'grid' ? 'bg-sharon-primary text-white' : 'text-sharon-muted hover:text-foreground'
              }`}
              title="Month Grid"
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'agenda' ? 'bg-sharon-primary text-white' : 'text-sharon-muted hover:text-foreground'
              }`}
              title="Agenda List"
            >
              <List size={13} />
            </button>
          </div>

          <button
            onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }}
            className="px-3.5 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus size={13} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Header */}
      <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-2xl font-light text-foreground">{monthLabel}</h2>
          <button
            onClick={goToToday}
            className="text-[10px] font-bold px-2 py-0.5 rounded border border-card-border/60 hover:bg-sharon-muted-light/40 text-sharon-muted transition-colors cursor-pointer ml-2"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-card-border/40 hover:bg-sharon-muted-light/40 text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-card-border/40 hover:bg-sharon-muted-light/40 text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center: Month Grid or Agenda List */}
        <div className="lg:col-span-7 space-y-6">
          {viewMode === 'grid' ? (
            <div className="space-y-2">
              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-sharon-muted pb-1">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-1 bg-card-border/10 p-1 rounded-xl border border-card-border/40">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDate(day.dateStr);
                  const isSelected = selectedDate === day.dateStr;
                  const isToday = todayStr === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`min-h-[72px] sm:min-h-[84px] p-1.5 rounded-lg cursor-pointer transition-all flex flex-col justify-between border ${
                        isSelected
                          ? 'border-sharon-primary bg-sharon-primary/5 shadow-xs font-semibold'
                          : 'border-transparent hover:border-card-border/40 hover:bg-sharon-muted-light/20'
                      } ${!day.isCurrentMonth ? 'opacity-35' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-serif leading-none px-1 py-0.5 rounded ${
                            isToday ? 'bg-sharon-primary text-white font-bold' : 'text-foreground'
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-[9px] font-bold text-sharon-muted">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event category indicator dots */}
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const cfg = CATEGORY_CONFIG[ev.category] || CATEGORY_CONFIG.other;
                          return (
                            <div
                              key={ev.id}
                              className="text-[9px] truncate px-1 py-0.5 rounded bg-sharon-muted-light/60 flex items-center gap-1 text-foreground"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                              <span className="truncate">{ev.title}</span>
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] text-sharon-muted block px-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List Mode */
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-card-border/20 pb-2">
                All Scheduled Events
              </h3>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-2">
                  {events.map((ev) => (
                    <EventAgendaRow
                      key={ev.id}
                      event={ev}
                      isSelected={selectedEvent?.id === ev.id}
                      onSelect={() => { setSelectedEvent(ev); setIsFormOpen(false); }}
                      onStatusToggle={() => handleStatusToggle(ev.id, ev.status)}
                      onDelete={() => handleDeleteTrigger(ev.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-sharon-muted italic py-6">No scheduled events found.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Selected Date Agenda & Form Drawer */}
        <div className="lg:col-span-5 space-y-6">
          {/* Create / Edit Form Drawer */}
          {isFormOpen ? (
            <EventFormDrawer
              initialDate={selectedDate}
              eventToEdit={selectedEvent}
              lifeAreas={lifeAreas}
              goals={goals}
              people={activePeople}
              onSave={async (eventData) => {
                if (selectedEvent) {
                  const { error } = await updateEvent(selectedEvent.id, eventData);
                  if (error) toast(`Save failed: ${error}`, 'error');
                  else {
                    toast('Event updated.', 'success');
                    setIsFormOpen(false);
                    setSelectedEvent(null);
                  }
                } else {
                  const { error } = await createEvent(eventData);
                  if (error) toast(`Create failed: ${error}`, 'error');
                  else {
                    toast('Event scheduled.', 'success');
                    setIsFormOpen(false);
                  }
                }
              }}
              onCancel={() => { setIsFormOpen(false); setSelectedEvent(null); }}
            />
          ) : selectedEvent ? (
            /* Selected Event Detail Panel */
            <EventDetailPanel
              event={selectedEvent}
              onEdit={() => setIsFormOpen(true)}
              onStatusToggle={() => handleStatusToggle(selectedEvent.id, selectedEvent.status)}
              onDelete={() => handleDeleteTrigger(selectedEvent.id)}
              onClose={() => setSelectedEvent(null)}
            />
          ) : (
            /* Selected Date Agenda Panel */
            <div className="space-y-4 font-sans bg-card border border-card-border/40 p-4 rounded-xl">
              <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-sharon-muted block">
                    Selected Date
                  </span>
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </h3>
                </div>
                <button
                  onClick={() => { setSelectedEvent(null); setIsFormOpen(true); }}
                  className="px-2.5 py-1 text-xs font-semibold text-sharon-primary border border-sharon-primary/30 hover:bg-sharon-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus size={11} />
                  <span>Add Event</span>
                </button>
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateEvents.map((ev) => (
                    <EventAgendaRow
                      key={ev.id}
                      event={ev}
                      isSelected={selectedEvent?.id === ev.id}
                      onSelect={() => setSelectedEvent(ev)}
                      onStatusToggle={() => handleStatusToggle(ev.id, ev.status)}
                      onDelete={() => handleDeleteTrigger(ev.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-sharon-muted italic">📅 Clean schedule for this date — no events scheduled.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete this event?"
        message="This action will permanently delete the event."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteModalOpen(false); setDeleteTargetId(null); }}
      />
    </div>
  );
}

// ─── Subcomponent: Event Row in Agenda ────────────────────────────────────────

function EventAgendaRow({
  event,
  isSelected,
  onSelect,
  onStatusToggle,
  onDelete,
}: {
  event: CalendarEvent;
  isSelected: boolean;
  onSelect: () => void;
  onStatusToggle: () => void;
  onDelete: () => void;
}) {
  const isCompleted = event.status === 'completed';

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
        isSelected
          ? 'border-sharon-primary bg-sharon-primary/5 font-semibold'
          : 'border-card-border/30 hover:border-sharon-primary/30 hover:bg-sharon-muted-light/20'
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onStatusToggle(); }}
        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
          isCompleted ? 'bg-sharon-accent border-sharon-accent text-white' : 'border-card-border hover:border-sharon-accent'
        }`}
        title={isCompleted ? 'Mark Scheduled' : 'Mark Completed'}
      >
        {isCompleted && <Check size={9} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-serif font-medium truncate ${isCompleted ? 'line-through text-sharon-muted' : 'text-foreground'}`}>
            {event.title}
          </span>
          <CategoryBadge category={event.category} />
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-sharon-muted">
          <span className="flex items-center gap-1 font-sans">
            <Clock size={10} />
            {event.is_all_day ? 'All Day' : `${formatTimeString(event.start_time)}${event.end_time ? ` - ${formatTimeString(event.end_time)}` : ''}`}
          </span>

          {event.location && (
            <span className="flex items-center gap-1 truncate font-sans">
              <MapPin size={10} />
              {event.location}
            </span>
          )}

          {event.life_area && (
            <span className="font-bold text-sharon-muted/70">
              {event.life_area.name}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="text-sharon-muted hover:text-red-500 p-1 transition-colors shrink-0"
        title="Delete Event"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ─── Subcomponent: Event Form Drawer ──────────────────────────────────────────

function EventFormDrawer({
  initialDate,
  eventToEdit,
  lifeAreas,
  goals,
  people = [],
  onSave,
  onCancel,
}: {
  initialDate: string;
  eventToEdit: CalendarEvent | null;
  lifeAreas: { id: string; name: string }[];
  goals: { id: string; title: string }[];
  people?: { id: string; name: string }[];
  onSave: (event: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [eventDate, setEventDate] = useState(eventToEdit?.event_date || initialDate);
  const [isAllDay, setIsAllDay] = useState(eventToEdit ? eventToEdit.is_all_day : false);
  const [startTime, setStartTime] = useState(eventToEdit?.start_time || '09:00');
  const [endTime, setEndTime] = useState(eventToEdit?.end_time || '10:00');
  const [location, setLocation] = useState(eventToEdit?.location || '');
  const [category, setCategory] = useState<EventCategory>(eventToEdit?.category || 'personal');
  const [lifeAreaId, setLifeAreaId] = useState(eventToEdit?.life_area_id || '');
  const [goalId, setGoalId] = useState(eventToEdit?.goal_id || '');
  const [personId, setPersonId] = useState(eventToEdit?.person_id || '');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Clear validation on input change
  useEffect(() => {
    setValidationError(null);
  }, [startTime, endTime, isAllDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate times
    const timeCheck = validateEventTimes(isAllDay, startTime, endTime);
    if (timeCheck.error) {
      setValidationError(timeCheck.error);
      return;
    }

    setSaving(true);
    await onSave({
      title: title.trim(),
      description: description || null,
      event_date: eventDate,
      start_time: timeCheck.startTime,
      end_time: timeCheck.endTime,
      is_all_day: isAllDay,
      location: location || null,
      category,
      life_area_id: lifeAreaId || null,
      goal_id: goalId || null,
      person_id: personId || null,
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans bg-card border border-card-border/40 p-4 rounded-xl">
      <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
        <h3 className="font-serif text-lg font-medium text-foreground">
          {eventToEdit ? 'Edit Event' : 'Schedule Event'}
        </h3>
        <button type="button" onClick={onCancel} className="text-sharon-muted hover:text-foreground p-1">
          <X size={15} />
        </button>
      </div>

      {validationError && (
        <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-1.5">
          <AlertCircle size={13} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Title */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-sharon-muted block">Event Title</label>
        <input
          type="text"
          placeholder="e.g. YPS Planning Meeting"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
        />
      </div>

      {/* Date & All-Day */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted block">Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 pb-1.5">
          <input
            type="checkbox"
            id="allDayCheck"
            checked={isAllDay}
            onChange={(e) => setIsAllDay(e.target.checked)}
            className="rounded border-card-border text-sharon-primary focus:ring-0 cursor-pointer"
          />
          <label htmlFor="allDayCheck" className="text-xs font-medium text-foreground cursor-pointer">
            All-Day Event
          </label>
        </div>
      </div>

      {/* Timed event inputs */}
      {!isAllDay && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-sharon-muted block">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required={!isAllDay}
              className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-sharon-muted block">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Location & Category */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted block">Location</label>
          <input
            type="text"
            placeholder="e.g. Zoom / Office"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
          >
            <option value="meeting">Meeting</option>
            <option value="appointment">Appointment</option>
            <option value="church">Church</option>
            <option value="personal">Personal</option>
            <option value="deadline">Deadline</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Life Area & Goal */}
      <div className="grid grid-cols-2 gap-3">
        {lifeAreas.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-sharon-muted block">Life Area</label>
            <select
              value={lifeAreaId}
              onChange={(e) => setLifeAreaId(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
            >
              <option value="">None</option>
              {lifeAreas.map((la) => (
                <option key={la.id} value={la.id}>{la.name}</option>
              ))}
            </select>
          </div>
        )}

        {goals.length > 0 && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-sharon-muted block">Connected Goal</label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
            >
              <option value="">None</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-sharon-muted block">Connected Contact</label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold cursor-pointer"
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
      </div>

      {/* Notes / Description */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-sharon-muted block">Notes / Details</label>
        <textarea
          placeholder="Add agenda, meeting link, or notes..."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none placeholder:text-sharon-muted/30"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-card-border/20">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 border border-card-border/60 rounded-lg text-xs font-semibold text-sharon-muted hover:text-foreground cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-4 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors"
        >
          {eventToEdit ? 'Save Changes' : 'Schedule Event'}
        </button>
      </div>
    </form>
  );
}

// ─── Subcomponent: Event Detail Panel ──────────────────────────────────────────

function EventDetailPanel({
  event,
  onEdit,
  onStatusToggle,
  onDelete,
  onClose,
}: {
  event: CalendarEvent;
  onEdit: () => void;
  onStatusToggle: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const isCompleted = event.status === 'completed';

  return (
    <div className="space-y-4 font-sans bg-card border border-card-border/40 p-4 rounded-xl">
      <div className="flex items-start justify-between gap-3 border-b border-card-border/20 pb-3">
        <div>
          <CategoryBadge category={event.category} />
          <h3 className="font-serif text-xl font-medium text-foreground mt-1.5">{event.title}</h3>
        </div>
        <button onClick={onClose} className="text-sharon-muted hover:text-foreground p-1">
          <X size={15} />
        </button>
      </div>

      <div className="space-y-2 text-xs text-foreground">
        <div className="flex items-center gap-2 text-sharon-muted">
          <CalendarIcon size={13} />
          <span>
            {new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sharon-muted">
          <Clock size={13} />
          <span>
            {event.is_all_day
              ? 'All-Day Event'
              : `${formatTimeString(event.start_time)}${event.end_time ? ` - ${formatTimeString(event.end_time)}` : ''}`}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sharon-muted">
            <MapPin size={13} />
            <span>{event.location}</span>
          </div>
        )}

        {event.life_area && (
          <div className="flex items-center gap-2 text-sharon-muted">
            <Tag size={13} />
            <span>Life Area: {event.life_area.name}</span>
          </div>
        )}

        {event.goal && (
          <div className="flex items-center gap-2 text-sharon-muted">
            <Target size={13} />
            <span>Goal: {event.goal.title}</span>
          </div>
        )}

        {event.person && (
          <div className="flex items-center gap-2 text-sharon-muted">
            <User size={13} />
            <span>Contact: {event.person.name}</span>
          </div>
        )}

        {event.description && (
          <div className="pt-2 border-t border-card-border/10 text-sharon-muted whitespace-pre-wrap leading-relaxed">
            {event.description}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-card-border/20">
        <button
          onClick={onStatusToggle}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            isCompleted
              ? 'border border-card-border text-foreground hover:bg-sharon-muted-light/40'
              : 'bg-sharon-accent hover:bg-sharon-accent/90 text-white'
          }`}
        >
          <Check size={12} />
          <span>{isCompleted ? 'Mark Scheduled' : 'Mark Completed'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg border border-card-border/60 hover:bg-sharon-muted-light/40 text-sharon-muted hover:text-foreground cursor-pointer transition-colors"
            title="Edit Event"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-sharon-muted hover:text-red-500 cursor-pointer transition-colors"
            title="Delete Event"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Exported Suspense Wrapper Component ──────────────────────────────────────

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CalendarContent />
    </Suspense>
  );
}
