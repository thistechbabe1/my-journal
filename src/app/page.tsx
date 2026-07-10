'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useIdentity } from '@/hooks/use-identity';
import { useJournal } from '@/hooks/use-journal';
import { useCheckIn } from '@/hooks/use-checkin';
import Link from 'next/link';
import { Calendar, CheckSquare, Sparkles, BookOpen, Clock, Heart, Edit3 } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import { Divider } from '@/components/editorial';

export default function TodayPage() {
  const { user } = useAuth();
  const { profile } = useIdentity();
  const { toast } = useToast();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const {
    entries,
    dailyFocus,
    saveDailyFocus,
    loading: journalLoading
  } = useJournal();

  const {
    checkIn,
    loading: checkInLoading,
    saveCheckIn
  } = useCheckIn(todayStr);

  // Focus (Intention) States
  const [intentionText, setIntentionText] = useState('');
  const [isSavingIntention, setIsSavingIntention] = useState(false);

  // Evening check-in states
  const [prayed, setPrayed] = useState(false);
  const [exercised, setExercised] = useState(false);
  const [builtText, setBuiltText] = useState('');
  const [learnedNew, setLearnedNew] = useState(false);
  const [networked, setNetworked] = useState(false);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(3);
  const [winText, setWinText] = useState('');
  const [improveText, setImproveText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);

  // Sync intention text
  useEffect(() => {
    if (dailyFocus) {
      setIntentionText(dailyFocus.top_priority || '');
    }
  }, [dailyFocus]);

  // Sync rhythms & check-in state
  useEffect(() => {
    if (checkIn) {
      setPrayed(checkIn.prayed || false);
      setExercised(checkIn.exercised || false);
      setBuiltText(checkIn.built_text || '');
      setLearnedNew(checkIn.learned_new || false);
      setNetworked(checkIn.networked || false);
      setEnergy(checkIn.energy || 7);
      setMood(checkIn.mood || 3);
      setWinText(checkIn.win || '');
      setImproveText(checkIn.improve || '');
    }
  }, [checkIn]);

  // Handle intention save
  const handleSaveIntention = async () => {
    if (!user) return;
    setIsSavingIntention(true);
    try {
      const { error } = await saveDailyFocus({
        date: todayStr,
        top_priority: intentionText,
        secondary_priority: ''
      });
      if (error) throw error;
      toast('Today\'s intention set.', 'success');
    } catch (err: any) {
      toast(`Error setting intention: ${err.message}`, 'error');
    } finally {
      setIsSavingIntention(false);
    }
  };

  // Auto-save Rhythms when toggled
  const handleToggleRhythm = async (field: 'prayed' | 'exercised' | 'learned_new' | 'networked', value: boolean) => {
    if (!user) return;
    try {
      const payload = {
        prayed: field === 'prayed' ? value : prayed,
        exercised: field === 'exercised' ? value : exercised,
        learned_new: field === 'learned_new' ? value : learnedNew,
        networked: field === 'networked' ? value : networked,
        built_text: builtText,
        energy,
        mood,
        win: winText,
        improve: improveText
      };
      
      // Update local state first
      if (field === 'prayed') setPrayed(value);
      if (field === 'exercised') setExercised(value);
      if (field === 'learned_new') setLearnedNew(value);
      if (field === 'networked') setNetworked(value);

      const { error } = await saveCheckIn(payload);
      if (error) throw error;
    } catch (err: any) {
      toast(`Error logging rhythms: ${err.message}`, 'error');
    }
  };

  // Save Evening Reflection
  const handleSaveReflection = async () => {
    if (!user) return;
    setSavingReflection(true);
    try {
      const payload = {
        prayed,
        exercised,
        learned_new: learnedNew,
        networked,
        built_text: builtText,
        energy,
        mood,
        win: winText,
        improve: improveText
      };
      const { error } = await saveCheckIn(payload);
      if (error) throw error;
      toast('Evening reflection recorded.', 'success');
    } catch (err: any) {
      toast(`Error saving reflection: ${err.message}`, 'error');
    } finally {
      setSavingReflection(false);
    }
  };

  // On This Day Memoirs filter
  const getMemoirs = () => {
    if (!entries || entries.length === 0) return [];
    
    // Find matching month and day, but different year
    const targetMonthDay = todayStr.substring(5); // "-MM-DD"
    const currentYear = today.getFullYear();

    return entries
      .filter((entry) => {
        if (!entry.date) return false;
        const entryYear = new Date(entry.date).getFullYear();
        return entry.date.endsWith(targetMonthDay) && entryYear < currentYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const memoirs = getMemoirs();
  const loadingAll = journalLoading || checkInLoading;

  if (loadingAll) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-sharon-muted mt-4 font-sans tracking-wide">Opening Today...</p>
      </div>
    );
  }

  const moodEmojis = ['😢', '😔', '😐', '🙂', '✨'];

  return (
    <div className="max-w-2xl mx-auto space-y-12 py-8 px-4 text-left font-sans animate-fade-in">
      
      {/* 1. Header (Greeting & Date) */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-serif font-light text-foreground tracking-wide">
          Good morning, {profile?.name || 'Sharon'}.
        </h1>
        <p className="text-xs font-bold text-sharon-muted uppercase tracking-widest">
          {dateFormatted}
        </p>
      </div>

      <Divider />

      {/* 2. Today's Intention */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Today's Intention
        </span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Write today's focus or intention..."
            value={intentionText}
            onChange={(e) => setIntentionText(e.target.value)}
            onBlur={handleSaveIntention}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveIntention()}
            className="w-full bg-transparent border-0 border-b border-transparent focus:border-card-border/60 rounded-none py-1.5 px-0 text-xl sm:text-2xl font-serif italic text-foreground outline-none transition-all placeholder:text-sharon-muted/40 font-light"
          />
        </div>
      </div>

      <Divider />

      {/* 3. Today's Rhythm Checklist */}
      <div className="space-y-5">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Today's Rhythm
        </span>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          {[
            { id: 'prayed', label: 'Prayer', value: prayed },
            { id: 'exercised', label: 'Exercise', value: exercised },
            { id: 'learned_new', label: 'Learning', value: learnedNew },
            { id: 'networked', label: 'Building', value: networked }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 cursor-pointer text-sm font-medium text-foreground select-none py-1"
            >
              <input
                type="checkbox"
                checked={item.value}
                onChange={(e) => handleToggleRhythm(item.id as any, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Divider />

      {/* 4. Continue Writing (Reflective Action Link) */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Continue Writing
        </span>
        <div className="flex items-center justify-between py-1">
          <p className="text-xs text-sharon-muted leading-relaxed font-sans max-w-sm">
            Keep recording your memories, thoughts, and lessons. Decant today's occurrences.
          </p>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs transition-colors shrink-0"
          >
            <BookOpen size={12} />
            <span>Open Journal</span>
          </Link>
        </div>
      </div>

      {/* 5. Evening Reflection Section */}
      <Divider />
      
      <div className="space-y-6">
        <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
          Evening Reflection
        </span>
        
        <div className="space-y-4 max-w-md">
          {/* Mood & Energy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted block">Mood Status</label>
              <div className="flex gap-2.5">
                {moodEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setMood(idx + 1); }}
                    className={`text-base p-1 rounded-md transition-all cursor-pointer ${
                      mood === idx + 1 ? 'bg-sharon-muted-light/60 scale-110' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted block">Energy ({energy}/10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="w-full h-1 bg-card-border rounded-lg appearance-none cursor-pointer accent-sharon-primary"
              />
            </div>
          </div>

          {/* Win & Improve */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Today's Win</label>
              <input
                type="text"
                placeholder="What went well today?"
                value={winText}
                onChange={(e) => setWinText(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1.5 px-0 text-xs outline-none text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">What I built / learned</label>
              <input
                type="text"
                placeholder="Next.js auth, database tables..."
                value={builtText}
                onChange={(e) => setBuiltText(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1.5 px-0 text-xs outline-none text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">Improve tomorrow</label>
              <input
                type="text"
                placeholder="What can be improved tomorrow?"
                value={improveText}
                onChange={(e) => setImproveText(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/40 focus:border-sharon-primary rounded-none py-1.5 px-0 text-xs outline-none text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveReflection}
              disabled={savingReflection}
              className="px-4 py-2 border border-card-border bg-card hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {savingReflection ? 'Saving...' : 'Record Evening Reflection'}
            </button>
          </div>
        </div>
      </div>

      {/* 6. On This Day Memoirs */}
      {memoirs.length > 0 && (
        <>
          <Divider />
          <div className="space-y-6">
            <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">
              On This Day
            </span>
            <div className="space-y-6">
              {memoirs.map((memoir) => {
                const year = new Date(memoir.date).getFullYear();
                const yearsAgo = today.getFullYear() - year;
                return (
                  <div key={memoir.id} className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-sharon-primary uppercase tracking-wider">
                      <Clock size={11} />
                      <span>{year} ({yearsAgo} {yearsAgo === 1 ? 'year' : 'years'} ago)</span>
                    </div>
                    <p className="text-sm font-serif italic text-foreground/90 pl-3.5 border-l-2 border-sharon-primary/30 py-0.5 leading-relaxed">
                      {memoir.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
