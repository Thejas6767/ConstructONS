import React from "react";
import { Link } from "react-router-dom";
import {
  FileText, ChevronRight, Video, Activity, Hourglass,
  IndianRupee, Calendar, AlertTriangle, Layers, PencilRuler, ShieldCheck, Box, Camera, CheckCircle2
} from "lucide-react";

export default function DashboardMetricsRow({ project }) {
  const activities = project?.activities || [];
  const cameras = project?.cctv_cameras || [];
  const stages = project?.stages || [];
  const quality = project?.quality_inspections || [];
  const drawings = project?.drawings || [];
  const materials = project?.materials || [];

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  // --- Recent Updates (Last 7 Days) ---
  const recentUpdates = activities
    .filter(a => new Date(a.timestamp) >= sevenDaysAgo && !a.user_name.toLowerCase().includes("client"))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

  // --- Glance Metrics ---
  const lastStageDate = stages.length > 0 ? stages[stages.length - 1]?.expected_date : null;
  const expectedCompletionDate = project.expected_completion || lastStageDate || null;

  const daysRemaining = expectedCompletionDate 
    ? Math.max(0, Math.ceil((new Date(expectedCompletionDate) - today) / 86400000)) 
    : null;

  const openIssues = quality.filter(q => q.status === "rectification").length;
  const clientActionsPending = drawings.filter(d => d.status === "pending").length + materials.filter(m => m.status === "pending").length;
  const completedStages = stages.filter(s => s.status === "completed").length;

  const cv = project?.contract_value || 0;
  const sp = project?.amount_spent || 0;
  const formatMoney = (val) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
    return val.toLocaleString("en-IN");
  };
  const pctSpent = cv > 0 ? Math.round((sp / cv) * 100) : 0;

  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const formatTime = (date) => date ? new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-['Poppins']">
      
      {/* Recent Updates */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 grid place-items-center"><FileText className="w-3.5 h-3.5 text-blue-500" /></div>
            <h2 className="text-base font-bold text-[#000F1B]">Recent Updates</h2>
          </div>
          <Link to="/portal/site-reports" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>
        <p className="text-[11px] font-semibold text-[#111111]/50 mb-4 ml-8">Latest approved updates from your project.</p>

        <div className="space-y-4">
          {recentUpdates.length === 0 ? (
            <div className="text-xs text-[#111111]/40 italic text-center py-6">No recent updates logged in the last 7 days.</div>
          ) : (
            recentUpdates.map((act, i) => (
              <div key={i} className="flex items-center gap-4 hover:bg-[#F9FAFB] p-1.5 -mx-1.5 rounded-lg transition group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-black/10 grid place-items-center shrink-0">
                  {act.module === "Drawings" ? <PencilRuler className="w-4 h-4 text-blue-500" /> :
                   act.module === "Quality" ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> :
                   act.module === "Materials" ? <Box className="w-4 h-4 text-amber-500" /> :
                   <Camera className="w-4 h-4 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] text-[#111111]/50 font-semibold">{formatDate(act.timestamp)}, {formatTime(act.timestamp)}</span>
                  </div>
                  <div className="text-xs font-bold text-[#000F1B] leading-tight line-clamp-2">{act.action}</div>
                  <div className="text-[9px] font-semibold text-[#111111]/40 mt-0.5">{act.module || "General"}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#111111]/20 group-hover:text-[#FF5A00]" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Site Live CCTV */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 grid place-items-center"><Video className="w-3.5 h-3.5 text-blue-500" /></div>
            <h2 className="text-base font-bold text-[#000F1B]">Site Live</h2>
          </div>
          <Link to="/portal/cctv" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">View CCTV <ChevronRight className="w-3.5 h-3.5" /></Link>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden bg-[#000F1B] aspect-video relative group cursor-pointer border border-black/10 shadow-inner">
          {cameras.length > 0 && cameras[0].status === "online" ? (
            cameras[0].camera_type === "youtube" ? (
              <iframe src={cameras[0].url} className="absolute inset-0 w-full h-full pointer-events-none opacity-90 group-hover:scale-105 transition duration-700" title="cctv" />
            ) : (
              <div className="absolute inset-0 grid place-items-center"><Video className="w-8 h-8 text-white/20" /></div>
            )
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
              <Video className="w-8 h-8 mb-2" />
              <span className="text-xs font-semibold">Camera Sync Pending</span>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </div>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#000F1B]/90 via-[#000F1B]/40 to-transparent p-3 pt-8">
            <div className="text-xs font-bold text-white drop-shadow-md">{cameras[0]?.name || "Main Site Camera"}</div>
          </div>
        </div>
        <div className="mt-3 text-[10px] font-bold text-emerald-600 flex items-center gap-1.5 px-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {cameras.filter(c => c.status === "online").length} Cameras Online
        </div>
      </div>

      {/* Project at Glance */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 grid place-items-center"><Activity className="w-3.5 h-3.5 text-blue-500" /></div>
            <h2 className="text-base font-bold text-[#000F1B]">Project at Glance</h2>
          </div>
          <ChevronRight className="w-4 h-4 text-[#111111]/30" />
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1 h-full">

          <div className="border border-black/5 rounded-xl p-3 bg-[#F9FAFB] flex items-center gap-3">
            <Hourglass className="w-5 h-5 text-[#111111]/40 shrink-0" />
            <div>
              <div className="text-sm font-black text-[#000F1B] leading-none mb-1">{daysRemaining !== null ? daysRemaining : "TBD"}</div>
              <div className="text-[9px] font-semibold text-[#111111]/50 uppercase tracking-wider leading-tight">Days Remaining</div>
            </div>
          </div>

          <div className="border border-black/5 rounded-xl p-3 bg-[#F9FAFB] flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-black/5 grid place-items-center shrink-0"><IndianRupee className="w-3 h-3 text-[#000F1B]" /></div>
            <div className="w-full">
              <div className="text-xs font-black text-[#000F1B] leading-none mb-0.5">₹ {formatMoney(sp)}</div>
              <div className="text-[8px] font-semibold text-[#111111]/60 mb-1.5">of ₹ {formatMoney(cv)} Spent</div>
              <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#000F1B]" style={{ width: `${pctSpent}%` }} />
              </div>
              <div className="text-[8px] font-bold text-[#000F1B] text-right mt-0.5">{pctSpent}%</div>
            </div>
          </div>

          <div className="border border-black/5 rounded-xl p-3 bg-[#F9FAFB] flex items-center gap-3">
            <Calendar className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <div className="text-sm font-black text-[#000F1B] leading-none mb-1">{clientActionsPending}</div>
              <div className="text-[9px] font-semibold text-[#111111]/50 uppercase tracking-wider leading-tight">Client Actions Pending</div>
            </div>
          </div>

      

          <div className="border border-black/5 rounded-xl p-3 bg-[#F9FAFB] flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#000F1B] shrink-0" />
            <div>
              <div className="text-sm font-black text-[#000F1B] leading-none mb-1">{completedStages} / {stages.length}</div>
              <div className="text-[9px] font-semibold text-[#111111]/50 uppercase tracking-wider leading-tight">Stages Completed</div>
            </div>
          </div>

         

        </div>
      </div>
    </div>
  );
}