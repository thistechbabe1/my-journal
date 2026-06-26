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

    // Fetch milestones for all these goals
    const goalIds = goals.map((g: any) => g.id);
    if (goalIds.length === 0) return { data: [], error: null };

    // Get milestones
    const { data: milestones, error: msError } = await supabase
      .from('goal_milestones')
      .select('*');

    if (msError) return { data: goals, error: null }; // return goals without milestones if error

    // Map milestones to goals
    const goalsWithMilestones = goals.map((goal: any) => {
      const goalMs = (milestones || []).filter((m: any) => m.goal_id === goal.id);
      return {
        ...goal,
        milestones: goalMs
      };
    });

    return { data: goalsWithMilestones, error: null };
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
        .single();
      savedGoal = data;
      error = uErr;
    } else {
      const { data, error: iErr } = await supabase
        .from('goals')
        .insert({ user_id: userId, ...goal })
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
    const { error } = await supabase
      .from('goal_milestones')
      .update({ completed })
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

  async addMilestone(goalId: string, text: string): Promise<{ data: GoalMilestone | null; error: any }> {
    const { data, error } = await supabase
      .from('goal_milestones')
      .insert({ goal_id: goalId, text, completed: false })
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
