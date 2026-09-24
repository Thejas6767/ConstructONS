import React from "react";
import { Outlet, Link } from "react-router-dom";
import { 
  Loader2, 
  LogOut, 
  Phone, 
  MessageCircle, 
  RefreshCw, 
  Building2, 
  ArrowRight
} from "lucide-react";
import { Toaster } from "sonner";
import { PortalProvider, usePortal } from "./context/PortalContext";
import PortalSidebar from "./components/PortalSidebar";
import PortalTopBar from "./components/PortalTopBar";
import OnboardingWizard from "../../components/site/OnboardingWizard";
import PortalAIChatWidget from "./components/PortalAIChatWidget";

function NoProjectView() {
  const { user, logout, reload, loading } = usePortal();
  const firstName = user?.name?.split(" ")[0] || "Client";
  const email = user?.email || "";

  const waMsg = `Hi ConstructONS! I logged into my portal with email (${email}) but my construction project is not activated yet. Could you please help link my project?`;
  const waUrl = `https://wa.me/919876543210?text=${encodeURIComponent(waMsg)}`;

  return (
    <div className="min-h-screen bg-[#F5F6F8] font-['Poppins'] text-[#111111] flex flex-col justify-between selection:bg-[#FF5A00]/20 selection:text-[#000F1B]">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b border-black/5 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-[#000F1B]">
            Construct<span className="text-[#FF5A00]">ONS™</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {user?.picture && (
            <img 
              src={user.picture} 
              alt={user.name || "User profile"} 
              referrerPolicy="no-referrer" 
              className="w-8 h-8 rounded-full border border-black/10 object-cover" 
            />
          )}
          <span className="text-xs font-semibold text-[#000F1B] hidden sm:inline">{user?.name}</span>
          <button 
            type="button"
            onClick={logout} 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 text-xs font-semibold text-[#111111]/70 hover:text-[#FF2D00] hover:bg-red-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      {/* Main Activation Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-black/5 shadow-sm p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF5A00]" />
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF5A00]/10 grid place-items-center mb-6">
            <Building2 className="w-8 h-8 text-[#FF5A00]" />
          </div>

          <span className="text-[11px] font-bold text-[#FF5A00] uppercase tracking-wider bg-[#FF5A00]/10 px-3 py-1 rounded-full">
            Project Onboarding
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight mt-4">
            Welcome, {firstName}!
          </h1>
          
          <p className="mt-3 text-sm text-[#111111]/70 max-w-lg mx-auto leading-relaxed">
            No active home construction project is currently linked to your Google account <strong className="text-[#000F1B]">({email})</strong>.
          </p>

          <div className="mt-5 bg-[#F5F6F8] p-4 rounded-2xl border border-black/5 text-xs text-[#111111]/60 max-w-md mx-auto leading-relaxed">
            If you have signed an agreement or booked a package with ConstructONS™, please contact our onboarding team. We will activate your project ID so you can track live site progress, drawings, and CCTV.
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Desk</span>
            </a>

            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white text-xs font-bold transition shadow-sm min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span>Call Support</span>
            </a>

            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl border border-black/10 bg-white hover:bg-[#F5F6F8] text-[#000F1B] text-xs font-bold transition min-h-[44px]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FF5A00]" : ""}`} />
              <span>Re-check Status</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#111111]/50">
            <span>Looking to start a new build?</span>
            <Link to="/packages" className="font-semibold text-[#FF5A00] hover:underline flex items-center gap-1">
              Explore Home Packages <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#111111]/40 border-t border-black/5 bg-white shrink-0">
        ConstructONS™ — India's First Integrated Construction Ecosystem.
      </footer>
    </div>
  );
}

function PortalShell() {
  const { user, project, loading, sidebarOpen, setSidebarOpen, reload } = usePortal();

  if (loading) {
    return (
      <div className="h-screen w-full grid place-items-center bg-[#F2F2F2] font-['Poppins']">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5A00]" />
          <span className="text-sm font-medium text-[#111111]/70">Loading your project portal...</span>
        </div>
      </div>
    );
  }

  // 1. INTERCEPT: First-time user must complete onboarding wizard
  if (user && user.onboarding_completed === false) {
    return <OnboardingWizard user={user} onComplete={reload} />;
  }

  // 2. INTERCEPT: User completed onboarding but has no active project
  const hasProject = Boolean(project && (project.id || project.title || project.project_code));

  if (!hasProject) {
    return <NoProjectView />;
  }

  // 3. FULL PORTAL ACCESS
  return (

    <div className="h-screen bg-[#F5F6F8] font-['Poppins'] text-[#111111] flex overflow-hidden">
      <Toaster richColors position="top-right" />
      
      <PortalSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <PortalTopBar />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
            <PortalAIChatWidget />
        </main>
      </div>
    </div>

  );
}

export default function PortalLayout() {
  return (
    <PortalProvider>
      <PortalShell />
    </PortalProvider>
  );
}