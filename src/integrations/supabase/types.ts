export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      bids: {
        Row: {
          bid_price: number;
          buyer_id: string;
          created_at: string;
          id: string;
          message: string | null;
          product_id: string;
          quantity: number;
          status: Database["public"]["Enums"]["bid_status"];
          updated_at: string;
        };
        Insert: {
          bid_price: number;
          buyer_id: string;
          created_at?: string;
          id?: string;
          message?: string | null;
          product_id: string;
          quantity: number;
          status?: Database["public"]["Enums"]["bid_status"];
          updated_at?: string;
        };
        Update: {
          bid_price?: number;
          buyer_id?: string;
          created_at?: string;
          id?: string;
          message?: string | null;
          product_id?: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["bid_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bids_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      logistics: {
        Row: {
          available: boolean;
          base_location: string;
          capacity_kg: number;
          created_at: string;
          id: string;
          price_per_km: number;
          transporter_id: string;
          updated_at: string;
          vehicle_type: string;
        };
        Insert: {
          available?: boolean;
          base_location: string;
          capacity_kg: number;
          created_at?: string;
          id?: string;
          price_per_km?: number;
          transporter_id: string;
          updated_at?: string;
          vehicle_type: string;
        };
        Update: {
          available?: boolean;
          base_location?: string;
          capacity_kg?: number;
          created_at?: string;
          id?: string;
          price_per_km?: number;
          transporter_id?: string;
          updated_at?: string;
          vehicle_type?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          bid_id: string | null;
          buyer_id: string;
          created_at: string;
          farmer_id: string;
          id: string;
          product_id: string;
          quantity: number;
          status: Database["public"]["Enums"]["order_status"];
          total_price: number;
          tracking_notes: string | null;
          transporter_id: string | null;
          updated_at: string;
        };
        Insert: {
          bid_id?: string | null;
          buyer_id: string;
          created_at?: string;
          farmer_id: string;
          id?: string;
          product_id: string;
          quantity: number;
          status?: Database["public"]["Enums"]["order_status"];
          total_price: number;
          tracking_notes?: string | null;
          transporter_id?: string | null;
          updated_at?: string;
        };
        Update: {
          bid_id?: string | null;
          buyer_id?: string;
          created_at?: string;
          farmer_id?: string;
          id?: string;
          product_id?: string;
          quantity?: number;
          status?: Database["public"]["Enums"]["order_status"];
          total_price?: number;
          tracking_notes?: string | null;
          transporter_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_bid_id_fkey";
            columns: ["bid_id"];
            isOneToOne: false;
            referencedRelation: "bids";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          ai_insights: Json | null;
          category: string;
          created_at: string;
          demand_score: number | null;
          description: string | null;
          farmer_id: string;
          harvest_date: string | null;
          id: string;
          image_urls: string[];
          location: string;
          name: string;
          price_per_unit: number;
          quality_grade: Database["public"]["Enums"]["quality_grade"];
          quantity: number;
          status: Database["public"]["Enums"]["product_status"];
          unit: string;
          updated_at: string;
        };
        Insert: {
          ai_insights?: Json | null;
          category: string;
          created_at?: string;
          demand_score?: number | null;
          description?: string | null;
          farmer_id: string;
          harvest_date?: string | null;
          id?: string;
          image_urls?: string[];
          location: string;
          name: string;
          price_per_unit: number;
          quality_grade?: Database["public"]["Enums"]["quality_grade"];
          quantity: number;
          status?: Database["public"]["Enums"]["product_status"];
          unit?: string;
          updated_at?: string;
        };
        Update: {
          ai_insights?: Json | null;
          category?: string;
          created_at?: string;
          demand_score?: number | null;
          description?: string | null;
          farmer_id?: string;
          harvest_date?: string | null;
          id?: string;
          image_urls?: string[];
          location?: string;
          name?: string;
          price_per_unit?: number;
          quality_grade?: Database["public"]["Enums"]["quality_grade"];
          quantity?: number;
          status?: Database["public"]["Enums"]["product_status"];
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          latitude: number | null;
          location: string | null;
          longitude: number | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          latitude?: number | null;
          location?: string | null;
          longitude?: number | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          latitude?: number | null;
          location?: string | null;
          longitude?: number | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      soil_reports: {
        Row: {
          created_at: string;
          farmer_id: string;
          id: string;
          moisture: number | null;
          nitrogen: number | null;
          notes: string | null;
          ph: number | null;
          phosphorus: number | null;
          potassium: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          farmer_id: string;
          id?: string;
          moisture?: number | null;
          nitrogen?: number | null;
          notes?: string | null;
          ph?: number | null;
          phosphorus?: number | null;
          potassium?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          farmer_id?: string;
          id?: string;
          moisture?: number | null;
          nitrogen?: number | null;
          notes?: string | null;
          ph?: number | null;
          phosphorus?: number | null;
          potassium?: number | null;
          updated_at?: string;
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
      get_user_role: {
        Args: { _user_id: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "farmer" | "buyer" | "transporter" | "admin";
      bid_status: "pending" | "accepted" | "rejected" | "withdrawn";
      order_status: "created" | "assigned" | "in_transit" | "delivered" | "cancelled";
      product_status: "available" | "sold" | "reserved" | "expired";
      quality_grade: "premium" | "standard" | "basic";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
      app_role: ["farmer", "buyer", "transporter", "admin"],
      bid_status: ["pending", "accepted", "rejected", "withdrawn"],
      order_status: ["created", "assigned", "in_transit", "delivered", "cancelled"],
      product_status: ["available", "sold", "reserved", "expired"],
      quality_grade: ["premium", "standard", "basic"],
    },
  },
} as const;
