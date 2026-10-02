import { createClient } from '@supabase/supabase-js';

// Environment variables check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isRealSupabaseConfigured = false;

// Mock UUID Generator
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Initial Mock Seed Data
const MOCK_PROFILE = {
  id: 'sharon-user-uuid',
  name: 'Sharon',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  bio: 'Living intentionally, learning daily, and building things that matter. Focus: Clarity, confidence, and discipline.',
  growth_score: 84,
  gemini_api_key: 'mock-gemini-key',
  voice_profile: 'Write in a natural, conversational, and direct tone.',
  updated_at: new Date().toISOString()
};

const MOCK_LIFE_AREAS = [
  { id: '1', user_id: MOCK_PROFILE.id, name: 'Faith', score: 8, notes: 'Consistent morning prayers, but want to read more scripture.', updated_at: new Date().toISOString() },
  { id: '2', user_id: MOCK_PROFILE.id, name: 'Health', score: 7, notes: 'Diet is clean; need to increase strength training to 4x/week.', updated_at: new Date().toISOString() },
  { id: '3', user_id: MOCK_PROFILE.id, name: 'Career', score: 9, notes: 'Taking on leadership responsibilities at work. Doing well.', updated_at: new Date().toISOString() },
  { id: '4', user_id: MOCK_PROFILE.id, name: 'Finance', score: 8, notes: 'Savings rate is at 40%. Investing consistently in index funds.', updated_at: new Date().toISOString() },
  { id: '5', user_id: MOCK_PROFILE.id, name: 'Learning', score: 9, notes: 'Completed 6 books this year. Focus: Project management.', updated_at: new Date().toISOString() },
  { id: '6', user_id: MOCK_PROFILE.id, name: 'Relationships', score: 7, notes: 'Need more regular dates with spouse and calls to family.', updated_at: new Date().toISOString() },
  { id: '7', user_id: MOCK_PROFILE.id, name: 'Wellbeing', score: 8, notes: 'Mood is stable. Daily journaling helps manage stress.', updated_at: new Date().toISOString() },
  { id: '8', user_id: MOCK_PROFILE.id, name: 'Business', score: 6, notes: 'Ideating side projects. Goal is launching 1 micro-SaaS.', updated_at: new Date().toISOString() }
];

const MOCK_IDENTITY = {
  id: '1',
  user_id: MOCK_PROFILE.id,
  core_values: ['Clarity', 'Integrity', 'Growth', 'Love', 'Discipline'],
  strengths: ['Analytical thinking', 'Empathy', 'Structured execution', 'Writing'],
  weaknesses: ['Perfectionism', 'Saying yes to too many tasks', 'Imposter syndrome'],
  personality: 'INFJ (The Advocate)',
  convictions: 'True freedom is found in discipline. Growth is a lifelong journey, not a destination. Excellence is a habit.',
  future_vision: 'A leader in technology, spiritually grounded, physically strong, and supporting a loving family and vibrant community.',
  traits: ['Empathetic', 'Disciplined', 'Introspective', 'Creative'],
  legacy_statement: 'She built platforms that empowered people, lived with radical kindness, and left the world wiser than she found it.',
  mission_statement: 'To live with intense focus, model healthy relationships, and develop systems that elevate human potential.',
  non_negotiables: ['7 hours of sleep', 'No phone for first 30 mins of day', 'Daily reflection', 'Weekly budget check'],
  life_principles: [
    'Consistency beats motivation.',
    'Clarity creates confidence.',
    'Discipline creates freedom.',
    'Work on your system, not just your goal.'
  ],
  updated_at: new Date().toISOString()
};

const MOCK_DAILY_FOCUS = [
  {
    id: '1',
    user_id: MOCK_PROFILE.id,
    date: new Date().toISOString().split('T')[0],
    top_priority: 'Launch Phase 1 of Project Sharon coding database',
    secondary_priority: 'Evening running workout & stretching',
    reflection: 'Coding session was highly productive. Feeling aligned.',
    created_at: new Date().toISOString()
  }
];

