// Document Lifecycle Engine for TIJARAPRO ERP

export type DocumentStatus = "brouillon" | "valide" | "livre" | "facture" | "paye" | "clos" | "annule";

export interface StatusConfig {
  label: string;
  color: string;
  textColor: string;
  icon: string;
  description: string;
}

export const STATUS_CONFIG: Record<DocumentStatus, StatusConfig> = {
  brouillon: { label: "Brouillon", color: "bg-muted", textColor: "text-muted-foreground", icon: "pencil", description: "Document modifiable" },
  valide: { label: "Validé", color: "bg-primary/15", textColor: "text-primary", icon: "check", description: "Lecture seule — en attente de livraison" },
  livre: { label: "Livré", color: "bg-accent", textColor: "text-accent-foreground", icon: "truck", description: "Stock décrémenté — en attente de facturation" },
  facture: { label: "Facturé", color: "bg-warning/15", textColor: "text-warning-foreground", icon: "file-text", description: "Échéancier généré — données financières verrouillées" },
  paye: { label: "Payé", color: "bg-success/15", textColor: "text-success", icon: "wallet", description: "Solde réglé intégralement" },
  clos: { label: "Clos", color: "bg-muted", textColor: "text-muted-foreground", icon: "lock", description: "Document verrouillé définitivement" },
  annule: { label: "Annulé", color: "bg-destructive/10", textColor: "text-destructive", icon: "x", description: "Document annulé" },
};

export const VALID_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  brouillon: ["valide", "annule"],
  valide: ["livre", "annule"],
  livre: ["facture", "annule"],
  facture: ["paye", "annule"],
  paye: ["clos"],
  clos: [],
  annule: [],
};

export const TRANSITION_ACTIONS: Record<string, { label: string; variant: "default" | "destructive" | "outline"; confirmMessage?: string }> = {
  "brouillon->valide": { label: "Valider", variant: "default", confirmMessage: "Le document deviendra en lecture seule. Confirmer la validation ?" },
  "brouillon->annule": { label: "Supprimer", variant: "destructive", confirmMessage: "Ce brouillon sera définitivement supprimé." },
  "valide->livre": { label: "Marquer livré", variant: "default", confirmMessage: "Le stock sera automatiquement décrémenté. Confirmer la livraison ?" },
  "valide->annule": { label: "Annuler", variant: "destructive", confirmMessage: "Seul un administrateur peut annuler un document validé. Confirmer ?" },
  "livre->facture": { label: "Facturer", variant: "default", confirmMessage: "Un échéancier de paiement sera généré. Les données financières seront verrouillées." },
  "livre->annule": { label: "Annuler", variant: "destructive", confirmMessage: "Le stock sera restauré suite à l'annulation après livraison. Confirmer ?" },
  "facture->paye": { label: "Enregistrer paiement", variant: "default", confirmMessage: "Confirmer l'enregistrement du paiement ?" },
  "facture->annule": { label: "Annuler", variant: "destructive", confirmMessage: "Le stock sera restauré et l'échéancier annulé. Confirmer ?" },
  "paye->clos": { label: "Clôturer", variant: "outline", confirmMessage: "Le document sera verrouillé définitivement. Cette action est irréversible." },
};

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  documentId: string;
  action: string;
  fromStatus?: DocumentStatus;
  toStatus?: DocumentStatus;
  user: string;
  details?: string;
  reason?: string;
}

