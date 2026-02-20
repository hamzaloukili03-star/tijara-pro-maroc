import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useSalesOrders, useDeliveries } from "@/hooks/useSales";
import { useStockEngine } from "@/hooks/useStockEngine";
import { SalesDocList } from "@/components/sales/SalesDocList";
import { SalesOrderDetailPage } from "@/components/sales/SalesOrderDetailPage";

const CommandesClients = () => {
  const salesOrders = useSalesOrders();
  const stock = useStockEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const item = salesOrders.items.find(o => o.id === selectedId);
    if (item) {
      return (
        <SalesOrderDetailPage
          order={item}
          hook={salesOrders}
          stock={stock}
          onBack={() => setSelectedId(null)}
        />
      );
    }
  }

  return (
    <AppLayout title="Bons de commande clients" subtitle="Gestion des commandes clients">
      <SalesDocList
        title="Bons de commande"
        items={salesOrders.items}
        loading={salesOrders.loading}
        onView={(id) => setSelectedId(id)}
        onValidate={(id) => salesOrders.confirm(id, stock.reserveStock)}
        onCancel={(id) => salesOrders.cancel(id, stock.releaseReservation)}
        docType="order"
      />
    </AppLayout>
  );
};

export default CommandesClients;
