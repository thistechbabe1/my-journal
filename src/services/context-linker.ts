import { supabase } from '@/lib/supabase';
import { Person, Task, CalendarEvent, RelationshipInteraction, Goal } from '@/types';
import { peopleService } from '@/services/people-service';

export interface Person360Context {
  person: Person;
  relatedTasks: Task[];
  relatedEvents: CalendarEvent[];
  relatedGoals: Goal[];
  interactions: RelationshipInteraction[];
}

export const contextLinker = {
  /**
   * Fetch 360-degree cross-system context for a Person.
   * Pulls related Tasks, Events, Goals, and Interaction History.
   */
  async getPerson360Context(
    userId: string,
    personId: string
  ): Promise<{ data: Person360Context | null; error: any }> {
    try {
      // 1. Fetch Person
      const { data: person, error: personError } = await peopleService.getPersonById(personId);
      if (personError || !person) {
        return { data: null, error: personError || 'Person not found' };
      }

      const firstName = person.name.split(' ')[0].toLowerCase();
      const fullName = person.name.toLowerCase();

      // 2. Fetch Tasks linked by person_id OR title/notes matching person's name
      let { data: rawTasks } = await supabase
        .from('tasks')
        .select(`
          *,
          life_area:life_areas(id, name),
          goal:goals(id, title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const relatedTasks: Task[] = (rawTasks || []).filter((t: any) => {
        if (t.person_id === personId) return true;
        const titleLower = (t.title || '').toLowerCase();
        const notesLower = (t.notes || '').toLowerCase();
        return titleLower.includes(fullName) || titleLower.includes(firstName) ||
               notesLower.includes(fullName) || notesLower.includes(firstName);
      });

      // 3. Fetch Events linked by person_id OR title/description matching person's name
      let { data: rawEvents } = await supabase
        .from('events')
        .select(`
          *,
          life_area:life_areas(id, name),
          goal:goals(id, title)
        `)
        .eq('user_id', userId)
        .order('event_date', { ascending: true });

      const relatedEvents: CalendarEvent[] = (rawEvents || []).filter((e: any) => {
        if (e.person_id === personId) return true;
        const titleLower = (e.title || '').toLowerCase();
        const descLower = (e.description || '').toLowerCase();
        return titleLower.includes(fullName) || titleLower.includes(firstName) ||
               descLower.includes(fullName) || descLower.includes(firstName);
      });

      // 4. Fetch Goals (from related tasks/events or matching category/life area)
      const linkedGoalIds = new Set<string>();
      relatedTasks.forEach((t) => { if (t.goal_id) linkedGoalIds.add(t.goal_id); });
      relatedEvents.forEach((e) => { if (e.goal_id) linkedGoalIds.add(e.goal_id); });

      let relatedGoals: Goal[] = [];
      if (linkedGoalIds.size > 0) {
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .in('id', Array.from(linkedGoalIds));
        relatedGoals = goalsData || [];
      }

      // 5. Fetch Interactions History
      const { data: interactions } = await peopleService.getInteractions(personId);

      return {
        data: {
          person,
          relatedTasks,
          relatedEvents,
          relatedGoals,
          interactions: interactions || []
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || err };
    }
  }
};
