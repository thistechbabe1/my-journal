'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { usePeople } from '@/hooks/use-people';
import { useEvents } from '@/hooks/use-events';
import { useSeasons } from '@/hooks/use-seasons';
import { generateAttentionFeed } from '@/services/attention-engine';
import { AttentionItem } from '@/types';

export function useAttention() {
  const { tasks, loading: tasksLoading, completeTask } = useTasks();
  const { activePeople, loading: peopleLoading, markContacted } = usePeople();
  const { todayEvents, loading: eventsLoading } = useEvents();
  const { activeSeason, loading: seasonsLoading } = useSeasons();

  // User override / dismissed item IDs for the current session
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const loading = tasksLoading || peopleLoading || eventsLoading || seasonsLoading;

  // Generate sorted attention feed
  const rawFeed = useMemo(() => {
    return generateAttentionFeed(tasks, activePeople, todayEvents, activeSeason?.id);
  }, [tasks, activePeople, todayEvents, activeSeason?.id]);

  // Filter out session dismissed items
  const attentionFeed = useMemo(() => {
    return rawFeed.filter((item) => !dismissedIds.includes(item.id));
  }, [rawFeed, dismissedIds]);

  // Top Priority Attention Items (Tier: immediate or high, max 5 items)
  const topAttentionItems = useMemo(() => {
    return attentionFeed.slice(0, 5);
  }, [attentionFeed]);

  // Counts by Tier
  const immediateCount = useMemo(
    () => attentionFeed.filter((i) => i.tier === 'immediate').length,
    [attentionFeed]
  );

  const highCount = useMemo(
    () => attentionFeed.filter((i) => i.tier === 'high').length,
    [attentionFeed]
  );

  // User override action: Dismiss item for session
  const dismissItem = useCallback((itemId: string) => {
    setDismissedIds((prev) => [...prev, itemId]);
  }, []);

  return {
    attentionFeed,
    topAttentionItems,
    immediateCount,
    highCount,
    loading,
    dismissItem,
    completeTask,
    markContacted
  };
}
