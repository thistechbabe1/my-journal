'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePeople } from '@/hooks/use-people';
import { getFollowUpUrgency } from '@/services/people-service';
import { Person } from '@/types';
import { MarkContactedModal } from '@/components/people/mark-contacted-modal';
import { useToast } from '@/components/feedback/ToastProvider';

export function PeopleWidget() {
  const { followUpDuePeople, waitingOnPeople, loading, markContacted } = usePeople();
  const { toast } = useToast();
  const [activeMarkPerson, setActiveMarkPerson] = useState<Person | null>(null);

  // Combine follow-up due people and waiting on people (deduped)
  const priorityPeople = React.useMemo(() => {
    const map = new Map<string, Person>();
    followUpDuePeople.forEach((p) => map.set(p.id, p));
    waitingOnPeople.forEach((p) => map.set(p.id, p));
    return Array.from(map.values()).slice(0, 5); // limit to top 5
  }, [followUpDuePeople, waitingOnPeople]);

  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="text-base font-serif font-medium text-foreground">People & follow-ups</h3>
          <p className="text-xs text-sharon-muted">Touchpoints and reminders</p>
        </div>
        <Link
          href="/people"
          className="text-xs font-bold text-sharon-primary hover:text-sharon-primary-light transition-all min-h-[44px] flex items-center px-2"
        >
          View all
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-6 text-sharon-muted text-xs animate-pulse">
          Loading follow-ups...
        </div>
      ) : priorityPeople.length === 0 ? (
        <div className="text-center py-6 text-sharon-muted text-xs bg-sharon-muted-light/30 rounded-xl border border-card-border p-4 font-medium">
          All caught up — no follow-ups requiring attention right now.
        </div>
      ) : (
        <div className="space-y-2.5">
          {priorityPeople.map((person) => {
            const urgency = getFollowUpUrgency(person);
            return (
              <div
                key={person.id}
                className="flex items-center justify-between p-3 rounded-xl bg-sharon-muted-light/20 border border-card-border hover:border-sharon-primary/40 transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-sharon-primary/10 border border-sharon-primary/20 flex items-center justify-center text-sharon-primary text-xs font-bold shrink-0">
                    {person.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href="/people"
                        className="font-serif font-medium text-sm text-foreground hover:text-sharon-primary truncate"
                      >
                        {person.name}
                      </Link>
                      {person.type && (
                        <span className="px-1.5 py-0.5 rounded bg-sharon-muted-light/60 text-[10px] text-sharon-muted shrink-0">
                          {person.type}
                        </span>
                      )}
                    </div>

                    {person.next_action && (
                      <p className="text-xs text-sharon-muted truncate mt-0.5">
                        <span className="font-normal text-foreground">Next:</span> {person.next_action}
                      </p>
                    )}
                    {!person.next_action && person.waiting_on && (
                      <p className="text-xs text-sharon-muted truncate mt-0.5">
                        <span className="font-normal text-foreground">Waiting on:</span> {person.waiting_on}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {urgency === 'overdue' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-danger/10 text-danger border border-danger/20">
                      Overdue
                    </span>
                  )}

                  <button
                    onClick={() => setActiveMarkPerson(person)}
                    className="min-h-[44px] px-3 rounded-lg bg-sharon-primary/10 hover:bg-sharon-primary/20 text-sharon-primary border border-sharon-primary/20 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
                  >
                    Contacted
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mark Contacted Modal */}
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
