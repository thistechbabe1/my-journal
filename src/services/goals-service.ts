import { supabase } from '@/lib/supabase';
import { Goal, GoalMilestone } from '@/types';

export const goalsService = {
  async getGoals(userId: string): Promise<{ data: Goal[] | null; error: any }> {
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (goalsError || !goals) return { data: null, error: goalsError };

    // Fetch milestones & seasons
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*');

    const { data: seasons } = await supabase
      .from('seasons')
      .select('id, name, theme')
      .eq('user_id', userId);

    // Map milestones & season to goals
    const goalsWithRelations = goals.map((goal: any) => {
      const goalMs = (milestones || []).filter((m: any) => m.goal_id === goal.id);
      const matchedSeason = (seasons || []).find((s: any) => s.id === goal.season_id) || null;
      return {
        ...goal,
        milestones: goalMs,
        season: matchedSeason
      };
    });

    return { data: goalsWithRelations, error: null };
  },

  async saveGoal(userId: string, goal: Partial<Goal>, milestonesList?: string[]): Promise<{ data: Goal | null; error: any }> {
    let savedGoal: Goal | null = null;
    let error: any = null;

    if (goal.id) {
      const { data, error: uErr } = await supabase
        .from('goals')
        .update(goal)
        .eq('id', goal.id)
        .eq('user_id', userId)
        .select()
        .single();
      savedGoal = data;
      error = uErr;
    } else {
      const { data, error: iErr } = await supabase
        .from('goals')
        .insert({ user_id: userId, ...goal })
        .select()
        .single();
      savedGoal = data;
      error = iErr;
    }

    if (error || !savedGoal) return { data: null, error };

    // If new milestones list is passed, write them
    if (milestonesList && milestonesList.length > 0) {
      const msToInsert = milestonesList.map((text) => ({
        goal_id: savedGoal!.id,
        text,
        completed: false
      }));
      await supabase.from('goal_milestones').insert(msToInsert);
    }

    // Refresh goals with milestones
    const { data: refreshed } = await supabase
      .from('goals')
      .select('*')
      .eq('id', savedGoal.id)
      .single();

    const { data: ms } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', savedGoal.id);

    return {
      data: refreshed ? { ...refreshed, milestones: ms || [] } : null,
      error: null
    };
  },

  async deleteGoal(userId: string, id: string): Promise<{ error: any }> {
    // Milestones will cascade delete if foreign key ON DELETE CASCADE is set.
    // In localstorage mock client, we should manually clean up milestones.
    await supabase.from('goal_milestones').delete().eq('goal_id', id);
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    return { error };
  },

  async toggleMilestone(goalId: string, milestoneId: string, completed: boolean): Promise<{ error: any }> {
    const completedAt = completed ? new Date().toISOString() : null;
    const { error } = await supabase
      .from('goal_milestones')
      .update({ completed, completed_at: completedAt })
      .eq('id', milestoneId);

    if (error) return { error };

    // Recalculate progress for this goal
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId);

    if (milestones && milestones.length > 0) {
      const completedCount = milestones.filter((m: any) => m.completed).length;
      const progress = Math.round((completedCount / milestones.length) * 100);
      
      // Update goal progress
      await supabase
        .from('goals')
        .update({ progress })
        .eq('id', goalId);
    }

    return { error: null };
  },

  async addMilestone(
    goalId: string,
    payload: {
      text: string;
      target_date?: string | null;
      person_id?: string | null;
      campaign_id?: string | null;
    } | string
  ): Promise<{ data: GoalMilestone | null; error: any }> {
    const milestoneData = typeof payload === 'string'
      ? { goal_id: goalId, text: payload, completed: false }
      : {
          goal_id: goalId,
          text: payload.text,
          target_date: payload.target_date ?? null,
          person_id: payload.person_id ?? null,
          campaign_id: payload.campaign_id ?? null,
          completed: false
        };

    const { data, error } = await supabase
      .from('goal_milestones')
      .insert(milestoneData)
      .select()
      .single();

    if (error) return { data: null, error };

    // Recalculate progress
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId);

    if (milestones && milestones.length > 0) {
      const completedCount = milestones.filter((m: any) => m.completed).length;
      const progress = Math.round((completedCount / milestones.length) * 100);
      await supabase.from('goals').update({ progress }).eq('id', goalId);
    }

    return { data, error };
  },

  async updateMilestone(
    goalId: string,
    milestoneId: string,
    updates: Partial<GoalMilestone>
  ): Promise<{ data: GoalMilestone | null; error: any }> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    if (error) return { data: null, error };

    // Recalculate progress
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId);

    if (milestones && milestones.length > 0) {
      const completedCount = milestones.filter((m: any) => m.completed).length;
      const progress = Math.round((completedCount / milestones.length) * 100);
      await supabase.from('goals').update({ progress }).eq('id', goalId);
    }

    return { data, error };
  },

  async deleteMilestone(goalId: string, milestoneId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('goal_milestones')
      .delete()
      .eq('id', milestoneId);

    if (error) return { error };

    // Recalculate progress
    const { data: milestones } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId);

    const progress = milestones && milestones.length > 0
      ? Math.round((milestones.filter((m: any) => m.completed).length / milestones.length) * 100)
      : 0;

    await supabase.from('goals').update({ progress }).eq('id', goalId);
    return { error: null };
  }
};
