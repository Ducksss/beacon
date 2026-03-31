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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      broadcasts: {
        Row: {
          category_id: string | null
          content: string | null
          created_at: string
          id: string
          media_url: string | null
        }
        Insert: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
        }
        Update: {
          category_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          media_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      playground_rate_limits: {
        Row: {
          created_at: string
          deliveries: number
          identifier: string
          reset_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deliveries?: number
          identifier: string
          reset_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deliveries?: number
          identifier?: string
          reset_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      houses: {
        Row: {
          chat_id: number
          created_at: string
          status: string
          title: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          status?: string
          title: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          id: string
          option_index: number
          poll_id: string | null
          text: string
        }
        Insert: {
          id?: string
          option_index: number
          poll_id?: string | null
          text: string
        }
        Update: {
          id?: string
          option_index?: number
          poll_id?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          broadcast_id: string | null
          created_at: string
          id: string
          question: string
        }
        Insert: {
          broadcast_id?: string | null
          created_at?: string
          id?: string
          question: string
        }
        Update: {
          broadcast_id?: string | null
          created_at?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_messages: {
        Row: {
          broadcast_id: string | null
          chat_id: number | null
          id: string
          message_id: number
        }
        Insert: {
          broadcast_id?: string | null
          chat_id?: number | null
          id?: string
          message_id: number
        }
        Update: {
          broadcast_id?: string | null
          chat_id?: number | null
          id?: string
          message_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "telegram_messages_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telegram_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["chat_id"]
          },
        ]
      }
      telegram_polls: {
        Row: {
          chat_id: number | null
          master_poll_id: string | null
          message_id: number
          telegram_poll_id: string
        }
        Insert: {
          chat_id?: number | null
          master_poll_id?: string | null
          message_id: number
          telegram_poll_id: string
        }
        Update: {
          chat_id?: number | null
          master_poll_id?: string | null
          message_id?: number
          telegram_poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_polls_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "houses"
            referencedColumns: ["chat_id"]
          },
          {
            foreignKeyName: "telegram_polls_master_poll_id_fkey"
            columns: ["master_poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          telegram_poll_id: string | null
          user_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          telegram_poll_id?: string | null
          user_id: number
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          telegram_poll_id?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_telegram_poll_id_fkey"
            columns: ["telegram_poll_id"]
            isOneToOne: false
            referencedRelation: "telegram_polls"
            referencedColumns: ["telegram_poll_id"]
          },
        ]
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
