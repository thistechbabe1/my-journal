'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { eventsService, getLocalDateStr } from '@/services/events-service';
import { CalendarEvent, EventStatus } from '@/types';

export function useEvents(dateFilter?: { startDate?: string; endDate?: string }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await eventsService.getEvents(user.id, dateFilter);
      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading events');
    } finally {
      setLoading(false);
    }
  }, [user, dateFilter?.startDate, dateFilter?.endDate]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchEvents();
  }, [user, fetchEvents]);

  // ─── Derived views ──────────────────────────────────────────────────────────

  const activeEvents = useMemo(
    () => events.filter((e) => e.status !== 'cancelled'),
    [events]
  );

  const todayStr = useMemo(() => getLocalDateStr(), []);

  const todayEvents = useMemo(
    () => activeEvents.filter((e) => e.event_date === todayStr),
    [activeEvents, todayStr]
  );

  const upcomingEvents = useMemo(() => {
    const next7DaysStr = getLocalDateStr(new Date(Date.now() + 7 * 86400000));
    return activeEvents.filter(
      (e) => e.event_date >= todayStr && e.event_date <= next7DaysStr
    );
  }, [activeEvents, todayStr]);

  const getEventsForDate = useCallback(
    (dateStr: string) => activeEvents.filter((e) => e.event_date === dateStr),
    [activeEvents]
  );

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createEvent = async (event: Parameters<typeof eventsService.createEvent>[1]) => {
    if (!user) return { data: null, error: 'No authenticated user' };
    try {
      const { data, error } = await eventsService.createEvent(user.id, event);
      if (error) throw error;
      if (data) setEvents((prev) => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || err };
    }
  };

  const updateEvent = async (eventId: string, updates: Parameters<typeof eventsService.updateEvent>[2]) => {
    if (!user) return { data: null, error: 'No authenticated user' };
    try {
      const { data, error } = await eventsService.updateEvent(user.id, eventId, updates);
      if (error) throw error;
      if (data) setEvents((prev) => prev.map((e) => (e.id === eventId ? data : e)));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || err };
    }
  };

  const updateEventStatus = async (eventId: string, status: EventStatus) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await eventsService.updateEventStatus(user.id, eventId, status);
      if (error) throw error;
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status } : e))
      );
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await eventsService.deleteEvent(user.id, eventId);
      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
    activeEvents,
    todayEvents,
    upcomingEvents,
    getEventsForDate,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
  };
}
