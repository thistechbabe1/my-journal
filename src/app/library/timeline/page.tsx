'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { Clock, ArrowLeft, Award, Book, Compass, Star } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

interface TimelineItem {
  id: string;
  type: 'goal' | 'season' | 'learning' | 'win';
  date: string;
  title: string;
  description: string;
}

export default function TimelinePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const timelineList: TimelineItem[] = [];

      // 1. Fetch completed goals (100% progress)
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('progress', 100);

      if (goals) {
        goals.forEach((g: any) => {
          timelineList.push({
            id: `goal-${g.id}`,
            type: 'goal',
            date: g.deadline || g.created_at || new Date().toISOString(),
            title: `Goal Achieved: ${g.title}`,
            description: g.description || 'Target milestone achieved successfully.'
          });
        });
      }

      // 2. Fetch concluded seasons
      const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'archived');

      if (seasons) {
        seasons.forEach((s: any) => {
          timelineList.push({
            id: `season-${s.id}`,
            type: 'season',
            date: s.end_date || new Date().toISOString(),
            title: `Chapter Concluded: ${s.name}`,
            description: s.review || `Finished season focusing on ${s.primary_focus}.`
          });
        });
      }

      // 3. Fetch completed learning resources
      const { data: learning } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (learning) {
        learning.forEach((l: any) => {
          timelineList.push({
            id: `learning-${l.id}`,
            type: 'learning',
            date: l.completion_date || l.created_at || new Date().toISOString(),
            title: `Study Completed: ${l.title}`,
            description: l.author ? `By ${l.author}. ${l.reflections || ''}` : l.reflections || 'Finished resource study.'
          });
        });
      }

      // 4. Fetch daily check-in wins
      const { data: checkins } = await supabase
        .from('daily_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .not('win', 'is', null);

      if (checkins) {
        checkins.forEach((c: any) => {
          if (c.win && c.win.trim().length > 0) {
            timelineList.push({
              id: `win-${c.id}`,
              type: 'win',
              date: c.date,
              title: `Daily Milestone`,
              description: c.win
            });
          }
        });
      }

      // Sort timeline: Newest to oldest
      timelineList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(timelineList);
    } catch (err: any) {
      toast(`Error compiling timeline: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [user]);

  const icons = {
    goal: Award,
    season: Compass,
    learning: Book,
    win: Star
  };

  const colors = {
    goal: 'text-sharon-primary bg-sharon-primary/10 border-sharon-primary/20',
    season: 'text-sharon-accent bg-sharon-accent/10 border-sharon-accent/20',
    learning: 'text-foreground bg-sharon-muted-light/60 border-card-border/40',
    win: 'text-sharon-primary bg-sharon-primary/10 border-sharon-primary/20'
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto py-2">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <Link
            href="/library"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light uppercase tracking-wider flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Library Vault</span>
          </Link>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Life Timeline
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            Your self-writing autobiography index. Highlights goals met, concluded seasons, and daily wins.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length > 0 ? (
        <div className="relative border-l border-card-border/30 pl-6 ml-3 space-y-8 text-left font-sans">
          {items.map((item) => {
            const Icon = icons[item.type];
            const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div key={item.id} className="relative group space-y-1">
                {/* Timeline node */}
                <div className={`absolute -left-10 top-0.5 w-8 h-8 rounded-full border flex items-center justify-center transition-all ${colors[item.type]}`}>
                  <Icon size={12} />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-sharon-muted uppercase tracking-wider">
                  <span>{dateLabel}</span>
                  <span>•</span>
                  <span className="capitalize">{item.type}</span>
                </div>

                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  {item.title}
                </h3>
                
                <p className="text-xs text-sharon-muted leading-relaxed font-serif italic max-w-xl">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-sharon-muted italic py-12 text-center font-sans">Timeline index is empty. Complete goals, log book completions, or record daily wins to automatically compile records here.</p>
      )}

    </div>
  );
}
