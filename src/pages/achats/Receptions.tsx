import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useReceptions } from "@/hooks/usePurchases";
import { useStockEngine } from "@/hooks/useStockEngine";
import { ReceptionListPage } from "@/components/purchases/ReceptionListPage";
import { ReceptionFormPage } from "@/components/purchases/ReceptionFormPage";

const Receptions = () => {
  const hook = useReceptions();
  const stock = useStockEngine();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // View existing reception
  if (selectedId) {
    const item = hook.items.find((r: any) => r.id === selectedId);
    if (item) {
      return (
        <ReceptionFormPage
          reception={item}
          stockEngine={stock}
          onBack={() => { setSelectedId(null); hook.fetch(); }}
          onSaved={() => hook.fetch()}
        />
      );
    }
  }

  // Create new
  if (creating) {
    return (
      <ReceptionFormPage
        stockEngine={stock}
        onBack={() => { setCreating(false); hook.fetch(); }}
        onSaved={(id) => { setCreating(false); setSelectedId(id); hook.fetch(); }}
      />
    );
  }

  return (
    <AppLayout title="Réceptions" subtitle="Suivi des réceptions fournisseurs">
      <ReceptionListPage
        hook={hook}
        onNew={() => setCreating(true)}
        onView={(id: string) => setSelectedId(id)}
      />
    </AppLayout>
  );
};

export default Receptions;
