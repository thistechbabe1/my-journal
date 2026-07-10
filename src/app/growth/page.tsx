'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Calendar, Award, Megaphone, BookOpen, Compass, ChevronRight } from 'lucide-react';
import { Divider } from '@/components/editorial';

export default function GrowthHub() {
  const categories = [
    {
      group: 'Daily',
      items: [
        {
          name: 'Habits Tracker',
          desc: 'Monitor daily checkboxes and consistency scores.',
          path: '/growth/habits',
          icon: Calendar
        }
      ]
    },
    {
      group: 'Weekly',
      items: [
        {
          name: 'Periodic Reviews',
          desc: 'Start weekly, monthly, or yearly growth iterations.',
          path: '/growth/reviews',
          icon: Compass
        }
      ]
    },
    {
      group: 'Projects',
      items: [
        {
          name: 'Writing Campaigns',
          desc: 'Plan storytelling stages and post drafts.',
          path: '/growth/campaigns',
          icon: Megaphone
        }
      ]
    },
    {
      group: 'Learning & Skills',
      items: [
        {
          name: 'Reading & Resource Index',
          desc: 'Curate insights, books, podcasts, and notes.',
          path: '/growth/learning',
          icon: BookOpen
        }
      ]
    },
    {
      group: 'Goals',
      items: [
        {
          name: 'Goals & Milestones',
          desc: 'Track core life milestones and action targets.',
          path: '/growth/goals',
          icon: Award
        }
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-6 px-4 text-left font-sans animate-fade-in">
      
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-sharon-primary uppercase tracking-widest bg-sharon-primary/10 border border-sharon-primary/20 px-2 py-0.5 rounded">
          Active Development
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-foreground tracking-wide mt-2">
          Growth Workspace
        </h1>
        <p className="text-xs text-sharon-muted mt-1.5 font-sans">
          Your portal for habits, goals, countdown campaigns, reviews, and reading notes.
        </p>
      </div>

      <Divider />

      {/* Directory Grid */}
      <div className="space-y-8">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-3">
            <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block border-b border-card-border/10 pb-1.5">
              {cat.group}
            </span>
            
            <div className="space-y-2">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-card-border/40 hover:bg-sharon-muted-light/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sharon-primary bg-sharon-primary/5 p-2 rounded-lg group-hover:bg-sharon-primary/10 transition-colors">
                        <Icon size={16} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-sharon-muted block">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-sharon-muted group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
