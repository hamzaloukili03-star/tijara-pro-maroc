import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import TableauxDeBord from "./pages/TableauxDeBord";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Administration
import SystemeUtilisateurs from "./pages/SystemeUtilisateurs";
import SystemeSociete from "./pages/SystemeSociete";
import SystemeParametres from "./pages/SystemeParametres";
import SystemeLogs from "./pages/SystemeLogs";

// Référentiel
import ProductsPage from "./pages/master/ProductsPage";
import CustomersPage from "./pages/master/CustomersPage";
import SuppliersPage from "./pages/master/SuppliersPage";
import WarehousesPage from "./pages/master/WarehousesPage";
import BankAccountsPage from "./pages/master/BankAccountsPage";
import CashRegistersPage from "./pages/CashRegistersPage";

// Achats
import DemandesAchat from "./pages/achats/DemandesAchat";
import CommandesFournisseurs from "./pages/achats/CommandesFournisseurs";
import Receptions from "./pages/achats/Receptions";

// Stock
import NiveauxStock from "./pages/stock/NiveauxStock";
import Mouvements from "./pages/stock/Mouvements";
import Transferts from "./pages/stock/Transferts";
import Inventaires from "./pages/stock/Inventaires";

// Ventes
import Devis from "./pages/ventes/Devis";
import CommandesClients from "./pages/ventes/CommandesClients";
import BonsLivraison from "./pages/ventes/BonsLivraison";

// Facturation
import FacturesClients from "./pages/facturation/FacturesClients";
import FacturesFournisseurs from "./pages/facturation/FacturesFournisseurs";
import Avoirs from "./pages/facturation/Avoirs";
import ExportsJournaux from "./pages/facturation/ExportsJournaux";

// Règlements
import Encaissements from "./pages/reglements/Encaissements";
import Decaissements from "./pages/reglements/Decaissements";
import Rapprochement from "./pages/reglements/Rapprochement";
import Impayes from "./pages/reglements/Impayes";

// Documents
import Documents from "./pages/Documents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/tableaux-de-bord" element={<ProtectedRoute><TableauxDeBord /></ProtectedRoute>} />

            {/* Administration */}
            <Route path="/systeme/utilisateurs" element={<ProtectedRoute requiredRoles={["super_admin"]}><SystemeUtilisateurs /></ProtectedRoute>} />
            <Route path="/systeme/societe" element={<ProtectedRoute requiredRoles={["super_admin", "admin"]}><SystemeSociete /></ProtectedRoute>} />
            <Route path="/systeme/parametres" element={<ProtectedRoute requiredRoles={["super_admin", "admin"]}><SystemeParametres /></ProtectedRoute>} />
            <Route path="/systeme/logs" element={<ProtectedRoute requiredRoles={["super_admin", "admin"]}><SystemeLogs /></ProtectedRoute>} />

            {/* Référentiel */}
            <Route path="/referentiel/clients" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
            <Route path="/referentiel/fournisseurs" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/referentiel/produits" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/referentiel/depots" element={<ProtectedRoute><WarehousesPage /></ProtectedRoute>} />
            <Route path="/referentiel/comptes-bancaires" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />
            <Route path="/referentiel/caisses" element={<ProtectedRoute><CashRegistersPage /></ProtectedRoute>} />

            {/* Achats */}
            <Route path="/achats/demandes" element={<ProtectedRoute><DemandesAchat /></ProtectedRoute>} />
            <Route path="/achats/commandes" element={<ProtectedRoute><CommandesFournisseurs /></ProtectedRoute>} />
            <Route path="/achats/receptions" element={<ProtectedRoute><Receptions /></ProtectedRoute>} />

            {/* Stock */}
            <Route path="/stock/niveaux" element={<ProtectedRoute><NiveauxStock /></ProtectedRoute>} />
            <Route path="/stock/mouvements" element={<ProtectedRoute><Mouvements /></ProtectedRoute>} />
            <Route path="/stock/transferts" element={<ProtectedRoute><Transferts /></ProtectedRoute>} />
            <Route path="/stock/inventaires" element={<ProtectedRoute><Inventaires /></ProtectedRoute>} />

            {/* Ventes */}
            <Route path="/ventes/devis" element={<ProtectedRoute><Devis /></ProtectedRoute>} />
            <Route path="/ventes/commandes" element={<ProtectedRoute><CommandesClients /></ProtectedRoute>} />
            <Route path="/ventes/livraisons" element={<ProtectedRoute><BonsLivraison /></ProtectedRoute>} />

            {/* Facturation */}
            <Route path="/facturation/clients" element={<ProtectedRoute><FacturesClients /></ProtectedRoute>} />
            <Route path="/facturation/fournisseurs" element={<ProtectedRoute><FacturesFournisseurs /></ProtectedRoute>} />
            <Route path="/facturation/avoirs" element={<ProtectedRoute><Avoirs /></ProtectedRoute>} />
            <Route path="/facturation/exports" element={<ProtectedRoute><ExportsJournaux /></ProtectedRoute>} />

            {/* Règlements */}
            <Route path="/reglements/encaissements" element={<ProtectedRoute><Encaissements /></ProtectedRoute>} />
            <Route path="/reglements/decaissements" element={<ProtectedRoute><Decaissements /></ProtectedRoute>} />
            <Route path="/reglements/rapprochement" element={<ProtectedRoute><Rapprochement /></ProtectedRoute>} />
            <Route path="/reglements/impayes" element={<ProtectedRoute><Impayes /></ProtectedRoute>} />

            {/* Documents */}
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
