import { AppLayout } from "@/components/AppLayout";
import { InvoiceList } from "@/components/invoice/InvoiceList";
import type { Invoice } from "@/types/invoice";
import { useNavigate } from "react-router-dom";

const FacturesClients = () => {
  const navigate = useNavigate();

  const handleCreateCreditNote = (invoice: Invoice) => {
    navigate("/facturation/avoirs", { state: { linkedInvoice: invoice } });
  };

  return (
    <AppLayout title="Factures Clients" subtitle="Gestion des factures clients">
      <InvoiceList invoiceType="client" onCreateCreditNote={handleCreateCreditNote} />
    </AppLayout>
  );
};

export default FacturesClients;
