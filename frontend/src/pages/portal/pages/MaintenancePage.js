import React, { useState } from "react";
import { usePortal } from "../context/PortalContext";
import { ShieldCheck, Clock, CheckCircle2, Wrench, AlertCircle, Plus, X, UploadCloud, Loader2,Hammer } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";

// API instance for portal client side
const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function MaintenancePage() {
   const { project, refreshProject } = usePortal();
  const [showForm, setShowForm] = useState(false);

  // --- NEW: Handover Lock Logic ---
  const isHandoverComplete = project?.stages?.some(s => 
    s.name.toLowerCase().includes("handover") && s.status === "completed"
  );

  if (!isHandoverComplete) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center font-['Poppins']">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 grid place-items-center mb-5">
          <Hammer className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
          Maintenance Locked
        </h1>
        <p className="mt-3 text-sm text-[#111111]/60 max-w-md mx-auto leading-relaxed">
          The post-construction maintenance and warranty module will automatically unlock once your project reaches the <b>Handover</b> stage.
        </p>
      </div>
    );
  }

  // Warranty Logic
  const warrantyActive = project?.warranty_active;
  const startDate = project?.warranty_start_date ? new Date(project.warranty_start_date) : null;
  const years = project?.warranty_years || 0;
  
  let daysLeft = 0;
  let isExpired = false;
  let endDate = null;

  if (warrantyActive && startDate) {
    endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + years);
    const today = new Date();
    const diffTime = endDate - today;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) isExpired = true;
  }

  const tickets = project?.maintenance_tickets || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-10 font-['Poppins']">
      
      {/* Header */}
      <div>
        <div className="text-[11px] font-semibold text-[#FF5A00] tracking-wider uppercase mb-1">
          Post-Handover Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
          Maintenance & Warranty
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Warranty Timer & Benefits */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#000F1B] rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldCheck className="w-24 h-24 text-white" />
            </div>
            
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-2 relative z-10">Warranty Status</h3>
            
            {warrantyActive && !isExpired ? (
              <div className="relative z-10 mb-6">
                <div className="text-4xl font-black text-emerald-400 leading-none">{daysLeft}</div>
                <div className="text-xs text-white/80 font-semibold mt-1">Days Remaining ({years} Years)</div>
                <div className="text-[10px] text-white/50 mt-1 border-t border-white/10 pt-2">
                  Valid until: {endDate.toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                </div>
              </div>
            ) : (
              <div className="relative z-10 mb-6 py-4">
                <div className="text-xl font-bold text-white/50">Not Active</div>
                <div className="text-xs text-white/40 mt-1">Warranty triggers upon handover.</div>
              </div>
            )}

            <div className="relative z-10 space-y-3 pt-4 border-t border-white/10">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Warranty Benefits</div>
              {[
                { label: "Free Structural Checks", desc: "No fee for foundation/wall issues." },
                { label: "Plumbing & Electrical", desc: "Coverage for concealed pipe/wire defects." },
                { label: "Priority Resolution", desc: "48-hour SLA for critical tickets." }
              ].map((b, i) => (
                <div key={i} className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF5A00] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">{b.label}</div>
                    <div className="text-[10px] text-white/60 leading-tight">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Manager */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#000F1B]">Support Tickets</h2>
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 bg-[#FF5A00] hover:bg-[#FF2D00] text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Raise Request
            </button>
          </div>

          {showForm && (
            <TicketForm 
              onClose={() => setShowForm(false)} 
              onSuccess={() => { setShowForm(false); refreshProject(); }} 
            />
          )}

          {tickets.length === 0 ? (
            <div className="bg-white border border-dashed border-black/15 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <Wrench className="w-10 h-10 text-[#111111]/30 mb-3" />
              <h3 className="text-sm font-bold text-[#000F1B]">No Tickets Raised</h3>
              <p className="text-xs text-[#111111]/50 mt-1">If you face any issues post-handover, log them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(t => (
                <TicketCard key={t.id} ticket={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TicketForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: "", category: "General", priority: "Medium", description: "" });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

    const handleUpload = async (e) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "maintenance");
      
      // FIX: Explicitly set multipart headers for the client portal API
      const res = await api.post("/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setPhotoUrl(res.data.url);
      toast.success("Photo attached");
    } catch (err) { 
      console.error(err);
      toast.error("Upload failed. Ensure file is under 5MB."); 
    } finally { 
      setUploading(false); 
      e.target.value = ""; 
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/portal/my-project/maintenance", { ...form, photo_urls: photoUrl ? [photoUrl] : [] });
      toast.success("Ticket raised successfully!");
      onSuccess();
    } catch { toast.error("Failed to raise ticket"); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-black/10 p-5 shadow-sm space-y-4 relative">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 text-[#111111]/50 hover:text-red-500"><X className="w-4 h-4"/></button>
      <h3 className="text-sm font-bold text-[#000F1B]">Log a Maintenance Request</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase mb-1">Issue Title *</label>
          <input required type="text" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-xl" placeholder="e.g. Master bathroom tap leaking" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase mb-1">Category</label>
          <select value={form.category} onChange={e=>setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded-xl">
            <option>Plumbing</option><option>Electrical</option><option>Structural</option><option>Carpentry</option><option>General</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase mb-1">Priority</label>
          <select value={form.priority} onChange={e=>setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 border rounded-xl">
            <option>Low</option><option>Medium</option><option>High</option><option>Emergency</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase mb-1">Description *</label>
          <textarea required value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-xl resize-none" rows={3} placeholder="Please describe the issue..." />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold uppercase mb-1">Upload Photo</label>
          {photoUrl ? (
            <div className="w-20 h-20 relative rounded-lg border overflow-hidden">
              <img src={resolveMediaUrl(photoUrl)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={()=>setPhotoUrl("")} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg"><X className="w-3 h-3"/></button>
            </div>
          ) : (
            <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F2F2F2] hover:bg-black/5 px-4 py-2 text-xs font-semibold cursor-pointer border border-dashed border-black/20 w-full sm:w-auto">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload Image
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading}/>
            </label>
          )}
        </div>
      </div>
      <div className="flex justify-end border-t border-black/5 pt-4">
        <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-[#000F1B] text-white text-xs font-bold disabled:opacity-60">
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}

function TicketCard({ ticket }) {
  const isResolved = ticket.status === "resolved";
  const isInProg = ticket.status === "in_progress";
  
  return (
    <div className={`bg-white rounded-2xl border p-5 transition hover:shadow-md ${isResolved ? "border-emerald-200" : isInProg ? "border-amber-200" : "border-black/10"}`}>
      <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded uppercase">{ticket.id}</span>
            <span className="text-[10px] font-semibold text-[#111111]/50">{new Date(ticket.raised_at).toLocaleDateString()}</span>
          </div>
          <h4 className="font-bold text-[#000F1B]">{ticket.title}</h4>
          <span className="text-xs text-[#111111]/50">{ticket.category} • {ticket.priority} Priority</span>
        </div>
        <div className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isResolved ? "bg-emerald-50 text-emerald-600" : isInProg ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
          {isResolved ? <CheckCircle2 className="w-3.5 h-3.5"/> : isInProg ? <Clock className="w-3.5 h-3.5"/> : <AlertCircle className="w-3.5 h-3.5"/>}
          {ticket.status.replace("_", " ")}
        </div>
      </div>
      <p className="text-xs text-[#111111]/70 leading-relaxed mb-3">{ticket.description}</p>
      
      {ticket.photo_urls?.length > 0 && (
        <div className="flex gap-2 mb-4">
          {ticket.photo_urls.map((url, i) => (
            <img key={i} src={resolveMediaUrl(url)} alt="issue" className="w-14 h-14 object-cover rounded-lg border border-black/10" />
          ))}
        </div>
      )}

      {ticket.admin_notes && (
        <div className="bg-[#F9FAFB] border border-black/5 rounded-lg p-3 text-xs">
          <div className="font-bold text-[#000F1B] mb-1 flex items-center gap-1"><Wrench className="w-3 h-3 text-[#FF5A00]"/> ConstructONS Team Response:</div>
          <div className="text-[#111111]/70 italic">{ticket.admin_notes}</div>
        </div>
      )}
    </div>
  );
}