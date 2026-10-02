import { supabase } from '@/lib/supabase';
import { Season } from '@/types';
import { getLocalDateStr } from '@/lib/date-utils';

export const seasonsService = {
  async getSeasons(userId: string) {
    return await supabase
      .from('seasons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async getActiveSeason(userId: string): Promise<{ data: Season | null; error: any }> {
    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    return { data, error };
  },

  async getActiveSeasonContext(userId: string, seasonId: string) {
    // 1. Fetch goals belonging to this active season
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title, progress, status')
      .eq('user_id', userId)
      .eq('season_id', seasonId);

    const activeGoals = (goals || []).filter((g: any) => g.status !== 'archived');
    const goalIds = activeGoals.map((g: any) => g.id);

    // 2. Fetch milestones due this week for these seasonal goals
    let milestonesDueThisWeekCount = 0;
    if (goalIds.length > 0) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const todayStr = getLocalDateStr(today);
      const nextWeekStr = getLocalDateStr(nextWeek);

      const { data: milestones } = await supabase
        .from('goal_milestones')
        .select('id, target_date, completed')
        .in('goal_id', goalIds)
        .eq('completed', false)
        .gte('target_date', todayStr)
        .lte('target_date', nextWeekStr);

      milestonesDueThisWeekCount = milestones?.length || 0;
    }

    return {
      activeSeasonalGoalsCount: activeGoals.length,
      milestonesDueThisWeekCount,
      goals: activeGoals
    };
  },

  async saveSeason(userId: string, season: Partial<Season>) {
    // Transactional single active season enforcement:
    // If setting status to 'active' (or creating a new active season), archive existing active season first.
    const isTargetActive = (season.status ?? 'active') === 'active';

    if (isTargetActive) {
      const archiveQuery = supabase
        .from('seasons')
        .update({ status: 'archived' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (season.id) {
        archiveQuery.neq('id', season.id);
      }

      await archiveQuery;
    }

    if (season.id) {
      return await supabase
        .from('seasons')
        .update(season)
        .eq('id', season.id)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      return await supabase
        .from('seasons')
        .insert({ ...season, user_id: userId, status: season.status || 'active' })
        .select()
        .single();
    }
  },

  async archiveSeason(seasonId: string, reviewText: string) {
    const todayStr = getLocalDateStr();
    return await supabase
      .from('seasons')
      .update({
        status: 'archived',
        review: reviewText,
        end_date: todayStr
      })
      .eq('id', seasonId)
      .select()
      .single();
  }
};
