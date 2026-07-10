import { supabase } from '@/lib/supabase';
import { Season } from '@/types';

export const seasonsService = {
  async getSeasons(userId: string) {
    return await supabase
      .from('seasons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async saveSeason(userId: string, season: Partial<Season>) {
    if (season.id) {
      return await supabase
        .from('seasons')
        .update(season)
        .eq('id', season.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('seasons')
        .insert({ ...season, user_id: userId })
        .select()
        .single();
    }
  },

  async archiveSeason(seasonId: string, reviewText: string) {
    return await supabase
      .from('seasons')
      .update({
        status: 'archived',
        review: reviewText,
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', seasonId)
      .select()
      .single();
  }
};
