import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { CustomerKanban } from "@/components/master/CustomerKanban";
import { ViewToggle } from "@/components/ViewToggle";
import { useCrud } from "@/hooks/useCrud";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

interface Customer {
  id: string;
  code: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  ice: string;
  payment_terms: string;
  credit_limit: number;
  is_active: boolean;
}

const fields: FieldConfig[] = [
  { key: "code", label: "Code", required: true, placeholder: "CLI-001" },
  { key: "name", label: "Raison sociale", required: true, placeholder: "Nom de l'entreprise" },
  { key: "contact_name", label: "Contact", placeholder: "Nom du contact" },
  { key: "email", label: "Email", type: "email", placeholder: "email@entreprise.ma" },
  { key: "phone", label: "Téléphone", placeholder: "+212..." },
  { key: "city", label: "Ville", placeholder: "Casablanca" },
  { key: "ice", label: "ICE", placeholder: "ICE", showInTable: false },
  { key: "rc", label: "RC", showInTable: false },
  { key: "if_number", label: "IF", showInTable: false },
  { key: "patente", label: "Patente", showInTable: false },
  { key: "address", label: "Adresse", type: "textarea", showInTable: false },
  { key: "payment_terms", label: "Conditions de paiement", type: "select", defaultValue: "30j", options: [
    { value: "comptant", label: "Comptant" },
    { value: "30j", label: "30 jours" },
    { value: "60j", label: "60 jours" },
    { value: "90j", label: "90 jours" },
  ], showInTable: false },
  { key: "credit_limit", label: "Plafond crédit (MAD)", type: "number", defaultValue: 0, showInTable: false },
  { key: "notes", label: "Notes", type: "textarea", showInTable: false },
];

export default function CustomersPage() {
  const { data, loading, create, update, remove } = useCrud<Customer>({ table: "customers", orderBy: "code", ascending: true, companyScoped: true });
  const { activeCompany } = useCompany();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [stats, setStats] = useState<Record<string, { outstandingReceivable: number }>>({});

  const fetchStats = useCallback(async () => {
    if (!data.length) return;
    let query = (supabase as any)
      .from("invoices")
      .select("customer_id, remaining_balance")
      .eq("invoice_type", "client")
      .in("status", ["validated", "paid"]);
    if (activeCompany?.id) query = query.eq("company_id", activeCompany.id);
    const { data: invoices } = await query;
    const map: Record<string, { outstandingReceivable: number }> = {};
    (invoices || []).forEach((inv: any) => {
      if (!inv.customer_id) return;
      if (!map[inv.customer_id]) map[inv.customer_id] = { outstandingReceivable: 0 };
      map[inv.customer_id].outstandingReceivable += Number(inv.remaining_balance);
    });
    setStats(map);
  }, [data, activeCompany?.id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <AppLayout title="Clients" subtitle="Gestion du portefeuille clients">
      {view === "list" ? (
        <MasterDataPage
          title="Client"
          icon={<Users className="h-8 w-8" />}
          data={data}
          loading={loading}
          fields={fields}
          onCreate={create}
          onUpdate={update}
          onDelete={remove}
          extraActions={<ViewToggle view={view} onChange={setView} />}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <ViewToggle view={view} onChange={setView} />
          </div>
          <CustomerKanban
            customers={data}
            stats={stats}
            onView={() => {}}
            onNewInvoice={() => {}}
          />
        </div>
      )}
    </AppLayout>
  );
}
