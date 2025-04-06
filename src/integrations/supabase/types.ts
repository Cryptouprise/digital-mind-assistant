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
          date: string
          id: string
          raw_data: Json | null
          status: string | null
          summary: string | null
          symbl_conversation_id: string | null
          title: string
        }
        Insert: {
          date?: string
          id?: string
          raw_data?: Json | null
          status?: string | null
          summary?: string | null
          symbl_conversation_id?: string | null
          title: string
        }
        Update: {
          date?: string
          id?: string
          raw_data?: Json | null
          status?: string | null
          summary?: string | null
          symbl_conversation_id?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
