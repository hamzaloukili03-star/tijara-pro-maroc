import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useDeliveries } from "@/hooks/useSales";
import { useStockEngine } from "@/hooks/useStockEngine";
import { DeliveryListPage } from "@/components/sales/DeliveryListPage";
import { DeliveryFormPage } from "@/components/sales/DeliveryFormPage";

const BonsLivraison = () => {
  const deliveries = useDeliveries();
  const stock = useStockEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // View existing delivery
  if (selectedId) {
    const item = deliveries.items.find((d: any) => d.id === selectedId);
    if (item) {
      return (
        <DeliveryFormPage
          delivery={item}
          stockEngine={stock}
          onBack={() => { setSelectedId(null); deliveries.fetch(); }}
          onSaved={() => deliveries.fetch()}
        />
      );
    }
  }

  // Create new
  if (creating) {
    return (
      <DeliveryFormPage
        stockEngine={stock}
        onBack={() => { setCreating(false); deliveries.fetch(); }}
        onSaved={(id) => { setCreating(false); setSelectedId(id); deliveries.fetch(); }}
      />
    );
  }

  return (
    <AppLayout title="Bons de livraison" subtitle="Suivi des livraisons clients">
      <DeliveryListPage
        deliveries={deliveries}
        stock={stock}
        onNew={() => setCreating(true)}
        onView={(id: string) => setSelectedId(id)}
      />
    </AppLayout>
  );
};

export default BonsLivraison;
