import { supabase } from '@/lib/supabase';
import { Task, TaskUrgency } from '@/types';

// ─── Date helpers ────────────────────────────────────────────────────────────

const getLocalDateStr = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const diffDays = (dateStr: string): number => {
  const today = getLocalDateStr();
  if (dateStr === today) return 0;
  const d1 = new Date(today + 'T00:00:00');
  const d2 = new Date(dateStr + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
};

export const getTaskUrgency = (task: Task): TaskUrgency => {
  if (task.status === 'complete') return 'complete';
  if (!task.due_date) return 'no-date';
  const diff = diffDays(task.due_date);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 3) return 'soon';
  return 'upcoming';
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const tasksService = {
  /**
   * Fetch all tasks for a user, with life_area and goal names joined.
   * Optionally filter by status.
   */
  async getTasks(
    userId: string,
    filters?: { status?: 'active' | 'complete' }
  ): Promise<{ data: Task[] | null; error: any }> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        life_area:life_areas(id, name),
        goal:goals(id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    let { data, error } = await query;

    if (error && (error.message?.includes('schema cache') || error.message?.includes('relationship') || error.code === 'PGRST200')) {
      let fallbackQuery = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        fallbackQuery = fallbackQuery.eq('status', filters.status);
      }
      const fallback = await fallbackQuery;
      data = fallback.data as any;
      error = fallback.error;
    }

    return { data: data as Task[] | null, error };
  },

  /**
   * Create a new task.
   */
  async createTask(
    userId: string,
    task: {
      title: string;
      notes?: string | null;
      due_date?: string | null;
      priority?: 'high' | 'medium' | 'low';
      life_area_id?: string | null;
      goal_id?: string | null;
      campaign_id?: string | null;
      milestone_id?: string | null;
      person_id?: string | null;
    }
  ): Promise<{ data: Task | null; error: any }> {
    const payload: any = {
      user_id: userId,
      title: task.title,
      notes: task.notes ?? null,
      due_date: task.due_date ?? null,
      priority: task.priority ?? 'medium',
      status: 'active',
      life_area_id: task.life_area_id ?? null,
      goal_id: task.goal_id ?? null,
      campaign_id: task.campaign_id ?? null,
      milestone_id: task.milestone_id ?? null,
    };

    if (task.person_id) {
      payload.person_id = task.person_id;
    }

    let { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select(`
        *,
        life_area:life_areas(id, name),
        goal:goals(id, title)
      `)
      .maybeSingle();

    if (error) {
      // Step 1: Fallback select('*')
      const fallback = await supabase
        .from('tasks')
        .insert(payload)
        .select('*')
        .maybeSingle();

      if (!fallback.error) {
        data = fallback.data as any;
        error = null;
      } else {
        // Step 2: Strip un-migrated columns (person_id, campaign_id, milestone_id) if missing in schema cache
        const cleanPayload = { ...payload };
        delete cleanPayload.person_id;
        delete cleanPayload.campaign_id;
        delete cleanPayload.milestone_id;
        const retryFallback = await supabase
          .from('tasks')
          .insert(cleanPayload)
          .select('*')
          .maybeSingle();
        data = retryFallback.data as any;
        error = retryFallback.error;
      }
    }

    return { data: data as Task | null, error };
  },

  /**
   * Update an existing task's editable fields.
   */
  async updateTask(
    userId: string,
    taskId: string,
    updates: {
      title?: string;
      notes?: string | null;
      due_date?: string | null;
      priority?: 'high' | 'medium' | 'low';
      life_area_id?: string | null;
      goal_id?: string | null;
      campaign_id?: string | null;
      milestone_id?: string | null;
      person_id?: string | null;
    }
  ): Promise<{ data: Task | null; error: any }> {
    let { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select(`
        *,
        life_area:life_areas(id, name),
        goal:goals(id, title)
      `)
      .maybeSingle();

    if (error) {
      // Step 1: Fallback select('*')
      const fallback = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();

      if (!fallback.error) {
        data = fallback.data as any;
        error = null;
      } else {
        // Step 2: Strip un-migrated columns (person_id) if missing in schema cache
        const cleanUpdates = { ...updates };
        delete (cleanUpdates as any).person_id;
        const retryFallback = await supabase
          .from('tasks')
          .update(cleanUpdates)
          .eq('id', taskId)
          .eq('user_id', userId)
          .select('*')
          .maybeSingle();
        data = retryFallback.data as any;
        error = retryFallback.error;
      }
    }

    return { data: data as Task | null, error };
  },

  /**
   * Mark a task complete. Sets status and records completed_at timestamp.
   */
  async completeTask(
    userId: string,
    taskId: string
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'complete',
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId);

    return { error };
  },

  /**
   * Reopen a completed task back to active.
   */
  async reopenTask(
    userId: string,
    taskId: string
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'active',
        completed_at: null,
      })
      .eq('id', taskId)
      .eq('user_id', userId);

    return { error };
  },

  /**
   * Permanently delete a task.
   */
  async deleteTask(
    userId: string,
    taskId: string
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    return { error };
  },
};
