import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Building2 } from "lucide-react";

const SystemeSociete = () => (
  <AppLayout title="Paramètres Société" subtitle="Informations légales et fiscales de l'entreprise">
    <EmptyState
      icon={<Building2 className="h-8 w-8" />}
      title="Société non configurée"
      description="Renseignez les informations de votre entreprise : raison sociale, ICE, IF, RC, patente, adresse et coordonnées bancaires."
      actionLabel="Configurer la société"
      onAction={() => {}}
    />
  </AppLayout>
);

export default SystemeSociete;
