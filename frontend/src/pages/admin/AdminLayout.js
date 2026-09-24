import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi } from "@/lib/api";
import LogoMark from "@/components/site/LogoMark";
import BrandLockup from "@/components/site/BrandLockup";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { requestNotificationPermission } from "@/lib/notifications";
import {
  Home, Package, HelpCircle, Newspaper, ShoppingBag, Landmark, Users, Sparkles,
  Route, ImageIcon, LayoutDashboard, Settings, LogOut, Star, Inbox, GitCompareArrows,
  BarChart3, ClipboardList, Menu, X, Bell, CheckCheck, FileText, Calculator, BookOpen, Building2
} from "lucide-react";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Leads Inbox", to: "/admin/leads", icon: Inbox },
  { label: "Quiz Submissions", to: "/admin/quiz-submissions", icon: ClipboardList },
  { label: "Client Proposals", to: "/admin/proposals", icon: FileText },
  { label: "Custom Quotes", to: "/admin/custom-quotes", icon: Calculator },
  { label: "Quote Templates", to: "/admin/quote-templates", icon: BookOpen },
  { label: "Customer Projects", to: "/admin/projects", icon: Building2 },
  { label: "Homes", to: "/admin/homes", icon: Home },
  { label: "Packages", to: "/admin/packages", icon: Package },
  { label: "AI Modules", to: "/admin/ai-modules", icon: Sparkles },
  { label: "Marketplace", to: "/admin/marketplace-categories", icon: ShoppingBag },
  { label: "Financial Services", to: "/admin/financial-services", icon: Landmark },
  { label: "Testimonials", to: "/admin/testimonials", icon: Star },
  { label: "FAQs", to: "/admin/faqs", icon: HelpCircle },
  { label: "Blogs", to: "/admin/blogs", icon: Newspaper },
  { label: "Team", to: "/admin/team", icon: Users },
  { label: "Journey Steps", to: "/admin/journey-steps", icon: Route },
  { label: "Hero Sections", to: "/admin/hero-sections", icon: ImageIcon },
  { label: "Comparison", to: "/admin/comparison", icon: GitCompareArrows },
  { label: "Stats", to: "/admin/stats", icon: BarChart3 },
  { label: "Media", to: "/admin/media", icon: ImageIcon },
  { label: "Site Settings", to: "/admin/site-settings", icon: Settings },
  { label: "Client Users", to: "/admin/client-users", icon: Users },
];

const CURRENT_LABEL = (path) => {
  const found = NAV.find((n) => (n.end ? path === n.to : path.startsWith(n.to)));
  return found?.label || "Admin";
};

