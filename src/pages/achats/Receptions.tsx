import { AppLayout } from "@/components/AppLayout";
import { useReceptions } from "@/hooks/usePurchases";
import { ReceptionListPage } from "@/components/purchases/ReceptionListPage";

const Receptions = () => {
  const hook = useReceptions();

  return (
    <AppLayout title="Réceptions" subtitle="Suivi des réceptions fournisseurs">
      <ReceptionListPage hook={hook} />
    </AppLayout>
  );
};

export default Receptions;