const MOCK_JOURNAL = [
  {
    id: 'j1',
    user_id: MOCK_PROFILE.id,
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    mood: 4,
    content: 'Had a breakthrough today in designing the database for Project Sharon. The separation of concerns makes so much sense now. Walked in the park in the evening, which helped clear my mind.',
    learned: 'Relational data structures require clear boundary scopes early in design to prevent massive refactoring later.',
    challenged: 'Felt tired in the afternoon. Need to optimize lunch choices to avoid sugar crashes.',
    grateful: 'Grateful for supportive friends who challenge my business ideas.',
    excited: 'Excited about the radar wheel showing my life balance dynamically.',
    better: 'Could have stopped checking social media earlier in the morning.',
    tags: ['Coding', 'Reflection', 'Database'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'j2',
    user_id: MOCK_PROFILE.id,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    mood: 5,
    content: 'Very high energy today. Met up with my mentor for breakfast. He gave me great advice about focusing on the systems of habits rather than just tracking end goals.',
    learned: 'A system is defined by its inputs, processing, and feedback loops. Focus on inputs (daily priority) and feedback (weekly reviews).',
    challenged: 'Managing my time between work tasks and side project coding.',
    grateful: 'Grateful for the wise advice of my mentor, John.',
    excited: 'Excited to start daily focus sheets.',
    better: 'Should have spent 15 minutes planning the next day before sleeping.',
    tags: ['Mentorship', 'Growth', 'Systems'],
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const MOCK_GOALS = [
  { id: 'g1', user_id: MOCK_PROFILE.id, category: 'Career', title: 'Earn Tech Lead Promotion', description: 'Become the technical lead of the core product team by driving architecture and code quality standards.', deadline: '2026-12-31', progress: 40, notes: 'Focus on communication and delegation.', created_at: new Date().toISOString() },
  { id: 'g2', user_id: MOCK_PROFILE.id, category: 'Health', title: 'Run a Half Marathon in under 2 Hours', description: 'Develop cardiovascular endurance and complete the local race with proper pacing.', deadline: '2026-10-15', progress: 50, notes: 'Weekly mileage needs to reach 30km.', created_at: new Date().toISOString() },
  { id: 'g3', user_id: MOCK_PROFILE.id, category: 'Finance', title: 'Reach $100k Savings Goal', description: 'Maintain strict monthly budgets and allocate funds automatically to broad-market indices.', deadline: '2027-06-30', progress: 65, notes: 'Avoid lifestyle creep.', created_at: new Date().toISOString() }
];

const MOCK_MILESTONES = [
  { id: 'm1', goal_id: 'g1', text: 'Design and write standard coding guidelines document', completed: true, created_at: new Date().toISOString() },
  { id: 'm2', goal_id: 'g1', text: 'Mentor junior developer and lead 3 sprint reviews', completed: false, created_at: new Date().toISOString() },
  { id: 'm3', goal_id: 'g1', text: 'Conduct system design workshop for core backend upgrade', completed: false, created_at: new Date().toISOString() },
  { id: 'm4', goal_id: 'g2', text: 'Run 10k without stopping', completed: true, created_at: new Date().toISOString() },
  { id: 'm5', goal_id: 'g2', text: 'Complete a 15k long training run', completed: true, created_at: new Date().toISOString() },
  { id: 'm6', goal_id: 'g2', text: 'Maintain a 5:30/km pace over 18k run', completed: false, created_at: new Date().toISOString() }
];

const MOCK_HABITS = [
  { id: 'h1', user_id: MOCK_PROFILE.id, name: 'Exercise (30 mins)', created_at: new Date().toISOString() },
  { id: 'h2', user_id: MOCK_PROFILE.id, name: 'Read (15 pages)', created_at: new Date().toISOString() },
  { id: 'h3', user_id: MOCK_PROFILE.id, name: 'Morning Prayer', created_at: new Date().toISOString() },
  { id: 'h4', user_id: MOCK_PROFILE.id, name: 'Daily Journaling', created_at: new Date().toISOString() },
  { id: 'h5', user_id: MOCK_PROFILE.id, name: 'Deep Work (2 hours)', created_at: new Date().toISOString() }
];

const MOCK_HABIT_LOGS = [
  { id: 'hl1', habit_id: 'h1', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() },
  { id: 'hl2', habit_id: 'h2', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() },
  { id: 'hl3', habit_id: 'h3', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() },
  { id: 'hl4', habit_id: 'h4', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() },
  { id: 'hl5', habit_id: 'h1', date: new Date().toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() },
  { id: 'hl6', habit_id: 'h2', date: new Date().toISOString().split('T')[0], completed: false, created_at: new Date().toISOString() },
  { id: 'hl7', habit_id: 'h3', date: new Date().toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() },
  { id: 'hl8', habit_id: 'h4', date: new Date().toISOString().split('T')[0], completed: true, created_at: new Date().toISOString() }
];

const MOCK_REVIEWS = [
  { id: 'r1', user_id: MOCK_PROFILE.id, period_type: 'weekly', period_key: '2026-W25', win: 'Finished the technical architecture schema design for the new dashboard system.', lesson: 'If I spend too much time on design variations, I lose time for development. Iterate faster.', mistake: 'Stayed up too late on Wednesday reading forums. Destroyed Thursday productivity.', avoided: 'Avoided taking on additional freelance work to stay focused.', improved: 'Improved morning routine consistency by preparing clothes the night before.', focus: 'Phase 1 launch of Project Sharon code base.', created_at: new Date(Date.now() - 86400000 * 3).toISOString() }
];

const MOCK_CAMPAIGNS = [
  { id: 'c1', user_id: MOCK_PROFILE.id, title: 'Graduation 2026', description: '14-day storytelling countdown before my software engineering graduation', start_date: '2026-07-12', end_date: '2026-07-26', status: 'active', created_at: new Date().toISOString() }
];

const MOCK_CAMPAIGN_TASKS = [
  { id: 'ct14', campaign_id: 'c1', title: 'Day 14', prompt: 'Why I chose Software Engineering.', draft: 'My journey into software engineering started with curiosity...', completed: true, published: true, order_index: 14, created_at: new Date().toISOString() },
  { id: 'ct13', campaign_id: 'c1', title: 'Day 13', prompt: 'My lowest academic point and what it taught me.', draft: '', completed: false, published: false, order_index: 13, created_at: new Date().toISOString() },
  { id: 'ct12', campaign_id: 'c1', title: 'Day 12', prompt: 'Discovering tech communities (GDSC/GDG).', draft: '', completed: false, published: false, order_index: 12, created_at: new Date().toISOString() },
  { id: 'ct11', campaign_id: 'c1', title: 'Day 11', prompt: 'My first leadership role.', draft: '', completed: false, published: false, order_index: 11, created_at: new Date().toISOString() },
  { id: 'ct10', campaign_id: 'c1', title: 'Day 10', prompt: 'Lessons from internships.', draft: '', completed: false, published: false, order_index: 10, created_at: new Date().toISOString() },
  { id: 'ct9', campaign_id: 'c1', title: 'Day 9', prompt: 'Planning my first major event.', draft: '', completed: false, published: false, order_index: 9, created_at: new Date().toISOString() },
  { id: 'ct8', campaign_id: 'c1', title: 'Day 8', prompt: 'Learning to work with people.', draft: '', completed: false, published: false, order_index: 8, created_at: new Date().toISOString() },
  { id: 'ct7', campaign_id: 'c1', title: 'Day 7', prompt: 'The semester I earned a 5.0.', draft: '', completed: false, published: false, order_index: 7, created_at: new Date().toISOString() },
  { id: 'ct6', campaign_id: 'c1', title: 'Day 6', prompt: 'Final-year project lessons.', draft: '', completed: false, published: false, order_index: 6, created_at: new Date().toISOString() },
  { id: 'ct5', campaign_id: 'c1', title: 'Day 5', prompt: 'Building beyond the classroom.', draft: '', completed: false, published: false, order_index: 5, created_at: new Date().toISOString() },
  { id: 'ct4', campaign_id: 'c1', title: 'Day 4', prompt: 'The people who shaped my journey.', draft: '', completed: false, published: false, order_index: 4, created_at: new Date().toISOString() },
  { id: 'ct3', campaign_id: 'c1', title: 'Day 3', prompt: 'What graduating actually feels like.', draft: '', completed: false, published: false, order_index: 3, created_at: new Date().toISOString() },
  { id: 'ct2', campaign_id: 'c1', title: 'Day 2', prompt: 'What comes next.', draft: '', completed: false, published: false, order_index: 2, created_at: new Date().toISOString() },
  { id: 'ct1', campaign_id: 'c1', title: 'Day 1', prompt: 'Gratitude and excitement for graduation.', draft: '', completed: false, published: false, order_index: 1, created_at: new Date().toISOString() }
];

const MOCK_SEASONS = [
  { id: 's1', user_id: MOCK_PROFILE.id, name: 'Building Foundations', theme: 'Consistency over intensity', start_date: '2026-07-01', end_date: '2026-09-30', primary_focus: 'Career', supporting_focus: 'Health & Learning', intentions: 'Establish robust coding rhythms, complete 15k training runs, read leadership biographies.', status: 'active', created_at: new Date().toISOString() }
];

const MOCK_FUTURE_LETTERS = [
  { id: 'fl1', user_id: MOCK_PROFILE.id, month: '2026-06', becoming_woman: 'I am learning to speak convictions with grace and handle leadership challenges.', habits_built: 'Daily journaling is at 90%, morning prayers are consistent.', fears_smaller: 'Fears of leadership capability are shrinking as I practice daily.', relationships_grown: 'Connected with old tech mentors and strengthened family check-ins.', future_thanks: 'Future Sharon will thank me for starting Project Sharon today.', created_at: new Date().toISOString() }
];

const MOCK_DAILY_CHECKINS = [
  { id: 'dc1', user_id: MOCK_PROFILE.id, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], prayed: true, exercised: true, built_text: 'Completed Next.js auth split routing and tested the build', learned_new: true, networked: false, energy: 8, mood: 4, win: 'Pushed local branch changes to GitHub main', improve: 'Focus on getting to bed by 10:30 PM' }
];

const MOCK_INTELLECTUAL_LOGS = [
  { id: 'ig1', user_id: MOCK_PROFILE.id, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], rotation_type: 'reading', response: 'Read System Design scaling: Horizontal scaling is easier when servers are stateless.', completed: true }
];

const MOCK_RELATIONSHIPS = [
  {
    id: 'rel-1',
    user_id: MOCK_PROFILE.id,
    name: 'Sarah Connor',
    type: 'Sponsor',
    context: 'YPS Mentor & Advisor. Guides software career growth and leadership.',
    notes: 'Very responsive on WhatsApp. Prefers concise updates.',
    next_action: 'Send React resources & draft proposal',
    waiting_on: 'Feedback on project roadmap',
    reminders_frequency_days: 14,
    last_contacted_date: '2026-08-28',
    next_follow_up_date: '2026-09-05',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'rel-2',
    user_id: MOCK_PROFILE.id,
    name: 'John Doe',
    type: 'Recruiter',
    context: 'Senior Tech Recruiter at Acme Corp',
    notes: 'Reached out regarding Senior Developer roles.',
    next_action: 'Send updated resume & portfolio link',
    waiting_on: 'Interview schedule options for next week',
    reminders_frequency_days: 7,
    last_contacted_date: '2026-08-15',
    next_follow_up_date: '2026-09-01', // Overdue
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'rel-3',
    user_id: MOCK_PROFILE.id,
    name: 'Jane Smith',
    type: 'Friend',
    context: 'Met at GDG Tech Conference 2025',
    notes: 'Loves open source and UI design.',
    next_action: null,
    waiting_on: null,
    reminders_frequency_days: 30,
    last_contacted_date: '2026-08-30',
    next_follow_up_date: null,
    status: 'active',
    created_at: new Date().toISOString()
  }
];

const MOCK_RELATIONSHIP_INTERACTIONS = [
  {
    id: 'inter-1',
    user_id: MOCK_PROFILE.id,
    relationship_id: 'rel-1',
    interaction_date: '2026-08-28',
    type: 'WhatsApp',
    notes: 'Sent message discussing React resources and career transition roadmap.',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    id: 'inter-2',
    user_id: MOCK_PROFILE.id,
    relationship_id: 'rel-1',
    interaction_date: '2026-08-31',
    type: 'Call',
    notes: 'Had a 20-min alignment call on YPS project milestones.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Helper to seed localStorage
const seedLocalStorage = () => {
  if (typeof window === 'undefined') return;
  const seed = (key: string, data: any) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };
  seed('sharon_db_profiles', [MOCK_PROFILE]);
  seed('sharon_db_life_areas', MOCK_LIFE_AREAS);
  seed('sharon_db_personal_identity', [MOCK_IDENTITY]);
  seed('sharon_db_daily_focus', MOCK_DAILY_FOCUS);
  seed('sharon_db_journal_entries', MOCK_JOURNAL);
  seed('sharon_db_goals', MOCK_GOALS);
  seed('sharon_db_goal_milestones', MOCK_MILESTONES);
  seed('sharon_db_habits', MOCK_HABITS);
  seed('sharon_db_habit_logs', MOCK_HABIT_LOGS);
  seed('sharon_db_reviews', MOCK_REVIEWS);
  seed('sharon_db_campaigns', MOCK_CAMPAIGNS);
  seed('sharon_db_campaign_tasks', MOCK_CAMPAIGN_TASKS);
  seed('sharon_db_seasons', MOCK_SEASONS);
  seed('sharon_db_future_letters', MOCK_FUTURE_LETTERS);
  seed('sharon_db_daily_check_ins', MOCK_DAILY_CHECKINS);
  seed('sharon_db_intellectual_growth_logs', MOCK_INTELLECTUAL_LOGS);
  seed('sharon_db_relationships', MOCK_RELATIONSHIPS);
  seed('sharon_db_relationship_interactions', MOCK_RELATIONSHIP_INTERACTIONS);
};

// Seed storage immediately if in browser
if (typeof window !== 'undefined') {
  seedLocalStorage();
}

class MockSupabaseQueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: any }> {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private isSingle = false;
  private limitCount: number | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getData(): any[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(`sharon_db_${this.tableName}`);
    return raw ? JSON.parse(raw) : [];
  }

  private saveData(data: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`sharon_db_${this.tableName}`, JSON.stringify(data));
  }

  select(columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => {
      // Direct comparison
      return item[column] === value;
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAsc = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item: any) => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item: any) => item[column] <= value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item: any) => Array.isArray(values) && values.includes(item[column]));
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item: any) => item[column] !== value);
    return this;
  }

  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private insertPayload: any = null;
  private updatePayload: any = null;

  insert(payload: any | any[]) {
    this.operation = 'insert';
    this.insertPayload = payload;
    return this;
  }

  update(payload: any) {
    this.operation = 'update';
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  // Promise resolution
  then<TResult1 = { data: T | null; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any | null; error: any }> {
    if (this.operation === 'insert') {
      const records = this.getData();
      const toInsert = Array.isArray(this.insertPayload) ? this.insertPayload : [this.insertPayload];
      const created: any[] = [];

      toInsert.forEach((item) => {
        const newItem = {
          id: item.id || generateUUID(),
          user_id: item.user_id || 'sharon-user-uuid',
          created_at: new Date().toISOString(),
          ...item
        };
        records.push(newItem);
        created.push(newItem);
      });

      this.saveData(records);
      return { data: (this.isSingle ? created[0] : created) as any, error: null };
    }

    if (this.operation === 'update') {
      let records = this.getData();
      const updated: any[] = [];

      records = records.map((item) => {
        const match = this.filters.every((f) => f(item));
        if (match) {
          const newItem = {
            ...item,
            ...this.updatePayload,
            updated_at: new Date().toISOString()
          };
          updated.push(newItem);
          return newItem;
        }
        return item;
      });

      this.saveData(records);
      return { data: (this.isSingle ? updated[0] : updated) as any, error: null };
    }

    if (this.operation === 'delete') {
      const records = this.getData();
      const remaining = records.filter((item) => !this.filters.every((f) => f(item)));
      const deleted = records.filter((item) => this.filters.every((f) => f(item)));
      this.saveData(remaining);
      return { data: deleted as any, error: null };
    }

    let data = this.getData();

    // Apply filters
    if (this.filters.length > 0) {
      data = data.filter((item) => this.filters.every((f) => f(item)));
    }

    // Apply order
    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      data.sort((a, b) => {
        if (a[col] < b[col]) return asc ? -1 : 1;
        if (a[col] > b[col]) return asc ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    // Apply single
    if (this.isSingle) {
      return { data: data.length > 0 ? data[0] : null, error: null };
    }

    return { data, error: null };
  }
}

// Mock Auth system
class MockSupabaseAuth {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'sharon_auth_user') {
          this.trigger();
        }
      });
    }
  }

  private trigger() {
    const session = this.getSessionSync();
    this.listeners.forEach((l) => l(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
  }

  private getSessionSync() {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('sharon_auth_user');
    if (!userStr) return null;
    return {
      access_token: 'mock-access-token',
      user: JSON.parse(userStr)
    };
  }

  async getSession() {
    return { data: { session: this.getSessionSync() }, error: null };
  }

  async getUser() {
    const session = this.getSessionSync();
    return { data: { user: session ? session.user : null }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    if (typeof window === 'undefined') return { data: null, error: 'Browser environment only' };
    const user = {
      id: 'sharon-user-uuid',
      email: email || 'sharon@growth.com',
      user_metadata: { name: 'Sharon' },
      role: 'authenticated'
    };
    localStorage.setItem('sharon_auth_user', JSON.stringify(user));
    this.trigger();
    return { data: { user, session: this.getSessionSync() }, error: null };
  }

  async signUp({ email, password }: any) {
    return this.signInWithPassword({ email, password });
  }

  async signOut() {
    if (typeof window === 'undefined') return { error: null };
    localStorage.removeItem('sharon_auth_user');
    this.trigger();
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    // Initial call
    const session = this.getSessionSync();
    callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          }
        }
      }
    };
  }
}

// Mock Supabase Client class
class MockSupabaseClient {
  auth = new MockSupabaseAuth();

  from(tableName: string) {
    return new MockSupabaseQueryBuilder(tableName);
  }

  // Support storage calls minimally
  storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => {
        return { data: { path: `${bucket}/${path}` }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://images.unsplash.com/photo-1494790108377-be9c29b29330` } };
      }
    })
  };
}

// Export the client. Instantiates real client if environment keys are set, otherwise instantiates Mock Client
export const supabase = isRealSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (new MockSupabaseClient() as any);
