import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useUnitsOfMeasure, UnitOfMeasure, UOM_CATEGORIES } from "@/hooks/useUnitsOfMeasure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Edit, Trash2, Loader2, Ruler } from "lucide-react";

export default function UnitsOfMeasurePage() {
  const { units, loading, createUnit, updateUnit, deleteUnit } = useUnitsOfMeasure();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UnitOfMeasure | null>(null);
  const [form, setForm] = useState({ name: "", symbol: "", category: "quantity" as UnitOfMeasure["category"], is_active: true, is_default: false, sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditing(null); setForm({ name: "", symbol: "", category: "quantity", is_active: true, is_default: false, sort_order: 0 }); setDialogOpen(true); };
  const openEdit = (item: UnitOfMeasure) => { setEditing(item); setForm({ name: item.name, symbol: item.symbol, category: item.category, is_active: item.is_active, is_default: item.is_default, sort_order: item.sort_order }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editing) {
      await updateUnit(editing.id, form);
    } else {
      await createUnit(form);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => { await deleteUnit(id); };

  if (loading) return <AppLayout title="Unités de Mesure" subtitle="Paramétrage des unités"><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout title="Unités de Mesure" subtitle="Paramétrage des unités de vente et d'achat">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Ruler className="h-4 w-4" />
            <span><span className="font-medium text-foreground">{units.filter(u => u.is_active).length}</span> unité(s) active(s)</span>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Nouvelle unité</Button>
        </div>

        {units.length === 0 ? (
          <EmptyState icon={<Ruler className="h-8 w-8" />} title="Aucune unité" description="Ajoutez votre première unité de mesure." actionLabel="Ajouter" onAction={openCreate} />
        ) : (
          <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nom</TableHead>
                  <TableHead>Symbole</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((item, i) => (
                  <TableRow key={item.id} className={`hover:bg-muted/30 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs">{item.symbol}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{UOM_CATEGORIES[item.category] || item.category}</Badge></TableCell>
                    <TableCell><Badge variant={item.is_active ? "default" : "outline"} className="text-xs">{item.is_active ? "Actif" : "Inactif"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvelle unité"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nom *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Kilogramme" autoFocus /></div>
            <div><Label>Symbole</Label><Input value={form.symbol} onChange={e => setForm(p => ({ ...p, symbol: e.target.value }))} placeholder="Ex: kg" className="font-mono" /></div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as UnitOfMeasure["category"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(UOM_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Ordre</Label><Input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} /></div>
            <div className="flex items-center justify-between"><Label>Actif</Label><Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
