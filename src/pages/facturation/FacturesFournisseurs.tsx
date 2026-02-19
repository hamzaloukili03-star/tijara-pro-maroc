import { AppLayout } from "@/components/AppLayout";
import { InvoiceList } from "@/components/invoice/InvoiceList";
import type { Invoice } from "@/types/invoice";
import { useNavigate } from "react-router-dom";

const FacturesFournisseurs = () => {
  const navigate = useNavigate();

  const handleCreateCreditNote = (invoice: Invoice) => {
    navigate("/facturation/avoirs", { state: { linkedInvoice: invoice } });
  };

  return (
    <AppLayout title="Factures Fournisseurs" subtitle="Gestion des factures fournisseurs">
      <InvoiceList invoiceType="supplier" onCreateCreditNote={handleCreateCreditNote} />
    </AppLayout>
  );
};

export default FacturesFournisseurs;
