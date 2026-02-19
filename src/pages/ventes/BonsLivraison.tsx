import { AppLayout } from "@/components/AppLayout";
import { useSalesOrders } from "@/hooks/useSales";
import { useStockEngine } from "@/hooks/useStockEngine";
import { DeliveryPanel } from "@/components/sales/DeliveryPanel";

const BonsLivraison = () => {
  const salesOrders = useSalesOrders();
  const stock = useStockEngine();

  return (
    <AppLayout title="Bons de livraison" subtitle="Suivi des livraisons clients">
      <DeliveryPanel salesOrders={salesOrders} stock={stock} showAll />
    </AppLayout>
  );
};

export default BonsLivraison;
