import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";

export interface SalesDoc {
  id: string;
  number: string;
  customer_id: string;
  date: string;
  status: string;
  subtotal_ht: number;
  total_tva: number;
  total_ttc: number;
  notes: string | null;
  payment_terms: string | null;
  warehouse_id: string | null;
  created_at: string;
  customer?: { name: string; code: string };
  lines?: SalesDocLine[];
}

export interface SalesDocLine {
  id?: string;
  product_id: string | null;
  description: string;
  quantity: number;
  delivered_qty?: number;
  received_qty?: number;
  unit_price: number;
  discount_percent: number;
  tva_rate: number;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  sort_order: number;
}

function calcLine(l: Partial<SalesDocLine>): SalesDocLine {
  const qty = Number(l.quantity || 0);
  const price = Number(l.unit_price || 0);
  const disc = Number(l.discount_percent || 0);
  const tva = Number(l.tva_rate || 20);
  const ht = qty * price * (1 - disc / 100);
  const tvaAmt = ht * tva / 100;
  return { ...l, quantity: qty, unit_price: price, discount_percent: disc, tva_rate: tva, total_ht: Math.round(ht * 100) / 100, total_tva: Math.round(tvaAmt * 100) / 100, total_ttc: Math.round((ht + tvaAmt) * 100) / 100, sort_order: l.sort_order || 0 } as SalesDocLine;
}

export function calcTotals(lines: SalesDocLine[]) {
  const calculated = lines.map(calcLine);
  return {
    lines: calculated,
    subtotal_ht: calculated.reduce((s, l) => s + l.total_ht, 0),
    total_tva: calculated.reduce((s, l) => s + l.total_tva, 0),
    total_ttc: calculated.reduce((s, l) => s + l.total_ttc, 0),
  };
}

