import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

const TableauxDeBord = () => (
  <AppLayout title="Tableaux de Bord & Analyses" subtitle="Indicateurs de performance et rapports">
    <EmptyState
      icon={<BarChart3 className="h-8 w-8" />}
      title="Aucune donnée à analyser"
      description="Les tableaux de bord et rapports s'afficheront automatiquement lorsque des données seront disponibles dans les modules Ventes, Achats et Stock."
    />
  </AppLayout>
);

export default TableauxDeBord;
