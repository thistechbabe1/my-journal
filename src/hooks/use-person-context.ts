'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { contextLinker, Person360Context } from '@/services/context-linker';

export function usePerson360Context(personId: string | null) {
  const { user } = useAuth();
  const [contextData, setContextData] = useState<Person360Context | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    if (!user || !personId) {
      setContextData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await contextLinker.getPerson360Context(user.id, personId);
      if (error) throw error;
      setContextData(data);
    } catch (err: any) {
      setError(err.message || 'Error loading 360 context');
    } finally {
      setLoading(false);
    }
  }, [user, personId]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  return {
    contextData,
    loading,
    error,
    refresh: fetchContext
  };
}
