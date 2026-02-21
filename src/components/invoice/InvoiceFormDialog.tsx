import { useState, useEffect } from "react";
import { isCustomerBlocked, isSupplierBlocked } from "@/lib/blocked-check";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceLineEditor } from "./InvoiceLineEditor";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { calcLineTotals, type Invoice, type InvoiceLine } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface InvoiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  invoiceType: "client" | "supplier";
  onSubmit: (invoice: Partial<Invoice>, lines: Partial<InvoiceLine>[]) => Promise<any>;
  editInvoice?: Invoice | null;
  editLines?: Partial<InvoiceLine>[];
}

const PAYMENT_TERMS_DAYS: Record<string, number> = { "30j": 30, "60j": 60, "90j": 90 };
const PAYMENT_TERMS_OPTIONS = [
  { value: "30j", label: "30 jours" },
  { value: "60j", label: "60 jours" },
  { value: "90j", label: "90 jours" },
];

function calcDueDate(invoiceDate: string, terms: string): string {
  const days = PAYMENT_TERMS_DAYS[terms];
  if (!days || !invoiceDate) return "";
  const d = new Date(invoiceDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function InvoiceFormDialog({ open, onClose, invoiceType, onSubmit, editInvoice, editLines }: InvoiceFormDialogProps) {
  const [partners, setPartners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30j");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Partial<InvoiceLine>[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const table = invoiceType === "client" ? "customers" : "suppliers";
    (supabase as any).from(table).select("id, code, name, payment_terms").eq("is_active", true).order("name").then(({ data }: any) => {
      setPartners(data || []);
    });
    supabase.from("products").select("id, code, name, sale_price, purchase_price, tva_rate").eq("is_active", true).order("name").then(({ data }) => {
      setProducts(data || []);
    });
  }, [open, invoiceType]);

  useEffect(() => {
    if (editInvoice) {
      setPartnerId(editInvoice.customer_id || editInvoice.supplier_id || "");
      setInvoiceDate(editInvoice.invoice_date);
      setDueDate(editInvoice.due_date || "");
      setPaymentTerms(editInvoice.payment_terms || "30j");
      setNotes(editInvoice.notes || "");
      setLines(editLines || []);
    } else {
      setPartnerId("");
      const today = new Date().toISOString().split("T")[0];
      setInvoiceDate(today);
      setPaymentTerms("30j");
      setDueDate(calcDueDate(today, "30j"));
      setNotes("");
      setLines([]);
    }
  }, [editInvoice, editLines, open]);

  // Auto-fill payment terms + due date when partner changes (new invoices only)
  const handlePartnerChange = (id: string) => {
    setPartnerId(id);
    if (!editInvoice) {
      const partner = partners.find((p: any) => p.id === id);
      const terms = partner?.payment_terms || "30j";
      setPaymentTerms(terms);
      setDueDate(calcDueDate(invoiceDate, terms));
    }
  };

  // Recalculate due date when invoice date or payment terms change
  const handleInvoiceDateChange = (date: string) => {
    setInvoiceDate(date);
    setDueDate(calcDueDate(date, paymentTerms));
  };

  const handlePaymentTermsChange = (terms: string) => {
    setPaymentTerms(terms);
    setDueDate(calcDueDate(invoiceDate, terms));
  };

  const partnerOptions = partners.map((p) => ({ value: p.id, label: `${p.code} - ${p.name}` }));

  const subtotalHt = lines.reduce((s, l) => s + (l.total_ht || 0), 0);
  const totalTva = lines.reduce((s, l) => s + (l.total_tva || 0), 0);
  const totalTtc = lines.reduce((s, l) => s + (l.total_ttc || 0), 0);

  const handleSubmit = async () => {
    if (!partnerId || lines.length === 0) return;
    if (invoiceType === "client" && await isCustomerBlocked(partnerId)) return;
    if (invoiceType === "supplier" && await isSupplierBlocked(partnerId)) return;
    setSaving(true);
    const invoice: Partial<Invoice> = {
      invoice_date: invoiceDate,
      due_date: dueDate || null,
      payment_terms: paymentTerms,
      notes: notes || null,
      subtotal_ht: Math.round(subtotalHt * 100) / 100,
      total_tva: Math.round(totalTva * 100) / 100,
      total_ttc: Math.round(totalTtc * 100) / 100,
      remaining_balance: Math.round(totalTtc * 100) / 100,
      created_by: (await supabase.auth.getUser()).data.user?.id || undefined,
    };
    if (invoiceType === "client") invoice.customer_id = partnerId;
    else invoice.supplier_id = partnerId;

    await onSubmit(invoice, lines);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editInvoice ? "Modifier la facture" : `Nouvelle facture ${invoiceType === "client" ? "client" : "fournisseur"}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{invoiceType === "client" ? "Client" : "Fournisseur"}</Label>
            <SearchableSelect
              options={partnerOptions}
              value={partnerId}
              onValueChange={handlePartnerChange}
              placeholder={invoiceType === "client" ? "Rechercher un client..." : "Rechercher un fournisseur..."}
            />
          </div>
          <div className="space-y-2">
            <Label>Date de facture</Label>
            <Input type="date" value={invoiceDate} onChange={(e) => handleInvoiceDateChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Conditions de paiement</Label>
            <Select value={paymentTerms} onValueChange={handlePaymentTermsChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date d'échéance <span className="text-xs text-muted-foreground">(auto-calculée)</span></Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <Label className="mb-2 block">Lignes de facture</Label>
          <InvoiceLineEditor lines={lines} onChange={setLines} products={products} invoiceType={invoiceType} />
        </div>

        <div className="flex justify-end mt-4">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span className="font-medium">{subtotalHt.toFixed(2)} MAD</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TVA</span><span className="font-medium">{totalTva.toFixed(2)} MAD</span></div>
            <div className="flex justify-between border-t pt-1 text-base"><span className="font-semibold">Total TTC</span><span className="font-bold text-primary">{totalTtc.toFixed(2)} MAD</span></div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes internes..." />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={saving || !partnerId || lines.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {editInvoice ? "Mettre à jour" : "Créer la facture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
