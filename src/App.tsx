import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Achats from "./pages/Achats";
import Stock from "./pages/Stock";
import Ventes from "./pages/Ventes";
import Facturation from "./pages/Facturation";
import Reglements from "./pages/Reglements";
import BI from "./pages/BI";
import Conformite from "./pages/Conformite";
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/achats" element={<Achats />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/ventes" element={<Ventes />} />
          <Route path="/facturation" element={<Facturation />} />
          <Route path="/reglements" element={<Reglements />} />
          <Route path="/bi" element={<BI />} />
          <Route path="/conformite" element={<Conformite />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
