import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Plus, X, Percent, DollarSign, FileText, Package, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SystemeParametres = () => {
  const { settings, loading, update } = useSystemSettings();
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole("super_admin");

  const [tvaRates, setTvaRates] = useState<number[]>([]);
  const [newTva, setNewTva] = useState("");
  const [defaultTva, setDefaultTva] = useState(20);
  const [defaultCurrency, setDefaultCurrency] = useState("MAD");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("30j");
  const [docFormat, setDocFormat] = useState("TYPE/YEAR/0000X");
  const [allowNegativeStock, setAllowNegativeStock] = useState(false);
  const [allowAdminOverrides, setAllowAdminOverrides] = useState(true);
  const [enableAttachments, setEnableAttachments] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setTvaRates(settings.tva_rates);
      setDefaultTva(settings.default_tva);
      setDefaultCurrency(settings.default_currency);
      setDefaultPaymentTerms(settings.default_payment_terms);
      setDocFormat(settings.doc_numbering_format);
      setAllowNegativeStock(settings.allow_negative_stock);
      setAllowAdminOverrides(settings.allow_admin_overrides);
      setEnableAttachments(settings.enable_attachments);
    }
  }, [settings]);

  const addTvaRate = () => {
    const val = parseFloat(newTva);
    if (isNaN(val) || val <= 0 || val > 100) {
      toast({ title: "Taux invalide", variant: "destructive" });
      return;
    }
    if (tvaRates.includes(val)) {
      toast({ title: "Ce taux existe déjà", variant: "destructive" });
      return;
    }
    setTvaRates([...tvaRates, val].sort((a, b) => a - b));
    setNewTva("");
  };

  const removeTvaRate = (rate: number) => {
    const updated = tvaRates.filter((r) => r !== rate);
    setTvaRates(updated);
    if (defaultTva === rate && updated.length > 0) {
      setDefaultTva(updated[updated.length - 1]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await update({
      tva_rates: tvaRates as any,
      default_tva: defaultTva,
      default_currency: defaultCurrency,
      default_payment_terms: defaultPaymentTerms,
      doc_numbering_format: docFormat,
      allow_negative_stock: allowNegativeStock,
      allow_admin_overrides: allowAdminOverrides,
      enable_attachments: enableAttachments,
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <AppLayout title="Paramètres Système" subtitle="Configuration générale et conformité marocaine">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Paramètres Système" subtitle="Configuration générale et conformité marocaine">
      <div className="space-y-6 max-w-3xl">
        {/* TVA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Percent className="h-4 w-4 text-primary" /> Taux de TVA</CardTitle>
            <CardDescription>Gérez les taux de TVA applicables aux documents commerciaux</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tvaRates.map((rate) => (
                <Badge key={rate} variant="secondary" className="text-sm gap-1 pr-1">
                  {rate}%
                  {isSuperAdmin && (
                    <button onClick={() => removeTvaRate(rate)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isSuperAdmin && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Nouveau taux (%)"
                  value={newTva}
                  onChange={(e) => setNewTva(e.target.value)}
                  className="w-40"
                  onKeyDown={(e) => e.key === "Enter" && addTvaRate()}
                />
                <Button variant="outline" size="sm" onClick={addTvaRate}><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Label className="text-sm text-muted-foreground">TVA par défaut :</Label>
              <Select value={String(defaultTva)} onValueChange={(v) => setDefaultTva(Number(v))} disabled={!isSuperAdmin}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tvaRates.map((r) => (
                    <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><DollarSign className="h-4 w-4 text-primary" /> Devise & Paiement</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Devise par défaut</Label>
              <Select value={defaultCurrency} onValueChange={setDefaultCurrency} disabled={!isSuperAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">MAD - Dirham Marocain</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - Dollar US</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Conditions de paiement par défaut</Label>
              <Select value={defaultPaymentTerms} onValueChange={setDefaultPaymentTerms} disabled={!isSuperAdmin}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comptant">Comptant</SelectItem>
                  <SelectItem value="30j">30 jours</SelectItem>
                  <SelectItem value="60j">60 jours</SelectItem>
                  <SelectItem value="90j">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Document numbering */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4 text-primary" /> Numérotation des documents</CardTitle>
            <CardDescription>Format de numérotation automatique pour les documents commerciaux</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm">Format</Label>
              <Input value={docFormat} onChange={(e) => setDocFormat(e.target.value)} disabled={!isSuperAdmin} />
              <p className="text-xs text-muted-foreground">Exemple : FAC/2026/00001, BC/2026/00042</p>
            </div>
          </CardContent>
        </Card>

        {/* Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4 text-primary" /> Options avancées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Autoriser le stock négatif</Label>
                <p className="text-xs text-muted-foreground">Permet de valider des bons de sortie même si le stock est insuffisant</p>
              </div>
              <Switch checked={allowNegativeStock} onCheckedChange={setAllowNegativeStock} disabled={!isSuperAdmin} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Autoriser les dérogations admin</Label>
                <p className="text-xs text-muted-foreground">Permet aux admins de contourner certaines restrictions métier</p>
              </div>
              <Switch checked={allowAdminOverrides} onCheckedChange={setAllowAdminOverrides} disabled={!isSuperAdmin} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Pièces jointes</Label>
                <p className="text-xs text-muted-foreground">Activer/désactiver les pièces jointes sur les documents</p>
              </div>
              <Switch checked={enableAttachments} onCheckedChange={setEnableAttachments} disabled={!isSuperAdmin} />
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        {isSuperAdmin && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer les paramètres
            </Button>
          </div>
        )}

        {!isSuperAdmin && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Seul le Super Admin peut modifier les paramètres système. Vous êtes en mode lecture seule.
          </p>
        )}
      </div>
    </AppLayout>
  );
};

export default SystemeParametres;
