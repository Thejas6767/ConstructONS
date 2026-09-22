
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/mediaUrl";
import {
  Plus, Trash2, Save, X, Loader2, RefreshCw, Building2, ClipboardList,
  CheckCircle2, PlayCircle, Circle, Camera, Users, User, Check, CalendarCheck,
  FileText, UploadCloud, Package, IndianRupee, Link as LinkIcon, Video, ImageIcon,FolderOpen
} from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

const PR = {
  list: () => api.get("/admin/projects").then(r => r.data),
  get: (id) => api.get(`/admin/projects/${id}`).then(r => r.data),
  create: (body) => api.post("/admin/projects", body).then(r => r.data),
  remove: (id) => api.delete(`/admin/projects/${id}`).then(r => r.data),
  patchStage: (id, index, body) => api.patch(`/admin/projects/${id}/stages/${index}`, body).then(r => r.data),
  update: (id, body) => api.put(`/admin/projects/${id}`, body).then(r => r.data),

  createDrawing: (id, body) => api.post(`/admin/projects/${id}/drawings`, body).then(r => r.data),
  reviseDrawing: (id, drawingId, body) => api.post(`/admin/projects/${id}/drawings/${drawingId}/revision`, body).then(r => r.data),
  removeDrawing: (id, drawingId) => api.delete(`/admin/projects/${id}/drawings/${drawingId}`).then(r => r.data),

  createMaterial: (id, body) => api.post(`/admin/projects/${id}/materials`, body).then(r => r.data),
  updateMaterial: (id, materialId, body) => api.put(`/admin/projects/${id}/materials/${materialId}`, body).then(r => r.data),
  removeMaterial: (id, materialId) => api.delete(`/admin/projects/${id}/materials/${materialId}`).then(r => r.data),

  logPayment: (id, body) => api.post(`/admin/projects/${id}/payments`, body).then(r => r.data),
  removePayment: (id, paymentId) => api.delete(`/admin/projects/${id}/payments/${paymentId}`).then(r => r.data),

  addCamera: (id, body) => api.post(`/admin/projects/${id}/cameras`, body).then(r => r.data),
  updateCamera: (id, camId, body) => api.put(`/admin/projects/${id}/cameras/${camId}`, body).then(r => r.data),
  removeCamera: (id, camId) => api.delete(`/admin/projects/${id}/cameras/${camId}`).then(r => r.data),
  toggleCameraStatus: (id, camId) => api.patch(`/admin/projects/${id}/cameras/${camId}/status`).then(r => r.data),

  // Documents
  createDocument: (id, body) => api.post(`/admin/projects/${id}/documents`, body).then(r => r.data),
  removeDocument: (id, docId) => api.delete(`/admin/projects/${id}/documents/${docId}`).then(r => r.data),
};

