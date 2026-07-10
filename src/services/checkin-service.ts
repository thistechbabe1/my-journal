import { supabase } from '@/lib/supabase';
import { DailyCheckIn, IntellectualGrowthLog } from '@/types';

export const checkinService = {
  async getDailyCheckIn(userId: string, date: string) {
    return await supabase
      .from('daily_check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
  },

  async saveDailyCheckIn(userId: string, checkIn: Partial<DailyCheckIn>) {
    const { data: existing } = await supabase
      .from('daily_check_ins')
      .select('id')
      .eq('user_id', userId)
      .eq('date', checkIn.date)
      .maybeSingle();

    if (existing) {
      return await supabase
        .from('daily_check_ins')
        .update(checkIn)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('daily_check_ins')
        .insert({ ...checkIn, user_id: userId })
        .select()
        .single();
    }
  },

  async getIntellectualGrowthLog(userId: string, date: string) {
    return await supabase
      .from('intellectual_growth_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
  },

  async saveIntellectualGrowthLog(userId: string, log: Partial<IntellectualGrowthLog>) {
    const { data: existing } = await supabase
      .from('intellectual_growth_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', log.date)
      .maybeSingle();

    if (existing) {
      return await supabase
        .from('intellectual_growth_logs')
        .update(log)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('intellectual_growth_logs')
        .insert({ ...log, user_id: userId })
        .select()
        .single();
    }
  },

  async getWeeklyGrowthLogs(userId: string, startDate: string, endDate: string) {
    return await supabase
      .from('intellectual_growth_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
  }
};
