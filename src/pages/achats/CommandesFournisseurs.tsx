import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { usePurchaseOrders } from "@/hooks/usePurchases";
import { PurchaseDocList } from "@/components/purchases/PurchaseDocList";
import { PurchaseFormDialog } from "@/components/purchases/PurchaseFormDialog";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const CommandesFournisseurs = () => {
  const orders = usePurchaseOrders();
  const [showForm, setShowForm] = useState(false);
  const { settings } = useSystemSettings();
  const requireDoubleValidation = settings?.require_double_validation ?? false;

  return (
    <AppLayout title="Bons de commande fournisseurs" subtitle="Gestion des commandes fournisseurs">
      <PurchaseDocList
        title="Bons de commande fournisseurs"
        items={orders.items}
        loading={orders.loading}
        onCreate={() => setShowForm(true)}
        onValidate={(id) => orders.validate(id, requireDoubleValidation)}
        onAdminValidate={(id) => orders.adminValidate(id)}
        onCancel={(id) => orders.cancel(id)}
        docType="order"
      />
      {showForm && (
        <PurchaseFormDialog
          type="order"
          onClose={() => setShowForm(false)}
          onSubmit={async (supplierId, warehouseId, lines, notes) => {
            await orders.create(supplierId, warehouseId, lines, notes);
            setShowForm(false);
          }}
        />
      )}
    </AppLayout>
  );
};

export default CommandesFournisseurs;
