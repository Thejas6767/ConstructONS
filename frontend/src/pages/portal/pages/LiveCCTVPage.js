import React from "react";
import { Video, ShieldCheck, Activity, Wifi, WifiOff } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";

export default function LiveCCTVPage() {
  const { project } = usePortal();

  // Failsafe: if project context hasn't loaded yet
  if (!project) return <ComingSoon title="Live CCTV" icon={Video} />;

  const cameras = project.cctv_cameras || [];
  const onlineCams = cameras.filter(c => c.status === "online");

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 font-['Poppins'] pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0 shadow-sm border border-white/10">
            <Video className="w-6 h-6 text-[#FF5A00]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Site Security & CCTV</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">24/7 Live multi-camera monitoring from your construction site.</p>
          </div>
        </div>
        
        {/* Connection Status Ribbon */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-black/10 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold text-[#000F1B]">Secure Connection</span>
          </div>
          <div className="bg-[#000F1B] text-white px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5A00]"></span>
            </span>
            <span className="text-xs font-bold">{onlineCams.length} Cams Live</span>
          </div>
        </div>
      </div>

      {cameras.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/5 p-16 text-center shadow-sm">
          <Video className="w-16 h-16 text-[#111111]/20 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-[#000F1B]">No Cameras Configured</h2>
          <p className="text-sm text-[#111111]/50 mt-2 max-w-sm mx-auto leading-relaxed">
            The site cameras for your project have not been linked yet. Once your Project Manager integrates the NVR streams, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cameras.map(cam => (
            <CameraFeed key={cam.id} camera={cam} />
          ))}
        </div>
      )}
    </div>
  );
}


/* ---------- Camera Feed Component ---------- */
function CameraFeed({ camera }) {
  const isOnline = camera.status === "online";
  
  return (
    <div className="bg-[#000F1B] rounded-2xl border border-black/10 shadow-lg overflow-hidden flex flex-col group relative">
      
      {/* Top Left Feed Status Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="px-2.5 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-sm">
          {isOnline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-gray-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">OFFLINE</span>
            </>
          )}
        </div>
      </div>

      {/* Top Right Stream Type Overlay */}
      <div className="absolute top-4 right-4 z-10">
         <div className="px-3 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/70 uppercase tracking-widest shadow-sm">
           {camera.camera_type} STREAM
         </div>
      </div>

      {/* Video Player Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center border-b border-white/5">
        {!isOnline ? (
          <div className="text-center p-6">
            <Activity className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">
              Camera {camera.status === "maintenance" ? "in Maintenance" : "Offline"}
            </div>
            <p className="text-[10px] text-white/30">Please contact site admin if this persists.</p>
          </div>
        ) : (
          <>
            {/* If it's YouTube or iFrame, we safely render an iframe */}
            {(camera.camera_type === "youtube" || camera.camera_type === "iframe") && (
              <iframe
                src={camera.url}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={camera.name}
                loading="lazy"
              />
            )}

            {/* If it's HLS (.m3u8), we render a native video tag. */}
            {camera.camera_type === "hls" && (
              <video 
                src={camera.url} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay 
                muted 
                playsInline 
                controls
              />
            )}
          </>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="p-4 bg-gradient-to-t from-[#000F1B] to-[#000F1B]/90 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">{camera.name}</h3>
          <p className="text-[10px] text-[#FF5A00] uppercase tracking-wider mt-0.5 font-bold">
            {camera.location_label || "No Zone Specified"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-white/40 font-mono bg-white/5 px-2 py-1 rounded">
          <Wifi className="w-3 h-3" /> Encrypted Connection
        </div>
      </div>
    </div>
  );
}