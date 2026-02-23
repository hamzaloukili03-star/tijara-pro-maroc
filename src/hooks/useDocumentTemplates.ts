import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/useCompany";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type TemplateDocType =
  | "demande_prix"
  | "bc_fournisseur"
  | "facture_fournisseur"
  | "avoir_fournisseur"
  | "devis_client"
  | "bc_client"
  | "facture_client";

export const TEMPLATE_DOC_LABELS: Record<TemplateDocType, string> = {
  demande_prix: "Demande de prix",
  bc_fournisseur: "BC Fournisseur",
  facture_fournisseur: "Facture Fournisseur",
  avoir_fournisseur: "Avoir Fournisseur",
  devis_client: "Devis Client",
  bc_client: "BC Client",
  facture_client: "Facture Client",
};

export interface TemplateBlock {
  id: string;
  type: "logo" | "title" | "doc_info" | "party" | "lines_table" | "totals" | "notes" | "footer" | "bank";
  label: string;
  visible: boolean;
  order: number;
  styles: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    spacing?: number;
    alignment?: "left" | "center" | "right";
  };
  fields?: Record<string, boolean>; // field visibility toggles
}

export interface TemplateConfig {
  blocks: TemplateBlock[];
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    headerFontSize: number;
    bodyFontSize: number;
  };
}

export interface DocumentTemplate {
  id: string;
  company_id: string | null;
  document_type: string;
  template_json: TemplateConfig;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const DEFAULT_BLOCKS: TemplateBlock[] = [
  {
    id: "logo",
    type: "logo",
    label: "Logo & Société",
    visible: true,
    order: 0,
    styles: { fontSize: 13, spacing: 14 },
    fields: { logo: true, company_name: true, forme_juridique: true, address: true, phone: true, email: true },
  },
  {
    id: "title",
    type: "title",
    label: "Titre du document",
    visible: true,
    order: 1,
    styles: { fontSize: 16, color: "#FFFFFF", backgroundColor: "#002B49", spacing: 12 },
  },
  {
    id: "doc_info",
    type: "doc_info",
    label: "Informations document",
    visible: true,
    order: 2,
    styles: { fontSize: 9, spacing: 12 },
    fields: { date: true, due_date: true, payment_terms: true, origin_ref: true },
  },
  {
    id: "party",
    type: "party",
    label: "Client / Fournisseur",
    visible: true,
    order: 3,
    styles: { fontSize: 9, spacing: 14 },
    fields: { name: true, address: true, phone: true, email: true, ice: true, rc: true, if_number: true },
  },
  {
    id: "lines_table",
    type: "lines_table",
    label: "Tableau des lignes",
    visible: true,
    order: 4,
    styles: { fontSize: 8, spacing: 10 },
    fields: { ref: true, description: true, qty: true, unit: true, unit_price: true, discount: true, tva: true, total_ht: true, total_ttc: true },
  },
  {
    id: "totals",
    type: "totals",
    label: "Totaux",
    visible: true,
    order: 5,
    styles: { fontSize: 8, spacing: 14 },
    fields: { total_ht: true, total_tva: true, total_ttc: true, amount_paid: true, remaining: true },
  },
  {
    id: "notes",
    type: "notes",
    label: "Notes / Conditions",
    visible: true,
    order: 6,
    styles: { fontSize: 8, spacing: 10 },
  },
  {
    id: "bank",
    type: "bank",
    label: "Coordonnées bancaires",
    visible: true,
    order: 7,
    styles: { fontSize: 7, spacing: 8 },
    fields: { bank_name: true, account_name: true, rib: true, swift: true },
  },
  {
    id: "footer",
    type: "footer",
    label: "Pied de page",
    visible: true,
    order: 8,
    styles: { fontSize: 7, spacing: 6 },
    fields: { ice: true, if_number: true, rc: true, patente: true, capital: true },
  },
];

export const DEFAULT_GLOBAL_STYLES: TemplateConfig["globalStyles"] = {
  primaryColor: "#26B6E7",
  secondaryColor: "#002B49",
  fontFamily: "Segoe UI, Arial, sans-serif",
  headerFontSize: 16,
  bodyFontSize: 9,
};

export function getDefaultTemplate(): TemplateConfig {
  return {
    blocks: DEFAULT_BLOCKS.map(b => ({ ...b, styles: { ...b.styles }, fields: b.fields ? { ...b.fields } : undefined })),
    globalStyles: { ...DEFAULT_GLOBAL_STYLES },
  };
}

export function useDocumentTemplates() {
  const { activeCompany } = useCompany();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!activeCompany?.id) return [];
    const { data, error } = await (supabase as any)
      .from("document_templates")
      .select("*")
      .eq("company_id", activeCompany.id)
      .eq("is_active", true)
      .order("document_type")
      .order("version", { ascending: false });
    if (error) { console.error(error); return []; }
    return (data || []) as DocumentTemplate[];
  }, [activeCompany?.id]);

  const fetchTemplate = useCallback(async (docType: TemplateDocType): Promise<DocumentTemplate | null> => {
    if (!activeCompany?.id) return null;
    const { data, error } = await (supabase as any)
      .from("document_templates")
      .select("*")
      .eq("company_id", activeCompany.id)
      .eq("document_type", docType)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) { console.error(error); return null; }
    return data as DocumentTemplate | null;
  }, [activeCompany?.id]);

  const saveTemplate = useCallback(async (docType: TemplateDocType, config: TemplateConfig, existingId?: string) => {
    if (!activeCompany?.id) return null;
    setLoading(true);
    try {
      if (existingId) {
        const { data, error } = await (supabase as any)
          .from("document_templates")
          .update({ template_json: config, updated_by: user?.id })
          .eq("id", existingId)
          .select()
          .single();
        if (error) throw error;
        toast.success("Template sauvegardé");
        return data;
      } else {
        // Get max version
        const { data: existing } = await (supabase as any)
          .from("document_templates")
          .select("version")
          .eq("company_id", activeCompany.id)
          .eq("document_type", docType)
          .order("version", { ascending: false })
          .limit(1);
        const nextVersion = (existing?.[0]?.version || 0) + 1;

        const { data, error } = await (supabase as any)
          .from("document_templates")
          .insert({
            company_id: activeCompany.id,
            document_type: docType,
            template_json: config,
            version: nextVersion,
            updated_by: user?.id,
          })
          .select()
          .single();
        if (error) throw error;
        toast.success("Template créé (v" + nextVersion + ")");
        return data;
      }
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeCompany?.id, user?.id]);

  const saveAsCopy = useCallback(async (docType: TemplateDocType, config: TemplateConfig) => {
    // Deactivate old versions
    if (activeCompany?.id) {
      await (supabase as any)
        .from("document_templates")
        .update({ is_active: false })
        .eq("company_id", activeCompany.id)
        .eq("document_type", docType);
    }
    return saveTemplate(docType, config);
  }, [activeCompany?.id, saveTemplate]);

  const restoreDefault = useCallback(async (docType: TemplateDocType) => {
    if (!activeCompany?.id) return;
    // Deactivate custom templates (don't delete for history)
    await (supabase as any)
      .from("document_templates")
      .update({ is_active: false })
      .eq("company_id", activeCompany.id)
      .eq("document_type", docType);
    toast.success("Template par défaut restauré");
  }, [activeCompany?.id]);

  return { fetchTemplates, fetchTemplate, saveTemplate, saveAsCopy, restoreDefault, loading };
}
