import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { AppRole, Profile } from "@/types/auth";

export interface ManagedUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  roles: AppRole[];
}

export function useUserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    // Fetch profiles
    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (pErr) {
      toast({ title: "Erreur", description: pErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch all roles
    const { data: allRoles, error: rErr } = await supabase
      .from("user_roles")
      .select("*");

    if (rErr) {
      toast({ title: "Erreur", description: rErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const roleMap = new Map<string, AppRole[]>();
    (allRoles || []).forEach((r: any) => {
      const existing = roleMap.get(r.user_id) || [];
      existing.push(r.role as AppRole);
      roleMap.set(r.user_id, existing);
    });

    const merged: ManagedUser[] = (profiles || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      is_active: p.is_active,
      created_at: p.created_at,
      roles: roleMap.get(p.user_id) || [],
    }));

    setUsers(merged);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleActive = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !isActive })
      .eq("user_id", userId);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: isActive ? "Utilisateur désactivé" : "Utilisateur activé" });
    await fetch();
    return true;
  };

  const setRole = async (userId: string, role: AppRole) => {
    // Remove existing roles, then insert new one
    await (supabase as any).from("user_roles").delete().eq("user_id", userId);
    const { error } = await (supabase as any).from("user_roles").insert({ user_id: userId, role });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Rôle mis à jour" });
    await fetch();
    return true;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Email de réinitialisation envoyé", description: `Un email a été envoyé à ${email}` });
    return true;
  };

  return { users, loading, fetch, toggleActive, setRole, resetPassword };
}
