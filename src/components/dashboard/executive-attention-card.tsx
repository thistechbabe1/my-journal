'use client';

import React from 'react';
import Link from 'next/link';
import { AttentionItem } from '@/types';

interface ExecutiveAttentionCardProps {
  item: AttentionItem;
  onDismiss: (id: string) => void;
  onActionClick?: (item: AttentionItem) => void;
}

export function ExecutiveAttentionCard({
  item,
  onDismiss,
  onActionClick
}: ExecutiveAttentionCardProps) {
  const isUrgent = item.tier === 'immediate';

  // Collapse rationale items into a single plain text sentence
  const rationaleText = item.rationale.length > 0 ? item.rationale.join(' — ') : null;

  return (
    <div className="p-4 rounded-xl bg-card border border-card-border hover:border-sharon-primary/40 transition-all space-y-3 shadow-xs">
      {/* Header: Max 1 Badge (for urgent/overdue) & Dismiss */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-danger/10 text-danger border border-danger/20">
              Urgent
            </span>
          ) : (
            <span className="text-xs font-medium text-sharon-muted capitalize">
              {item.entity_type}
            </span>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(item.id)}
          className="min-h-[44px] px-2 text-xs font-medium text-sharon-muted hover:text-foreground transition-colors cursor-pointer flex items-center justify-center"
          title="Dismiss for today"
        >
          Dismiss
        </button>
      </div>

      {/* Content: Title & Subtitle */}
      <div className="space-y-1">
        <h3 className="font-serif font-medium text-foreground text-base leading-snug">
          {item.title}
        </h3>
        {item.subtitle && (
          <p className="text-xs text-sharon-muted font-normal leading-relaxed">{item.subtitle}</p>
        )}
      </div>

      {/* Single plain text rationale line */}
      {rationaleText && (
        <p className="text-xs text-sharon-muted/90 italic border-l-2 border-card-border pl-2 py-0.5">
          {rationaleText}
        </p>
      )}

      {/* Footer: Action Button */}
      <div className="pt-2 border-t border-card-border flex items-center justify-end">
        {onActionClick ? (
          <button
            onClick={() => onActionClick(item)}
            className="min-h-[44px] px-4 rounded-lg bg-sharon-primary text-white hover:bg-sharon-primary-light text-xs font-semibold transition-all cursor-pointer flex items-center justify-center"
          >
            {item.action_label}
          </button>
        ) : (
          <Link
            href={item.action_url}
            className="min-h-[44px] px-4 rounded-lg bg-sharon-primary text-white hover:bg-sharon-primary-light text-xs font-semibold transition-all cursor-pointer flex items-center justify-center inline-flex"
          >
            {item.action_label}
          </Link>
        )}
      </div>
    </div>
  );
}
