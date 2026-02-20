import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  category: "quantity" | "weight" | "volume" | "length" | "time";
  is_active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export const UOM_CATEGORIES: Record<string, string> = {
  quantity: "Quantité",
  weight: "Poids",
  volume: "Volume",
  length: "Longueur",
  time: "Temps",
};

export function useUnitsOfMeasure() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("units_of_measure")
      .select("*")
      .order("category")
      .order("sort_order")
      .order("name");
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setUnits(data || []);
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  const activeUnits = units.filter((u) => u.is_active);

  const createUnit = async (record: Omit<UnitOfMeasure, "id" | "created_at">) => {
    const { data, error } = await (supabase as any)
      .from("units_of_measure")
      .insert(record)
      .select()
      .single();
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return null;
    }
    toast({ title: "Unité créée" });
    await fetchUnits();
    return data;
  };

  const updateUnit = async (id: string, record: Partial<UnitOfMeasure>) => {
    const { error } = await (supabase as any)
      .from("units_of_measure")
      .update(record)
      .eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    await fetchUnits();
    return true;
  };

  const deleteUnit = async (id: string) => {
    const { error } = await (supabase as any)
      .from("units_of_measure")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Unité supprimée" });
    await fetchUnits();
    return true;
  };

  const setDefault = async (id: string) => {
    // clear current default first
    await (supabase as any)
      .from("units_of_measure")
      .update({ is_default: false })
      .eq("is_default", true);
    await updateUnit(id, { is_default: true });
  };

  const unitsByCategory = activeUnits.reduce((acc, u) => {
    if (!acc[u.category]) acc[u.category] = [];
    acc[u.category].push(u);
    return acc;
  }, {} as Record<string, UnitOfMeasure[]>);

  return {
    units,
    activeUnits,
    unitsByCategory,
    loading,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    setDefault,
  };
}
