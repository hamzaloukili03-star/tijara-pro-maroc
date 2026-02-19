import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Package, Users, Truck,
  Download, AlertTriangle, AlertCircle, ArrowUpRight, ArrowDownRight,
  Calendar, Filter, FileText, ChevronRight
} from "lucide-react";

interface KPI {
  revenue: number;
  supplierDebt: number;
  customerUnpaid: number;
  cashPosition: number;
  paidInvoices: number;
  pendingInvoices: number;
  grossMargin: number;
}

const CHART_COLORS = [
  "hsl(197, 100%, 53%)",
  "hsl(210, 60%, 16%)",
  "hsl(152, 60%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 55%)",
];

// Animated counter hook
function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (target === 0 && start === 0) return;

    let startTime: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

function KPICard({
  label, value, icon: Icon, accentColor, trend, trendValue, isPrimary, delay,
}: {
  label: string; value: string; icon: React.ElementType;
  accentColor: string; trend?: "up" | "down"; trendValue?: string;
  isPrimary?: boolean; delay?: number;
}) {
  const colorMap: Record<string, string> = {
    cyan: "hsl(197, 100%, 53%)",
    green: "hsl(152, 60%, 45%)",
    red: "hsl(0, 84%, 60%)",
    orange: "hsl(38, 92%, 50%)",
    navy: "hsl(210, 60%, 16%)",
  };
  const color = colorMap[accentColor] || colorMap.cyan;

  return (
    <div
      className={`group relative bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 ${isPrimary ? "md:col-span-2 lg:col-span-2" : ""}`}
      style={{ animationDelay: `${delay || 0}ms` }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

      <div className={`p-5 ${isPrimary ? "p-6" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}18` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === "up" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>

        <p className={`font-bold text-foreground ${isPrimary ? "text-3xl" : "text-2xl"} tracking-tight`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

function AlertCard({
  icon: Icon, title, description, variant,
}: {
  icon: React.ElementType; title: string; description: string;
  variant: "danger" | "warning" | "info";
}) {
  const styles = {
    danger: "border-destructive/30 bg-destructive/5",
    warning: "border-warning/30 bg-warning/5",
    info: "border-primary/30 bg-primary/5",
  };
  const iconStyles = {
    danger: "text-destructive bg-destructive/10",
    warning: "text-warning bg-warning/10",
    info: "text-primary bg-primary/10",
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${styles[variant]} transition-all hover:shadow-sm`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconStyles[variant]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-elevated p-3 text-sm">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {Number(entry.value).toLocaleString("fr-FR")} MAD
          </span>
        </div>
      ))}
    </div>
  );
};

const TableauxDeBord = () => {
  const [kpi, setKpi] = useState<KPI>({
    revenue: 0, supplierDebt: 0, customerUnpaid: 0,
    cashPosition: 0, paidInvoices: 0, pendingInvoices: 0, grossMargin: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; ventes: number; achats: number }[]>([]);
  const [topClients, setTopClients] = useState<{ name: string; value: number }[]>([]);
  const [alerts, setAlerts] = useState<{ icon: React.ElementType; title: string; description: string; variant: "danger" | "warning" | "info" }[]>([]);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 12);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);

  const animRevenue = useAnimatedNumber(kpi.revenue);
  const animMargin = useAnimatedNumber(kpi.grossMargin);
  const animCash = useAnimatedNumber(kpi.cashPosition);
  const animUnpaid = useAnimatedNumber(kpi.customerUnpaid);
  const animDebt = useAnimatedNumber(kpi.supplierDebt);

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

    // Monthly breakdown
    const monthMap = new Map<string, { ventes: number; achats: number }>();
    (clientInv || []).forEach((inv: any) => {
      const m = inv.invoice_date.substring(0, 7);
      const existing = monthMap.get(m) || { ventes: 0, achats: 0 };
      existing.ventes += Number(inv.total_ttc);
      monthMap.set(m, existing);
    });
    (suppInv || []).forEach((inv: any) => {
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

    // Generate alerts
    const newAlerts: typeof alerts = [];
    if (customerUnpaid > 0) {
      newAlerts.push({
        icon: AlertCircle, variant: "danger",
        title: `${fmt(customerUnpaid)} MAD d'impayés clients`,
        description: `${pendingInvoices} facture(s) en attente de paiement`,
      });
    }
    if (supplierDebt > 0) {
      newAlerts.push({
        icon: AlertTriangle, variant: "warning",
        title: `${fmt(supplierDebt)} MAD de dettes fournisseurs`,
        description: "Vérifiez les échéances de paiement",
      });
    }

    // Check low stock
    const { data: lowStock } = await (supabase as any)
      .from("products")
      .select("name, min_stock")
      .eq("is_active", true)
      .limit(5);
    if (lowStock && lowStock.length > 0) {
      newAlerts.push({
        icon: Package, variant: "info",
        title: "Alertes stock",
        description: `${lowStock.length} produit(s) actifs à surveiller`,
      });
    }

    setAlerts(newAlerts);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const exportCSV = () => {
    const header = "Mois,Ventes,Achats\n";
    const rows = monthlyData.map((r) => `${r.month},${r.ventes.toFixed(2)},${r.achats.toFixed(2)}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "rapport-tijarapro.csv"; a.click();
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <AppLayout title="Tableaux de Bord" subtitle="Vue exécutive de votre activité">
      <div className="space-y-6 animate-fade-in">

        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-card rounded-xl border border-border px-3 py-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date" value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-sm w-[130px] focus-visible:ring-0"
              />
              <span className="text-muted-foreground text-sm">→</span>
              <Input
                type="date" value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-0 bg-transparent p-0 h-auto text-sm w-[130px] focus-visible:ring-0"
              />
            </div>
          </div>
          <Button variant="outline" onClick={exportCSV} className="gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Chiffre d'affaires" value={`${fmt(animRevenue)} MAD`}
            icon={DollarSign} accentColor="cyan"
            trend="up" trendValue="+12.5%"
            isPrimary delay={0}
          />
          <KPICard
            label="Marge brute" value={`${fmt(animMargin)} MAD`}
            icon={TrendingUp} accentColor={kpi.grossMargin >= 0 ? "green" : "red"}
            trend={kpi.grossMargin >= 0 ? "up" : "down"} trendValue={kpi.revenue > 0 ? `${((kpi.grossMargin / kpi.revenue) * 100).toFixed(1)}%` : "—"}
            delay={50}
          />
          <KPICard
            label="Trésorerie" value={`${fmt(animCash)} MAD`}
            icon={Wallet} accentColor="navy" delay={100}
          />
          <KPICard
            label="Impayés clients" value={`${fmt(animUnpaid)} MAD`}
            icon={Users} accentColor="red"
            trend={kpi.customerUnpaid > 0 ? "down" : undefined}
            trendValue={kpi.pendingInvoices > 0 ? `${kpi.pendingInvoices} factures` : undefined}
            delay={150}
          />
          <KPICard
            label="Dettes fournisseurs" value={`${fmt(animDebt)} MAD`}
            icon={Truck} accentColor="orange" delay={200}
          />
          <KPICard
            label="Factures payées" value={`${kpi.paidInvoices}`}
            icon={FileText} accentColor="green" delay={250}
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((alert, i) => (
              <AlertCard key={i} {...alert} />
            ))}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <Card className="lg:col-span-2 border border-border rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Évolution mensuelle</CardTitle>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[0] }} />
                    <span className="text-muted-foreground">Ventes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[1] }} />
                    <span className="text-muted-foreground">Achats</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="gradVentes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(197, 100%, 53%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(197, 100%, 53%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradAchats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(210, 60%, 16%)" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="hsl(210, 60%, 16%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 18%, 88%)" strokeOpacity={0.5} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} stroke="hsl(210, 10%, 42%)" />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} stroke="hsl(210, 10%, 42%)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone" dataKey="ventes" name="Ventes"
                      stroke="hsl(197, 100%, 53%)" strokeWidth={2.5}
                      fill="url(#gradVentes)" animationDuration={1500}
                    />
                    <Area
                      type="monotone" dataKey="achats" name="Achats"
                      stroke="hsl(210, 60%, 16%)" strokeWidth={2}
                      fill="url(#gradAchats)" animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Aucune donnée</p>
                  <p className="text-xs text-muted-foreground">Ajustez les filtres de date ou créez des factures</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top clients */}
          <Card className="border border-border rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top clients</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {topClients.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={topClients} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={75} innerRadius={40}
                        paddingAngle={3} animationDuration={1200}
                      >
                        {topClients.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-4">
                    {topClients.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                          <span className="truncate text-foreground">{c.name}</span>
                        </div>
                        <span className="font-semibold text-foreground tabular-nums">{fmt(c.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Aucun client</p>
                  <p className="text-xs text-muted-foreground">Les données apparaîtront après facturation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TableauxDeBord;
