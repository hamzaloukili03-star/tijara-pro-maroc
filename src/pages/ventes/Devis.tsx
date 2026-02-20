import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useQuotations, useSalesOrders } from "@/hooks/useSales";
import { SalesDocList } from "@/components/sales/SalesDocList";
import { SalesFormDialog } from "@/components/sales/SalesFormDialog";
import { QuotationDetailPage } from "@/components/sales/QuotationDetailPage";
import { useNavigate } from "react-router-dom";

const Devis = () => {
  const quotations = useQuotations();
  const salesOrders = useSalesOrders();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (selectedId) {
    const item = quotations.items.find(q => q.id === selectedId);
    if (item) {
      return (
        <QuotationDetailPage
          quotation={item}
          hook={quotations}
          onBack={() => setSelectedId(null)}
          onConvertedToOrder={(soId) => {
            setSelectedId(null);
            navigate("/ventes/commandes");
          }}
        />
      );
    }
  }

  return (
    <AppLayout title="Devis" subtitle="Gestion des devis clients">
      <SalesDocList
        title="Devis"
        items={quotations.items}
        loading={quotations.loading}
        onCreate={() => setShowForm(true)}
        onView={(id) => setSelectedId(id)}
        onValidate={(id) => quotations.confirm(id)}
        onCancel={(id) => quotations.cancel(id)}
        onConvert={async (id, whId) => {
          await quotations.convertToOrder(id, whId);
          navigate("/ventes/commandes");
        }}
        docType="quotation"
      />
      {showForm && (
        <SalesFormDialog
          type="quotation"
          onClose={() => setShowForm(false)}
          onSubmit={async (customerId, lines, notes, terms) => {
            await quotations.create({ customerId, lines, notes, paymentTerms: terms });
            setShowForm(false);
          }}
        />
      )}
    </AppLayout>
  );
};

export default Devis;
