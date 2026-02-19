import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "": "Administration",
  systeme: "Administration",
  utilisateurs: "Utilisateurs & Rôles",
  societe: "Paramètres Société",
  parametres: "Paramètres Système",
  logs: "Logs d'activité",
  achats: "Achats",
  fournisseurs: "Fournisseurs",
  stock: "Stock",
  produits: "Produits",
  depots: "Dépôts",
  ventes: "Ventes",
  clients: "Clients",
  facturation: "Facturation",
  reglements: "Règlements & Trésorerie",
  "comptes-bancaires": "Comptes Bancaires",
  "tableaux-de-bord": "Tableaux de Bord & Analyses",
  documents: "Documents",
  referentiel: "Référentiel",
  caisses: "Caisses",
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, i) => {
        const path = "/" + segments.slice(0, i + 1).join("/");
        const label = routeLabels[segment] || segment;
        const isLast = i === segments.length - 1;
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-foreground transition-colors">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
