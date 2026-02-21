import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FilePlus, Phone, Mail, CreditCard, Clock, AlertCircle } from "lucide-react";

interface SupplierKanbanProps {
  suppliers: any[];
  stats: Record<string, { totalPurchases?: number; outstandingDebt?: number }>;
  onView: (supplier: any) => void;
  onNewPO?: (supplier: any) => void;
}

const TERMS_MAP: Record<string, string> = { "30j": "30 jours", "60j": "60 jours", "90j": "90 jours", comptant: "Comptant" };

export function SupplierKanban({ suppliers, stats, onView, onNewPO }: SupplierKanbanProps) {
  const fmt = (n: number) => n.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (suppliers.length === 0) {
    return <p className="text-center text-muted-foreground py-12">Aucun fournisseur trouvé.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {suppliers.map((s) => {
        const st = stats[s.id];
        const debt = st?.outstandingDebt ?? 0;
        const limit = Number(s.credit_limit || 0);
        const overLimit = limit > 0 && debt > limit;

        return (
          <div
            key={s.id}
            className={`bg-card rounded-xl border-2 p-4 transition-all hover:shadow-[var(--shadow-card-hover)] cursor-pointer ${
              debt > 0 ? "border-destructive/40" : "border-border"
            }`}
            onClick={() => onView(s)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm leading-tight truncate flex-1 mr-2">
                {s.name}
              </h3>
              <div className="flex gap-1 flex-shrink-0">
                {debt > 0 && (
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
              {s.ice && (
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">ICE: {s.ice}</span>
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span>{s.phone}</span>
                </div>
              )}
              {s.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{s.email}</span>
                </div>
              )}
              {s.payment_terms && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>{TERMS_MAP[s.payment_terms] ?? s.payment_terms}</span>
                </div>
              )}
            </div>

            {/* Financial */}
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-2 mb-3">
              <div>
                <span className="text-muted-foreground">Total achats</span>
                <div className="font-semibold text-foreground">{fmt(st?.totalPurchases ?? 0)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Encours</span>
                <div className={`font-semibold ${debt > 0 ? "text-destructive" : "text-foreground"}`}>
                  {fmt(debt)} MAD
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => onView(s)}>
                <Eye className="h-3 w-3" /> Voir fiche
              </Button>
              {onNewPO && (
                <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => onNewPO(s)}>
                  <FilePlus className="h-3 w-3" /> Nouveau BC
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
