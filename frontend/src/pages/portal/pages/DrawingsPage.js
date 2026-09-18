import React, { useState } from "react";
import { 
  PencilRuler, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Search, 
  Maximize2,
  X,
  Send,
  Loader2
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";
import ComingSoon from "../components/ComingSoon";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

export default function DrawingsPage() {
  const { project, reload } = usePortal();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!project) return <ComingSoon title="Drawings & Plans" icon={PencilRuler} />;

  const drawings = project.drawings || [];

  // Categorize drawings dynamically
  const categories = ["All", ...new Set(drawings.map(d => d.category || "General"))];

  const filteredDrawings = drawings.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleDecision = async (drawingId, decision) => {
    if (decision === "changes_required" && !decisionComment.trim()) {
      toast.error("Please add a comment explaining what needs to be changed.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/portal/my-project/drawings/${drawingId}/decision`,
        { decision, comment: decisionComment.trim() },
        { withCredentials: true }
      );
      toast.success(`Drawing marked as ${decision.replace("_", " ")}`);
      setSelectedDrawing(null);
      setDecisionComment("");
      reload(true); // Silent reload to fetch updated drawings
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to submit decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 font-['Poppins'] pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
            <PencilRuler className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Project Drawings</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">Review, approve, and track revisions for all architectural and structural plans.</p>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Ribbon */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3 sticky top-16 z-20 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111111]/40" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search drawing titles..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-[#F5F6F8] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:bg-white transition"
          />
        </div>
        
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1">
          <div className="inline-flex bg-[#F2F2F2] rounded-xl p-1 w-max border border-black/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200 select-none ${
                  activeCategory === cat 
                    ? "text-[#000F1B] bg-white shadow-sm ring-1 ring-black/5" 
                    : "text-[#111111]/60 hover:text-[#000F1B] hover:bg-black/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Drawing Gallery */}
      <div className="pt-2">
        {filteredDrawings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-black/5 shadow-sm">
            <PencilRuler className="w-12 h-12 text-[#111111]/20 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#000F1B]">No Drawings Found</h3>
            <p className="text-xs text-[#111111]/50 mt-1">Admin has not uploaded any plans to this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDrawings.map(d => <DrawingCard key={d.id} drawing={d} onSelect={() => setSelectedDrawing(d)} />)}
          </div>
        )}
      </div>

      {/* 4. Decision Modal */}
      {selectedDrawing && (
        <DecisionModal 
          drawing={selectedDrawing} 
          onClose={() => { setSelectedDrawing(null); setDecisionComment(""); }}
          onDecide={handleDecision}
          comment={decisionComment}
          setComment={setDecisionComment}
          submitting={submitting}
        />
      )}
    </div>
  );
}


/* ---------- Sub Components ---------- */

