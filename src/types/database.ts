export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  googleId: string
  streakCount: number
  streakLastDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: string
  userId: string
  name: string
  color: string
  weeklyGoalHours: number | null
  monthlyGoalHours: number | null
  deletedAt: string | null
  createdAt: string
}

export interface StudySession {
  id: string
  userId: string
  subjectId: string
  date: string
  startedAt: string
  finishedAt: string | null
  pausedAt: string | null
  durationMinutes: number
  topic: string | null
  notes: string | null
  difficulty: number | null
  focus: number | null
  sessionType: 'free' | 'pomodoro'
  isOfflineSync: boolean
  createdAt: string
}

export interface Plan {
  id: string
  userId: string
  subjectId: string | null
  plannedDate: string
  task: string
  estimatedMinutes: number | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'done' | 'skipped'
  isOverdue: boolean
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  subjectId: string
  sessionId: string | null
  topic: string
  reviewDate: string
  status: 'pending' | 'done' | 'skipped'
  createdAt: string
}

export interface Goal {
  id: string
  userId: string
  subjectId: string | null
  type: 'daily' | 'weekly' | 'monthly'
  targetMinutes: number
  periodStart: string
  periodEnd: string
  isActive: boolean
  createdAt: string
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