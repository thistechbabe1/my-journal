'use client';

import React, { useState } from 'react';
import { useAttention } from '@/hooks/use-attention';
import { ExecutiveAttentionCard } from '@/components/dashboard/executive-attention-card';
import { MarkContactedModal } from '@/components/people/mark-contacted-modal';
import { Person } from '@/types';
import { usePeople } from '@/hooks/use-people';
import { useToast } from '@/components/feedback/ToastProvider';

export function ExecutiveAttentionBrief() {
  const {
    topAttentionItems,
    immediateCount,
    highCount,
    loading,
    dismissItem,
    completeTask
  } = useAttention();

  const { activePeople, markContacted } = usePeople();
  const { toast } = useToast();

  const [activeMarkPerson, setActiveMarkPerson] = useState<Person | null>(null);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Sharon.';
    if (hour < 17) return 'Good afternoon, Sharon.';
    return 'Good evening, Sharon.';
  };

  const handleActionClick = async (item: any) => {
    if (item.entity_type === 'task') {
      await completeTask(item.entity_id);
      toast(`Completed: "${item.title}"`, 'success');
    } else if (item.entity_type === 'person') {
      const person = activePeople.find((p) => p.id === item.entity_id);
      if (person) {
        setActiveMarkPerson(person);
      }
    } else if (typeof window !== 'undefined') {
      window.location.href = item.action_url;
    }
  };

  const count = topAttentionItems.length;

  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 md:p-6 shadow-xs space-y-5">
      {/* Executive Brief Greeting Header */}
      <div className="space-y-1">
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-foreground ">
          {getGreeting()}
        </h2>
        <p className="text-sm font-medium text-sharon-primary">
          {loading
            ? 'Loading focus items...'
            : count === 0
            ? 'Everything is clear — no urgent items today.'
            : `${count} focus item${count === 1 ? '' : 's'} for today.`}
        </p>
      </div>

      {/* Attention Cards List */}
      {loading ? (
        <div className="py-6 text-center text-sharon-muted text-xs animate-pulse">
          Loading focus items...
        </div>
      ) : count === 0 ? (
        <div className="p-5 rounded-xl bg-sharon-muted-light/30 border border-card-border text-center space-y-1">
          <p className="text-sm font-serif font-medium text-foreground">All clear for today</p>
          <p className="text-xs text-sharon-muted">
            No urgent tasks or follow-ups require attention right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topAttentionItems.map((item) => (
            <ExecutiveAttentionCard
              key={item.id}
              item={item}
              onDismiss={dismissItem}
              onActionClick={handleActionClick}
            />
          ))}
        </div>
      )}

      {/* Mark Contacted Modal for Person actions */}
      <MarkContactedModal
        isOpen={Boolean(activeMarkPerson)}
        onClose={() => setActiveMarkPerson(null)}
        person={activeMarkPerson}
        onConfirm={async (options) => {
          if (activeMarkPerson) {
            await markContacted(activeMarkPerson.id, options);
            toast(`Marked ${activeMarkPerson.name} contacted`, 'success');
          }
        }}
      />
    </div>
  );
}
