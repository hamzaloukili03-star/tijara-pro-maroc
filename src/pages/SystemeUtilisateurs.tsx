import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUserManagement, ManagedUser } from "@/hooks/useUserManagement";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS, type AppRole } from "@/types/auth";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Search, Shield, RotateCcw, UserCheck, UserX, Loader2, Users } from "lucide-react";

const ALL_ROLES: AppRole[] = ["super_admin", "admin", "accountant", "sales", "stock_manager"];

const SystemeUtilisateurs = () => {
  const { users, loading, toggleActive, setRole, resetPassword } = useUserManagement();
  const { hasRole, user: currentUser } = useAuth();
  const isSuperAdmin = hasRole("super_admin");
  const isAdmin = hasRole("admin") || isSuperAdmin;

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Role change dialog
  const [roleDialogUser, setRoleDialogUser] = useState<ManagedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole>("sales");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.roles.includes(filterRole as AppRole);
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? u.is_active : !u.is_active);
    return matchSearch && matchRole && matchStatus;
  });

  const handleRoleChange = async () => {
    if (!roleDialogUser) return;
    await setRole(roleDialogUser.user_id, selectedRole);
    setRoleDialogUser(null);
  };

  const openRoleDialog = (u: ManagedUser) => {
    setRoleDialogUser(u);
    setSelectedRole(u.roles[0] || "sales");
  };

  return (
    <AppLayout title="Utilisateurs & Rôles" subtitle="Gestion des utilisateurs et des permissions">
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {ALL_ROLES.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {users.length} utilisateurs</span>
          <span className="flex items-center gap-1"><UserCheck className="h-4 w-4 text-primary" /> {users.filter((u) => u.is_active).length} actifs</span>
          <span className="flex items-center gap-1"><UserX className="h-4 w-4 text-destructive" /> {users.filter((u) => !u.is_active).length} inactifs</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Aucun utilisateur trouvé</div>
        ) : (
          <div className="bg-card rounded-lg border shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const isSelf = currentUser?.id === u.user_id;
                  const isTargetSuperAdmin = u.roles.includes("super_admin");
                  const canChangeRole = isSuperAdmin && !isSelf;
                  const canToggle = isAdmin && !isSelf && !(isTargetSuperAdmin && !isSuperAdmin);

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        {u.roles.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.roles.map((r) => (
                              <Badge key={r} variant={r === "super_admin" ? "default" : "secondary"} className="text-xs">
                                {ROLE_LABELS[r]}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Aucun rôle</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.is_active ? "default" : "destructive"} className="text-xs">
                          {u.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString("fr-MA")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {canChangeRole && (
                            <Button variant="ghost" size="sm" onClick={() => openRoleDialog(u)} title="Changer le rôle">
                              <Shield className="h-4 w-4" />
                            </Button>
                          )}
                          {canToggle && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(u.user_id, u.is_active)}
                              title={u.is_active ? "Désactiver" : "Activer"}
                            >
                              {u.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                          )}
                          {isAdmin && (
                            <Button variant="ghost" size="sm" onClick={() => resetPassword(u.email)} title="Réinitialiser mot de passe">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Role change dialog */}
      <Dialog open={!!roleDialogUser} onOpenChange={() => setRoleDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le rôle de {roleDialogUser?.full_name || roleDialogUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogUser(null)}>Annuler</Button>
            <Button onClick={handleRoleChange}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SystemeUtilisateurs;
