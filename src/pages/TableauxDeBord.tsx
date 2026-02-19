import { useState, useEffect, useRef, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  DollarSign, TrendingUp, Wallet, Package, Users, Truck,
  Download, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownRight,
  Calendar, FileText, ChevronRight, ArrowRight, ShieldAlert,
  CreditCard, BarChart3,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/* ─── types ─── */
interface KPI {
  revenue: number;
  supplierDebt: number;
  customerUnpaid: number;
  cashPosition: number;
  paidInvoices: number;
  pendingInvoices: number;
  grossMargin: number;
}

interface RecentTx {
  id: string;
  label: string;
  amount: number;
  date: string;
  type: "in" | "out";
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(280, 60%, 55%)",
];

/* ─── animated counter ─── */
function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    prev.current = target;
    if (target === 0 && start === 0) return;
    let t0: number;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── custom tooltip ─── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-elevated p-3 text-sm">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-semibold text-foreground">{fmt(Number(e.value))} MAD</span>
        </div>
      ))}
    </div>
  );
};

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
const TableauxDeBord = () => {
  const [kpi, setKpi] = useState<KPI>({
    revenue: 0, supplierDebt: 0, customerUnpaid: 0,
    cashPosition: 0, paidInvoices: 0, pendingInvoices: 0, grossMargin: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; ventes: number; achats: number }[]>([]);
  const [topClients, setTopClients] = useState<{ name: string; value: number }[]>([]);
  const [recentTx, setRecentTx] = useState<RecentTx[]>([]);
  const [stockAlerts, setStockAlerts] = useState<{ name: string; qty: number }[]>([]);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  
  const dateFrom = customFrom || `${selectedYear}-01-01`;
  const dateTo = customTo || `${selectedYear}-12-31`;
  const [loading, setLoading] = useState(true);

  const animRevenue = useAnimatedNumber(kpi.revenue);
  const animMargin = useAnimatedNumber(kpi.grossMargin);
  const animCash = useAnimatedNumber(kpi.cashPosition);
  const animUnpaid = useAnimatedNumber(kpi.customerUnpaid);
  const animDebt = useAnimatedNumber(kpi.supplierDebt);

  const marginPct = useMemo(
    () => (kpi.revenue > 0 ? (kpi.grossMargin / kpi.revenue) * 100 : 0),
    [kpi.revenue, kpi.grossMargin],
  );

  /* ─── data fetching ─── */
  const fetchData = async () => {
    setLoading(true);

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

    const { data: suppInv } = await (supabase as any)
      .from("invoices")
      .select("remaining_balance, total_ttc, invoice_date")
      .eq("invoice_type", "supplier")
      .in("status", ["validated", "paid"])
      .gte("invoice_date", dateFrom)
      .lte("invoice_date", dateTo);
    const supplierDebt = (suppInv || []).reduce((s: number, i: any) => s + Number(i.remaining_balance), 0);
    const totalPurchases = (suppInv || []).reduce((s: number, i: any) => s + Number(i.total_ttc), 0);

    const { data: banks } = await (supabase as any).from("bank_accounts").select("current_balance").eq("is_active", true);
    const cashPosition = (banks || []).reduce((s: number, b: any) => s + Number(b.current_balance), 0);

    const grossMargin = revenue - totalPurchases;
    setKpi({ revenue, supplierDebt, customerUnpaid, cashPosition, paidInvoices, pendingInvoices, grossMargin });

    // Monthly breakdown — always show all 12 months of selected year
    const monthMap = new Map<string, { ventes: number; achats: number }>();
    // Pre-fill all 12 months
    for (let m = 1; m <= 12; m++) {
      const key = `${selectedYear}-${String(m).padStart(2, "0")}`;
      monthMap.set(key, { ventes: 0, achats: 0 });
    }
    (clientInv || []).forEach((inv: any) => {
      const m = inv.invoice_date.substring(0, 7);
      if (monthMap.has(m)) {
        monthMap.get(m)!.ventes += Number(inv.total_ttc);
      }
    });
    (suppInv || []).forEach((inv: any) => {
      const m = inv.invoice_date.substring(0, 7);
      if (monthMap.has(m)) {
        monthMap.get(m)!.achats += Number(inv.total_ttc);
      }
    });
    setMonthlyData(Array.from(monthMap.entries()).sort().map(([month, v]) => {
      const mIdx = parseInt(month.split("-")[1], 10) - 1;
      return { month: MONTH_LABELS[mIdx], ...v };
    }));

    // Top clients
    const cm = new Map<string, number>();
    (clientInv || []).forEach((inv: any) => {
      const n = inv.customer?.name || "Inconnu";
      cm.set(n, (cm.get(n) || 0) + Number(inv.total_ttc));
    });
    setTopClients(Array.from(cm.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })));

    // Recent payments
    const { data: payments } = await (supabase as any)
      .from("payments")
      .select("id, payment_number, amount, payment_date, payment_type")
      .order("payment_date", { ascending: false })
      .limit(5);
    setRecentTx(
      (payments || []).map((p: any) => ({
        id: p.id,
        label: p.payment_number,
        amount: Number(p.amount),
        date: p.payment_date,
        type: p.payment_type === "incoming" ? "in" as const : "out" as const,
      })),
    );

    // Stock alerts
    const { data: lowStock } = await (supabase as any)
      .from("stock_levels")
      .select("stock_on_hand, product:products(name, min_stock)")
      .limit(20);
    const alerts = (lowStock || [])
      .filter((s: any) => s.product && Number(s.stock_on_hand) <= Number(s.product.min_stock))
      .slice(0, 5)
      .map((s: any) => ({ name: s.product.name, qty: Number(s.stock_on_hand) }));
    setStockAlerts(alerts);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [selectedYear, customFrom, customTo]);

  const exportCSV = () => {
    const header = "Mois,Ventes,Achats\n";
    const rows = monthlyData.map((r) => `${r.month},${r.ventes.toFixed(2)},${r.achats.toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rapport-tijarapro.csv"; a.click();
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <AppLayout title="Tableaux de Bord" subtitle="Vue exécutive de votre activité">
      <div className="space-y-6 animate-fade-in">

        {/* ── Filter bar ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Year selector */}
            <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-3 py-2 shadow-card">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={String(selectedYear)} onValueChange={(v) => { setSelectedYear(Number(v)); setCustomFrom(""); setCustomTo(""); }}>
                <SelectTrigger className="border-0 bg-transparent p-0 h-auto text-sm w-[80px] focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Custom date range */}
            <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-3 py-2 shadow-card">
              <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                placeholder="Début"
                className="border-0 bg-transparent p-0 h-auto text-sm w-[130px] focus-visible:ring-0" />
              <span className="text-muted-foreground text-sm">→</span>
              <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                placeholder="Fin"
                className="border-0 bg-transparent p-0 h-auto text-sm w-[130px] focus-visible:ring-0" />
              {(customFrom || customTo) && (
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => { setCustomFrom(""); setCustomTo(""); }}>
                  ✕
                </Button>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={exportCSV} className="gap-2 rounded-xl">
            <Download className="h-4 w-4" /> Exporter
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 — Revenue (hero) */}
          <HeroKPI
            label="Chiffre d'affaires"
            value={fmt(animRevenue)}
            suffix="MAD"
            icon={DollarSign}
            color="primary"
            trend="up"
            trendValue="+12.5%"
          />
          {/* KPI 2 — Margin */}
          <HeroKPI
            label="Marge brute"
            value={fmt(animMargin)}
            suffix="MAD"
            icon={TrendingUp}
            color={kpi.grossMargin >= 0 ? "success" : "destructive"}
            trend={kpi.grossMargin >= 0 ? "up" : "down"}
            trendValue={kpi.revenue > 0 ? `${marginPct.toFixed(1)}%` : "—"}
          />
          {/* KPI 3 — Unpaid */}
          <HeroKPI
            label="Impayés clients"
            value={fmt(animUnpaid)}
            suffix="MAD"
            icon={AlertCircle}
            color="destructive"
            trend={kpi.customerUnpaid > 0 ? "down" : undefined}
            trendValue={kpi.pendingInvoices > 0 ? `${kpi.pendingInvoices} en attente` : undefined}
          />
          {/* Circular widget — Invoices ratio */}
          <CircularWidget paid={kpi.paidInvoices} pending={kpi.pendingInvoices} />
        </div>

        {/* ═══════════════════════════════════════════
            ROW 2 — Main chart + Financial highlight
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-5">
          {/* Main chart — 7/10 */}
          <Card className="lg:col-span-7 border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Évolution mensuelle — {customFrom ? "Période personnalisée" : selectedYear}</CardTitle>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Ventes</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Achats</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={380}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(197,100%,53%)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(197,100%,53%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(210,60%,16%)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="hsl(210,60%,16%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216,18%,88%)" strokeOpacity={0.5} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(210,10%,42%)" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(210,10%,42%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="ventes" name="Ventes" stroke="hsl(197,100%,53%)" strokeWidth={2.5} fill="url(#gV)" animationDuration={1500} />
                    <Area type="monotone" dataKey="achats" name="Achats" stroke="hsl(210,60%,16%)" strokeWidth={2} fill="url(#gA)" animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>

          {/* Financial highlight panel — 3/10 */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Trésorerie hero */}
            <div
              className="relative rounded-xl overflow-hidden p-6 text-white shadow-elevated flex-1 flex flex-col justify-between"
              style={{
                background: "linear-gradient(135deg, hsl(197, 100%, 53%) 0%, hsl(208, 60%, 18%) 100%)",
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-4 opacity-90">
                  <Wallet className="h-5 w-5" />
                  <span className="text-sm font-medium">Trésorerie</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight">{fmt(animCash)}</p>
                <p className="text-sm opacity-75 mt-1">MAD disponible</p>
              </div>
              <div className="mt-6">
                <Button size="sm" className="bg-white/15 hover:bg-white/25 text-white border-0 gap-2 rounded-xl backdrop-blur-sm shadow-lg transition-all duration-300 hover:translate-x-0.5"
                  onClick={() => window.location.href = "/reglements"}>
                  Voir détails <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              {/* decorative shapes */}
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.06]" />
              <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/[0.04]" />
              <div className="absolute top-1/2 -left-6 w-20 h-20 rounded-full bg-white/[0.03]" />
            </div>

            {/* Supplier debt mini-card */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Dettes fournisseurs</span>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{fmt(animDebt)} <span className="text-sm font-normal text-muted-foreground">MAD</span></p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            ROW 3 — Stock alerts + Top clients + Recent TX
            ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Stock alerts */}
          <Card className="border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                </div>
                <CardTitle className="text-base font-semibold">Alertes stock</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {stockAlerts.length > 0 ? (
                <div className="space-y-3">
                  {stockAlerts.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm group py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Package className="h-4 w-4 text-destructive flex-shrink-0" />
                        <span className="truncate text-foreground">{a.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{a.qty} unités</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection icon={Package} text="Aucune alerte stock" />
              )}
            </CardContent>
          </Card>

          {/* Top clients */}
          <Card className="border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">Top clients</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {topClients.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={topClients} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3} animationDuration={1200}>
                        {topClients.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {topClients.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="truncate text-foreground">{c.name}</span>
                        </div>
                        <span className="font-semibold text-foreground tabular-nums">{fmt(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptySection icon={Users} text="Aucun client" />
              )}
            </CardContent>
          </Card>

          {/* Recent transactions */}
          <Card className="border border-border rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-success" />
                </div>
                <CardTitle className="text-base font-semibold">Derniers règlements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {recentTx.length > 0 ? (
                <div className="space-y-3">
                  {recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx.type === "in" ? "bg-success/10" : "bg-destructive/10"}`}>
                          {tx.type === "in" ? <ArrowDownRight className="h-3.5 w-3.5 text-success" /> : <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-medium">{tx.label}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <span className={`font-semibold tabular-nums ${tx.type === "in" ? "text-success" : "text-destructive"}`}>
                        {tx.type === "in" ? "+" : "-"}{fmt(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptySection icon={CreditCard} text="Aucun règlement récent" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */

function HeroKPI({ label, value, suffix, icon: Icon, color, trend, trendValue }: {
  label: string; value: string; suffix: string; icon: React.ElementType;
  color: string; trend?: "up" | "down"; trendValue?: string;
}) {
  const gradients: Record<string, string> = {
    primary: "linear-gradient(135deg, hsl(197, 100%, 53%), hsl(197, 85%, 42%))",
    success: "linear-gradient(135deg, hsl(142, 72%, 50%), hsl(142, 64%, 38%))",
    destructive: "linear-gradient(135deg, hsl(0, 84%, 60%), hsl(0, 72%, 52%))",
    warning: "linear-gradient(135deg, hsl(38, 92%, 50%), hsl(25, 90%, 48%))",
    indigo: "linear-gradient(135deg, hsl(239, 84%, 67%), hsl(239, 70%, 56%))",
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated cursor-default"
      style={{
        background: gradients[color] || gradients.primary,
        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.2)",
      }}
    >
      {/* glass overlay */}
      <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-[1px]" />
      {/* decorative shapes */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[0.07]" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/[0.05]" />

      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && trendValue && (
            <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-sm">
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-2xl font-extrabold text-white tracking-tight leading-none">
          {value} <span className="text-sm font-normal text-white/70">{suffix}</span>
        </p>
        <p className="text-sm text-white/80 mt-1.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

function CircularWidget({ paid, pending }: { paid: number; pending: number }) {
  const total = paid + pending;
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated p-5 flex flex-col items-center justify-center cursor-default"
      style={{
        background: "linear-gradient(135deg, hsl(239, 84%, 67%), hsl(239, 70%, 56%))",
        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.2)",
      }}
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/[0.06]" />
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="40" fill="none"
            stroke="white" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-extrabold text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-sm font-semibold text-white">Factures payées</p>
      <p className="text-xs text-white/70 mt-0.5">{paid} / {total} factures</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Aucune donnée</p>
      <p className="text-xs text-muted-foreground">Ajustez les filtres ou créez des factures</p>
    </div>
  );
}

function EmptySection({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default TableauxDeBord;
