import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, Wallet, Package, Users, Truck, Download } from "lucide-react";

interface KPI {
  revenue: number;
  supplierDebt: number;
  customerUnpaid: number;
  cashPosition: number;
  paidInvoices: number;
  pendingInvoices: number;
}

const COLORS = ["hsl(197, 100%, 53%)", "hsl(204, 100%, 14%)", "hsl(0, 84%, 60%)", "hsl(142, 71%, 45%)"];

const TableauxDeBord = () => {
  const [kpi, setKpi] = useState<KPI>({ revenue: 0, supplierDebt: 0, customerUnpaid: 0, cashPosition: 0, paidInvoices: 0, pendingInvoices: 0 });
  const [monthlyData, setMonthlyData] = useState<{ month: string; ventes: number; achats: number }[]>([]);
  const [topClients, setTopClients] = useState<{ name: string; value: number }[]>([]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 12);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // Revenue (client invoices validated/paid)
    const { data: clientInv } = await (supabase as any)
      .from("invoices")
      .select("total_ttc, remaining_balance, status, invoice_date, customer:customers(name)")
      .eq("invoice_type", "client")
      .in("status", ["validated", "paid"])
      .gte("invoice_date", dateFrom)
      .lte("invoice_date", dateTo);

    const revenue = (clientInv || []).reduce((s: number, i: any) => s + Number(i.total_ttc), 0);
    const customerUnpaid = (clientInv || []).reduce((s: number, i: any) => s + Number(i.remaining_balance), 0);
    const paidInvoices = (clientInv || []).filter((i: any) => i.status === "paid").length;
    const pendingInvoices = (clientInv || []).filter((i: any) => i.status === "validated").length;

    // Supplier debt
    const { data: suppInv } = await (supabase as any)
      .from("invoices")
      .select("remaining_balance")
      .eq("invoice_type", "supplier")
      .in("status", ["validated", "paid"])
      .gte("invoice_date", dateFrom)
      .lte("invoice_date", dateTo);
    const supplierDebt = (suppInv || []).reduce((s: number, i: any) => s + Number(i.remaining_balance), 0);

    // Cash position (sum of bank account balances)
    const { data: banks } = await (supabase as any).from("bank_accounts").select("current_balance").eq("is_active", true);
    const cashPosition = (banks || []).reduce((s: number, b: any) => s + Number(b.current_balance), 0);

    setKpi({ revenue, supplierDebt, customerUnpaid, cashPosition, paidInvoices, pendingInvoices });

    // Monthly breakdown
    const monthMap = new Map<string, { ventes: number; achats: number }>();
    (clientInv || []).forEach((inv: any) => {
      const m = inv.invoice_date.substring(0, 7);
      const existing = monthMap.get(m) || { ventes: 0, achats: 0 };
      existing.ventes += Number(inv.total_ttc);
      monthMap.set(m, existing);
    });
    const { data: suppAll } = await (supabase as any)
      .from("invoices")
      .select("total_ttc, invoice_date")
      .eq("invoice_type", "supplier")
      .in("status", ["validated", "paid"])
      .gte("invoice_date", dateFrom)
      .lte("invoice_date", dateTo);
    (suppAll || []).forEach((inv: any) => {
      const m = inv.invoice_date.substring(0, 7);
      const existing = monthMap.get(m) || { ventes: 0, achats: 0 };
      existing.achats += Number(inv.total_ttc);
      monthMap.set(m, existing);
    });
    setMonthlyData(Array.from(monthMap.entries()).sort().map(([month, v]) => ({ month, ...v })));

    // Top clients
    const clientMap = new Map<string, number>();
    (clientInv || []).forEach((inv: any) => {
      const name = inv.customer?.name || "Inconnu";
      clientMap.set(name, (clientMap.get(name) || 0) + Number(inv.total_ttc));
    });
    setTopClients(Array.from(clientMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })));

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const exportCSV = () => {
    const header = "Mois,Ventes,Achats\n";
    const rows = monthlyData.map((r) => `${r.month},${r.ventes.toFixed(2)},${r.achats.toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rapport-facturation.csv"; a.click();
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2 });

  return (
    <AppLayout title="Tableaux de Bord & Analyses" subtitle="Indicateurs de performance et rapports">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <Label>De</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label>À</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <Button variant="outline" onClick={exportCSV} className="gap-1.5"><Download className="h-4 w-4" /> Exporter CSV</Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Chiffre d'affaires", value: fmt(kpi.revenue), icon: DollarSign, color: "text-primary" },
            { label: "Marge brute", value: fmt(kpi.revenue - (monthlyData.reduce((s, m) => s + m.achats, 0))), icon: TrendingUp, color: "text-primary" },
            { label: "Trésorerie", value: fmt(kpi.cashPosition), icon: Wallet, color: "text-primary" },
            { label: "Impayés clients", value: fmt(kpi.customerUnpaid), icon: Users, color: "text-destructive" },
            { label: "Dettes fournisseurs", value: fmt(kpi.supplierDebt), icon: Truck, color: "text-destructive" },
            { label: "Factures payées", value: `${kpi.paidInvoices}`, icon: Package, color: "text-primary" },
          ].map((k) => (
            <Card key={k.label}>
              <CardHeader className="pb-1 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{k.label}</CardTitle>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-lg font-bold">{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly bar chart */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Évolution mensuelle Ventes / Achats</CardTitle></CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString("fr-FR")} MAD`} />
                    <Bar dataKey="ventes" name="Ventes" fill="hsl(197, 100%, 53%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="achats" name="Achats" fill="hsl(204, 100%, 14%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">Aucune donnée pour cette période</p>
              )}
            </CardContent>
          </Card>

          {/* Top clients pie */}
          <Card>
            <CardHeader><CardTitle className="text-base">Top clients</CardTitle></CardHeader>
            <CardContent>
              {topClients.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={topClients} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                        {topClients.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v.toLocaleString("fr-FR")} MAD`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {topClients.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="truncate max-w-[120px]">{c.name}</span>
                        </div>
                        <span className="font-medium">{fmt(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-12">Aucune donnée</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TableauxDeBord;
