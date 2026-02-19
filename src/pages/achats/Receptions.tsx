import { AppLayout } from "@/components/AppLayout";
import { usePurchaseOrders } from "@/hooks/usePurchases";
import { useStockEngine } from "@/hooks/useStockEngine";
import { ReceptionPanel } from "@/components/purchases/ReceptionPanel";

const Receptions = () => {
  const orders = usePurchaseOrders();
  const stock = useStockEngine();

  return (
    <AppLayout title="Réceptions" subtitle="Réception des marchandises fournisseurs">
      <ReceptionPanel orders={orders} stock={stock} />
    </AppLayout>
  );
};

export default Receptions;
