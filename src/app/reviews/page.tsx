'use client';

import React, { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/use-reviews';
import { Review } from '@/types';
import {
  Calendar,
  Check,
  Plus,
  Trash2,
  Award,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';

type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<PeriodType>('weekly');
  const [showAddReview, setShowAddReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
      const year = today.getFullYear();
      const oneJan = new Date(year, 0, 1);
      const numberOfDays = Math.floor((today.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
      setPeriodKey(`${year}-W${week}`);
    } else if (activeTab === 'monthly') {
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setPeriodKey(`${today.getFullYear()}-${month}`);
    } else if (activeTab === 'quarterly') {
      const quarter = Math.ceil((today.getMonth() + 1) / 3);
      setPeriodKey(`${today.getFullYear()}-Q${quarter}`);
    } else if (activeTab === 'annual') {
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
    if (error) {
      toast(`Error saving review: ${error}`, 'error');
    } else {
      setShowAddReview(false);
      setActiveReview(null);
      toast('Review reflection saved.', 'success');
    }
  };

  const handleNew = () => {
    setActiveReview({
      period_type: activeTab
    });
    setShowAddReview(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    const { error } = await deleteReview(deleteTargetId);
    setIsDeleteModalOpen(false);
    setDeleteTargetId(null);

    if (error) {
      toast(`Error deleting review: ${error}`, 'error');
    } else {
      toast('Review deleted.', 'success');
      if (activeReview?.id === deleteTargetId) {
        setActiveReview(null);
      }
    }
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
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Reflection & Reviews
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            Consolidate your timelines, review key learnings, and focus forward.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="px-4 py-2 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Reflect Now</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-card-border/40 pb-1 font-sans">
        {(['weekly', 'monthly', 'quarterly', 'annual'] as PeriodType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all -mb-[5px] ${
              activeTab === tab
                ? 'border-sharon-primary text-foreground'
                : 'border-transparent text-sharon-muted hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: History Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="font-serif text-lg font-medium text-foreground text-left">Timeline Log</h3>
          
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="relative border-l border-card-border pl-6 ml-3 space-y-6 text-left font-sans">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  onClick={() => setActiveReview(rev)}
                  className="relative group cursor-pointer"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-[31px] w-2 h-2 rounded-full border border-card bg-card transition-all ${
                    activeReview?.id === rev.id
                      ? 'bg-sharon-primary border-sharon-primary ring-4 ring-sharon-primary/20'
                      : 'bg-card border-card-border group-hover:bg-sharon-primary'
                  }`} />

                  <div className={`sharon-card p-4 transition-all ${
                    activeReview?.id === rev.id
                      ? 'border-sharon-primary bg-sharon-primary-light/5'
                      : 'hover:border-sharon-primary/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-sharon-primary">
                        <Award size={12} className="text-sharon-accent" />
                        <span>{rev.period_key}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTrigger(rev.id);
                        }}
                        className="text-sharon-muted hover:text-danger p-0.5 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <p className="text-xs font-serif italic text-foreground mt-2 line-clamp-2 leading-relaxed">
                      "{rev.win}"
                    </p>

                    <div className="flex gap-2 justify-between items-center mt-3 pt-2 border-t border-card-border/30 text-[9px] text-sharon-muted font-bold tracking-wide uppercase">
                      <span>Focus: {rev.focus || 'Unspecified'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sharon-card p-8 text-center text-sharon-muted rounded-lg bg-sharon-muted-light/30 font-sans">
              <p className="text-xs italic">No {activeTab} review logs available.</p>
              <p className="text-[10px] mt-1">Reflect on the current period to populate logs.</p>
            </div>
          )}
        </div>

        {/* Right: Review Editor */}
        <div className="lg:col-span-7">
          {showAddReview ? (
            <form onSubmit={handleSaveReview} className="sharon-card p-6 space-y-6 text-left font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border pb-4">
                <div>
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {activeReview?.id ? `Edit ${activeTab.toUpperCase()} Review` : `Draft New ${activeTab.toUpperCase()} Review`}
                  </h3>
                  <p className="text-[10px] text-sharon-muted font-sans mt-0.5">
                    Align your achievements, lessons, and course corrections.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={getPeriodPlaceholder()}
                    value={periodKey}
                    onChange={(e) => setPeriodKey(e.target.value)}
                    className="bg-sharon-muted-light/40 border border-card-border rounded-lg px-2.5 py-1 text-xs outline-none text-foreground font-bold max-w-[110px]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-3.5 py-1.5 bg-sharon-primary hover:bg-sharon-primary-light text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Check size={12} />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Form Areas */}
              <div className="space-y-4">
                {/* Win */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">{getPromptLabel('win')}</label>
                  <textarea
                    rows={2}
                    value={win}
                    onChange={(e) => setWin(e.target.value)}
                    placeholder="What did you achieve? Where was momentum captured?"
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                    required
                  />
                </div>

                {/* Lesson */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">{getPromptLabel('lesson')}</label>
                  <textarea
                    rows={2}
                    value={lesson}
                    onChange={(e) => setLesson(e.target.value)}
                    placeholder="What takeaways or principles did these occurrences reveal?"
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Mistake */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">{getPromptLabel('mistake')}</label>
                  <textarea
                    rows={2}
                    value={mistake}
                    onChange={(e) => setMistake(e.target.value)}
                    placeholder="Where did you fall short? What boundaries were crossed? What errors occurred?"
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Avoided */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">{getPromptLabel('avoided')}</label>
                  <textarea
                    rows={2}
                    value={avoided}
                    onChange={(e) => setAvoided(e.target.value)}
                    placeholder="What tasks, distractions, negative environments, or traps did you actively bypass?"
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Improved */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">{getPromptLabel('improved')}</label>
                  <textarea
                    rows={2}
                    value={improved}
                    onChange={(e) => setImproved(e.target.value)}
                    placeholder="What systems did you improve? How were workflows optimized?"
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>

                {/* Focus */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-sharon-muted">{getPromptLabel('focus')}</label>
                  <textarea
                    rows={2}
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="Define priorities and metrics for the upcoming period..."
                    className="w-full bg-sharon-muted-light/30 border border-card-border rounded-lg py-2 px-3 text-xs focus:border-sharon-primary outline-none text-foreground resize-none"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="sharon-card p-16 text-center text-sharon-muted flex flex-col items-center justify-center space-y-4 font-sans">
              <div className="w-12 h-12 rounded-full bg-sharon-muted-light flex items-center justify-center text-sharon-primary">
                <ClipboardList size={22} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-foreground">Consolidated Review Board</h3>
                <p className="text-xs mt-1 font-sans">
                  Select a past review from the history log to read/edit, or click below to reflect now.
                </p>
              </div>
              <button
                onClick={handleNew}
                className="px-4 py-2 rounded-lg bg-sharon-primary hover:bg-sharon-primary-light text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Reflect Now</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title={`Delete this ${activeTab} review?`}
        message="This action can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
