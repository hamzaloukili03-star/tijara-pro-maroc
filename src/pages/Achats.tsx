import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { ShoppingCart } from "lucide-react";

const Achats = () => (
  <AppLayout title="Achats" subtitle="Gestion des achats et fournisseurs">
    <ModulePlaceholder
      title="Module Achats"
      description="Gérez vos fournisseurs, bons de commande, réceptions et factures d'achat."
      icon={<ShoppingCart className="h-8 w-8" />}
    />
  </AppLayout>
);

export default Achats;
