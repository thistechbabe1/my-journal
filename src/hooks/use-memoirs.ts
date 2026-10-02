'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { memoirsService } from '@/services/memoirs-service';
import { MemoirEntry, MemoirFilter, SeasonalDossier } from '@/types';
import { getLocalDateStr } from '@/lib/date-utils';

export function useMemoirs(initialFilter: MemoirFilter = {}, initialLimit: number = 20) {
  const { user } = useAuth();

  const [memoirs, setMemoirs] = useState<MemoirEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [onThisDayMemoirs, setOnThisDayMemoirs] = useState<MemoirEntry[]>([]);
  const [activeDossier, setActiveDossier] = useState<SeasonalDossier | null>(null);
  
  const [filter, setFilter] = useState<MemoirFilter>(initialFilter);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  
  const [loading, setLoading] = useState(true);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch paginated memoirs feed
  const fetchMemoirs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const { data, totalCount: count, error: err } = await memoirsService.getMemoirs(
        user.id,
        filter,
        limit,
        offset
      );
      if (err) throw err;
      setMemoirs(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(err.message || 'Error loading memoirs');
    } finally {
      setLoading(false);
    }
  }, [user, filter, page, limit]);

  // Fetch On This Day memoirs from previous years
  const fetchOnThisDay = useCallback(async () => {
    if (!user) return;
    try {
      const todayStr = getLocalDateStr();
      const { data } = await memoirsService.getOnThisDay(user.id, todayStr);
      setOnThisDayMemoirs(data || []);
    } catch (err) {
      console.error('Error loading On This Day memoirs:', err);
    }
  }, [user]);

  // Fetch Seasonal Dossier
  const loadSeasonalDossier = useCallback(async (seasonId: string) => {
    if (!user || !seasonId) return;
    setDossierLoading(true);
    try {
      const { data, error: err } = await memoirsService.getSeasonalDossier(user.id, seasonId);
      if (err) throw err;
      setActiveDossier(data);
    } catch (err: any) {
      console.error('Error loading seasonal dossier:', err);
    } finally {
      setDossierLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchMemoirs();
    fetchOnThisDay();
  }, [user, fetchMemoirs, fetchOnThisDay]);

  const setYearFilter = (year: number | 'all') => {
    setFilter((prev) => ({ ...prev, year }));
    setPage(1);
  };

  const setTypeFilter = (type: MemoirFilter['type']) => {
    setFilter((prev) => ({ ...prev, type }));
    setPage(1);
  };

  const setSearchQuery = (query: string) => {
    setFilter((prev) => ({ ...prev, searchQuery: query }));
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    memoirs,
    totalCount,
    onThisDayMemoirs,
    activeDossier,
    filter,
    page,
    totalPages,
    loading,
    dossierLoading,
    error,
    setPage,
    setFilter,
    setYearFilter,
    setTypeFilter,
    setSearchQuery,
    refresh: fetchMemoirs,
    loadSeasonalDossier
  };
}
