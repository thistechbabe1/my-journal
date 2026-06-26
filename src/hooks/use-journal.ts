'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { journalService } from '@/services/journal-service';
import { profileService } from '@/services/profile-service';
import { JournalEntry, DailyFocus } from '@/types';

export function useJournal(filters?: {
  startDate?: string;
  endDate?: string;
  mood?: number;
  tag?: string;
  search?: string;
}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [dailyFocus, setDailyFocus] = useState<DailyFocus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJournalData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await journalService.getEntries(user.id, filters);
      if (error) throw error;
      setEntries(data || []);

      // Fetch today's focus
      const todayStr = new Date().toISOString().split('T')[0];
      const focusRes = await journalService.getDailyFocus(user.id, todayStr);
      setDailyFocus(focusRes.data);
    } catch (err: any) {
      setError(err.message || 'Error loading journal entries');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchJournalData();
  }, [fetchJournalData]);

  const saveEntry = async (entry: Partial<JournalEntry>) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await journalService.saveEntry(user.id, entry);
      if (error) throw error;

      // Update local state
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.id === data!.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = data!;
          return next;
        }
        return [data!, ...prev];
      });

      // Increment growth score by 5 points for new entry reflections
      if (!entry.id) {
        await profileService.incrementGrowthScore(user.id, 5);
      }

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await journalService.deleteEntry(user.id, id);
      if (error) throw error;

      setEntries((prev) => prev.filter((e) => e.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const getDailyFocusForDate = async (date: string) => {
    if (!user) return { data: null, error: 'No authenticated user' };
    return await journalService.getDailyFocus(user.id, date);
  };

  const saveDailyFocus = async (focus: Partial<DailyFocus> & { date: string }) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await journalService.saveDailyFocus(user.id, focus);
      if (error) throw error;

      const todayStr = new Date().toISOString().split('T')[0];
      if (focus.date === todayStr) {
        setDailyFocus(data);
      }

      // Increment growth score by 3 points for priority focus set
      await profileService.incrementGrowthScore(user.id, 3);

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    entries,
    dailyFocus,
    loading,
    error,
    refresh: fetchJournalData,
    saveEntry,
    deleteEntry,
    getDailyFocusForDate,
    saveDailyFocus
  };
}
