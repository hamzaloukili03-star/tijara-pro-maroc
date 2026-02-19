import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Settings,
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  Wallet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  Users,
  Building2,
  Cog,
  ClipboardList,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_MODULE_ACCESS, ROLE_LABELS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo-tijarapro.jpg";

const systemeSubItems = [
  { title: "Utilisateurs & Rôles", icon: Users, path: "/systeme/utilisateurs" },
  { title: "Paramètres Société", icon: Building2, path: "/systeme/societe" },
  { title: "Paramètres Système", icon: Cog, path: "/systeme/parametres" },
  { title: "Logs d'activité", icon: ClipboardList, path: "/systeme/logs" },
];

const mainModules = [
  { title: "Tableaux de Bord & Analyses", icon: BarChart3, path: "/tableaux-de-bord" },
  { title: "Achats", icon: ShoppingCart, path: "/achats", subs: [
    { title: "Fournisseurs", path: "/achats/fournisseurs" },
  ]},
  { title: "Stock", icon: Package, path: "/stock", subs: [
    { title: "Produits", path: "/stock/produits" },
    { title: "Dépôts", path: "/stock/depots" },
  ]},
  { title: "Ventes", icon: TrendingUp, path: "/ventes", subs: [
    { title: "Clients", path: "/ventes/clients" },
  ]},
  { title: "Facturation", icon: FileText, path: "/facturation" },
  { title: "Règlements & Trésorerie", icon: Wallet, path: "/reglements", subs: [
    { title: "Comptes Bancaires", path: "/reglements/comptes-bancaires" },
    { title: "Caisses", path: "/reglements/caisses" },
  ]},
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemeOpen, setSystemeOpen] = useState(false);
  const location = useLocation();
  const { profile, roles, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const hasAccess = (path: string) => {
    if (roles.length === 0) return true; // First user before role assignment
    const allowed = ROLE_MODULE_ACCESS[path];
    if (!allowed) return true;
    return allowed.some((r) => roles.includes(r));
  };

  const isSystemeActive = location.pathname === "/" || location.pathname.startsWith("/systeme");

  const visibleSystemeSubs = systemeSubItems.filter((s) => hasAccess(s.path));
  const visibleModules = mainModules.filter((m) => hasAccess(m.path));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        {!collapsed && (
          <img src={logo} alt="TijaraPro" className="h-8 object-contain brightness-0 invert" />
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-md gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            T
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {/* Système Central */}
        <div>
          <button
            onClick={() => { if (!collapsed) setSystemeOpen(!systemeOpen); }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 w-full
              ${isSystemeActive ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? "Système Central" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">Système Central</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${systemeOpen ? "rotate-180" : ""}`} />
              </>
            )}
          </button>

          {!collapsed && systemeOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                  ${location.pathname === "/" ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                `}
              >
                Vue d'ensemble
              </Link>
              {visibleSystemeSubs.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                    ${isActive(sub.path) ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                  `}
                >
                  <sub.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{sub.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {visibleModules.map((mod) => (
          <div key={mod.path}>
            <Link
              to={mod.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${isActive(mod.path) ? "bg-sidebar-accent text-sidebar-primary-foreground border-l-2 border-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"}
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? mod.title : undefined}
            >
              <mod.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{mod.title}</span>}
            </Link>
            {!collapsed && (mod as any).subs && isActive(mod.path) && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                {((mod as any).subs as { title: string; path: string }[]).map((sub) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                      ${location.pathname === sub.path ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    `}
                  >
                    <span className="truncate">{sub.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-2 py-3 border-t border-sidebar-border space-y-2">
        {!collapsed && profile && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">{profile.full_name || profile.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {roles.map((r) => (
                <Badge key={r} variant="outline" className="text-[9px] border-sidebar-border text-sidebar-foreground">
                  {ROLE_LABELS[r]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 text-sm transition-colors"
          title="Déconnexion"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Déconnexion</span>}
        </button>

        <div className="hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 text-sm transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Réduire</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-secondary text-secondary-foreground shadow-card"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-foreground/40 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed lg:static z-50 top-0 left-0 h-screen bg-secondary text-secondary-foreground
          transition-all duration-300 flex flex-col shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-16" : "w-64"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
