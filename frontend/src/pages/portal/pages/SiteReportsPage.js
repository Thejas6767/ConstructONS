import React, { useEffect, useState, useMemo, useRef } from "react";
import { 
  ClipboardList, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  UserPlus, 
  IndianRupee, 
  HardHat, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import { usePortal } from "../context/PortalContext";

export default function SiteReportsPage() {
  // 1. All Hook declarations at the top level
  const { project } = usePortal();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    let timer;
    if (project) {
      timer = setTimeout(() => setLoading(false), 300);
    }
    return () => clearTimeout(timer);
  }, [project]);

  // Handle outside click for filter dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe data extraction memoized to maintain stable dependency reference
  const rawActivities = useMemo(
    () => project?.activities || [],
    [project?.activities]
  );

  // Memoize filtered activities inside useMemo
  const filteredActivities = useMemo(() => {
    return rawActivities.filter((act) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        act.action?.toLowerCase().includes(q) ||
        act.user_name?.toLowerCase().includes(q);
      const matchFilter = filter === "All" || act.module === filter;
      return matchSearch && matchFilter;
    });
  }, [rawActivities, search, filter]);

  // Memoize date grouping logic
  const groupedActivities = useMemo(() => {
    const validActivities = filteredActivities.filter(
      (act) => act.timestamp && !isNaN(new Date(act.timestamp).getTime())
    );
    const sorted = [...validActivities].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    const groups = {};
    sorted.forEach((act) => {
      const dateObj = new Date(act.timestamp);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateObj,
          displayDate: dateObj.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          items: [],
        };
      }
      groups[dateKey].items.push(act);
    });

    return Object.values(groups).sort((a, b) => b.dateObj - a.dateObj);
  }, [filteredActivities]);

  // 2. Early returns executed ONLY after all hooks are evaluated
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-['Poppins']">
        <ClipboardList className="w-12 h-12 text-[#111111]/20 mb-4" />
        <h2 className="text-xl font-bold text-[#000F1B]">Activity Data Pending</h2>
        <p className="text-sm text-[#111111]/50 mt-1">Awaiting active project linkage.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5A00]" />
      </div>
    );
  }

  const FILTERS = ["All", "Progress", "Team", "Attendance", "Documents", "Quality", "Payments"];

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 font-['Poppins'] pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Project Activity Feed</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">Live chronological audit trail of all project events.</p>
          </div>
        </div>
        <div className="text-right text-xs font-bold text-[#FF5A00] bg-white border border-[#FF5A00]/20 px-4 py-2.5 rounded-xl shadow-sm">
          {rawActivities.length} Total Events
        </div>
      </div>

      {/* Clean Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3 sticky top-16 z-20 flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111111]/40" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities or names..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-[#F5F6F8] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:bg-white transition"
          />
        </div>

        {/* Dropdown Filter */}
        <div className="relative w-full sm:w-auto" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-[#F5F6F8] transition"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#000F1B]">
              <Filter className="w-3.5 h-3.5 text-[#FF5A00]" /> 
              {filter === "All" ? "Filter Feed" : filter}
            </div>
            <ChevronDown className={`w-4 h-4 text-[#111111]/40 transition ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-black/10 rounded-xl shadow-xl z-30 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {FILTERS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setIsFilterOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-[#F2F2F2] transition ${filter === cat ? 'text-[#FF5A00] bg-[#FF5A00]/5' : 'text-[#000F1B]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* The Timeline Feed */}
      <div className="space-y-8 pl-2 sm:pl-4 pt-4">
        {groupedActivities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-black/5 shadow-sm">
            <ClipboardList className="w-10 h-10 text-[#111111]/20 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#000F1B]">No Activities Found</h3>
            <p className="text-xs text-[#111111]/50 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          groupedActivities.map((group) => (
            <div key={group.displayDate} className="relative">
              
              {/* Date Header Badge */}
              <div className="sticky top-[130px] z-10 inline-block bg-[#F5F6F8] py-1.5 pr-4 mb-4">
                <span className="px-3.5 py-1.5 rounded-lg bg-white border border-black/10 text-[10px] font-bold text-[#FF5A00] uppercase tracking-widest shadow-sm">
                  {group.displayDate}
                </span>
              </div>

              {/* Group Container with Vertical Line */}
              <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-black/10">
                {group.items.map((act, idx) => (
                  <ActivityFeedItem key={act.id || idx} act={act} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- Feed Item Component ---------- */
function ActivityFeedItem({ act }) {
  let Icon = MapPin;
  let color = "text-blue-500";
  let bg = "bg-blue-50";
  let borderColor = "border-blue-200";

  const mod = act.module || "System";
  
  if (mod === "Drawings") { Icon = FileText; color = "text-blue-600"; bg = "bg-blue-50"; borderColor = "border-blue-200"; }
  if (mod === "Quality") { Icon = ShieldCheck; color = "text-indigo-600"; bg = "bg-indigo-50"; borderColor = "border-indigo-200"; }
  if (mod === "Team") { Icon = UserPlus; color = "text-emerald-600"; bg = "bg-emerald-50"; borderColor = "border-emerald-200"; }
  if (mod === "Payments") { Icon = IndianRupee; color = "text-emerald-600"; bg = "bg-emerald-50"; borderColor = "border-emerald-200"; }
  if (mod === "Progress") { Icon = HardHat; color = "text-[#FF5A00]"; bg = "bg-[#FF5A00]/10"; borderColor = "border-[#FF5A00]/20"; }
  if (mod === "Attendance") { Icon = CheckCircle2; color = "text-teal-600"; bg = "bg-teal-50"; borderColor = "border-teal-200"; }
  if (mod === "System") { Icon = Building2; color = "text-slate-600"; bg = "bg-slate-100"; borderColor = "border-slate-200"; }

  const timeString = new Date(act.timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="relative group">
      <div className={`absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ring-1 ring-black/5 shadow-sm ${bg} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className={`bg-white rounded-2xl border ${borderColor} p-4 sm:p-5 shadow-sm hover:shadow-md transition group-hover:border-[#FF5A00]/40`}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[#000F1B] leading-snug">
              {act.action}
            </h4>
            <div className="text-[10px] text-[#111111]/50 font-medium mt-1 flex items-center gap-1.5">
              <span className="font-bold text-[#111111]/70">{timeString}</span>
              <span>•</span>
              <span>Action by {act.user_name || "System"}</span>
            </div>
          </div>
          <div className="shrink-0 mt-1 sm:mt-0">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-[#F9FAFB] border border-black/5 ${color}`}>
              {mod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}