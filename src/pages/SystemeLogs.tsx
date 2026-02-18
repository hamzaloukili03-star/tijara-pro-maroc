import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";

const SystemeLogs = () => (
  <AppLayout title="Logs d'activité" subtitle="Historique des actions et audit système">
    <EmptyState
      icon={<ClipboardList className="h-8 w-8" />}
      title="Aucun log enregistré"
      description="L'historique des actions utilisateur, transitions de documents et modifications critiques s'affichera ici automatiquement."
    />
  </AppLayout>
);

export default SystemeLogs;
