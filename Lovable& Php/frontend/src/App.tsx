import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgentSearchProvider } from "@/contexts/AgentSearchContext";
import { WizardProvider } from "@/contexts/WizardContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRestrictedRoute from "@/components/RoleRestrictedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import ClaimsAnnouncementBar from "@/components/ClaimsAnnouncementBar";
import Index from "./pages/Index";
import PageSkeleton from "@/components/skeletons/PageSkeleton";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AgentsListing = lazy(() => import("./pages/AgentsListing"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
const AgentProfileSetup = lazy(() => import("./pages/AgentProfileSetup"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const AgentDashboard = lazy(() => import("./pages/AgentDashboard"));
const DistributorDashboard = lazy(() => import("./pages/DistributorDashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const ClaimAssistance = lazy(() => import("./pages/ClaimAssistance"));
const Calculators = lazy(() => import("./pages/Calculators"));
const BlacklistedAgents = lazy(() => import("./pages/BlacklistedAgents"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CityLanding = lazy(() => import("./pages/CityLanding"));
const CityIndex = lazy(() => import("./pages/CityIndex"));
const InsuranceTypeLanding = lazy(() => import("./pages/InsuranceTypeLanding"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Start = lazy(() => import("./pages/Start"));
const Compare = lazy(() => import("./pages/Compare"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AgentSearchProvider>
            <WizardProvider>
            <ClaimsAnnouncementBar />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<RoleRestrictedRoute><Index /></RoleRestrictedRoute>} />
                <Route path="/start" element={<Start />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/agents" element={<RoleRestrictedRoute><AgentsListing /></RoleRestrictedRoute>} />
                <Route path="/agent/:id" element={<RoleRestrictedRoute><AgentProfile /></RoleRestrictedRoute>} />

                <Route 
                  path="/client-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <ClientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                      <AgentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/agent-profile-setup" 
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                      <AgentProfileSetup />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/distributor-dashboard" 
                  element={
                    <ProtectedRoute allowedRoles={['distributor', 'admin']}>
                      <DistributorDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />

                <Route path="/blog" element={<RoleRestrictedRoute><Blog /></RoleRestrictedRoute>} />
                <Route path="/blog/:id" element={<RoleRestrictedRoute><BlogArticle /></RoleRestrictedRoute>} />
                <Route path="/about" element={<RoleRestrictedRoute><AboutUs /></RoleRestrictedRoute>} />
                <Route path="/contact" element={<RoleRestrictedRoute><ContactUs /></RoleRestrictedRoute>} />
                <Route path="/claim-assistance" element={<RoleRestrictedRoute><ClaimAssistance /></RoleRestrictedRoute>} />
                <Route path="/calculators" element={<RoleRestrictedRoute><Calculators /></RoleRestrictedRoute>} />
                <Route path="/blacklisted-agents" element={<RoleRestrictedRoute><BlacklistedAgents /></RoleRestrictedRoute>} />
                <Route path="/faq" element={<RoleRestrictedRoute><FAQPage /></RoleRestrictedRoute>} />
                <Route path="/privacy-policy" element={<RoleRestrictedRoute><PrivacyPolicy /></RoleRestrictedRoute>} />
                <Route path="/terms-of-service" element={<RoleRestrictedRoute><TermsOfService /></RoleRestrictedRoute>} />
                <Route path="/insurance-agents" element={<RoleRestrictedRoute><CityIndex /></RoleRestrictedRoute>} />
                <Route path="/insurance-agents/:city" element={<RoleRestrictedRoute><CityLanding /></RoleRestrictedRoute>} />
                <Route path="/health-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
                <Route path="/life-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
                <Route path="/motor-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
                <Route path="/sme-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
                <Route path="/travel-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
                <Route path="/home-insurance" element={<RoleRestrictedRoute><InsuranceTypeLanding /></RoleRestrictedRoute>} />
                <Route path="/compare" element={<RoleRestrictedRoute><Compare /></RoleRestrictedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </WizardProvider>
          </AgentSearchProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
