import React from "react";
import { Link } from "react-router-dom";
import { FileText, Building2, Clock, Camera, ShieldCheck, CheckSquare, Hammer } from "lucide-react";

export default function DashboardBottomRow({ project }) {
  const isHandoverComplete = project?.stages?.some(s => s.name.toLowerCase().includes("handover") && s.status === "completed");

  return (
    <div className="font-['Poppins']">
      
      {/* Quick Vaults Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-6">
        <Link to="/portal/approvals" className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col items-center justify-center text-center hover:bg-amber-100 transition shadow-sm group">
          <CheckSquare className="w-5 h-5 text-amber-600 mb-2 group-hover:scale-110 transition" />
          <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Action Center</span>
          <span className="text-[9px] font-bold text-amber-600 mt-1">Approvals</span>
        </Link>

        <Link to="/portal/documents" className="rounded-xl border border-black/10 bg-white p-4 flex flex-col items-center justify-center text-center hover:bg-[#F2F2F2] transition shadow-sm group">
          <FileText className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition" />
          <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Document Vault</span>
          <span className="text-[9px] font-bold text-[#111111]/50 mt-1">{(project?.documents || []).length} Files</span>
        </Link>

        <Link to="/portal/quality" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col items-center justify-center text-center hover:bg-emerald-100 transition shadow-sm group">
          <ShieldCheck className="w-5 h-5 text-emerald-700 mb-2 group-hover:scale-110 transition" />
          <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Quality Control</span>
          <span className="text-[9px] font-bold text-emerald-700 mt-1">{(project?.quality_inspections || []).length} Audits</span>
        </Link>

        {isHandoverComplete ? (
          <Link to="/portal/maintenance" className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-col items-center justify-center text-center hover:bg-blue-100 transition shadow-sm group">
            <Hammer className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition" />
            <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Maintenance</span>
            <span className="text-[9px] font-bold text-blue-700 mt-1">Tickets & Warranty</span>
          </Link>
        ) : (
          <div className="rounded-xl border border-dashed border-black/15 bg-white/50 p-4 flex flex-col items-center justify-center text-center opacity-70">
            <Hammer className="w-5 h-5 text-[#111111]/40 mb-2" />
            <span className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider">Maintenance</span>
            <span className="text-[9px] font-semibold text-[#FF5A00] mt-1">Unlocks at Handover</span>
          </div>
        )}
      </div>

      {/* Footer Ribbon */}
      <div className="mt-8 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <FooterItem icon={FileText} text="PLAN WITH CLARITY" />
          <FooterItem icon={Building2} text="BUILD WITH QUALITY" />
          <FooterItem icon={Clock} text="TRACK WITH TRANSPARENCY" />
          <FooterItem icon={Camera} text="LIVE WITH CONFIDENCE" />
          <FooterItem icon={ShieldCheck} text="HANDOVER WITH PEACE OF MIND" />
        </div>
        <div className="text-xs font-bold text-[#000F1B] uppercase tracking-[0.2em] border-l-2 border-red-500 pl-4 hidden md:block">
          A Better Tomorrow Begins Here.
        </div>
      </div>
    </div>
  );
}

function FooterItem({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-[#111111]/40" />
      <span className="text-[9px] font-bold text-[#111111]/50 uppercase tracking-widest leading-tight w-20">{text}</span>
    </div>
  );
}