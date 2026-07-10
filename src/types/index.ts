export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  growth_score: number;
  updated_at: string;
}

export interface LifeArea {
  id: string;
  user_id: string;
  name: string;
  score: number;
  notes: string | null;
  updated_at: string;
}

export interface DailyFocus {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  top_priority: string;
  secondary_priority: string | null;
  reflection: string | null;
  created_at: string;
}

export interface PersonalIdentity {
  id: string;
  user_id: string;
  core_values: string[];
  strengths: string[];
  weaknesses: string[];
  personality: string | null;
  convictions: string | null;
  future_vision: string | null;
  traits: string[];
  legacy_statement: string | null;
  mission_statement: string | null;
  non_negotiables: string[];
  life_principles: string[];
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  content: string;
  learned: string | null;
  challenged: string | null;
  grateful: string | null;
  excited: string | null;
  better: string | null;
  tags: string[];
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  period_type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  period_key: string; // "2026-W26", "2026-06", "2026-Q2", "2026"
  win: string | null;
  lesson: string | null;
  mistake: string | null;
  avoided: string | null;
  improved: string | null;
  focus: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category: 'Career' | 'Business' | 'Finance' | 'Health' | 'Relationships' | 'Spiritual Life' | 'Education' | 'Travel';
  title: string;
  description: string | null;
  deadline: string | null; // YYYY-MM-DD
  progress: number; // 0-100
  notes: string | null;
  created_at: string;
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  text: string;
  completed: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  logs?: HabitLog[];
  streak?: number;
  completionRate?: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  tasks?: CampaignTask[];
}

export interface CampaignTask {
  id: string;
  campaign_id: string;
  title: string;
  prompt: string | null;
  draft: string;
  completed: boolean;
  published: boolean;
  order_index: number;
  created_at: string;
}

export interface Season {
  id: string;
  user_id: string;
  name: string;
  theme: string;
  start_date: string;
  end_date: string;
  primary_focus: string;
  supporting_focus: string | null;
  intentions: string;
  review: string | null;
  status: 'active' | 'archived';
  created_at: string;
}

export interface FutureLetter {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  becoming_woman: string | null;
  habits_built: string | null;
  fears_smaller: string | null;
  relationships_grown: string | null;
  future_thanks: string | null;
  created_at: string;
}

export interface DailyCheckIn {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  prayed: boolean;
  exercised: boolean;
  built_text: string | null;
  learned_new: boolean;
  networked: boolean;
  energy: number; // 1-10
  mood: number; // 1-5
  win: string | null;
  improve: string | null;
}

export interface IntellectualGrowthLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  rotation_type: string;
  response: string;
  completed: boolean;
}
