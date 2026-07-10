import { supabase } from '@/lib/supabase';
import { FutureLetter } from '@/types';

export const lettersService = {
  async getLetters(userId: string) {
    return await supabase
      .from('future_letters')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });
  },

  async saveLetter(userId: string, letter: Partial<FutureLetter>) {
    // Check if letter for this month already exists
    const { data: existing } = await supabase
      .from('future_letters')
      .select('id')
      .eq('user_id', userId)
      .eq('month', letter.month)
      .maybeSingle();

    if (existing) {
      return await supabase
        .from('future_letters')
        .update(letter)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('future_letters')
        .insert({ ...letter, user_id: userId })
        .select()
        .single();
    }
  }
};
