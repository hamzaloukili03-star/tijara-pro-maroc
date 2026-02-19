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
  Database,
  Warehouse,
  UserCheck,
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

const referentielSubItems = [
  { title: "Clients", icon: UserCheck, path: "/referentiel/clients" },
  { title: "Fournisseurs", icon: ShoppingCart, path: "/referentiel/fournisseurs" },
  { title: "Produits", icon: Package, path: "/referentiel/produits" },
  { title: "Dépôts", icon: Warehouse, path: "/referentiel/depots" },
];

const mainModules = [
  { title: "Tableaux de Bord & Analyses", icon: BarChart3, path: "/tableaux-de-bord" },
  { title: "Achats", icon: ShoppingCart, path: "/achats" },
  { title: "Stock", icon: Package, path: "/stock" },
  { title: "Ventes", icon: TrendingUp, path: "/ventes" },
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
  const [referentielOpen, setReferentielOpen] = useState(false);
  const location = useLocation();
  const { profile, roles, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const hasAccess = (path: string) => {
    if (roles.length === 0) return true;
    const allowed = ROLE_MODULE_ACCESS[path];
    if (!allowed) return true;
    return allowed.some((r) => roles.includes(r));
  };

  const isSystemeActive = location.pathname === "/" || location.pathname.startsWith("/systeme");
  const isReferentielActive = location.pathname.startsWith("/referentiel");

  const visibleSystemeSubs = systemeSubItems.filter((s) => hasAccess(s.path));
  const visibleModules = mainModules.filter((m) => hasAccess(m.path));

  const activeItemClass = "bg-gradient-to-r from-[rgba(38,182,231,0.2)] to-[rgba(38,182,231,0.08)] text-white border-l-[3px] border-[hsl(197,100%,53%)] shadow-[0_0_10px_rgba(38,182,231,0.12)]";
  const inactiveItemClass = "text-[hsl(210,20%,72%)] hover:bg-gradient-to-r hover:from-[rgba(38,182,231,0.12)] hover:to-[rgba(38,182,231,0.03)] hover:text-white border-l-[3px] border-transparent";

  const renderCollapsibleSection = (
    label: string,
    icon: React.ElementType,
    isOpen: boolean,
    setOpen: (v: boolean) => void,
    isActiveSection: boolean,
    subItems: typeof systemeSubItems,
    extraTopItem?: { label: string; path: string },
  ) => {
    const Icon = icon;
    return (
      <div>
        <button
          onClick={() => { if (!collapsed) setOpen(!isOpen); }}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full
            ${isActiveSection ? activeItemClass : inactiveItemClass}
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? label : undefined}
        >
          <Icon className="h-5 w-5 shrink-0" />
          {!collapsed && (
            <>
              <span className="truncate flex-1 text-left">{label}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>

        {!collapsed && isOpen && (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
            {extraTopItem && (
              <Link
                to={extraTopItem.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${location.pathname === extraTopItem.path ? "bg-white/[0.1] text-white" : "text-[hsl(210,20%,65%)] hover:bg-white/[0.06] hover:text-white"}
                `}
              >
                {extraTopItem.label}
              </Link>
            )}
            {subItems.map((sub) => (
              <Link
                key={sub.path}
                to={sub.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive(sub.path) ? "bg-white/[0.1] text-white" : "text-[hsl(210,20%,65%)] hover:bg-white/[0.06] hover:text-white"}
                `}
              >
                <sub.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{sub.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.08]">
        {!collapsed && (
          <img src={logo} alt="TijaraPro" className="h-8 object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(38,182,231,0.3)]" />
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(38,182,231,0.25)]"
            style={{ background: "linear-gradient(135deg, hsl(197,90%,50%), hsl(208,60%,30%))" }}>
            T
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1.5 px-2 overflow-y-auto scrollbar-thin">
        {/* Administration */}
        {renderCollapsibleSection(
          "Administration", Settings, systemeOpen, setSystemeOpen, isSystemeActive,
          visibleSystemeSubs, { label: "Vue d'ensemble", path: "/" }
        )}

        {/* Référentiel */}
        {renderCollapsibleSection(
          "Référentiel", Database, referentielOpen, setReferentielOpen, isReferentielActive,
          referentielSubItems
        )}

        {visibleModules.map((mod) => (
          <div key={mod.path}>
            <Link
              to={mod.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive(mod.path) ? activeItemClass : inactiveItemClass}
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? mod.title : undefined}
            >
              <mod.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{mod.title}</span>}
            </Link>
            {!collapsed && (mod as any).subs && isActive(mod.path) && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3">
                {((mod as any).subs as { title: string; path: string }[]).map((sub) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      ${location.pathname === sub.path ? "bg-white/[0.1] text-white" : "text-[hsl(210,20%,65%)] hover:bg-white/[0.06] hover:text-white"}
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
      <div className="px-2 py-3 border-t border-white/[0.08] space-y-2">
        {!collapsed && profile && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white truncate">{profile.full_name || profile.email}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {roles.map((r) => (
                <Badge key={r} variant="outline" className="text-[9px] border-white/[0.15] text-[hsl(210,20%,72%)]">
                  {ROLE_LABELS[r]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[hsl(210,20%,72%)] hover:bg-white/[0.06] hover:text-white text-sm transition-all duration-200"
          title="Déconnexion"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Déconnexion</span>}
        </button>

        <div className="hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[hsl(210,20%,72%)] hover:bg-white/[0.06] hover:text-white text-sm transition-all duration-200"
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

      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`} />

      <aside
        className={`
          fixed z-50 top-0 left-0 h-screen text-white
          transition-all duration-300 flex flex-col shrink-0
          overflow-y-auto overflow-x-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-16" : "w-64"}
        `}
        style={{
          background: `
            radial-gradient(circle at 10% 5%, rgba(38,182,231,0.08), transparent 40%),
            linear-gradient(180deg, #0B2A45 0%, #0F2E4D 35%, #163E63 70%, #1A4B78 100%)
          `,
          boxShadow: "inset -1px 0 0 0 rgba(255,255,255,0.04), 3px 0 24px -6px rgba(0,0,0,0.3)",
          height: "100vh",
          minHeight: "100vh",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
