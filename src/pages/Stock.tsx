import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";

const Stock = () => (
  <AppLayout title="Stock" subtitle="Gestion des stocks et inventaires">
    <EmptyState
      icon={<Package className="h-8 w-8" />}
      title="Aucun article en stock"
      description="Ajoutez vos premiers articles pour commencer à gérer votre inventaire et suivre les mouvements de stock."
      actionLabel="Ajouter un article"
      onAction={() => {}}
    />
  </AppLayout>
);

export default Stock;
