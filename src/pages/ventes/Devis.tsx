import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useQuotations } from "@/hooks/useSales";
import { SalesDocList } from "@/components/sales/SalesDocList";
import { SalesFormDialog } from "@/components/sales/SalesFormDialog";
import { QuotationDetailPage } from "@/components/sales/QuotationDetailPage";
import { ViewToggle } from "@/components/ViewToggle";
import { KanbanBoard } from "@/components/KanbanBoard";
import { QUOTATION_KANBAN_COLUMNS, getQuotationTransitions, mapQuotationCard } from "@/lib/kanban-config";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Devis = () => {
  const quotations = useQuotations();
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "kanban">("list");
  const navigate = useNavigate();

  if (selectedId) {
    const item = quotations.items.find(q => q.id === selectedId);
    if (item) {
      return (
        <QuotationDetailPage
          quotation={item}
          hook={quotations}
          onBack={() => setSelectedId(null)}
          onConvertedToOrder={() => {
            setSelectedId(null);
            navigate("/ventes/commandes");
          }}
        />
      );
    }
  }

  const transitions = getQuotationTransitions(quotations.markSent, quotations.confirm, quotations.cancel);
  const cards = quotations.items.map(mapQuotationCard);

  return (
    <AppLayout title="Devis" subtitle="Gestion des devis clients">
      <div className="flex items-center justify-between mb-4">
        <div />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "list" ? (
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
      ) : (
        <KanbanBoard
          columns={QUOTATION_KANBAN_COLUMNS}
          cards={cards}
          transitions={transitions}
          isAdmin={isAdmin()}
          onCardClick={(id) => setSelectedId(id)}
        />
      )}

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
