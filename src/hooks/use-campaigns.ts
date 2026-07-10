'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { campaignsService } from '@/services/campaigns-service';
import { Campaign, CampaignTask } from '@/types';

export function useCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTasks, setActiveTasks] = useState<CampaignTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await campaignsService.getCampaigns(user.id);
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading campaigns');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCampaigns();
  }, [user, fetchCampaigns]);

  const activeCampaign = campaigns.find((c) => c.status === 'active') || null;

  const fetchActiveTasks = useCallback(async () => {
    if (!activeCampaign) {
      setActiveTasks([]);
      return;
    }
    setTasksLoading(true);
    try {
      const { data, error } = await campaignsService.getCampaignTasks(activeCampaign.id);
      if (error) throw error;
      setActiveTasks(data || []);
    } catch (err) {
      console.error('Error fetching campaign tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  }, [activeCampaign]);

  useEffect(() => {
    fetchActiveTasks();
  }, [fetchActiveTasks]);

  const saveCampaign = async (campaign: Partial<Campaign>, tasks?: Partial<CampaignTask>[]) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data: newCampaign, error: campErr } = await campaignsService.saveCampaign(user.id, campaign);
      if (campErr) throw campErr;

      if (tasks && tasks.length > 0) {
        const tasksToInsert = tasks.map((t) => ({ ...t, campaign_id: newCampaign.id }));
        await campaignsService.saveCampaignTasksBatch(tasksToInsert);
      }

      await fetchCampaigns();
      return { data: newCampaign, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const saveTask = async (task: Partial<CampaignTask>) => {
    try {
      const { data: updatedTask, error } = await campaignsService.saveCampaignTask(task);
      if (error) throw error;

      setActiveTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      return { data: updatedTask, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const toggleTaskCompleted = async (taskId: string, completed: boolean) => {
    const task = activeTasks.find((t) => t.id === taskId);
    if (!task) return { error: 'Task not found' };
    return await saveTask({ ...task, completed });
  };

  const toggleTaskPublished = async (taskId: string, published: boolean) => {
    const task = activeTasks.find((t) => t.id === taskId);
    if (!task) return { error: 'Task not found' };
    return await saveTask({ ...task, published });
  };

  return {
    campaigns,
    activeCampaign,
    activeTasks,
    loading,
    tasksLoading,
    error,
    refresh: fetchCampaigns,
    saveCampaign,
    saveTask,
    toggleTaskCompleted,
    toggleTaskPublished
  };
}
