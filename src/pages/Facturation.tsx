import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { FileText } from "lucide-react";

const Facturation = () => (
  <AppLayout title="Facturation" subtitle="Gestion des factures et avoirs">
    <EmptyState
      icon={<FileText className="h-8 w-8" />}
      title="Aucune facture"
      description="Les factures seront générées automatiquement depuis les modules Ventes et Achats lors de la transition au statut 'Facturé'."
    />
  </AppLayout>
);

export default Facturation;
