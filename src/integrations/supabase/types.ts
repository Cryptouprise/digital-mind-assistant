export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_logs: {
        Row: {
          created_at: string
          id: string
          prompt: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          response: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          response?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_users: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      appearance_settings: {
        Row: {
          animations_enabled: boolean
          chart_type: string
          compact_mode: boolean
          created_at: string
          default_timeframe: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          animations_enabled?: boolean
          chart_type?: string
          compact_mode?: boolean
          created_at?: string
          default_timeframe?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          animations_enabled?: boolean
          chart_type?: string
          compact_mode?: boolean
          created_at?: string
          default_timeframe?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          base_price: number
          created_at: string | null
          created_by: string
          description: string | null
          end_time: string
          id: string
          start_time: string
          status: string
          title: string
        }
        Insert: {
          base_price: number
          created_at?: string | null
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          start_time: string
          status?: string
          title: string
        }
        Update: {
          base_price?: number
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          start_time?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      assistants: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          is_default: boolean
          meeting_type: string
          model: string
          name: string
          tools: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          instructions?: string | null
          is_default?: boolean
          meeting_type: string
          model: string
          name: string
          tools?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          is_default?: boolean
          meeting_type?: string
          model?: string
          name?: string
          tools?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          contact_id: string | null
          date: string
          follow_up_sent: boolean | null
          id: string
          raw_data: Json | null
          status: string | null
          summary: string | null
          symbl_conversation_id: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          contact_id?: string | null
          date?: string
          follow_up_sent?: boolean | null
          id?: string
          raw_data?: Json | null
          status?: string | null
          summary?: string | null
          symbl_conversation_id?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          contact_id?: string | null
          date?: string
          follow_up_sent?: boolean | null
          id?: string
          raw_data?: Json | null
          status?: string | null
          summary?: string | null
          symbl_conversation_id?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          ai_signals: boolean
          browser_notifications: boolean
          created_at: string
          economic_calendar: boolean
          email_notifications: boolean
          id: string
          market_news: boolean
          price_alerts: boolean
          push_notifications: boolean
          trade_execution: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_signals?: boolean
          browser_notifications?: boolean
          created_at?: string
          economic_calendar?: boolean
          email_notifications?: boolean
          id?: string
          market_news?: boolean
          price_alerts?: boolean
          push_notifications?: boolean
          trade_execution?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_signals?: boolean
          browser_notifications?: boolean
          created_at?: string
          economic_calendar?: boolean
          email_notifications?: boolean
          id?: string
          market_news?: boolean
          price_alerts?: boolean
          push_notifications?: boolean
          trade_execution?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      trade_settings: {
        Row: {
          auto_trade: boolean
          created_at: string | null
          id: string
          max_daily_trades: number
          risk_level: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_trade?: boolean
          created_at?: string | null
          id?: string
          max_daily_trades?: number
          risk_level?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_trade?: boolean
          created_at?: string | null
          id?: string
          max_daily_trades?: number
          risk_level?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          id: string
          name: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          url?: string
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
      appointment_status: "open" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_status: ["open", "in_progress", "completed", "cancelled"],
    },
  },
} as const
