import { supabase } from '@/lib/supabase';
import { JournalEntry, DailyFocus } from '@/types';

export const journalService = {
  // Journal entries
  async getEntries(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      mood?: number;
      tag?: string;
      search?: string;
    }
  ): Promise<{ data: JournalEntry[] | null; error: any }> {
    let query = supabase.from('journal_entries').select('*').eq('user_id', userId);

    // Apply ordering by date desc by default
    query = query.order('date', { ascending: false });

    // Note: Since client-side mock filter matches Supabase query API chains,
    // we fetch and let mock client or Supabase handle filtering.
    // If it's real Supabase, we would chain filters:
    if (filters) {
      if (filters.startDate) {
        // Mock query builder eq/filter support:
        // We will do a generic post-fetch filter if needed, but since our mock query builder 
        // implements basic filters, let's keep queries simple and apply fine-grained filtering post-fetch
        // to guarantee 100% reliability in both real Supabase (which requires exact schema filters) 
        // and localstorage mock fallback modes.
      }
    }

    const { data, error } = await query;
    if (error || !data) return { data: null, error };

    // Apply filtering on client side for guaranteed uniformity between mock and real Postgres
    let filtered = [...data];
    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter((e) => e.date >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter((e) => e.date <= filters.endDate!);
      }
      if (filters.mood) {
        filtered = filtered.filter((e) => e.mood === filters.mood);
      }
      if (filters.tag) {
        filtered = filtered.filter((e) => e.tags && e.tags.includes(filters.tag!));
      }
      if (filters.search) {
        const term = filters.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.content.toLowerCase().includes(term) ||
            (e.learned && e.learned.toLowerCase().includes(term)) ||
            (e.grateful && e.grateful.toLowerCase().includes(term)) ||
            (e.excited && e.excited.toLowerCase().includes(term))
        );
      }
    }

    return { data: filtered, error: null };
  },

  async saveEntry(userId: string, entry: Partial<JournalEntry>): Promise<{ data: JournalEntry | null; error: any }> {
    if (entry.id) {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(entry)
        .eq('id', entry.id)
        .eq('user_id', userId)
        .single();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ user_id: userId, ...entry })
        .single();
      return { data, error };
    }
  },

  async deleteEntry(userId: string, id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    return { error };
  },

  // Daily Focus
  async getDailyFocus(userId: string, date: string): Promise<{ data: DailyFocus | null; error: any }> {
    const { data, error } = await supabase
      .from('daily_focus')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    return { data, error };
  },

  async saveDailyFocus(userId: string, focus: Partial<DailyFocus> & { date: string }): Promise<{ data: DailyFocus | null; error: any }> {
    const { data: existing } = await this.getDailyFocus(userId, focus.date);

    if (existing) {
      const { data, error } = await supabase
        .from('daily_focus')
        .update(focus)
        .eq('user_id', userId)
        .eq('date', focus.date)
        .single();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('daily_focus')
        .insert({ user_id: userId, ...focus })
        .single();
      return { data, error };
    }
  }
};
