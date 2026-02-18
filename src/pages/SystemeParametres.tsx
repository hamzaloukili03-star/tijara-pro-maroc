import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Cog } from "lucide-react";

const SystemeParametres = () => (
  <AppLayout title="Paramètres Système" subtitle="Configuration générale et conformité marocaine">
    <EmptyState
      icon={<Cog className="h-8 w-8" />}
      title="Paramètres par défaut"
      description="Configurez les taux de TVA, limite de paiement en espèces, devise, format de numérotation, conditions de paiement et paramètres fiscaux marocains."
      actionLabel="Configurer"
      onAction={() => {}}
    />
  </AppLayout>
);

export default SystemeParametres;
