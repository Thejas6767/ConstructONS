import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, LogOut, MapPin, X, ChevronDown, Check, UserPlus, HardHat, FileText,CheckCircle2 } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

export default function PortalTopBar() {
  const navigate = useNavigate();
  const { user, project, projectsList, switchProject, activeProjectId, logout, setSidebarOpen, reload } = usePortal();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [projDropdownOpen, setProjDropdownOpen] = useState(false);
  
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const projDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const projectTitle = project?.title || project?.name || "My Project";
  const projectLocation = project?.address || project?.location || project?.city || "Awaiting Location";
  const notifications = project?.notifications || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(event) {
      if (projDropdownRef.current && !projDropdownRef.current.contains(event.target)) {
        setProjDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log("Searching for:", searchQuery);
  };

  const handleReadNotification = async (notifId, link) => {
    setNotifDropdownOpen(false);
    navigate(link);
    try {
      await axios.patch(`${API_BASE}/portal/my-project/notifications/read`, { notification_id: notifId }, { withCredentials: true });
      reload(true); // silent reload to update badge count
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-black/5 sticky top-0 z-30 shrink-0 font-['Poppins']">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 rounded-xl grid place-items-center hover:bg-[#F2F2F2] text-[#000F1B] min-h-[44px]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Project Dropdown Trigger */}
          <div className="relative hidden sm:block" ref={projDropdownRef}>
            <button 
              onClick={() => projectsList?.length > 1 ? setProjDropdownOpen(!projDropdownOpen) : null}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border min-w-0 transition ${
                projectsList?.length > 1 
                  ? "bg-white border-black/10 hover:bg-[#F2F2F2] cursor-pointer" 
                  : "bg-[#F2F2F2]/80 border-black/5 cursor-default"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#000F1B] grid place-items-center shrink-0 overflow-hidden border border-black/10">
                {project?.cover_image ? (
                  <img src={resolveMediaUrl(project.cover_image)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-[#FF5A00]">CO</span>
                )}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-[#000F1B] truncate max-w-[160px] lg:max-w-[220px]">
                  {projectTitle}
                </div>
                <div className="text-[10px] text-[#111111]/50 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{projectLocation}</span>
                </div>
              </div>
              {projectsList?.length > 1 && (
                <ChevronDown className={`w-4 h-4 text-[#111111]/40 transition ml-2 ${projDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Projects Dropdown Menu */}
            {projDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-black/10 shadow-2xl rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider border-b border-black/5 mb-1">
                  Your Projects ({projectsList.length})
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {projectsList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProject(p.id);
                        setProjDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#F2F2F2] transition text-left ${p.id === activeProjectId ? 'bg-[#FF5A00]/5' : ''}`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className={`text-xs font-bold truncate ${p.id === activeProjectId ? 'text-[#FF5A00]' : 'text-[#000F1B]'}`}>
                          {p.title || "Unnamed Project"}
                        </div>
                        <div className="text-[10px] text-[#111111]/50 truncate mt-0.5">
                          {p.user_role} • {p.project_code || "Active"}
                        </div>
                      </div>
                      {p.id === activeProjectId && <Check className="w-4 h-4 text-[#FF5A00] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 w-48 lg:w-64 focus-within:ring-2 focus-within:ring-[#FF5A00] transition">
            <Search className="w-4 h-4 text-[#111111]/40" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project..."
              className="bg-transparent outline-none text-xs text-[#000F1B] w-full placeholder:text-[#111111]/40"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} className="text-[#111111]/40 hover:text-[#000F1B]">
                <X className="w-3 h-3" />
              </button>
            )}
          </form>

          {/* NOTIFICATION BELL */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              type="button" 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative w-10 h-10 rounded-xl grid place-items-center hover:bg-[#F2F2F2] text-[#000F1B] min-h-[44px] transition"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FF2D00] border border-white animate-pulse" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-black/10 shadow-2xl rounded-2xl z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[400px]">
                <div className="px-4 py-3 border-b border-black/5 bg-[#F9FAFB] flex items-center justify-between shrink-0">
                  <div className="text-xs font-bold text-[#000F1B] uppercase tracking-wider">Notifications</div>
                  {unreadCount > 0 && <span className="text-[10px] font-bold text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#111111]/50 italic">You're all caught up. No new notifications.</div>
                  ) : (
                    notifications.map(n => (
                      <button 
                        key={n.id} 
                        onClick={() => handleReadNotification(n.id, n.link)}
                        className={`w-full text-left p-4 border-b border-black/5 last:border-0 hover:bg-[#F2F2F2]/50 transition flex gap-3 ${!n.is_read ? "bg-[#FF5A00]/5" : ""}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${!n.is_read ? "border-[#FF5A00]/20 bg-white" : "border-black/5 bg-[#F9FAFB]"}`}>
                          {n.icon === "progress" && <HardHat className={`w-4 h-4 ${!n.is_read ? "text-[#FF5A00]" : "text-[#111111]/40"}`} />}
                          {n.icon === "attendance" && <CheckCircle2 className={`w-4 h-4 ${!n.is_read ? "text-emerald-500" : "text-[#111111]/40"}`} />}
                          {n.icon === "team" && <UserPlus className={`w-4 h-4 ${!n.is_read ? "text-blue-500" : "text-[#111111]/40"}`} />}
                          {n.icon === "system" && <FileText className={`w-4 h-4 ${!n.is_read ? "text-purple-500" : "text-[#111111]/40"}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-bold truncate ${!n.is_read ? "text-[#000F1B]" : "text-[#111111]/70"}`}>{n.title}</div>
                          <div className={`text-[10px] mt-0.5 leading-relaxed ${!n.is_read ? "text-[#111111]/70" : "text-[#111111]/50"}`}>{n.message}</div>
                          <div className="text-[9px] font-semibold text-[#111111]/40 mt-1.5 uppercase tracking-wider">{new Date(n.timestamp).toLocaleString("en-IN", {month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"})}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                
                <Link to="/portal/site-reports" onClick={() => setNotifDropdownOpen(false)} className="block w-full p-3 text-center text-[10px] font-bold text-[#FF5A00] bg-white border-t border-black/5 hover:bg-[#F9FAFB] transition shrink-0 uppercase tracking-widest">
                  View Full Activity Log
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-black/5">
            {user?.picture ? (
              <img src={user.picture} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-black/10 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#000F1B] text-white text-[10px] font-bold grid place-items-center">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left leading-tight max-w-[120px]">
              <div className="text-xs font-semibold text-[#000F1B] truncate">{user?.name?.split(" ")[0] || "Client"}</div>
              <div className="text-[10px] text-[#111111]/45 truncate">Client Portal</div>
            </div>
            <button onClick={logout} type="button" className="w-9 h-9 rounded-xl grid place-items-center hover:bg-red-50 text-[#111111]/60 hover:text-[#FF2D00] min-h-[36px]" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}