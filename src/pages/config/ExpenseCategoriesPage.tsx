import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Edit, Trash2, Loader2, Tag } from "lucide-react";

interface ExpenseCategory {
  id: string;
  name: string;
  code: string | null;
  color: string;
  is_active: boolean;
}

const DEFAULT_COLOR = "#6366f1";

export default function ExpenseCategoriesPage() {
  const [items, setItems] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);
  const [form, setForm] = useState({ name: "", code: "", color: DEFAULT_COLOR, is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("expense_categories")
      .select("*")
      .order("name");
    setLoading(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setItems(data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", color: DEFAULT_COLOR, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (item: ExpenseCategory) => {
    setEditing(item);
    setForm({
      name: item.name,
      code: item.code ?? "",
      color: item.color ?? DEFAULT_COLOR,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      color: form.color || DEFAULT_COLOR,
      is_active: form.is_active,
    };
    if (editing) {
      const { error } = await (supabase as any)
        .from("expense_categories")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Catégorie mise à jour" });
    } else {
      const { error } = await (supabase as any)
        .from("expense_categories")
        .insert(payload);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Catégorie créée" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any)
      .from("expense_categories")
      .update({ is_active: false })
      .eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Catégorie désactivée" });
    fetchData();
  };

  if (loading) {
    return (
      <AppLayout title="Catégories des dépenses" subtitle="Paramétrage des catégories utilisées dans les dépenses">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Catégories des dépenses" subtitle="Paramétrage des catégories utilisées dans les dépenses">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="h-4 w-4" />
            <span>
              <span className="font-medium text-foreground">{items.filter(i => i.is_active).length}</span> catégorie(s) active(s)
            </span>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle catégorie</Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<Tag className="h-8 w-8" />}
            title="Aucune catégorie"
            description="Ajoutez votre première catégorie de dépense."
            actionLabel="Ajouter"
            onAction={openCreate}
          />
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, i) => (
                  <TableRow key={item.id} className={`hover:bg-muted/30 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                    <TableCell>
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-border"
                        style={{ backgroundColor: item.color || DEFAULT_COLOR }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{item.code || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "outline"} className="text-xs">
                        {item.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nom *</Label>
              <Input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ex: Loyer & Charges locatives"
                autoFocus
              />
            </div>
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="Ex: LOYER"
              />
            </div>
            <div>
              <Label>Couleur</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={form.color}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={form.color}
                  onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Actif</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
