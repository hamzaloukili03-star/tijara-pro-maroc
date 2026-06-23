// Local type definitions for auth until Supabase types regenerate
export type AppRole = 'super_admin' | 'admin' | 'accountant' | 'sales' | 'stock_manager' | 'purchase';

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
  purchase: "Acheteur",
};

// Module access mapping
// NOTE: super_admin is intentionally NOT included in business modules.
// Super Admin is dedicated to platform administration (users, roles, design templates, companies).
// Business data of assigned companies is accessed by Admin and operational roles.
export const ROLE_MODULE_ACCESS: Record<string, AppRole[]> = {
  "/": ["super_admin", "admin", "accountant", "sales", "stock_manager"],
  "/tableaux-de-bord": ["admin"],
  "/referentiel": ["admin", "accountant", "sales", "stock_manager"],
  "/referentiel/clients": ["admin", "accountant", "sales", "stock_manager"],
  "/referentiel/fournisseurs": ["admin", "accountant", "sales", "stock_manager", "purchase"],
  "/referentiel/produits": ["admin", "accountant", "sales", "stock_manager"],
  "/referentiel/depots": ["admin", "stock_manager"],
  "/referentiel/comptes-bancaires": ["admin", "accountant"],
  "/referentiel/caisses": ["admin", "accountant"],
  "/achats": ["admin", "accountant", "purchase"],
  "/achats/demandes": ["admin", "accountant", "purchase"],
  "/achats/commandes": ["admin", "accountant", "purchase"],
  "/achats/depenses": ["admin", "accountant", "purchase"],
  "/achats/receptions": ["admin", "accountant", "stock_manager", "purchase"],
  "/stock": ["admin", "stock_manager"],
  "/stock/niveaux": ["admin", "stock_manager"],
  "/stock/mouvements": ["admin", "stock_manager"],
  "/stock/receptions": ["admin", "stock_manager"],
  "/stock/livraisons": ["admin", "stock_manager", "sales"],
  "/stock/transferts": ["admin", "stock_manager"],
  "/stock/inventaires": ["admin", "stock_manager"],
  "/ventes": ["admin", "sales"],
  "/ventes/devis": ["admin", "sales"],
  "/ventes/commandes": ["admin", "sales"],
  "/ventes/livraisons": ["admin", "sales", "stock_manager"],
  "/facturation": ["admin", "accountant"],
  "/facturation/clients": ["admin", "accountant"],
  "/facturation/fournisseurs": ["admin", "accountant"],
  "/facturation/avoirs": ["admin", "accountant"],
  "/facturation/exports": ["admin", "accountant"],
  "/reglements": ["admin", "accountant"],
  "/reglements/encaissements": ["admin", "accountant"],
  "/reglements/decaissements": ["admin", "accountant"],
  "/reglements/rapprochement": ["admin", "accountant"],
  "/reglements/impayes": ["admin", "accountant"],
  "/depenses": ["admin", "accountant"],
  "/config": ["admin"],
  "/config/categories": ["admin"],
  "/config/conditions-paiement": ["admin"],
  "/config/unites-mesure": ["admin"],
  "/config/tva": ["admin"],
  "/config/banques": ["admin"],
  "/config/devises": ["admin"],
  "/config/categories-depenses": ["admin"],
  "/documents": ["admin", "accountant", "sales"],

  // Administration — Super Admin scope (platform-level)
  "/systeme": ["super_admin", "admin"],
  "/systeme/utilisateurs": ["super_admin", "admin"],
  "/systeme/profils": ["super_admin"],
  "/systeme/societes": ["super_admin"],
  "/systeme/conception": ["super_admin"],

  // Administration — shared with Admin (company-level settings)
  "/systeme/societe": ["super_admin", "admin"],
  "/systeme/parametres": ["super_admin", "admin"],
  "/systeme/logs": ["super_admin", "admin"],
};
