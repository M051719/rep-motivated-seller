export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  duration_minutes: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  price: number
  is_published: boolean
  featured: boolean
  instructor_name: string
  learning_objectives: string[]
  prerequisites: string[]
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  video_url?: string
  video_provider: string
  video_id?: string
  video_duration: number
  lesson_order: number
  transcript?: string
  resources: any[]
  quiz_questions: any[]
  is_preview: boolean
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lesson_id: string
  completed_at?: string
  watch_time: number
  completion_percentage: number
  last_watched_at?: string
  quiz_score?: number
  quiz_attempts: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  certificate_url?: string
  verification_code: string
  completion_percentage: number
  final_score?: number
}

export interface MailCampaign {
  id: string
  name: string
  description?: string
  template_url: string
  mailing_list_id?: string
  sent_count: number
  failed_count: number
  total_cost: number
  status: 'draft' | 'sending' | 'completed' | 'failed'
  created_at: string
  sent_at?: string
}