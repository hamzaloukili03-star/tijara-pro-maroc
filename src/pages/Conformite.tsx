import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Shield } from "lucide-react";

const Conformite = () => (
  <AppLayout title="Conformité Marocaine" subtitle="Réglementations fiscales et légales">
    <EmptyState
      icon={<Shield className="h-8 w-8" />}
      title="Module conformité"
      description="Configurez les paramètres fiscaux marocains : TVA, IS, IR, liasse fiscale et déclarations obligatoires."
      actionLabel="Configurer"
      onAction={() => {}}
    />
  </AppLayout>
);

export default Conformite;
