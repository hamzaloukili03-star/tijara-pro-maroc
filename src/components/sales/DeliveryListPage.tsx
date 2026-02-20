import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Paperclip, Printer, Eye, FileText, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocAttachmentsDialog } from "@/components/DocAttachmentsDialog";
import { useCompany } from "@/hooks/useCompany";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { generateDocumentPdf } from "@/lib/pdf-generator";
import { DELIVERY_STATUS_LABELS, DELIVERY_STATUS_COLORS } from "@/hooks/useSales";
import { useNavigate } from "react-router-dom";

interface Props {
  deliveries: any;
  stock: any;
  onView?: (id: string) => void;
}

export function DeliveryListPage({ deliveries, stock, onView }: Props) {
  const [attachDialog, setAttachDialog] = useState<{ id: string; number: string } | null>(null);
  const { activeCompany } = useCompany();
  const { settings: companySettings } = useCompanySettings();
  const navigate = useNavigate();

  const handleValidate = async (d: any) => {
    await deliveries.validateDelivery(d.id, stock.deductStock, stock.releaseReservation);
  };

  const handlePrint = async (d: any) => {
    if (!companySettings) return;
    const { data: lines } = await (supabase as any)
      .from("delivery_lines").select("*").eq("delivery_id", d.id).order("sort_order");
    await generateDocumentPdf({
      type: "bon_livraison",
      number: d.delivery_number,
      date: d.delivery_date,
      clientName: d.customer?.name || "—",
      lines: (lines || []).map((l: any) => ({
        description: l.description,
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
        discount_percent: Number(l.discount_percent || 0),
        tva_rate: Number(l.tva_rate),
        total_ht: Number(l.total_ht),
        total_ttc: Number(l.total_ttc),
      })),
      subtotalHt: 0, totalTva: 0, totalTtc: 0,
    }, companySettings);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Bons de livraison</h2>
      </div>

      {deliveries.loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : deliveries.items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun bon de livraison</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Dépôt</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.items.map((d: any) => (
                <TableRow key={d.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm font-medium">{d.delivery_number}</TableCell>
                  <TableCell>{d.customer?.name || "—"}</TableCell>
                  <TableCell>{d.delivery_date}</TableCell>
                  <TableCell>{d.warehouse?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge className={`${DELIVERY_STATUS_COLORS[d.status] || ""} border text-xs`}>
                      {DELIVERY_STATUS_LABELS[d.status] || d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => onView(d.id)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> Ouvrir
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Imprimer" onClick={() => handlePrint(d)}>
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Pièces jointes"
                        onClick={() => setAttachDialog({ id: d.id, number: d.delivery_number })}>
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                      {d.status === "draft" && (
                        <Button size="sm" variant="outline" className="h-8 text-xs"
                          onClick={() => handleValidate(d)}>
                          <Check className="h-3 w-3 mr-1" /> Valider
                        </Button>
                      )}
                      {d.status === "validated" && !d.invoice_id && (
                        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate("/facturation/clients")}>
                          <FileText className="h-3 w-3 mr-1" /> Facturer
                        </Button>
                      )}
                      {d.invoice_id && <Badge variant="outline" className="text-xs">Facturé</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {attachDialog && (
        <DocAttachmentsDialog
          open={!!attachDialog} onClose={() => setAttachDialog(null)}
          docType="delivery" docId={attachDialog.id} docNumber={attachDialog.number}
          companyId={activeCompany?.id}
        />
      )}
    </div>
  );
}
