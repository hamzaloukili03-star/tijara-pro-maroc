import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Users } from "lucide-react";

const SystemeUtilisateurs = () => (
  <AppLayout title="Utilisateurs & Rôles" subtitle="Gestion des utilisateurs et des permissions">
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="Aucun utilisateur configuré"
      description="Ajoutez des utilisateurs et attribuez-leur des rôles pour contrôler les accès aux modules de l'ERP."
      actionLabel="Ajouter un utilisateur"
      onAction={() => {}}
    />
  </AppLayout>
);

export default SystemeUtilisateurs;
