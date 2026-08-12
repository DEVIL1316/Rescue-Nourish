import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import NotFound from "./pages/NotFound";
import Login from "./pages/donation/Login";
import FoodDonations from "./pages/donation/FoodDonations";
import MedicalNeeds from "./pages/donation/MedicalNeeds";
import DonorChat from "./pages/donation/DonorChat";
import NGODirectory from "./pages/donation/NGODirectory";
import Profile from "./pages/donation/Profile";
import DonationTracking from "./pages/donation/DonationTracking";
import Deliveries from "./pages/donation/Deliveries";
import Notifications from "./pages/donation/Notifications";
import Analytics from "./pages/donation/Analytics";
import AdminDashboard from "./pages/donation/AdminDashboard";
import Watchlist from "./pages/donation/Watchlist";
import SmartMatching from "./pages/donation/SmartMatching";
import Sessions from "./pages/donation/Sessions";
import SelectLanguage from "./pages/donation/SelectLanguage";

const queryClient = new QueryClient();

function RoleGuard({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const { language } = useLanguage();
  if (!role) return <Navigate to="/welcome" replace />;
  if (!language) return <Navigate to="/select-language" replace />;
  return <>{children}</>;
}

function LanguageOnlyGuard({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  if (!role) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/welcome" element={<Login />} />
            <Route path="/select-language" element={<LanguageOnlyGuard><SelectLanguage /></LanguageOnlyGuard>} />
            <Route path="/" element={<RoleGuard><FoodDonations /></RoleGuard>} />
            <Route path="/tracking" element={<RoleGuard><DonationTracking /></RoleGuard>} />
            <Route path="/deliveries" element={<RoleGuard><Deliveries /></RoleGuard>} />
            <Route path="/needs" element={<RoleGuard><MedicalNeeds /></RoleGuard>} />
            <Route path="/chat" element={<RoleGuard><DonorChat /></RoleGuard>} />
            <Route path="/ngos" element={<RoleGuard><NGODirectory /></RoleGuard>} />
            <Route path="/notifications" element={<RoleGuard><Notifications /></RoleGuard>} />
            <Route path="/analytics" element={<RoleGuard><Analytics /></RoleGuard>} />
            <Route path="/watchlist" element={<RoleGuard><Watchlist /></RoleGuard>} />
            <Route path="/smart-matching" element={<RoleGuard><SmartMatching /></RoleGuard>} />
            <Route path="/admin" element={<RoleGuard><AdminDashboard /></RoleGuard>} />
            <Route path="/profile" element={<RoleGuard><Profile /></RoleGuard>} />
            <Route path="/sessions" element={<RoleGuard><Sessions /></RoleGuard>} />
            <Route path="/login" element={<Navigate to="/welcome" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
