import { supabase } from '@/lib/supabase';
import { CalendarEvent, EventCategory, EventStatus } from '@/types';

// ─── Local Date Helpers ──────────────────────────────────────────────────────

export const getLocalDateStr = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Validate start_time <= end_time if both exist
export const validateEventTimes = (
  isAllDay: boolean,
  startTime?: string | null,
  endTime?: string | null
): { startTime: string | null; endTime: string | null; error?: string } => {
  if (isAllDay) {
    return { startTime: null, endTime: null };
  }
  if (!startTime || !startTime.trim()) {
    return { startTime: null, endTime: null, error: 'Start time is required for timed events' };
  }
  if (endTime && endTime.trim() && endTime < startTime) {
    return { startTime, endTime, error: 'End time cannot be earlier than start time' };
  }
  return { startTime, endTime: endTime || null };
};

// ─── Service Layer ────────────────────────────────────────────────────────────

export const eventsService = {
  /**
   * Fetch all events for a user, optionally filtered by date range.
   * Joined with life_areas and goals.
   */
  async getEvents(
    userId: string,
    filters?: { startDate?: string; endDate?: string }
  ): Promise<{ data: CalendarEvent[] | null; error: any }> {
    let query = supabase
      .from('events')
      .select(`
        *,
        life_area:life_areas(id, name),
        goal:goals(id, title)
      `)
      .eq('user_id', userId)
      .order('event_date', { ascending: true })
      .order('is_all_day', { ascending: false })
      .order('start_time', { ascending: true, nullsFirst: false });

    if (filters?.startDate) {
      query = query.gte('event_date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('event_date', filters.endDate);
    }

    let { data, error } = await query;

    if (error && (error.message?.includes('schema cache') || error.message?.includes('relationship') || error.code === 'PGRST200')) {
      let fallbackQuery = supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('event_date', { ascending: true })
        .order('is_all_day', { ascending: false })
        .order('start_time', { ascending: true, nullsFirst: false });

      if (filters?.startDate) {
        fallbackQuery = fallbackQuery.gte('event_date', filters.startDate);
      }
      if (filters?.endDate) {
        fallbackQuery = fallbackQuery.lte('event_date', filters.endDate);
      }
      const fallback = await fallbackQuery;
      data = fallback.data as any;
      error = fallback.error;
    }

    return { data: data as CalendarEvent[] | null, error };
  },

  /**
   * Create a new event with validated times.
   */
  async createEvent(
    userId: string,
    event: {
      title: string;
      description?: string | null;
      event_date: string;
      start_time?: string | null;
      end_time?: string | null;
      is_all_day?: boolean;
      location?: string | null;
      category?: EventCategory;
      life_area_id?: string | null;
      goal_id?: string | null;
    }
  ): Promise<{ data: CalendarEvent | null; error: any }> {
    const isAllDay = !!event.is_all_day;
    const timeValidation = validateEventTimes(isAllDay, event.start_time, event.end_time);

    if (timeValidation.error) {
      return { data: null, error: new Error(timeValidation.error) };
    }

    const payload: any = {
      user_id: userId,
      title: event.title,
      description: event.description ?? null,
      event_date: event.event_date,
      start_time: timeValidation.startTime,
      end_time: timeValidation.endTime,
      is_all_day: isAllDay,
      location: event.location ?? null,
      category: event.category ?? 'personal',
      life_area_id: event.life_area_id ?? null,
      goal_id: event.goal_id ?? null,
      status: 'scheduled',
    };

    if ((event as any).person_id) {
      payload.person_id = (event as any).person_id;
    }

    let { data, error } = await supabase
      .from('events')
      .insert(payload)
      .select(`
        *,
        life_area:life_areas(id, name),
        goal:goals(id, title)
      `)
      .maybeSingle();

    if (error) {
      const fallback = await supabase
        .from('events')
        .insert(payload)
        .select('*')
        .maybeSingle();

      if (!fallback.error) {
        data = fallback.data as any;
        error = null;
      } else {
        const cleanPayload = { ...payload };
        delete cleanPayload.person_id;
        const retryFallback = await supabase
          .from('events')
          .insert(cleanPayload)
          .select('*')
          .maybeSingle();
        data = retryFallback.data as any;
        error = retryFallback.error;
      }
    }

    return { data: data as CalendarEvent | null, error };
  },

  /**
   * Update an existing event.
   */
  async updateEvent(
    userId: string,
    eventId: string,
    updates: {
      title?: string;
      description?: string | null;
      event_date?: string;
      start_time?: string | null;
      end_time?: string | null;
      is_all_day?: boolean;
      location?: string | null;
      category?: EventCategory;
      life_area_id?: string | null;
      goal_id?: string | null;
      person_id?: string | null;
      status?: EventStatus;
    }
  ): Promise<{ data: CalendarEvent | null; error: any }> {
    const isAllDay = updates.is_all_day !== undefined ? updates.is_all_day : false;
    
    // If times are updated or all_day state changes
    if (updates.is_all_day !== undefined || updates.start_time !== undefined || updates.end_time !== undefined) {
      const timeValidation = validateEventTimes(isAllDay, updates.start_time, updates.end_time);
      if (timeValidation.error) {
        return { data: null, error: new Error(timeValidation.error) };
      }
      updates.start_time = timeValidation.startTime;
      updates.end_time = timeValidation.endTime;
    }

    let { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('user_id', userId)
      .select(`
        *,
        life_area:life_areas(id, name),
        goal:goals(id, title)
      `)
      .maybeSingle();

    if (error) {
      const fallback = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (!fallback.error) {
        data = fallback.data as any;
        error = null;
      } else {
        const cleanUpdates = { ...updates };
        delete cleanUpdates.person_id;
        const retryFallback = await supabase
          .from('events')
          .update({
            ...cleanUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', eventId)
          .eq('user_id', userId)
          .select('*')
          .maybeSingle();
        data = retryFallback.data as any;
        error = retryFallback.error;
      }
    }

    return { data: data as CalendarEvent | null, error };
  },

  /**
   * Update event status (scheduled, completed, cancelled).
   */
  async updateEventStatus(
    userId: string,
    eventId: string,
    status: EventStatus
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('events')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .eq('user_id', userId);

    return { error };
  },

  /**
   * Permanently delete an event.
   */
  async deleteEvent(
    userId: string,
    eventId: string
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId);

    return { error };
  },
};
