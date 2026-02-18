import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UseCrudOptions {
  table: string;
  orderBy?: string;
  ascending?: boolean;
}

export function useCrud<T extends { id: string }>({ table, orderBy = "created_at", ascending = false }: UseCrudOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data: rows, error } = await (supabase as any)
      .from(table)
      .select("*")
      .order(orderBy, { ascending });
    setLoading(false);
    if (error) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
      return;
    }
    setData((rows || []) as T[]);
  }, [table, orderBy, ascending]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (record: Partial<T>) => {
    const { error } = await (supabase as any).from(table).insert(record);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Créé avec succès" });
    await fetch();
    return true;
  };

  const update = async (id: string, record: Partial<T>) => {
    const { error } = await (supabase as any).from(table).update(record).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Mis à jour" });
    await fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur de suppression", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Supprimé" });
    await fetch();
    return true;
  };

  return { data, loading, fetch, create, update, remove };
}
