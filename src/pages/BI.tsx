import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

const BI = () => (
  <AppLayout title="Business Intelligence" subtitle="Tableaux de bord et analyses">
    <EmptyState
      icon={<BarChart3 className="h-8 w-8" />}
      title="Aucune donnée à analyser"
      description="Les tableaux de bord et rapports s'afficheront automatiquement lorsque des données seront disponibles dans les modules Ventes, Achats et Stock."
    />
  </AppLayout>
);

export default BI;
