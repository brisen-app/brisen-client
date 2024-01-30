export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      card_relations: {
        Row: {
          from: string
          to: string
        }
        Insert: {
          from: string
          to: string
        }
        Update: {
          from?: string
          to?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          category: string | null
          content: string
          header: string | null
          id: string
          language: string
          tags: string[]
        }
        Insert: {
          category?: string | null
          content: string
          header?: string | null
          id: string
          language?: string
          tags: string[]
        }
        Update: {
          category?: string | null
          content?: string
          header?: string | null
          id?: string
          language?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "cards_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_language_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          color: string | null
          icon: string
          id: string
          individual: boolean
        }
        Insert: {
          color?: string | null
          icon: string
          id: string
          individual?: boolean
        }
        Update: {
          color?: string | null
          icon?: string
          id?: string
          individual?: boolean
        }
        Relationships: []
      }
      languages: {
        Row: {
          icon: string
          id: string
          title: string
        }
        Insert: {
          icon: string
          id: string
          title: string
        }
        Update: {
          icon?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      localizations: {
        Row: {
          key: string
          language: string
          value: string
        }
        Insert: {
          key: string
          language: string
          value: string
        }
        Update: {
          key?: string
          language?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "localizations_language_fkey"
            columns: ["language"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          }
        ]
      }
      log: {
        Row: {
          message: string
          timestamp: string
          type: string | null
        }
        Insert: {
          message: string
          timestamp?: string
          type?: string | null
        }
        Update: {
          message?: string
          timestamp?: string
          type?: string | null
        }
        Relationships: []
      }
      packs: {
        Row: {
          end_date: string | null
          excluded_tags: string[] | null
          icon: string
          id: string
          included_tags: string[] | null
          is_free: boolean
          start_date: string | null
        }
        Insert: {
          end_date?: string | null
          excluded_tags?: string[] | null
          icon: string
          id: string
          included_tags?: string[] | null
          is_free?: boolean
          start_date?: string | null
        }
        Update: {
          end_date?: string | null
          excluded_tags?: string[] | null
          icon?: string
          id?: string
          included_tags?: string[] | null
          is_free?: boolean
          start_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hello_world: {
        Args: Record<PropertyKey, never>
        Returns: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
