import { useState } from "react";
import { type ERPDocument, type DocumentStatus, STATUS_CONFIG } from "@/lib/document-lifecycle";
import { StatusBadge } from "./StatusBadge";
import { DocumentActions } from "./DocumentActions";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, FileText, Clock } from "lucide-react";

interface DocumentListViewProps {
  documents: ERPDocument[];
  onTransition: (docId: string, to: DocumentStatus) => void;
  onDelete: (docId: string) => void;
  onCreate: () => void;
  moduleLabel: string;
}

export function DocumentListView({ documents, onTransition, onDelete, onCreate, moduleLabel }: DocumentListViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [auditDocId, setAuditDocId] = useState<string | null>(null);

  const filtered = documents.filter((d) => {
    const matchSearch = d.number.toLowerCase().includes(search.toLowerCase()) ||
      d.clientOrSupplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const auditDoc = documents.find((d) => d.id === auditDocId);

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-8 w-8" />}
        title={`Aucun document ${moduleLabel.toLowerCase()}`}
        description={`Commencez par créer votre premier document dans le module ${moduleLabel}.`}
        actionLabel="Créer un document"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | "all")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>N° Document</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client / Fournisseur</TableHead>
              <TableHead>Total TTC</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((doc, i) => (
              <TableRow key={doc.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                <TableCell className="font-medium">{doc.number}</TableCell>
                <TableCell>{doc.date}</TableCell>
                <TableCell>{doc.clientOrSupplier}</TableCell>
                <TableCell className="font-semibold">{doc.totalTTC.toLocaleString("fr-MA", { style: "currency", currency: "MAD" })}</TableCell>
                <TableCell><StatusBadge status={doc.status} /></TableCell>
                <TableCell>
                  <DocumentActions status={doc.status} onTransition={(to) => onTransition(doc.id, to)} />
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setAuditDocId(doc.id)}
                    className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Historique"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun document trouvé.</p>
        )}
      </div>

      {/* Audit Log Dialog */}
      <Dialog open={!!auditDocId} onOpenChange={() => setAuditDocId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historique — {auditDoc?.number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {auditDoc?.auditLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 text-sm border-b border-border pb-3 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{entry.action}</p>
                  {entry.details && <p className="text-muted-foreground text-xs">{entry.details}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.timestamp.toLocaleString("fr-MA")} — {entry.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
