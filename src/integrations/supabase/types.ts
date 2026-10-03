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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cms_articles: {
        Row: {
          body: string | null
          category: string
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          reading_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          reading_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          reading_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_brands: {
        Row: {
          created_at: string
          featured: boolean
          id: string
          name: string
          note: string | null
          published: boolean
          sector: string
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          featured?: boolean
          id?: string
          name: string
          note?: string | null
          published?: boolean
          sector?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          featured?: boolean
          id?: string
          name?: string
          note?: string | null
          published?: boolean
          sector?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      cms_careers: {
        Row: {
          created_at: string
          detail: string
          employment_type: string
          id: string
          location: string
          published: boolean
          requirements: string[]
          responsibilities: string[]
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detail?: string
          employment_type?: string
          id?: string
          location?: string
          published?: boolean
          requirements?: string[]
          responsibilities?: string[]
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detail?: string
          employment_type?: string
          id?: string
          location?: string
          published?: boolean
          requirements?: string[]
          responsibilities?: string[]
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_case_studies: {
        Row: {
          approach: string[]
          brief: string | null
          challenge: string
          client: string
          created_at: string
          deliverables: string[]
          engagement_period: string | null
          execution: string | null
          headline: string
          id: string
          metrics: Json
          outcome_narrative: string | null
          published: boolean
          results: string[]
          sector: string
          services: string[]
          slug: string
          sort_order: number
          strategy: string | null
          summary: string
          testimonial: string | null
          testimonial_author: string | null
          updated_at: string
        }
        Insert: {
          approach?: string[]
          brief?: string | null
          challenge?: string
          client: string
          created_at?: string
          deliverables?: string[]
          engagement_period?: string | null
          execution?: string | null
          headline?: string
          id?: string
          metrics?: Json
          outcome_narrative?: string | null
          published?: boolean
          results?: string[]
          sector?: string
          services?: string[]
          slug: string
          sort_order?: number
          strategy?: string | null
          summary?: string
          testimonial?: string | null
          testimonial_author?: string | null
          updated_at?: string
        }
        Update: {
          approach?: string[]
          brief?: string | null
          challenge?: string
          client?: string
          created_at?: string
          deliverables?: string[]
          engagement_period?: string | null
          execution?: string | null
          headline?: string
          id?: string
          metrics?: Json
          outcome_narrative?: string | null
          published?: boolean
          results?: string[]
          sector?: string
          services?: string[]
          slug?: string
          sort_order?: number
          strategy?: string | null
          summary?: string
          testimonial?: string | null
          testimonial_author?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cms_pricing_addons: {
        Row: {
          created_at: string
          id: string
          name: string
          price: string
          published: boolean
          scope: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price?: string
          published?: boolean
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: string
          published?: boolean
          scope?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cms_pricing_bouquets: {
        Row: {
          audience: string
          cadence: string
          created_at: string
          featured: boolean
          highlights: string[]
          id: string
          name: string
          price: string
          published: boolean
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          audience?: string
          cadence?: string
          created_at?: string
          featured?: boolean
          highlights?: string[]
          id?: string
          name: string
          price?: string
          published?: boolean
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          audience?: string
          cadence?: string
          created_at?: string
          featured?: boolean
          highlights?: string[]
          id?: string
          name?: string
          price?: string
          published?: boolean
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          interest: string | null
          message: string
          name: string
          organisation: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          message: string
          name: string
          organisation?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          message?: string
          name?: string
          organisation?: string | null
          status?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          api_key: string | null
          base_url: string | null
          category: string
          config: Json
          created_at: string
          enabled: boolean
          id: string
          last_test_message: string | null
          last_test_status: string | null
          last_tested_at: string | null
          notes: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          base_url?: string | null
          category?: string
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          last_test_message?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          notes?: string | null
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          base_url?: string | null
          category?: string
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          last_test_message?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          notes?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      intelligence_projects: {
        Row: {
          client_name: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          markets: string[]
          name: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          client_name: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          markets?: string[]
          name: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          markets?: string[]
          name?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      intelligence_reports: {
        Row: {
          created_at: string
          created_by: string | null
          file_url: string | null
          id: string
          period_end: string | null
          period_start: string | null
          project_id: string
          report_type: string
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          project_id: string
          report_type?: string
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_url?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string
          report_type?: string
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "intelligence_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_ai_settings: {
        Row: {
          id: string
          instructions: string | null
          model: string
          project_id: string
          tone: string
          updated_at: string
        }
        Insert: {
          id?: string
          instructions?: string | null
          model?: string
          project_id: string
          tone?: string
          updated_at?: string
        }
        Update: {
          id?: string
          instructions?: string | null
          model?: string
          project_id?: string
          tone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_ai_settings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "intelligence_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_alerts: {
        Row: {
          created_at: string
          detected_at: string
          id: string
          project_id: string
          recommended_action: string | null
          severity: string
          status: string
          title: string
          what_changed: string | null
          what_happened: string | null
          why_it_matters: string | null
        }
        Insert: {
          created_at?: string
          detected_at?: string
          id?: string
          project_id: string
          recommended_action?: string | null
          severity?: string
          status?: string
          title: string
          what_changed?: string | null
          what_happened?: string | null
          why_it_matters?: string | null
        }
        Update: {
          created_at?: string
          detected_at?: string
          id?: string
          project_id?: string
          recommended_action?: string | null
          severity?: string
          status?: string
          title?: string
          what_changed?: string | null
          what_happened?: string | null
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "intelligence_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_competitors: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          notes: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          notes?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_competitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "intelligence_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_keywords: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          keyword: string
          match_type: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          keyword: string
          match_type?: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          keyword?: string
          match_type?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_keywords_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "intelligence_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sources: {
        Row: {
          created_at: string
          endpoint: string | null
          id: string
          is_connected: boolean
          name: string
          project_id: string
          source_type: string
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          id?: string
          is_connected?: boolean
          name: string
          project_id: string
          source_type?: string
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          id?: string
          is_connected?: boolean
          name?: string
          project_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_sources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "intelligence_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      user_roles_write_admin: {
        Args: { _email: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "analyst" | "viewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "analyst", "viewer"],
    },
  },
} as const
