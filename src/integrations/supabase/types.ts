export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender: string
          session_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender?: string
          session_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_location: string | null
          author_name: string
          comments_count: number | null
          content: string
          created_at: string
          crop_type: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          likes_count: number | null
          post_type: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          author_location?: string | null
          author_name: string
          comments_count?: number | null
          content: string
          created_at?: string
          crop_type?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          likes_count?: number | null
          post_type?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          author_location?: string | null
          author_name?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          crop_type?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          likes_count?: number | null
          post_type?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      forum_answers: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          is_accepted: boolean | null
          is_ai_answer: boolean | null
          is_expert_answer: boolean | null
          likes_count: number | null
          question_id: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_ai_answer?: boolean | null
          is_expert_answer?: boolean | null
          likes_count?: number | null
          question_id: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_ai_answer?: boolean | null
          is_expert_answer?: boolean | null
          likes_count?: number | null
          question_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "forum_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_questions: {
        Row: {
          ai_suggested_answer: string | null
          answers_count: number | null
          author_name: string
          category: string
          content: string
          created_at: string
          id: string
          is_ai_moderated: boolean | null
          is_answered: boolean | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          ai_suggested_answer?: string | null
          answers_count?: number | null
          author_name: string
          category?: string
          content: string
          created_at?: string
          id?: string
          is_ai_moderated?: boolean | null
          is_answered?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          ai_suggested_answer?: string | null
          answers_count?: number | null
          author_name?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_ai_moderated?: boolean | null
          is_answered?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          crop_type: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          metadata: Json | null
          region: string | null
          season: string | null
          source: string | null
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          crop_type?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          region?: string | null
          season?: string | null
          source?: string | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          crop_type?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          region?: string | null
          season?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      local_experts: {
        Row: {
          created_at: string
          experience_years: number | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          location: string
          name: string
          phone: string | null
          rating: number | null
          specialization: string[] | null
          total_consultations: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          location: string
          name: string
          phone?: string | null
          rating?: number | null
          specialization?: string[] | null
          total_consultations?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          experience_years?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          location?: string
          name?: string
          phone?: string | null
          rating?: number | null
          specialization?: string[] | null
          total_consultations?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blood_group: string | null
          created_at: string | null
          days_active: number | null
          diseases_detected: number | null
          full_name: string | null
          id: string
          nationality: string | null
          phone: string | null
          rank: string | null
          total_scans: number | null
          updated_at: string | null
          user_id: string
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          blood_group?: string | null
          created_at?: string | null
          days_active?: number | null
          diseases_detected?: number | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          rank?: string | null
          total_scans?: number | null
          updated_at?: string | null
          user_id: string
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          blood_group?: string | null
          created_at?: string | null
          days_active?: number | null
          diseases_detected?: number | null
          full_name?: string | null
          id?: string
          nationality?: string | null
          phone?: string | null
          rank?: string | null
          total_scans?: number | null
          updated_at?: string | null
          user_id?: string
          xp_points?: number | null
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          created_at: string
          disease_name: string | null
          fertilizer_advice: string | null
          health_score: number | null
          id: string
          image_url: string | null
          session_id: string
          symptoms: string[] | null
          treatment: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          disease_name?: string | null
          fertilizer_advice?: string | null
          health_score?: number | null
          id?: string
          image_url?: string | null
          session_id?: string
          symptoms?: string[] | null
          treatment?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          disease_name?: string | null
          fertilizer_advice?: string | null
          health_score?: number | null
          id?: string
          image_url?: string | null
          session_id?: string
          symptoms?: string[] | null
          treatment?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_calendars: {
        Row: {
          created_at: string | null
          crop_name: string
          id: string
          land_size: number
          tasks: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          id?: string
          land_size: number
          tasks: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          id?: string
          land_size?: number
          tasks?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_lands: {
        Row: {
          created_at: string | null
          id: string
          is_registered: boolean | null
          land_name: string
          land_size: number
          land_type: string | null
          location: string | null
          registry_number: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_registered?: boolean | null
          land_name: string
          land_size: number
          land_type?: string | null
          location?: string | null
          registry_number?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_registered?: boolean | null
          land_name?: string
          land_size?: number
          land_type?: string | null
          location?: string | null
          registry_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
