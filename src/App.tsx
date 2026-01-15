import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Phishing from "./pages/Phishing";
import Detective from "./pages/Detective";
import Missions from "./pages/Missions";
import MissionContent from "./pages/MissionContent";
import Campaigns from "./pages/Campaigns";
import Assistant from "./pages/Assistant";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ProgressProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/phishing" element={
                  <ProtectedRoute><Phishing /></ProtectedRoute>
                } />
                <Route path="/detective" element={
                  <ProtectedRoute><Detective /></ProtectedRoute>
                } />
                <Route path="/missions" element={
                  <ProtectedRoute><Missions /></ProtectedRoute>
                } />
                <Route path="/missions/:missionId" element={
                  <ProtectedRoute><MissionContent /></ProtectedRoute>
                } />
                <Route path="/campaigns" element={
                  <ProtectedRoute><Campaigns /></ProtectedRoute>
                } />
                <Route path="/assistant" element={
                  <ProtectedRoute><Assistant /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ProgressProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
