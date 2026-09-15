import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { BellRing } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "") + "/api";

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [projectsList, setProjectsList] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(localStorage.getItem("cons_active_project") || null);
  const [project, setProject] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ref to track notification count without re-triggering effects
  const prevNotifCountRef = useRef(0);

  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const me = await axios.get(`${API_BASE}/customer/me`, { withCredentials: true });
      setUser(me.data);

      try {
        const listRes = await axios.get(`${API_BASE}/portal/my-projects-list`, { withCredentials: true });
        const list = listRes.data?.projects || [];
        setProjectsList(list);

        let targetId = activeProjectId;
        if (list.length > 0 && (!targetId || !list.find(p => p.id === targetId))) {
          targetId = list[0].id;
          setActiveProjectId(targetId);
          localStorage.setItem("cons_active_project", targetId);
        }

        const url = targetId ? `${API_BASE}/portal/my-project?project_id=${targetId}` : `${API_BASE}/portal/my-project`;
        const pr = await axios.get(url, { withCredentials: true });
        const rawProj = pr.data?.project !== undefined ? pr.data.project : pr.data;
        
        if (rawProj && (rawProj.id || rawProj.title || rawProj.project_code)) {
          setProject(rawProj);
          prevNotifCountRef.current = (rawProj.notifications || []).length;
        } else {
          setProject(null);
        }
      } catch {
        setProject(null);
      }
    } catch (e) {
      if (e?.response?.status === 401) {
        navigate("/portal/login", { replace: true });
        return;
      }
      if (!isSilent) toast.error("Failed to load your portal");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [activeProjectId, navigate]);

  // Initial Load
  useEffect(() => {
    load();
  }, [load]);

  // Background Notification Polling
  useEffect(() => {
    if (!user || !activeProjectId) return;
    
    const interval = setInterval(async () => {
      try {
        const url = `${API_BASE}/portal/my-project?project_id=${activeProjectId}`;
        const pr = await axios.get(url, { withCredentials: true });
        const rawProj = pr.data?.project !== undefined ? pr.data.project : pr.data;
        
        if (rawProj) {
          const currentNotifs = rawProj.notifications || [];
          const currentCount = currentNotifs.length;

          // Trigger toast if a new notification arrives
          if (currentCount > prevNotifCountRef.current) {
            const newestNotif = currentNotifs[0];
            
            if (newestNotif) {
              toast.custom((t) => (
                <div className="flex items-start gap-3 p-4 bg-white border border-[#FF5A00]/20 rounded-2xl shadow-2xl shadow-[#FF5A00]/10 w-[340px] font-['Poppins'] relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF5A00]" />
                  <div className="w-10 h-10 rounded-full bg-[#FF5A00]/10 grid place-items-center shrink-0 mt-0.5">
                    <BellRing className="w-5 h-5 text-[#FF5A00] animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#FF5A00] uppercase tracking-wider mb-0.5">New Update</div>
                    <div className="font-bold text-[#000F1B] text-sm leading-tight">{newestNotif.title}</div>
                    <div className="text-[10px] text-[#111111]/60 mt-1 line-clamp-2 leading-relaxed">{newestNotif.message}</div>
                    <button 
                      onClick={() => {
                        toast.dismiss(t);
                        navigate(newestNotif.link || "/portal/site-reports");
                      }}
                      className="mt-3 text-[10px] font-bold text-white bg-[#000F1B] hover:bg-[#FF5A00] px-4 py-2 rounded-lg transition"
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              ), { duration: 6000 });
            }
            
            prevNotifCountRef.current = currentCount;
          }

          setProject(rawProj);
        }
      } catch (e) {
        // Silently fail in background
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, activeProjectId, navigate]);

  const logout = async () => {
    try {
      localStorage.removeItem("cons_active_project");
      await axios.post(`${API_BASE}/customer/logout`, {}, { withCredentials: true });
    } catch {}
    navigate("/portal/login", { replace: true });
  };

  const switchProject = (id) => {
    setActiveProjectId(id);
    localStorage.setItem("cons_active_project", id);
  };

  const value = {
    user,
    project,
    projectsList,
    activeProjectId,
    switchProject,
    loading,
    reload: load,
    logout,
    sidebarOpen,
    setSidebarOpen,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used within PortalProvider");
  return ctx;
}