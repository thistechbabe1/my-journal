'use client';

import React from 'react';
import Link from 'next/link';
import { usePerson360Context } from '@/hooks/use-person-context';

interface RelatedContextCardProps {
  personId: string;
  personName: string;
}

export function RelatedContextCard({ personId, personName }: RelatedContextCardProps) {
  const { contextData, loading } = usePerson360Context(personId);

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center text-slate-500 text-xs animate-pulse">
        Loading related tasks, events, and goals...
      </div>
    );
  }

  if (!contextData) return null;

  const { relatedTasks, relatedEvents, relatedGoals } = contextData;
  const hasRelated = relatedTasks.length > 0 || relatedEvents.length > 0 || relatedGoals.length > 0;

  if (!hasRelated) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-500 text-center">
        🔗 No tasks, events, or goals currently linked to {personName}.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>🔗</span> Related Initiatives ({relatedTasks.length + relatedEvents.length + relatedGoals.length})
        </h3>
        <span className="text-[10px] text-slate-500 font-semibold">360 Context Graph</span>
      </div>

      <div className="space-y-3">
        {/* Related Tasks */}
        {relatedTasks.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-sharon-primary block mb-1.5">
              Tasks ({relatedTasks.length})
            </span>
            <div className="space-y-1.5">
              {relatedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'complete' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="font-semibold text-slate-200 truncate">{task.title}</span>
                  </div>
                  <Link
                    href={`/tasks?focus=${task.id}`}
                    className="text-[10px] font-bold text-sharon-primary hover:underline shrink-0"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-sharon-primary block mb-1.5">
              Events ({relatedEvents.length})
            </span>
            <div className="space-y-1.5">
              {relatedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{event.event_date}</span>
                    <span className="font-semibold text-slate-200 truncate">{event.title}</span>
                  </div>
                  <Link
                    href={`/calendar?date=${event.event_date}`}
                    className="text-[10px] font-bold text-sharon-primary hover:underline shrink-0"
                  >
                    Calendar →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Goals */}
        {relatedGoals.length > 0 && (
          <div>
            <span className="text-[10px] font-bold text-sky-400 block mb-1.5">
              Goals ({relatedGoals.length})
            </span>
            <div className="space-y-1.5">
              {relatedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <span className="font-semibold text-slate-200 truncate">{goal.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{goal.progress}% progress</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
