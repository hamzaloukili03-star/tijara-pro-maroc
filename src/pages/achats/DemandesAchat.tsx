import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { usePurchaseRequests } from "@/hooks/usePurchases";
import { PurchaseDocList } from "@/components/purchases/PurchaseDocList";
import { PurchaseFormDialog } from "@/components/purchases/PurchaseFormDialog";

const DemandesAchat = () => {
  const requests = usePurchaseRequests();
  const [showForm, setShowForm] = useState(false);

  return (
    <AppLayout title="Demandes d'achat" subtitle="Gestion des demandes d'achat internes">
      <PurchaseDocList
        title="Demandes d'achat"
        items={requests.items}
        loading={requests.loading}
        onCreate={() => setShowForm(true)}
        onValidate={(id) => requests.validate(id)}
        docType="request"
      />
      {showForm && (
        <PurchaseFormDialog
          type="request"
          onClose={() => setShowForm(false)}
          onSubmit={async (_supplierId, _warehouseId, lines, notes) => {
            await requests.create(lines.map(l => ({ product_id: l.product_id || "", description: l.description, quantity: l.quantity })), notes);
            setShowForm(false);
          }}
        />
      )}
    </AppLayout>
  );
};

export default DemandesAchat;
