export interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  growth_score: number;
  updated_at: string;
  gemini_api_key?: string | null;
  voice_profile?: string | null;
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
  status?: 'active' | 'completed' | 'archived';
  life_area_id?: string | null;
  season_id?: string | null;
  core_values?: string[];
  life_principles?: string[];
  created_at: string;
  life_area?: { id: string; name: string } | null;
  season?: { id: string; name: string; theme: string } | null;
  milestones?: GoalMilestone[];
  campaigns?: Campaign[];
}

export interface GoalMilestone {
  id: string;
  goal_id: string;
  text: string;
  completed: boolean;
  campaign_id?: string | null;
  target_date?: string | null; // YYYY-MM-DD
  person_id?: string | null;
  completed_at?: string | null; // ISO timestamp
  created_at: string;
  person?: { id: string; name: string } | null;
  campaign?: { id: string; title: string } | null;
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
  goal_id?: string | null;
  life_area_id?: string | null;
  created_at: string;
  goal?: { id: string; title: string } | null;
  life_area?: { id: string; name: string } | null;
  tasks?: CampaignTask[];
  milestones?: GoalMilestone[];
}

export interface StrategicProgress {
  progressPercentage: number;
  lastActivityAt: string | null;
  nextMilestoneDate: string | null;
  overdueMilestoneCount: number;
  completedMilestoneCount: number;
  totalMilestoneCount: number;
  completedTaskCount: number;
  recentTasksCount: number;
  statusLabel: string;
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
  non_negotiables_completed?: string[];
}

export interface IdentityAlignment {
  explicitValues: string[];
  explicitPrinciples: string[];
  isSeasonal: boolean;
  seasonName?: string;
  rationaleLabel: string;
}

export interface IntellectualGrowthLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  rotation_type: string;
  response: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;       // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'complete';
  life_area_id: string | null;
  goal_id: string | null;
  campaign_id?: string | null;
  milestone_id?: string | null;
  person_id: string | null;
  completed_at: string | null;   // ISO timestamp
  created_at: string;
  // Joined fields (populated by service when fetching with relations)
  life_area?: { id: string; name: string } | null;
  goal?: { id: string; title: string } | null;
  campaign?: { id: string; title: string } | null;
  milestone?: { id: string; text: string } | null;
  person?: { id: string; name: string } | null;
}

// Computed status helpers (derived client-side, never stored)
export type TaskUrgency = 'overdue' | 'today' | 'soon' | 'upcoming' | 'no-date' | 'complete';

export type EventCategory = 'meeting' | 'appointment' | 'church' | 'personal' | 'deadline' | 'other';
export type EventStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;          // YYYY-MM-DD
  start_time: string | null;   // HH:MM (24-hour)
  end_time: string | null;     // HH:MM (24-hour)
  is_all_day: boolean;
  location: string | null;
  category: EventCategory;
  life_area_id: string | null;
  goal_id: string | null;
  person_id: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  life_area?: { id: string; name: string } | null;
  goal?: { id: string; title: string } | null;
  person?: { id: string; name: string } | null;
}

export type PersonStatus = 'active' | 'waiting' | 'archived';

export interface Person {
  id: string;
  user_id: string;
  name: string;
  type: string | null;            // Flexible string (e.g. Mentor, Mentee, Sponsor, Recruiter, Client, Friend, Family, etc.)
  context: string | null;         // Personal context / summary
  notes: string | null;           // General notes / preferences
  important_dates?: Record<string, string> | null;
  lessons_learned?: string | null;
  next_action: string | null;     // What Sharon needs to do
  waiting_on: string | null;      // What Sharon is waiting for from contact
  reminders_frequency_days: number;
  last_contacted_date: string | null; // YYYY-MM-DD
  next_follow_up_date: string | null; // YYYY-MM-DD
  status: PersonStatus;
  life_area_id: string | null;
  created_at: string;
  updated_at?: string;
  // Joined fields
  life_area?: { id: string; name: string } | null;
}

export type InteractionType = 'WhatsApp' | 'Call' | 'Email' | 'Meeting' | 'Note' | string;

export interface RelationshipInteraction {
  id: string;
  user_id: string;
  relationship_id: string;
  interaction_date: string; // YYYY-MM-DD
  type: InteractionType;
  notes: string;
  created_at: string;
}

export type AttentionTier = 'immediate' | 'high' | 'standard';

export interface AttentionItem {
  id: string;
  entity_id: string;
  entity_type: 'task' | 'person' | 'event';
  title: string;
  subtitle: string;
  attention_score: number;
  tier: AttentionTier;
  rationale: string[];
  action_label: string;
  action_url: string;
  due_date?: string | null;
  start_time?: string | null;
  person_name?: string | null;
  is_dismissed?: boolean;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  entity_type: 'task' | 'person' | 'event';
  entity_id: string;
  title: string;
  message: string;
  rationale: string[];
  tier: AttentionTier;
  action_url: string;
  action_label: string;
  is_read: boolean;
  notification_date: string; // YYYY-MM-DD
  created_at: string;
}

export type MemoirType = 'journal' | 'season_review' | 'goal_achieved' | 'period_review' | 'future_letter' | 'timeline_event';

export interface MemoirEntry {
  id: string;                // Read-model identity e.g. "memoir-journal-uuid"
  sourceId: string;          // Underlying record ID e.g. "uuid"
  sourceType: MemoirType;    // Exact source table type
  date: string;              // YYYY-MM-DD
  year: number;              // Numeric year e.g. 2026
  title: string;
  excerpt: string;
  fullContent?: string;
  tags: string[];
  category?: string | null;
  seasonName?: string | null;
  ratingOrMood?: number | null;
  linkedEntityUrl: string;   // Navigation URL back to source
}

export interface MemoirFilter {
  year?: number | 'all';
  type?: MemoirType | 'all';
  category?: string | 'all';
  seasonId?: string | 'all';
  searchQuery?: string;
}

export interface SeasonalDossier {
  season: Season;
  goalsCount: number;
  completedGoalsCount: number;
  campaignsCount: number;
  milestonesCount: number;
  completedTasksCount: number;
  goals: Goal[];
  keyMoments: MemoirEntry[];
}


