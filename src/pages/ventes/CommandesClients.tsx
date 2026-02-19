import { AppLayout } from "@/components/AppLayout";
import { useSalesOrders } from "@/hooks/useSales";
import { useStockEngine } from "@/hooks/useStockEngine";
import { SalesDocList } from "@/components/sales/SalesDocList";
import { DeliveryPanel } from "@/components/sales/DeliveryPanel";

const CommandesClients = () => {
  const salesOrders = useSalesOrders();
  const stock = useStockEngine();

  return (
    <AppLayout title="Bons de commande clients" subtitle="Gestion des commandes clients">
      <div className="space-y-6">
        <SalesDocList
          title="Bons de commande"
          items={salesOrders.items}
          loading={salesOrders.loading}
          onValidate={(id) => salesOrders.validate(id, stock.reserveStock)}
          onCancel={(id) => salesOrders.cancel(id, stock.releaseReservation)}
          docType="order"
        />
        <DeliveryPanel salesOrders={salesOrders} stock={stock} />
      </div>
    </AppLayout>
  );
};

export default CommandesClients;
