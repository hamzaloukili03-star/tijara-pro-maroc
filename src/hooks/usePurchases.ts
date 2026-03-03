import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";
import { calcTotalsWithGlobalDiscount, type GlobalDiscount } from "@/components/GlobalDiscountSection";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface PurchaseLine {
  id?: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tva_rate: number;
  estimated_cost?: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  sort_order: number;
}

export function calcPurchaseLine(l: Partial<PurchaseLine>): PurchaseLine {
  const qty = Number(l.quantity || 0);
  const price = Number(l.unit_price || 0);
  const disc = Number(l.discount_percent || 0);
  const tva = Number(l.tva_rate || 0);
  const ht = qty * price * (1 - disc / 100);
  const tvaAmt = ht * tva / 100;
  return {
    ...l,
    quantity: qty,
    unit: l.unit || "Unité",
    unit_price: price,
    discount_percent: disc,
    tva_rate: tva,
    total_ht: Math.round(ht * 100) / 100,
    total_tva: Math.round(tvaAmt * 100) / 100,
    total_ttc: Math.round((ht + tvaAmt) * 100) / 100,
    sort_order: l.sort_order || 0,
  } as PurchaseLine;
}

export function calcPurchaseTotals(lines: PurchaseLine[]) {
  const calc = lines.map(calcPurchaseLine);
  return {
    lines: calc,
    subtotal_ht: calc.reduce((s, l) => s + l.total_ht, 0),
    total_tva: calc.reduce((s, l) => s + l.total_tva, 0),
    total_ttc: calc.reduce((s, l) => s + l.total_ttc, 0),
  };
}

async function auditLog(action: string, table: string, recordId: string, details?: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  await (supabase as any).from("audit_logs").insert({
    action, table_name: table, record_id: recordId, details: details || "", user_id: userId,
  });
}

