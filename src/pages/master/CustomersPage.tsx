import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { MasterDataPage, FieldConfig } from "@/components/MasterDataPage";
import { CustomerKanban } from "@/components/master/CustomerKanban";
import { ViewToggle } from "@/components/ViewToggle";
import { useCrud } from "@/hooks/useCrud";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

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

  const openKanbanEdit = (item: Customer) => {
    const values: Record<string, any> = {};
    fields.forEach((f) => { values[f.key] = (item as any)[f.key] ?? ""; });
    setForm(values);
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingItem) return;
    setSaving(true);
    const ok = await update(editingItem.id, form as unknown as Partial<Customer>);
    setSaving(false);
    if (ok) setEditDialogOpen(false);
  };

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
            onView={openKanbanEdit}
          />
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[65vw] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Fiche Client</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((f) => (
                  <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <Label htmlFor={f.key}>{f.label}{f.required && " *"}</Label>
                    {f.type === "select" ? (
                      <select
                        id={f.key}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea
                        id={f.key}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={f.key}
                        type={f.type || "text"}
                        value={form[f.key] || ""}
                        onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                        placeholder={f.placeholder}
                        required={f.required}
                      />
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </AppLayout>
  );
}
