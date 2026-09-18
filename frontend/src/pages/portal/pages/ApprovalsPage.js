import React, { useState } from "react";
import { 
  CheckSquare, 
  PencilRuler, 
  ArrowRight,
  Clock,
  Building2,
  ShieldCheck,
  IndianRupee,
  Package,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { Link } from "react-router-dom";
import ComingSoon from "../components/ComingSoon";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";

export default function ApprovalsPage() {
  const { project, reload } = usePortal();
  
  // Modal States
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  if (!project) return <ComingSoon title="Approvals" icon={CheckSquare} />;

  // 1. Gather all pending items from across the project
  const pendingApprovals = [];

  // A. Pending Drawings
  const drawings = project.drawings || [];
  drawings.forEach((d) => {
    if (d.status === "pending") {
      pendingApprovals.push({
        id: d.id,
        title: d.name,
        category: "Drawing",
        details: d.category,
        icon: PencilRuler,
        color: "text-blue-600",
        bg: "bg-blue-50",
        timestamp: d.uploaded_at,
        link: "/portal/drawings",
        isMaterial: false
      });
    }
  });

  // B. Pending Materials
  const materials = project.materials || [];
  materials.forEach((m) => {
    if (m.status === "pending") {
      pendingApprovals.push({
        id: m.id,
        title: m.item_name,
        category: "Material",
        details: `${m.quantity} ${m.unit} • ${m.brand || "Standard"}`,
        icon: Package,
        color: "text-amber-600",
        bg: "bg-amber-50",
        timestamp: m.created_at,
        isMaterial: true,
        rawData: m
      });
    }
  });

  // Sort newest first
  pendingApprovals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Handle Material Decision
  const handleMaterialDecision = async (decision) => {
    if (decision === "rejected" && !comment.trim()) {
      toast.error("Please add a reason for rejection.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE}/portal/my-project/materials/${selectedMaterial.id}/decision`,
        { decision, comment: comment.trim() },
        { withCredentials: true }
      );
      toast.success(`Material procurement ${decision}!`);
      setSelectedMaterial(null);
      setComment("");
      reload(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to submit decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 font-['Poppins'] pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0 relative">
            <CheckSquare className="w-6 h-6 text-white" />
            {pendingApprovals.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FF2D00] border-2 border-[#F5F6F8] animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Action Center</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">Pending decisions requiring your review and approval.</p>
          </div>
        </div>
        <div className="text-right text-xs font-bold text-[#FF5A00] bg-white border border-[#FF5A00]/20 px-4 py-2.5 rounded-xl shadow-sm">
          {pendingApprovals.length} Pending Actions
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-black/5 bg-[#F9FAFB]">
          <h2 className="text-sm font-bold text-[#000F1B] uppercase tracking-wider">Requires Your Attention</h2>
        </div>
        
        <div className="p-2 sm:p-4">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <CheckSquare className="w-12 h-12 text-[#111111]/20 mb-4" />
              <h3 className="text-base font-bold text-[#000F1B]">You're all caught up!</h3>
              <p className="text-sm text-[#111111]/50 mt-1 max-w-sm">There are no pending approvals or decisions required from your side at this moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((item, i) => (
                <div key={item.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50/50 transition group gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 border border-white shadow-sm ${item.bg} ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF5A00] mb-1">
                        Review {item.category}
                      </div>
                      <h3 className="text-base font-bold text-[#000F1B] truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#111111]/60 mt-1 font-medium">
                        <span className="font-semibold text-[#000F1B]">{item.details}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {item.isMaterial ? (
                    <button 
                      onClick={() => setSelectedMaterial(item.rawData)}
                      className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#000F1B] text-white rounded-xl text-xs font-bold hover:bg-[#FF5A00] transition shadow-sm"
                    >
                      View & Decide <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link 
                      to={item.link} 
                      className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#000F1B] text-white rounded-xl text-xs font-bold hover:bg-[#FF5A00] transition shadow-sm"
                    >
                      Go to Drawings <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Locked Future Modules */}
      <div className="pt-8 border-t border-black/5">
        <h2 className="text-xs font-bold text-[#000F1B] uppercase tracking-wider mb-4 px-1">Upcoming Approval Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <LockedModule title="Milestone Payments" icon={IndianRupee} />
          <LockedModule title="Design Changes" icon={PencilRuler} />
          <LockedModule title="Quality Sign-offs" icon={ShieldCheck} />
          <LockedModule title="Contract Add-ons" icon={Building2} />
        </div>
      </div>

      {/* Material Decision Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-[#000F1B]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#F9FAFB]">
              <div>
                <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Material Procurement Review</div>
                <h2 className="text-lg font-bold text-[#000F1B] mt-0.5">{selectedMaterial.item_name}</h2>
              </div>
              <button onClick={() => { setSelectedMaterial(null); setComment(""); }} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/5 text-[#000F1B] transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  {selectedMaterial.photo_url ? (
                    <img src={resolveMediaUrl(selectedMaterial.photo_url)} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Package className="w-8 h-8 text-amber-500" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/40 block mb-0.5">Brand / Grade</span>
                    <span className="text-sm font-bold text-[#000F1B]">{selectedMaterial.brand || "Standard"} {selectedMaterial.grade_spec && `· ${selectedMaterial.grade_spec}`}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/40 block mb-0.5">Category</span>
                    <span className="text-sm font-bold text-[#000F1B]">{selectedMaterial.category}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/40 block mb-0.5">Quantity</span>
                    <span className="text-sm font-bold text-[#000F1B]">{selectedMaterial.quantity} {selectedMaterial.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#111111]/40 block mb-0.5">Total Cost</span>
                    <span className="text-sm font-black text-[#10B981]">₹ {Number(selectedMaterial.total_cost || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {selectedMaterial.notes && (
                <div className="p-3 bg-[#F5F6F8] rounded-xl border border-black/5 text-xs text-[#000F1B] leading-relaxed">
                  <strong className="block text-[10px] uppercase tracking-wider text-[#111111]/50 mb-1">Admin Notes</strong>
                  {selectedMaterial.notes}
                </div>
              )}

              <div className="pt-2 border-t border-black/5">
                <textarea 
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment or concern (required if rejecting)..."
                  className="w-full h-20 px-3 py-2 text-xs rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#FF5A00] resize-none"
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-black/5 bg-[#F9FAFB] grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleMaterialDecision("rejected")}
                disabled={submitting}
                className="w-full px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition"
              >
                Reject Order
              </button>
              <button 
                onClick={() => handleMaterialDecision("approved")}
                disabled={submitting}
                className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve Order
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function LockedModule({ title, icon: Icon }) {
  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 flex flex-col items-center justify-center text-center opacity-60">
      <Icon className="w-6 h-6 text-[#111111]/30 mb-2" />
      <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider leading-snug">{title}</span>
    </div>
  );
}