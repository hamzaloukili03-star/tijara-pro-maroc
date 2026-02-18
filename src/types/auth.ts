// Local type definitions for auth until Supabase types regenerate
export type AppRole = 'super_admin' | 'admin' | 'accountant' | 'sales' | 'stock_manager';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  accountant: "Comptable",
  sales: "Commercial",
  stock_manager: "Gestionnaire Stock",
};

// Module access mapping
export const ROLE_MODULE_ACCESS: Record<string, AppRole[]> = {
  "/": ["super_admin", "admin", "accountant", "sales", "stock_manager"],
  "/achats": ["super_admin", "admin", "accountant"],
  "/stock": ["super_admin", "admin", "stock_manager"],
  "/ventes": ["super_admin", "admin", "sales"],
  "/facturation": ["super_admin", "admin", "accountant"],
  "/reglements": ["super_admin", "admin", "accountant"],
  "/tableaux-de-bord": ["super_admin", "admin"],
  "/documents": ["super_admin", "admin", "accountant", "sales"],
  "/systeme/utilisateurs": ["super_admin"],
  "/systeme/societe": ["super_admin", "admin"],
  "/systeme/parametres": ["super_admin", "admin"],
  "/systeme/logs": ["super_admin", "admin"],
};
