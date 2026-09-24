import React, { useState } from "react";
import { FolderOpen, FileText, Download, Search, HardHat, FileBox, FolderArchive } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";
import { resolveMediaUrl } from "../../../lib/mediaUrl";

export default function DocumentsPage() {
  const { project } = usePortal();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  if (!project) return <ComingSoon title="Documents Vault" icon={FolderArchive} />;

  const documents = project.documents || [];
  
  // Categorize documents dynamically based on what the admin has uploaded
  const categories = ["All", ...new Set(documents.map(d => d.category || "General"))];
  
  const filteredDocs = documents.filter(d => {
    const matchCat = filter === "All" || (d.category || "General") === filter;
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculate high-level KPIs for ribbon
  const totalDocs = documents.length;
  const contractDocs = documents.filter(d => d.category === "Contracts").length;
  const reportDocs = documents.filter(d => d.category === "Reports").length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 font-['Poppins'] pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
            <FolderArchive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Digital Record Room</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">Secure, permanent storage for your contracts, reports, and handover manuals.</p>
          </div>
        </div>
      </div>

      {/* 2. KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#000F1B]" />
          <FolderArchive className="w-5 h-5 mb-2 text-[#000F1B] opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{totalDocs}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">Total Files</div>
        </div>
        
        <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5A00]" />
          <FileText className="w-5 h-5 mb-2 text-[#FF5A00] opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{contractDocs}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">Contracts & Legal</div>
        </div>

        <div className="hidden md:flex bg-white rounded-xl border border-black/5 p-4 shadow-sm flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <FileBox className="w-5 h-5 mb-2 text-blue-500 opacity-80" />
          <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{reportDocs}</div>
          <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">Site Reports</div>
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
            placeholder="Search document name..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-[#F5F6F8] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:bg-white transition"
          />
        </div>
        
        <div className="w-full sm:w-auto overflow-x-auto no-scrollbar pb-1">
          <div className="inline-flex bg-[#F2F2F2] rounded-xl p-1 w-max border border-black/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`relative px-4 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-all duration-200 select-none ${
                  filter === cat 
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

      {/* 4. Documents Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden min-h-[400px]">
        <div className="p-4 sm:p-5 border-b border-black/5 bg-[#F9FAFB]">
          <h2 className="text-sm font-bold text-[#000F1B] uppercase tracking-wider">Vault Files</h2>
        </div>

        <div className="p-4 sm:p-6">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <FolderOpen className="w-16 h-16 text-[#111111]/20 mb-4" />
              <h3 className="text-lg font-bold text-[#000F1B]">No Files Found</h3>
              <p className="text-xs text-[#111111]/50 mt-1 max-w-sm">No documents matching your search or filter have been uploaded by the admin yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc, i) => {
                const url = resolveMediaUrl(doc.url);
                const isPdf = url.toLowerCase().includes('.pdf');
                
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-black/5 hover:border-[#FF5A00]/40 hover:bg-[#F9FAFB] transition group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 transition ${isPdf ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#000F1B] truncate">{doc.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-semibold text-[#111111]/50 uppercase tracking-wider">
                          <span className="text-[#FF5A00]">{doc.category || "General"}</span>
                          <span>•</span>
                          <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "Just now"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-white border border-black/10 grid place-items-center text-[#000F1B] hover:bg-[#000F1B] hover:text-white transition shrink-0 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Download/View File"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}