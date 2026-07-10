import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export const profileService = {
  async getProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Self-heal: Create a profile entry automatically if missing
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: 'Sharon',
            bio: 'Living intentionally, learning daily, and building things that matter. Focus: Clarity, confidence, and discipline.',
            growth_score: 10,
            gemini_api_key: null,
            voice_profile: 'Write in a natural, conversational, and direct tone.'
          })
          .select()
          .single();
        
        if (createError) throw createError;

        // Auto-seed initial datasets for the new live user
        try {
          // 1. Seed Graduation 2026 Campaign
          const { data: campaign } = await supabase
            .from('campaigns')
            .insert({
              user_id: userId,
              title: 'Graduation 2026',
              description: '14-day storytelling countdown before my software engineering graduation',
              start_date: '2026-07-12',
              end_date: '2026-07-26',
              status: 'active'
            })
            .select()
            .single();

          if (campaign) {
            const tasks = [
              { campaign_id: campaign.id, title: 'Day 14', prompt: 'Why I chose Software Engineering.', draft: 'My journey into software engineering started with curiosity...', completed: true, published: true, order_index: 14 },
              { campaign_id: campaign.id, title: 'Day 13', prompt: 'My lowest academic point and what it taught me.', draft: '', completed: false, published: false, order_index: 13 },
              { campaign_id: campaign.id, title: 'Day 12', prompt: 'Discovering tech communities (GDSC/GDG).', draft: '', completed: false, published: false, order_index: 12 },
              { campaign_id: campaign.id, title: 'Day 11', prompt: 'My first leadership role.', draft: '', completed: false, published: false, order_index: 11 },
              { campaign_id: campaign.id, title: 'Day 10', prompt: 'Lessons from internships.', draft: '', completed: false, published: false, order_index: 10 },
              { campaign_id: campaign.id, title: 'Day 9', prompt: 'Planning my first major event.', draft: '', completed: false, published: false, order_index: 9 },
              { campaign_id: campaign.id, title: 'Day 8', prompt: 'Learning to work with people.', draft: '', completed: false, published: false, order_index: 8 },
              { campaign_id: campaign.id, title: 'Day 7', prompt: 'The semester I earned a 5.0.', draft: '', completed: false, published: false, order_index: 7 },
              { campaign_id: campaign.id, title: 'Day 6', prompt: 'Final-year project lessons.', draft: '', completed: false, published: false, order_index: 6 },
              { campaign_id: campaign.id, title: 'Day 5', prompt: 'Building beyond the classroom.', draft: '', completed: false, published: false, order_index: 5 },
              { campaign_id: campaign.id, title: 'Day 4', prompt: 'The people who shaped my journey.', draft: '', completed: false, published: false, order_index: 4 },
              { campaign_id: campaign.id, title: 'Day 3', prompt: 'What graduating actually feels like.', draft: '', completed: false, published: false, order_index: 3 },
              { campaign_id: campaign.id, title: 'Day 2', prompt: 'What comes next.', draft: '', completed: false, published: false, order_index: 2 },
              { campaign_id: campaign.id, title: 'Day 1', prompt: 'Gratitude and excitement for graduation.', draft: '', completed: false, published: false, order_index: 1 }
            ];
            await supabase.from('campaign_tasks').insert(tasks);
          }

          // 2. Seed active season
          await supabase.from('seasons').insert({
            user_id: userId,
            name: 'Building Foundations',
            theme: 'Consistency over intensity',
            start_date: '2026-07-01',
            end_date: '2026-09-30',
            primary_focus: 'Career',
            supporting_focus: 'Health & Learning',
            intentions: 'Establish robust coding rhythms, complete 15k training runs, read leadership biographies.',
            status: 'active'
          });

          // 3. Seed future letter
          await supabase.from('future_letters').insert({
            user_id: userId,
            month: '2026-06',
            becoming_woman: 'I am learning to speak convictions with grace and handle leadership challenges.',
            habits_built: 'Daily journaling is at 90%, morning prayers are consistent.',
            fears_smaller: 'Fears of leadership capability are shrinking as I practice daily.',
            relationships_grown: 'Connected with old tech mentors and strengthened family check-ins.',
            future_thanks: 'Future Sharon will thank me for starting Project Sharon today.'
          });

          // 4. Seed initial checkin
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          await supabase.from('daily_check_ins').insert({
            user_id: userId,
            date: yesterday,
            prayed: true,
            exercised: true,
            built_text: 'Completed Next.js auth split routing and tested the build',
            learned_new: true,
            networked: false,
            energy: 8,
            mood: 4,
            win: 'Pushed local branch changes to GitHub main',
            improve: 'Focus on getting to bed by 10:30 PM'
          });
        } catch (seedErr) {
          console.error('Error auto-seeding new user profile:', seedErr);
        }

        return { data: newProfile, error: null };
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  async incrementGrowthScore(userId: string, points: number): Promise<{ error: any }> {
    const { data: profile } = await this.getProfile(userId);
    if (!profile) return { error: 'Profile not found' };

    const newScore = Math.min(100, Math.max(0, (profile.growth_score || 0) + points));
    const { error } = await this.updateProfile(userId, { growth_score: newScore });
    return { error };
  }
};
