-- StudyFlow Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    streak_count INTEGER DEFAULT 0,
    streak_last_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL,
    weekly_goal_hours DECIMAL(5,2),
    monthly_goal_hours DECIMAL(5,2),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_subjects_user_deleted ON subjects(user_id, deleted_at);

-- 3. Study Sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL,
    topic VARCHAR(255),
    notes TEXT,
    difficulty SMALLINT CHECK (difficulty IS NULL OR (difficulty >= 1 AND difficulty <= 3)),
    focus SMALLINT CHECK (focus IS NULL OR (focus >= 1 AND focus <= 3)),
    session_type VARCHAR(20) DEFAULT 'free',
    is_offline_sync BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON study_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_subject ON study_sessions(user_id, subject_id);

-- 4. Plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    task VARCHAR(500) NOT NULL,
    estimated_minutes INTEGER,
    priority VARCHAR(10) DEFAULT 'medium',
    status VARCHAR(15) DEFAULT 'pending',
    is_overdue BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, planned_date);

-- 5. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
    topic VARCHAR(255) NOT NULL,
    review_date DATE NOT NULL,
    status VARCHAR(15) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_date ON reviews(user_id, review_date);

-- 6. Goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL,
    target_minutes INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_period ON goals(user_id, period_start, period_end);

-- Enable Row Level Security (RLS) - optional for extra security
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (example for study_sessions)
-- CREATE POLICY "Users can view own sessions" ON study_sessions
--   FOR SELECT USING (auth.uid() = user_id);

-- Enable real-time for sessions (optional)
-- ALTER PUBLICATION supabase READD TABLE study_sessions;
-- ALTER PUBLICATION supabase READD TABLE plans;
-- ALTER PUBLICATION supabase READD TABLE reviews;

SELECT 'Database schema created successfully!' as status;