// ─────────────────────────────────────────────
// Purchase Requests
// ─────────────────────────────────────────────
export function usePurchaseRequests() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    if (!companyId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("purchase_requests")
      .select("*, supplier:suppliers(name, code), currency:currencies(code, symbol)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erreur fetch purchase_requests:", error);
    }
    setLoading(false);
    setItems((data || []).map((d: any) => ({ ...d, number: d.request_number, date: d.request_date || d.created_at?.split("T")[0] })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (payload: {
    supplierId?: string;
    neededDate?: string;
    notes?: string;
    supplierReference?: string;
    currencyId?: string;
    lines: Partial<PurchaseLine>[];
  }) => {
    const { data: num } = await supabase.rpc("next_document_number", { p_type: "DA", p_company_id: companyId } as any);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await (supabase as any).from("purchase_requests").insert({
      request_number: num,
      status: "draft",
      supplier_id: payload.supplierId || null,
      needed_date: payload.neededDate || null,
      notes: payload.notes,
      supplier_reference: payload.supplierReference || null,
      currency_id: payload.currencyId || null,
      requested_by: userId,
      company_id: companyId,
    }).select().single();
    if (error) {
      console.error("Erreur insertion purchase_requests:", error);
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return null;
    }

    for (let i = 0; i < payload.lines.length; i++) {
      const l = payload.lines[i];
      const { error: lineError } = await (supabase as any).from("purchase_request_lines").insert({
        request_id: data.id,
        product_id: l.product_id || null,
        description: l.description || "",
        quantity: l.quantity || 1,
        unit: l.unit || "Unité",
        estimated_cost: l.estimated_cost || 0,
        tva_rate: l.tva_rate || 0,
        sort_order: i,
        company_id: companyId,
      });
      if (lineError) {
        console.error("Erreur insertion ligne DA:", lineError);
      }
    }
    await auditLog("create_purchase_request", "purchase_requests", data.id, num as string);
    toast({ title: "Demande créée", description: num as string });
    await fetch();
    return data;
  };

  const update = async (id: string, payload: any, lines?: Partial<PurchaseLine>[]) => {
    const { error } = await (supabase as any).from("purchase_requests").update(payload).eq("id", id);
    if (error) { console.error("Erreur mise à jour purchase_requests:", error); toast({ title: "Erreur", description: error.message, variant: "destructive" }); return false; }
    if (lines) {
      await (supabase as any).from("purchase_request_lines").delete().eq("request_id", id);
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        await (supabase as any).from("purchase_request_lines").insert({
          request_id: id, product_id: l.product_id || null, description: l.description || "", quantity: l.quantity || 1,
          unit: l.unit || "Unité", estimated_cost: l.estimated_cost || 0, tva_rate: l.tva_rate || 0, sort_order: i, company_id: companyId,
        });
      }
    }
    await fetch();
    return true;
  };

  const submit = async (id: string) => {
    await (supabase as any).from("purchase_requests").update({ status: "submitted" }).eq("id", id);
    await auditLog("submit_purchase_request", "purchase_requests", id);
    toast({ title: "Demande soumise pour approbation" });
    await fetch();
  };

  const approve = async (id: string) => {
    await (supabase as any).from("purchase_requests").update({ status: "approved" }).eq("id", id);
    await auditLog("approve_purchase_request", "purchase_requests", id);
    toast({ title: "Demande approuvée" });
    await fetch();
  };

  const refuse = async (id: string, reason?: string) => {
    await (supabase as any).from("purchase_requests").update({ status: "refused" }).eq("id", id);
    await auditLog("refuse_purchase_request", "purchase_requests", id, reason);
    toast({ title: "Demande refusée" });
    await fetch();
  };

  const cancel = async (id: string, reason?: string) => {
    await (supabase as any).from("purchase_requests").update({ status: "cancelled" }).eq("id", id);
    await auditLog("cancel_purchase_request", "purchase_requests", id, reason);
    toast({ title: "Demande annulée" });
    await fetch();
  };

  const getLines = async (requestId: string) => {
    const { data } = await (supabase as any).from("purchase_request_lines")
      .select("*, product:products(name, code, purchase_price, tva_rate)")
      .eq("request_id", requestId).order("sort_order");
    return data || [];
  };

  const createPOFromRequest = async (requestId: string) => {
    const { data: req } = await (supabase as any).from("purchase_requests")
      .select("*, purchase_request_lines(*)")
      .eq("id", requestId).single();
    if (!req) return null;

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "BCA", p_company_id: companyId } as any);
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data: po, error } = await (supabase as any).from("purchase_orders").insert({
      order_number: num,
      status: "draft",
      supplier_id: req.supplier_id || null,
      warehouse_id: null,
      purchase_request_id: requestId,
      notes: req.notes,
      created_by: userId,
      company_id: companyId,
      subtotal_ht: 0, total_tva: 0, total_ttc: 0,
    }).select().single();

    if (error) { toast({ title: "Erreur BC", description: error.message, variant: "destructive" }); return null; }

    const lines = req.purchase_request_lines || [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      await (supabase as any).from("purchase_order_lines").insert({
        purchase_order_id: po.id, product_id: l.product_id, description: l.description, quantity: l.quantity,
        unit_price: l.estimated_cost || 0, discount_percent: 0, tva_rate: l.tva_rate || 20,
        total_ht: 0, total_tva: 0, total_ttc: 0, sort_order: i, company_id: companyId,
      });
    }
    // Mark DA as confirmed so it can't be confirmed again
    await (supabase as any).from("purchase_requests").update({ status: "confirmed" }).eq("id", requestId);
    await auditLog("create_po_from_request", "purchase_orders", po.id, `From DA: ${req.request_number}`);
    toast({ title: "BC fournisseur (brouillon) créé", description: num as string });
    await fetch();
    return po;
  };

  const remove = async (id: string) => {
    // Only allow deleting draft requests
    const item = items.find(i => i.id === id);
    if (item && item.status !== "draft") {
      toast({ title: "Suppression impossible", description: "Seules les demandes en brouillon peuvent être supprimées.", variant: "destructive" });
      return;
    }
    await (supabase as any).from("purchase_request_lines").delete().eq("request_id", id);
    const { error } = await (supabase as any).from("purchase_requests").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    await auditLog("delete_purchase_request", "purchase_requests", id);
    toast({ title: "Demande supprimée" });
    await fetch();
  };

  // legacy compat
  const validate = submit;

  return { items, loading, fetch, create, update, submit, approve, refuse, cancel, remove, getLines, createPOFromRequest, validate };
}

