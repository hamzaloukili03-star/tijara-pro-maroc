import { useState, useEffect } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceFormDialog } from "./InvoiceFormDialog";
import { InvoiceDetailDialog } from "./InvoiceDetailDialog";
import { INVOICE_STATUS_LABELS, type Invoice, type InvoiceLine } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Loader2, Eye, Pencil, Trash2, Printer } from "lucide-react";
import { generateDocumentPdf } from "@/lib/pdf-generator";

interface InvoiceListProps {
  invoiceType: "client" | "supplier";
  onCreateCreditNote: (invoice: Invoice) => void;
}

export function InvoiceList({ invoiceType, onCreateCreditNote }: InvoiceListProps) {
  const { invoices, loading, create, updateInvoice, updateLines, fetchLines, validateInvoice, cancelInvoice, markPaid, remove } = useInvoices(invoiceType);
  const { isAdmin, hasRole } = useAuth();
  const { activeCompany } = useCompany();
  const { settings: companySettings } = useCompanySettings();
  const canManage = isAdmin() || hasRole("accountant");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [editLines, setEditLines] = useState<Partial<InvoiceLine>[]>([]);
  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);
  const [detailLines, setDetailLines] = useState<InvoiceLine[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!activeCompany?.id) { setProducts([]); return; }
    supabase.from("products").select("id, code, name, sale_price, purchase_price, tva_rate").eq("is_active", true).eq("company_id", activeCompany.id).then(({ data }) => {
      setProducts(data || []);
    });
  }, [activeCompany?.id]);

  const filtered = invoices.filter((inv) => {
    const matchSearch = !search || inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name || inv.supplier?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openDetail = async (inv: Invoice) => {
    const lines = await fetchLines(inv.id);
    setDetailInvoice(inv);
    setDetailLines(lines);
  };

  const openEdit = async (inv: Invoice) => {
    const lines = await fetchLines(inv.id);
    setEditInvoice(inv);
    setEditLines(lines);
    setFormOpen(true);
  };

  const handlePrint = async (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!companySettings) return;
    const lines = await fetchLines(inv.id);
    await generateDocumentPdf({
      type: "facture",
      number: inv.invoice_number,
      date: inv.invoice_date,
      dueDate: inv.due_date || undefined,
      clientName: inv.customer?.name || inv.supplier?.name || "—",
      lines: lines.map((l: any) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
        discount_percent: Number(l.discount_percent || 0),
        tva_rate: Number(l.tva_rate),
        total_ht: Number(l.total_ht),
        total_ttc: Number(l.total_ttc),
      })),
      subtotalHt: Number(inv.subtotal_ht),
      totalTva: Number(inv.total_tva),
      totalTtc: Number(inv.total_ttc),
      notes: inv.notes || undefined,
      paymentTerms: inv.payment_terms || undefined,
    }, companySettings);
  };

  const handleSubmit = async (invoice: Partial<Invoice>, lines: Partial<InvoiceLine>[]) => {
    if (editInvoice) {
      await updateInvoice(editInvoice.id, invoice);
      await updateLines(editInvoice.id, lines);
      setEditInvoice(null);
    } else {
      await create(invoice, lines);
    }
  };

  const statusVariant = (s: string) => {
    if (s === "draft") return "secondary" as const;
    if (s === "validated") return "default" as const;
    if (s === "cancelled") return "destructive" as const;
    return "default" as const;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="validated">Validée</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
        {canManage && (
          <Button onClick={() => { setEditInvoice(null); setEditLines([]); setFormOpen(true); }} className="gap-1">
            <Plus className="h-4 w-4" /> Nouvelle facture
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Aucune facture trouvée</div>
      ) : (
        <div className="bg-card rounded-lg border shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>{invoiceType === "client" ? "Client" : "Fournisseur"}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead className="text-right">Solde</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => (
                <TableRow key={inv.id} className="cursor-pointer" onClick={() => openDetail(inv)}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customer?.name || inv.supplier?.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.invoice_date}</TableCell>
                  <TableCell><Badge variant={statusVariant(inv.status)}>{INVOICE_STATUS_LABELS[inv.status]}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{inv.total_ttc.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{inv.remaining_balance.toFixed(2)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir" onClick={() => openDetail(inv)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Imprimer" onClick={(e) => handlePrint(inv, e)}><Printer className="h-4 w-4" /></Button>
                      {inv.status === "draft" && canManage && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Modifier" onClick={() => openEdit(inv)}><Pencil className="h-4 w-4" /></Button>
                      )}
                      {inv.status === "draft" && isAdmin() && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Supprimer" onClick={() => remove(inv.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InvoiceFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditInvoice(null); }}
        invoiceType={invoiceType}
        onSubmit={handleSubmit}
        editInvoice={editInvoice}
        editLines={editLines}
      />

      <InvoiceDetailDialog
        invoice={detailInvoice}
        lines={detailLines}
        products={products}
        onClose={() => setDetailInvoice(null)}
        onValidate={validateInvoice}
        onCancel={cancelInvoice}
        onMarkPaid={markPaid}
        onCreateCreditNote={onCreateCreditNote}
      />
    </div>
  );
}
