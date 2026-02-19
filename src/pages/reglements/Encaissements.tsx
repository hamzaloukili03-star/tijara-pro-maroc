import { AppLayout } from "@/components/AppLayout";
import { PaymentList } from "@/components/payments/PaymentList";

const Encaissements = () => {
  return (
    <AppLayout title="Encaissements" subtitle="Paiements clients reçus">
      <PaymentList paymentType="client" />
    </AppLayout>
  );
};

export default Encaissements;
