import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Achats from "./pages/Achats";
import Stock from "./pages/Stock";
import Ventes from "./pages/Ventes";
import Facturation from "./pages/Facturation";
import Reglements from "./pages/Reglements";
import TableauxDeBord from "./pages/TableauxDeBord";
import Documents from "./pages/Documents";
import SystemeUtilisateurs from "./pages/SystemeUtilisateurs";
import SystemeSociete from "./pages/SystemeSociete";
import SystemeParametres from "./pages/SystemeParametres";
import SystemeLogs from "./pages/SystemeLogs";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import CashRegistersPage from "./pages/CashRegistersPage";

import ProductsPage from "./pages/master/ProductsPage";
import CustomersPage from "./pages/master/CustomersPage";
import SuppliersPage from "./pages/master/SuppliersPage";
import WarehousesPage from "./pages/master/WarehousesPage";
import BankAccountsPage from "./pages/master/BankAccountsPage";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

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
            <Route path="/achats" element={<ProtectedRoute><Achats /></ProtectedRoute>} />
            <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/stock/produits" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/stock/depots" element={<ProtectedRoute><WarehousesPage /></ProtectedRoute>} />
            <Route path="/ventes" element={<ProtectedRoute><Ventes /></ProtectedRoute>} />
            <Route path="/ventes/clients" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
            <Route path="/achats/fournisseurs" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/facturation" element={<ProtectedRoute><Facturation /></ProtectedRoute>} />
            <Route path="/reglements" element={<ProtectedRoute><Reglements /></ProtectedRoute>} />
            <Route path="/reglements/comptes-bancaires" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />
            <Route path="/reglements/caisses" element={<ProtectedRoute><CashRegistersPage /></ProtectedRoute>} />
            <Route path="/tableaux-de-bord" element={<ProtectedRoute><TableauxDeBord /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            {/* Référentiel routes */}
            <Route path="/referentiel/clients" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
            <Route path="/referentiel/fournisseurs" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/referentiel/produits" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/referentiel/depots" element={<ProtectedRoute><WarehousesPage /></ProtectedRoute>} />
            <Route path="/systeme/utilisateurs" element={<ProtectedRoute requiredRoles={["super_admin"]}><SystemeUtilisateurs /></ProtectedRoute>} />
            <Route path="/systeme/societe" element={<ProtectedRoute requiredRoles={["super_admin", "admin"]}><SystemeSociete /></ProtectedRoute>} />
            <Route path="/systeme/parametres" element={<ProtectedRoute requiredRoles={["super_admin", "admin"]}><SystemeParametres /></ProtectedRoute>} />
            <Route path="/systeme/logs" element={<ProtectedRoute requiredRoles={["super_admin", "admin"]}><SystemeLogs /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
