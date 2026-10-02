'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { ArrowLeft, Calendar, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/feedback/ToastProvider';
import Link from 'next/link';
import { Divider } from '@/components/editorial';

interface ArchivedReview {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period_key: string;
  win: string;
  lesson: string | null;
  mistake: string | null;
  avoided: string | null;
  improved: string | null;
  focus: string | null;
  created_at: string;
}

export default function ReviewsArchivePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<ArchivedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('periodic_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      toast(`Error fetching reviews: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto py-2">
      
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
            Reviews Archive
          </h1>
          <p className="text-xs text-sharon-muted mt-1.5">
            Archived logs of your weekly, monthly, and yearly retrospective assessments.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-5 h-5 border border-sharon-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4 text-left font-sans max-w-xl">
          {reviews.map((review) => {
            const isExpanded = expandedId === review.id;
            return (
              <div key={review.id} className="border-b border-card-border/15 pb-4">
                <div
                  onClick={() => toggleExpand(review.id)}
                  className="flex items-center justify-between py-2 cursor-pointer hover:bg-sharon-muted-light/10 px-1 rounded transition-colors select-none"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-foreground">
                      {review.period_key} Retrospective ({review.period_type})
                    </span>
                    <p className="text-[10px] text-sharon-muted">
                      Created on {new Date(review.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-sharon-muted" /> : <ChevronDown size={14} className="text-sharon-muted" />}
                </div>

                {isExpanded && (
                  <div className="mt-4 pl-4 border-l-2 border-sharon-primary/30 space-y-4 animate-fade-in font-serif italic text-sm text-foreground/90 leading-relaxed">
                    <div>
                      <span className="text-[9px] font-bold font-sans text-sharon-muted block mb-0.5">Biggest win</span>
                      <p>{review.win}</p>
                    </div>

                    {review.lesson && (
                      <div>
                        <span className="text-[9px] font-bold font-sans text-sharon-muted block mb-0.5">Core lessons</span>
                        <p>{review.lesson}</p>
                      </div>
                    )}

                    {review.mistake && (
                      <div>
                        <span className="text-[9px] font-bold font-sans text-sharon-muted block mb-0.5">Hurdles & mistakes</span>
                        <p>{review.mistake}</p>
                      </div>
                    )}

                    {review.avoided && (
                      <div>
                        <span className="text-[9px] font-bold font-sans text-sharon-muted block mb-0.5">Avoid list</span>
                        <p>{review.avoided}</p>
                      </div>
                    )}

                    {review.improved && (
                      <div>
                        <span className="text-[9px] font-bold font-sans text-sharon-muted block mb-0.5">Improvements planned</span>
                        <p>{review.improved}</p>
                      </div>
                    )}

                    {review.focus && (
                      <div>
                        <span className="text-[9px] font-bold font-sans text-sharon-accent block mb-0.5">Next period intention</span>
                        <p className="text-foreground font-semibold">{review.focus}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-sharon-muted italic py-12 text-center font-sans">No completed reviews archived. Archive a review from the Growth workspace to see it listed here.</p>
      )}

    </div>
  );
}
