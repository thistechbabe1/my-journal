import { supabase } from '@/lib/supabase';
import { Person, RelationshipInteraction } from '@/types';

// ─── Date Helpers ─────────────────────────────────────────────────────────────

export const getLocalDateStr = (d = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const diffDays = (dateStr: string): number => {
  const today = getLocalDateStr();
  if (dateStr === today) return 0;
  const d1 = new Date(today + 'T00:00:00');
  const d2 = new Date(dateStr + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
};

export type FollowUpUrgency = 'overdue' | 'today' | 'upcoming' | 'none';

export const getFollowUpUrgency = (person: Person): FollowUpUrgency => {
  if (!person.next_follow_up_date || person.status === 'archived') return 'none';
  const diff = diffDays(person.next_follow_up_date);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'upcoming';
};

const ALLOWED_LEGACY_TYPES = ['mentor', 'mentee', 'friend', 'family', 'professional', 'yps', 'other'];

export const getCompatibleType = (input?: string | null): string => {
  if (!input || !input.trim()) return 'other';
  const lower = input.toLowerCase().trim();
  if (ALLOWED_LEGACY_TYPES.includes(lower)) {
    return lower;
  }
  return 'other';
};

// ─── People & Interaction Service ────────────────────────────────────────────

export const peopleService = {
  /**
   * Fetch all people/contacts for a user
   */
  async getPeople(userId: string): Promise<{ data: Person[] | null; error: any }> {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data as Person[] | null, error };
  },

  /**
   * Fetch single person by ID
   */
  async getPersonById(id: string): Promise<{ data: Person | null; error: any }> {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data as Person | null, error };
  },

  /**
   * Create a new person
   */
  async createPerson(
    userId: string,
    person: Omit<Partial<Person>, 'id' | 'user_id' | 'created_at'>
  ): Promise<{ data: Person | null; error: any }> {
    const safeType = getCompatibleType(person.type);

    const fullPayload: any = {
      user_id: userId,
      name: person.name,
      type: safeType,
    };

    if (person.notes) fullPayload.notes = person.notes;
    if (person.life_area_id) fullPayload.life_area_id = person.life_area_id;
    if (person.context) fullPayload.context = person.context;
    if (person.next_action) fullPayload.next_action = person.next_action;
    if (person.waiting_on) fullPayload.waiting_on = person.waiting_on;
    if (person.reminders_frequency_days) fullPayload.reminders_frequency_days = person.reminders_frequency_days;
    if (person.last_contacted_date) fullPayload.last_contacted_date = person.last_contacted_date;
    if (person.next_follow_up_date) fullPayload.next_follow_up_date = person.next_follow_up_date;
    if (person.status) fullPayload.status = person.status;

    let { data, error } = await supabase
      .from('relationships')
      .insert(fullPayload)
      .select('*')
      .maybeSingle();

    // Fallback Tier 1: omit optional secretary columns
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column'))) {
      const tier1Payload: any = {
        user_id: userId,
        name: person.name,
        type: safeType,
      };
      if (person.notes) tier1Payload.notes = person.notes;
      if (person.life_area_id) tier1Payload.life_area_id = person.life_area_id;

      const fallback1 = await supabase
        .from('relationships')
        .insert(tier1Payload)
        .select('*')
        .maybeSingle();

      if (!fallback1.error) {
        return { data: fallback1.data as Person | null, error: null };
      }

      // Fallback Tier 2: absolute minimum columns (omit life_area_id)
      const tier2Payload: any = {
        user_id: userId,
        name: person.name,
        type: safeType,
      };
      if (person.notes) tier2Payload.notes = person.notes;

      const fallback2 = await supabase
        .from('relationships')
        .insert(tier2Payload)
        .select('*')
        .maybeSingle();

      data = fallback2.data as any;
      error = fallback2.error;
    }

    // Fallback if check constraint 23514 is violated on type
    if (error && (error.code === '23514' || error.message?.includes('relationships_type_check'))) {
      const constraintPayload: any = {
        user_id: userId,
        name: person.name,
        type: 'other',
      };
      if (person.notes) constraintPayload.notes = person.notes;

      const fallback3 = await supabase
        .from('relationships')
        .insert(constraintPayload)
        .select('*')
        .maybeSingle();

      data = fallback3.data as any;
      error = fallback3.error;
    }

    return { data: data as Person | null, error };
  },

  /**
   * Update person
   */
  async updatePerson(
    id: string,
    updates: Partial<Person>
  ): Promise<{ data: Person | null; error: any }> {
    const formattedUpdates: any = { ...updates };
    if (updates.type !== undefined) {
      formattedUpdates.type = getCompatibleType(updates.type);
    }

    let { data, error } = await supabase
      .from('relationships')
      .update(formattedUpdates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column'))) {
      const safeUpdates: any = {};
      if (updates.name !== undefined) safeUpdates.name = updates.name;
      if (updates.type !== undefined) safeUpdates.type = getCompatibleType(updates.type);
      if (updates.notes !== undefined) safeUpdates.notes = updates.notes;

      const fallback = await supabase
        .from('relationships')
        .update(safeUpdates)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      data = fallback.data as any;
      error = fallback.error;
    }

    if (error && (error.code === '23514' || error.message?.includes('relationships_type_check'))) {
      const constraintUpdates: any = { ...formattedUpdates, type: 'other' };
      const fallbackConstraint = await supabase
        .from('relationships')
        .update(constraintUpdates)
        .eq('id', id)
        .select('*')
        .maybeSingle();

      data = fallbackConstraint.data as any;
      error = fallbackConstraint.error;
    }

    return { data: data as Person | null, error };
  },

  /**
   * Delete person
   */
  async deletePerson(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('relationships')
      .delete()
      .eq('id', id);

    return { error };
  },

  /**
   * Mark Contacted Today with optional explicit next follow-up and optional interaction note
   */
  async markContacted(
    id: string,
    userId: string,
    options: {
      nextFollowUpDate?: string | null;
      keepExistingFollowUp?: boolean;
      interaction?: {
        type: string;
        notes: string;
      } | null;
    }
  ): Promise<{ data: Person | null; error: any }> {
    const today = getLocalDateStr();
    
    // 1. Fetch existing person to check current follow-up if keepExisting
    let next_follow_up_date = options.nextFollowUpDate ?? null;
    if (options.keepExistingFollowUp) {
      const { data: existing } = await this.getPersonById(id);
      if (existing) {
        next_follow_up_date = existing.next_follow_up_date;
      }
    }

    // 2. Update relationship last_contacted_date & next_follow_up_date
    const updates: Partial<Person> = {
      last_contacted_date: today,
    };
    
    if (!options.keepExistingFollowUp) {
      updates.next_follow_up_date = next_follow_up_date;
    }

    const { data: updatedPerson, error } = await this.updatePerson(id, updates);

    if (error) return { data: null, error };

    // 3. Log interaction if provided
    if (options.interaction && options.interaction.notes.trim()) {
      await this.addInteraction(userId, id, {
        interaction_date: today,
        type: options.interaction.type || 'Note',
        notes: options.interaction.notes.trim()
      });
    }

    return { data: updatedPerson, error: null };
  },

  // ─── Interaction History Methods ─────────────────────────────────────────────

  /**
   * Fetch interactions for a specific relationship
   */
  async getInteractions(relationshipId: string): Promise<{ data: RelationshipInteraction[] | null; error: any }> {
    const { data, error } = await supabase
      .from('relationship_interactions')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('interaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    return { data: data as RelationshipInteraction[] | null, error };
  },

  /**
   * Add a new interaction note
   */
  async addInteraction(
    userId: string,
    relationshipId: string,
    interaction: {
      interaction_date?: string;
      type: string;
      notes: string;
    }
  ): Promise<{ data: RelationshipInteraction | null; error: any }> {
    const payload = {
      user_id: userId,
      relationship_id: relationshipId,
      interaction_date: interaction.interaction_date || getLocalDateStr(),
      type: interaction.type || 'Note',
      notes: interaction.notes
    };

    const { data, error } = await supabase
      .from('relationship_interactions')
      .insert(payload)
      .single();

    return { data: data as RelationshipInteraction | null, error };
  },

  /**
   * Delete an interaction
   */
  async deleteInteraction(id: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('relationship_interactions')
      .delete()
      .eq('id', id);

    return { error };
  }
};
