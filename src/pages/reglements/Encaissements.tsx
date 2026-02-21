import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { PaymentList } from "@/components/payments/PaymentList";
import { ViewToggle } from "@/components/ViewToggle";
import { KanbanBoard } from "@/components/KanbanBoard";
import { PAYMENT_KANBAN_COLUMNS, mapPaymentCard } from "@/lib/kanban-config";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/hooks/useAuth";
import type { KanbanTransition } from "@/components/KanbanBoard";

const Encaissements = () => {
  const { isAdmin } = useAuth();
  const { payments, loading } = usePayments("client");
  const [view, setView] = useState<"list" | "kanban">("list");

  // Only show cheque payments in kanban
  const chequePayments = payments.filter(p => p.payment_method === "cheque");
  const cards = chequePayments.map(p => mapPaymentCard(p, "client"));

  const transitions: KanbanTransition[] = [];

  return (
    <AppLayout title="Encaissements" subtitle="Paiements clients reçus">
      <div className="flex items-center justify-between mb-4">
        <div />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "list" ? (
        <PaymentList paymentType="client" />
      ) : (
        <KanbanBoard
          columns={PAYMENT_KANBAN_COLUMNS}
          cards={cards}
          transitions={transitions}
          isAdmin={isAdmin()}
        />
      )}
    </AppLayout>
  );
};

export default Encaissements;
