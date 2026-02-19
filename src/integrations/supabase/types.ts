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
      bank_transactions: {
        Row: {
          bank_account_id: string
          created_at: string
          credit: number
          debit: number
          description: string
          id: string
          imported_at: string
          is_reconciled: boolean
          reconciled_at: string | null
          reconciled_by: string | null
          reconciled_payment_id: string | null
          reference: string | null
          transaction_date: string
        }
        Insert: {
          bank_account_id: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string
          id?: string
          imported_at?: string
          is_reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciled_payment_id?: string | null
          reference?: string | null
          transaction_date: string
        }
        Update: {
          bank_account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string
          id?: string
          imported_at?: string
          is_reconciled?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciled_payment_id?: string | null
          reference?: string | null
          transaction_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_reconciled_payment_id_fkey"
            columns: ["reconciled_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_register_movements: {
        Row: {
          amount: number
          cash_register_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          payment_id: string | null
          reference: string | null
        }
        Insert: {
          amount?: number
          cash_register_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          payment_id?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          cash_register_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          payment_id?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_register_movements_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_register_movements_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          assigned_user_id: string | null
          code: string
          created_at: string
          current_balance: number
          id: string
          is_active: boolean
          name: string
          opening_balance: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          code: string
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          name: string
          opening_balance?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          code?: string
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          name?: string
          opening_balance?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
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
      deliveries: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          delivery_date: string
          delivery_number: string
          id: string
          invoice_id: string | null
          notes: string | null
          sales_order_id: string | null
          status: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          delivery_date?: string
          delivery_number: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          sales_order_id?: string | null
          status?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          delivery_date?: string
          delivery_number?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          sales_order_id?: string | null
          status?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_lines: {
        Row: {
          created_at: string
          delivery_id: string
          description: string
          discount_percent: number
          id: string
          product_id: string | null
          quantity: number
          sales_order_line_id: string | null
          sort_order: number
          total_ht: number
          total_ttc: number
          total_tva: number
          tva_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          delivery_id: string
          description?: string
          discount_percent?: number
          id?: string
          product_id?: string | null
          quantity?: number
          sales_order_line_id?: string | null
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          delivery_id?: string
          description?: string
          discount_percent?: number
          id?: string
          product_id?: string | null
          quantity?: number
          sales_order_line_id?: string | null
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_lines_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_lines_sales_order_line_id_fkey"
            columns: ["sales_order_line_id"]
            isOneToOne: false
            referencedRelation: "sales_order_lines"
            referencedColumns: ["id"]
          },
        ]
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
      inventory_adjustment_lines: {
        Row: {
          adjustment_id: string
          counted_qty: number
          created_at: string
          difference: number
          id: string
          product_id: string
          sort_order: number
          system_qty: number
        }
        Insert: {
          adjustment_id: string
          counted_qty?: number
          created_at?: string
          difference?: number
          id?: string
          product_id: string
          sort_order?: number
          system_qty?: number
        }
        Update: {
          adjustment_id?: string
          counted_qty?: number
          created_at?: string
          difference?: number
          id?: string
          product_id?: string
          sort_order?: number
          system_qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustment_lines_adjustment_id_fkey"
            columns: ["adjustment_id"]
            isOneToOne: false
            referencedRelation: "inventory_adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustment_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_adjustments: {
        Row: {
          adjustment_number: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          validated_by: string | null
          warehouse_id: string
        }
        Insert: {
          adjustment_number: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          validated_by?: string | null
          warehouse_id: string
        }
        Update: {
          adjustment_number?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          validated_by?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
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
      payment_allocations: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          payment_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id: string
          payment_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_account_id: string | null
          cheque_bank: string | null
          cheque_date: string | null
          cheque_number: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          is_override: boolean
          lcn_due_date: string | null
          notes: string | null
          override_reason: string | null
          payment_date: string
          payment_method: string
          payment_number: string
          payment_type: string
          reference: string | null
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          bank_account_id?: string | null
          cheque_bank?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          is_override?: boolean
          lcn_due_date?: string | null
          notes?: string | null
          override_reason?: string | null
          payment_date?: string
          payment_method?: string
          payment_number: string
          payment_type: string
          reference?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          cheque_bank?: string | null
          cheque_date?: string | null
          cheque_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          is_override?: boolean
          lcn_due_date?: string | null
          notes?: string | null
          override_reason?: string | null
          payment_date?: string
          payment_method?: string
          payment_number?: string
          payment_type?: string
          reference?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_supplier_id_fkey"
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
      purchase_order_lines: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          id: string
          product_id: string | null
          purchase_order_id: string
          quantity: number
          received_qty: number
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
          product_id?: string | null
          purchase_order_id: string
          quantity?: number
          received_qty?: number
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
          product_id?: string | null
          purchase_order_id?: string
          quantity?: number
          received_qty?: number
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_lines_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          payment_terms: string | null
          request_id: string | null
          status: string
          subtotal_ht: number
          supplier_id: string
          total_ttc: number
          total_tva: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          payment_terms?: string | null
          request_id?: string | null
          status?: string
          subtotal_ht?: number
          supplier_id: string
          total_ttc?: number
          total_tva?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          payment_terms?: string | null
          request_id?: string | null
          status?: string
          subtotal_ht?: number
          supplier_id?: string
          total_ttc?: number
          total_tva?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          product_id: string | null
          quantity: number
          request_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          request_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          product_id?: string | null
          quantity?: number
          request_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_lines_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          request_date: string
          request_number: string
          requested_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          request_date?: string
          request_number: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          request_date?: string
          request_number?: string
          requested_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotation_lines: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          id: string
          product_id: string | null
          quantity: number
          quotation_id: string
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
          product_id?: string | null
          quantity?: number
          quotation_id: string
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
          product_id?: string | null
          quantity?: number
          quotation_id?: string
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_lines_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          payment_terms: string | null
          quotation_date: string
          quotation_number: string
          status: string
          subtotal_ht: number
          total_ttc: number
          total_tva: number
          updated_at: string
          validity_date: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          quotation_date?: string
          quotation_number: string
          status?: string
          subtotal_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string
          validity_date?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          payment_terms?: string | null
          quotation_date?: string
          quotation_number?: string
          status?: string
          subtotal_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reception_lines: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          id: string
          product_id: string | null
          purchase_order_line_id: string | null
          quantity: number
          reception_id: string
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
          product_id?: string | null
          purchase_order_line_id?: string | null
          quantity?: number
          reception_id: string
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
          product_id?: string | null
          purchase_order_line_id?: string | null
          quantity?: number
          reception_id?: string
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "reception_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reception_lines_purchase_order_line_id_fkey"
            columns: ["purchase_order_line_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_lines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reception_lines_reception_id_fkey"
            columns: ["reception_id"]
            isOneToOne: false
            referencedRelation: "receptions"
            referencedColumns: ["id"]
          },
        ]
      }
      receptions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          purchase_order_id: string | null
          reception_date: string
          reception_number: string
          status: string
          supplier_id: string
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          purchase_order_id?: string | null
          reception_date?: string
          reception_number: string
          status?: string
          supplier_id: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          purchase_order_id?: string | null
          reception_date?: string
          reception_number?: string
          status?: string
          supplier_id?: string
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receptions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receptions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          invoice_id: string
          message: string | null
          reminder_date: string
          reminder_type: string
          sent_by: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id: string
          message?: string | null
          reminder_date?: string
          reminder_type?: string
          sent_by?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string
          message?: string | null
          reminder_date?: string
          reminder_type?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminder_logs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_lines: {
        Row: {
          created_at: string
          delivered_qty: number
          description: string
          discount_percent: number
          id: string
          product_id: string | null
          quantity: number
          sales_order_id: string
          sort_order: number
          total_ht: number
          total_ttc: number
          total_tva: number
          tva_rate: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          delivered_qty?: number
          description?: string
          discount_percent?: number
          id?: string
          product_id?: string | null
          quantity?: number
          sales_order_id: string
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          delivered_qty?: number
          description?: string
          discount_percent?: number
          id?: string
          product_id?: string | null
          quantity?: number
          sales_order_id?: string
          sort_order?: number
          total_ht?: number
          total_ttc?: number
          total_tva?: number
          tva_rate?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_lines_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          order_date: string
          order_number: string
          payment_terms: string | null
          quotation_id: string | null
          status: string
          subtotal_ht: number
          total_ttc: number
          total_tva: number
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          payment_terms?: string | null
          quotation_id?: string | null
          status?: string
          subtotal_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          payment_terms?: string | null
          quotation_id?: string | null
          status?: string
          subtotal_ht?: number
          total_ttc?: number
          total_tva?: number
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          cmup: number
          id: string
          product_id: string
          stock_on_hand: number
          stock_reserved: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          cmup?: number
          id?: string
          product_id: string
          stock_on_hand?: number
          stock_reserved?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          cmup?: number
          id?: string
          product_id?: string
          stock_on_hand?: number
          stock_reserved?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          unit_cost: number
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          unit_cost?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_lines: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          sort_order: number
          transfer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          sort_order?: number
          transfer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          sort_order?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_lines_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string
          created_by: string | null
          from_warehouse_id: string
          id: string
          notes: string | null
          status: string
          to_warehouse_id: string
          transfer_number: string
          updated_at: string
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          from_warehouse_id: string
          id?: string
          notes?: string | null
          status?: string
          to_warehouse_id: string
          transfer_number: string
          updated_at?: string
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          from_warehouse_id?: string
          id?: string
          notes?: string | null
          status?: string
          to_warehouse_id?: string
          transfer_number?: string
          updated_at?: string
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
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
