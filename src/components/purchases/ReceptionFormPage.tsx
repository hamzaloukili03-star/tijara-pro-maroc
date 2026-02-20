import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Save, CheckCircle2, X, Package, Plus, Trash2,
  Loader2, FileText, Link2, ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { RECEPTION_STATUS, getStatus } from "@/lib/status-config";

// ─── Status badge ─────────────────────────────────────────────────────────────
function ReceptionStatusBadge({ status }: { status: string }) {
  const cfg = getStatus(RECEPTION_STATUS, status);
  return <Badge className={`${cfg.className} border px-3 py-1 text-sm font-medium`}>{cfg.label}</Badge>;
}

// ─── Workflow status bar (Odoo bread-crumb style) ─────────────────────────────
const WORKFLOW_STEPS = [
  { key: "draft",     label: "Brouillon" },
  { key: "confirmed", label: "À faire" },
  { key: "validated", label: "Validée" },
];

function WorkflowBar({ status }: { status: string }) {
  const activeIdx = status === "cancelled"
    ? -1
    : WORKFLOW_STEPS.findIndex(s => s.key === status);

  return (
    <div className="flex items-center gap-0">
      {WORKFLOW_STEPS.map((step, idx) => {
        const done = idx < activeIdx;
        const current = idx === activeIdx;
        const future = idx > activeIdx && status !== "cancelled";
        return (
          <div key={step.key} className="flex items-center">
            <div className={`
              flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-full transition-all
              ${current ? "bg-primary text-primary-foreground shadow" : ""}
              ${done ? "bg-success/20 text-success" : ""}
              ${future ? "text-muted-foreground" : ""}
              ${status === "cancelled" ? "text-muted-foreground line-through" : ""}
            `}>
              {done && <CheckCircle2 className="h-3 w-3" />}
              {step.label}
            </div>
            {idx < WORKFLOW_STEPS.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mx-1" />
            )}
          </div>
        );
      })}
      {status === "cancelled" && (
        <Badge className="ml-2 bg-destructive/10 text-destructive border-destructive/20">Annulée</Badge>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface ReceptionFormPageProps {
  reception?: any;   // existing reception (edit mode)
  purchaseOrderId?: string; // pre-linked PO
  onBack: () => void;
  onSaved?: (id: string) => void;
  stockEngine: any;
}

interface ReceptionLine {
  id?: string;
  product_id: string | null;
  description: string;
  quantity_done: number;         // "Qté demandée"
  quantity_received: number;      // "Qté reçue"
  unit: string;
  purchase_order_line_id?: string | null;
}

export function ReceptionFormPage({ reception, purchaseOrderId, onBack, onSaved, stockEngine }: ReceptionFormPageProps) {
  const { activeCompany } = useCompany();
  const { roles } = useAuth();
  const companyId = activeCompany?.id ?? null;
  const isAdmin = roles.some(r => ["super_admin", "admin"].includes(r));

  // ── Form state ────────────────────────────────────────────────────────────
  const [supplierId, setSupplierId] = useState<string>(reception?.supplier_id || "");
  const [warehouseId, setWarehouseId] = useState<string>(reception?.warehouse_id || "");
  const [scheduledDate, setScheduledDate] = useState<string>(
    reception?.scheduled_date || new Date().toISOString().split("T")[0]
  );
  const [originDoc, setOriginDoc] = useState<string>(reception?.origin_doc || "");
  const [notes, setNotes] = useState<string>(reception?.notes || "");
  const [additionalInfo, setAdditionalInfo] = useState<string>(reception?.additional_info || "");
  const [lines, setLines] = useState<ReceptionLine[]>([]);
  const [status, setStatus] = useState<string>(reception?.status || "draft");

  // ── Ref data ─────────────────────────────────────────────────────────────
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [linkedPO, setLinkedPO] = useState<any>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [overrideDialog, setOverrideDialog] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");

  // ── Load ref data ────────────────────────────────────────────────────────
  const loadRefs = useCallback(async () => {
    const [{ data: sups }, { data: whs }, { data: prods }] = await Promise.all([
      (supabase as any).from("suppliers").select("id, name, code").order("name"),
      (supabase as any).from("warehouses").select("id, name, code").order("name"),
      (supabase as any).from("products").select("id, name, code, purchase_price, unit").eq("can_be_purchased", true).order("name"),
    ]);
    setSuppliers(sups || []);
    setWarehouses(whs || []);
    setProducts(prods || []);
  }, []);

  // ── Load lines for existing reception ────────────────────────────────────
  const loadLines = useCallback(async () => {
    if (!reception?.id) return;
    const { data } = await (supabase as any)
      .from("reception_lines")
      .select("*, product:products(name, code)")
      .eq("reception_id", reception.id)
      .order("sort_order");
    if (data) {
      setLines(data.map((l: any) => ({
        id: l.id,
        product_id: l.product_id,
        description: l.description,
        quantity_done: Number(l.quantity),
        quantity_received: Number(l.quantity),
        unit: l.unit || "Unité",
        purchase_order_line_id: l.purchase_order_line_id || null,
      })));
    }
  }, [reception?.id]);

  // ── Load PO lines if creating from PO ────────────────────────────────────
  const loadFromPO = useCallback(async (poId: string) => {
    const { data: po } = await (supabase as any)
      .from("purchase_orders")
      .select("*, supplier:suppliers(name,code), warehouse:warehouses(name)")
      .eq("id", poId).single();
    if (!po) return;
    setLinkedPO(po);
    setSupplierId(po.supplier_id || "");
    setWarehouseId(po.warehouse_id || "");
    setOriginDoc(po.order_number || "");

    const { data: poLines } = await (supabase as any)
      .from("purchase_order_lines")
      .select("*, product:products(name, code)")
      .eq("purchase_order_id", poId)
      .order("sort_order");
    if (poLines) {
      setLines(poLines
        .filter((l: any) => {
          const remaining = Number(l.quantity) - Number(l.received_qty || 0);
          return remaining > 0;
        })
        .map((l: any) => ({
          product_id: l.product_id,
          description: l.description || l.product?.name || "",
          quantity_done: Number(l.quantity) - Number(l.received_qty || 0),
          quantity_received: Number(l.quantity) - Number(l.received_qty || 0),
          unit: l.unit || "Unité",
          purchase_order_line_id: l.id,
        }))
      );
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    if (reception?.id) {
      loadLines();
    } else if (purchaseOrderId) {
      loadFromPO(purchaseOrderId);
    } else {
      setLines([{ product_id: null, description: "", quantity_done: 1, quantity_received: 1, unit: "Unité" }]);
    }
  }, [reception?.id, purchaseOrderId, loadLines, loadFromPO]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const addLine = () => {
    setLines(prev => [...prev, { product_id: null, description: "", quantity_done: 1, quantity_received: 1, unit: "Unité" }]);
  };

  const removeLine = (idx: number) => {
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: keyof ReceptionLine, value: any) => {
    setLines(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      if (field === "product_id" && value) {
        const p = products.find(p => p.id === value);
        if (p) {
          next[idx].description = p.name;
          next[idx].unit = p.unit || "Unité";
        }
      }
      return next;
    });
  };

  const canEdit = status === "draft" || status === "confirmed";

  // ── Save draft ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!supplierId || !warehouseId) {
      toast({ title: "Champs requis", description: "Fournisseur et dépôt sont obligatoires.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      if (reception?.id) {
        // Update existing
        await (supabase as any).from("receptions").update({
          supplier_id: supplierId,
          warehouse_id: warehouseId,
          scheduled_date: scheduledDate || null,
          origin_doc: originDoc || null,
          notes: notes || null,
          additional_info: additionalInfo || null,
        }).eq("id", reception.id);

        // Re-insert lines
        await (supabase as any).from("reception_lines").delete().eq("reception_id", reception.id);
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          await (supabase as any).from("reception_lines").insert({
            reception_id: reception.id,
            product_id: l.product_id || null,
            description: l.description,
            quantity: l.quantity_done,
            unit: l.unit,
            purchase_order_line_id: l.purchase_order_line_id || null,
            unit_price: 0, discount_percent: 0, tva_rate: 20,
            total_ht: 0, total_tva: 0, total_ttc: 0,
            sort_order: i,
          });
        }
        toast({ title: "Réception sauvegardée" });
        onSaved?.(reception.id);
      } else {
        // Create new
        const { data: num } = await supabase.rpc("next_document_number", { p_type: "REC" });
        const { data: rec, error } = await (supabase as any).from("receptions").insert({
          reception_number: num,
          supplier_id: supplierId,
          warehouse_id: warehouseId,
          purchase_order_id: purchaseOrderId || linkedPO?.id || null,
          status: "draft",
          scheduled_date: scheduledDate || null,
          origin_doc: originDoc || null,
          notes: notes || null,
          additional_info: additionalInfo || null,
          created_by: userId,
          company_id: companyId,
        }).select().single();
        if (error) throw error;

        for (let i = 0; i < lines.length; i++) {
          const l = lines[i];
          await (supabase as any).from("reception_lines").insert({
            reception_id: rec.id,
            product_id: l.product_id || null,
            description: l.description,
            quantity: l.quantity_done,
            unit: l.unit,
            purchase_order_line_id: l.purchase_order_line_id || null,
            unit_price: 0, discount_percent: 0, tva_rate: 20,
            total_ht: 0, total_tva: 0, total_ttc: 0,
            sort_order: i,
          });
        }
        toast({ title: "Réception créée", description: num as string });
        onSaved?.(rec.id);
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  // ── Mark as "À faire" ─────────────────────────────────────────────────────
  const handleMarkToDo = async () => {
    if (!reception?.id) { await handleSave(); return; }
    await (supabase as any).from("receptions").update({ status: "confirmed" }).eq("id", reception.id);
    setStatus("confirmed");
    toast({ title: "Marquée comme À faire" });
  };

  // ── Validate (with stock impact) ──────────────────────────────────────────
  const doValidate = async (withOverride = false) => {
    if (!reception?.id) {
      toast({ title: "Sauvegardez d'abord la réception.", variant: "destructive" });
      return;
    }
    setValidating(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // Check over-receiving
      if (!withOverride && linkedPO) {
        for (const l of lines) {
          if (!l.purchase_order_line_id) continue;
          const { data: pol } = await (supabase as any)
            .from("purchase_order_lines")
            .select("quantity, received_qty")
            .eq("id", l.purchase_order_line_id).single();
          if (pol) {
            const remaining = Number(pol.quantity) - Number(pol.received_qty || 0);
            if (l.quantity_received > remaining + 0.001) {
              if (!isAdmin) {
                toast({ title: "Quantité dépassée", description: `La quantité reçue dépasse la commande pour "${l.description}".`, variant: "destructive" });
                setValidating(false);
                return;
              }
              setOverrideDialog(true);
              setValidating(false);
              return;
            }
          }
        }
      }

      // Create stock movements IN + update PO line received_qty
      for (const l of lines) {
        if (!l.product_id || l.quantity_received <= 0) continue;

        // Get unit price from PO line if linked
        let unitPrice = 0;
        if (l.purchase_order_line_id) {
          const { data: pol } = await (supabase as any)
            .from("purchase_order_lines")
            .select("unit_price, received_qty")
            .eq("id", l.purchase_order_line_id).single();
          if (pol) {
            unitPrice = Number(pol.unit_price);
            await (supabase as any).from("purchase_order_lines").update({
              received_qty: Number(pol.received_qty || 0) + l.quantity_received,
            }).eq("id", l.purchase_order_line_id);
          }
        }

        await stockEngine.addStock(l.product_id, warehouseId, l.quantity_received, unitPrice, "reception", reception.id);
      }

      // Mark reception validated
      await (supabase as any).from("receptions").update({
        status: "validated",
        validated_at: new Date().toISOString(),
        validated_by: userId,
      }).eq("id", reception.id);
      setStatus("validated");

      // Update PO status
      const poId = reception?.purchase_order_id;
      if (poId) {
        const { data: allLines } = await (supabase as any)
          .from("purchase_order_lines").select("quantity, received_qty").eq("purchase_order_id", poId);
        const fully = (allLines || []).every((l: any) => Number(l.received_qty) >= Number(l.quantity));
        const partial = (allLines || []).some((l: any) => Number(l.received_qty) > 0);
        const newStatus = fully ? "received" : partial ? "partially_received" : "confirmed";
        await (supabase as any).from("purchase_orders").update({ status: newStatus }).eq("id", poId);
      }

      // Audit log
      await (supabase as any).from("audit_logs").insert({
        action: "validate_reception",
        table_name: "receptions",
        record_id: reception.id,
        details: withOverride ? `Dérogation: ${overrideReason}` : "Validée normalement",
        user_id: userId,
      });

      toast({ title: "✅ Réception validée — stock mis à jour" });
      await stockEngine.fetchAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
    setValidating(false);
  };

  const handleValidate = () => doValidate(false);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await (supabase as any).from("receptions").update({
      status: "cancelled",
      cancel_reason: cancelReason,
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
    }).eq("id", reception.id);
    await (supabase as any).from("audit_logs").insert({
      action: "cancel_reception", table_name: "receptions",
      record_id: reception.id, details: `Motif: ${cancelReason}`, user_id: userId,
    });
    setStatus("cancelled");
    setCancelDialog(false);
    toast({ title: "Réception annulée" });
  };

  const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name, sub: s.code }));
  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name, sub: w.code }));
  const productOptions = products.map(p => ({ value: p.id, label: p.name, sub: p.code }));

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Top action bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Réceptions
          </Button>
          <Separator orientation="vertical" className="h-5" />

          {/* Action buttons */}
          {canEdit && (
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Enregistrer
            </Button>
          )}
          {status === "draft" && (
            <Button size="sm" variant="outline" onClick={handleMarkToDo} disabled={saving}>
              <Package className="h-4 w-4 mr-1" /> Marquer comme à faire
            </Button>
          )}
          {(status === "draft" || status === "confirmed") && (
            <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={handleValidate} disabled={validating}>
              {validating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              Valider
            </Button>
          )}
          {status !== "cancelled" && status !== "validated" && isAdmin && (
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setCancelDialog(true)}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
          )}

          {/* Workflow bar */}
          <div className="ml-auto">
            <WorkflowBar status={status} />
          </div>
        </div>
      </div>

      {/* ── Document header ─────────────────────────────────────────────── */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {reception?.reception_number ? (
                <span className="font-mono">{reception.reception_number}</span>
              ) : (
                "Nouvelle réception"
              )}
            </h1>
            {linkedPO && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                <span>BC : <span className="font-mono font-medium text-primary">{linkedPO.order_number}</span></span>
              </div>
            )}
          </div>
          <ReceptionStatusBadge status={status} />
        </div>

        {/* Main fields grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Recevoir de *</Label>
            {canEdit ? (
              <SearchableSelect
                options={supplierOptions}
                value={supplierId}
                onValueChange={setSupplierId}
                placeholder="Sélectionner fournisseur"
              />
            ) : (
              <div className="text-sm font-medium">{suppliers.find(s => s.id === supplierId)?.name || "—"}</div>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Dépôt de destination *</Label>
            {canEdit ? (
              <SearchableSelect
                options={warehouseOptions}
                value={warehouseId}
                onValueChange={setWarehouseId}
                placeholder="Sélectionner dépôt"
              />
            ) : (
              <div className="text-sm font-medium">{warehouses.find(w => w.id === warehouseId)?.name || "—"}</div>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date planifiée</Label>
            {canEdit ? (
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="h-9" />
            ) : (
              <div className="text-sm font-medium">{scheduledDate || "—"}</div>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Document d'origine</Label>
            {canEdit ? (
              <Input value={originDoc} onChange={e => setOriginDoc(e.target.value)} placeholder="Ex: BCA/2025/00001" className="h-9" />
            ) : (
              <div className="text-sm font-mono text-primary">{originDoc || "—"}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex-1 px-6 py-4">
        <Tabs defaultValue="operations">
          <TabsList className="mb-4">
            <TabsTrigger value="operations" className="gap-1.5">
              <Package className="h-3.5 w-3.5" /> Opérations
            </TabsTrigger>
            <TabsTrigger value="info">
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Info complémentaire
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* ── Opérations tab ────────────────────────────────────────── */}
          <TabsContent value="operations">
            <div className="border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[35%]">Produit</TableHead>
                    <TableHead className="w-[25%]">Description</TableHead>
                    <TableHead className="w-[12%] text-right">Qté demandée</TableHead>
                    <TableHead className="w-[12%] text-right">Qté reçue</TableHead>
                    <TableHead className="w-[10%]">Unité</TableHead>
                    {canEdit && <TableHead className="w-[6%]" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                        Aucun produit. Cliquez sur "Ajouter une ligne".
                      </TableCell>
                    </TableRow>
                  )}
                  {lines.map((line, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/20">
                      <TableCell className="py-2">
                        {canEdit ? (
                          <SearchableSelect
                            options={productOptions}
                            value={line.product_id || ""}
                            onValueChange={v => updateLine(idx, "product_id", v)}
                            placeholder="Produit…"
                          />
                        ) : (
                          <span className="text-sm">
                            {products.find(p => p.id === line.product_id)?.name || line.description}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {canEdit ? (
                          <Input
                            value={line.description}
                            onChange={e => updateLine(idx, "description", e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Description…"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">{line.description}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {canEdit ? (
                          <Input
                            type="number" min={0}
                            value={line.quantity_done}
                            onChange={e => updateLine(idx, "quantity_done", Number(e.target.value))}
                            className="h-8 text-sm text-right w-24 ml-auto"
                          />
                        ) : (
                          <span className="text-sm font-medium">{line.quantity_done}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        {canEdit ? (
                          <Input
                            type="number" min={0} max={line.quantity_done}
                            value={line.quantity_received}
                            onChange={e => updateLine(idx, "quantity_received", Math.min(Number(e.target.value), line.quantity_done))}
                            className={`h-8 text-sm text-right w-24 ml-auto ${
                              line.quantity_received > line.quantity_done ? "border-destructive" : ""
                            }`}
                          />
                        ) : (
                          <span className={`text-sm font-medium ${line.quantity_received < line.quantity_done ? "text-warning-foreground" : "text-success"}`}>
                            {line.quantity_received}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {canEdit ? (
                          <Input
                            value={line.unit}
                            onChange={e => updateLine(idx, "unit", e.target.value)}
                            className="h-8 text-sm w-20"
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">{line.unit}</span>
                        )}
                      </TableCell>
                      {canEdit && (
                        <TableCell className="py-2 text-center">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeLine(idx)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {canEdit && (
              <Button variant="ghost" size="sm" className="mt-2 text-primary gap-1.5" onClick={addLine}>
                <Plus className="h-4 w-4" /> Ajouter une ligne
              </Button>
            )}

            {/* Summary */}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-2">
              <span>{lines.length} ligne(s)</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Qté totale demandée : <strong>{lines.reduce((s, l) => s + l.quantity_done, 0)}</strong></span>
              <Separator orientation="vertical" className="h-4" />
              <span>Qté totale reçue : <strong className="text-foreground">{lines.reduce((s, l) => s + l.quantity_received, 0)}</strong></span>
            </div>
          </TabsContent>

          {/* ── Info complémentaire tab ───────────────────────────────── */}
          <TabsContent value="info">
            <div className="max-w-2xl space-y-4 bg-card border rounded-lg p-4">
              <div className="space-y-1">
                <Label className="text-sm">Informations complémentaires</Label>
                <Textarea
                  value={additionalInfo}
                  onChange={e => setAdditionalInfo(e.target.value)}
                  placeholder="Contact responsable, numéro de livraison transporteur…"
                  rows={4}
                  disabled={!canEdit}
                />
              </div>
              {linkedPO && (
                <div className="space-y-2 pt-2">
                  <Label className="text-sm text-muted-foreground">Bon de commande lié</Label>
                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded px-3 py-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm text-primary">{linkedPO.order_number}</span>
                    <span className="text-muted-foreground text-xs ml-1">— {linkedPO.supplier?.name}</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Notes tab ─────────────────────────────────────────────── */}
          <TabsContent value="notes">
            <div className="max-w-2xl bg-card border rounded-lg p-4">
              <Label className="text-sm mb-2 block">Notes internes</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes internes, observations sur la réception…"
                rows={6}
                disabled={!canEdit}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Cancel dialog ───────────────────────────────────────────────── */}
      <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la réception</AlertDialogTitle>
            <AlertDialogDescription>Un motif d'annulation est obligatoire. Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input placeholder="Motif d'annulation…" value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={!cancelReason.trim()}
              className="bg-destructive hover:bg-destructive/90">
              Annuler la réception
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Admin override dialog ──────────────────────────────────────── */}
      <AlertDialog open={overrideDialog} onOpenChange={setOverrideDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dérogation — Quantité dépassée</AlertDialogTitle>
            <AlertDialogDescription>
              La quantité reçue dépasse la quantité commandée. En tant qu'administrateur, vous pouvez forcer cette réception.
              Un motif est obligatoire et sera enregistré dans les logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input placeholder="Motif de dérogation…" value={overrideReason} onChange={e => setOverrideReason(e.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setOverrideDialog(false); doValidate(true); }} disabled={!overrideReason.trim()}>
              Valider avec dérogation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
