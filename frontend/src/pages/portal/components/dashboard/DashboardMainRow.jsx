import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, AlertCircle, CheckCircle2, Calendar, Building2 } from "lucide-react";

export default function DashboardMainRow({ project }) {
  const drawings = project?.drawings || [];
  const materials = project?.materials || [];
  const stages = project?.stages || [];
  const today = new Date();
  const thirtyDaysAhead = new Date();
  thirtyDaysAhead.setDate(today.getDate() + 30);

  // --- Client Actions ---
  const clientActions = [
    ...drawings.filter(d => d.status === "pending").map((d, i) => ({
      id: `d${i}`,
      title: `Approve ${d.name}`,
      due: d.uploaded_at ? new Date(new Date(d.uploaded_at).setDate(new Date(d.uploaded_at).getDate() + 3)) : today,
      link: "/portal/approvals",
      priority: "High"
    })),
    ...materials.filter(m => m.status === "pending").map((m, i) => ({
      id: `m${i}`,
      title: `Select ${m.item_name}`,
      due: m.created_at ? new Date(new Date(m.created_at).setDate(new Date(m.created_at).getDate() + 5)) : today,
      link: "/portal/materials",
      priority: "Medium"
    }))
  ].sort((a, b) => a.due - b.due);

  // --- What's Next (30d window) ---
  const upcomingEvents = stages
    .filter(s => s.status !== "completed" && s.expected_date && new Date(s.expected_date) >= today && new Date(s.expected_date) <= thirtyDaysAhead)
    .sort((a, b) => new Date(a.expected_date) - new Date(b.expected_date))
    .slice(0, 4);

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 font-['Poppins']">
      
      {/* Your Actions */}
      <div className="lg:col-span-2 bg-rose-50/50 border border-rose-100 rounded-2xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 grid place-items-center"><AlertCircle className="w-3.5 h-3.5 text-red-600" /></div>
            <h2 className="text-base font-bold text-[#000F1B]">Your Actions ({clientActions.length})</h2>
          </div>
          <Link to="/portal/approvals" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <p className="text-[11px] font-semibold text-[#111111]/50 mb-4 ml-8">Items that need your attention.</p>

        <div className="space-y-2.5 flex-1">
          {clientActions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 text-[#111111]/40">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-xs font-semibold">You are all caught up!</p>
            </div>
          ) : (
            clientActions.slice(0, 3).map((act, i) => (
              <Link key={act.id} to={act.link} className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-100 shadow-sm hover:shadow-md transition group">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF5A00] text-white text-[10px] font-bold grid place-items-center shrink-0">{i + 1}</div>
                  <div className="text-xs font-bold text-[#000F1B] group-hover:text-[#FF5A00] transition truncate max-w-[180px]">{act.title}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${act.priority === "High" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{act.priority}</span>
                  <span className="text-[10px] font-semibold text-[#111111]/50">Due {formatDate(act.due)}</span>
                  <ChevronRight className="w-4 h-4 text-[#111111]/30 group-hover:text-[#FF5A00]" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* What's Coming Next */}
      <div className="lg:col-span-3 bg-white border border-black/5 rounded-2xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 grid place-items-center"><Calendar className="w-3.5 h-3.5 text-blue-500" /></div>
            <h2 className="text-base font-bold text-[#000F1B]">What's Coming Next</h2>
          </div>
          <Link to="/portal/timeline" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">View Full Timeline <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <p className="text-[11px] font-semibold text-[#111111]/50 mb-4 ml-8">Key activities in the next 30 days.</p>

        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-xs text-[#111111]/40 italic text-center py-6">No scheduled milestones in the next 30 days.</div>
          ) : (
            upcomingEvents.map((evt, i) => (
              <div key={i} className="flex items-center gap-4 hover:bg-[#F9FAFB] p-2 -mx-2 rounded-lg transition">
                <div className="w-12 text-right text-xs font-bold text-[#111111]/60 shrink-0">{formatDate(evt.expected_date)}</div>
                <div className="w-8 h-8 rounded-lg bg-[#F5F6F8] grid place-items-center shrink-0 border border-black/5">
                  <Building2 className="w-4 h-4 text-[#111111]/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-[#000F1B] truncate">{evt.name}</div>
                  <div className="text-[10px] font-semibold text-[#111111]/40 uppercase tracking-wider">Construction</div>
                </div>
                <div className="shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${i === 0 ? "bg-amber-50 text-amber-600" : "bg-[#F2F2F2] text-[#111111]/50"}`}>
                    {i === 0 ? "Upcoming" : "Scheduled"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}