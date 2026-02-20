import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { calcTotals, SalesDocLine } from "@/hooks/useSales";
import { useCompany } from "@/hooks/useCompany";

export function usePurchaseRequests() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    if (!companyId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("purchase_requests")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setLoading(false);
    setItems((data || []).map((d: any) => ({ ...d, number: d.request_number, date: d.request_date })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (lines: { product_id: string; description: string; quantity: number }[], notes?: string) => {
    const { data: num } = await supabase.rpc("next_document_number", { p_type: "DA" });
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data, error } = await (supabase as any).from("purchase_requests").insert({ request_number: num, notes, requested_by: userId, company_id: companyId }).select().single();
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }
    for (let i = 0; i < lines.length; i++) {
      await (supabase as any).from("purchase_request_lines").insert({ request_id: data.id, product_id: lines[i].product_id, description: lines[i].description, quantity: lines[i].quantity, sort_order: i });
    }
    toast({ title: "Demande créée", description: num as string });
    await fetch();
    return data;
  };

  const validate = async (id: string) => {
    await (supabase as any).from("purchase_requests").update({ status: "validated" }).eq("id", id);
    toast({ title: "Demande validée" });
    await fetch();
  };

  const getLines = async (requestId: string) => {
    const { data } = await (supabase as any).from("purchase_request_lines").select("*, product:products(name, code)").eq("request_id", requestId).order("sort_order");
    return data || [];
  };

  return { items, loading, fetch, create, validate, getLines };
}

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
      .select("*, supplier:suppliers(name, code)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setLoading(false);
    setItems((data || []).map((d: any) => ({ ...d, number: d.order_number, date: d.order_date })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (supplierId: string, warehouseId: string, lines: SalesDocLine[], notes?: string, requestId?: string) => {
    const { data: num } = await supabase.rpc("next_document_number", { p_type: "BCA" });
    const { lines: calcLines, subtotal_ht, total_tva, total_ttc } = calcTotals(lines);
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await (supabase as any).from("purchase_orders").insert({
      order_number: num, request_id: requestId || null, supplier_id: supplierId, subtotal_ht, total_tva, total_ttc, notes, warehouse_id: warehouseId, created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (let i = 0; i < calcLines.length; i++) {
      const l = calcLines[i];
      await (supabase as any).from("purchase_order_lines").insert({
        purchase_order_id: data.id, product_id: l.product_id, description: l.description, quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent, tva_rate: l.tva_rate, total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: i, company_id: companyId,
      });
    }
    toast({ title: "BC fournisseur créé", description: num as string });
    await fetch();
    return data;
  };

  const validate = async (id: string) => {
    await (supabase as any).from("purchase_orders").update({ status: "validated" }).eq("id", id);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await (supabase as any).from("audit_logs").insert({ action: "validate_purchase_order", table_name: "purchase_orders", record_id: id, user_id: userId });
    toast({ title: "BC fournisseur validé" });
    await fetch();
  };

  const cancel = async (id: string) => {
    await (supabase as any).from("purchase_orders").update({ status: "cancelled" }).eq("id", id);
    toast({ title: "BC fournisseur annulé" });
    await fetch();
  };

  const createReception = async (
    orderId: string,
    receptionLines: { purchase_order_line_id: string; product_id: string; description: string; quantity: number; unit_price: number; discount_percent: number; tva_rate: number }[],
    addStockFn: (productId: string, warehouseId: string, qty: number, unitCost: number, refType: string, refId?: string) => Promise<void>
  ) => {
    const { data: po } = await (supabase as any).from("purchase_orders").select("supplier_id, warehouse_id").eq("id", orderId).single();
    if (!po) return null;

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "REC" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data: rec, error } = await (supabase as any).from("receptions").insert({
      reception_number: num, purchase_order_id: orderId, supplier_id: po.supplier_id, warehouse_id: po.warehouse_id, created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (let i = 0; i < receptionLines.length; i++) {
      const rl = receptionLines[i];
      const ht = rl.quantity * rl.unit_price * (1 - (rl.discount_percent || 0) / 100);
      const tvaAmt = ht * rl.tva_rate / 100;

      await (supabase as any).from("reception_lines").insert({
        reception_id: rec.id, purchase_order_line_id: rl.purchase_order_line_id, product_id: rl.product_id, description: rl.description, quantity: rl.quantity, unit_price: rl.unit_price, discount_percent: rl.discount_percent, tva_rate: rl.tva_rate, total_ht: Math.round(ht * 100) / 100, total_tva: Math.round(tvaAmt * 100) / 100, total_ttc: Math.round((ht + tvaAmt) * 100) / 100, sort_order: i,
      });

      const { data: polData } = await (supabase as any).from("purchase_order_lines").select("received_qty").eq("id", rl.purchase_order_line_id).single();
      if (polData) {
        await (supabase as any).from("purchase_order_lines").update({ received_qty: Number(polData.received_qty) + rl.quantity }).eq("id", rl.purchase_order_line_id);
      }

      if (rl.product_id && po.warehouse_id) {
        await addStockFn(rl.product_id, po.warehouse_id, rl.quantity, rl.unit_price, "reception", rec.id);
      }
    }

    await (supabase as any).from("receptions").update({ status: "validated" }).eq("id", rec.id);

    const { data: allLines } = await (supabase as any).from("purchase_order_lines").select("quantity, received_qty").eq("purchase_order_id", orderId);
    const fullyReceived = (allLines || []).every((l: any) => Number(l.received_qty) >= Number(l.quantity));
    if (fullyReceived) {
      await (supabase as any).from("purchase_orders").update({ status: "received" }).eq("id", orderId);
    }

    await (supabase as any).from("audit_logs").insert({ action: "create_reception", table_name: "receptions", record_id: rec.id, details: `REC: ${num}`, user_id: userId });
    toast({ title: "Réception créée", description: num as string });
    await fetch();
    return rec;
  };

  const createInvoiceFromReception = async (receptionId: string) => {
    const { data: rec } = await (supabase as any).from("receptions").select("*, reception_lines:reception_lines(*)").eq("id", receptionId).single();
    if (!rec) return null;
    if (rec.invoice_id) { toast({ title: "Déjà facturé", variant: "destructive" }); return null; }

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "FAF" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const lines = rec.reception_lines || [];
    const subtotal_ht = lines.reduce((s: number, l: any) => s + Number(l.total_ht), 0);
    const total_tva = lines.reduce((s: number, l: any) => s + Number(l.total_tva), 0);
    const total_ttc = lines.reduce((s: number, l: any) => s + Number(l.total_ttc), 0);

    const { data: inv, error } = await (supabase as any).from("invoices").insert({
      invoice_number: num, invoice_type: "supplier", supplier_id: rec.supplier_id, subtotal_ht, total_tva, total_ttc, remaining_balance: total_ttc, status: "draft", created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (const l of lines) {
      await (supabase as any).from("invoice_lines").insert({
        invoice_id: inv.id, product_id: l.product_id, description: l.description, quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent || 0, tva_rate: l.tva_rate, total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: l.sort_order, company_id: companyId,
      });
    }

    await (supabase as any).from("receptions").update({ invoice_id: inv.id }).eq("id", receptionId);
    toast({ title: "Facture fournisseur créée", description: num as string });
    return inv;
  };

  const getLines = async (orderId: string) => {
    const { data } = await (supabase as any).from("purchase_order_lines").select("*, product:products(name, code)").eq("purchase_order_id", orderId).order("sort_order");
    return data || [];
  };

  return { items, loading, fetch, create, validate, cancel, createReception, createInvoiceFromReception, getLines };
}
