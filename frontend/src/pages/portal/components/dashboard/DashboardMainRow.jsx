import React from "react";
import { CheckCircle2, Circle, PlayCircle, ArrowRight, MapPin, Video, Maximize2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardMainRow({ project }) {
  const stages = project?.stages || [];
  const cameras = project?.cctv_cameras || [];
  const onlineCams = cameras.filter(c => c.status === "online");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-['Poppins']">
      
      {/* 1. Live CCTV Widget */}
      <div className="lg:col-span-5 rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#000F1B]">Live CCTV</h2>
            {onlineCams.length > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Live
              </span>
            )}
          </div>
          <Link to="/portal/cctv" className="text-xs font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1 transition">
            {cameras.length} Configured <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        {cameras.length === 0 ? (
          <div className="flex-1 rounded-xl bg-[#F2F2F2]/50 border border-dashed border-black/10 flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
            <Video className="w-8 h-8 text-[#111111]/20 mb-3" />
            <h3 className="text-sm font-bold text-[#000F1B]">Camera Sync Pending</h3>
            <p className="text-xs text-[#111111]/50 mt-1 max-w-xs leading-relaxed">
              Live site camera integration is currently being rolled out to active projects.
            </p>
          </div>
        ) : (
          <Link to="/portal/cctv" className="flex-1 relative rounded-xl overflow-hidden bg-[#000F1B] aspect-video group cursor-pointer border border-black/10">
            
            {/* Live Preview Effect if YouTube Camera exists */}
            {onlineCams.length > 0 && onlineCams[0].camera_type === "youtube" ? (
              <iframe 
                src={onlineCams[0].url} 
                className="absolute inset-0 w-full h-full pointer-events-none opacity-80 group-hover:scale-105 transition duration-700" 
                allow="autoplay; encrypted-media" 
                title="preview" 
              />
            ) : (
              <div className="absolute inset-0 bg-[#000F1B] flex items-center justify-center">
                <Video className="w-8 h-8 text-white/20" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B] via-transparent to-transparent" />
            
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-white">
              <div>
                <div className="text-xs font-bold leading-tight">
                  {onlineCams.length > 0 ? onlineCams[0].name : cameras[0].name}
                </div>
                <div className="text-[10px] text-white/50 font-semibold uppercase tracking-wider mt-0.5">
                  Click to view all {cameras.length} cameras
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md grid place-items-center group-hover:bg-white group-hover:text-[#000F1B] transition">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* 2. Project Timeline Widget */}
      <div className="lg:col-span-3 rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col h-[320px]">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-base font-bold text-[#000F1B]">Timeline</h2>
          <Link to="/portal/timeline" className="text-[10px] font-bold text-[#111111]/50 uppercase tracking-wider hover:text-[#FF5A00] flex items-center gap-1 transition">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
          {stages.length === 0 ? (
            <div className="text-xs text-[#111111]/40 italic text-center mt-10">
              No stages loaded yet.
            </div>
          ) : (
            stages.slice(0, 10).map((stage, i) => {
              const isCompleted = stage.status === "completed";
              const isInProgress = stage.status === "in_progress";
              return (
                <div key={i} className="relative flex items-start gap-3">
                  {i !== stages.length - 1 && (
                    <div className="absolute left-[9px] top-6 bottom-[-16px] w-0.5 bg-[#F2F2F2]" />
                  )}
                  <div className="relative z-10 shrink-0 mt-0.5 bg-white py-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                    ) : isInProgress ? (
                      <PlayCircle className="w-5 h-5 text-[#FF5A00]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#111111]/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5 pb-1">
                    <div className={`text-xs font-semibold truncate ${isInProgress ? "text-[#000F1B]" : "text-[#111111]/60"}`}>
                      {stage.name}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isCompleted ? "bg-emerald-50 text-emerald-700" : isInProgress ? "bg-[#FF5A00]/10 text-[#FF5A00]" : "bg-[#F2F2F2] text-[#111111]/40"}`}>
                        {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Pending"}
                      </span>
                      <span className="text-[9px] font-semibold text-[#111111]/40">
                        {stage.expected_date || "TBD"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Hero Card Widget */}
      <div className="lg:col-span-4 rounded-2xl bg-[#000F1B] border border-black/5 overflow-hidden relative shadow-sm flex flex-col justify-end p-5 min-h-[320px] group">
        {project?.cover_image ? (
          <img src={project.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-700" />
        ) : (
          <div className="absolute inset-0 bg-[#000F1B] flex items-center justify-center">
            <Building2 className="w-12 h-12 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B] via-[#000F1B]/60 to-transparent" />
        
        <div className="relative z-10">
          <span className="inline-block px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-[9px] font-bold text-white uppercase tracking-wider mb-2 border border-white/10">
            {project?.project_code || "Active Project"}
          </span>
          <h2 className="text-xl font-bold text-white leading-tight">
            {project?.title || "My Project"}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FF5A00]" /> 
            {project?.address || "Location pending"}
          </div>
          <p className="text-[10px] font-medium text-white/50 italic mt-4 uppercase tracking-widest">
            "From vision to reality."
          </p>
        </div>
      </div>

    </div>
  );
}