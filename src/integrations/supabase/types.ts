export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          awarded_on: string;
          created_at: string;
          description: string | null;
          file_url: string | null;
          id: string;
          kind: string;
          student_id: string;
          title: string;
        };
        Insert: {
          awarded_on?: string;
          created_at?: string;
          description?: string | null;
          file_url?: string | null;
          id?: string;
          kind?: string;
          student_id: string;
          title: string;
        };
        Update: {
          awarded_on?: string;
          created_at?: string;
          description?: string | null;
          file_url?: string | null;
          id?: string;
          kind?: string;
          student_id?: string;
          title?: string;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          audience: string;
          body: string;
          created_at: string;
          created_by: string | null;
          id: string;
          title: string;
        };
        Insert: {
          audience?: string;
          body: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          title: string;
        };
        Update: {
          audience?: string;
          body?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          title?: string;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          batch_id: string | null;
          created_at: string;
          id: string;
          marked_by: string | null;
          session_date: string;
          status: string;
          student_id: string;
        };
        Insert: {
          batch_id?: string | null;
          created_at?: string;
          id?: string;
          marked_by?: string | null;
          session_date?: string;
          status?: string;
          student_id: string;
        };
        Update: {
          batch_id?: string | null;
          created_at?: string;
          id?: string;
          marked_by?: string | null;
          session_date?: string;
          status?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "batch_schedules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      batch_schedules: {
        Row: {
          active: boolean;
          age_group: string;
          batch_name: string;
          coach_id: string | null;
          created_at: string;
          days: string;
          display_order: number;
          end_time: string;
          id: string;
          location: string | null;
          monthly_fee: number | null;
          notes: string | null;
          start_time: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          age_group: string;
          batch_name: string;
          coach_id?: string | null;
          created_at?: string;
          days: string;
          display_order?: number;
          end_time: string;
          id?: string;
          location?: string | null;
          monthly_fee?: number | null;
          notes?: string | null;
          start_time: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          age_group?: string;
          batch_name?: string;
          coach_id?: string | null;
          created_at?: string;
          days?: string;
          display_order?: number;
          end_time?: string;
          id?: string;
          location?: string | null;
          monthly_fee?: number | null;
          notes?: string | null;
          start_time?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "batch_schedules_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "coaches";
            referencedColumns: ["id"];
          },
        ];
      };
      coaches: {
        Row: {
          active: boolean;
          bio: string | null;
          certifications: string | null;
          created_at: string;
          display_order: number;
          experience_years: number | null;
          id: string;
          name: string;
          photo_url: string | null;
          role: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          active?: boolean;
          bio?: string | null;
          certifications?: string | null;
          created_at?: string;
          display_order?: number;
          experience_years?: number | null;
          id?: string;
          name: string;
          photo_url?: string | null;
          role: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          active?: boolean;
          bio?: string | null;
          certifications?: string | null;
          created_at?: string;
          display_order?: number;
          experience_years?: number | null;
          id?: string;
          name?: string;
          photo_url?: string | null;
          role?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      fee_payments: {
        Row: {
          amount: number;
          created_at: string;
          fee_month: string;
          id: string;
          method: string | null;
          notes: string | null;
          paid_on: string;
          recorded_by: string | null;
          student_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          fee_month: string;
          id?: string;
          method?: string | null;
          notes?: string | null;
          paid_on?: string;
          recorded_by?: string | null;
          student_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          fee_month?: string;
          id?: string;
          method?: string | null;
          notes?: string | null;
          paid_on?: string;
          recorded_by?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      match_performances: {
        Row: {
          balls_faced: number | null;
          batting_runs: number | null;
          catches: number | null;
          created_at: string;
          dismissal: string | null;
          fours: number | null;
          id: string;
          match_id: string;
          notes: string | null;
          overs_bowled: number | null;
          runs_conceded: number | null;
          sixes: number | null;
          student_id: string;
          wickets: number | null;
        };
        Insert: {
          balls_faced?: number | null;
          batting_runs?: number | null;
          catches?: number | null;
          created_at?: string;
          dismissal?: string | null;
          fours?: number | null;
          id?: string;
          match_id: string;
          notes?: string | null;
          overs_bowled?: number | null;
          runs_conceded?: number | null;
          sixes?: number | null;
          student_id: string;
          wickets?: number | null;
        };
        Update: {
          balls_faced?: number | null;
          batting_runs?: number | null;
          catches?: number | null;
          created_at?: string;
          dismissal?: string | null;
          fours?: number | null;
          id?: string;
          match_id?: string;
          notes?: string | null;
          overs_bowled?: number | null;
          runs_conceded?: number | null;
          sixes?: number | null;
          student_id?: string;
          wickets?: number | null;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          batch_id: string | null;
          created_at: string;
          created_by: string | null;
          format: string;
          id: string;
          location: string | null;
          match_date: string;
          notes: string | null;
          opponent: string | null;
          start_time: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          batch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          format?: string;
          id?: string;
          location?: string | null;
          match_date: string;
          notes?: string | null;
          opponent?: string | null;
          start_time?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          batch_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          format?: string;
          id?: string;
          location?: string | null;
          match_date?: string;
          notes?: string | null;
          opponent?: string | null;
          start_time?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          read_at: string | null;
          recipient_student_id: string;
          sender_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          recipient_student_id: string;
          sender_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          recipient_student_id?: string;
          sender_id?: string;
        };
        Relationships: [];
      };
      performance_notes: {
        Row: {
          coach_id: string | null;
          created_at: string;
          id: string;
          rating: number | null;
          remarks: string | null;
          student_id: string;
        };
        Insert: {
          coach_id?: string | null;
          created_at?: string;
          id?: string;
          rating?: number | null;
          remarks?: string | null;
          student_id: string;
        };
        Update: {
          coach_id?: string | null;
          created_at?: string;
          id?: string;
          rating?: number | null;
          remarks?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performance_notes_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "coaches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "performance_notes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          address: string | null;
          age: number | null;
          age_group: string | null;
          blood_group: string | null;
          created_at: string;
          dob: string | null;
          email: string | null;
          emergency_contact: string | null;
          full_name: string;
          id: string;
          medical_info: string | null;
          parent_name: string | null;
          phone: string | null;
          playing_role: string | null;
          preferred_batch: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          age?: number | null;
          age_group?: string | null;
          blood_group?: string | null;
          created_at?: string;
          dob?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          full_name?: string;
          id: string;
          medical_info?: string | null;
          parent_name?: string | null;
          phone?: string | null;
          playing_role?: string | null;
          preferred_batch?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          age?: number | null;
          age_group?: string | null;
          blood_group?: string | null;
          created_at?: string;
          dob?: string | null;
          email?: string | null;
          emergency_contact?: string | null;
          full_name?: string;
          id?: string;
          medical_info?: string | null;
          parent_name?: string | null;
          phone?: string | null;
          playing_role?: string | null;
          preferred_batch?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      resources: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          kind: string;
          title: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          kind?: string;
          title: string;
          url: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          kind?: string;
          title?: string;
          url?: string;
        };
        Relationships: [];
      };
      student_documents: {
        Row: {
          doc_type: string;
          file_name: string;
          file_path: string;
          id: string;
          uploaded_at: string;
          user_id: string;
        };
        Insert: {
          doc_type: string;
          file_name: string;
          file_path: string;
          id?: string;
          uploaded_at?: string;
          user_id: string;
        };
        Update: {
          doc_type?: string;
          file_name?: string;
          file_path?: string;
          id?: string;
          uploaded_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      students: {
        Row: {
          active: boolean;
          age: number | null;
          batch_id: string | null;
          created_at: string;
          email: string | null;
          id: string;
          joined_on: string;
          monthly_fee: number | null;
          name: string;
          notes: string | null;
          parent_name: string | null;
          phone: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          active?: boolean;
          age?: number | null;
          batch_id?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          joined_on?: string;
          monthly_fee?: number | null;
          name: string;
          notes?: string | null;
          parent_name?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          active?: boolean;
          age?: number | null;
          batch_id?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          joined_on?: string;
          monthly_fee?: number | null;
          name?: string;
          notes?: string | null;
          parent_name?: string | null;
          phone?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "batch_schedules";
            referencedColumns: ["id"];
          },
        ];
      };
      trial_bookings: {
        Row: {
          age: number;
          created_at: string;
          email: string;
          id: string;
          parent_name: string;
          phone: string;
          preferred_batch: string;
          status: string;
          student_name: string;
          trial_date: string;
          user_id: string;
        };
        Insert: {
          age: number;
          created_at?: string;
          email: string;
          id?: string;
          parent_name: string;
          phone: string;
          preferred_batch: string;
          status?: string;
          student_name: string;
          trial_date: string;
          user_id: string;
        };
        Update: {
          age?: number;
          created_at?: string;
          email?: string;
          id?: string;
          parent_name?: string;
          phone?: string;
          preferred_batch?: string;
          status?: string;
          student_name?: string;
          trial_date?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "student" | "coach";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student", "coach"],
    },
  },
} as const;
