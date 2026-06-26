import { supabase } from '@/lib/supabase';
import { Habit, HabitLog } from '@/types';

export const habitsService = {
  async getHabits(userId: string, date: string): Promise<{ data: Habit[] | null; error: any }> {
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError || !habits) return { data: null, error: habitsError };
    if (habits.length === 0) return { data: [], error: null };

    // Fetch logs for this date
    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('date', date);

    // Fetch all logs to compute streaks and completion rates
    const { data: allLogs } = await supabase
      .from('habit_logs')
      .select('*');

    const habitsWithLogs = habits.map((habit: any) => {
      const dayLog = (logs || []).find((l: any) => l.habit_id === habit.id);
      const habitLogs = (allLogs || []).filter((l: any) => l.habit_id === habit.id && l.completed);
      
      // Calculate streak
      const streak = this.calculateStreak(habitLogs);
      // Calculate completion rate (last 30 days)
      const completionRate = this.calculateCompletionRate(habitLogs);

      return {
        ...habit,
        logs: dayLog ? [dayLog] : [],
        streak,
        completionRate
      };
    });

    return { data: habitsWithLogs, error: null };
  },

  async saveHabit(userId: string, name: string): Promise<{ data: Habit | null; error: any }> {
    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: userId, name })
      .single();
    return { data, error };
  },

  async deleteHabit(userId: string, id: string): Promise<{ error: any }> {
    // Delete logs first for mock client cascade
    await supabase.from('habit_logs').delete().eq('habit_id', id);
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    return { error };
  },

  async toggleHabitLog(habitId: string, date: string, completed: boolean): Promise<{ data: HabitLog | null; error: any }> {
    // Check if log already exists
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('date', date)
      .single();

    if (existing) {
      if (!completed) {
        // If unchecking, delete the log
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existing.id);
        return { data: null, error };
      } else {
        const { data, error } = await supabase
          .from('habit_logs')
          .update({ completed: true })
          .eq('id', existing.id)
          .single();
        return { data, error };
      }
    } else {
      if (completed) {
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({ habit_id: habitId, date, completed: true })
          .single();
        return { data, error };
      }
      return { data: null, error: null };
    }
  },

  // Helper: Calculate current consecutive day streak
  calculateStreak(logs: HabitLog[]): number {
    if (!logs || logs.length === 0) return 0;
    
    // Sort logs by date descending
    const sortedDates = logs
      .map((l) => l.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Deduplicate dates
    const uniqueDates = Array.from(new Set(sortedDates));

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If latest log is neither today nor yesterday, streak is broken (0)
    const latestDate = uniqueDates[0];
    if (latestDate !== todayStr && latestDate !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date(latestDate);

    for (let i = 0; i < uniqueDates.length; i++) {
      const logDateStr = uniqueDates[i];
      const logDate = new Date(logDateStr);

      // Check if this date is what we expect (consecutive)
      const diffTime = Math.abs(expectedDate.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        // Set expected date to the day before logDate
        expectedDate = new Date(logDate.getTime() - 86400000);
      } else {
        break; // Streak broken
      }
    }

    return streak;
  },

  // Helper: Calculate completion rate over the last 30 days
  calculateCompletionRate(logs: HabitLog[]): number {
    if (!logs || logs.length === 0) return 0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const recentLogs = logs.filter((l) => new Date(l.date) >= thirtyDaysAgo);
    
    // Total unique days logged completed in the last 30 days
    const uniqueDays = new Set(recentLogs.map((l) => l.date)).size;
    return Math.round((uniqueDays / 30) * 100);
  }
};
