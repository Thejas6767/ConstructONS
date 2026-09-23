import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Loader2, 
  RefreshCw, 
  X, 
  User
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { resolveMediaUrl } from "@/lib/mediaUrl";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export default function AdminClientUsers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/customers");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load customer list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || [c.name, c.email, c.phone, c.plot_location].some(v => String(v || "").toLowerCase().includes(q));
  });

  return (
    <div className="max-w-6xl mx-auto font-['Poppins']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-semibold text-[#FF5A00] uppercase tracking-wider">CRM · Leads & Clients</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B]">Registered Client Users</h1>
          <p className="text-xs text-[#111111]/60 mt-1">Clients who completed Google login & onboarding questionnaire.</p>
        </div>
        <button 
          onClick={load} 
          className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl hover:bg-[#F2F2F2] flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FF5A00]' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#111111]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone, or location..."
            className="w-full rounded-xl border border-black/10 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#FF5A00] outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-black/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#111111]/50 italic">No registered client users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#000F1B] text-white text-[10px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Client Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Location & Plot</th>
                  <th className="px-5 py-3.5">Style & Budget</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((c) => (
                  <tr key={c.user_id || c.email} className="hover:bg-[#F2F2F2]/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {c.picture ? (
                          <img src={c.picture} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-black/10 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#000F1B] text-white grid place-items-center font-bold text-xs">
                            {c.name?.[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#000F1B] text-sm">{c.name}</div>
                          <div className="text-[10px] text-[#111111]/50">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#111111]/70">
                      {c.phone || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#000F1B]">{c.plot_location || "—"}</div>
                      <div className="text-[10px] text-[#111111]/50">{c.plot_size ? `${c.plot_size}` : ""}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#000F1B]">{c.style_pref || "—"}</div>
                      <div className="text-[10px] text-[#111111]/50">{c.budget_range || ""}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.onboarding_completed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Onboarded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                          Pending Setup
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedUser(c)}
                        className="px-3 py-1.5 bg-[#000F1B] hover:bg-[#FF5A00] text-white font-bold rounded-lg transition"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedUser && (
        <ClientDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
}

function ClientDetailModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-[#000F1B]/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">Client Onboarding File</span>
            <h2 className="text-xl font-bold text-[#000F1B]">{user.name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full grid place-items-center hover:bg-[#F2F2F2]"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          <div className="grid grid-cols-2 gap-3 bg-[#F2F2F2]/50 p-4 rounded-xl border border-black/5">
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block">Email Address</span>
              <span className="font-semibold text-[#000F1B]">{user.email}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block">Mobile Phone</span>
              <span className="font-semibold font-mono text-[#000F1B]">{user.phone || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block">Plot Location</span>
              <span className="font-semibold text-[#000F1B]">{user.plot_location || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block">Plot Size</span>
              <span className="font-semibold text-[#000F1B]">{user.plot_size || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block">Style Preference</span>
              <span className="font-semibold text-[#000F1B]">{user.style_pref || "—"}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block">Budget Range</span>
              <span className="font-semibold text-[#000F1B]">{user.budget_range || "—"}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#111111]/50 font-bold uppercase block mb-1">Project Status</span>
            <div className="p-3 bg-white border border-black/10 rounded-xl font-semibold text-[#000F1B]">
              {user.current_status || "Not specified"}
            </div>
          </div>

          {user.site_photos && user.site_photos.length > 0 && (
            <div>
              <span className="text-[10px] text-[#111111]/50 font-bold uppercase block mb-2">Uploaded Plot Photos ({user.site_photos.length})</span>
              <div className="grid grid-cols-3 gap-2">
                {user.site_photos.map((url, i) => (
                  <a key={i} href={resolveMediaUrl(url)} target="_blank" rel="noreferrer" className="aspect-square rounded-lg overflow-hidden border border-black/10 bg-black/5 block">
                    <img src={resolveMediaUrl(url)} alt="" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-black/10 rounded-xl text-xs font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}