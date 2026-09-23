import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Calendar, 
  CheckSquare,
  FileSearch,
  Filter
} from "lucide-react";
import { usePortal } from "../context/PortalContext";

export default function QualityPage() {
  const { project } = usePortal();
  const [activeFilter, setActiveFilter] = useState("all");

  const inspections = project?.quality_inspections || [];

  // Filter Logic
  const filteredInspections = inspections.filter(insp => {
    if (activeFilter === "all") return true;
    return insp.status === activeFilter;
  });

  // KPI Calculations
  const total = inspections.length;
  const passed = inspections.filter(i => i.status === "passed").length;
  const rectification = inspections.filter(i => i.status === "rectification").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 100;

  const formatDate = (isoString) => {
    if (!isoString) return "Pending";
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const statusConfig = {
    passed: { 
      label: "Passed", 
      color: "text-emerald-700 bg-emerald-50 border-emerald-200", 
      icon: CheckCircle2,
      iconColor: "text-emerald-500"
    },
    rectification: { 
      label: "Rectification Req.", 
      color: "text-red-700 bg-red-50 border-red-200", 
      icon: AlertTriangle,
      iconColor: "text-red-500"
    },
    in_progress: { 
      label: "In Progress", 
      color: "text-[#FF5A00] bg-[#FF5A00]/10 border-[#FF5A00]/20", 
      icon: Clock,
      iconColor: "text-[#FF5A00]"
    },
    pending: { 
      label: "Scheduled", 
      color: "text-[#111111]/70 bg-[#F2F2F2] border-black/10", 
      icon: Calendar,
      iconColor: "text-[#111111]/40"
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10 font-['Poppins']">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#FF5A00] tracking-wider uppercase mb-1">
            Quality Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
            Our Quality Promise
          </h1>
          <p className="text-sm text-[#111111]/60 mt-2 max-w-xl">
            Track live structural audits, material tests, and 100+ digital checklist clearances verified by our certified engineers.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-[#111111]/50 uppercase tracking-wider mb-2">Quality Score</div>
          <div className="text-3xl font-extrabold text-[#000F1B]">{passRate}%</div>
        </div>
        <div className="bg-white border border-black/5 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-[#111111]/50 uppercase tracking-wider mb-2">Total Audits</div>
          <div className="text-3xl font-extrabold text-[#000F1B]">{total}</div>
        </div>
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Passed</div>
          <div className="text-3xl font-extrabold text-emerald-700">{passed}</div>
        </div>
        <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Action Items</div>
          <div className="text-3xl font-extrabold text-red-700">{rectification}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter className="w-4 h-4 text-[#111111]/50 mr-2 shrink-0" />
            {["all", "passed", "rectification", "in_progress", "pending"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === f 
                    ? "bg-[#000F1B] text-white" 
                    : "bg-white border border-black/10 text-[#111111]/70 hover:bg-[#F2F2F2]"
                }`}
              >
                {f === "all" ? "All Inspections" : statusConfig[f].label}
              </button>
            ))}
          </div>

          {/* Audit List */}
          {filteredInspections.length === 0 ? (
            <div className="bg-white border border-dashed border-black/15 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-[#F2F2F2] rounded-full grid place-items-center mb-4">
                <FileSearch className="w-8 h-8 text-[#111111]/40" />
              </div>
              <h3 className="text-lg font-bold text-[#000F1B]">No audits logged yet</h3>
              <p className="text-sm text-[#111111]/60 mt-2 max-w-md">
                Quality checks and site audits will appear here as your Site Engineer conducts milestone inspections.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInspections.map((insp) => {
                const config = statusConfig[insp.status || "pending"];
                const StatusIcon = config.icon;

                return (
                  <div key={insp.id} className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row group transition-all hover:shadow-md">
                    
                    {/* Image Box (Single Editable Upload handled by Admin) */}
                    {insp.photo_url ? (
                      <div className="w-full sm:w-48 h-48 sm:h-auto bg-[#F2F2F2] shrink-0 relative overflow-hidden">
                        <img 
                          src={insp.photo_url} 
                          alt={insp.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full sm:w-48 h-32 sm:h-auto bg-[#F2F2F2] shrink-0 flex flex-col items-center justify-center text-[#111111]/30">
                        <ShieldCheck className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-[#F2F2F2] text-[#111111]/70 text-[10px] font-bold uppercase tracking-wider rounded border border-black/5 mb-2">
                            {insp.category}
                          </span>
                          <h3 className="text-base font-bold text-[#000F1B] leading-tight">
                            {insp.name}
                          </h3>
                        </div>
                        <div className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${config.color}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${config.iconColor}`} />
                          {config.label}
                        </div>
                      </div>

                      {insp.remarks && (
                        <p className="text-sm text-[#111111]/70 bg-[#FAFAFA] p-3 rounded-lg border border-black/5 mt-2 mb-4 leading-relaxed">
                          "{insp.remarks}"
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-black/5 flex flex-wrap items-center gap-4 text-xs font-medium text-[#111111]/60">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-[#FF5A00]" />
                          Verified by {insp.inspector_name}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#111111]/40" />
                          {formatDate(insp.inspected_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: ConstructONS Quality Promise */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#000F1B] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck className="w-24 h-24 text-white" />
            </div>
            
            <h3 className="text-lg font-bold mb-6 relative z-10">The Construct<span className="text-[#FF5A00]">ONS</span> Standard</h3>
            
            <ul className="space-y-5 relative z-10">
              {[
                { title: "Material Verification", desc: "100% Branded materials tested for grade & quality." },
                { title: "Engineer Inspections", desc: "Daily site audits by certified structural engineers." },
                { title: "100+ Checklists", desc: "Digital clearance items tracked at every milestone." },
                { title: "Structural Integrity", desc: "Strict IS-code compliance for seismic & load safety." },
                { title: "Snag-Free Handover", desc: "360° final audit clearance before key handover." }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 bg-white/10 p-1 rounded">
                    <CheckSquare className="w-4 h-4 text-[#FF5A00]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{item.title}</div>
                    <div className="text-xs text-white/60 mt-0.5 leading-relaxed">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}