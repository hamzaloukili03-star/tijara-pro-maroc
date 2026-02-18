// Document Lifecycle Engine for TIJARAPRO ERP

export type DocumentStatus = "brouillon" | "valide" | "livre" | "facture" | "paye" | "clos" | "annule";

export interface StatusConfig {
  label: string;
  color: string; // tailwind bg class using design tokens
  textColor: string;
  icon: string;
}

export const STATUS_CONFIG: Record<DocumentStatus, StatusConfig> = {
  brouillon: { label: "Brouillon", color: "bg-muted", textColor: "text-muted-foreground", icon: "pencil" },
  valide: { label: "Validé", color: "bg-primary/15", textColor: "text-primary", icon: "check" },
  livre: { label: "Livré", color: "bg-accent", textColor: "text-accent-foreground", icon: "truck" },
  facture: { label: "Facturé", color: "bg-orange-100", textColor: "text-orange-700", icon: "file-text" },
  paye: { label: "Payé", color: "bg-green-100", textColor: "text-green-700", icon: "wallet" },
  clos: { label: "Clos", color: "bg-secondary/10", textColor: "text-secondary", icon: "lock" },
  annule: { label: "Annulé", color: "bg-destructive/10", textColor: "text-destructive", icon: "x" },
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

export const TRANSITION_ACTIONS: Record<string, { label: string; variant: "default" | "destructive" | "outline" }> = {
  "brouillon->valide": { label: "Valider", variant: "default" },
  "brouillon->annule": { label: "Supprimer", variant: "destructive" },
  "valide->livre": { label: "Marquer livré", variant: "default" },
  "valide->annule": { label: "Annuler", variant: "destructive" },
  "livre->facture": { label: "Facturer", variant: "default" },
  "livre->annule": { label: "Annuler", variant: "destructive" },
  "facture->paye": { label: "Enregistrer paiement", variant: "default" },
  "facture->annule": { label: "Annuler", variant: "destructive" },
  "paye->clos": { label: "Clôturer", variant: "outline" },
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
}

export interface DocumentLine {
  ref: string;
  description: string;
  qty: number;
  unitPrice: number;
  tva: number;
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
  details?: string
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
  };
}
