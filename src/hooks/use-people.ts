'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { peopleService, getFollowUpUrgency } from '@/services/people-service';
import { Person, RelationshipInteraction } from '@/types';

export function usePeople() {
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await peopleService.getPeople(user.id);
      if (error) throw error;
      setPeople(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading contacts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPeople();
  }, [user, fetchPeople]);

  // Derived filtered lists
  const activePeople = useMemo(
    () => people.filter((p) => p.status !== 'archived'),
    [people]
  );

  const followUpDuePeople = useMemo(
    () => activePeople.filter((p) => {
      const u = getFollowUpUrgency(p);
      return u === 'overdue' || u === 'today';
    }),
    [activePeople]
  );

  const overdueFollowUps = useMemo(
    () => activePeople.filter((p) => getFollowUpUrgency(p) === 'overdue'),
    [activePeople]
  );

  const waitingOnPeople = useMemo(
    () => activePeople.filter((p) => Boolean(p.waiting_on && p.waiting_on.trim())),
    [activePeople]
  );

  const archivedPeople = useMemo(
    () => people.filter((p) => p.status === 'archived'),
    [people]
  );

  // Operations
  const createPerson = async (
    personData: Omit<Partial<Person>, 'id' | 'user_id' | 'created_at'>
  ): Promise<Person | null> => {
    if (!user) return null;
    const { data, error } = await peopleService.createPerson(user.id, personData);
    if (error) throw error;
    if (data) {
      setPeople((prev) => [data, ...prev]);
    }
    return data;
  };

  const updatePerson = async (
    id: string,
    updates: Partial<Person>
  ): Promise<Person | null> => {
    const { data, error } = await peopleService.updatePerson(id, updates);
    if (error) throw error;
    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    }
    return data;
  };

  const deletePerson = async (id: string) => {
    const { error } = await peopleService.deletePerson(id);
    if (error) throw error;
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const markContacted = async (
    id: string,
    options: {
      nextFollowUpDate?: string | null;
      keepExistingFollowUp?: boolean;
      interaction?: {
        type: string;
        notes: string;
      } | null;
    }
  ) => {
    if (!user) return null;
    const { data, error } = await peopleService.markContacted(id, user.id, options);
    if (error) throw error;
    if (data) {
      setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    }
    return data;
  };

  return {
    people,
    activePeople,
    followUpDuePeople,
    overdueFollowUps,
    waitingOnPeople,
    archivedPeople,
    loading,
    error,
    refresh: fetchPeople,
    createPerson,
    updatePerson,
    deletePerson,
    markContacted
  };
}

export function usePersonInteractions(relationshipId: string | null) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<RelationshipInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInteractions = useCallback(async () => {
    if (!relationshipId) {
      setInteractions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await peopleService.getInteractions(relationshipId);
      if (error) throw error;
      setInteractions(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading interaction history');
    } finally {
      setLoading(false);
    }
  }, [relationshipId]);

  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  const addInteraction = async (type: string, notes: string, interactionDate?: string) => {
    if (!user || !relationshipId) return null;
    const { data, error } = await peopleService.addInteraction(user.id, relationshipId, {
      type,
      notes,
      interaction_date: interactionDate
    });
    if (error) throw error;
    if (data) {
      setInteractions((prev) => [data, ...prev]);
    }
    return data;
  };

  const deleteInteraction = async (id: string) => {
    const { error } = await peopleService.deleteInteraction(id);
    if (error) throw error;
    setInteractions((prev) => prev.filter((i) => i.id !== id));
  };

  return {
    interactions,
    loading,
    error,
    refresh: fetchInteractions,
    addInteraction,
    deleteInteraction
  };
}
