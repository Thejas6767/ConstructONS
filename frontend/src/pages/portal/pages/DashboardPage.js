import React from "react";
import { Link } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  PlayCircle, 
  Circle, 
  ArrowRight,
  ShieldCheck,
  Video,
  Bot,
  CheckSquare,
  FileText,
  Activity,
  Maximize2
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import DashboardMetricsRow from "../components/dashboard/DashboardMetricsRow";

export default function DashboardPage() {
  const { user, project } = usePortal();

  // Empty State: No project assigned yet
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center font-['Poppins']">
        <div className="w-16 h-16 rounded-2xl bg-[#FF5A00]/10 grid place-items-center mb-5">
          <Building2 className="w-8 h-8 text-[#FF5A00]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
          Welcome, {user?.name?.split(" ")[0] || "Client"}
        </h1>
        <p className="mt-3 text-sm text-[#111111]/65 max-w-md mx-auto leading-relaxed">
          Your project dashboard is awaiting linkage. Once your site consultation is complete, your live tracking data will appear here.
        </p>
      </div>
    );
  }

  // Calculate real progress from backend stages
  const stages = project.stages || [];
  const overallProgress = stages.length
    ? Math.round(stages.reduce((sum, stage) => sum + (Number(stage.progress_pct) || 0), 0) / stages.length)
    : 0;

  // CCTV Data
  const cameras = project.cctv_cameras || [];
  const onlineCams = cameras.filter(c => c.status === "online");

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10 font-['Poppins']">

      {/* Top Welcome Ribbon */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#FF5A00] tracking-wider uppercase">
            ConstructONS Project Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight mt-1">
            Your Dream Home is Taking Shape.
          </h1>
        </div>
        <div className="hidden md:block text-right text-sm font-semibold text-[#111111]/50">
          Live Tracking Enabled
        </div>
      </div>

      {/* Row 1: Hero & Primary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Project Hero Card */}
        <div className="lg:col-span-8 rounded-2xl bg-[#000F1B] border border-black/5 overflow-hidden relative shadow-sm flex flex-col justify-end p-6 min-h-[280px]">
          {project.cover_image && (
            <img src={project.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B] via-[#000F1B]/70 to-transparent" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-1 rounded bg-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider mb-3 border border-white/10">
                Active Construction
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {project.title || "My Project"}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-white/70 font-medium mt-2">
                <MapPin className="w-3.5 h-3.5" />
                {project.address || "Location Pending"}
              </div>
            </div>

            {project.package_slug && (
              <div className="text-right">
                <div className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-1">Package Linked</div>
                <div className="text-sm font-bold text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                  {project.package_slug}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Progress Card */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-black/5 p-6 shadow-sm flex flex-col">
          <div className="text-[11px] font-semibold text-[#111111]/50 uppercase tracking-wider mb-6">
            Overall Completion
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 rounded-full flex items-center justify-center bg-[#F2F2F2] shadow-inner mb-4">
              <svg className="w-32 h-32 -rotate-90 absolute inset-0">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#F2F2F2]" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={`${56 * 2 * Math.PI}`}
                  strokeDashoffset={`${56 * 2 * Math.PI - (overallProgress / 100) * 56 * 2 * Math.PI}`}
                  className="text-[#FF5A00] transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center justify-center z-10">
                <span className="text-3xl font-extrabold text-[#000F1B] leading-none">{overallProgress}%</span>
              </div>
            </div>

            <Link to="/portal/progress" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF5A00] hover:underline">
              View Stage Breakdown <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Live Timeline & Live CCTV */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Timeline Snapshot */}
        <div className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-base font-bold text-[#000F1B]">Project Timeline</h2>
            <Link to="/portal/timeline" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1 uppercase tracking-wider">
              View Full Journey <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {stages.length === 0 ? (
              <div className="text-sm text-[#111111]/40 text-center mt-10">Stages initializing...</div>
            ) : (
              stages.map((stage, i) => {
                const isCompleted = stage.status === "completed";
                const isInProgress = stage.status === "in_progress";
                return (
                  <div key={i} className="relative flex items-start gap-3.5">
                    {i !== stages.length - 1 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-[#F2F2F2]" />}
                    <div className="relative z-10 shrink-0 mt-0.5">
                      {isCompleted ? <CheckCircle2 className="w-6 h-6 text-[#10B981] bg-white" /> :
                        isInProgress ? <PlayCircle className="w-6 h-6 text-[#FF5A00] bg-white" /> :
                          <Circle className="w-6 h-6 text-[#111111]/20 bg-white" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className={`text-sm font-semibold truncate ${isInProgress ? "text-[#000F1B]" : "text-[#111111]/70"}`}>
                        {stage.name}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest ${isCompleted ? "bg-emerald-50 text-emerald-700" : isInProgress ? "bg-[#FF5A00]/10 text-[#FF5A00]" : "bg-[#F2F2F2] text-[#111111]/40"}`}>
                          {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live CCTV Preview Widget */}
        <div className="rounded-2xl bg-[#000F1B] border border-black/5 p-5 shadow-sm flex flex-col h-[340px] relative overflow-hidden group">
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white">Live CCTV</h2>
              {onlineCams.length > 0 && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            <Link to="/portal/cctv" className="text-[10px] font-semibold text-white/50 hover:text-white flex items-center gap-1 uppercase tracking-wider transition">
              See All ({cameras.length}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cameras.length === 0 ? (
            <div className="flex-1 rounded-xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6">
              <Video className="w-8 h-8 text-white/20 mb-3" />
              <h3 className="text-sm font-bold text-white">Camera Sync Pending</h3>
              <p className="text-xs text-white/40 mt-1 max-w-xs leading-relaxed">
                Live site camera integration is currently being rolled out to active projects.
              </p>
            </div>
          ) : (
            <Link to="/portal/cctv" className="flex-1 relative rounded-xl overflow-hidden bg-black aspect-video cursor-pointer border border-white/10">
              
              {onlineCams.length > 0 ? (
                <>
                  {/* Render the first online camera feed */}
                  {(onlineCams[0].camera_type === "youtube" || onlineCams[0].camera_type === "iframe") ? (
                    <iframe 
                      src={onlineCams[0].url} 
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:scale-105 transition duration-700" 
                      allow="autoplay; encrypted-media" 
                      title="cctv-preview" 
                    />
                  ) : (
                    <video 
                      src={onlineCams[0].url} 
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700 pointer-events-none"
                      autoPlay muted loop playsInline 
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B] via-transparent to-transparent" />
                  
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-white">
                    <div>
                      <div className="text-xs font-bold leading-tight drop-shadow-md">
                        {onlineCams[0].name}
                      </div>
                      <div className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5 drop-shadow-md">
                        Click to view multi-cam grid
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md grid place-items-center group-hover:bg-white group-hover:text-[#000F1B] transition">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 bg-[#000F1B] flex flex-col items-center justify-center">
                  <Activity className="w-8 h-8 text-white/20 mb-2" />
                  <div className="text-xs font-semibold text-white/40 uppercase tracking-wider">All Cameras Offline</div>
                </div>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Row 3: Site Team, Materials, Payments & Live Metrics */}
      <DashboardMetricsRow project={project} />
      
      {/* Row 4: Future Modules (Strictly Locked / Coming Soon) */}
      <div className="pt-6 border-t border-black/5">
        <h2 className="text-sm font-bold text-[#000F1B] mb-4 px-1">Phase 5 Modules (Rolling out soon)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <Link to="/portal/approvals" className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col items-center justify-center text-center hover:bg-amber-100 transition shadow-sm group relative">
            {project?.pending_approvals > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF2D00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {project.pending_approvals}
              </span>
            )}
            <CheckSquare className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Action Center</span>
            <span className="text-[9px] font-bold text-amber-600 mt-1">Pending Approvals</span>
          </Link>
          
          <LockedModule title="Quality Control" icon={ShieldCheck} />
          <LockedModule title="Document Vault" icon={FileText} />
          <LockedModule title="AI Assistant" icon={Bot} />
          
        </div>
      </div>

    </div>
  );
}

function LockedModule({ title, icon: Icon }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 flex flex-col items-center justify-center text-center opacity-70">
      <Icon className="w-5 h-5 text-[#111111]/40 mb-2" />
      <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">{title}</span>
      <span className="text-[9px] font-semibold text-[#FF5A00] mt-1">Coming Soon</span>
    </div>
  );
}