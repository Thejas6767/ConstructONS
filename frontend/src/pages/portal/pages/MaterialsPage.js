import React, { useState } from "react";
import { Package, Search, Filter, Box, ArrowRight, X, Image as ImageIcon, MapPin, Loader2,CheckCircle2 } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

export default function MaterialsPage() {
  const { project } = usePortal();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [photoModal, setPhotoModal] = useState(null); // stores URL to preview

  if (!project) return <ComingSoon title="Materials Tracking" icon={Package} />;

  const materials = project.materials || [];

  // Categorize dynamically
  const categories = ["All", ...new Set(materials.map(m => m.category || "General"))];

  // Search & Filter
  const filteredMaterials = materials.filter(m => {
    const matchSearch = !search || 
                        (m.item_name || "").toLowerCase().includes(search.toLowerCase()) || 
                        (m.brand || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Calculate high-level KPIs for ribbon
  const totalItems = materials.length;
  const delivered = materials.filter(m => ["delivered", "inspected", "installed"].includes(m.status)).length;
  const inTransit = materials.filter(m => m.status === "ordered").length;
  const installed = materials.filter(m => m.status === "installed").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 font-['Poppins'] pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Material Tracking</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">Track procurement, brands, and site delivery of premium materials.</p>
          </div>
        </div>
      </div>

      {/* 2. KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#000F1B]" />
          <Box className="w-5 h-5 mb-2 text-[#000F1B] opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{totalItems}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">Total Materials</div>
        </div>
        
        <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5A00]" />
          <MapPin className="w-5 h-5 mb-2 text-[#FF5A00] opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{inTransit}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">In Transit (Ordered)</div>
        </div>

        <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <Package className="w-5 h-5 mb-2 text-blue-500 opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{delivered}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">Delivered to Site</div>
        </div>

        <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]" />
          <CheckCircle2 className="w-5 h-5 mb-2 text-[#10B981] opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{installed}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">Installed</div>
        </div>
      </div>

      {/* 3. Filter & Search Ribbon */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3 sticky top-16 z-20 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111111]/40" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material or brand..." 
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

      {/* 4. Materials Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Box className="w-12 h-12 text-[#111111]/20 mb-3" />
            <h3 className="text-base font-bold text-[#000F1B]">No Materials Found</h3>
            <p className="text-xs text-[#111111]/50 mt-1 max-w-sm">No materials matching your filters have been procured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold border-b border-black/5">
                <tr>
                  <th className="px-5 py-4">Item & Specification</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Logistics Status</th>
                  <th className="px-5 py-4 text-right">Site Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredMaterials.map((m) => {
                  let statusBg = "bg-[#F2F2F2] text-[#111111]/50";
                  if (m.status === "ordered") statusBg = "bg-amber-100 text-amber-700 border border-amber-200";
                  if (m.status === "delivered") statusBg = "bg-blue-100 text-blue-700 border border-blue-200";
                  if (m.status === "inspected") statusBg = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                  if (m.status === "installed") statusBg = "bg-[#000F1B] text-white";
                  if (m.status === "rejected") statusBg = "bg-red-100 text-red-700 border border-red-200";

                  return (
                    <tr key={m.id} className="hover:bg-black/[0.02] transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F6F8] border border-black/5 flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-[#FF5A00]" />
                          </div>
                          <div>
                            <div className="font-bold text-[#000F1B]">{m.item_name}</div>
                            <div className="text-[10px] text-[#111111]/50 font-semibold mt-0.5">
                              {m.brand || "Standard"} {m.grade_spec && `• ${m.grade_spec}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">{m.category}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#000F1B]">{m.quantity} <span className="text-xs font-medium text-[#111111]/50">{m.unit}</span></div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${statusBg}`}>
                          {m.status.replace("_", " ")}
                        </span>
                        {m.delivered_on && (
                          <div className="text-[9px] text-[#111111]/40 mt-1 font-semibold">
                            Arrived {new Date(m.delivered_on).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {m.photo_url ? (
                          <button 
                            onClick={() => setPhotoModal(m.photo_url)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white text-[10px] font-bold text-[#000F1B] hover:bg-[#F2F2F2] transition shadow-sm"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> View Photo
                          </button>
                        ) : (
                          <span className="text-[10px] font-medium text-[#111111]/30 italic">No image attached</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Photo Modal */}
      {photoModal && (
        <div className="fixed inset-0 bg-[#000F1B]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setPhotoModal(null)} 
                className="w-10 h-10 rounded-full bg-black/50 text-white grid place-items-center hover:bg-black transition backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img 
              src={resolveMediaUrl(photoModal)} 
              alt="Material Delivery" 
              className="w-full max-h-[80vh] object-contain bg-black/5" 
            />
          </div>
        </div>
      )}

    </div>
  );
}