export default function AdminProjects() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [editing, setEditing] = useState(null);
  const [assigningTeam, setAssigningTeam] = useState(null);
  const [markingAttendance, setMarkingAttendance] = useState(null);
  const [managingDrawings, setManagingDrawings] = useState(null);
  const [managingMaterials, setManagingMaterials] = useState(null);
  const [managingFinance, setManagingFinance] = useState(null);
  const [managingCctv, setManagingCctv] = useState(null);
  const [editInfo, setEditInfo] = useState(null);
  const [managingDocs, setManagingDocs] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await PR.list()); }
    catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (row) => {
    if (!window.confirm(`Delete ${row.title}?`)) return;
    try { await PR.remove(row.id); toast.success("Deleted"); load(); }
    catch { toast.error("Delete failed"); }
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>;

  return (
    <div className="max-w-[1400px] mx-auto font-['Poppins'] pb-12" data-testid="admin-projects">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="text-xs font-semibold text-[#FF5A00] uppercase tracking-wider">Operations · Project Tracker</div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#000F1B] mt-1">Customer Projects</h1>
          <p className="text-sm text-[#111111]/60 mt-1">Manage timeline, team, drawings, logistics, finance, and CCTV.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl hover:bg-[#F2F2F2] flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={() => setShowCreate(true)} data-testid="proj-new-btn" className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A00] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#FF2D00] transition shadow-sm">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl bg-white border border-black/5 shadow-sm p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF5A00]/10 grid place-items-center mb-4"><Building2 className="w-8 h-8 text-[#FF5A00]" /></div>
          <div className="text-lg font-bold text-[#000F1B]">No active projects yet</div>
          <p className="text-sm text-[#111111]/60 mt-1 max-w-sm mx-auto">Click "New Project" to convert an accepted proposal into a live project tracker.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map(p => {
            const done = p.stages.filter(s => s.status === "completed").length;
            const pct = Math.round((done / p.stages.length) * 100);
            const teamCount = (p.team_ids || []).length;
            const dwgCount = (p.drawings || []).length;
            const matCount = (p.materials || []).length;
            const cctvCount = (p.cctv_cameras || []).length;

            return (
              <div key={p.id} className="rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition flex flex-col" data-testid={`proj-row-${p.id}`}>
                <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-start justify-between gap-6">

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      {p.project_code && (
                        <span className="text-[10px] font-mono font-bold bg-[#F2F2F2] text-[#000F1B] px-2 py-0.5 rounded border border-black/5">
                          {p.project_code}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded">
                        {p.status || "Active"}
                      </span>
                    </div>
                    <div className="font-bold text-[#000F1B] text-xl truncate">{p.title}</div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#111111]/40 font-bold mb-0.5">Client Contact</div>
                        <div className="text-xs font-semibold text-[#FF5A00] truncate">{p.customer_name} · {p.customer_email}</div>
                      </div>
                      <div className="hidden sm:block w-px h-6 bg-black/10" />
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#111111]/40 font-bold mb-0.5">Site Location</div>
                        <div className="text-xs font-semibold text-[#000F1B] truncate max-w-sm">{p.address || "Location pending"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-black/5 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold mb-1">Contract Value</div>
                      <div className="text-lg font-bold text-[#10B981]">₹ {p.contract_value ? p.contract_value.toLocaleString('en-IN') : "0"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold mb-1">Progress</div>
                      <div className="font-extrabold text-2xl text-[#000F1B] leading-none">{pct}%</div>
                    </div>
                  </div>

                </div>

                <div className="h-1.5 bg-[#F2F2F2] w-full relative">
                  <div className="absolute top-0 left-0 h-full bg-[#FF5A00] transition-all" style={{ width: `${pct}%` }} />
                </div>

                <div className="p-4 bg-[#F9FAFB] border-t border-black/5 rounded-b-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setEditing(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 w-16">
                      <ClipboardList className="w-4 h-4 text-[#FF5A00]" />
                      <span className="text-[10px] font-bold">Stages</span>
                    </button>
                    <button onClick={() => setAssigningTeam(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 min-w-[4rem]">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold">Team ({teamCount})</span>
                    </button>
                    <button onClick={() => setMarkingAttendance(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 w-16">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-bold">Attend</span>
                    </button>
                    <button onClick={() => setManagingDrawings(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 min-w-[4rem]">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-bold">Draw ({dwgCount})</span>
                    </button>
                    <button onClick={() => setManagingDocs(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-[#F9FAFB] hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 min-w-[4rem]">
                      <FolderOpen className="w-4 h-4 text-purple-600" />
                      <span className="text-[10px] font-bold">Docs ({(p.documents || []).length})</span>
                    </button>
                    <button onClick={() => setManagingMaterials(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 min-w-[4rem]">
                      <Package className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold">Mats ({matCount})</span>
                    </button>
                    <button onClick={() => setManagingFinance(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 min-w-[4rem]">
                      <IndianRupee className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[10px] font-bold">Finance</span>
                    </button>
                    {/* NEW CCTV BUTTON */}
                    <button onClick={() => setManagingCctv(p)} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-[#000F1B] p-2 transition shadow-sm h-14 min-w-[4rem]">
                      <Video className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-bold">CCTV ({cctvCount})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditInfo(p)} className="text-[10px] font-bold text-[#111111]/50 hover:text-[#000F1B] transition uppercase tracking-wider">
                      Edit Info
                    </button>
                    <button onClick={() => remove(p)} className="text-[10px] font-bold text-red-500 hover:text-red-700 transition uppercase tracking-wider flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {editInfo && <EditInfoModal project={editInfo} onClose={() => setEditInfo(null)} onSaved={() => { setEditInfo(null); load(); }} />}
      {editing && <StagesEditor project={editing} onClose={() => setEditing(null)} onSaved={() => { load(); }} />}
      {assigningTeam && <AssignTeamModal project={assigningTeam} onClose={() => setAssigningTeam(null)} onSaved={() => { setAssigningTeam(null); load(); }} />}
      {markingAttendance && <AttendanceModal project={markingAttendance} onClose={() => setMarkingAttendance(null)} onSaved={() => { setMarkingAttendance(null); load(); }} />}
      {managingDrawings && <DrawingsManagerModal project={managingDrawings} onClose={() => setManagingDrawings(null)} onSaved={() => { load(); }} />}
      {managingMaterials && <MaterialsManagerModal project={managingMaterials} onClose={() => setManagingMaterials(null)} onSaved={() => { load(); }} />}
      {managingFinance && <FinanceManagerModal project={managingFinance} onClose={() => setManagingFinance(null)} onSaved={() => { load(); }} />}

      {/* CCTV MODAL */}
      {managingCctv && <CctvManagerModal project={managingCctv} onClose={() => setManagingCctv(null)} onSaved={() => { load(); }} />}
    {managingDocs && <DocsManagerModal project={managingDocs} onClose={() => setManagingDocs(null)} onSaved={() => { load(); }} />}
    </div>

  );
}

// ------------------------------------------------------------------
// CCTV MANAGER MODAL (Phase 4)
// ------------------------------------------------------------------
function CctvManagerModal({ project, onClose, onSaved }) {
  const [cameras, setCameras] = useState(project.cctv_cameras || []);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", camera_type: "youtube", url: "", status: "online", location_label: "" });

  const fetchProject = async () => {
    try { const p = await PR.get(project.id); setCameras(p.cctv_cameras || []); onSaved(); } catch { }
  };

  const openNew = () => {
    setEditId(null);
    setForm({ name: "", camera_type: "youtube", url: "", status: "online", location_label: "" });
    setShowForm(true);
  };

  const openEdit = (cam) => {
    setEditId(cam.id);
    setForm({ ...cam });
    setShowForm(true);
  };

  const saveCamera = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, name: form.name.trim(), url: form.url.trim(), location_label: form.location_label.trim() };
      if (editId) await PR.updateCamera(project.id, editId, payload);
      else await PR.addCamera(project.id, payload);
      toast.success("Camera saved"); setShowForm(false); await fetchProject();
    } catch (err) { toast.error(err?.response?.data?.detail || "Failed to save camera"); }
    finally { setLoading(false); }
  };

  const deleteCam = async (camId) => {
    if (!window.confirm("Remove this camera from the project?")) return;
    try {
      await PR.removeCamera(project.id, camId);
      toast.success("Camera removed");
      await fetchProject();
    } catch { toast.error("Failed to remove camera"); }
  };

  const toggleStatus = async (camId) => {
    try {
      await PR.toggleCameraStatus(project.id, camId);
      await fetchProject();
    } catch { toast.error("Failed to toggle status"); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/80 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
          <div><div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Site Security & CCTV</div><div className="text-lg font-bold text-[#000F1B] mt-0.5">{project.title}</div></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!showForm && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#000F1B]">Active Camera Feeds ({cameras.length})</h3>
              <button onClick={openNew} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Add Camera
              </button>
            </div>
          )}
          {showForm ? (
            <div className="bg-white rounded-2xl border border-black/5 p-6 relative shadow-sm">
              <h3 className="text-sm font-bold text-[#000F1B] mb-5">{editId ? "Edit Camera Stream" : "Connect New Camera Feed"}</h3>
              <form onSubmit={saveCamera} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Camera Name *</label><input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Front Gate Camera" className="w-full px-3 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none" /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Location / Zone</label><input type="text" value={form.location_label} onChange={e => setForm({ ...form, location_label: e.target.value })} placeholder="e.g. Material Yard" className="w-full px-3 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-medium focus:ring-2 focus:ring-red-500 outline-none" /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Stream Type *</label><select value={form.camera_type} onChange={e => setForm({ ...form, camera_type: e.target.value })} className="w-full px-3 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"><option value="youtube">YouTube Live Embed</option><option value="iframe">Web Iframe Embed</option><option value="hls">HLS Stream (.m3u8)</option></select></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"><option value="online">Online</option><option value="offline">Offline</option><option value="maintenance">Maintenance</option></select></div>
                  <div className="sm:col-span-2"><label className="block text-[10px] font-bold uppercase mb-1 text-[#000F1B]">Stream / Embed URL *</label><input type="url" required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 border border-black/10 rounded-xl bg-white text-xs font-mono focus:ring-2 focus:ring-red-500 outline-none" /></div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-2">
                  <p className="text-[10px] font-semibold text-blue-800 leading-relaxed">
                    <strong>Tip:</strong> If using YouTube, provide the embed URL (e.g. <code>https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1</code>). If your NVR outputs HLS, ensure the URL ends in <code>.m3u8</code>.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-black/5">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold text-[#000F1B] hover:bg-[#F2F2F2]">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-[#000F1B] hover:bg-red-600 text-white text-xs font-bold shadow-sm transition disabled:opacity-70 flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Camera
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.map(c => (
                <div key={c.id} className={`bg-white rounded-2xl border ${c.status === 'online' ? 'border-red-200 shadow-sm' : 'border-black/5 opacity-70'} p-5 flex flex-col justify-between group transition`}>
                  <div className="flex justify-between items-start mb-4 border-b border-black/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${c.status === 'online' ? 'bg-red-50 border border-red-100 text-red-500' : 'bg-gray-100 border border-gray-200 text-gray-400'} grid place-items-center shrink-0`}>
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#000F1B] text-sm">{c.name}</h4>
                        <p className="text-[10px] text-[#111111]/50">{c.location_label || "No zone specified"} • {c.camera_type.toUpperCase()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border transition ${c.status === 'online' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                      title="Click to toggle status"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      {c.status}
                    </button>
                  </div>

                  <div className="bg-[#F5F6F8] p-3 rounded-lg text-[9px] font-mono text-[#111111]/40 truncate mb-4">
                    {c.url}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-bold hover:bg-[#000F1B] hover:text-white transition">Edit</button>
                    <button onClick={() => deleteCam(c.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------------------------------
// FINANCE MANAGER MODAL (Phase 3)
// ------------------------------------------------------------------
function FinanceManagerModal({ project, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [projData, setProjData] = useState(project);

  const [form, setForm] = useState({
    title: project.title || "",
    address: project.address || "",
    contract_value: project.contract_value || 0
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "", date: new Date().toISOString().split("T")[0], method: "Bank Transfer", reference: "", notes: ""
  });

  const fetchProject = async () => {
    try {
      const p = await PR.get(project.id);
      setProjData(p);
      onSaved();
    } catch { toast.error("Failed to refresh project data"); }
  };

  const saveBaseSettings = async () => {
    setSavingSettings(true);
    try {
      await PR.update(project.id, {
        title: form.title,
        address: form.address,
        contract_value: Number(form.contract_value) || 0
      });
      toast.success("Project settings updated");
      await fetchProject();
    } catch {
      toast.error("Update failed");
    } finally { setSavingSettings(false); }
  };

  const savePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await PR.logPayment(project.id, {
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes
      });
      toast.success("Payment logged & Client notified!");
      setPaymentForm({ amount: "", date: new Date().toISOString().split("T")[0], method: "Bank Transfer", reference: "", notes: "" });
      await fetchProject();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to log payment");
    } finally { setLoading(false); }
  };

  const deletePayment = async (payId) => {
    if (!window.confirm("Reverse this payment? This will deduct the amount from the Total Paid.")) return;
    try {
      await PR.removePayment(project.id, payId);
      toast.success("Payment reversed");
      await fetchProject();
    } catch { toast.error("Failed to reverse payment"); }
  };

  const contractValue = projData.contract_value || 0;
  const amountPaid = projData.amount_spent || 0;
  const balance = contractValue - amountPaid;
  const payments = projData.payments_log || [];

  return (
    <div className="fixed inset-0 bg-[#000F1B]/70 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Financial Ledger & Settings</div>
            <div className="text-lg font-bold text-[#000F1B] mt-0.5">{projData.title}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Settings Block */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#000F1B] mb-4">Master Contract Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Project Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Site Address</label>
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1">Total Contract Value (₹)</label>
                  <input type="number" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-bold text-[#10B981]" />
                </div>
                <button onClick={saveBaseSettings} disabled={savingSettings} className="w-full bg-[#000F1B] text-white rounded-xl py-2 text-xs font-bold">
                  {savingSettings ? "Saving..." : "Update Settings"}
                </button>
              </div>
            </div>

            {/* Live Financial Summary */}
            <div className="bg-[#000F1B] text-white rounded-2xl border border-black/5 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF5A00]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-6">Financial Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-3">
                    <span className="text-sm font-semibold text-white/70">Contract Value</span>
                    <span className="text-xl font-bold text-white">₹ {contractValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-3">
                    <span className="text-sm font-semibold text-white/70">Total Paid by Client</span>
                    <span className="text-xl font-bold text-[#FF5A00]">₹ {amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-sm font-semibold text-emerald-400">Balance Due</span>
                    <span className="text-2xl font-black text-emerald-400">₹ {balance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Logger Form */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#000F1B] mb-4">Log New Client Payment</h3>
            <form onSubmit={savePayment} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1 text-emerald-600">Amount Received (₹) *</label>
                <input type="number" required value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50 rounded-xl font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Date *</label>
                <input type="date" required value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Method *</label>
                <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full px-3 py-2 border rounded-xl">
                  <option>Bank Transfer</option>
                  <option>UPI</option>
                  <option>Cheque</option>
                  <option>Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase mb-1">Txn / Ref No.</label>
                <input type="text" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="w-full px-3 py-2 border rounded-xl" placeholder="e.g. UTR12345" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#10B981] hover:bg-emerald-600 text-white rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />} Log Receipt
              </button>
            </form>
          </div>

          {/* Payment History Log */}
          <div>
            <h3 className="text-sm font-bold text-[#000F1B] mb-3">Payment History Log</h3>
            {payments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/5 p-10 text-center text-sm text-[#111111]/50 italic">No payments logged yet.</div>
            ) : (
              <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider font-bold text-[#111111]/50">
                    <tr>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Method & Ref</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-[#F2F2F2]/50 transition">
                        <td className="px-5 py-3 font-semibold text-[#000F1B]">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-5 py-3 font-bold text-[#10B981]">₹ {p.amount.toLocaleString('en-IN')}</td>
                        <td className="px-5 py-3">
                          <div className="font-semibold text-[#000F1B]">{p.method}</div>
                          <div className="text-[10px] text-[#111111]/50 font-mono">{p.reference || "No ref"}</div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => deletePayment(p.id)} className="text-[10px] font-bold text-red-500 hover:underline">Reverse</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------------------------------
// 1. CREATE PROJECT MODAL (With True Proposal Auto-fill)
// ------------------------------------------------------------------
function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    customer_email: "", customer_name: "", title: "My Home Project", address: "", contract_value: 0
  });
  const [saving, setSaving] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);

  // Fetch accepted proposals to populate the dropdown
  useEffect(() => {
    adminApi.list("proposals")
      .then(res => {
        if (Array.isArray(res)) {
          setProposals(res.filter(p => p.status === "accepted"));
        }
      })
      .catch(() => console.error("Failed to load proposals"))
      .finally(() => setLoadingProps(false));
  }, []);

  // Auto-fill logic using exact DB values
  const handleProposalSelect = (e) => {
    const propId = e.target.value;
    if (!propId) return;

    const p = proposals.find(x => x.id === propId);
    if (!p) return;

    // Calculate actual total from Proposal DB record
    const baseCost = (Number(p.built_up_area) || 0) * (Number(p.package_price_per_sqft) || 0);
    const addonsCost = (p.addons_selected || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const discount = Number(p.discount_amount) || 0;

    // True Grand Total
    const trueTotal = baseCost + addonsCost - discount;

    setForm(prev => ({
      ...prev,
      quote_id: p.id,
      customer_email: p.client_email?.trim() || prev.customer_email,
      customer_name: p.client_name?.trim() || prev.customer_name,
      address: p.site_address?.trim() || prev.address,
      contract_value: trueTotal > 0 ? trueTotal : prev.contract_value,
      title: `${p.client_name?.split(" ")[0] || "Client"}'s ${p.package_name || "Home"} Build`
    }));
    toast.success("Client details and final budget auto-filled from proposal!");
  };

  const create = async () => {
    if (!form.customer_email.trim()) { toast.error("Client Google Email is required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, contract_value: Number(form.contract_value) || 0 };
      await PR.create(payload);
      toast.success("Live Project Created Successfully!");
      onCreated();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Create failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden" data-testid="proj-create-modal">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF5A00]" />

        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-[#000F1B] text-xl">New Project Tracker</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center text-[#000F1B] transition"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-[#111111]/60 mb-5 leading-relaxed">
          Convert an accepted proposal into a live project, or create one from scratch.
        </p>

        <div className="space-y-4">
          {/* Smart Link Dropdown */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <label className="block text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5" /> Auto-Fill from Proposal
            </label>
            {loadingProps ? (
              <div className="text-xs text-blue-600 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Loading accepted proposals...</div>
            ) : (
              <select onChange={handleProposalSelect} className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-[#000F1B] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="">-- Select an Accepted Proposal --</option>
                {proposals.map(p => {
                  const baseCost = (Number(p.built_up_area) || 0) * (Number(p.package_price_per_sqft) || 0);
                  const addonsCost = (p.addons_selected || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
                  const discount = Number(p.discount_amount) || 0;
                  const total = baseCost + addonsCost - discount;
                  return (
                    <option key={p.id} value={p.id}>{p.ref_number} : {p.client_name} (₹{total.toLocaleString('en-IN')})</option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Project Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Kumar Residence" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-bold text-[#000F1B] focus:outline-none focus:ring-2 focus:ring-[#FF5A00]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Client Google Email *</label>
              <input type="email" value={form.customer_email} onChange={e => setForm({ ...form, customer_email: e.target.value })} placeholder="client@gmail.com" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Client Name</label>
              <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="e.g. Rajesh Kumar" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Site Address</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Plot / City" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Total Contract Value (₹)</label>
              <input type="number" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} placeholder="e.g. 18500000" className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-bold text-[#10B981] focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-xs font-semibold text-[#000F1B] hover:bg-[#F2F2F2] transition">Cancel</button>
          <button onClick={create} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white px-6 py-2.5 text-sm font-bold transition shadow-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Edit Basic Info Modal (Now includes Amount Paid)
// ------------------------------------------------------------------
function EditInfoModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: project.title || "",
    address: project.address || "",
    contract_value: project.contract_value || 0,
    amount_spent: project.amount_spent || 0 // New field for Client Payments
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await PR.update(project.id, {
        ...form,
        contract_value: Number(form.contract_value) || 0,
        amount_spent: Number(form.amount_spent) || 0
      });
      toast.success("Project financials updated");
      onSaved();
    } catch {
      toast.error("Update failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-[#000F1B] text-lg">Project Details & Finances</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center text-[#000F1B] transition"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Project Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm font-bold text-[#000F1B] focus:outline-none focus:ring-2 focus:ring-[#FF5A00]" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Site Address</label>
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00]" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-black/5">
            <div>
              <label className="block text-[11px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Total Contract (₹)</label>
              <input type="number" value={form.contract_value} onChange={e => setForm({ ...form, contract_value: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-bold text-[#000F1B] focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Amount Paid (₹)</label>
              <input type="number" value={form.amount_spent} onChange={e => setForm({ ...form, amount_spent: e.target.value })} className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-black/10 bg-white px-5 py-2.5 text-xs font-semibold text-[#000F1B] hover:bg-[#F2F2F2] transition">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white px-6 py-2.5 text-sm font-bold transition shadow-sm disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Updates
          </button>
        </div>
      </div>
    </div>
  );
}


// ------------------------------------------------------------------
// FULL MATERIALS MANAGER MODAL
// ------------------------------------------------------------------
function MaterialsManagerModal({ project, onClose, onSaved }) {
  const [materials, setMaterials] = useState(project.materials || []);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ category: "Structure", item_name: "", brand: "", grade_spec: "", quantity: "", unit: "Nos", unit_price: "", status: "ordered", payment_status: "pending", photo_url: "", notes: "" });

  const fetchProject = async () => {
    try { const p = await PR.get(project.id); setMaterials(p.materials || []); onSaved(); } catch { }
  };

  const openNew = () => {
    setEditId(null);
    setForm({ category: "Structure", item_name: "", brand: "", grade_spec: "", quantity: "", unit: "Nos", unit_price: "", status: "ordered", payment_status: "pending", photo_url: "", notes: "" });
    setShowForm(true);
  };

  const openEdit = (mat) => {
    setEditId(mat.id);
    setForm({ ...mat });
    setShowForm(true);
  };

  const saveMaterial = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = { ...form, quantity: Number(form.quantity) || 0, unit_price: Number(form.unit_price) || 0 };
      if (editId) await PR.updateMaterial(project.id, editId, payload);
      else await PR.createMaterial(project.id, payload);
      toast.success("Material saved"); setShowForm(false); await fetchProject();
    } catch { toast.error("Failed to save"); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return; setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "materials");
      setForm(prev => ({ ...prev, photo_url: res.url }));
      toast.success("Photo attached!");
    }
    catch { toast.error("Upload failed"); } finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/70 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between bg-white shrink-0">
          <div><div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Procurement</div><div className="text-lg font-bold text-[#000F1B] mt-0.5">{project.title}</div></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {!showForm && (
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#000F1B]">Material Log ({materials.length})</h3>
              <button onClick={openNew} className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                <Plus className="w-3.5 h-3.5" /> Log Material
              </button>
            </div>
          )}
          {showForm ? (
            <div className="bg-white rounded-2xl border border-black/5 p-6 relative shadow-sm">
              <button type="button" onClick={() => setShowForm(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 grid place-items-center hover:bg-black/10 transition"><X className="w-4 h-4" /></button>
              <h3 className="text-sm font-bold text-[#000F1B] mb-5">{editId ? "Edit Material Details" : "Log New Material Order"}</h3>
              <form onSubmit={saveMaterial} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2"><label className="block text-[10px] font-bold uppercase mb-1">Item Name *</label><input type="text" required value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl bg-[#F9FAFB] focus:bg-white" /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl"><option>Structure</option><option>Flooring</option><option>Electrical</option><option>Plumbing</option><option>Finishes</option></select></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1">Brand</label><input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl" placeholder="e.g. UltraTech" /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1">Unit Price (₹)</label><input type="number" required value={form.unit_price} onChange={e => setForm({ ...form, unit_price: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl font-bold" /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl font-bold" /></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl font-bold text-amber-600"><option value="ordered">Ordered</option><option value="delivered">Delivered</option><option value="inspected">Inspected</option><option value="installed">Installed</option></select></div>
                  <div><label className="block text-[10px] font-bold uppercase mb-1">Payment</label><select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl"><option value="pending">Pending</option><option value="paid">Paid</option></select></div>

                  {/* Photo Uploader */}
                  <div className="md:col-span-2 flex items-center gap-4 bg-white border border-black/10 rounded-xl p-3">
                    {form.photo_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-black/10">
                        <img src={resolveMediaUrl(form.photo_url)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm({ ...form, photo_url: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white grid place-items-center rounded-bl-lg"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#F2F2F2] grid place-items-center"><ImageIcon className="w-5 h-5 text-[#111111]/30" /></div>
                    )}
                    <label className="flex-1 cursor-pointer bg-black/5 hover:bg-black/10 text-[#000F1B] rounded-lg px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-2">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <UploadCloud className="w-4 h-4 text-amber-500" />}
                      {form.photo_url ? "Replace Photo" : "Upload Delivery Photo"}
                      <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-black/5">
                  <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border font-semibold text-xs">Cancel</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-[#000F1B] hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Material
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(m => (
                <div key={m.id} className="bg-white rounded-2xl border p-5 flex flex-col justify-between group">
                  <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 overflow-hidden shrink-0">
                        {m.photo_url ? <img src={resolveMediaUrl(m.photo_url)} alt="" className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-amber-500 m-2.5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#000F1B] text-sm">{m.item_name}</h4>
                        <p className="text-[10px] text-[#111111]/50">{m.quantity} {m.unit} • ₹{(m.unit_price * m.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-[#F2F2F2] px-2 py-1 rounded-md">{m.status}</span>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(m)} className="px-3 py-1.5 rounded-lg bg-white border border-black/10 text-xs font-bold hover:bg-[#000F1B] hover:text-white transition">Edit</button>
                    <button onClick={() => { if (window.confirm("Delete?")) { PR.removeMaterial(project.id, m.id).then(fetchProject); } }} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// STAGES EDITOR
// ------------------------------------------------------------------
function StagesEditor({ project, onClose, onSaved }) {
  const [stages, setStages] = useState(project.stages);
  const [saving, setSaving] = useState(null);
  const [uploading, setUploading] = useState(null);

  const saveStage = async (idx) => {
    setSaving(idx);
    try {
      const s = stages[idx];
      const updated = await PR.patchStage(project.id, idx, {
        status: s.status, expected_date: s.expected_date, progress_pct: Number(s.progress_pct) || 0,
        photos: s.photos, documents: s.documents, notes: s.notes,
      });
      const next = [...stages]; next[idx] = updated; setStages(next);
      toast.success(`"${s.name}" saved`); onSaved();
    } catch { toast.error("Save failed"); }
    finally { setSaving(null); }
  };

  const uploadPhoto = async (idx, file) => {
    if (!file) return;
    setUploading(idx);
    try {
      const res = await adminApi.uploadImage(file, "project-photos");
      const photoUrl = res.url || res.absoluteUrl;
      const next = [...stages];
      next[idx] = { ...next[idx], photos: [...(next[idx].photos || []), photoUrl] };
      setStages(next);
      toast.success("Photo uploaded — click Save Stage to publish to portal");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(null); }
  };

  const patchStage = (idx, patch) => {
    const next = [...stages]; next[idx] = { ...next[idx], ...patch }; setStages(next);
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" data-testid="proj-stages-editor">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white">
          <div>
            <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Manage Stages</div>
            <div className="font-bold text-[#000F1B] text-base">{project.title} · {project.customer_email}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {stages.map((s, idx) => {
            const StatusIcon = s.status === "completed" ? CheckCircle2 : s.status === "in_progress" ? PlayCircle : Circle;
            const color = s.status === "completed" ? "text-emerald-500" : s.status === "in_progress" ? "text-[#FF5A00]" : "text-[#111111]/30";
            return (
              <div key={idx} className="rounded-xl bg-white border border-black/5 p-5 shadow-sm" data-testid={`proj-stage-edit-${idx}`}>
                <div className="flex items-center gap-3 mb-4">
                  <StatusIcon className={`w-6 h-6 ${color}`} />
                  <div className="flex-1">
                    <div className="text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold">Stage {idx + 1}</div>
                    <div className="font-bold text-[#000F1B]">{s.name}</div>
                  </div>
                  <select value={s.status} onChange={e => patchStage(idx, { status: e.target.value })} className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5A00]" data-testid={`proj-status-${idx}`}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Target Date</label>
                    <input type="date" value={s.expected_date || ""} onChange={e => patchStage(idx, { expected_date: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Progress %</label>
                    <input type="number" value={s.progress_pct || 0} onChange={e => patchStage(idx, { progress_pct: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-3 py-1.5 text-xs" />
                  </div>
                  <div className="flex items-end">
                    <label className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/10 bg-[#F2F2F2] px-3 py-2 text-xs font-semibold cursor-pointer hover:bg-black/5 transition">
                      {uploading === idx ? <Loader2 className="w-4 h-4 animate-spin text-[#FF5A00]" /> : <Camera className="w-4 h-4 text-[#FF5A00]" />}
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => uploadPhoto(idx, e.target.files?.[0])} />
                    </label>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Engineer Notes</label>
                  <textarea value={s.notes || ""} onChange={e => patchStage(idx, { notes: e.target.value })} rows={2} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs resize-y" placeholder="Notes visible to the customer on portal" />
                </div>
                {(s.photos || []).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/5">
                    <div className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-2">Stage Photos ({(s.photos || []).length})</div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {s.photos.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-black/10 bg-[#F2F2F2]">
                          <img src={resolveMediaUrl(url)} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => patchStage(idx, { photos: s.photos.filter((_, j) => j !== i) })} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 grid place-items-center text-red-500 shadow-sm hover:bg-white transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-end">
                  <button onClick={() => saveStage(idx)} disabled={saving === idx} data-testid={`proj-save-stage-${idx}`} className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5A00] hover:bg-[#FF2D00] text-white px-5 py-2 text-xs font-bold transition">
                    {saving === idx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Stage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// TEAM & ATTENDANCE MODALS
// ------------------------------------------------------------------
function AssignTeamModal({ project, onClose, onSaved }) {
  const [allStaff, setAllStaff] = useState([]);
  const [selectedIds, setSelectedIds] = useState(project.team_ids || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.list("team").then((data) => setAllStaff(Array.isArray(data) ? data : [])).finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await PR.update(project.id, { team_ids: selectedIds });
      toast.success("Project team assigned successfully!");
      onSaved();
    } catch { toast.error("Failed to update project team"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#F2F2F2]/30">
          <div><div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Team Assignment</div><div className="font-bold text-[#000F1B] text-base">{project.title}</div></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/5 text-[#000F1B]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {loading ? <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div> : allStaff.map((staff) => {
            const isSelected = selectedIds.includes(staff.id);
            return (
              <div key={staff.id} onClick={() => toggleSelect(staff.id)} className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${isSelected ? "border-[#FF5A00] bg-[#FF5A00]/5 ring-1 ring-[#FF5A00]/30" : "border-black/10 bg-white hover:border-black/20"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {staff.photo ? <img src={resolveMediaUrl(staff.photo)} alt="" className="w-10 h-10 rounded-full object-cover border border-black/10" /> : <div className="w-10 h-10 rounded-full bg-[#000F1B] text-white grid place-items-center"><User className="w-5 h-5 text-white/60" /></div>}
                  <div className="min-w-0"><div className="font-bold text-sm text-[#000F1B] truncate">{staff.name}</div><div className="text-xs text-[#111111]/50 truncate">{staff.designation || staff.role}</div></div>
                </div>
                <div className={`w-6 h-6 rounded-lg grid place-items-center transition ${isSelected ? "bg-[#FF5A00] text-white" : "border border-black/20 bg-white"}`}>{isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}</div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-black/5 bg-[#F2F2F2] flex items-center justify-between">
          <span className="text-xs text-[#111111]/60 font-medium">{selectedIds.length} Selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#FF5A00] hover:bg-[#FF2D00] rounded-xl transition disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceModal({ project, onClose, onSaved }) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const staff = await adminApi.list("team");
        const staffMap = Object.fromEntries((staff || []).map(s => [s.id, s]));
        const internal = (project.team_ids || []).map(id => staffMap[id]).filter(Boolean).map(s => ({ id: s.id, name: s.name, role: s.designation || s.role || "Staff", photo: s.photo }));
        const external = (project.team_directory || []).filter(e => e.status === "Active").map(e => ({ id: e.id, name: e.name, role: e.role, photo: e.avatar }));
        setMembers([...internal, ...external]);
        const today = new Date().toLocaleDateString("en-CA");
        const entry = (project.attendance || []).find(a => a.date === today);
        setSelected(new Set(entry?.member_ids || []));
      } catch { toast.error("Failed to load team"); }
      finally { setLoading(false); }
    })();
  }, [project]);

  const toggle = (id) => { setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };
  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/projects/${project.id}/attendance`, { member_ids: [...selected] });
      toast.success(`Attendance saved`); onSaved();
    } catch { toast.error("Failed to save attendance"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#F2F2F2]/30">
          <div><div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Daily Attendance</div><div className="font-bold text-[#000F1B] text-base">{project.title}</div></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/5 text-[#000F1B]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 flex-1 overflow-y-auto space-y-2.5">
          {loading ? <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div> : members.map(m => {
            const on = selected.has(m.id);
            return (
              <div key={m.id} onClick={() => toggle(m.id)} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${on ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30" : "border-black/10 bg-white hover:border-black/20"}`}>
                <div className="flex items-center gap-3 min-w-0">
                  {m.photo ? <img src={m.photo} alt="" className="w-9 h-9 rounded-full object-cover border border-black/10" /> : <div className="w-9 h-9 rounded-full bg-[#000F1B] text-white grid place-items-center text-xs font-bold">{m.name?.[0]}</div>}
                  <div className="min-w-0"><div className="text-sm font-bold text-[#000F1B] truncate">{m.name}</div></div>
                </div>
                <div className={`w-6 h-6 rounded-lg grid place-items-center transition ${on ? "bg-emerald-500 text-white" : "border border-black/20 bg-white"}`}>{on && <Check className="w-3.5 h-3.5 stroke-[3]" />}</div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-black/5 bg-[#F2F2F2] flex items-center justify-between">
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl w-full justify-center disabled:opacity-60">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// DRAWINGS & MATERIALS MODALS
// ------------------------------------------------------------------
function DrawingsManagerModal({ project, onClose, onSaved }) {
  const [drawings, setDrawings] = useState(project.drawings || []);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Architectural");
  const [revisingId, setRevisingId] = useState(null);

  const fetchProject = async () => {
    try { const p = await PR.get(project.id); setDrawings(p.drawings || []); onSaved(); } catch { }
  };
  const handleUploadNew = async (e) => {
    const file = e.target.files?.[0]; if (!file || !newTitle.trim()) return;
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "drawings");
      await PR.createDrawing(project.id, { name: newTitle.trim(), category: newCategory, url: res.url });
      toast.success("Drawing uploaded!"); setNewTitle(""); await fetchProject();
    } catch { toast.error("Upload failed"); } finally { setUploading(false); e.target.value = ""; }
  };
  const handleUploadRevision = async (drawingId, e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setRevisingId(drawingId);
    try {
      const res = await adminApi.uploadImage(file, "drawings");
      await PR.reviseDrawing(project.id, drawingId, { url: res.url });
      toast.success("Revision uploaded!"); await fetchProject();
    } catch { toast.error("Revision failed"); } finally { setRevisingId(null); e.target.value = ""; }
  };
  const handleDelete = async (drawingId) => {
    if (!window.confirm("Delete this drawing?")) return;
    await PR.removeDrawing(project.id, drawingId); toast.success("Deleted"); await fetchProject();
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white">
          <div><div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Drawings & Approvals</div><div className="font-bold text-[#000F1B] text-base">{project.title}</div></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#000F1B] mb-3">Upload New Drawing</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Drawing Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Electrical Plan" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none" />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none">
                  <option>Architectural</option><option>Structural</option><option>Electrical</option><option>Plumbing</option><option>Interior</option>
                </select>
              </div>
              <label className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#000F1B] text-white px-5 py-2 text-sm font-semibold transition min-h-[40px] cursor-pointer hover:bg-[#FF5A00]`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}<span>Upload</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUploadNew} disabled={!newTitle.trim() || uploading} />
              </label>
            </div>
          </div>
          <div className="space-y-3">
            {drawings.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-black/5 shadow-sm p-4 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#000F1B]">{d.name} <span className="text-[10px] bg-black/5 px-2 py-0.5 rounded">V{d.current_version}</span></h4>
                  <p className="text-xs font-semibold text-[#FF5A00]">{d.status}</p>
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 px-3 py-1.5 text-xs font-bold cursor-pointer">
                    {revisingId === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Revise"}
                    <input type="file" className="hidden" onChange={(e) => handleUploadRevision(d.id, e)} />
                  </label>
                  <button onClick={() => handleDelete(d.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ------------------------------------------------------------------
// DOCUMENTS MANAGER MODAL (Phase 5)
// ------------------------------------------------------------------
function DocsManagerModal({ project, onClose, onSaved }) {
  const [documents, setDocuments] = useState(project.documents || []);
  const [uploading, setUploading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Contracts");

  const fetchProject = async () => {
    try {
      const p = await PR.get(project.id);
      setDocuments(p.documents || []);
      onSaved();
    } catch { toast.error("Failed to refresh documents"); }
  };

  const handleUploadNew = async (e) => {
    const file = e.target.files?.[0]; 
    if (!file) return;
    if (!newTitle.trim()) { toast.error("Enter a document title"); e.target.value = ""; return; }
    
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file, "documents");
      await PR.createDocument(project.id, { name: newTitle.trim(), category: newCategory, url: res.url });
      toast.success("Document uploaded & Client notified!");
      setNewTitle(""); 
      await fetchProject();
    } catch { 
      toast.error("Upload failed"); 
    } finally { 
      setUploading(false); e.target.value = ""; 
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Permanently delete this document from the vault?")) return;
    try {
      await PR.removeDocument(project.id, docId);
      toast.success("Document deleted");
      await fetchProject();
    } catch { toast.error("Failed to delete document"); }
  };

  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-[#F5F6F8] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white">
          <div>
            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Document Vault</div>
            <div className="font-bold text-[#000F1B] text-base">{project.title}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-5 h-5 text-[#000F1B]" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="bg-white rounded-xl border border-black/5 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-[#000F1B] mb-3">Upload New Document</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Document Title</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Signed Contract V1" className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none" />
              </div>
              <div className="w-full sm:w-48">
                <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1">Category</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-[#FF5A00] outline-none">
                  <option>Contracts</option>
                  <option>Reports</option>
                  <option>Invoices</option>
                  <option>Handover</option>
                  <option>Approvals</option>
                  <option>General</option>
                </select>
              </div>
              <label className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#000F1B] text-white px-5 py-2 text-sm font-semibold transition min-h-[40px] cursor-pointer hover:bg-[#FF5A00]`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                <span>Upload PDF / IMG</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUploadNew} disabled={!newTitle.trim() || uploading} />
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#000F1B] px-1">Vault Files ({documents.length})</h3>
            {documents.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#111111]/50 italic bg-white rounded-xl border border-black/5">No documents uploaded to this project yet.</div>
            ) : (
              documents.map(d => (
                <div key={d.id} className="bg-white rounded-xl border border-black/5 shadow-sm p-4 flex justify-between items-center group hover:border-[#FF5A00]/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F5F6F8] grid place-items-center shrink-0">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#000F1B]">{d.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">{d.category}</span>
                        <span className="text-[10px] text-[#111111]/40">• {new Date(d.uploaded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <a href={resolveMediaUrl(d.url)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition">
                      View
                    </a>
                    <button onClick={() => handleDelete(d.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-600 hover:text-white transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

