import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import { LeadModalProvider } from "@/components/site/LeadModalProvider";
import { BrochureModalProvider } from "@/components/site/BrochureModalProvider";
import CookieBanner from "./components/site/CookieBanner";
import PublicAIChat from "@/components/site/PublicAIChat";
// Lazy-loaded Public Pages
const HomePage = lazy(() => import("@/pages/HomePage"));
const HomeDetailPage = lazy(() => import("@/pages/HomeDetailPage"));
const PackagesPage = lazy(() => import("@/pages/PackagesPage"));
const PackageDetailPage = lazy(() => import("@/pages/PackageDetailPage"));
const PackagesComparePage = lazy(() => import("@/pages/PackagesComparePage"));
const FindMyPackagePage = lazy(() => import("@/pages/FindMyPackagePage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const BlogListPage = lazy(() => import("@/pages/BlogListPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PublicQuotePage = lazy(() => import("@/pages/PublicQuotePage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// Lazy-loaded Portal
const PortalLogin = lazy(() => import("@/pages/portal/PortalLogin"));
const PortalLayout = lazy(() => import("@/pages/portal/PortalLayout"));
const DashboardPage = lazy(() => import("@/pages/portal/pages/DashboardPage"));
const MyProjectPage = lazy(() => import("@/pages/portal/pages/MyProjectPage"));
const LiveCCTVPage = lazy(() => import("@/pages/portal/pages/LiveCCTVPage"));
const ProgressPage = lazy(() => import("@/pages/portal/pages/ProgressPage"));
const TimelinePage = lazy(() => import("@/pages/portal/pages/TimelinePage"));
const DrawingsPage = lazy(() => import("@/pages/portal/pages/DrawingsPage"));
const MaterialsPage = lazy(() => import("@/pages/portal/pages/MaterialsPage"));
const QualityPage = lazy(() => import("@/pages/portal/pages/QualityPage"));
const DocumentsPage = lazy(() => import("@/pages/portal/pages/DocumentsPage"));
const PaymentsPage = lazy(() => import("@/pages/portal/pages/PaymentsPage"));
const TeamPage = lazy(() => import("@/pages/portal/pages/TeamPage"));
const ApprovalsPage = lazy(() => import("@/pages/portal/pages/ApprovalsPage"));
const MessagesPage = lazy(() => import("@/pages/portal/pages/MessagesPage"));
const SiteReportsPage = lazy(() => import("@/pages/portal/pages/SiteReportsPage"));
const MaintenancePage = lazy(() => import("@/pages/portal/pages/MaintenancePage"));
const SettingsPage = lazy(() => import("@/pages/portal/pages/SettingsPage"));

// Lazy-loaded Admin
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminEntity = lazy(() => import("@/pages/admin/AdminEntity"));
const AdminSiteSettings = lazy(() => import("@/pages/admin/AdminSiteSettings"));
const AdminQuizSubmissions = lazy(() => import("@/pages/admin/AdminQuizSubmissions"));
const AdminPackages = lazy(() => import("@/pages/admin/AdminPackages"));
const AdminProposals = lazy(() => import("@/pages/admin/AdminProposals"));
const AdminCustomQuotes = lazy(() => import("@/pages/admin/AdminCustomQuotes"));
const AdminQuoteTemplates = lazy(() => import("@/pages/admin/AdminQuoteTemplates"));
const AdminProjects = lazy(() => import("@/pages/admin/AdminProjects"));
const AdminClientUsers = lazy(() => import("@/pages/admin/AdminClientUsers"));

function PageFallback() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#000F1B] selection:bg-[#FF5A00] selection:text-white font-['Poppins',sans-serif]"
      role="status"
      aria-live="polite"
      aria-label="Loading ConstructONS ecosystem"
    >
      <div className="absolute h-80 w-80 rounded-full bg-[#FF5A00]/10 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" aria-hidden="true">
            <motion.path d="M10 85 H90" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
            <motion.path
              d="M20 85 V45 L50 20 L80 45 V85 H20 Z"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
            <motion.path
              d="M50 20 V85 M20 55 H80 M35 85 V55 M65 85 V55"
              stroke="#FF5A00"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
            <motion.path
              d="M50 20 L50 8 L75 8"
              stroke="#FF5A00"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", repeatDelay: 0.4, ease: "easeInOut" }}
            />
            <motion.circle
              cx="75"
              cy="16"
              r="3"
              fill="#FF5A00"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
        <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
          <div className="text-sm font-bold tracking-tight text-white">
            Construct<span className="text-[#FF5A00]">ONS™</span>
          </div>
          <span className="text-[11px] font-medium text-white/50 tracking-wider">
            Everything Construction. Always On.
          </span>
          <div className="mt-3 h-1 w-32 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-[#FF5A00]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App font-['Poppins',sans-serif] text-[#111111] bg-white antialiased min-h-screen flex flex-col selection:bg-[#FF5A00]/20 selection:text-[#000F1B]">
      <BrowserRouter>
        <LeadModalProvider>
          <BrochureModalProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<HomePage />} />
                <Route path="/homes/:slug" element={<HomeDetailPage />} />
                <Route path="/packages" element={<PackagesPage />} />
                <Route path="/packages/compare" element={<PackagesComparePage />} />
                <Route path="/packages/:slug" element={<PackageDetailPage />} />
                <Route path="/find-my-package" element={<FindMyPackagePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/quote/:token" element={<PublicQuotePage />} />

                {/* Customer Portal */}
                <Route path="/portal/login" element={<PortalLogin />} />
                <Route path="/portal" element={<PortalLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="my-project" element={<MyProjectPage />} />
                  <Route path="cctv" element={<LiveCCTVPage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="drawings" element={<DrawingsPage />} />
                  <Route path="materials" element={<MaterialsPage />} />
                  <Route path="quality" element={<QualityPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="team" element={<TeamPage />} />
                  <Route path="approvals" element={<ApprovalsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="site-reports" element={<SiteReportsPage />} />
                  <Route path="maintenance" element={<MaintenancePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Admin */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="quiz-submissions" element={<AdminQuizSubmissions />} />
                  <Route path="site-settings" element={<AdminSiteSettings />} />
                  <Route path="packages" element={<AdminPackages />} />
                  <Route path="proposals" element={<AdminProposals />} />
                  <Route path="custom-quotes" element={<AdminCustomQuotes />} />
                  <Route path="quote-templates" element={<AdminQuoteTemplates />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path=":entity" element={<AdminEntity />} />
                  <Route path="client-users" element={<AdminClientUsers />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
<PublicAIChat/>
            <CookieBanner />
            <Toaster position="top-right" richColors closeButton />
          </BrochureModalProvider>
        </LeadModalProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;