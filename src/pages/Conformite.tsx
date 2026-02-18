import { AppLayout } from "@/components/AppLayout";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";
import { Shield } from "lucide-react";

const Conformite = () => (
  <AppLayout title="Conformité Marocaine" subtitle="Réglementations fiscales et légales">
    <ModulePlaceholder
      title="Conformité Marocaine"
      description="Assurez la conformité avec les réglementations fiscales marocaines : TVA, IS, IR, liasse fiscale."
      icon={<Shield className="h-8 w-8" />}
    />
  </AppLayout>
);

export default Conformite;
