import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import NotFound from "./pages/NotFound";
import Login from "./pages/donation/Login";
import FoodDonations from "./pages/donation/FoodDonations";
import MedicalNeeds from "./pages/donation/MedicalNeeds";
import DonorChat from "./pages/donation/DonorChat";
import NGODirectory from "./pages/donation/NGODirectory";
import Profile from "./pages/donation/Profile";

const queryClient = new QueryClient();

function RoleGuard({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  if (!role) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Login />} />
          <Route path="/" element={<RoleGuard><FoodDonations /></RoleGuard>} />
          <Route path="/needs" element={<RoleGuard><MedicalNeeds /></RoleGuard>} />
          <Route path="/chat" element={<RoleGuard><DonorChat /></RoleGuard>} />
          <Route path="/ngos" element={<RoleGuard><NGODirectory /></RoleGuard>} />
          <Route path="/profile" element={<RoleGuard><Profile /></RoleGuard>} />
          <Route path="/login" element={<Navigate to="/welcome" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
