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
      applications: {
        Row: {
          coordinator_note: string | null
          created_at: string
          id: string
          motivation: string
          project_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          coordinator_note?: string | null
          created_at?: string
          id?: string
          motivation?: string
          project_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          coordinator_note?: string | null
          created_at?: string
          id?: string
          motivation?: string
          project_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          coordinator_statement: string | null
          end_date: string | null
          id: string
          issued_at: string
          issued_by: string | null
          org_id: string
          org_name: string
          project_id: string
          project_title: string
          responsibilities: string[]
          role_title: string
          skills: string[]
          start_date: string | null
          status: string
          total_hours: number
          verification_code: string
          volunteer_id: string
          volunteer_name: string
        }
        Insert: {
          coordinator_statement?: string | null
          end_date?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          org_id: string
          org_name: string
          project_id: string
          project_title: string
          responsibilities?: string[]
          role_title?: string
          skills?: string[]
          start_date?: string | null
          status?: string
          total_hours?: number
          verification_code: string
          volunteer_id: string
          volunteer_name: string
        }
        Update: {
          coordinator_statement?: string | null
          end_date?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          org_id?: string
          org_name?: string
          project_id?: string
          project_title?: string
          responsibilities?: string[]
          role_title?: string
          skills?: string[]
          start_date?: string | null
          status?: string
          total_hours?: number
          verification_code?: string
          volunteer_id?: string
          volunteer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      endorsements: {
        Row: {
          created_at: string
          endorser_id: string
          id: string
          message: string
          project_id: string | null
          relationship: string | null
          skill: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          endorser_id: string
          id?: string
          message: string
          project_id?: string | null
          relationship?: string | null
          skill?: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          endorser_id?: string
          id?: string
          message?: string
          project_id?: string | null
          relationship?: string | null
          skill?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "endorsements_endorser_id_fkey"
            columns: ["endorser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "endorsements_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_sample: boolean
          location: string | null
          name: string
          owner_id: string | null
          verification_requested: boolean
          verified: boolean
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_sample?: boolean
          location?: string | null
          name: string
          owner_id?: string | null
          verification_requested?: boolean
          verified?: boolean
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_sample?: boolean
          location?: string | null
          name?: string
          owner_id?: string | null
          verification_requested?: boolean
          verified?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string
          education: string | null
          full_name: string
          headline: string | null
          id: string
          interests: string[]
          is_suspended: boolean
          location: string | null
          skills: string[]
          updated_at: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          education?: string | null
          full_name?: string
          headline?: string | null
          id: string
          interests?: string[]
          is_suspended?: boolean
          location?: string | null
          skills?: string[]
          updated_at?: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          education?: string | null
          full_name?: string
          headline?: string | null
          id?: string
          interests?: string[]
          is_suspended?: boolean
          location?: string | null
          skills?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          beneficiaries_reached: number
          beneficiaries_target: number
          category: string
          commitment: string | null
          created_at: string
          description: string
          duration_text: string
          end_date: string | null
          id: string
          is_sample: boolean
          location: string
          org_id: string
          required_skills: string[]
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          summary: string
          title: string
          updated_at: string
          volunteers_needed: number
        }
        Insert: {
          beneficiaries_reached?: number
          beneficiaries_target?: number
          category?: string
          commitment?: string | null
          created_at?: string
          description?: string
          duration_text?: string
          end_date?: string | null
          id?: string
          is_sample?: boolean
          location?: string
          org_id: string
          required_skills?: string[]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          title: string
          updated_at?: string
          volunteers_needed?: number
        }
        Update: {
          beneficiaries_reached?: number
          beneficiaries_target?: number
          category?: string
          commitment?: string | null
          created_at?: string
          description?: string
          duration_text?: string
          end_date?: string | null
          id?: string
          is_sample?: boolean
          location?: string
          org_id?: string
          required_skills?: string[]
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          title?: string
          updated_at?: string
          volunteers_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          project_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["request_status"]
          supervisor_id: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          project_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          supervisor_id: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          project_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          supervisor_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_requests_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string
          completed_at: string | null
          completion_note: string | null
          created_at: string
          description: string | null
          due_date: string | null
          hours: number
          id: string
          project_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          verified_at: string | null
        }
        Insert: {
          assignee_id: string
          completed_at?: string | null
          completion_note?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          hours?: number
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          verified_at?: string | null
        }
        Update: {
          assignee_id?: string
          completed_at?: string | null
          completion_note?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          hours?: number
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      coordinates_project: { Args: { _project: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      issue_certificate: {
        Args: { _application: string; _role_title: string; _statement: string }
        Returns: string
      }
      notify: {
        Args: { _body: string; _link: string; _title: string; _user: string }
        Returns: undefined
      }
      owns_org: { Args: { _org: string }; Returns: boolean }
      platform_stats: { Args: never; Returns: Json }
      public_certificates: {
        Args: { _volunteer: string }
        Returns: {
          issued_at: string
          org_name: string
          project_title: string
          role_title: string
          total_hours: number
          verification_code: string
        }[]
      }
      verify_certificate: {
        Args: { _code: string }
        Returns: {
          coordinator_statement: string
          end_date: string
          issued_at: string
          org_name: string
          org_verified: boolean
          project_title: string
          responsibilities: string[]
          role_title: string
          skills: string[]
          start_date: string
          total_hours: number
          verification_code: string
          volunteer_id: string
          volunteer_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "coordinator" | "volunteer"
      application_status: "pending" | "accepted" | "rejected"
      project_status: "draft" | "open" | "in_progress" | "completed"
      request_status: "pending" | "completed" | "declined"
      task_status: "todo" | "completed" | "verified"
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
      app_role: ["admin", "coordinator", "volunteer"],
      application_status: ["pending", "accepted", "rejected"],
      project_status: ["draft", "open", "in_progress", "completed"],
      request_status: ["pending", "completed", "declined"],
      task_status: ["todo", "completed", "verified"],
    },
  },
} as const
