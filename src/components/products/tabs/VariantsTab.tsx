import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProductVariants } from "@/hooks/useProducts";
import { Plus, Trash2, Wand2, X, Loader2, Pencil, Check, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";

interface VariantsTabProps {
  productId: string | null;
}

interface LocalAttribute {
  id?: string; // DB id if persisted
  name: string;
  values: { id?: string; label: string }[];
}

export function VariantsTab({ productId }: VariantsTabProps) {
  const { variants, loading: variantsLoading, generateVariants, updateVariant, deleteVariant } = useProductVariants(productId);
  const { activeCompany } = useCompany();
  const companyId = activeCompany?.id ?? null;

  const [localAttrs, setLocalAttrs] = useState<LocalAttribute[]>([]);
  const [newAttrName, setNewAttrName] = useState("");
  const [newValueMap, setNewValueMap] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [variantEdits, setVariantEdits] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);

  // Load existing attributes linked to this product
  const loadExisting = useCallback(async () => {
    if (!productId) return;
    const { data: lines } = await (supabase as any)
      .from("product_attribute_lines")
      .select("id, attribute_id, product_attributes(id, name)")
      .eq("product_id", productId);
    if (!lines || lines.length === 0) { setLoaded(true); return; }

    const lineIds = lines.map((l: any) => l.id);
    const { data: lineValues } = await (supabase as any)
      .from("product_attribute_line_values")
      .select("line_id, value_id, product_attribute_values(id, value)")
      .in("line_id", lineIds);

    const attrs: LocalAttribute[] = lines.map((line: any) => ({
      id: line.product_attributes?.id,
      name: line.product_attributes?.name || "",
      values: (lineValues || [])
        .filter((lv: any) => lv.line_id === line.id)
        .map((lv: any) => ({ id: lv.product_attribute_values?.id, label: lv.product_attribute_values?.value || "" })),
    }));
    setLocalAttrs(attrs);
    setLoaded(true);
  }, [productId]);

  useEffect(() => { loadExisting(); }, [loadExisting]);

  if (!productId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-lg font-medium">Enregistrez d'abord le produit</p>
        <p className="text-sm mt-1">Les variantes seront disponibles après la création du produit.</p>
      </div>
    );
  }

  const handleAddAttribute = () => {
    const name = newAttrName.trim();
    if (!name) return;
    if (localAttrs.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Attribut déjà ajouté", variant: "destructive" });
      return;
    }
    setLocalAttrs((prev) => [...prev, { name, values: [] }]);
    setNewAttrName("");
  };

  const handleRemoveAttribute = (idx: number) => {
    setLocalAttrs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddValue = (idx: number) => {
    const val = newValueMap[idx]?.trim();
    if (!val) return;
    setLocalAttrs((prev) => {
      const copy = [...prev];
      if (copy[idx].values.some((v) => v.label.toLowerCase() === val.toLowerCase())) {
        toast({ title: "Valeur déjà existante", variant: "destructive" });
        return prev;
      }
      copy[idx] = { ...copy[idx], values: [...copy[idx].values, { label: val }] };
      return copy;
    });
    setNewValueMap((prev) => ({ ...prev, [idx]: "" }));
  };

  const handleRemoveValue = (attrIdx: number, valIdx: number) => {
    setLocalAttrs((prev) => {
      const copy = [...prev];
      copy[attrIdx] = { ...copy[attrIdx], values: copy[attrIdx].values.filter((_, i) => i !== valIdx) };
      return copy;
    });
  };

  const handleGenerate = async () => {
    const validAttrs = localAttrs.filter((a) => a.values.length > 0);
    if (validAttrs.length === 0) {
      toast({ title: "Ajoutez des valeurs", description: "Chaque attribut doit avoir au moins une valeur.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      // Persist attributes and values to DB, collect IDs
      const lines: { attribute_id: string; value_ids: string[] }[] = [];

      for (const attr of validAttrs) {
        // Find or create attribute
        let attrId = attr.id;
        if (!attrId) {
          const { data: existing } = await (supabase as any)
            .from("product_attributes")
            .select("id")
            .ilike("name", attr.name)
            .maybeSingle();
          if (existing) {
            attrId = existing.id;
          } else {
            const { data: created } = await (supabase as any)
              .from("product_attributes")
              .insert({ name: attr.name, display_type: "dropdown" })
              .select("id")
              .single();
            if (!created) continue;
            attrId = created.id;
          }
        }

        // Find or create values
        const valueIds: string[] = [];
        for (const val of attr.values) {
          let valId = val.id;
          if (!valId) {
            const { data: existingVal } = await (supabase as any)
              .from("product_attribute_values")
              .select("id")
              .eq("attribute_id", attrId)
              .ilike("value", val.label)
              .maybeSingle();
            if (existingVal) {
              valId = existingVal.id;
            } else {
              const { data: createdVal } = await (supabase as any)
                .from("product_attribute_values")
                .insert({ attribute_id: attrId, value: val.label })
                .select("id")
                .single();
              if (!createdVal) continue;
              valId = createdVal.id;
            }
          }
          valueIds.push(valId!);
        }

        // Save attribute line
        const { data: lineData } = await (supabase as any)
          .from("product_attribute_lines")
          .upsert(
            { product_id: productId, attribute_id: attrId, company_id: companyId },
            { onConflict: "product_id,attribute_id" }
          )
          .select()
          .single();
        if (lineData) {
          for (const vid of valueIds) {
            await (supabase as any)
              .from("product_attribute_line_values")
              .upsert(
                { line_id: lineData.id, value_id: vid, company_id: companyId },
                { onConflict: "line_id,value_id" }
              );
          }
        }

        lines.push({ attribute_id: attrId!, value_ids: valueIds });
      }

      await generateVariants(productId, lines);
      // Reload to get persisted IDs
      await loadExisting();
    } finally {
      setGenerating(false);
    }
  };

  const handleVariantSave = async (variantId: string) => {
    const edits = variantEdits[variantId];
    if (!edits) return;
    await updateVariant(variantId, edits);
    setEditingVariant(null);
    setVariantEdits((prev) => { const n = { ...prev }; delete n[variantId]; return n; });
  };

  const combinationCount = localAttrs
    .filter((a) => a.values.length > 0)
    .reduce((acc, a) => acc * a.values.length, 1);
  const hasValues = localAttrs.some((a) => a.values.length > 0);

  return (
    <div className="space-y-6">
      {/* ── Add Attribute ── */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Attributs du produit</Label>
        <div className="flex items-center gap-3 mb-4">
          <Input
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            placeholder="Nom de l'attribut (ex: Poids, Couleur, Taille...)"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddAttribute()}
          />
          <Button onClick={handleAddAttribute} size="sm" className="gap-1 shrink-0" disabled={!newAttrName.trim()}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>

        {/* ── Attribute Cards ── */}
        <div className="space-y-3">
          {localAttrs.map((attr, attrIdx) => (
            <div key={attrIdx} className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm uppercase tracking-wide">{attr.name}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveAttribute(attrIdx)} title="Supprimer l'attribut">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {attr.values.map((v, vIdx) => (
                  <span
                    key={vIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-background border border-border"
                  >
                    {v.label}
                    <button
                      onClick={() => handleRemoveValue(attrIdx, vIdx)}
                      className="opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {attr.values.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Aucune valeur définie</span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newValueMap[attrIdx] || ""}
                  onChange={(e) => setNewValueMap((prev) => ({ ...prev, [attrIdx]: e.target.value }))}
                  placeholder="Ajouter une valeur..."
                  className="h-9 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleAddValue(attrIdx)}
                />
                <Button size="sm" variant="outline" className="h-9 px-3" onClick={() => handleAddValue(attrIdx)} disabled={!newValueMap[attrIdx]?.trim()}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Generate Button ── */}
      {localAttrs.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border">
          <Button onClick={handleGenerate} disabled={generating || !hasValues} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Générer les variantes
          </Button>
          <span className="text-sm text-muted-foreground">
            {hasValues
              ? `${combinationCount} combinaison(s) à générer`
              : "Ajoutez des valeurs aux attributs"}
          </span>
        </div>
      )}

      {/* ── Variants Table ── */}
      {variants.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3">Variantes ({variants.length})</h3>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Variante</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Code-barres</TableHead>
                  <TableHead className="text-right">Prix vente</TableHead>
                  <TableHead className="text-right">Coût d'achat</TableHead>
                  <TableHead className="text-center">Actif</TableHead>
                  <TableHead className="w-24 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variantsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : variants.map((v) => {
                  const isEditing = editingVariant === v.id;
                  const edits = variantEdits[v.id] || {};
                  return (
                    <TableRow key={v.id} className={!v.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {v.attribute_values.map((av, i) => (
                            <Badge key={i} variant="secondary" className="text-xs gap-1">
                              {av.color_hex && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: av.color_hex }} />}
                              {av.value}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input className="h-8 w-28" value={edits.sku ?? v.sku ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, sku: e.target.value } }))} />
                        ) : (
                          <span className="text-sm">{v.sku || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input className="h-8 w-32" value={edits.barcode ?? v.barcode ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, barcode: e.target.value } }))} />
                        ) : (
                          <span className="text-sm">{v.barcode || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input className="h-8 w-24 text-right" type="number" step="0.01" value={edits.sale_price ?? v.sale_price ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, sale_price: e.target.value ? Number(e.target.value) : null } }))} />
                        ) : (
                          <span className="text-sm">{v.sale_price != null ? `${Number(v.sale_price).toLocaleString("fr-MA")} MAD` : <span className="text-muted-foreground">Parent</span>}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input className="h-8 w-24 text-right" type="number" step="0.01" value={edits.purchase_price ?? v.purchase_price ?? ""} onChange={(e) => setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, purchase_price: e.target.value ? Number(e.target.value) : null } }))} />
                        ) : (
                          <span className="text-sm">{v.purchase_price != null ? `${Number(v.purchase_price).toLocaleString("fr-MA")} MAD` : <span className="text-muted-foreground">Parent</span>}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={isEditing ? (edits.is_active ?? v.is_active) : v.is_active}
                          onCheckedChange={(val) => {
                            if (isEditing) {
                              setVariantEdits((p) => ({ ...p, [v.id]: { ...edits, is_active: val } }));
                            } else {
                              updateVariant(v.id, { is_active: val } as any);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => handleVariantSave(v.id)}>
                              <Check className="h-3 w-3" /> OK
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingVariant(v.id)} title="Modifier">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteVariant(v.id)} title="Supprimer">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
