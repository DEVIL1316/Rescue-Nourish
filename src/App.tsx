import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "./pages/NotFound";
import Login from "./pages/donation/Login";
import FoodDonations from "./pages/donation/FoodDonations";
import MedicalNeeds from "./pages/donation/MedicalNeeds";
import DonorChat from "./pages/donation/DonorChat";
import NGODirectory from "./pages/donation/NGODirectory";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-emerald-50"><p className="text-emerald-600">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><FoodDonations /></ProtectedRoute>} />
          <Route path="/needs" element={<ProtectedRoute><MedicalNeeds /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><DonorChat /></ProtectedRoute>} />
          <Route path="/ngos" element={<ProtectedRoute><NGODirectory /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