export interface DocumentLine {
  ref: string;
  description: string;
  qty: number;
  unitPrice: number;
  tva: number;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface PaymentScheduleEntry {
  id: string;
  dueDate: string;
  amount: number;
  paid: boolean;
  paidDate?: string;
}

export interface ERPDocument {
  id: string;
  type: "devis" | "bon-commande" | "bon-livraison" | "facture" | "avoir";
  module: "ventes" | "achats";
  number: string;
  date: string;
  status: DocumentStatus;
  clientOrSupplier: string;
  lines: DocumentLine[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  notes?: string;
  paymentCondition?: string;
  amountPaid: number;
  auditLog: AuditLogEntry[];
  attachments: DocumentAttachment[];
  paymentSchedule: PaymentScheduleEntry[];
  stockMovementRecorded: boolean;
  stockRestored: boolean;
}

export function canTransition(from: DocumentStatus, to: DocumentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableActions(status: DocumentStatus) {
  const targets = VALID_TRANSITIONS[status] || [];
  return targets.map((to) => {
    const key = `${status}->${to}`;
    const action = TRANSITION_ACTIONS[key];
    return { to, ...action };
  }).filter(a => a.label);
}

export function isEditable(status: DocumentStatus): boolean {
  return status === "brouillon";
}

export function canAttach(status: DocumentStatus): boolean {
  return status !== "clos" && status !== "annule";
}

export function isFinanciallyLocked(status: DocumentStatus): boolean {
  return ["facture", "paye", "clos", "annule"].includes(status);
}

export function isFullyLocked(status: DocumentStatus): boolean {
  return ["clos", "annule"].includes(status);
}

export function calculateTotals(lines: DocumentLine[]) {
  const totalHT = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const totalTVA = lines.reduce((sum, l) => sum + l.qty * l.unitPrice * (l.tva / 100), 0);
  return { totalHT, totalTVA, totalTTC: totalHT + totalTVA };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function createAuditEntry(
  documentId: string,
  action: string,
  fromStatus?: DocumentStatus,
  toStatus?: DocumentStatus,
  details?: string,
  reason?: string
): AuditLogEntry {
  return {
    id: generateId(),
    timestamp: new Date(),
    documentId,
    action,
    fromStatus,
    toStatus,
    user: "Utilisateur",
    details,
    reason,
  };
}

export function generatePaymentSchedule(totalTTC: number, condition?: string): PaymentScheduleEntry[] {
  const today = new Date();
  if (condition === "30j") {
    const due = new Date(today);
    due.setDate(due.getDate() + 30);
    return [{ id: generateId(), dueDate: due.toLocaleDateString("fr-MA"), amount: totalTTC, paid: false }];
  }
  if (condition === "30-60j") {
    const d1 = new Date(today); d1.setDate(d1.getDate() + 30);
    const d2 = new Date(today); d2.setDate(d2.getDate() + 60);
    const half = Math.round(totalTTC / 2 * 100) / 100;
    return [
      { id: generateId(), dueDate: d1.toLocaleDateString("fr-MA"), amount: half, paid: false },
      { id: generateId(), dueDate: d2.toLocaleDateString("fr-MA"), amount: totalTTC - half, paid: false },
    ];
  }
  // Default: immediate
  return [{ id: generateId(), dueDate: today.toLocaleDateString("fr-MA"), amount: totalTTC, paid: false }];
}

export function getTransitionDetails(from: DocumentStatus, to: DocumentStatus, doc: ERPDocument): string {
  if (to === "valide") return "Document validé — passage en lecture seule. Réservation stock enregistrée.";
  if (to === "livre") return `Stock décrémenté : ${doc.lines.map(l => `${l.ref} ×${l.qty}`).join(", ")}.`;
  if (to === "facture") return `Échéancier généré. Montant TTC : ${doc.totalTTC.toLocaleString("fr-MA")} MAD.`;
  if (to === "paye") return `Paiement enregistré. Solde = 0.`;
  if (to === "clos") return "Document clôturé et verrouillé définitivement.";
  if (to === "annule" && from === "livre") return `Stock restauré : ${doc.lines.map(l => `${l.ref} ×${l.qty}`).join(", ")}. Annulation après livraison.`;
  if (to === "annule" && from === "facture") return `Stock restauré et échéancier annulé. Annulation après facturation.`;
  if (to === "annule") return "Document annulé.";
  return "";
}
