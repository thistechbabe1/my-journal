'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { seasonsService } from '@/services/seasons-service';
import { Season } from '@/types';

export function useSeasons() {
  const { user } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeasons = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await seasonsService.getSeasons(user.id);
      if (error) throw error;
      setSeasons(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading seasons');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSeasons();
  }, [user, fetchSeasons]);

  const saveSeason = async (season: Partial<Season>) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await seasonsService.saveSeason(user.id, season);
      if (error) throw error;
      setSeasons((prev) => {
        const idx = prev.findIndex((s) => s.id === data.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data;
          return updated;
        } else {
          return [data, ...prev];
        }
      });
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const archiveSeason = async (id: string, reviewText: string) => {
    try {
      const { data, error } = await seasonsService.archiveSeason(id, reviewText);
      if (error) throw error;
      setSeasons((prev) => prev.map((s) => (s.id === id ? data : s)));
      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const activeSeason = seasons.find((s) => s.status === 'active') || null;
  const archivedSeasons = seasons.filter((s) => s.status === 'archived');

  const [activeSeasonContext, setActiveSeasonContext] = useState<{
    activeSeasonalGoalsCount: number;
    milestonesDueThisWeekCount: number;
    goals: any[];
  } | null>(null);

  useEffect(() => {
    if (user && activeSeason?.id) {
      seasonsService.getActiveSeasonContext(user.id, activeSeason.id).then((res) => {
        setActiveSeasonContext(res);
      });
    } else {
      setActiveSeasonContext(null);
    }
  }, [user, activeSeason?.id]);

  return {
    seasons,
    activeSeason,
    archivedSeasons,
    activeSeasonContext,
    loading,
    error,
    refresh: fetchSeasons,
    saveSeason,
    archiveSeason
  };
}
