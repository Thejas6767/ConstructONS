import React from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Video,
  TrendingUp,
  GitBranch,
  PencilRuler,
  Package,
  ShieldCheck,
  FolderOpen,
  Wallet,
  Users,
  CheckSquare,
  MessageSquare,
  ClipboardList,
  Wrench,
  Settings,
  X,
} from "lucide-react";
import { usePortal } from "../context/PortalContext";

const NAV_SECTIONS = [
  {
    label: "Core",
    items: [
      { to: "/portal", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/portal/my-project", label: "My Project", icon: Home },
      { to: "/portal/cctv", label: "Live CCTV", icon: Video },
      { to: "/portal/progress", label: "Progress", icon: TrendingUp },
      { to: "/portal/timeline", label: "Timeline", icon: GitBranch },
    ],
  },
  {
    label: "Project Control",
    items: [
      { to: "/portal/drawings", label: "Drawings", icon: PencilRuler },
      { to: "/portal/materials", label: "Materials", icon: Package },
      { to: "/portal/quality", label: "Quality", icon: ShieldCheck },
      { to: "/portal/documents", label: "Documents", icon: FolderOpen },
      { to: "/portal/payments", label: "Payments", icon: Wallet },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { to: "/portal/team", label: "Team", icon: Users },
      { to: "/portal/approvals", label: "Approvals", icon: CheckSquare },
      { to: "/portal/messages", label: "Messages", icon: MessageSquare },
      { to: "/portal/site-reports", label: "Activity Log", icon: ClipboardList },
    ],
  },
  {
    label: "After Handover",
    items: [{ to: "/portal/maintenance", label: "Maintenance", icon: Wrench }],
  },
  {
    label: "Account",
    items: [{ to: "/portal/settings", label: "Settings", icon: Settings }],
  },
];

export default function PortalSidebar({ open, onClose }) {
  const { project } = usePortal();

  // Dynamic Approvals Badge Calculation
  const pendingApprovalsCount = project?.pending_approvals || 0;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#000F1B]/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] bg-[#0B1220] text-white
          flex flex-col transition-transform duration-300 ease-out font-['Poppins']
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link to="/portal" className="flex items-center gap-2.5" onClick={onClose}>
            <img src="/logo.webp" alt="ConstructONS Logo" className="h-7 w-auto object-contain" />
            <span className="font-bold text-base tracking-tight text-white">
              Construct
              <span className="inline-flex items-center justify-center relative align-middle mx-[0.5px]" style={{ width: '0.8em', height: '0.8em' }}>
                <span className="absolute inset-0 rounded-full border-[2.5px] border-[#C73E00]" />
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[35%] bg-[#C73E00] rounded-full" />
              </span>
              NS<span className="text-[#C73E00]">™</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-lg grid place-items-center hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 no-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                {section.label}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition min-h-[44px] group ${
                          isActive
                            ? "bg-[#FF5A00] text-white shadow-sm"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 shrink-0 transition ${
                          window.location.pathname === item.to ? "text-white" : "group-hover:text-[#FF5A00]"
                        }`} strokeWidth={2} />
                        <span>{item.label}</span>
                      </div>
                      
                      {/* Approvals Red Badge */}
                      {item.label === "Approvals" && pendingApprovalsCount > 0 && (
                        <span className="bg-[#FF2D00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          {pendingApprovalsCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer strip */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <p className="text-[10px] text-white/40 leading-relaxed font-semibold">
            PLAN · BUILD · MONITOR · COMPLETE
          </p>
          <p className="text-[10px] text-[#FF5A00] mt-1 font-bold">Your Home. Our Commitment.</p>
        </div>
      </aside>
    </>
  );
}