'use client';

import React, { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/use-reviews';
import { Review } from '@/types';
import { Plus, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import ConfirmationModal from '@/components/feedback/ConfirmationModal';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

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
      toast(activeReview?.id ? 'Reflection updated.' : 'Reflection saved.', 'success');
      setShowAddReview(false);
      setActiveReview(null);
    }
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
      toast(`Error deleting reflection: ${error}`, 'error');
    } else {
      toast('Reflection deleted.', 'success');
    }
  };

  const tabs: { type: PeriodType; label: string }[] = [
    { type: 'weekly', label: 'Weekly' },
    { type: 'monthly', label: 'Monthly' },
    { type: 'quarterly', label: 'Quarterly' },
    { type: 'annual', label: 'Annual' }
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/60 pb-6 text-left font-sans">
        <div>
          <Link
            href="/growth"
            className="text-[10px] font-bold text-sharon-primary hover:text-sharon-primary-light uppercase tracking-wider flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} />
            <span>Growth Hub</span>
          </Link>
          <h1 className="text-4xl font-serif font-light tracking-wide text-foreground">
            Periodic Reviews
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            A quiet space to examine past milestones, consolidate learnings, and refocus intent.
          </p>
        </div>
        {!showAddReview && (
          <button
            onClick={() => setShowAddReview(true)}
            className="px-3.5 py-1.5 rounded-lg border border-sharon-primary hover:bg-sharon-muted-light/60 text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Start Review</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-card-border/10 pb-1.5 font-sans select-none text-left">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`text-[10px] font-bold tracking-wider uppercase pb-1.5 cursor-pointer transition-all border-b-2 ${
              activeTab === tab.type
                ? 'border-sharon-primary text-sharon-primary'
                : 'border-transparent text-sharon-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showAddReview ? (
        /* Form View (Borderless paper layout) */
        <form onSubmit={handleSaveReview} className="space-y-6 text-left font-sans py-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-light text-foreground capitalize">
              {activeTab} Reflection: {periodKey}
            </h3>
            <button
              type="button"
              onClick={() => { setShowAddReview(false); setActiveReview(null); }}
              className="text-xs font-semibold text-sharon-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Biggest Win / Progress</span>
              <input
                type="text"
                placeholder="What went well in this period?"
                value={win}
                onChange={(e) => setWin(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
                required
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Key Lesson Learned</span>
              <textarea
                rows={3}
                placeholder="Insights curation..."
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Core Mistake / Hurdle</span>
              <textarea
                rows={3}
                placeholder="What went wrong?"
                value={mistake}
                onChange={(e) => setMistake(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">What to Avoid</span>
              <textarea
                rows={3}
                placeholder="Avoid patterns..."
                value={avoided}
                onChange={(e) => setAvoided(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">How to Improve</span>
              <textarea
                rows={3}
                placeholder="Core changes next period..."
                value={improved}
                onChange={(e) => setImproved(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground resize-none leading-relaxed placeholder:text-sharon-muted/30"
              />
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <span className="text-[10px] font-bold text-sharon-muted uppercase tracking-widest block">Next Period Focus Intention</span>
              <input
                type="text"
                placeholder="One core focus target..."
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-card-border/60 rounded-none py-1.5 px-0 text-xs outline-none focus:border-sharon-primary text-foreground font-semibold placeholder:text-sharon-muted/30"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sharon-primary hover:bg-sharon-primary-light text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors"
            >
              Save Reflection
            </button>
          </div>
        </form>
      ) : (
        /* History List View */
        <div className="space-y-6 text-left font-sans">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4 max-w-2xl">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  onClick={() => setActiveReview(review)}
                  className="p-3 border-b border-card-border/20 hover:bg-sharon-muted-light/20 rounded-lg cursor-pointer flex justify-between items-center select-none"
                >
                  <div className="space-y-1 truncate">
                    <span className="text-xs font-bold text-foreground">
                      {review.period_key} Retrospective
                    </span>
                    <p className="text-xs text-sharon-muted italic truncate font-serif">
                      Win: {review.win}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrigger(review.id);
                    }}
                    className="text-sharon-muted hover:text-danger p-1 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-sharon-muted italic py-6">
              No periodic reviews logged. Click "Start Review" above to write your first reflection chapter.
            </p>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete this reflection?"
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
