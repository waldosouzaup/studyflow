import { supabase } from './supabase'
import type { User, Subject, StudySession, Plan, Review, Goal } from '../types/database'

export const authApi = {
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return profile as User | null
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
}

export const subjectApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, user_id, name, color, weekly_goal_hours, monthly_goal_hours, created_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('name')
    
    if (error) throw error
    return data as Subject[]
  },

  create: async (subject: any) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: subject.userId || subject.user_id,
        name: subject.name,
        color: subject.color,
        weekly_goal_hours: subject.weeklyGoalHours !== undefined ? subject.weeklyGoalHours : subject.weekly_goal_hours,
        monthly_goal_hours: subject.monthlyGoalHours !== undefined ? subject.monthlyGoalHours : subject.monthly_goal_hours,
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Subject
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('subjects')
      .update({
        name: updates.name,
        color: updates.color,
        weekly_goal_hours: updates.weeklyGoalHours !== undefined ? updates.weeklyGoalHours : updates.weekly_goal_hours,
        monthly_goal_hours: updates.monthlyGoalHours !== undefined ? updates.monthlyGoalHours : updates.monthly_goal_hours,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Subject
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  },
}

export const sessionApi = {
  list: async (userId: string, from?: string, to?: string, subjectId?: string) => {
    let query = supabase
      .from('study_sessions')
      .select('id, user_id, subject_id, date, started_at, finished_at, paused_at, duration_minutes, topic, notes, difficulty, focus, session_type, subject:subjects(name, color)')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    if (subjectId) query = query.eq('subject_id', subjectId)

    const { data, error } = await query
    if (error) throw error
    return data as any[]
  },

  listByDateRange: async (userId: string, from: string, to: string) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('date, duration_minutes, subject_id')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
      .not('finished_at', 'is', null)
      .order('date', { ascending: true })

    if (error) throw error
    return data as { date: string; duration_minutes: number; subject_id: string }[]
  },

  create: async (session: any) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        id: session.id,
        user_id: session.userId || session.user_id,
        subject_id: session.subjectId !== undefined ? session.subjectId : session.subject_id,
        date: session.date,
        started_at: session.startedAt || session.started_at,
        finished_at: session.finishedAt !== undefined ? session.finishedAt : session.finished_at,
        paused_at: session.pausedAt !== undefined ? session.pausedAt : session.paused_at,
        duration_minutes: session.durationMinutes !== undefined ? session.durationMinutes : session.duration_minutes,
        topic: session.topic,
        notes: session.notes,
        difficulty: session.difficulty,
        focus: session.focus,
        session_type: session.sessionType ?? session.session_type ?? 'free',
        is_offline_sync: session.isOfflineSync !== undefined ? session.isOfflineSync : session.is_offline_sync,
      })
      .select()
      .single()
    
    if (error) throw error
    return data as StudySession
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        finished_at: updates.finishedAt !== undefined ? updates.finishedAt : updates.finished_at,
        paused_at: updates.pausedAt !== undefined ? updates.pausedAt : updates.paused_at,
        duration_minutes: updates.durationMinutes !== undefined ? updates.durationMinutes : updates.duration_minutes,
        topic: updates.topic,
        notes: updates.notes,
        difficulty: updates.difficulty,
        focus: updates.focus,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as StudySession
  },

  getActive: async (userId: string) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('id, user_id, subject_id, date, started_at, finished_at, paused_at, duration_minutes, topic, notes, difficulty, focus, session_type, subject:subjects(name, color)')
      .eq('user_id', userId)
      .is('finished_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data?.[0] as any || null
  },
}

export const planApi = {
  list: async (userId: string, from?: string, to?: string) => {
    let query = supabase
      .from('plans')
      .select('id, user_id, subject_id, planned_date, task, estimated_minutes, priority, status, is_overdue, created_at, subject:subjects(name, color)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (from && to && from === to) {
      query = query.eq('planned_date', from)
    } else {
      if (from) query = query.gte('planned_date', from)
      if (to) query = query.lte('planned_date', to)
    }

    const { data, error } = await query
    if (error) throw error
    return data as Plan[]
  },

  create: async (plan: any) => {
    const { data, error } = await supabase
      .from('plans')
      .insert({
        user_id: plan.userId || plan.user_id,
        subject_id: plan.subjectId !== undefined ? plan.subjectId : plan.subject_id,
        planned_date: plan.plannedDate || plan.planned_date,
        task: plan.task,
        estimated_minutes: plan.estimatedMinutes !== undefined ? plan.estimatedMinutes : plan.estimated_minutes,
        priority: plan.priority,
        status: plan.status,
        is_overdue: plan.isOverdue !== undefined ? plan.isOverdue : plan.is_overdue,
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Plan
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('plans')
      .update({
        task: updates.task,
        subject_id: updates.subjectId !== undefined ? updates.subjectId : updates.subject_id,
        planned_date: updates.plannedDate || updates.planned_date,
        estimated_minutes: updates.estimatedMinutes !== undefined ? updates.estimatedMinutes : updates.estimated_minutes,
        priority: updates.priority,
        status: updates.status,
        is_overdue: updates.isOverdue !== undefined ? updates.isOverdue : updates.is_overdue,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Plan
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('plans').delete().eq('id', id)
    if (error) throw error
  },
}

export const reviewApi = {
  list: async (userId: string, status?: string) => {
    let query = supabase
      .from('reviews')
      .select('id, user_id, subject_id, session_id, topic, review_date, status, created_at, subject:subjects(name, color)')
      .eq('user_id', userId)
      .order('review_date', { ascending: true })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    return data as Review[]
  },

  create: async (review: any) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: review.userId || review.user_id,
        subject_id: review.subjectId || review.subject_id,
        session_id: review.sessionId !== undefined ? review.sessionId : review.session_id,
        topic: review.topic,
        review_date: review.reviewDate || review.review_date,
        status: review.status,
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Review
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        topic: updates.topic,
        review_date: updates.reviewDate || updates.review_date,
        status: updates.status,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Review
  },
}

export const goalApi = {
  list: async (userId: string) => {
    const { data, error } = await supabase
      .from('goals')
      .select('id, user_id, subject_id, type, target_minutes, period_start, period_end, is_active, created_at, subject:subjects(name, color)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('type')
    
    if (error) throw error
    return data as Goal[]
  },

  create: async (goal: any) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: goal.userId || goal.user_id,
        subject_id: goal.subjectId !== undefined ? goal.subjectId : goal.subject_id,
        type: goal.type,
        target_minutes: goal.targetMinutes !== undefined ? goal.targetMinutes : goal.target_minutes,
        period_start: goal.periodStart || goal.period_start,
        period_end: goal.periodEnd || goal.period_end,
        is_active: goal.isActive !== undefined ? goal.isActive : goal.is_active,
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Goal
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('goals')
      .update({
        subject_id: updates.subjectId !== undefined ? updates.subjectId : updates.subject_id,
        type: updates.type,
        target_minutes: updates.targetMinutes !== undefined ? updates.targetMinutes : updates.target_minutes,
        period_start: updates.periodStart || updates.period_start,
        period_end: updates.periodEnd || updates.period_end,
        is_active: updates.isActive !== undefined ? updates.isActive : updates.is_active,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Goal
  },
}