'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { habitsService } from '@/services/habits-service';
import { profileService } from '@/services/profile-service';
import { Habit } from '@/types';

export function useHabits(date: string) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabitsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await habitsService.getHabits(user.id, date);
      if (error) throw error;
      setHabits(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading habits');
    } finally {
      setLoading(false);
    }
  }, [user, date]);

  useEffect(() => {
    fetchHabitsData();
  }, [fetchHabitsData]);

  const addHabit = async (name: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await habitsService.saveHabit(user.id, name);
      if (error) throw error;
      
      // Update local state
      setHabits((prev) => [...prev, { ...data!, logs: [], streak: 0, completionRate: 0 }]);
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await habitsService.deleteHabit(user.id, id);
      if (error) throw error;

      setHabits((prev) => prev.filter((h) => h.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const toggleHabit = async (habitId: string, completed: boolean) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await habitsService.toggleHabitLog(habitId, date, completed);
      if (error) throw error;

      // Update habits in state with new streak and completion rate recalculations
      const { data: refreshedHabits } = await habitsService.getHabits(user.id, date);
      if (refreshedHabits) {
        setHabits(refreshedHabits);
      }

      // Add 1 point to user growth score on habit completion
      if (completed) {
        await profileService.incrementGrowthScore(user.id, 1);
      } else {
        await profileService.incrementGrowthScore(user.id, -1);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    habits,
    loading,
    error,
    refresh: fetchHabitsData,
    addHabit,
    deleteHabit,
    toggleHabit
  };
}
