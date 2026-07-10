'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { lettersService } from '@/services/letters-service';
import { FutureLetter } from '@/types';

export function useLetters() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLetters = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await lettersService.getLetters(user.id);
      if (error) throw error;
      setLetters(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading letters');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const saveLetter = async (letter: Partial<FutureLetter>) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await lettersService.saveLetter(user.id, letter);
      if (error) throw error;
      setLetters((prev) => {
        const idx = prev.findIndex((l) => l.id === data.id);
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

  return {
    letters,
    loading,
    error,
    refresh: fetchLetters,
    saveLetter
  };
}