// ─────────────────────────────────────────────
// Purchase Orders
// ─────────────────────────────────────────────
export function usePurchaseOrders() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    if (!companyId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("purchase_orders")
      .select("*, supplier:suppliers(name, code), warehouse:warehouses(name), request:purchase_requests!purchase_orders_purchase_request_id_fkey(request_number)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setLoading(false);
    setItems((data || []).map((d: any) => ({ ...d, number: d.order_number, date: d.order_date || d.created_at?.split("T")[0] })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (payload: {
    supplierId: string;
    warehouseId: string;
    lines: Partial<PurchaseLine>[];
    notes?: string;
    paymentTerms?: string;
    expectedDeliveryDate?: string;
    purchaseRequestId?: string;
    globalDiscount?: GlobalDiscount;
  }) => {
    const { lines: calcLines } = calcPurchaseTotals(payload.lines as PurchaseLine[]);
    const gd = payload.globalDiscount || { type: "percentage" as const, value: 0 };
    const totals = calcTotalsWithGlobalDiscount(calcLines, gd.type, gd.value);
    const { data: num } = await supabase.rpc("next_document_number", { p_type: "BCA", p_company_id: companyId } as any);
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await (supabase as any).from("purchase_orders").insert({
      order_number: num,
      status: "draft",
      supplier_id: payload.supplierId,
      warehouse_id: payload.warehouseId,
      purchase_request_id: payload.purchaseRequestId || null,
      subtotal_ht: totals.subtotalHt, total_tva: totals.totalTva, total_ttc: totals.totalTtc,
      global_discount_type: gd.type,
      global_discount_value: gd.value,
      global_discount_amount: totals.globalDiscountAmount,
      notes: payload.notes,
      payment_terms: payload.paymentTerms || "30j",
      expected_delivery_date: payload.expectedDeliveryDate || null,
      created_by: userId,
      company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (let i = 0; i < calcLines.length; i++) {
      const l = calcLines[i];
      await (supabase as any).from("purchase_order_lines").insert({
        purchase_order_id: data.id, product_id: l.product_id, description: l.description, quantity: l.quantity,
        unit_price: l.unit_price, discount_percent: l.discount_percent, tva_rate: l.tva_rate,
        total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: i, company_id: companyId,
      });
    }
    await auditLog("create_purchase_order", "purchase_orders", data.id, num as string);
    toast({ title: "BC fournisseur créé", description: num as string });
    await fetch();
    return data;
  };

  const update = async (id: string, payload: any, lines?: Partial<PurchaseLine>[]) => {
    const { error } = await (supabase as any).from("purchase_orders").update(payload).eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return false; }
    if (lines) {
      const { lines: calcLines, subtotal_ht, total_tva, total_ttc } = calcPurchaseTotals(lines as PurchaseLine[]);
      await (supabase as any).from("purchase_orders").update({ subtotal_ht, total_tva, total_ttc }).eq("id", id);
      await (supabase as any).from("purchase_order_lines").delete().eq("purchase_order_id", id);
      for (let i = 0; i < calcLines.length; i++) {
        const l = calcLines[i];
        await (supabase as any).from("purchase_order_lines").insert({
          purchase_order_id: id, product_id: l.product_id, description: l.description, quantity: l.quantity,
          unit_price: l.unit_price, discount_percent: l.discount_percent, tva_rate: l.tva_rate,
          total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: i, company_id: companyId,
        });
      }
    }
    await fetch();
    return true;
  };

  const confirm = async (id: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await (supabase as any).from("purchase_orders").update({ status: "confirmed", confirmed_at: new Date().toISOString(), confirmed_by: userId }).eq("id", id);
    await auditLog("confirm_purchase_order", "purchase_orders", id);
    toast({ title: "BC fournisseur confirmé" });
    await fetch();
  };

  const cancel = async (id: string, reason: string) => {
    await (supabase as any).from("purchase_orders").update({ status: "cancelled", cancel_reason: reason }).eq("id", id);
    await auditLog("cancel_purchase_order", "purchase_orders", id, reason);
    toast({ title: "BC annulé" });
    await fetch();
  };

  // legacy compat
  const validate = confirm;
  const adminValidate = confirm;

  const getLines = async (orderId: string) => {
    const { data } = await (supabase as any).from("purchase_order_lines")
      .select("*, product:products(name, code)")
      .eq("purchase_order_id", orderId).order("sort_order");
    return data || [];
  };

  const createReception = async (
    orderId: string,
    receptionLines: { purchase_order_line_id: string; product_id: string; description: string; quantity: number; unit_price: number; discount_percent: number; tva_rate: number }[],
    addStockFn: (productId: string, warehouseId: string, qty: number, unitCost: number, refType: string, refId?: string) => Promise<void>
  ) => {
    const { data: po } = await (supabase as any).from("purchase_orders").select("supplier_id, warehouse_id, order_number").eq("id", orderId).single();
    if (!po) return null;

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "REC" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data: rec, error } = await (supabase as any).from("receptions").insert({
      reception_number: num, purchase_order_id: orderId, supplier_id: po.supplier_id,
      warehouse_id: po.warehouse_id, status: "draft", created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (let i = 0; i < receptionLines.length; i++) {
      const rl = receptionLines[i];
      const ht = rl.quantity * rl.unit_price * (1 - (rl.discount_percent || 0) / 100);
      const tvaAmt = ht * rl.tva_rate / 100;
      await (supabase as any).from("reception_lines").insert({
        reception_id: rec.id, purchase_order_line_id: rl.purchase_order_line_id, product_id: rl.product_id,
        description: rl.description, quantity: rl.quantity, unit_price: rl.unit_price,
        discount_percent: rl.discount_percent, tva_rate: rl.tva_rate,
        total_ht: Math.round(ht * 100) / 100, total_tva: Math.round(tvaAmt * 100) / 100,
        total_ttc: Math.round((ht + tvaAmt) * 100) / 100, sort_order: i, company_id: companyId,
      });

      const { data: polData } = await (supabase as any).from("purchase_order_lines").select("received_qty").eq("id", rl.purchase_order_line_id).single();
      if (polData) {
        await (supabase as any).from("purchase_order_lines").update({ received_qty: Number(polData.received_qty) + rl.quantity }).eq("id", rl.purchase_order_line_id);
      }

      if (rl.product_id && po.warehouse_id) {
        await addStockFn(rl.product_id, po.warehouse_id, rl.quantity, rl.unit_price, "reception", rec.id);
      }
    }

    // validate reception
    await (supabase as any).from("receptions").update({ status: "validated" }).eq("id", rec.id);

    // update PO status
    const { data: allLines } = await (supabase as any).from("purchase_order_lines").select("quantity, received_qty").eq("purchase_order_id", orderId);
    const fullyReceived = (allLines || []).every((l: any) => Number(l.received_qty) >= Number(l.quantity));
    const partiallyReceived = (allLines || []).some((l: any) => Number(l.received_qty) > 0);
    if (fullyReceived) {
      await (supabase as any).from("purchase_orders").update({ status: "received" }).eq("id", orderId);
    } else if (partiallyReceived) {
      await (supabase as any).from("purchase_orders").update({ status: "partially_received" }).eq("id", orderId);
    }

    await auditLog("validate_reception", "receptions", rec.id, `REC: ${num} from BC: ${po.order_number}`);
    toast({ title: "Réception validée", description: num as string });
    await fetch();
    return rec;
  };

  const createInvoiceFromReception = async (receptionId: string) => {
    const { data: rec } = await (supabase as any).from("receptions")
      .select("*, reception_lines:reception_lines(*)")
      .eq("id", receptionId).single();
    if (!rec) return null;
    if (rec.invoice_id) { toast({ title: "Déjà facturé", variant: "destructive" }); return null; }

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "FAF" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const lines = rec.reception_lines || [];
    const subtotal_ht = lines.reduce((s: number, l: any) => s + Number(l.total_ht), 0);
    const total_tva = lines.reduce((s: number, l: any) => s + Number(l.total_tva), 0);
    const total_ttc = lines.reduce((s: number, l: any) => s + Number(l.total_ttc), 0);

    const { data: inv, error } = await (supabase as any).from("invoices").insert({
      invoice_number: num, invoice_type: "supplier", supplier_id: rec.supplier_id,
      subtotal_ht, total_tva, total_ttc, remaining_balance: total_ttc, status: "draft",
      purchase_order_id: rec.purchase_order_id, reception_id: receptionId,
      created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (const l of lines) {
      await (supabase as any).from("invoice_lines").insert({
        invoice_id: inv.id, product_id: l.product_id, description: l.description, quantity: l.quantity,
        unit_price: l.unit_price, discount_percent: l.discount_percent || 0, tva_rate: l.tva_rate,
        total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: l.sort_order, company_id: companyId,
      });
    }

    await (supabase as any).from("receptions").update({ invoice_id: inv.id }).eq("id", receptionId);
    await (supabase as any).from("invoice_reception_links").insert({ invoice_id: inv.id, reception_id: receptionId }).onConflict("invoice_id,reception_id").ignore();

    // update PO status to invoiced if all receptions are invoiced
    if (rec.purchase_order_id) {
      await (supabase as any).from("purchase_orders").update({ status: "invoiced" }).eq("id", rec.purchase_order_id);
    }

    await auditLog("create_supplier_invoice", "invoices", inv.id, `FAF: ${num}`);
    toast({ title: "Facture fournisseur (brouillon) créée", description: num as string });
    return inv;
  };

  return { items, loading, fetch, create, update, confirm, validate, adminValidate, cancel, getLines, createReception, createInvoiceFromReception };
}

// ─────────────────────────────────────────────
// Receptions (standalone hook)
// ─────────────────────────────────────────────
export function useReceptions() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    if (!companyId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("receptions")
      .select("*, supplier:suppliers(name, code), warehouse:warehouses(name), order:purchase_orders(order_number)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setLoading(false);
    setItems((data || []).map((d: any) => ({ ...d, number: d.reception_number, date: d.reception_date || d.created_at?.split("T")[0] })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const getLines = async (receptionId: string) => {
    const { data } = await (supabase as any).from("reception_lines")
      .select("*, product:products(name, code)")
      .eq("reception_id", receptionId).order("sort_order");
    return data || [];
  };

  const cancel = async (id: string, reason: string) => {
    await (supabase as any).from("receptions").update({ status: "cancelled", cancel_reason: reason }).eq("id", id);
    await auditLog("cancel_reception", "receptions", id, reason);
    toast({ title: "Réception annulée" });
    await fetch();
  };

  return { items, loading, fetch, getLines, cancel };
}
