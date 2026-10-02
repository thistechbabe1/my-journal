import { supabase } from '@/lib/supabase';
import { PersonalIdentity, LifeArea } from '@/types';

export const identityService = {
  // Personal Identity
  async getIdentity(userId: string): Promise<{ data: PersonalIdentity | null; error: any }> {
    const { data, error } = await supabase
      .from('personal_identity')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    return { data, error };
  },

  async saveIdentity(userId: string, identity: Partial<PersonalIdentity>): Promise<{ data: PersonalIdentity | null; error: any }> {
    const { data: existing } = await this.getIdentity(userId);

    if (existing) {
      const { data, error } = await supabase
        .from('personal_identity')
        .update(identity)
        .eq('user_id', userId)
        .select('*')
        .maybeSingle();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('personal_identity')
        .insert({ user_id: userId, ...identity })
        .select('*')
        .maybeSingle();
      return { data, error };
    }
  },

  // Life Areas
  async getLifeAreas(userId: string): Promise<{ data: LifeArea[] | null; error: any }> {
    const { data, error } = await supabase
      .from('life_areas')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });
    return { data, error };
  },

  async updateLifeArea(userId: string, name: string, score: number, notes: string | null): Promise<{ data: LifeArea | null; error: any }> {
    // Check if life area already exists for user
    const { data: existing } = await supabase
      .from('life_areas')
      .select('*')
      .eq('user_id', userId)
      .eq('name', name)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('life_areas')
        .update({ score, notes })
        .eq('user_id', userId)
        .eq('name', name)
        .select('*')
        .maybeSingle();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('life_areas')
        .insert({ user_id: userId, name, score, notes })
        .select('*')
        .maybeSingle();
      return { data, error };
    }
  }
};
