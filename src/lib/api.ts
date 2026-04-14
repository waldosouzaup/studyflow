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
      .select('*')
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
        user_id: subject.userId,
        name: subject.name,
        color: subject.color,
        weekly_goal_hours: subject.weeklyGoalHours,
        monthly_goal_hours: subject.monthlyGoalHours,
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
        weekly_goal_hours: updates.weeklyGoalHours,
        monthly_goal_hours: updates.monthlyGoalHours,
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
      .select('*, subject:subjects(name, color)')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)
    if (subjectId) query = query.eq('subject_id', subjectId)

    const { data, error } = await query
    if (error) throw error
    return data as any[]
  },

  create: async (session: any) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: session.userId,
        subject_id: session.subjectId,
        date: session.date,
        started_at: session.startedAt,
        finished_at: session.finishedAt,
        paused_at: session.pausedAt,
        duration_minutes: session.durationMinutes,
        topic: session.topic,
        notes: session.notes,
        difficulty: session.difficulty,
        focus: session.focus,
        session_type: session.sessionType,
        is_offline_sync: session.isOfflineSync,
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
        finished_at: updates.finishedAt,
        paused_at: updates.pausedAt,
        duration_minutes: updates.durationMinutes,
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
      .select('*, subject:subjects(name, color)')
      .eq('user_id', userId)
      .is('finished_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data?.[0] as any || null
  },
}

export const planApi = {
  list: async (userId: string, date?: string) => {
    let query = supabase
      .from('plans')
      .select('*, subject:subjects(name, color)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (date) query = query.eq('planned_date', date)

    const { data, error } = await query
    if (error) throw error
    return data as Plan[]
  },

  create: async (plan: any) => {
    const { data, error } = await supabase
      .from('plans')
      .insert({
        user_id: plan.userId,
        subject_id: plan.subjectId,
        planned_date: plan.plannedDate,
        task: plan.task,
        estimated_minutes: plan.estimatedMinutes,
        priority: plan.priority,
        status: plan.status,
        is_overdue: plan.isOverdue,
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
        subject_id: updates.subjectId,
        planned_date: updates.plannedDate,
        estimated_minutes: updates.estimatedMinutes,
        priority: updates.priority,
        status: updates.status,
        is_overdue: updates.isOverdue,
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
      .select('*, subject:subjects(name, color)')
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
        user_id: review.userId,
        subject_id: review.subjectId,
        session_id: review.sessionId,
        topic: review.topic,
        review_date: review.reviewDate,
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
        review_date: updates.reviewDate,
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
      .select('*, subject:subjects(name, color)')
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
        user_id: goal.userId,
        subject_id: goal.subjectId,
        type: goal.type,
        target_minutes: goal.targetMinutes,
        period_start: goal.periodStart,
        period_end: goal.periodEnd,
        is_active: goal.isActive,
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
        subject_id: updates.subjectId,
        type: updates.type,
        target_minutes: updates.targetMinutes,
        period_start: updates.periodStart,
        period_end: updates.periodEnd,
        is_active: updates.isActive,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Goal
  },
}