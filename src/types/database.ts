export interface User {
  id: string
  email: string
  name: string
  avatar_url: string | null
  google_id: string
  streak_count: number
  streak_last_date: string | null
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  user_id: string
  name: string
  color: string
  weekly_goal_hours: number | null
  monthly_goal_hours: number | null
  deleted_at: string | null
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  subject_id: string
  date: string
  started_at: string
  finished_at: string | null
  paused_at: string | null
  duration_minutes: number
  topic: string | null
  notes: string | null
  difficulty: number | null
  focus: number | null
  session_type: 'free' | 'pomodoro'
  is_offline_sync: boolean
  created_at: string
}

export interface Plan {
  id: string
  user_id: string
  subject_id: string | null
  planned_date: string
  task: string
  estimated_minutes: number | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'done' | 'skipped'
  is_overdue: boolean
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  subject_id: string
  session_id: string | null
  topic: string
  review_date: string
  status: 'pending' | 'done' | 'skipped'
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  subject_id: string | null
  type: 'daily' | 'weekly' | 'monthly'
  target_minutes: number
  period_start: string
  period_end: string
  is_active: boolean
  created_at: string
}

export interface SubjectWithName {
  name: string
  color: string
}

export interface PlanWithSubject extends Plan {
  subject?: SubjectWithName | null
}

export interface ReviewWithSubject extends Review {
  subject?: SubjectWithName | null
}

export interface GoalWithSubject extends Goal {
  subject?: SubjectWithName | null
}