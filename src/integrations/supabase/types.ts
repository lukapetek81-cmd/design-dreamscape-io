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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          api_endpoint: string
          created_at: string | null
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          api_endpoint: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          api_endpoint?: string
          created_at?: string | null
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expert_insights: {
        Row: {
          bullish_bearish: string | null
          commodity_focus: string
          confidence_level: number | null
          content: string
          created_at: string
          expert_name: string
          expert_title: string | null
          id: string
          prediction_timeframe: string | null
          published_at: string
          title: string
        }
        Insert: {
          bullish_bearish?: string | null
          commodity_focus: string
          confidence_level?: number | null
          content: string
          created_at?: string
          expert_name: string
          expert_title?: string | null
          id?: string
          prediction_timeframe?: string | null
          published_at?: string
          title: string
        }
        Update: {
          bullish_bearish?: string | null
          commodity_focus?: string
          confidence_level?: number | null
          content?: string
          created_at?: string
          expert_name?: string
          expert_title?: string | null
          id?: string
          prediction_timeframe?: string | null
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          content: string
          created_at: string
          forum_id: string
          id: string
          locked: boolean
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
          views: number
        }
        Insert: {
          content: string
          created_at?: string
          forum_id: string
          id?: string
          locked?: boolean
          pinned?: boolean
          title: string
          updated_at?: string
          user_id: string
          views?: number
        }
        Update: {
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          locked?: boolean
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          commodity_group: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          commodity_group: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          commodity_group?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      glossary_terms: {
        Row: {
          category: string | null
          created_at: string
          definition: string
          examples: string | null
          id: string
          term: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          definition: string
          examples?: string | null
          id?: string
          term: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          definition?: string
          examples?: string | null
          id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      ibkr_credentials: {
        Row: {
          created_at: string
          gateway: string
          id: string
          is_active: boolean
          password_encrypted: string
          updated_at: string
          user_id: string
          username_encrypted: string
        }
        Insert: {
          created_at?: string
          gateway?: string
          id?: string
          is_active?: boolean
          password_encrypted: string
          updated_at?: string
          user_id: string
          username_encrypted: string
        }
        Update: {
          created_at?: string
          gateway?: string
          id?: string
          is_active?: boolean
          password_encrypted?: string
          updated_at?: string
          user_id?: string
          username_encrypted?: string
        }
        Relationships: []
      }
      market_status_config: {
        Row: {
          close_time: string
          created_at: string
          holidays: Json | null
          id: string
          market_name: string
          open_time: string
          timezone: string
          trading_days: number[]
          updated_at: string
        }
        Insert: {
          close_time: string
          created_at?: string
          holidays?: Json | null
          id?: string
          market_name: string
          open_time: string
          timezone: string
          trading_days: number[]
          updated_at?: string
        }
        Update: {
          close_time?: string
          created_at?: string
          holidays?: Json | null
          id?: string
          market_name?: string
          open_time?: string
          timezone?: string
          trading_days?: number[]
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_positions: {
        Row: {
          commodity_name: string
          created_at: string
          entry_date: string
          entry_price: number
          id: string
          notes: string | null
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commodity_name: string
          created_at?: string
          entry_date?: string
          entry_price: number
          id?: string
          notes?: string | null
          quantity: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commodity_name?: string
          created_at?: string
          entry_date?: string
          entry_price?: number
          id?: string
          notes?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_snapshots: {
        Row: {
          buying_power: number
          created_at: string
          id: string
          net_liquidation: number
          positions: Json
          realized_pnl: number
          snapshot_date: string
          total_cash_value: number
          unrealized_pnl: number
          user_id: string
        }
        Insert: {
          buying_power: number
          created_at?: string
          id?: string
          net_liquidation: number
          positions?: Json
          realized_pnl?: number
          snapshot_date: string
          total_cash_value: number
          unrealized_pnl?: number
          user_id: string
        }
        Update: {
          buying_power?: number
          created_at?: string
          id?: string
          net_liquidation?: number
          positions?: Json
          realized_pnl?: number
          snapshot_date?: string
          total_cash_value?: number
          unrealized_pnl?: number
          user_id?: string
        }
        Relationships: []
      }
      price_comparisons: {
        Row: {
          commodities: Json
          comparison_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commodities: Json
          comparison_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commodities?: Json
          comparison_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          commodity_price_api_credentials: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          subscription_active: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          commodity_price_api_credentials?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          subscription_active?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          commodity_price_api_credentials?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          subscription_active?: boolean | null
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recent_activities: {
        Row: {
          activity_type: string
          commodity_name: string
          commodity_symbol: string | null
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type?: string
          commodity_name: string
          commodity_symbol?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          commodity_name?: string
          commodity_symbol?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      risk_metrics: {
        Row: {
          beta: number | null
          created_at: string
          id: string
          max_drawdown: number | null
          metric_date: string
          portfolio_value: number
          position_concentration: Json | null
          risk_score: number | null
          sector_allocation: Json | null
          sharpe_ratio: number | null
          user_id: string
          var_1day: number | null
          var_5day: number | null
        }
        Insert: {
          beta?: number | null
          created_at?: string
          id?: string
          max_drawdown?: number | null
          metric_date: string
          portfolio_value: number
          position_concentration?: Json | null
          risk_score?: number | null
          sector_allocation?: Json | null
          sharpe_ratio?: number | null
          user_id: string
          var_1day?: number | null
          var_5day?: number | null
        }
        Update: {
          beta?: number | null
          created_at?: string
          id?: string
          max_drawdown?: number | null
          metric_date?: string
          portfolio_value?: number
          position_concentration?: Json | null
          risk_score?: number | null
          sector_allocation?: Json | null
          sharpe_ratio?: number | null
          user_id?: string
          var_1day?: number | null
          var_5day?: number | null
        }
        Relationships: []
      }
      sentiment_aggregates: {
        Row: {
          average_confidence: number | null
          bearish_votes: number
          bullish_votes: number
          commodity_name: string
          id: string
          last_updated: string
          total_votes: number
        }
        Insert: {
          average_confidence?: number | null
          bearish_votes?: number
          bullish_votes?: number
          commodity_name: string
          id?: string
          last_updated?: string
          total_votes?: number
        }
        Update: {
          average_confidence?: number | null
          bearish_votes?: number
          bullish_votes?: number
          commodity_name?: string
          id?: string
          last_updated?: string
          total_votes?: number
        }
        Relationships: []
      }
      sentiment_votes: {
        Row: {
          commodity_name: string
          confidence: number
          created_at: string
          id: string
          reasoning: string | null
          sentiment: string
          user_id: string
        }
        Insert: {
          commodity_name: string
          confidence: number
          created_at?: string
          id?: string
          reasoning?: string | null
          sentiment: string
          user_id: string
        }
        Update: {
          commodity_name?: string
          confidence?: number
          created_at?: string
          id?: string
          reasoning?: string | null
          sentiment?: string
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      trade_executions: {
        Row: {
          commission: number
          created_at: string
          executed_at: string
          execution_id: string
          id: string
          order_id: string
          price: number
          quantity: number
          side: string
          symbol: string
          user_id: string
        }
        Insert: {
          commission?: number
          created_at?: string
          executed_at?: string
          execution_id: string
          id?: string
          order_id: string
          price: number
          quantity: number
          side: string
          symbol: string
          user_id: string
        }
        Update: {
          commission?: number
          created_at?: string
          executed_at?: string
          execution_id?: string
          id?: string
          order_id?: string
          price?: number
          quantity?: number
          side?: string
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_executions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "trading_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_orders: {
        Row: {
          avg_fill_price: number | null
          commission: number | null
          created_at: string
          error_message: string | null
          filled_at: string | null
          filled_quantity: number | null
          ibkr_order_id: number | null
          id: string
          order_ref: string | null
          order_type: string
          parent_order_id: string | null
          price: number | null
          quantity: number
          side: string
          status: string
          stop_price: number | null
          submitted_at: string | null
          symbol: string
          tif: string
          trail_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_fill_price?: number | null
          commission?: number | null
          created_at?: string
          error_message?: string | null
          filled_at?: string | null
          filled_quantity?: number | null
          ibkr_order_id?: number | null
          id?: string
          order_ref?: string | null
          order_type: string
          parent_order_id?: string | null
          price?: number | null
          quantity: number
          side: string
          status?: string
          stop_price?: number | null
          submitted_at?: string | null
          symbol: string
          tif?: string
          trail_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_fill_price?: number | null
          commission?: number | null
          created_at?: string
          error_message?: string | null
          filled_at?: string | null
          filled_quantity?: number | null
          ibkr_order_id?: number | null
          id?: string
          order_ref?: string | null
          order_type?: string
          parent_order_id?: string | null
          price?: number | null
          quantity?: number
          side?: string
          status?: string
          stop_price?: number | null
          submitted_at?: string | null
          symbol?: string
          tif?: string
          trail_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trading_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          error_message: string | null
          gateway: string
          id: string
          session_id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          error_message?: string | null
          gateway: string
          id?: string
          session_id: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          error_message?: string | null
          gateway?: string
          id?: string
          session_id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      tutorial_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          category_id: string
          content: string
          created_at: string
          description: string | null
          difficulty_level: string
          estimated_time_minutes: number | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          description?: string | null
          difficulty_level: string
          estimated_time_minutes?: number | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          estimated_time_minutes?: number | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tutorial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          added_at: string
          commodity_group: string | null
          commodity_name: string
          commodity_symbol: string | null
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          commodity_group?: string | null
          commodity_name: string
          commodity_symbol?: string | null
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string
          commodity_group?: string | null
          commodity_name?: string
          commodity_symbol?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_metrics: { Args: never; Returns: undefined }
      get_current_user_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          commodity_price_api_credentials: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          subscription_active: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_business_hours: { Args: never; Returns: boolean }
      mask_email: {
        Args: {
          email_address: string
          owner_id: string
          requesting_user_id: string
        }
        Returns: string
      }
      validate_session: { Args: never; Returns: boolean }
      verify_credential_owner: {
        Args: { credential_id: string }
        Returns: boolean
      }
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