export default function AdminLayout() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { items: notifications, unseenCount, markAllSeen, markSeen, permission } =
    useAdminNotifications({ enabled: !!me });

  useEffect(() => {
    adminApi.me()
      .then(setMe)
      .catch(() => navigate("/admin/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => { setDrawerOpen(false); setNotifOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (_) { }
    navigate("/admin/login");
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-orange border-t-transparent animate-spin" />
      </div>
    );
  if (!me) return null;

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-black/5 shadow-soft">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button onClick={() => setDrawerOpen(true)} className="w-10 h-10 rounded-full grid place-items-center border border-black/10 bg-white">
            <Menu className="w-5 h-5 text-brand-navy" />
          </button>
          <div className="flex items-center gap-2 min-w-0 flex-1 justify-center">
            <LogoMark className="w-6 h-6" />
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-brand-navy/50 leading-none">Admin</div>
              <div className="font-bold text-brand-navy text-sm truncate">{CURRENT_LABEL(location.pathname)}</div>
            </div>
          </div>
          <NotificationBell unseenCount={unseenCount} open={notifOpen} setOpen={setNotifOpen} notifications={notifications} markAllSeen={markAllSeen} markSeen={markSeen} permission={permission} />
        </div>
      </div>

      <aside className={`fixed inset-y-0 left-0 w-64 bg-brand-navy text-white flex flex-col overflow-y-auto z-50 transition-transform duration-300 ease-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="p-5 flex items-center justify-between">
          <BrandLockup tone="dark" size="sm" />
          <button onClick={() => setDrawerOpen(false)} className="lg:hidden w-8 h-8 rounded-full grid place-items-center bg-white/10 hover:bg-white/15">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-2 text-[9px] tracking-widest uppercase text-white/40">Admin CMS</div>
        <nav className="flex-1 px-3 pb-4 space-y-0.5">
          {NAV.map((n) => {
            // FIX: Added badge logic for "Customer Projects" (Client Actions)
            const badgeCount =
              n.to === "/admin/leads"
                ? notifications.filter((i) => i.type === "lead").length
                : n.to === "/admin/quiz-submissions"
                ? notifications.filter((i) => i.type === "quiz").length
                : n.to === "/admin/projects"
                ? notifications.filter((i) => i.type === "project_action").length
                : 0;

            return (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? "bg-brand-orange text-white" : "text-white/75 hover:bg-white/5"}`}>
                <n.icon className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1">{n.label}</span>
                {badgeCount > 0 && (
                  <span className="ml-1 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-orange text-white text-[10px] font-bold grid place-items-center animate-pulse">
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/60">Signed in as</div>
          <div className="px-3 pb-2 text-sm font-medium truncate">{me.email || me.sub}</div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/5"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} className="lg:hidden fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-40" />
        )}
      </AnimatePresence>

      <main className="lg:ml-64 pt-[58px] lg:pt-0">
        <div className="hidden lg:flex items-center justify-end gap-3 px-8 py-3 border-b border-black/5 bg-white sticky top-0 z-30">
          <NotificationBell unseenCount={unseenCount} open={notifOpen} setOpen={setNotifOpen} notifications={notifications} markAllSeen={markAllSeen} markSeen={markSeen} permission={permission} />
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NotificationBell({ unseenCount, open, setOpen, notifications, markAllSeen, markSeen, permission }) {
  const [askedPermission, setAskedPermission] = useState(false);
  const askPermission = async () => {
    setAskedPermission(true);
    await requestNotificationPermission();
    window.location.reload();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-10 h-10 rounded-full grid place-items-center border border-black/10 bg-white hover:bg-brand-bg transition">
        <Bell className="w-5 h-5 text-brand-navy" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-orange text-white text-[10px] font-bold grid place-items-center animate-pulse">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-sm bg-white rounded-2xl shadow-premium border border-black/5 overflow-hidden z-50">
              <div className="p-4 flex items-center justify-between border-b border-black/5">
                <div>
                  <div className="section-eyebrow">Live Notifications</div>
                  <div className="font-semibold text-brand-navy mt-0.5">{unseenCount > 0 ? `${unseenCount} new` : "You're all caught up"}</div>
                </div>
                {unseenCount > 0 && (
                  <button onClick={markAllSeen} className="text-xs text-brand-orange font-semibold inline-flex items-center gap-1 hover:underline">
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all
                  </button>
                )}
              </div>

              {permission !== "granted" && permission !== "unsupported" && (
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
                  <div>Enable push notifications to get pinged even when this tab is in the background.</div>
                  <button onClick={askPermission} className="rounded-full bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 whitespace-nowrap">Enable</button>
                </div>
              )}

              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-sm text-brand-navy/50 text-center">No new activity yet. New leads and quiz submissions will appear here.</div>
                ) : (
                  notifications.map((n) => {
                    
                    // FIX: Determine Icon and Colors based on notification type
                    let iconBg = "bg-emerald-100 text-emerald-600";
                    let IconCmp = ClipboardList;
                    
                    if (n.type === "lead") {
                      iconBg = "bg-brand-orange/15 text-brand-orange";
                      IconCmp = Inbox;
                    } else if (n.type === "project_action") {
                      iconBg = "bg-blue-100 text-blue-600";
                      IconCmp = Building2;
                    }

                    return (
                      <Link
                        key={`${n.type}-${n.id}`}
                        to={n.link}
                        onClick={() => { markSeen(n.id, n.type); setOpen(false); }}
                        className="flex items-start gap-3 p-4 border-b border-black/5 last:border-0 hover:bg-brand-bg/50 transition"
                      >
                        <div className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${iconBg}`}>
                          <IconCmp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-brand-navy text-sm truncate">{n.title}</div>
                          <div className="text-xs text-brand-navy/60 truncate">{n.subtitle}</div>
                          <div className="text-[10px] text-brand-navy/40 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}