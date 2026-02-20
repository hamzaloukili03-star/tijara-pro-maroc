import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCompany } from "@/hooks/useCompany";
import {
  Settings,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  FileText,
  Wallet,
  BarChart3,
  ChevronDown,
  Menu,
  Users,
  Building2,
  Cog,
  ClipboardList,
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
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_MODULE_ACCESS } from "@/types/auth";
import logo from "@/assets/logo-tijarapro-white.png";

interface SubItem {
  title: string;
  icon: any;
  path: string;
}

interface SidebarSection {
  label: string;
  icon: any;
  basePath: string;
  adminOnly?: boolean;
  subItems: SubItem[];
}

const sections: SidebarSection[] = [
  {
    label: "Tableaux de Bord",
    icon: BarChart3,
    basePath: "/tableaux-de-bord",
    subItems: [],
  },
  {
    label: "Référentiels",
    icon: Database,
    basePath: "/referentiel",
    subItems: [
      { title: "Clients", icon: UserCheck, path: "/referentiel/clients" },
      { title: "Fournisseurs", icon: Truck, path: "/referentiel/fournisseurs" },
      { title: "Produits", icon: Package, path: "/referentiel/produits" },
      { title: "Catégories", icon: Tag, path: "/referentiel/categories" },
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
    label: "Dépenses",
    icon: TrendingDown,
    basePath: "/depenses",
    subItems: [],
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
  // Administration — last, super_admin only
  {
    label: "Administration",
    icon: Settings,
    basePath: "/systeme",
    adminOnly: true,
    subItems: [
      { title: "Vue d'ensemble", icon: BarChart3, path: "/" },
      { title: "Utilisateurs", icon: Users, path: "/systeme/utilisateurs" },
      { title: "Profils & Rôles", icon: ShieldCheck, path: "/systeme/profils" },
      { title: "Gestion des Sociétés", icon: Building2, path: "/systeme/societes" },
      { title: "Paramètres Société", icon: Building2, path: "/systeme/societe" },
      { title: "Paramètres Système", icon: Cog, path: "/systeme/parametres" },
      { title: "Logs d'activité", icon: ClipboardList, path: "/systeme/logs" },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const path = window.location.pathname;
    const active = sections.find(s => s.subItems.length > 0 && (
      s.basePath === "/systeme"
        ? (path === "/" || path.startsWith("/systeme"))
        : path.startsWith(s.basePath)
    ));
    return active?.label ?? null;
  });
  const { roles } = useAuth();
  const { activeCompany } = useCompany();
  const isSuperAdmin = roles.includes("super_admin");

  // Sync open section when route changes via sub-link click
  useEffect(() => {
    const active = sections.find(s => s.subItems.length > 0 && (
      s.basePath === "/systeme"
        ? (location.pathname === "/" || location.pathname.startsWith("/systeme"))
        : location.pathname.startsWith(s.basePath)
    ));
    if (active) setOpenSection(active.label);
  }, [location.pathname]);

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
    setOpenSection(prev => prev === label ? null : label);
  };

  const isOpen = (section: SidebarSection) => openSection === section.label;

  const activeItemClass = "bg-gradient-to-r from-[rgba(38,182,231,0.2)] to-[rgba(38,182,231,0.08)] text-white border-l-[3px] border-[hsl(197,100%,53%)] shadow-[0_0_10px_rgba(38,182,231,0.12)]";
  const inactiveItemClass = "text-[hsl(210,20%,72%)] hover:bg-gradient-to-r hover:from-[rgba(38,182,231,0.12)] hover:to-[rgba(38,182,231,0.03)] hover:text-white border-l-[3px] border-transparent";

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo TijaraPro */}
      <div className="flex items-center justify-center px-5 py-5 border-b border-white/[0.08]">
        {!collapsed && (
          <img src={logo} alt="TijaraPro" className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(38,182,231,0.35)]" />
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(38,182,231,0.25)]"
            style={{ background: "linear-gradient(135deg, hsl(197,90%,50%), hsl(208,60%,30%))" }}>
            T
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto scrollbar-thin">
        {sections.map((section) => {
          if (!hasAccess(section.basePath)) return null;
          if (section.adminOnly && !isSuperAdmin) return null;

          const sectionIsOpen = isOpen(section);
          const sectionActive = isSectionActive(section);
          const Icon = section.icon;

          // Simple link (no sub-items) like Tableaux de Bord
          if (section.subItems.length === 0) {
            return (
              <Link
                key={section.label}
                to={section.basePath}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                  ${sectionActive ? activeItemClass : inactiveItemClass}
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? section.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{section.label}</span>}
              </Link>
            );
          }

          // Collapsible section
          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 w-full
                  ${sectionActive ? activeItemClass : inactiveItemClass}
                  ${collapsed ? "justify-center" : ""}
                `}
                title={collapsed ? section.label : undefined}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{section.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-in-out ${sectionIsOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>

              {!collapsed && (
                <div
                  className="ml-4 border-l border-white/[0.08] pl-3 overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: sectionIsOpen ? `${section.subItems.length * 34 + 6}px` : "0px",
                    opacity: sectionIsOpen ? 1 : 0,
                    marginTop: sectionIsOpen ? "4px" : "0px",
                  }}
                >
                  <div className="space-y-0.5">
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
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200
                            ${subActive ? "bg-white/[0.1] text-white" : "text-[hsl(210,20%,65%)] hover:bg-white/[0.06] hover:text-white"}
                          `}
                        >
                          <SubIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">{sub.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer: active company logo */}
      {!collapsed && activeCompany?.logo_url && (
        <div className="px-4 py-3 border-t border-white/[0.08] shrink-0">
          <div className="w-full flex items-center justify-center rounded-xl bg-white/[0.05] px-3 py-2.5 overflow-hidden">
            <img
              src={activeCompany.logo_url}
              alt={activeCompany.raison_sociale}
              className="w-full max-h-10 object-contain object-center opacity-80 hover:opacity-100 transition-opacity duration-200"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      )}
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
