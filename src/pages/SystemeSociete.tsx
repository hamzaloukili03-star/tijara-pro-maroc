import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useCompanySettings, CompanySettings } from "@/hooks/useCompanySettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Upload, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formes = ["SARL", "SA", "SAS", "SARLAU", "SNC", "Auto-entrepreneur", "Autre"];

const SystemeSociete = () => {
  const { settings, loading, update, uploadLogo } = useCompanySettings();
  const [form, setForm] = useState<Partial<CompanySettings>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (key: keyof CompanySettings, value: string | number) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    await update(form);
    setSaving(false);
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadLogo(file);
    if (url) {
      setForm((p) => ({ ...p, logo_url: url }));
      await update({ ...form, logo_url: url });
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <AppLayout title="Paramètres Société" subtitle="Informations légales et fiscales">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Paramètres Société" subtitle="Informations légales et fiscales de l'entreprise">
      <div className="space-y-6 max-w-4xl">
        {/* Logo */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5" /> Logo de l'entreprise</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-6">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="h-20 w-20 object-contain rounded-lg border border-border" />
            ) : (
              <div className="h-20 w-20 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground text-xs">Aucun</div>
            )}
            <div>
              <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleLogo} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {uploading ? "Upload…" : "Changer le logo"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Identité */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Identité de l'entreprise</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Raison sociale" value={form.raison_sociale} onChange={(v) => set("raison_sociale", v)} />
            <div className="space-y-2">
              <Label>Forme juridique</Label>
              <Select value={form.forme_juridique || ""} onValueChange={(v) => set("forme_juridique", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{formes.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Field label="Capital (MAD)" value={String(form.capital || "")} onChange={(v) => set("capital", Number(v))} type="number" />
          </CardContent>
        </Card>

        {/* Identifiants fiscaux */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Identifiants fiscaux</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="ICE" value={form.ice} onChange={(v) => set("ice", v)} />
            <Field label="IF (Identifiant fiscal)" value={form.if_number} onChange={(v) => set("if_number", v)} />
            <Field label="RC (Registre de commerce)" value={form.rc} onChange={(v) => set("rc", v)} />
            <Field label="Patente" value={form.patente} onChange={(v) => set("patente", v)} />
            <Field label="CNSS" value={form.cnss} onChange={(v) => set("cnss", v)} />
          </CardContent>
        </Card>

        {/* Coordonnées */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Coordonnées</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Adresse" value={form.address} onChange={(v) => set("address", v)} className="md:col-span-2" />
            <Field label="Ville" value={form.city} onChange={(v) => set("city", v)} />
            <Field label="Code postal" value={form.postal_code} onChange={(v) => set("postal_code", v)} />
            <Field label="Téléphone" value={form.phone} onChange={(v) => set("phone", v)} />
            <Field label="Fax" value={form.fax} onChange={(v) => set("fax", v)} />
            <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
            <Field label="Site web" value={form.website} onChange={(v) => set("website", v)} />
          </CardContent>
        </Card>

        {/* Banque */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Informations bancaires</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Banque" value={form.bank_name} onChange={(v) => set("bank_name", v)} />
            <Field label="RIB" value={form.bank_rib} onChange={(v) => set("bank_rib", v)} />
            <Field label="SWIFT" value={form.bank_swift} onChange={(v) => set("bank_swift", v)} />
          </CardContent>
        </Card>

        <Separator />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="min-w-[160px]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

function Field({ label, value, onChange, type = "text", className = "" }: {
  label: string; value?: string | null; onChange: (v: string) => void; type?: string; className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export default SystemeSociete;
