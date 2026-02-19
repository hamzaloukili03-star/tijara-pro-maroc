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
  Landmark,
  CreditCard,
  FileCheck,
  Truck,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  Link2,
  AlertTriangle,
  ArrowRightLeft,
  ClipboardCheck,
  Activity,
  ReceiptText,
  BarChart2,
  ScrollText,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_MODULE_ACCESS, ROLE_LABELS } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo-tijarapro.jpg";

interface SubItem {
  title: string;
  icon: any;
  path: string;
}

interface SidebarSection {
  label: string;
  icon: any;
  basePath: string;
  subItems: SubItem[];
}

const sections: SidebarSection[] = [
  {
    label: "Administration",
    icon: Settings,
    basePath: "/systeme",
    subItems: [
      { title: "Vue d'ensemble", icon: BarChart3, path: "/" },
      { title: "Utilisateurs & Rôles", icon: Users, path: "/systeme/utilisateurs" },
      { title: "Paramètres Société", icon: Building2, path: "/systeme/societe" },
      { title: "Paramètres Système", icon: Cog, path: "/systeme/parametres" },
      { title: "Logs d'activité", icon: ClipboardList, path: "/systeme/logs" },
    ],
  },
  {
    label: "Tableaux de Bord",
    icon: BarChart3,
    basePath: "/tableaux-de-bord",
    subItems: [],
  },
  {
    label: "Référentiel",
    icon: Database,
    basePath: "/referentiel",
    subItems: [
      { title: "Clients", icon: UserCheck, path: "/referentiel/clients" },
      { title: "Fournisseurs", icon: Truck, path: "/referentiel/fournisseurs" },
      { title: "Produits", icon: Package, path: "/referentiel/produits" },
      { title: "Dépôts", icon: Warehouse, path: "/referentiel/depots" },
      { title: "Comptes Bancaires", icon: Landmark, path: "/referentiel/comptes-bancaires" },
      { title: "Caisses", icon: CreditCard, path: "/referentiel/caisses" },
    ],
  },
  {
    label: "Achats",
    icon: ShoppingCart,
    basePath: "/achats",
    subItems: [
      { title: "Demandes d'achat", icon: FileCheck, path: "/achats/demandes" },
      { title: "Bons de commande", icon: ScrollText, path: "/achats/commandes" },
      { title: "Réceptions", icon: Package, path: "/achats/receptions" },
    ],
  },
  {
    label: "Stock",
    icon: Package,
    basePath: "/stock",
    subItems: [
      { title: "Niveaux de stock", icon: Activity, path: "/stock/niveaux" },
      { title: "Mouvements", icon: ArrowRightLeft, path: "/stock/mouvements" },
      { title: "Transferts", icon: ArrowRightLeft, path: "/stock/transferts" },
      { title: "Inventaires", icon: ClipboardCheck, path: "/stock/inventaires" },
    ],
  },
  {
    label: "Ventes",
    icon: TrendingUp,
    basePath: "/ventes",
    subItems: [
      { title: "Devis", icon: FileText, path: "/ventes/devis" },
      { title: "Bons de commande", icon: ScrollText, path: "/ventes/commandes" },
      { title: "Bons de livraison", icon: Truck, path: "/ventes/livraisons" },
    ],
  },
  {
    label: "Facturation",
    icon: FileText,
    basePath: "/facturation",
    subItems: [
      { title: "Factures Clients", icon: Receipt, path: "/facturation/clients" },
      { title: "Factures Fournisseurs", icon: Receipt, path: "/facturation/fournisseurs" },
      { title: "Avoirs", icon: ReceiptText, path: "/facturation/avoirs" },
      { title: "Exports & Journaux", icon: BarChart2, path: "/facturation/exports" },
    ],
  },
  {
    label: "Règlements & Trésorerie",
    icon: Wallet,
    basePath: "/reglements",
    subItems: [
      { title: "Encaissements", icon: ArrowDownCircle, path: "/reglements/encaissements" },
      { title: "Décaissements", icon: ArrowUpCircle, path: "/reglements/decaissements" },
      { title: "Rapprochement", icon: Link2, path: "/reglements/rapprochement" },
      { title: "Impayés & Relances", icon: AlertTriangle, path: "/reglements/impayes" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { profile, roles, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isSectionActive = (section: SidebarSection) => {
    if (section.basePath === "/systeme") {
      return location.pathname === "/" || location.pathname.startsWith("/systeme");
    }
    return location.pathname.startsWith(section.basePath);
  };

  const hasAccess = (path: string) => {
    if (roles.length === 0) return true;
    const allowed = ROLE_MODULE_ACCESS[path];
    if (!allowed) return true;
    return allowed.some((r) => roles.includes(r));
  };

  const toggleSection = (label: string) => {
    if (collapsed) return;
    setOpenSections(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Auto-open active section
  const getAutoOpen = (section: SidebarSection) => {
    if (openSections[section.label] !== undefined) return openSections[section.label];
    return isSectionActive(section);
  };

  const activeItemClass = "bg-gradient-to-r from-[rgba(38,182,231,0.2)] to-[rgba(38,182,231,0.08)] text-white border-l-[3px] border-[hsl(197,100%,53%)] shadow-[0_0_10px_rgba(38,182,231,0.12)]";
  const inactiveItemClass = "text-[hsl(210,20%,72%)] hover:bg-gradient-to-r hover:from-[rgba(38,182,231,0.12)] hover:to-[rgba(38,182,231,0.03)] hover:text-white border-l-[3px] border-transparent";

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
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto scrollbar-thin">
        {sections.map((section) => {
          if (!hasAccess(section.basePath)) return null;

          const isOpen = getAutoOpen(section);
          const sectionActive = isSectionActive(section);
          const Icon = section.icon;

          // Simple link (no sub-items) like Tableaux de Bord
          if (section.subItems.length === 0) {
            return (
              <Link
                key={section.label}
                to={section.basePath}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${sectionActive ? activeItemClass : inactiveItemClass}
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? section.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{section.label}</span>}
              </Link>
            );
          }

          // Collapsible section
          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full
                  ${sectionActive ? activeItemClass : inactiveItemClass}
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? section.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{section.label}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-white/[0.08] pl-3 animate-fade-in">
                  {section.subItems
                    .filter(sub => hasAccess(sub.path))
                    .map(sub => {
                      const SubIcon = sub.icon;
                      const subActive = sub.path === "/" ? location.pathname === "/" : isActive(sub.path);
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                            ${subActive ? "bg-white/[0.1] text-white" : "text-[hsl(210,20%,65%)] hover:bg-white/[0.06] hover:text-white"}
                          `}
                        >
                          <SubIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{sub.title}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
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
