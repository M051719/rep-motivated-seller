export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          duration_minutes: number | null
          difficulty_level: string | null
          category: string
          price: number | null
          is_published: boolean | null
          featured: boolean | null
          instructor_name: string | null
          learning_objectives: string[] | null
          prerequisites: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          thumbnail_url?: string | null
          duration_minutes?: number | null
          difficulty_level?: string | null
          category: string
          price?: number | null
          is_published?: boolean | null
          featured?: boolean | null
          instructor_name?: string | null
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          duration_minutes?: number | null
          difficulty_level?: string | null
          category?: string
          price?: number | null
          is_published?: boolean | null
          featured?: boolean | null
          instructor_name?: string | null
          learning_objectives?: string[] | null
          prerequisites?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types here...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}