export function useQuotations() {
  const [items, setItems] = useState<SalesDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    if (!companyId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("quotations")
      .select("*, customer:customers(name, code)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (!error) setItems((data || []).map((d: any) => ({ ...d, number: d.quotation_number, date: d.quotation_date })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (customerId: string, lines: SalesDocLine[], notes?: string, paymentTerms?: string) => {
    const { data: num } = await supabase.rpc("next_document_number", { p_type: "DEV" });
    const { lines: calcLines, subtotal_ht, total_tva, total_ttc } = calcTotals(lines);
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data, error } = await (supabase as any).from("quotations").insert({
      quotation_number: num, customer_id: customerId, subtotal_ht, total_tva, total_ttc, notes, payment_terms: paymentTerms || "30j", created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (let i = 0; i < calcLines.length; i++) {
      const l = calcLines[i];
      await (supabase as any).from("quotation_lines").insert({
        quotation_id: data.id, product_id: l.product_id, description: l.description, quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent, tva_rate: l.tva_rate, total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: i, company_id: companyId,
      });
    }
    toast({ title: "Devis créé", description: num as string });
    await fetch();
    return data;
  };

  const validate = async (id: string) => {
    await (supabase as any).from("quotations").update({ status: "validated" }).eq("id", id);
    await auditLog("validate_quotation", "quotations", id);
    toast({ title: "Devis validé" });
    await fetch();
  };

  const cancel = async (id: string) => {
    await (supabase as any).from("quotations").update({ status: "cancelled" }).eq("id", id);
    await auditLog("cancel_quotation", "quotations", id);
    toast({ title: "Devis annulé" });
    await fetch();
  };

  const convertToOrder = async (quotationId: string, warehouseId: string) => {
    const { data: q } = await (supabase as any).from("quotations").select("*").eq("id", quotationId).single();
    const { data: qLines } = await (supabase as any).from("quotation_lines").select("*").eq("quotation_id", quotationId).order("sort_order");
    if (!q || !qLines) return null;

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "BC" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data: so, error } = await (supabase as any).from("sales_orders").insert({
      order_number: num, quotation_id: quotationId, customer_id: q.customer_id, subtotal_ht: q.subtotal_ht, total_tva: q.total_tva, total_ttc: q.total_ttc, notes: q.notes, payment_terms: q.payment_terms, warehouse_id: warehouseId, created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (const l of qLines) {
      await (supabase as any).from("sales_order_lines").insert({
        sales_order_id: so.id, product_id: l.product_id, description: l.description, quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent, tva_rate: l.tva_rate, total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: l.sort_order, company_id: companyId,
      });
    }

    await (supabase as any).from("quotations").update({ status: "converted" }).eq("id", quotationId);
    await auditLog("convert_quotation_to_order", "quotations", quotationId, `BC: ${num}`);
    toast({ title: "Bon de commande créé", description: num as string });
    await fetch();
    return so;
  };

  const getLines = async (quotationId: string) => {
    const { data } = await (supabase as any).from("quotation_lines").select("*, product:products(name, code)").eq("quotation_id", quotationId).order("sort_order");
    return data || [];
  };

  return { items, loading, fetch, create, validate, cancel, convertToOrder, getLines };
}

export function useSalesOrders() {
  const [items, setItems] = useState<SalesDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    if (!companyId) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("sales_orders")
      .select("*, customer:customers(name, code)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    setLoading(false);
    setItems((data || []).map((d: any) => ({ ...d, number: d.order_number, date: d.order_date })));
  }, [companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const validate = async (id: string, reserveStockFn: (productId: string, warehouseId: string, qty: number) => Promise<boolean>) => {
    const { data: so } = await (supabase as any).from("sales_orders").select("warehouse_id").eq("id", id).single();
    const { data: lines } = await (supabase as any).from("sales_order_lines").select("product_id, quantity").eq("sales_order_id", id);

    if (!so?.warehouse_id) { toast({ title: "Erreur", description: "Dépôt requis", variant: "destructive" }); return false; }

    for (const line of (lines || [])) {
      if (line.product_id) {
        const ok = await reserveStockFn(line.product_id, so.warehouse_id, Number(line.quantity));
        if (!ok) {
          toast({ title: "Stock insuffisant", description: `Produit non réservable`, variant: "destructive" });
          return false;
        }
      }
    }

    await (supabase as any).from("sales_orders").update({ status: "validated" }).eq("id", id);
    await auditLog("validate_sales_order", "sales_orders", id);
    toast({ title: "BC validé — stock réservé" });
    await fetch();
    return true;
  };

  const cancel = async (id: string, releaseReservationFn: (productId: string, warehouseId: string, qty: number) => Promise<void>) => {
    const { data: so } = await (supabase as any).from("sales_orders").select("warehouse_id, status").eq("id", id).single();
    if (so?.status === "validated" && so?.warehouse_id) {
      const { data: lines } = await (supabase as any).from("sales_order_lines").select("product_id, quantity").eq("sales_order_id", id);
      for (const l of (lines || [])) {
        if (l.product_id) await releaseReservationFn(l.product_id, so.warehouse_id, Number(l.quantity));
      }
    }
    await (supabase as any).from("sales_orders").update({ status: "cancelled" }).eq("id", id);
    await auditLog("cancel_sales_order", "sales_orders", id);
    toast({ title: "BC annulé" });
    await fetch();
  };

  const createDelivery = async (
    orderId: string,
    deliveryLines: { sales_order_line_id: string; product_id: string; description: string; quantity: number; unit_price: number; discount_percent: number; tva_rate: number }[],
    deductStockFn: (productId: string, warehouseId: string, qty: number, refType: string, refId?: string) => Promise<boolean>,
    releaseReservationFn: (productId: string, warehouseId: string, qty: number) => Promise<void>
  ) => {
    const { data: so } = await (supabase as any).from("sales_orders").select("customer_id, warehouse_id").eq("id", orderId).single();
    if (!so) return null;

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "BL" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data: del, error } = await (supabase as any).from("deliveries").insert({
      delivery_number: num, sales_order_id: orderId, customer_id: so.customer_id, warehouse_id: so.warehouse_id, created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (let i = 0; i < deliveryLines.length; i++) {
      const dl = deliveryLines[i];
      const calc = calcLine({ ...dl, sort_order: i });

      await (supabase as any).from("delivery_lines").insert({
        delivery_id: del.id, sales_order_line_id: dl.sales_order_line_id, product_id: dl.product_id, description: dl.description, quantity: dl.quantity, unit_price: dl.unit_price, discount_percent: dl.discount_percent, tva_rate: dl.tva_rate, total_ht: calc.total_ht, total_tva: calc.total_tva, total_ttc: calc.total_ttc, sort_order: i, company_id: companyId,
      });

      const { data: solData } = await (supabase as any).from("sales_order_lines").select("delivered_qty").eq("id", dl.sales_order_line_id).single();
      if (solData) {
        await (supabase as any).from("sales_order_lines").update({ delivered_qty: Number(solData.delivered_qty) + dl.quantity }).eq("id", dl.sales_order_line_id);
      }

      if (dl.product_id && so.warehouse_id) {
        await deductStockFn(dl.product_id, so.warehouse_id, dl.quantity, "delivery", del.id);
        await releaseReservationFn(dl.product_id, so.warehouse_id, dl.quantity);
      }
    }

    await (supabase as any).from("deliveries").update({ status: "validated" }).eq("id", del.id);

    const { data: allLines } = await (supabase as any).from("sales_order_lines").select("quantity, delivered_qty").eq("sales_order_id", orderId);
    const fullyDelivered = (allLines || []).every((l: any) => Number(l.delivered_qty) >= Number(l.quantity));
    if (fullyDelivered) {
      await (supabase as any).from("sales_orders").update({ status: "delivered" }).eq("id", orderId);
    }

    await auditLog("create_delivery", "deliveries", del.id, `BL: ${num}`);
    toast({ title: "Bon de livraison créé", description: num as string });
    await fetch();
    return del;
  };

  const createInvoiceFromDelivery = async (deliveryId: string) => {
    const { data: del } = await (supabase as any).from("deliveries").select("*, delivery_lines:delivery_lines(*)").eq("id", deliveryId).single();
    if (!del) return null;

    if (del.invoice_id) { toast({ title: "Déjà facturé", variant: "destructive" }); return null; }

    const { data: num } = await supabase.rpc("next_document_number", { p_type: "FAC" });
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const lines = del.delivery_lines || [];
    const subtotal_ht = lines.reduce((s: number, l: any) => s + Number(l.total_ht), 0);
    const total_tva = lines.reduce((s: number, l: any) => s + Number(l.total_tva), 0);
    const total_ttc = lines.reduce((s: number, l: any) => s + Number(l.total_ttc), 0);

    const { data: inv, error } = await (supabase as any).from("invoices").insert({
      invoice_number: num, invoice_type: "client", customer_id: del.customer_id, subtotal_ht, total_tva, total_ttc, remaining_balance: total_ttc, status: "draft", created_by: userId, company_id: companyId,
    }).select().single();

    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return null; }

    for (const l of lines) {
      await (supabase as any).from("invoice_lines").insert({
        invoice_id: inv.id, product_id: l.product_id, description: l.description, quantity: l.quantity, unit_price: l.unit_price, discount_percent: l.discount_percent, tva_rate: l.tva_rate, total_ht: l.total_ht, total_tva: l.total_tva, total_ttc: l.total_ttc, sort_order: l.sort_order, company_id: companyId,
      });
    }

    await (supabase as any).from("deliveries").update({ invoice_id: inv.id }).eq("id", deliveryId);
    await auditLog("create_invoice_from_delivery", "invoices", inv.id, `FAC: ${num} depuis BL: ${del.delivery_number}`);
    toast({ title: "Facture créée", description: num as string });
    return inv;
  };

  const getLines = async (orderId: string) => {
    const { data } = await (supabase as any).from("sales_order_lines").select("*, product:products(name, code)").eq("sales_order_id", orderId).order("sort_order");
    return data || [];
  };

  return { items, loading, fetch, validate, cancel, createDelivery, createInvoiceFromDelivery, getLines };
}

async function auditLog(action: string, tableName: string, recordId: string, details?: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  await (supabase as any).from("audit_logs").insert({ action, table_name: tableName, record_id: recordId, details, user_id: userId });
}
