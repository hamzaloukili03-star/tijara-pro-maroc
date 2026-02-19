import { AppLayout } from "@/components/AppLayout";
import { Link } from "react-router-dom";
import { Settings, Users, Building2, ShoppingCart, Package, TrendingUp, FileText, Wallet, BarChart3, ArrowRight } from "lucide-react";

const modules = [
  { label: "Achats", icon: ShoppingCart, path: "/achats", desc: "Fournisseurs & commandes", color: "hsl(38, 92%, 50%)" },
  { label: "Stock", icon: Package, path: "/stock", desc: "Inventaire & mouvements", color: "hsl(152, 60%, 45%)" },
  { label: "Ventes", icon: TrendingUp, path: "/ventes", desc: "Clients & devis", color: "hsl(197, 100%, 53%)" },
  { label: "Facturation", icon: FileText, path: "/facturation", desc: "Factures & avoirs", color: "hsl(210, 60%, 16%)" },
  { label: "Règlements", icon: Wallet, path: "/reglements", desc: "Paiements & trésorerie", color: "hsl(280, 60%, 55%)" },
  { label: "Tableaux de Bord", icon: BarChart3, path: "/tableaux-de-bord", desc: "Analyses & rapports", color: "hsl(197, 100%, 53%)" },
];

const stats = [
  { label: "Utilisateurs actifs", value: "—", icon: Users, color: "hsl(197, 100%, 53%)" },
  { label: "Entreprises", value: "—", icon: Building2, color: "hsl(152, 60%, 45%)" },
  { label: "Modules actifs", value: "6", icon: Settings, color: "hsl(38, 92%, 50%)" },
];

const Index = () => (
  <AppLayout title="Système Central" subtitle="Vue d'ensemble de votre activité">
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
            <div className="h-1 w-full" style={{ background: stat.color }} />
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Modules ERP
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {modules.map((mod) => (
              <Link
                key={mod.path}
                to={mod.path}
                className="group relative p-4 rounded-xl border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${mod.color}15` }}>
                  <mod.icon className="h-5 w-5" style={{ color: mod.color }} />
                </div>
                <p className="text-sm font-semibold text-foreground">{mod.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                <ArrowRight className="absolute top-4 right-4 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
);

export default Index;
