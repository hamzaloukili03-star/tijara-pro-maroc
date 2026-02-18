import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { FileText } from "lucide-react";

const Facturation = () => (
  <AppLayout title="Facturation" subtitle="Gestion des factures et avoirs">
    <ModulePlaceholder
      title="Module Facturation"
      description="Créez et gérez vos factures, avoirs et documents commerciaux."
      icon={<FileText className="h-8 w-8" />}
    />
  </AppLayout>
);

export default Facturation;
