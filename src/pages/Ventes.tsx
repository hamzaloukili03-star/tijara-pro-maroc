import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { TrendingUp } from "lucide-react";

const Ventes = () => (
  <AppLayout title="Ventes" subtitle="Gestion commerciale et suivi des ventes">
    <ModulePlaceholder
      title="Module Ventes"
      description="Gérez vos clients, devis, commandes et suivi commercial."
      icon={<TrendingUp className="h-8 w-8" />}
    />
  </AppLayout>
);

export default Ventes;
