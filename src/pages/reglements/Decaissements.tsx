import { AppLayout } from "@/components/AppLayout";
import { PaymentList } from "@/components/payments/PaymentList";

const Decaissements = () => {
  return (
    <AppLayout title="Décaissements" subtitle="Paiements fournisseurs émis">
      <PaymentList paymentType="supplier" />
    </AppLayout>
  );
};

export default Decaissements;
