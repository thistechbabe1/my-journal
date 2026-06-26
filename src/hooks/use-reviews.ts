'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { reviewsService } from '@/services/reviews-service';
import { profileService } from '@/services/profile-service';
import { Review } from '@/types';

export function useReviews(periodType?: 'weekly' | 'monthly' | 'quarterly' | 'annual') {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewsData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await reviewsService.getReviews(user.id, periodType);
      if (error) throw error;
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message || 'Error loading reviews');
    } finally {
      setLoading(false);
    }
  }, [user, periodType]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  const saveReview = async (review: Partial<Review>) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { data, error } = await reviewsService.saveReview(user.id, {
        ...review,
        period_type: review.period_type || periodType
      });
      if (error) throw error;

      // Refresh list
      const refreshed = await reviewsService.getReviews(user.id, periodType);
      if (refreshed.data) setReviews(refreshed.data);

      // Award growth score points depending on review granularity
      let points = 8; // Weekly review
      if (review.period_type === 'monthly') points = 15;
      else if (review.period_type === 'quarterly') points = 25;
      else if (review.period_type === 'annual') points = 50;

      await profileService.incrementGrowthScore(user.id, points);

      return { data, error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  const deleteReview = async (id: string) => {
    if (!user) return { error: 'No authenticated user' };
    try {
      const { error } = await reviewsService.deleteReview(user.id, id);
      if (error) throw error;

      setReviews((prev) => prev.filter((r) => r.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message || err };
    }
  };

  return {
    reviews,
    loading,
    error,
    refresh: fetchReviewsData,
    saveReview,
    deleteReview
  };
}
