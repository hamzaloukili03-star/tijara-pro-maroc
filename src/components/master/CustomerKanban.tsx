import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FilePlus, Phone, Mail, MapPin, CreditCard, AlertCircle } from "lucide-react";

interface CustomerKanbanProps {
  customers: any[];
  stats: Record<string, { totalSales?: number; totalPurchases?: number; outstandingDebt?: number; outstandingReceivable?: number }>;
  onView: (customer: any) => void;
  onNewInvoice?: (customer: any) => void;
}

export function CustomerKanban({ customers, stats, onView, onNewInvoice }: CustomerKanbanProps) {
  const fmt = (n: number) => n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getBorderClass = (customer: any) => {
    const s = stats[customer.id];
    const unpaid = s?.outstandingReceivable ?? 0;
    const limit = Number(customer.credit_limit || 0);
    if (unpaid > 0) return "border-destructive/50";
    if (limit > 0 && unpaid >= limit) return "border-warning/50";
    return "border-success/30";
  };

  if (customers.length === 0) {
    return <p className="text-center text-muted-foreground py-12">Aucun client trouvé.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {customers.map((c) => {
        const s = stats[c.id];
        const unpaid = s?.outstandingReceivable ?? 0;
        const limit = Number(c.credit_limit || 0);
        const overLimit = limit > 0 && unpaid > limit;

        return (
          <div
            key={c.id}
            className={`bg-card rounded-xl border-2 p-4 transition-all hover:shadow-[var(--shadow-card-hover)] cursor-pointer group ${getBorderClass(c)}`}
            onClick={() => onView(c)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate flex-1 mr-2">
                {c.name}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                {unpaid > 0 && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-destructive/15 text-destructive border-destructive/30">
                    Impayé
                  </Badge>
                )}
                {overLimit && (
                  <Badge className="text-[10px] px-1.5 py-0 h-4 bg-warning/15 text-warning-foreground border-warning/30">
                    <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                    Dépassé
                  </Badge>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
              {c.ice && (
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">ICE: {c.ice}</span>
                </div>
              )}
              {c.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{c.phone}</span>
                </div>
              )}
              {c.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
              )}
              {c.city && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span>{c.city}</span>
                </div>
              )}
            </div>

            {/* Financial info */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-2 mb-3">
              <div>
                <span className="text-muted-foreground">Plafond</span>
                <div className="font-semibold text-foreground">{fmt(limit)} MAD</div>
              </div>
              <div>
                <span className="text-muted-foreground">Impayés</span>
                <div className={`font-semibold ${unpaid > 0 ? "text-destructive" : "text-foreground"}`}>
                  {fmt(unpaid)} MAD
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => onView(c)}>
                <Eye className="h-3 w-3" /> Voir fiche
              </Button>
              {onNewInvoice && (
                <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => onNewInvoice(c)}>
                  <FilePlus className="h-3 w-3" /> Facture
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
