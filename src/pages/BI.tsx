import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { BarChart3 } from "lucide-react";

const BI = () => (
  <AppLayout title="Business Intelligence" subtitle="Tableaux de bord et analyses">
    <ModulePlaceholder
      title="Business Intelligence"
      description="Analysez vos performances avec des tableaux de bord interactifs et rapports détaillés."
      icon={<BarChart3 className="h-8 w-8" />}
    />
  </AppLayout>
);

export default BI;
