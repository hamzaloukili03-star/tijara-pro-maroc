import { AppLayout } from "@/components/AppLayout";
import { Link } from "react-router-dom";
import { Package, Warehouse } from "lucide-react";

const Stock = () => (
  <AppLayout title="Stock" subtitle="Gestion des stocks et inventaires">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Link
        to="/stock/produits"
        className="bg-card rounded-lg border border-border shadow-card p-6 hover:border-primary/30 hover:bg-accent/30 transition-all group"
      >
        <Package className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
        <h3 className="font-semibold text-foreground">Produits & Articles</h3>
        <p className="text-sm text-muted-foreground mt-1">Gérez votre catalogue produits, prix et catégories.</p>
      </Link>
      <Link
        to="/stock/depots"
        className="bg-card rounded-lg border border-border shadow-card p-6 hover:border-primary/30 hover:bg-accent/30 transition-all group"
      >
        <Warehouse className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
        <h3 className="font-semibold text-foreground">Dépôts & Entrepôts</h3>
        <p className="text-sm text-muted-foreground mt-1">Configurez vos emplacements de stockage.</p>
      </Link>
    </div>
  </AppLayout>
);

export default Stock;
