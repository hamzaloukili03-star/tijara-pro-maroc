import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const fetch = useCallback(async () => {
    setLoading(true);
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
  }, [toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (values: Partial<CompanySettings>) => {
    if (!settings) return;
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
    const path = `logo.${ext}`;
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
