import { supabase } from '@/lib/supabase';
import { Review } from '@/types';

export const reviewsService = {
  async getReviews(userId: string, periodType?: 'weekly' | 'monthly' | 'quarterly' | 'annual'): Promise<{ data: Review[] | null; error: any }> {
    let query = supabase.from('reviews').select('*').eq('user_id', userId);

    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    const { data, error } = await query.order('period_key', { ascending: false });
    return { data, error };
  },

  async saveReview(userId: string, review: Partial<Review>): Promise<{ data: Review | null; error: any }> {
    if (!review.period_type || !review.period_key) {
      return { data: null, error: 'period_type and period_key are required' };
    }

    // Check if review already exists for user, period_type and period_key
    const { data: existing } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', review.period_type)
      .eq('period_key', review.period_key)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('reviews')
        .update(review)
        .eq('id', existing.id)
        .single();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('reviews')
        .insert({ user_id: userId, ...review })
        .single();
      return { data, error };
    }
  },

  async deleteReview(userId: string, id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    return { error };
  }
};
