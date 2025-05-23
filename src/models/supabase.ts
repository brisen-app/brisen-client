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
      card_dependencies: {
        Row: {
          child: string
          created_at: string
          modified_at: string
          parent: string
        }
        Insert: {
          child: string
          created_at?: string
          modified_at?: string
          parent: string
        }
        Update: {
          child?: string
          created_at?: string
          modified_at?: string
          parent?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_dependencies_child_fkey"
            columns: ["child"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_dependencies_parent_fkey"
            columns: ["parent"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_pack_rel: {
        Row: {
          card: string
          created_at: string
          modified_at: string
          pack: string
        }
        Insert: {
          card: string
          created_at?: string
          modified_at?: string
          pack: string
        }
        Update: {
          card?: string
          created_at?: string
          modified_at?: string
          pack?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_card_pack_rel_card_fkey"
            columns: ["card"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_card_pack_rel_pack_fkey"
            columns: ["pack"]
            isOneToOne: false
            referencedRelation: "packs"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          category: string | null
          content: string
          created_at: string
          header: string | null
          id: string
          is_group: boolean
          modified_at: string
          order: Database["public"]["Enums"]["card_order"] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          header?: string | null
          id?: string
          is_group?: boolean
          modified_at?: string
          order?: Database["public"]["Enums"]["card_order"] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          header?: string | null
          id?: string
          is_group?: boolean
          modified_at?: string
          order?: Database["public"]["Enums"]["card_order"] | null
        }
        Relationships: [
          {
            foreignKeyName: "public_cards_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          gradient: string[] | null
          icon: string
          id: string
          modified_at: string
        }
        Insert: {
          created_at?: string
          gradient?: string[] | null
          icon: string
          id?: string
          modified_at?: string
        }
        Update: {
          created_at?: string
          gradient?: string[] | null
          icon?: string
          id?: string
          modified_at?: string
        }
        Relationships: []
      }
      configurations: {
        Row: {
          bool: boolean | null
          created_at: string
          data_type: string
          id: string
          list: string[] | null
          modified_at: string
          number: number | null
          string: string | null
        }
        Insert: {
          bool?: boolean | null
          created_at?: string
          data_type: string
          id: string
          list?: string[] | null
          modified_at?: string
          number?: number | null
          string?: string | null
        }
        Update: {
          bool?: boolean | null
          created_at?: string
          data_type?: string
          id?: string
          list?: string[] | null
          modified_at?: string
          number?: number | null
          string?: string | null
        }
        Relationships: []
      }
      languages: {
        Row: {
          created_at: string
          icon: string
          id: string
          modified_at: string
          name: string
          public: boolean
        }
        Insert: {
          created_at?: string
          icon: string
          id: string
          modified_at?: string
          name: string
          public?: boolean
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          modified_at?: string
          name?: string
          public?: boolean
        }
        Relationships: []
      }
      localizations: {
        Row: {
          created_at: string
          id: string
          language: string
          modified_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id: string
          language: string
          modified_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          modified_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "localizations_language_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      packs: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          image: string | null
          is_free: boolean
          language: string | null
          modified_at: string
          name: string
          start_date: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          is_free?: boolean
          language?: string | null
          modified_at?: string
          name?: string
          start_date?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          is_free?: boolean
          language?: string | null
          modified_at?: string
          name?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packs_language_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
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
      card_order: "starting" | "next" | "ending"
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
