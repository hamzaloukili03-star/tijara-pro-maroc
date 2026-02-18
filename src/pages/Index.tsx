import { AppLayout } from "@/components/AppLayout";
import { Settings, Users, Building2, Globe, TrendingUp, FileText, BarChart3 } from "lucide-react";

const stats = [
  { label: "Utilisateurs actifs", value: "12", icon: Users },
  { label: "Entreprises", value: "3", icon: Building2 },
  { label: "Modules actifs", value: "8", icon: Globe },
  { label: "Chiffre d'affaires", value: "—", icon: TrendingUp },
  { label: "Factures ce mois", value: "—", icon: FileText },
  { label: "Taux de recouvrement", value: "—", icon: BarChart3 },
];

const Index = () => {
  return (
    <AppLayout title="Système Central" subtitle="Vue d'ensemble de votre activité">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-lg shadow-card border border-border p-5 hover:shadow-card-hover transition-shadow"
          >
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

      {/* Modules Grid */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Modules ERP
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Achats", "Stock", "Ventes", "Facturation", "Règlements", "BI", "Conformité", "Paramètres"].map(
            (mod) => (
              <div
                key={mod}
                className="p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-accent/50 transition-all text-center cursor-pointer"
              >
                <p className="text-sm font-medium text-foreground">{mod}</p>
              </div>
            )
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
