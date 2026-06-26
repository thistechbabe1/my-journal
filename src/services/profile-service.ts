import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export const profileService = {
  async getProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async incrementGrowthScore(userId: string, points: number): Promise<{ error: any }> {
    const { data: profile } = await this.getProfile(userId);
    if (!profile) return { error: 'Profile not found' };

    const newScore = Math.min(100, Math.max(0, (profile.growth_score || 0) + points));
    const { error } = await this.updateProfile(userId, { growth_score: newScore });
    return { error };
  }
};
