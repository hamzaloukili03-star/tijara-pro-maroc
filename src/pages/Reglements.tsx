import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Wallet } from "lucide-react";

const Reglements = () => (
  <AppLayout title="Règlements & Trésorerie" subtitle="Suivi des paiements et flux de trésorerie">
    <EmptyState
      icon={<Wallet className="h-8 w-8" />}
      title="Aucun règlement enregistré"
      description="Les règlements apparaîtront ici lorsque des paiements seront enregistrés sur vos factures."
    />
  </AppLayout>
);

export default Reglements;
