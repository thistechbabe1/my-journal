'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { tasksService, getTaskUrgency } from '@/services/tasks-service';
import { Task } from '@/types';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await tasksService.getTasks(user.id);
      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchTasks();
  }, [user, fetchTasks]);

  // ─── Derived views ──────────────────────────────────────────────────────────
  // Computed from the single tasks array — no extra fetches needed.

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status === 'active'),
    [tasks]
  );

  const overdueTasks = useMemo(
    () => activeTasks.filter((t) => getTaskUrgency(t) === 'overdue'),
    [activeTasks]
  );

  const todayTasks = useMemo(
    () => activeTasks.filter((t) => getTaskUrgency(t) === 'today'),
    [activeTasks]
  );

  const soonTasks = useMemo(
    () => activeTasks.filter((t) => getTaskUrgency(t) === 'soon'),
    [activeTasks]
  );

  const upcomingTasks = useMemo(
    () => activeTasks.filter((t) => getTaskUrgency(t) === 'upcoming'),
    [activeTasks]
  );

  const noDateTasks = useMemo(
    () => activeTasks.filter((t) => getTaskUrgency(t) === 'no-date'),
    [activeTasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === 'complete'),
    [tasks]
  );

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const createTask = async (task: Parameters<typeof tasksService.createTask>[1]) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await tasksService.createTask(user.id, task);
      if (error) throw error;
      if (data) setTasks((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const updateTask = async (taskId: string, updates: Parameters<typeof tasksService.updateTask>[2]) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await tasksService.updateTask(user.id, taskId, updates);
      if (error) throw error;
      if (data) setTasks((prev) => prev.map((t) => (t.id === taskId ? data : t)));
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await tasksService.completeTask(user.id, taskId);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: 'complete', completed_at: new Date().toISOString() }
            : t
        )
      );
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const reopenTask = async (taskId: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await tasksService.reopenTask(user.id, taskId);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: 'active', completed_at: null } : t
        )
      );
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await tasksService.deleteTask(user.id, taskId);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    // Raw data
    tasks,
    loading,
    error,
    refresh: fetchTasks,
    // Derived views
    activeTasks,
    overdueTasks,
    todayTasks,
    soonTasks,
    upcomingTasks,
    noDateTasks,
    completedTasks,
    // Mutations
    createTask,
    updateTask,
    completeTask,
    reopenTask,
    deleteTask,
  };
}
