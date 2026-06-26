'use client';

import React, { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/use-reviews';
import { Review } from '@/types';
import {
  ClipboardList,
  Calendar,
  CheckCircle,
  Plus,
  Trash2,
  BookOpen,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<PeriodType>('weekly');
  const [showAddReview, setShowAddReview] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    reviews,
    loading,
    saveReview,
    deleteReview
  } = useReviews(activeTab);

  // Review Form States
  const [win, setWin] = useState('');
  const [lesson, setLesson] = useState('');
  const [mistake, setMistake] = useState('');
  const [avoided, setAvoided] = useState('');
  const [improved, setImproved] = useState('');
  const [focus, setFocus] = useState('');
  const [periodKey, setPeriodKey] = useState('');

  const [activeReview, setActiveReview] = useState<Partial<Review> | null>(null);

  // Default period key generation on load/tab switch
  useEffect(() => {
    const today = new Date();
    if (activeTab === 'weekly') {
      // e.g. "2026-W26"
      const year = today.getFullYear();
      const oneJan = new Date(year, 0, 1);
      const numberOfDays = Math.floor((today.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
      setPeriodKey(`${year}-W${week}`);
    } else if (activeTab === 'monthly') {
      // e.g. "2026-06"
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setPeriodKey(`${today.getFullYear()}-${month}`);
    } else if (activeTab === 'quarterly') {
      // e.g. "2026-Q2"
      const quarter = Math.ceil((today.getMonth() + 1) / 3);
      setPeriodKey(`${today.getFullYear()}-Q${quarter}`);
    } else if (activeTab === 'annual') {
      // e.g. "2026"
      setPeriodKey(String(today.getFullYear()));
    }
    setActiveReview(null);
    setShowAddReview(false);
  }, [activeTab]);

  // Sync editor values when selecting a review from list
  useEffect(() => {
    if (activeReview) {
      setWin(activeReview.win || '');
      setLesson(activeReview.lesson || '');
      setMistake(activeReview.mistake || '');
      setAvoided(activeReview.avoided || '');
      setImproved(activeReview.improved || '');
      setFocus(activeReview.focus || '');
      setPeriodKey(activeReview.period_key || '');
      setShowAddReview(true);
    } else {
      setWin('');
      setLesson('');
      setMistake('');
      setAvoided('');
      setImproved('');
      setFocus('');
    }
  }, [activeReview]);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!win.trim()) return;

    setSaving(true);
    const reviewData = {
      ...activeReview,
      period_type: activeTab,
      period_key: periodKey,
      win,
      lesson,
      mistake,
      avoided,
      improved,
      focus
    };

    const { error } = await saveReview(reviewData);
    setSaving(false);
    if (!error) {
      setShowAddReview(false);
      setActiveReview(null);
    }
  };

  const handleNew = () => {
    setActiveReview({
      period_type: activeTab
    });
    setShowAddReview(true);
  };

  const getPeriodPlaceholder = () => {
    switch (activeTab) {
      case 'weekly': return 'e.g. 2026-W26';
      case 'monthly': return 'e.g. 2026-06';
      case 'quarterly': return 'e.g. 2026-Q2';
      default: return 'e.g. 2026';
    }
  };

  const getPromptLabel = (field: string) => {
    const capsTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    switch (field) {
      case 'win': return `Biggest Win of the ${capsTab}`;
      case 'lesson': return `Biggest Lesson Learned`;
      case 'mistake': return `Biggest Error / Mistake`;
      case 'avoided': return `What I Intentionally Avoided`;
      case 'improved': return `What I Improved`;
      default: return `Focus Area for the Next Period`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sharon-primary via-indigo-500 to-sharon-primary-light bg-clip-text text-transparent">
            Reflection & Reviews
          </h1>
          <p className="text-sm text-sharon-muted mt-1.5">
            Log strategic reviews across cycles to observe growth patterns over years.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-sm transition-all shadow-md shadow-sharon-primary/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          <span>Reflect Now</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-card-border gap-2">
        {(['weekly', 'monthly', 'quarterly', 'annual'] as PeriodType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-sharon-primary text-sharon-primary'
                : 'border-transparent text-sharon-muted hover:text-foreground'
            }`}
          >
            {tab} reviews
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Historical Reviews Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-bold text-sm text-sharon-muted px-1 uppercase tracking-wider">Reflection History</h3>
          
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-6 h-6 border-2 border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative border-l border-card-border/80 pl-6 ml-3 space-y-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  onClick={() => setActiveReview(rev)}
                  className="relative group cursor-pointer text-left"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[31px] w-2.5 h-2.5 rounded-full border border-card bg-card transition-colors ${
                    activeReview?.id === rev.id
                      ? 'bg-sharon-primary border-sharon-primary-light ring-4 ring-sharon-primary-light/20'
                      : 'bg-sharon-primary-light border-card-border group-hover:bg-sharon-primary'
                  }`} />

                  <div className={`sharon-card p-4 transition-all ${
                    activeReview?.id === rev.id
                      ? 'border-sharon-primary bg-sharon-primary-light/5'
                      : 'hover:border-sharon-primary-light'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sharon-primary">
                        <Award size={13} className="text-sharon-accent-dark dark:text-sharon-accent" />
                        <span>{rev.period_key}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this review?')) deleteReview(rev.id);
                        }}
                        className="text-sharon-muted hover:text-danger p-0.5 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted block">Biggest Win</span>
                        <p className="text-xs text-foreground line-clamp-1 leading-relaxed mt-0.5">{rev.win}</p>
                      </div>
                      {rev.lesson && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted block">Lesson Learned</span>
                          <p className="text-xs text-foreground line-clamp-1 leading-relaxed mt-0.5">{rev.lesson}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sharon-card p-8 text-center text-sharon-muted">
              <p className="text-xs font-bold">No historical reviews recorded.</p>
              <p className="text-[10px] mt-1">Select a period key and click "Reflect Now".</p>
            </div>
          )}
        </div>

        {/* Right Side: Form / Editor Sheet */}
        <div className="lg:col-span-7">
          {showAddReview ? (
            <form onSubmit={handleSaveReview} className="sharon-card p-6 border-t-3 border-sharon-primary space-y-6">
              <div className="flex items-center justify-between border-b border-card-border pb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-sharon-primary" />
                  <h3 className="font-bold text-base">
                    {activeReview?.id ? 'Edit Review reflection' : `New ${activeTab.toUpperCase()} Review`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-sharon-muted shrink-0">Period Key</span>
                  <input
                    type="text"
                    value={periodKey}
                    onChange={(e) => setPeriodKey(e.target.value)}
                    placeholder={getPeriodPlaceholder()}
                    className="bg-[#111622]/10 border border-card-border rounded-lg px-2.5 py-1 text-xs outline-none text-foreground font-bold max-w-[120px]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3.5 py-1.5 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <div className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                    <span>Complete</span>
                  </button>
                </div>
              </div>

              {/* Reflection Sheets */}
              <div className="space-y-4">
                {/* Win */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">{getPromptLabel('win')}</label>
                  <textarea
                    rows={2}
                    value={win}
                    onChange={(e) => setWin(e.target.value)}
                    placeholder="Reflect on your primary highlight, accomplishment, or breakthrough..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                    required
                  />
                </div>

                {/* Lesson */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">{getPromptLabel('lesson')}</label>
                  <textarea
                    rows={2}
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    placeholder="What did you learn? What structural realizations occurred?"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Mistake */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">{getPromptLabel('mistake')}</label>
                  <textarea
                    rows={2}
                    value={mistake}
                    onChange={(e) => setMistake(e.target.value)}
                    placeholder="Where did you fall short? What boundaries were crossed? What errors occurred?"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Avoided */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">{getPromptLabel('avoided')}</label>
                  <textarea
                    rows={2}
                    value={avoided}
                    onChange={(e) => setAvoided(e.target.value)}
                    placeholder="What tasks, distractions, negative environments, or traps did you actively bypass?"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Improved */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">{getPromptLabel('improved')}</label>
                  <textarea
                    rows={2}
                    value={improved}
                    onChange={(e) => setImproved(e.target.value)}
                    placeholder="What systems did you improve? How were workflows optimized?"
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Focus */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-sharon-muted">{getPromptLabel('focus')}</label>
                  <textarea
                    rows={2}
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="Define priorities and metrics for the upcoming period..."
                    className="w-full bg-[#111622]/10 border border-card-border rounded-xl py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-sharon-primary-light/10 flex items-center justify-center text-sharon-primary">
                <ClipboardList size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Consolidated Review Board</h3>
                <p className="text-xs mt-1">
                  Select a past review from the history log to read/edit, or click below to reflect now.
                </p>
              </div>
              <button
                onClick={handleNew}
                className="px-4 py-2 rounded-xl bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow shadow-sharon-primary/10 cursor-pointer"
              >
                <span>Reflect Now</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
