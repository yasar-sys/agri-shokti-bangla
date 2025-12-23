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
      agriculture_contacts: {
        Row: {
          address: string | null
          created_at: string
          district: string
          division: string
          email: string | null
          id: string
          office_name: string
          officer_name: string | null
          phone: string
          upazila: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          district: string
          division: string
          email?: string | null
          id?: string
          office_name: string
          officer_name?: string | null
          phone: string
          upazila: string
        }
        Update: {
          address?: string | null
          created_at?: string
          district?: string
          division?: string
          email?: string | null
          id?: string
          office_name?: string
          officer_name?: string | null
          phone?: string
          upazila?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      farming_tips: {
        Row: {
          category: string | null
          created_at: string
          crop_type: string | null
          display_date: string | null
          id: string
          is_active: boolean | null
          season: string | null
          tip_text: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          crop_type?: string | null
          display_date?: string | null
          id?: string
          is_active?: boolean | null
          season?: string | null
          tip_text: string
        }
        Update: {
          category?: string | null
          created_at?: string
          crop_type?: string | null
          display_date?: string | null
          id?: string
          is_active?: boolean | null
          season?: string | null
          tip_text?: string
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
      government_schemes: {
        Row: {
          application_link: string | null
          benefits: string | null
          category: string | null
          contact_phone: string | null
          created_at: string
          deadline: string | null
          description: string
          eligibility: string | null
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          application_link?: string | null
          benefits?: string | null
          category?: string | null
          contact_phone?: string | null
          created_at?: string
          deadline?: string | null
          description: string
          eligibility?: string | null
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          application_link?: string | null
          benefits?: string | null
          category?: string | null
          contact_phone?: string | null
          created_at?: string
          deadline?: string | null
          description?: string
          eligibility?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
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
      market_prices: {
        Row: {
          confidence: number | null
          created_at: string
          crop_emoji: string | null
          crop_name: string
          forecast: string | null
          forecast_price: number | null
          id: string
          market_location: string | null
          today_price: number
          unit: string | null
          updated_at: string
          weekly_avg: number | null
          yesterday_price: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          crop_emoji?: string | null
          crop_name: string
          forecast?: string | null
          forecast_price?: number | null
          id?: string
          market_location?: string | null
          today_price: number
          unit?: string | null
          updated_at?: string
          weekly_avg?: number | null
          yesterday_price: number
        }
        Update: {
          confidence?: number | null
          created_at?: string
          crop_emoji?: string | null
          crop_name?: string
          forecast?: string | null
          forecast_price?: number | null
          id?: string
          market_location?: string | null
          today_price?: number
          unit?: string | null
          updated_at?: string
          weekly_avg?: number | null
          yesterday_price?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          is_expert_reply: boolean | null
          post_id: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_expert_reply?: boolean | null
          post_id: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_expert_reply?: boolean | null
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
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
      user_achievements: {
        Row: {
          achievement_name: string
          achievement_type: string
          description: string | null
          earned_at: string
          id: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          achievement_name: string
          achievement_type: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          achievement_name?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      user_calendar_events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string
          event_type: string
          id: string
          location: string | null
          reminder: boolean | null
          title: string
          title_bn: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string
          event_type?: string
          id?: string
          location?: string | null
          reminder?: boolean | null
          title: string
          title_bn: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          event_type?: string
          id?: string
          location?: string | null
          reminder?: boolean | null
          title?: string
          title_bn?: string
          updated_at?: string
          user_id?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          language: string
          phone_number: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          phone_number?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          phone_number?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          advice: string | null
          alert_type: string
          created_at: string
          id: string
          is_active: boolean | null
          message: string
          region: string | null
          severity: string | null
          title: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          advice?: string | null
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          message: string
          region?: string | null
          severity?: string | null
          title: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          advice?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          message?: string
          region?: string | null
          severity?: string | null
          title?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_disease_trends: {
        Args: never
        Returns: {
          case_count: number
          disease: string
          latest_date: string
        }[]
      }
      get_engagement_stats: {
        Args: never
        Returns: {
          active_users_today: number
          active_users_week: number
          total_chat_messages: number
          total_posts: number
          total_scans: number
          total_users: number
        }[]
      }
      get_feature_stats: {
        Args: never
        Returns: {
          feature_name: string
          unique_users: number
          usage_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
