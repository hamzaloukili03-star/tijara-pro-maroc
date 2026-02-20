import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";

export interface CompanySettings {
  id: string;
  raison_sociale: string;
  forme_juridique: string;
  ice: string;
  if_number: string;
  rc: string;
  patente: string;
  cnss: string;
  capital: number;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  fax: string;
  email: string;
  website: string;
  logo_url: string | null;
  bank_name: string;
  bank_rib: string;
  bank_swift: string;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const fetch = useCallback(async () => {
    setLoading(true);
    if (companyId) {
      // Multi-company mode: read directly from companies table
      const { data, error } = await (supabase as any)
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .maybeSingle();
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else if (data) {
        setSettings({
          ...data,
          bank_name: data.bank_name || "",
          bank_rib: data.bank_rib || "",
          bank_swift: data.bank_swift || "",
        } as CompanySettings);
      }
      setLoading(false);
      return;
    }
    // Fallback: legacy company_settings table
    const { data, error } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else if (data) {
      setSettings(data as unknown as CompanySettings);
    }
    setLoading(false);
  }, [toast, companyId]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (values: Partial<CompanySettings>) => {
    if (!settings) return false;
    if (companyId) {
      // Multi-company mode: update companies table
      const { error } = await (supabase as any)
        .from("companies")
        .update(values as any)
        .eq("id", companyId);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        return false;
      }
      toast({ title: "Succès", description: "Paramètres société enregistrés." });
      await fetch();
      return true;
    }
    // Fallback: legacy table
    const { error } = await supabase
      .from("company_settings")
      .update(values as any)
      .eq("id", settings.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Succès", description: "Paramètres société enregistrés." });
    await fetch();
    return true;
  };

  const uploadLogo = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `logo-${companyId || "default"}.${ext}`;
    const { error } = await supabase.storage
      .from("company-assets")
      .upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Erreur upload", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("company-assets").getPublicUrl(path);
    return urlData.publicUrl;
  };

  return { settings, loading, update, uploadLogo, refetch: fetch };
}
