'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { goalsService } from '@/services/goals-service';
import { profileService } from '@/services/profile-service';
import { Goal } from '@/types';

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoalsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await goalsService.getGoals(user.id);
      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading goals');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchGoalsData();
  }, [user, fetchGoalsData]);

  const saveGoal = async (goal: Partial<Goal>, milestonesList?: string[]) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await goalsService.saveGoal(user.id, goal, milestonesList);
      if (error) throw error;

      // Refresh goals list
      const refreshed = await goalsService.getGoals(user.id);
      if (refreshed.data) setGoals(refreshed.data);

      // Award 10 growth score points for setting a major life goal
      if (!goal.id) {
        await profileService.incrementGrowthScore(user.id, 10);
      }

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await goalsService.deleteGoal(user.id, id);
      if (error) throw error;

      setGoals((prev) => prev.filter((g) => g.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const toggleMilestone = async (goalId: string, milestoneId: string, completed: boolean) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await goalsService.toggleMilestone(goalId, milestoneId, completed);
      if (error) throw error;

      // Update local state
      setGoals((prev) => {
        return prev.map((g) => {
          if (g.id === goalId) {
            const nextMs = (g.milestones || []).map((m) => {
              if (m.id === milestoneId) return { ...m, completed };
              return m;
            });
            const completedCount = nextMs.filter((m) => m.completed).length;
            const progress = nextMs.length > 0 ? Math.round((completedCount / nextMs.length) * 100) : 0;
            return {
              ...g,
              progress,
              milestones: nextMs
            };
          }
          return g;
        });
      });

      // Award 4 points on completing a milestone
      if (completed) {
        await profileService.incrementGrowthScore(user.id, 4);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const addMilestone = async (
    goalId: string,
    payload: {
      text: string;
      target_date?: string | null;
      person_id?: string | null;
      campaign_id?: string | null;
    } | string
  ) => {
    try {
      const { data, error } = await goalsService.addMilestone(goalId, payload);
      if (error) throw error;

      // Refresh goals list
      const refreshed = await goalsService.getGoals(user!.id);
      if (refreshed.data) setGoals(refreshed.data);

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const updateMilestone = async (
    goalId: string,
    milestoneId: string,
    updates: Partial<import('@/types').GoalMilestone>
  ) => {
    try {
      const { data, error } = await goalsService.updateMilestone(goalId, milestoneId, updates);
      if (error) throw error;

      // Refresh goals list
      const refreshed = await goalsService.getGoals(user!.id);
      if (refreshed.data) setGoals(refreshed.data);

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const { error } = await goalsService.deleteMilestone(goalId, milestoneId);
      if (error) throw error;

      // Refresh goals list
      const refreshed = await goalsService.getGoals(user!.id);
      if (refreshed.data) setGoals(refreshed.data);

      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    goals,
    loading,
    error,
    refresh: fetchGoalsData,
    saveGoal,
    deleteGoal,
    toggleMilestone,
    addMilestone,
    updateMilestone,
    deleteMilestone
  };
}
