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
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import logo from "@/assets/logo-tijarapro.jpg";

const modules = [
  { title: "Système Central", icon: Settings, path: "/" },
  { title: "Achats", icon: ShoppingCart, path: "/achats" },
  { title: "Stock", icon: Package, path: "/stock" },
  { title: "Ventes", icon: TrendingUp, path: "/ventes" },
  { title: "Facturation", icon: FileText, path: "/facturation" },
  { title: "Règlements & Trésorerie", icon: Wallet, path: "/reglements" },
  { title: "Business Intelligence", icon: BarChart3, path: "/bi" },
  { title: "Conformité Marocaine", icon: Shield, path: "/conformite" },
  { title: "Documents", icon: FileText, path: "/documents" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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
        {modules.map((mod) => (
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

      {/* Collapse button - desktop only */}
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
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-md bg-secondary text-secondary-foreground shadow-card"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
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
