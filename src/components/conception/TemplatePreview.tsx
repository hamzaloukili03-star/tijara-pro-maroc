import { TEMPLATE_DOC_LABELS, type TemplateConfig, type TemplateDocType } from "@/hooks/useDocumentTemplates";

interface TemplatePreviewProps {
  config: TemplateConfig;
  docType: TemplateDocType;
}

const SAMPLE_DATA = {
  company: "ACME Maroc SARL",
  ice: "001234567000089",
  rc: "RC 12345",
  if_number: "IF 67890",
  address: "123 Bd Mohammed V, Casablanca",
  phone: "+212 522 123 456",
  email: "contact@acme.ma",
  number: "FAC/2026/00001",
  date: "23/02/2026",
  dueDate: "25/03/2026",
  paymentTerms: "30 jours",
  clientName: "Client Exemple SA",
  clientAddress: "456 Rue Hassan II, Rabat",
  clientIce: "009876543000012",
  lines: [
    { ref: "ART-001", desc: "Produit exemple A", qty: 10, unit: "Unité", pu: 150.0, rem: 0, tva: 20, ht: 1500.0, ttc: 1800.0 },
    { ref: "ART-002", desc: "Service exemple B", qty: 5, unit: "H", pu: 300.0, rem: 5, tva: 20, ht: 1425.0, ttc: 1710.0 },
    { ref: "ART-003", desc: "Produit exemple C", qty: 2, unit: "Kg", pu: 1200.0, rem: 0, tva: 20, ht: 2400.0, ttc: 2880.0 },
  ],
  totalHt: 5325.0,
  totalTva: 1065.0,
  totalTtc: 6390.0,
};

