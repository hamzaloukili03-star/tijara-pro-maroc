import { AppLayout } from "@/components/AppLayout";
import { Link } from "react-router-dom";
import { Settings, Users, Building2, ShoppingCart, Package, TrendingUp, FileText, Wallet, BarChart3, Shield } from "lucide-react";

const modules = [
  { label: "Achats", icon: ShoppingCart, path: "/achats", desc: "Fournisseurs & commandes" },
  { label: "Stock", icon: Package, path: "/stock", desc: "Inventaire & mouvements" },
  { label: "Ventes", icon: TrendingUp, path: "/ventes", desc: "Clients & devis" },
  { label: "Facturation", icon: FileText, path: "/facturation", desc: "Factures & avoirs" },
  { label: "Règlements", icon: Wallet, path: "/reglements", desc: "Paiements & trésorerie" },
  { label: "BI", icon: BarChart3, path: "/bi", desc: "Analyses & rapports" },
  { label: "Conformité", icon: Shield, path: "/conformite", desc: "Fiscal & légal" },
  { label: "Documents", icon: FileText, path: "/documents", desc: "Modèles commerciaux" },
];

const stats = [
  { label: "Utilisateurs actifs", value: "—", icon: Users },
  { label: "Entreprises", value: "—", icon: Building2 },
  { label: "Modules actifs", value: "8", icon: Settings },
];

const Index = () => (
  <AppLayout title="Système Central" subtitle="Vue d'ensemble de votre activité">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="bg-card rounded-lg shadow-card border border-border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        Modules ERP
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {modules.map((mod) => (
          <Link
            key={mod.path}
            to={mod.path}
            className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all text-center group"
          >
            <mod.icon className="h-5 w-5 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
            <p className="text-sm font-medium text-foreground">{mod.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{mod.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default Index;