function DrawingCard({ drawing, onSelect }) {
  const isPending = drawing.status === "pending";
  const isApproved = drawing.status === "approved";
  const needsChanges = drawing.status === "changes_required";
  const isRejected = drawing.status === "rejected";

  const latestVersion = drawing.versions[drawing.versions.length - 1];
  const url = resolveMediaUrl(latestVersion.url);
  
  // Decide badge colors
  let BadgeIcon = Clock; let bg = "bg-amber-50"; let text = "text-amber-600"; let border = "border-amber-200";
  if (isApproved) { BadgeIcon = CheckCircle2; bg = "bg-emerald-50"; text = "text-emerald-700"; border = "border-emerald-200"; }
  if (needsChanges) { BadgeIcon = AlertCircle; bg = "bg-blue-50"; text = "text-blue-700"; border = "border-blue-200"; }
  if (isRejected) { BadgeIcon = XCircle; bg = "bg-red-50"; text = "text-red-600"; border = "border-red-200"; }

  const formattedDate = new Date(latestVersion.uploaded_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`bg-white rounded-2xl border ${isPending ? "border-amber-300 ring-1 ring-amber-300 shadow-md" : "border-black/5 shadow-sm"} overflow-hidden flex flex-col group transition hover:-translate-y-1 hover:shadow-lg`}>
      
      {/* Image Preview Area */}
      <div className="relative aspect-[4/3] bg-[#F5F6F8] cursor-pointer overflow-hidden border-b border-black/5" onClick={onSelect}>
        <img src={url} alt={drawing.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-300 group-hover:scale-105" />
        
        {/* Status Badge overlay */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg border ${bg} ${border} flex items-center gap-1.5 shadow-sm`}>
          <BadgeIcon className={`w-3.5 h-3.5 ${text}`} />
          <span className={`text-[9px] font-bold uppercase tracking-wider ${text}`}>
            {drawing.status.replace("_", " ")}
          </span>
        </div>

        {/* Version Badge overlay */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
          V{drawing.current_version}
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg grid place-items-center opacity-0 group-hover:opacity-100 transition translate-y-4 group-hover:translate-y-0 text-[#000F1B]">
            <Maximize2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="text-[9px] font-bold text-[#FF5A00] uppercase tracking-wider mb-1">{drawing.category}</div>
          <h3 className="text-sm font-bold text-[#000F1B] leading-snug line-clamp-2">{drawing.name}</h3>
        </div>
        
        <div className="pt-3 border-t border-black/5 flex items-center justify-between">
          <span className="text-[10px] font-semibold text-[#111111]/50">
            {formattedDate}
          </span>
          <button onClick={onSelect} className={`text-[10px] font-bold uppercase tracking-wider hover:underline ${isPending ? "text-[#FF5A00]" : "text-[#000F1B]"}`}>
            {isPending ? "Action Required →" : "View File"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DecisionModal({ drawing, onClose, onDecide, comment, setComment, submitting }) {
  const isPending = drawing.status === "pending";
  const latestVersion = drawing.versions[drawing.versions.length - 1];
  const url = resolveMediaUrl(latestVersion.url);

  return (
    <div className="fixed inset-0 bg-[#000F1B]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-4 sm:p-5 border-b border-black/5 flex items-center justify-between shrink-0 bg-[#F9FAFB]">
          <div>
            <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Drawing Review (V{drawing.current_version})</div>
            <h2 className="text-lg font-bold text-[#000F1B] mt-0.5">{drawing.name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/5 text-[#000F1B] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-[#F2F2F2]">
          {/* Main Image Viewer */}
          <div className="flex-1 p-4 grid place-items-center">
            <a href={url} target="_blank" rel="noreferrer" className="block max-w-full max-h-full rounded-xl overflow-hidden shadow-sm border border-black/10 relative group">
              <img src={url} alt={drawing.name} className="max-h-[60vh] md:max-h-[70vh] object-contain bg-white" />
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 shadow-lg">
                <Maximize2 className="w-3.5 h-3.5" /> Click to open full size
              </div>
            </a>
          </div>

          {/* Sidebar Panel */}
          <div className="w-full md:w-80 bg-white border-l border-black/5 shrink-0 flex flex-col">
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              
              <div>
                <h3 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider mb-2">Current Status</h3>
                <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                  isPending ? "bg-amber-50 text-amber-600 border-amber-200" :
                  drawing.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  drawing.status === "changes_required" ? "bg-blue-50 text-blue-700 border-blue-200" :
                  "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {drawing.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between border-b border-black/5 py-2">
                  <span className="text-[#111111]/50 font-semibold">Category</span>
                  <span className="font-bold text-[#000F1B]">{drawing.category}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 py-2">
                  <span className="text-[#111111]/50 font-semibold">Version</span>
                  <span className="font-bold text-[#000F1B]">V{drawing.current_version}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 py-2">
                  <span className="text-[#111111]/50 font-semibold">Uploaded</span>
                  <span className="font-bold text-[#000F1B]">{new Date(latestVersion.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Version History / Client Comments Log */}
              {drawing.current_version > 1 && (
                <div>
                  <h3 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider mb-3">Revision History</h3>
                  <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-black/10 ml-1">
                    {[...drawing.versions].reverse().slice(1).map((v) => (
                      <div key={v.version} className="relative pl-6">
                        <div className="absolute left-1.5 top-1 w-1.5 h-1.5 rounded-full bg-[#111111]/30 ring-4 ring-white" />
                        <div className="text-[10px] font-bold text-[#111111]/40 mb-0.5">Version {v.version}</div>
                        {v.client_comment && (
                          <div className="p-2.5 rounded-lg bg-[#F5F6F8] border border-black/5 text-[10px] text-[#111111]/70 leading-relaxed italic">
                            "{v.client_comment}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Bar (Only shows if pending approval) */}
            {isPending ? (
              <div className="p-5 border-t border-black/5 bg-[#F9FAFB]">
                <h3 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider mb-3 text-center">Your Decision</h3>
                
                <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment (required if requesting changes)..."
                  className="w-full h-20 px-3 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#FF5A00] resize-none mb-4"
                />

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button 
                    onClick={() => onDecide(drawing.id, "changes_required")}
                    disabled={submitting}
                    className="w-full px-3 py-2.5 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition"
                  >
                    Change Req.
                  </button>
                  <button 
                    onClick={() => onDecide(drawing.id, "rejected")}
                    disabled={submitting}
                    className="w-full px-3 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition"
                  >
                    Reject Plan
                  </button>
                </div>
                <button 
                  onClick={() => onDecide(drawing.id, "approved")}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approve Drawing
                </button>
              </div>
            ) : (
              <div className="p-5 border-t border-black/5 bg-[#F9FAFB] text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-[#111111]/50">This drawing has been reviewed and closed for edits.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}