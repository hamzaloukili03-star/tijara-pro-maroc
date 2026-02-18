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
} from "lucide-react";
import logo from "@/assets/logo-tijarapro.jpg";

const systemeSubItems = [
  { title: "Utilisateurs & Rôles", icon: Users, path: "/systeme/utilisateurs" },
  { title: "Paramètres Société", icon: Building2, path: "/systeme/societe" },
  { title: "Paramètres Système", icon: Cog, path: "/systeme/parametres" },
  { title: "Logs d'activité", icon: ClipboardList, path: "/systeme/logs" },
];

const mainModules = [
  { title: "Achats", icon: ShoppingCart, path: "/achats" },
  { title: "Stock", icon: Package, path: "/stock" },
  { title: "Ventes", icon: TrendingUp, path: "/ventes" },
  { title: "Facturation", icon: FileText, path: "/facturation" },
  { title: "Règlements & Trésorerie", icon: Wallet, path: "/reglements" },
  { title: "Tableaux de Bord & Analyses", icon: BarChart3, path: "/tableaux-de-bord" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemeOpen, setSystemeOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isSystemeActive = location.pathname === "/" || location.pathname.startsWith("/systeme");

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
        {/* Système Central - collapsible */}
        <div>
          <button
            onClick={() => {
              if (collapsed) return;
              setSystemeOpen(!systemeOpen);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 w-full
              ${isSystemeActive
                ? "bg-sidebar-accent text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }
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
                  ${location.pathname === "/"
                    ? "bg-sidebar-accent text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }
                `}
              >
                Vue d'ensemble
              </Link>
              {systemeSubItems.map((sub) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all
                    ${isActive(sub.path)
                      ? "bg-sidebar-accent text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }
                  `}
                >
                  <sub.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{sub.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Main modules */}
        {mainModules.map((mod) => (
          <Link
            key={mod.path}
            to={mod.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
              ${isActive(mod.path)
                ? "bg-sidebar-accent text-sidebar-primary-foreground border-l-2 border-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? mod.title : undefined}
          >
            <mod.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{mod.title}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="hidden lg:flex px-2 py-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 text-sm transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span>Réduire</span>}
        </button>
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
        <div
          className="lg:hidden fixed inset-0 bg-foreground/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
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
