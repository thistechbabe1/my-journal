'use client';

import React, { useState, useEffect } from 'react';
import { useLetters } from '@/hooks/use-letters';
import { Mail, Check, Calendar, ArrowLeft, Eye } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import Link from 'next/link';
import { Divider, FieldLabel, ActionButton } from '@/components/editorial';

export default function LettersPage() {
  const {
    letters,
    loading,
    saveLetter
  } = useLetters();

  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeLetter, setActiveLetter] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states matching table columns
  const [becomingWoman, setBecomingWoman] = useState('');
  const [habitsBuilt, setHabitsBuilt] = useState('');
  const [fearsSmaller, setFearsSmaller] = useState('');
  const [relationshipsGrown, setRelationshipsGrown] = useState('');
  const [futureThanks, setFutureThanks] = useState('');

  // Default month selection: current month
  useEffect(() => {
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
  }, []);

  // Sync states
  useEffect(() => {
    if (activeLetter) {
      setBecomingWoman(activeLetter.becoming_woman || '');
      setHabitsBuilt(activeLetter.habits_built || '');
      setFearsSmaller(activeLetter.fears_smaller || '');
      setRelationshipsGrown(activeLetter.relationships_grown || '');
      setFutureThanks(activeLetter.future_thanks || '');
    } else {
      setBecomingWoman('');
      setHabitsBuilt('');
      setFearsSmaller('');
      setRelationshipsGrown('');
      setFutureThanks('');
    }
  }, [activeLetter]);

  const handleSaveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth) return;

    setSaving(true);
    const { error, data } = await saveLetter({
      month: selectedMonth,
      becoming_woman: becomingWoman.trim() || null,
      habits_built: habitsBuilt.trim() || null,
      fears_smaller: fearsSmaller.trim() || null,
      relationships_grown: relationshipsGrown.trim() || null,
      future_thanks: futureThanks.trim() || null
    });

    setSaving(false);
    if (error) {
      toast(`Error saving letter: ${error}`, 'error');
    } else {
      toast(`Letter to self for ${formatMonthLabel(selectedMonth)} saved.`, 'success');
      setActiveLetter(data);
      setIsEditing(false);
    }
  };

  const handleSelectLetter = (letter: any) => {
    setActiveLetter(letter);
    setSelectedMonth(letter.month);
    setIsEditing(false);
  };

  const handleWriteNew = () => {
    setActiveLetter(null);
    setIsEditing(true);
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
  };

  const formatMonthLabel = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <Link
            href="/library"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Library Vault</span>
          </Link>
          <h1 className="text-4xl font-serif font-light text-foreground">
            Letters Capsule
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            Write stationery capsule letters to your future self, locked until their month arrives.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleWriteNew}
            className="px-3.5 py-1.5 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Mail size={13} />
            <span>Write Letter</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Capsule index */}
        <div className="lg:col-span-4 space-y-6 text-left font-sans">
          <div>
            <h3 className="font-serif text-lg font-medium text-foreground">Unlocked Letters</h3>
            <p className="text-[11px] text-sharon-muted mt-1">
              Your historical monthly stationery logs.
            </p>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : letters.length > 0 ? (
            <div className="space-y-2">
              {letters.map((letter) => {
                const isSelected = activeLetter?.id === letter.id;
                return (
                  <div
                    key={letter.id}
                    onClick={() => handleSelectLetter(letter)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-sharon-primary bg-sharon-muted-light/20 font-semibold'
                        : 'border-card-border/40 hover:border-sharon-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-sharon-primary shrink-0" />
                      <span className="text-xs text-foreground font-semibold truncate">
                        {formatMonthLabel(letter.month)}
                      </span>
                    </div>
                    <Eye size={12} className="text-sharon-muted" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-sharon-muted italic py-6">No letters logged yet.</p>
          )}
        </div>

        {/* Right: Write Slate / Selected Letter Display */}
        <div className="lg:col-span-8 w-full text-left font-sans">
          {isEditing ? (
            /* Editing Letter form (borderless stationery inputs) */
            <form onSubmit={handleSaveLetter} className="space-y-6 max-w-xl">
              <div className="flex items-center justify-between border-b border-card-border/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sharon-muted ">Target Month</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-transparent border-0 text-xs text-foreground font-bold outline-none cursor-pointer"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-sharon-muted hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <FieldLabel>Becoming the woman I want to be:</FieldLabel>
                  <textarea
                    placeholder="Who are you striving to align with this month?"
                    rows={3}
                    value={becomingWoman}
                    onChange={(e) => setBecomingWoman(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Habits built this month:</FieldLabel>
                  <textarea
                    placeholder="What rhythms are you solidifying?"
                    rows={3}
                    value={habitsBuilt}
                    onChange={(e) => setHabitsBuilt(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Fears made smaller:</FieldLabel>
                  <textarea
                    placeholder="What crucible challenges did you face down?"
                    rows={3}
                    value={fearsSmaller}
                    onChange={(e) => setFearsSmaller(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Relational connections grown:</FieldLabel>
                  <textarea
                    placeholder="Who did you love, support, or sync with?"
                    rows={3}
                    value={relationshipsGrown}
                    onChange={(e) => setRelationshipsGrown(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                  />
                </div>

                <div className="space-y-2">
                  <FieldLabel>My future self will thank me for:</FieldLabel>
                  <textarea
                    placeholder="What seeds are you planting today that you will harvest tomorrow?"
                    rows={3}
                    value={futureThanks}
                    onChange={(e) => setFutureThanks(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Save stationery Capsule
                </button>
              </div>
            </form>
          ) : activeLetter ? (
            /* Locked/Read View */
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-card-border/20 pb-4">
                <div>
                  <span className="text-[9px] font-bold text-sharon-primary bg-sharon-primary/10 border border-sharon-primary/20 px-2.5 py-0.5 rounded ">
                    Capsule unlocked
                  </span>
                  <h3 className="font-serif text-2xl font-light text-foreground mt-2">
                    Letter for {formatMonthLabel(activeLetter.month)}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-card-border bg-card text-foreground hover:bg-sharon-muted-light/60 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Edit Capsule
                </button>
              </div>

              <div className="space-y-6">
                {activeLetter.becoming_woman && (
                  <div className="space-y-1.5 text-left pl-3 border-l-2 border-sharon-primary/30">
                    <span className="text-[10px] font-bold text-sharon-muted block font-sans">Becoming the woman I want to be</span>
                    <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                      {activeLetter.becoming_woman}
                    </p>
                  </div>
                )}

                {activeLetter.habits_built && (
                  <div className="space-y-1.5 text-left pl-3 border-l-2 border-sharon-primary/30">
                    <span className="text-[10px] font-bold text-sharon-muted block font-sans">Habits built this month</span>
                    <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                      {activeLetter.habits_built}
                    </p>
                  </div>
                )}

                {activeLetter.fears_smaller && (
                  <div className="space-y-1.5 text-left pl-3 border-l-2 border-sharon-primary/30">
                    <span className="text-[10px] font-bold text-sharon-muted block font-sans">Fears made smaller</span>
                    <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                      {activeLetter.fears_smaller}
                    </p>
                  </div>
                )}

                {activeLetter.relationships_grown && (
                  <div className="space-y-1.5 text-left pl-3 border-l-2 border-sharon-primary/30">
                    <span className="text-[10px] font-bold text-sharon-muted block font-sans">Relational connections grown</span>
                    <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                      {activeLetter.relationships_grown}
                    </p>
                  </div>
                )}

                {activeLetter.future_thanks && (
                  <div className="space-y-1.5 text-left pl-3 border-l-2 border-sharon-accent/30">
                    <span className="text-[10px] font-bold text-sharon-accent block font-sans">My future self will thank me for</span>
                    <p className="text-sm font-serif italic text-foreground/90 leading-relaxed">
                      {activeLetter.future_thanks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-sharon-muted italic py-12 text-center bg-sharon-muted-light/10 rounded-lg">Select a letter from the index or click "Write Letter" to log stationery.</p>
          )}
        </div>

      </div>

    </div>
  );
}
