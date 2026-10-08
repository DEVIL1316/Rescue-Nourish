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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      deliveries: {
        Row: {
          assigned_at: string
          assigned_name: string | null
          assigned_to: string | null
          created_at: string
          delivered_at: string | null
          destination_location: string | null
          distance_km: number
          donation_id: string
          eta_minutes: number
          id: string
          in_transit_at: string | null
          is_seed: boolean
          notes: string | null
          picked_up_at: string | null
          pickup_location: string | null
          recipient_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_name?: string | null
          assigned_to?: string | null
          created_at?: string
          delivered_at?: string | null
          destination_location?: string | null
          distance_km?: number
          donation_id: string
          eta_minutes?: number
          id?: string
          in_transit_at?: string | null
          is_seed?: boolean
          notes?: string | null
          picked_up_at?: string | null
          pickup_location?: string | null
          recipient_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_name?: string | null
          assigned_to?: string | null
          created_at?: string
          delivered_at?: string | null
          destination_location?: string | null
          distance_km?: number
          donation_id?: string
          eta_minutes?: number
          id?: string
          in_transit_at?: string | null
          is_seed?: boolean
          notes?: string | null
          picked_up_at?: string | null
          pickup_location?: string | null
          recipient_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_bookings: {
        Row: {
          booked_by: string
          booker_name: string | null
          created_at: string
          donation_id: string
          id: string
          notes: string | null
          slot_date: string
          slot_time: string
          status: string
          updated_at: string
        }
        Insert: {
          booked_by: string
          booker_name?: string | null
          created_at?: string
          donation_id: string
          id?: string
          notes?: string | null
          slot_date: string
          slot_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          booked_by?: string
          booker_name?: string | null
          created_at?: string
          donation_id?: string
          id?: string
          notes?: string | null
          slot_date?: string
          slot_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_bookings_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          created_at: string
          delivered_at: string | null
          description: string | null
          donor_id: string
          donor_type: string
          expiry_time: string | null
          food_type: string | null
          id: string
          image_url: string | null
          is_seed: boolean
          location: string | null
          picked_up_at: string | null
          quality_rating: number | null
          quantity: string | null
          recipient_id: string | null
          recipient_name: string | null
          status: string
          title: string
          tracking_status: string
          urgency: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          description?: string | null
          donor_id: string
          donor_type?: string
          expiry_time?: string | null
          food_type?: string | null
          id?: string
          image_url?: string | null
          is_seed?: boolean
          location?: string | null
          picked_up_at?: string | null
          quality_rating?: number | null
          quantity?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          status?: string
          title: string
          tracking_status?: string
          urgency?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          description?: string | null
          donor_id?: string
          donor_type?: string
          expiry_time?: string | null
          food_type?: string | null
          id?: string
          image_url?: string | null
          is_seed?: boolean
          location?: string | null
          picked_up_at?: string | null
          quality_rating?: number | null
          quantity?: string | null
          recipient_id?: string | null
          recipient_name?: string | null
          status?: string
          title?: string
          tracking_status?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      needs: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          posted_by: string
          quantity: string | null
          status: string
          title: string
          urgency: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          posted_by: string
          quantity?: string | null
          status?: string
          title: string
          urgency?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          posted_by?: string
          quantity?: string | null
          status?: string
          title?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "needs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ngos: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          current_capacity: number
          description: string | null
          id: string
          is_seed: boolean
          location: string | null
          logo_url: string | null
          name: string
          required_food_types: string[]
          required_quantity: string | null
          urgency: string
          user_id: string
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_capacity?: number
          description?: string | null
          id?: string
          is_seed?: boolean
          location?: string | null
          logo_url?: string | null
          name: string
          required_food_types?: string[]
          required_quantity?: string | null
          urgency?: string
          user_id: string
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_capacity?: number
          description?: string | null
          id?: string
          is_seed?: boolean
          location?: string | null
          logo_url?: string | null
          name?: string
          required_food_types?: string[]
          required_quantity?: string | null
          urgency?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ngos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orphanages: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          current_capacity: number
          description: string | null
          id: string
          image_url: string | null
          is_seed: boolean
          location: string | null
          name: string
          needs_description: string | null
          number_of_people: number | null
          required_food_types: string[]
          required_quantity: string | null
          urgency: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          current_capacity?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_seed?: boolean
          location?: string | null
          name: string
          needs_description?: string | null
          number_of_people?: number | null
          required_food_types?: string[]
          required_quantity?: string | null
          urgency?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          current_capacity?: number
          description?: string | null
          id?: string
          image_url?: string | null
          is_seed?: boolean
          location?: string | null
          name?: string
          needs_description?: string | null
          number_of_people?: number | null
          required_food_types?: string[]
          required_quantity?: string | null
          urgency?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role_type: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role_type?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role_type?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      watchlist: {
        Row: {
          category: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
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
      accept_donation: { Args: { _id: string }; Returns: boolean }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mcp_list_ngos: {
        Args: { _limit?: number }
        Returns: {
          created_at: string
          description: string
          id: string
          location: string
          name: string
          website: string
        }[]
      }
      mcp_list_open_needs: {
        Args: { _limit?: number }
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          quantity: string
          status: string
          title: string
          urgency: string
        }[]
      }
      mcp_list_orphanages: {
        Args: { _limit?: number }
        Returns: {
          created_at: string
          description: string
          id: string
          location: string
          name: string
          needs_description: string
        }[]
      }
      send_chat_message: {
        Args: { _channel: string; _content: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "donor" | "ngo" | "admin" | "orphanage_member"
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
      app_role: ["donor", "ngo", "admin", "orphanage_member"],
    },
  },
} as const
