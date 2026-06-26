-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  growth_score INT DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON profiles 
  FOR ALL USING (auth.uid() = id);

-- LIFE AREAS
CREATE TABLE life_areas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g. "Faith", "Health", "Career", "Finance"
  score INT DEFAULT 5 CHECK (score >= 1 AND score <= 10),
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, name)
);

ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own life areas" ON life_areas 
  FOR ALL USING (auth.uid() = user_id);

-- DAILY FOCUS
CREATE TABLE daily_focus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  top_priority TEXT NOT NULL,
  secondary_priority TEXT,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_focus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own daily focus" ON daily_focus 
  FOR ALL USING (auth.uid() = user_id);

-- PERSONAL IDENTITY
CREATE TABLE personal_identity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  core_values TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  personality TEXT,
  convictions TEXT,
  future_vision TEXT,
  traits TEXT[] DEFAULT '{}',
  legacy_statement TEXT,
  mission_statement TEXT,
  non_negotiables TEXT[] DEFAULT '{}',
  life_principles TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id)
);

ALTER TABLE personal_identity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own personal identity" ON personal_identity 
  FOR ALL USING (auth.uid() = user_id);

-- JOURNAL ENTRIES
CREATE TABLE journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  mood INT CHECK (mood >= 1 AND mood <= 5),
  content TEXT NOT NULL,
  learned TEXT,
  challenged TEXT,
  grateful TEXT,
  excited TEXT,
  better TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own journals" ON journal_entries 
  FOR ALL USING (auth.uid() = user_id);

-- REVIEWS (Weekly, Monthly, Quarterly, Annual)
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  period_type TEXT CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'annual')),
  period_key TEXT NOT NULL, -- e.g. "2026-W26", "2026-06", "2026-Q2", "2026"
  win TEXT,
  lesson TEXT,
  mistake TEXT,
  avoided TEXT,
  improved TEXT,
  focus TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, period_type, period_key)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reviews" ON reviews 
  FOR ALL USING (auth.uid() = user_id);

-- GOALS & MILESTONES
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category TEXT CHECK (category IN ('Career', 'Business', 'Finance', 'Health', 'Relationships', 'Spiritual Life', 'Education', 'Travel')),
  title TEXT NOT NULL,
  description TEXT,
  deadline DATE,
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON goals 
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE goal_milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  goal_id UUID REFERENCES goals ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage milestones of their own goals" ON goal_milestones 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_milestones.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- SKILLS
CREATE TABLE skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE (user_id, name)
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own skills" ON skills 
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE skill_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  skill_id UUID REFERENCES skills ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  hours NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE skill_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage logs for their own skills" ON skill_logs 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM skills 
      WHERE skills.id = skill_logs.skill_id 
      AND skills.user_id = auth.uid()
    )
  );

-- LEARNING RESOURCES (Replaces books)
CREATE TABLE learning_resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  resource_type TEXT CHECK (resource_type IN ('book', 'podcast', 'course', 'video', 'article')),
  start_date DATE,
  completion_date DATE,
  rating INT DEFAULT 0,
  lessons TEXT,
  quotes TEXT[] DEFAULT '{}',
  reflections TEXT,
  status TEXT CHECK (status IN ('reading', 'completed', 'backlog')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their learning resources" ON learning_resources 
  FOR ALL USING (auth.uid() = user_id);

-- PERSONAL PRINCIPLES
CREATE TABLE principles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  category TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE principles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their principles" ON principles 
  FOR ALL USING (auth.uid() = user_id);

-- BUSINESS IDEAS
CREATE TABLE business_ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  score NUMERIC GENERATED ALWAYS AS ((rating_market + rating_execution + rating_passion) / 3.0) STORED,
  rating_market INT CHECK (rating_market >= 1 AND rating_market <= 10),
  rating_execution INT CHECK (rating_execution >= 1 AND rating_execution <= 10),
  rating_passion INT CHECK (rating_passion >= 1 AND rating_passion <= 10),
  status TEXT DEFAULT 'concept' CHECK (status IN ('concept', 'active', 'archived')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE business_ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage business ideas" ON business_ideas 
  FOR ALL USING (auth.uid() = user_id);

-- HABITS & LOGS
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their habits" ON habits 
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES habits ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage habit logs" ON habit_logs 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

-- LIFE TIMELINE
CREATE TABLE timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('achievement', 'lesson', 'memory', 'milestone')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage timeline events" ON timeline_events 
  FOR ALL USING (auth.uid() = user_id);

-- FUTURE LETTERS
CREATE TABLE future_letters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  open_date DATE NOT NULL,
  opened BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE future_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage future letters" ON future_letters 
  FOR ALL USING (auth.uid() = user_id);

-- RELATIONSHIPS TRACKER
CREATE TABLE relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('mentor', 'friend', 'family', 'professional')),
  notes TEXT,
  important_dates JSONB DEFAULT '{}',
  lessons_learned TEXT,
  reminders_frequency_days INT DEFAULT 30,
  last_contacted_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage relationships" ON relationships 
  FOR ALL USING (auth.uid() = user_id);

-- KNOWLEDGE VAULT
CREATE TABLE knowledge_vault (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('lesson', 'quote', 'observation', 'idea', 'person')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE knowledge_vault ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage knowledge items" ON knowledge_vault 
  FOR ALL USING (auth.uid() = user_id);

-- COACH CONVERSATIONS
CREATE TABLE coach_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Growth Dialogue',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage coach conversations" ON coach_conversations 
  FOR ALL USING (auth.uid() = user_id);

-- COACH MESSAGES
CREATE TABLE coach_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES coach_conversations ON DELETE CASCADE NOT NULL,
  sender TEXT CHECK (sender IN ('user', 'coach')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage coach messages" ON coach_messages 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM coach_conversations 
      WHERE coach_conversations.id = coach_messages.conversation_id 
      AND coach_conversations.user_id = auth.uid()
    )
  );

-- ATTACHMENTS
CREATE TABLE attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  linked_table TEXT NOT NULL, -- e.g. 'journal_entries', 'goals', 'reviews'
  linked_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own attachments" ON attachments 
  FOR ALL USING (auth.uid() = user_id);

-- AI INSIGHTS
CREATE TABLE ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('weekly_summary', 'habit_observation', 'goal_drift', 'mood_trend')),
  content TEXT NOT NULL,
  meta_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own AI insights" ON ai_insights 
  FOR ALL USING (auth.uid() = user_id);
