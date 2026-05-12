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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_admin_notes: {
        Row: {
          agent_id: string
          id: string
          notes: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          agent_id: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          agent_id?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      agent_analytics: {
        Row: {
          agent_id: string
          card_views: number | null
          contact_requests: number | null
          date: string
          id: string
          page_views: number | null
          profile_clicks: number | null
        }
        Insert: {
          agent_id: string
          card_views?: number | null
          contact_requests?: number | null
          date: string
          id?: string
          page_views?: number | null
          profile_clicks?: number | null
        }
        Update: {
          agent_id?: string
          card_views?: number | null
          contact_requests?: number | null
          date?: string
          id?: string
          page_views?: number | null
          profile_clicks?: number | null
        }
        Relationships: []
      }
      agent_gallery_images: {
        Row: {
          agent_id: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      agent_notifications: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          title: string
          type?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      agent_profiles: {
        Row: {
          approx_client_base: string | null
          bio: string | null
          career_highlights: string | null
          career_timeline: Json | null
          claims_amount: string | null
          claims_lead_amount: number | null
          claims_lead_charging: string | null
          claims_processed: string | null
          claims_settled: number | null
          company_name: string | null
          cover_page: string | null
          created_at: string | null
          declarations_accepted: boolean | null
          declarations_accepted_at: string | null
          facebook: string | null
          family_licenses: Json | null
          google_business_profile: string | null
          has_pos_license: boolean | null
          health_expertise: Json | null
          id: string
          instagram: string | null
          insurance_segments: string[] | null
          is_profile_approved: boolean | null
          languages: string[] | null
          license_number: string | null
          life_expertise: Json | null
          linkedin: string | null
          location: string | null
          motor_expertise: Json | null
          office_address: string | null
          office_pincode: string | null
          onboarded_by: string | null
          pending_changes: Json | null
          portfolio_lead_amount: number | null
          portfolio_lead_charging: string | null
          product_portfolio: Json | null
          response_time: string | null
          serviceable_cities: string[] | null
          show_achievements: boolean
          show_certificates: boolean
          show_claims_stats: boolean
          show_client_base: boolean
          show_comments: boolean
          show_contact_info: boolean
          show_experience: boolean
          show_full_profile: boolean
          show_gallery: boolean
          show_languages: boolean
          show_ratings: boolean
          show_social_links: boolean
          sme_expertise: Json | null
          specializations: string[] | null
          subscription_expires_at: string | null
          subscription_plan: string | null
          success_rate: string | null
          updated_at: string | null
          wants_claims_leads: boolean | null
          wants_portfolio_leads: boolean | null
          website: string | null
          years_experience: number | null
          youtube: string | null
        }
        Insert: {
          approx_client_base?: string | null
          bio?: string | null
          career_highlights?: string | null
          career_timeline?: Json | null
          claims_amount?: string | null
          claims_lead_amount?: number | null
          claims_lead_charging?: string | null
          claims_processed?: string | null
          claims_settled?: number | null
          company_name?: string | null
          cover_page?: string | null
          created_at?: string | null
          declarations_accepted?: boolean | null
          declarations_accepted_at?: string | null
          facebook?: string | null
          family_licenses?: Json | null
          google_business_profile?: string | null
          has_pos_license?: boolean | null
          health_expertise?: Json | null
          id: string
          instagram?: string | null
          insurance_segments?: string[] | null
          is_profile_approved?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          life_expertise?: Json | null
          linkedin?: string | null
          location?: string | null
          motor_expertise?: Json | null
          office_address?: string | null
          office_pincode?: string | null
          onboarded_by?: string | null
          pending_changes?: Json | null
          portfolio_lead_amount?: number | null
          portfolio_lead_charging?: string | null
          product_portfolio?: Json | null
          response_time?: string | null
          serviceable_cities?: string[] | null
          show_achievements?: boolean
          show_certificates?: boolean
          show_claims_stats?: boolean
          show_client_base?: boolean
          show_comments?: boolean
          show_contact_info?: boolean
          show_experience?: boolean
          show_full_profile?: boolean
          show_gallery?: boolean
          show_languages?: boolean
          show_ratings?: boolean
          show_social_links?: boolean
          sme_expertise?: Json | null
          specializations?: string[] | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          success_rate?: string | null
          updated_at?: string | null
          wants_claims_leads?: boolean | null
          wants_portfolio_leads?: boolean | null
          website?: string | null
          years_experience?: number | null
          youtube?: string | null
        }
        Update: {
          approx_client_base?: string | null
          bio?: string | null
          career_highlights?: string | null
          career_timeline?: Json | null
          claims_amount?: string | null
          claims_lead_amount?: number | null
          claims_lead_charging?: string | null
          claims_processed?: string | null
          claims_settled?: number | null
          company_name?: string | null
          cover_page?: string | null
          created_at?: string | null
          declarations_accepted?: boolean | null
          declarations_accepted_at?: string | null
          facebook?: string | null
          family_licenses?: Json | null
          google_business_profile?: string | null
          has_pos_license?: boolean | null
          health_expertise?: Json | null
          id?: string
          instagram?: string | null
          insurance_segments?: string[] | null
          is_profile_approved?: boolean | null
          languages?: string[] | null
          license_number?: string | null
          life_expertise?: Json | null
          linkedin?: string | null
          location?: string | null
          motor_expertise?: Json | null
          office_address?: string | null
          office_pincode?: string | null
          onboarded_by?: string | null
          pending_changes?: Json | null
          portfolio_lead_amount?: number | null
          portfolio_lead_charging?: string | null
          product_portfolio?: Json | null
          response_time?: string | null
          serviceable_cities?: string[] | null
          show_achievements?: boolean
          show_certificates?: boolean
          show_claims_stats?: boolean
          show_client_base?: boolean
          show_comments?: boolean
          show_contact_info?: boolean
          show_experience?: boolean
          show_full_profile?: boolean
          show_gallery?: boolean
          show_languages?: boolean
          show_ratings?: boolean
          show_social_links?: boolean
          sme_expertise?: Json | null
          specializations?: string[] | null
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          success_rate?: string | null
          updated_at?: string | null
          wants_claims_leads?: boolean | null
          wants_portfolio_leads?: boolean | null
          website?: string | null
          years_experience?: number | null
          youtube?: string | null
        }
        Relationships: []
      }
      agent_reviews: {
        Row: {
          agent_id: string
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          rating: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      agent_sensitive_details: {
        Row: {
          agent_id: string
          created_at: string
          pan_number: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          pan_number?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          pan_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      distributor_agents: {
        Row: {
          agent_id: string
          distributor_id: string
          id: string
          onboarded_at: string | null
          referral_code: string | null
          status: string | null
        }
        Insert: {
          agent_id: string
          distributor_id: string
          id?: string
          onboarded_at?: string | null
          referral_code?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string
          distributor_id?: string
          id?: string
          onboarded_at?: string | null
          referral_code?: string | null
          status?: string | null
        }
        Relationships: []
      }
      distributor_profiles: {
        Row: {
          commission_rate: number | null
          company_name: string | null
          created_at: string | null
          id: string
          region: string | null
          target_agents: number | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string | null
          id: string
          region?: string | null
          target_agents?: number | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          region?: string | null
          target_agents?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          agent_id: string
          created_at: string | null
          email: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          product_interest: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          product_interest?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          product_interest?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          residence_address: string | null
          residence_pincode: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          phone?: string | null
          residence_address?: string | null
          residence_pincode?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          residence_address?: string | null
          residence_pincode?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      renewal_reminders: {
        Row: {
          agent_id: string
          distributor_id: string
          id: string
          reminder_type: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          agent_id: string
          distributor_id: string
          id?: string
          reminder_type: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string
          distributor_id?: string
          id?: string
          reminder_type?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      review_verification_data: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          reviewer_mobile: string | null
          reviewer_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          reviewer_mobile?: string | null
          reviewer_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          reviewer_mobile?: string | null
          reviewer_name?: string | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
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
    }
    Views: {
      public_agent_info: {
        Row: {
          approx_client_base: string | null
          avatar_url: string | null
          bio: string | null
          claims_amount: string | null
          claims_processed: string | null
          claims_settled: number | null
          company_name: string | null
          cover_page: string | null
          full_name: string | null
          id: string | null
          insurance_segments: string[] | null
          is_profile_approved: boolean | null
          languages: string[] | null
          license_number: string | null
          location: string | null
          product_portfolio: Json | null
          response_time: string | null
          serviceable_cities: string[] | null
          show_contact_info: boolean | null
          specializations: string[] | null
          subscription_plan: string | null
          success_rate: string | null
          wants_claims_leads: boolean | null
          wants_portfolio_leads: boolean | null
          years_experience: number | null
        }
        Relationships: []
      }
      public_agent_reviews: {
        Row: {
          agent_id: string | null
          comment: string | null
          created_at: string | null
          id: string | null
          is_approved: boolean | null
          rating: number | null
        }
        Insert: {
          agent_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          is_approved?: boolean | null
          rating?: number | null
        }
        Update: {
          agent_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string | null
          is_approved?: boolean | null
          rating?: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          display_name: string | null
          full_name: string | null
          id: string | null
          is_verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          display_name?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: boolean | null
        }
        Relationships: []
      }
      user_activity_safe: {
        Row: {
          action_type: string | null
          created_at: string | null
          id: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_type?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string | null
          created_at?: string | null
          id?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_lead_rate_limit: {
        Args: { p_agent_id: string; p_user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
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
      app_role: "user" | "agent" | "distributor" | "admin"
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
      app_role: ["user", "agent", "distributor", "admin"],
    },
  },
} as const
