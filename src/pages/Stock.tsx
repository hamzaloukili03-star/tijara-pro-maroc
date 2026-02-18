import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { Package } from "lucide-react";

const Stock = () => (
  <AppLayout title="Stock" subtitle="Gestion des stocks et inventaires">
    <ModulePlaceholder
      title="Module Stock"
      description="Suivez vos mouvements de stock, inventaires et niveaux d'approvisionnement."
      icon={<Package className="h-8 w-8" />}
    />
  </AppLayout>
);

export default Stock;
