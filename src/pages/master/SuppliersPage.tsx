import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useCrud } from "@/hooks/useCrud";
import { useCompany } from "@/hooks/useCompany";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { SupplierKanban } from "@/components/master/SupplierKanban";
import { ViewToggle } from "@/components/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { Truck, AlertCircle } from "lucide-react";

interface Supplier {
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

interface SupplierStats {
  [supplierId: string]: {
    totalPurchases: number;
    outstandingDebt: number;
  };
}

const fmtNum = (n: number) =>
  n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function SuppliersPage() {
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;
  const { data, loading, create, update, remove } = useCrud<Supplier>({
    table: "suppliers",
    orderBy: "code",
    ascending: true,
    companyScoped: true,
  });

  const [stats, setStats] = useState<SupplierStats>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");

  const fetchStats = useCallback(async () => {
    if (!data.length) return;
    setStatsLoading(true);
    let query = (supabase as any)
      .from("invoices")
      .select("supplier_id, total_ttc, remaining_balance")
      .eq("invoice_type", "supplier")
      .in("status", ["validated", "paid"]);
    if (companyId) query = query.eq("company_id", companyId);
    const { data: invoices } = await query;

    const map: SupplierStats = {};
    (invoices || []).forEach((inv: any) => {
      const sid = inv.supplier_id;
      if (!sid) return;
      if (!map[sid]) map[sid] = { totalPurchases: 0, outstandingDebt: 0 };
      map[sid].totalPurchases += Number(inv.total_ttc);
      map[sid].outstandingDebt += Number(inv.remaining_balance);
    });
    setStats(map);
    setStatsLoading(false);
  }, [data, companyId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fields: FieldConfig[] = [
    { key: "code", label: "Code", required: true, placeholder: "FRN-001" },
    { key: "name", label: "Raison sociale", required: true, placeholder: "Nom du fournisseur" },
    { key: "contact_name", label: "Contact", placeholder: "Nom du contact" },
    { key: "email", label: "Email", type: "email", placeholder: "email@fournisseur.ma" },
    { key: "phone", label: "Téléphone", placeholder: "+212..." },
    { key: "city", label: "Ville", placeholder: "Casablanca" },
    {
      key: "credit_limit",
      label: "Plafond crédit (MAD)",
      type: "number",
      placeholder: "50000",
      defaultValue: 0,
      showInTable: true,
      render: (val) => (
        <span className="tabular-nums text-sm font-medium">
          {fmtNum(Number(val || 0))}
        </span>
      ),
    },
    {
      key: "id",
      label: "Total achats",
      showInTable: true,
      render: (_val, row) => (
        <span className="tabular-nums text-sm font-semibold text-primary">
          {fmtNum(stats[row.id]?.totalPurchases ?? 0)}
        </span>
      ),
    } as any,
    {
      key: "__debt",
      label: "Encours",
      showInTable: true,
      render: (_val, row) => {
        const debt = stats[row.id]?.outstandingDebt ?? 0;
        const limit = Number(row.credit_limit || 0);
        const overLimit = limit > 0 && debt > limit;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`tabular-nums text-sm font-semibold ${overLimit ? "text-destructive" : debt > 0 ? "text-warning" : "text-muted-foreground"}`}>
              {fmtNum(debt)}
            </span>
            {overLimit && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">
                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                Dépassé
              </Badge>
            )}
          </div>
        );
      },
    } as any,
    { key: "ice", label: "ICE", showInTable: false },
    { key: "rc", label: "RC", showInTable: false },
    { key: "if_number", label: "IF", showInTable: false },
    { key: "patente", label: "Patente", showInTable: false },
    { key: "address", label: "Adresse", type: "textarea", showInTable: false },
    {
      key: "payment_terms",
      label: "Conditions de paiement",
      type: "select",
      defaultValue: "30j",
      options: [
        { value: "30j", label: "30 jours" },
        { value: "60j", label: "60 jours" },
        { value: "90j", label: "90 jours" },
      ],
      showInTable: true,
      render: (val: any) => {
        const map: Record<string, string> = { "30j": "30 jours", "60j": "60 jours", "90j": "90 jours" };
        return <span className="text-sm text-muted-foreground">{map[val] ?? val ?? "—"}</span>;
      },
    },
    { key: "notes", label: "Notes", type: "textarea", showInTable: false },
  ];

  return (
    <AppLayout title="Fournisseurs" subtitle="Gestion des fournisseurs">
      {view === "list" ? (
        <MasterDataPage
          title="Fournisseur"
          icon={<Truck className="h-8 w-8" />}
          data={data}
          loading={loading || statsLoading}
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
          <SupplierKanban
            suppliers={data}
            stats={stats}
            onView={() => {}}
            onNewPO={() => {}}
          />
        </div>
      )}
    </AppLayout>
  );
}
