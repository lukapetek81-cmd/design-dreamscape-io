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
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          subscription_active: boolean | null
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
        }
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
    Enums: {},
  },
} as const
