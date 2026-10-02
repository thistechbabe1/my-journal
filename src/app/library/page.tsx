'use client';

import React from 'react';
import Link from 'next/link';
import { Book, Mail, ClipboardList, Clock, ChevronRight } from 'lucide-react';
import { Divider } from '@/components/editorial';

export default function LibraryHub() {
  const vaults = [
    {
      name: 'Memoirs & Archives',
      desc: 'Your life, recorded over time — Seasonal dossiers, On This Day memoirs, and archives.',
      path: '/library/memoirs',
      icon: Book
    },
    {
      name: 'Letters Capsule',
      desc: 'Stationery messages composed to your future self.',
      path: '/library/letters',
      icon: Mail
    },
    {
      name: 'Life Timeline',
      desc: 'Chronological roadmap of lessons, achievements, and milestones.',
      path: '/library/timeline',
      icon: Clock
    },
    {
      name: 'Periodic Reviews Archive',
      desc: 'Past weekly, monthly, and yearly retrospective reflections.',
      path: '/library/reviews',
      icon: ClipboardList
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 px-4 text-left font-sans animate-fade-in">
      
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded">
          Quiet Archives
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-foreground mt-2">
          The Library
        </h1>
        <p className="text-xs text-sharon-muted mt-1.5 font-sans">
          A peaceful repository of past chapters, letters, reviews, and historical timeline logs.
        </p>
      </div>

      <Divider />

      {/* Directory Grid */}
      <div className="space-y-4">
        {vaults.map((vault) => {
          const Icon = vault.icon;
          return (
            <Link
              key={vault.path}
              href={vault.path}
              className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-card-border/40 hover:bg-sharon-muted-light/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="text-sharon-primary bg-sharon-primary/5 p-2 rounded-lg group-hover:bg-sharon-primary/10 transition-colors">
                  <Icon size={16} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    {vault.name}
                  </span>
                  <span className="text-xs text-sharon-muted block mt-0.5">
                    {vault.desc}
                  </span>
                </div>
              </div>
              <ChevronRight size={14} className="text-sharon-muted group-hover:translate-x-0.5 transition-transform" />
            </Link>
          );
        })}
      </div>

    </div>
  );
}
