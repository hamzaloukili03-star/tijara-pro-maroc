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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string | null
          bank_name: string
          created_at: string
          currency: string
          current_balance: number
          id: string
          initial_balance: number
          is_active: boolean
          is_default: boolean
          rib: string | null
          swift: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number?: string | null
          bank_name: string
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_default?: boolean
          rib?: string | null
          swift?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string | null
          bank_name?: string
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          is_default?: boolean
          rib?: string | null
          swift?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          bank_name: string | null
          bank_rib: string | null
          bank_swift: string | null
          capital: number | null
          city: string | null
          cnss: string | null
          created_at: string
          email: string | null
          fax: string | null
          forme_juridique: string | null
          ice: string | null
          id: string
          if_number: string | null
          logo_url: string | null
          patente: string | null
          phone: string | null
          postal_code: string | null
          raison_sociale: string
          rc: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_name?: string | null
          bank_rib?: string | null
          bank_swift?: string | null
          capital?: number | null
          city?: string | null
          cnss?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          forme_juridique?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          logo_url?: string | null
          patente?: string | null
          phone?: string | null
          postal_code?: string | null
          raison_sociale?: string
          rc?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_name?: string | null
          bank_rib?: string | null
          bank_swift?: string | null
          capital?: number | null
          city?: string | null
          cnss?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          forme_juridique?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          logo_url?: string | null
          patente?: string | null
          phone?: string | null
          postal_code?: string | null
          raison_sociale?: string
          rc?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      credit_note_lines: {
        Row: {
          created_at: string
          credit_note_id: string
          description: string
          id: string
          product_id: string | null
          quantity: number
          sort_order: number
          total_ht: number
          total_ttc: number
          total_tva: number
          tva_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          credit_note_id: string
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          credit_note_id?: string
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_note_lines_credit_note_id_fkey"
            columns: ["credit_note_id"]
            isOneToOne: false
            referencedRelation: "credit_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_note_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          created_at: string
          created_by: string | null
          credit_note_date: string
          credit_note_number: string
          credit_note_type: string
          customer_id: string | null
          id: string
          invoice_id: string | null
          reason: string
          status: string
          subtotal_ht: number
          supplier_id: string | null
          total_ttc: number
          total_tva: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credit_note_date?: string
          credit_note_number: string
          credit_note_type: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          reason?: string
          status?: string
          subtotal_ht?: number
          supplier_id?: string | null
          total_ttc?: number
          total_tva?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credit_note_date?: string
          credit_note_number?: string
          credit_note_type?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          reason?: string
          status?: string
          subtotal_ht?: number
          supplier_id?: string | null
          total_ttc?: number
          total_tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          code: string
          contact_name: string | null
          created_at: string
          credit_limit: number | null
          email: string | null
          fax: string | null
          ice: string | null
          id: string
          if_number: string | null
          is_active: boolean
          name: string
          notes: string | null
          patente: string | null
          payment_terms: string | null
          phone: string | null
          rc: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          fax?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          patente?: string | null
          payment_terms?: string | null
          phone?: string | null
          rc?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          email?: string | null
          fax?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          patente?: string | null
          payment_terms?: string | null
          phone?: string | null
          rc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      document_counters: {
        Row: {
          doc_type: string
          doc_year: number
          id: string
          last_number: number
        }
        Insert: {
          doc_type: string
          doc_year: number
          id?: string
          last_number?: number
        }
        Update: {
          doc_type?: string
          doc_year?: number
          id?: string
          last_number?: number
        }
        Relationships: []
      }
      invoice_attachments: {
        Row: {
          created_at: string
          credit_note_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          invoice_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          credit_note_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          invoice_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          credit_note_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          invoice_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_attachments_credit_note_id_fkey"
            columns: ["credit_note_id"]
            isOneToOne: false
            referencedRelation: "credit_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_attachments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          sort_order: number
          total_ht: number
          total_ttc: number
          total_tva: number
          tva_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string
          discount_percent?: number
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string
          notes: string | null
          payment_terms: string | null
          remaining_balance: number
          status: string
          subtotal_ht: number
          supplier_id: string | null
          total_ttc: number
          total_tva: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          invoice_type: string
          notes?: string | null
          payment_terms?: string | null
          remaining_balance?: number
          status?: string
          subtotal_ht?: number
          supplier_id?: string | null
          total_ttc?: number
          total_tva?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string
          notes?: string | null
          payment_terms?: string | null
          remaining_balance?: number
          status?: string
          subtotal_ht?: number
          supplier_id?: string | null
          total_ttc?: number
          total_tva?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          min_stock: number
          name: string
          purchase_price: number
          sale_price: number
          tva_rate: number
          unit: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          name: string
          purchase_price?: number
          sale_price?: number
          tva_rate?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock?: number
          name?: string
          purchase_price?: number
          sale_price?: number
          tva_rate?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          code: string
          contact_name: string | null
          created_at: string
          email: string | null
          fax: string | null
          ice: string | null
          id: string
          if_number: string | null
          is_active: boolean
          name: string
          notes: string | null
          patente: string | null
          payment_terms: string | null
          phone: string | null
          rc: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          patente?: string | null
          payment_terms?: string | null
          phone?: string | null
          rc?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          ice?: string | null
          id?: string
          if_number?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          patente?: string | null
          payment_terms?: string | null
          phone?: string | null
          rc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          allow_admin_overrides: boolean
          allow_negative_stock: boolean
          created_at: string
          default_currency: string
          default_payment_terms: string
          default_tva: number
          doc_numbering_format: string
          enable_attachments: boolean
          id: string
          tva_rates: Json
          updated_at: string
        }
        Insert: {
          allow_admin_overrides?: boolean
          allow_negative_stock?: boolean
          created_at?: string
          default_currency?: string
          default_payment_terms?: string
          default_tva?: number
          doc_numbering_format?: string
          enable_attachments?: boolean
          id?: string
          tva_rates?: Json
          updated_at?: string
        }
        Update: {
          allow_admin_overrides?: boolean
          allow_negative_stock?: boolean
          created_at?: string
          default_currency?: string
          default_payment_terms?: string
          default_tva?: number
          doc_numbering_format?: string
          enable_attachments?: boolean
          id?: string
          tva_rates?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      next_document_number: { Args: { p_type: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "accountant"
        | "sales"
        | "stock_manager"
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
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "accountant",
        "sales",
        "stock_manager",
      ],
    },
  },
} as const
