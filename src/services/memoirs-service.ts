import { supabase } from '@/lib/supabase';
import { MemoirEntry, MemoirFilter, SeasonalDossier, Goal, Season } from '@/types';
import { getLocalDateStr } from '@/lib/date-utils';

export const memoirsService = {
  /**
   * Aggregates source records into a pure read-model MemoirEntry array.
   */
  async getMemoirs(
    userId: string,
    filter: MemoirFilter = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: MemoirEntry[]; totalCount: number; error: any }> {
    try {
      const items: MemoirEntry[] = [];

      // 1. Fetch Journal Entries
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (journals) {
        journals.forEach((j: any) => {
          const entryDate = j.date || getLocalDateStr();
          const entryYear = new Date(entryDate + 'T00:00:00').getFullYear();
          items.push({
            id: `memoir-journal-${j.id}`,
            sourceId: j.id,
            sourceType: 'journal',
            date: entryDate,
            year: entryYear,
            title: `Journal Memoir`,
            excerpt: j.content ? (j.content.length > 140 ? j.content.substring(0, 140) + '...' : j.content) : '',
            fullContent: j.content || '',
            tags: j.tags || [],
            ratingOrMood: j.mood || null,
            linkedEntityUrl: `/journal?date=${entryDate}`
          });
        });
      }

      // 2. Fetch Completed/Archived Goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (goals) {
        goals.forEach((g: any) => {
          // Authoritative completion signal: status === 'completed' or progress === 100
          const isCompleted = g.status === 'completed' || g.progress === 100;
          if (isCompleted) {
            const entryDate = (g.deadline || g.created_at || getLocalDateStr()).substring(0, 10);
            const entryYear = new Date(entryDate + 'T00:00:00').getFullYear();
            items.push({
              id: `memoir-goal-${g.id}`,
              sourceId: g.id,
              sourceType: 'goal_achieved',
              date: entryDate,
              year: entryYear,
              title: `Goal Achieved: ${g.title}`,
              excerpt: g.description || 'Target strategic outcome completed.',
              fullContent: g.notes || g.description || '',
              tags: [g.category, 'Goal Achieved'],
              category: g.category,
              linkedEntityUrl: `/growth/goals`
            });
          }
        });
      }

      // 3. Fetch Concluded Seasons
      const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'archived');

      if (seasons) {
        seasons.forEach((s: any) => {
          const entryDate = (s.end_date || s.start_date || getLocalDateStr()).substring(0, 10);
          const entryYear = new Date(entryDate + 'T00:00:00').getFullYear();
          items.push({
            id: `memoir-season-${s.id}`,
            sourceId: s.id,
            sourceType: 'season_review',
            date: entryDate,
            year: entryYear,
            title: `Chapter Concluded: ${s.name}`,
            excerpt: s.review || `Concluded season focusing on ${s.primary_focus}.`,
            fullContent: s.review || s.intentions || '',
            tags: [s.primary_focus, 'Season Concluded'],
            seasonName: s.name,
            linkedEntityUrl: `/identity/seasons`
          });
        });
      }

      // 4. Fetch Period Reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', userId);

      if (reviews) {
        reviews.forEach((r: any) => {
          const entryDate = (r.created_at || getLocalDateStr()).substring(0, 10);
          const entryYear = new Date(entryDate + 'T00:00:00').getFullYear();
          const titleLabel = `${r.period_type ? r.period_type.toUpperCase() : 'PERIOD'} REVIEW (${r.period_key})`;
          items.push({
            id: `memoir-review-${r.id}`,
            sourceId: r.id,
            sourceType: 'period_review',
            date: entryDate,
            year: entryYear,
            title: titleLabel,
            excerpt: r.win ? `Win: ${r.win}` : r.lesson ? `Lesson: ${r.lesson}` : 'Recorded periodic reflection.',
            fullContent: [r.win, r.lesson, r.mistake, r.focus].filter(Boolean).join('\n\n'),
            tags: ['Review', r.period_type],
            linkedEntityUrl: `/growth/reviews`
          });
        });
      }

      // 5. Fetch Timeline Events
      const { data: timelineEvents } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', userId);

      if (timelineEvents) {
        timelineEvents.forEach((t: any) => {
          const entryDate = (t.date || getLocalDateStr()).substring(0, 10);
          const entryYear = new Date(entryDate + 'T00:00:00').getFullYear();
          items.push({
            id: `memoir-timeline-${t.id}`,
            sourceId: t.id,
            sourceType: 'timeline_event',
            date: entryDate,
            year: entryYear,
            title: t.title,
            excerpt: t.description || '',
            fullContent: t.description || '',
            tags: [t.type || 'Milestone', t.category || 'Life'],
            linkedEntityUrl: `/library/timeline`
          });
        });
      }

      // ─── Filter Processing ───────────────────────────────────────────────
      let filtered = items;

      if (filter.year && filter.year !== 'all') {
        filtered = filtered.filter((i) => i.year === Number(filter.year));
      }

      if (filter.type && filter.type !== 'all') {
        filtered = filtered.filter((i) => i.sourceType === filter.type);
      }

      if (filter.category && filter.category !== 'all') {
        filtered = filtered.filter((i) => i.category === filter.category || i.tags.includes(filter.category!));
      }

      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            i.excerpt.toLowerCase().includes(query) ||
            (i.fullContent && i.fullContent.toLowerCase().includes(query)) ||
            i.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      // Sort strictly descending by date
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const totalCount = filtered.length;
      const paginatedData = filtered.slice(offset, offset + limit);

      return { data: paginatedData, totalCount, error: null };
    } catch (err: any) {
      return { data: [], totalCount: 0, error: err.message || err };
    }
  },

  /**
   * On This Day: Returns memoirs matching month/day from PREVIOUS years only.
   */
  async getOnThisDay(
    userId: string,
    targetDateStr: string = getLocalDateStr()
  ): Promise<{ data: MemoirEntry[]; error: any }> {
    try {
      const monthDay = targetDateStr.substring(5); // "-MM-DD"
      const currentYear = new Date(targetDateStr + 'T00:00:00').getFullYear();

      const { data: allMemoirs } = await this.getMemoirs(userId, {}, 1000, 0);

      const onThisDayItems = allMemoirs.filter((m) => {
        return m.date.endsWith(monthDay) && m.year < currentYear;
      });

      return { data: onThisDayItems, error: null };
    } catch (err: any) {
      return { data: [], error: err.message || err };
    }
  },

  /**
   * Compiles a comprehensive Seasonal Dossier for a concluded season.
   */
  async getSeasonalDossier(
    userId: string,
    seasonId: string
  ): Promise<{ data: SeasonalDossier | null; error: any }> {
    try {
      // 1. Fetch Season record
      const { data: season } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single();

      if (!season) return { data: null, error: 'Season not found' };

      // 2. Fetch linked Goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('season_id', seasonId);

      const seasonalGoals: Goal[] = goals || [];
      const completedGoalsCount = seasonalGoals.filter(
        (g) => g.status === 'completed' || g.progress === 100
      ).length;

      // 3. Fetch linked Campaigns & Tasks stats
      const goalIds = seasonalGoals.map((g) => g.id);
      let campaignsCount = 0;
      let milestonesCount = 0;
      let completedTasksCount = 0;

      if (goalIds.length > 0) {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id')
          .in('goal_id', goalIds);

        campaignsCount = campaigns?.length || 0;

        const { data: milestones } = await supabase
          .from('goal_milestones')
          .select('id')
          .in('goal_id', goalIds);

        milestonesCount = milestones?.length || 0;

        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .in('goal_id', goalIds)
          .eq('status', 'complete');

        completedTasksCount = tasks?.length || 0;
      }

      // 4. Fetch Key Moments logged during season date range
      const { data: allMemoirs } = await this.getMemoirs(userId, {}, 500, 0);

      const start = new Date(season.start_date + 'T00:00:00').getTime();
      const end = new Date((season.end_date || season.start_date) + 'T23:59:59').getTime();

      const keyMoments = allMemoirs.filter((m) => {
        const t = new Date(m.date + 'T00:00:00').getTime();
        return t >= start && t <= end;
      });

      return {
        data: {
          season,
          goalsCount: seasonalGoals.length,
          completedGoalsCount,
          campaignsCount,
          milestonesCount,
          completedTasksCount,
          goals: seasonalGoals,
          keyMoments
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err.message || err };
    }
  }
};
