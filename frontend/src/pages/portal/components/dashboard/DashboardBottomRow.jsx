import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function DashboardBottomRow({ project }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Approvals */}
      <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#000F1B]">Approvals</h2>
          <Link to="/portal/approvals" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-3">
          <ApprovalRow title="Structural Drawings" status="Approved" date="10 Feb 2026" />
          <ApprovalRow title="Electrical Plan" status="Approved" date="28 Mar 2026" />
          <ApprovalRow title="Plumbing Plan" status="Pending" date="15 Sep 2026" />
          <ApprovalRow title="Interior Design" status="Pending" date="20 Oct 2026" />
        </div>
      </div>

      {/* Documents */}
      <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#000F1B]">Documents</h2>
          <Link to="/portal/documents" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2 flex-1">
          <DocBox icon="✏️" count="48" label="Drawings" />
          <DocBox icon="📄" count="12" label="Contracts" />
          <DocBox icon="📋" count="14" label="Site Reports" />
          <DocBox icon="📊" count="1" label="BOQ" />
          <DocBox icon="🧾" count="8" label="Invoices" />
          <DocBox icon="✅" count="18" label="Approvals" />
        </div>
      </div>

      {/* Quality & Safety */}
      <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#000F1B]">Quality & Safety</h2>
          <Link to="/portal/quality" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
            View Details <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#000F1B]"><CheckCircle2 className="w-5 h-5 text-[#10B981]"/> Site Inspections</div>
            <div className="text-[10px] font-bold text-[#10B981]">12 (All Passed)</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#000F1B]"><CheckCircle2 className="w-5 h-5 text-[#10B981]"/> Safety Compliance</div>
            <div className="text-[10px] font-bold text-[#10B981]">Compliant</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#000F1B]"><CheckCircle2 className="w-5 h-5 text-[#10B981]"/> Material Tests</div>
            <div className="text-[10px] font-bold text-[#10B981]">8 (All Passed)</div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-[#000F1B]"><ShieldAlert className="w-5 h-5 text-red-500"/> Open Issues</div>
            <div className="text-[10px] font-bold text-red-500">2 Pending</div>
          </div>
        </div>
      </div>

      {/* AI Project Assistant */}
      {/* <div className="rounded-2xl bg-[#000F1B] border border-black/5 p-5 shadow-sm flex flex-col">
        <div className="flex items-center gap-2 text-white mb-4">
          <Bot className="w-5 h-5 text-[#FF5A00]" />
          <h2 className="text-sm font-bold">AI Project Assistant</h2>
        </div>
        <div className="relative mb-4">
          <input type="text" placeholder="Ask anything about your project..." className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF5A00]" disabled />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/50 hover:bg-[#FF5A00] hover:text-white transition"><ArrowRight className="w-4 h-4"/></button>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 rounded-lg border border-white/10 text-[9px] text-white/70 font-medium hover:bg-white/10 cursor-pointer transition">Show latest site photos</span>
          <span className="px-3 py-1.5 rounded-lg border border-white/10 text-[9px] text-white/70 font-medium hover:bg-white/10 cursor-pointer transition">What is the next milestone?</span>
          <span className="px-3 py-1.5 rounded-lg border border-white/10 text-[9px] text-white/70 font-medium hover:bg-white/10 cursor-pointer transition">Material delivery status</span>
        </div>
      </div> */}
    </div>
  );
}

const ApprovalRow = ({ title, status, date }) => {
  const isApproved = status === "Approved";
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[#F2F2F2] grid place-items-center shrink-0">
          <CheckCircle2 className={`w-3.5 h-3.5 ${isApproved ? "text-[#10B981]" : "text-[#111111]/30"}`} />
        </div>
        <span className="text-xs font-semibold text-[#000F1B] group-hover:text-[#FF5A00] transition">{title}</span>
      </div>
      <div className="text-right">
        <div className={`text-[9px] font-bold uppercase tracking-wider ${isApproved ? "text-[#10B981]" : "text-[#FF5A00]"}`}>{status}</div>
        <div className="text-[9px] text-[#111111]/40 mt-0.5">{date}</div>
      </div>
    </div>
  );
};

const DocBox = ({ icon, count, label }) => (
  <div className="flex flex-col items-center justify-center bg-[#F2F2F2]/50 hover:bg-[#F2F2F2] transition rounded-xl p-2 cursor-pointer border border-transparent hover:border-black/5">
    <div className="text-xl mb-1">{icon}</div>
    <div className="text-[10px] font-semibold text-[#000F1B]">{label}</div>
    <div className="text-[9px] text-[#111111]/50 font-medium mt-0.5">{count}</div>
  </div>
);