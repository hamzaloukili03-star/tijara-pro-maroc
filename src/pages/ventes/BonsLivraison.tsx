import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useDeliveries } from "@/hooks/useSales";
import { useStockEngine } from "@/hooks/useStockEngine";
import { DeliveryDetailPage } from "@/components/sales/DeliveryDetailPage";
import { DeliveryListPage } from "@/components/sales/DeliveryListPage";

const BonsLivraison = () => {
  const deliveries = useDeliveries();
  const stock = useStockEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const item = deliveries.items.find(d => d.id === selectedId);
    if (item) {
      return (
        <DeliveryDetailPage
          delivery={item}
          hook={deliveries}
          stock={stock}
          onBack={() => setSelectedId(null)}
        />
      );
    }
  }

  return (
    <AppLayout title="Bons de livraison" subtitle="Suivi des livraisons clients">
      <DeliveryListPage
        deliveries={deliveries}
        stock={stock}
        onView={(id) => setSelectedId(id)}
      />
    </AppLayout>
  );
};

export default BonsLivraison;
