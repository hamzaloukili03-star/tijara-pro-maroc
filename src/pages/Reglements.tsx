import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { Wallet } from "lucide-react";

const Reglements = () => (
  <AppLayout title="Règlements & Trésorerie" subtitle="Suivi des paiements et flux de trésorerie">
    <ModulePlaceholder
      title="Règlements & Trésorerie"
      description="Suivez vos règlements clients et fournisseurs, rapprochements bancaires et trésorerie."
      icon={<Wallet className="h-8 w-8" />}
    />
  </AppLayout>
);

export default Reglements;