const fmt = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function TemplatePreview({ config, docType }: TemplatePreviewProps) {
  const sorted = [...config.blocks].sort((a, b) => a.order - b.order).filter((b) => b.visible);
  const g = config.globalStyles;
  const d = SAMPLE_DATA;

  return (
    <div className="flex justify-center">
      <div
        className="bg-white shadow-xl border rounded"
        style={{
          width: 595,
          minHeight: 842,
          padding: "28px 30px",
          fontFamily: g.fontFamily,
          fontSize: g.bodyFontSize,
          color: "#1A2B3C",
        }}
      >
        {sorted.map((block) => {
          const mb = block.styles.spacing || 10;

          if (block.type === "logo") {
            return (
              <div key={block.id} style={{ marginBottom: mb, display: "flex", justifyContent: "space-between", borderBottom: `2.5px solid ${g.primaryColor}`, paddingBottom: 12 }}>
                <div>
                  <div style={{ fontSize: block.styles.fontSize || 13, fontWeight: 700, color: g.secondaryColor }}>{d.company}</div>
                  {block.fields?.forme_juridique && <div style={{ fontSize: 8, color: "#4A6070" }}>SARL</div>}
                  {block.fields?.address && <div style={{ fontSize: 7.5, color: "#4A6070" }}>{d.address}</div>}
                  {block.fields?.phone && <div style={{ fontSize: 7.5, color: "#4A6070" }}>Tél: {d.phone}</div>}
                  {block.fields?.email && <div style={{ fontSize: 7.5, color: "#4A6070" }}>{d.email}</div>}
                </div>
                <div style={{ background: "#EBF8FD", borderRadius: 4, padding: "7px 9px", fontSize: 7 }}>
                  {block.fields?.ice !== false && <div><strong>ICE</strong> {d.ice}</div>}
                  {block.fields?.if_number !== false && <div><strong>IF</strong> {d.if_number}</div>}
                  {block.fields?.rc !== false && <div><strong>RC</strong> {d.rc}</div>}
                </div>
              </div>
            );
          }

          if (block.type === "title") {
            return (
              <div key={block.id} style={{
                marginBottom: mb, background: block.styles.backgroundColor || g.secondaryColor,
                borderRadius: 4, padding: "9px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: block.styles.fontSize || 16, fontWeight: 700, color: block.styles.color || "#fff", letterSpacing: 1.5 }}>
                  {TEMPLATE_DOC_LABELS[docType].toUpperCase()}
                </span>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: g.primaryColor, fontWeight: 700 }}>N° {d.number}</div>
                  <div style={{ fontSize: 8, color: "#B0C8D8" }}>Date: {d.date}</div>
                </div>
              </div>
            );
          }

          if (block.type === "doc_info") {
            const items = [
              block.fields?.date !== false && { label: "Date du document", value: d.date },
              block.fields?.due_date !== false && { label: "Échéance", value: d.dueDate },
              block.fields?.payment_terms !== false && { label: "Conditions", value: d.paymentTerms },
            ].filter(Boolean) as { label: string; value: string }[];
            return (
              <div key={block.id} style={{ marginBottom: mb, display: "flex", gap: 8 }}>
                {items.map((item, i) => (
                  <div key={i} style={{ flex: 1, background: "#EBF8FD", borderRadius: 4, padding: "6px 8px", borderLeft: `3px solid ${g.primaryColor}` }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: "#4A6070", textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 8.5, fontWeight: 700 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            );
          }

          if (block.type === "party") {
            return (
              <div key={block.id} style={{ marginBottom: mb, display: "flex", gap: 10 }}>
                <div style={{ flex: 1, border: "1px solid #D4E2E9", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ background: g.secondaryColor, padding: "5px 10px" }}>
                    <span style={{ fontSize: 7.5, color: "#fff", fontWeight: 700, letterSpacing: 0.8 }}>CLIENT</span>
                  </div>
                  <div style={{ padding: "9px 10px", minHeight: 65 }}>
                    {block.fields?.name !== false && <div style={{ fontSize: 9.5, fontWeight: 700, color: g.secondaryColor }}>{d.clientName}</div>}
                    {block.fields?.address !== false && <div style={{ fontSize: 7.5, color: "#4A6070" }}>{d.clientAddress}</div>}
                    {block.fields?.ice !== false && <div style={{ fontSize: 7.5, color: g.primaryColor, fontWeight: 700 }}>ICE: {d.clientIce}</div>}
                  </div>
                </div>
                <div style={{ flex: 1, border: "1px solid #D4E2E9", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ background: g.secondaryColor, padding: "5px 10px" }}>
                    <span style={{ fontSize: 7.5, color: "#fff", fontWeight: 700, letterSpacing: 0.8 }}>ÉMETTEUR</span>
                  </div>
                  <div style={{ padding: "9px 10px", minHeight: 65 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: g.secondaryColor }}>{d.company}</div>
                    <div style={{ fontSize: 7.5, color: "#4A6070" }}>{d.address}</div>
                    <div style={{ fontSize: 7.5, color: g.primaryColor, fontWeight: 700 }}>ICE: {d.ice}</div>
                  </div>
                </div>
              </div>
            );
          }

          if (block.type === "lines_table") {
            const f = block.fields || {};
            return (
              <div key={block.id} style={{ marginBottom: mb }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: g.secondaryColor }}>
                      {f.ref !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "center" }}>Réf.</th>}
                      {f.description !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "left" }}>Désignation</th>}
                      {f.qty !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "center" }}>Qté</th>}
                      {f.unit !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "center" }}>Unité</th>}
                      {f.unit_price !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "right" }}>P.U.</th>}
                      {f.discount !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "center" }}>Rem.</th>}
                      {f.tva !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "center" }}>TVA</th>}
                      {f.total_ht !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "right" }}>Total HT</th>}
                      {f.total_ttc !== false && <th style={{ color: "#fff", fontSize: 7.5, fontWeight: 700, padding: "6px 5px", textAlign: "right" }}>Total TTC</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {d.lines.map((l, i) => (
                      <tr key={i} style={{ background: i % 2 === 1 ? "#F4FAFD" : "transparent", borderBottom: "1px solid #D4E2E9" }}>
                        {f.ref !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "center" }}>{l.ref}</td>}
                        {f.description !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px" }}>{l.desc}</td>}
                        {f.qty !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "center" }}>{l.qty}</td>}
                        {f.unit !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "center" }}>{l.unit}</td>}
                        {f.unit_price !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "right" }}>{fmt(l.pu)}</td>}
                        {f.discount !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "center" }}>{l.rem}%</td>}
                        {f.tva !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "center" }}>{l.tva}%</td>}
                        {f.total_ht !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "right", fontWeight: 600 }}>{fmt(l.ht)}</td>}
                        {f.total_ttc !== false && <td style={{ fontSize: block.styles.fontSize || 8, padding: "5px", textAlign: "right", fontWeight: 600 }}>{fmt(l.ttc)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.type === "totals") {
            return (
              <div key={block.id} style={{ marginBottom: mb, display: "flex", justifyContent: "flex-end" }}>
                <table style={{ width: 210, border: "1px solid #D4E2E9", borderRadius: 5, overflow: "hidden", borderCollapse: "collapse" }}>
                  <tbody>
                    {block.fields?.total_ht !== false && (
                      <tr style={{ borderBottom: "1px solid #D4E2E9" }}>
                        <td style={{ fontSize: 8, color: "#4A6070", padding: "5px 10px" }}>Total HT</td>
                        <td style={{ fontSize: 8, fontWeight: 700, textAlign: "right", padding: "5px 10px" }}>{fmt(d.totalHt)} MAD</td>
                      </tr>
                    )}
                    {block.fields?.total_tva !== false && (
                      <tr style={{ borderBottom: "1px solid #D4E2E9" }}>
                        <td style={{ fontSize: 8, color: "#4A6070", padding: "5px 10px" }}>Total TVA</td>
                        <td style={{ fontSize: 8, fontWeight: 700, textAlign: "right", padding: "5px 10px" }}>{fmt(d.totalTva)} MAD</td>
                      </tr>
                    )}
                    {block.fields?.total_ttc !== false && (
                      <tr style={{ background: g.secondaryColor }}>
                        <td style={{ fontSize: 10, fontWeight: 700, color: "#fff", padding: "8px 10px" }}>Total TTC</td>
                        <td style={{ fontSize: 10, fontWeight: 700, color: g.primaryColor, textAlign: "right", padding: "8px 10px" }}>{fmt(d.totalTtc)} MAD</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.type === "notes") {
            return (
              <div key={block.id} style={{ marginBottom: mb, borderLeft: `3px solid ${g.primaryColor}`, background: `${g.primaryColor}10`, padding: "7px 9px", borderRadius: 3 }}>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: "#4A6070", textTransform: "uppercase", marginBottom: 2 }}>Notes</div>
                <div style={{ fontSize: block.styles.fontSize || 8 }}>Conditions de paiement : 30 jours fin de mois.</div>
              </div>
            );
          }

          if (block.type === "bank") {
            return (
              <div key={block.id} style={{ marginBottom: mb, background: "#EBF8FD", borderRadius: 3, padding: "6px 8px" }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: g.secondaryColor, textTransform: "uppercase", marginBottom: 3 }}>Coordonnées bancaires</div>
                {block.fields?.bank_name !== false && <div style={{ fontSize: 7 }}><span style={{ color: "#4A6070", width: 55, display: "inline-block" }}>Banque</span> Attijariwafa Bank</div>}
                {block.fields?.rib !== false && <div style={{ fontSize: 7 }}><span style={{ color: "#4A6070", width: 55, display: "inline-block" }}>RIB</span> 007 780 0001234567890123</div>}
                {block.fields?.swift !== false && <div style={{ fontSize: 7 }}><span style={{ color: "#4A6070", width: 55, display: "inline-block" }}>SWIFT</span> BCMAMAMC</div>}
              </div>
            );
          }

          if (block.type === "footer") {
            return (
              <div key={block.id} style={{ marginTop: mb, borderTop: `1.5px solid ${g.primaryColor}`, paddingTop: 6, textAlign: "center", fontSize: 6.5, color: "#7A919E" }}>
                {d.company} — SARL au capital de 500 000 MAD<br />
                ICE: {d.ice} | IF: {d.if_number} | RC: {d.rc}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
