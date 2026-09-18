import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, IndianRupee, Package, Users, Activity, 
  MessageCircle, User, HardHat, FileText, CheckCircle2, Building2
} from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/mediaUrl";

export default function DashboardMetricsRow({ project }) {
  const team = project?.team || [];
  const displayTeam = team.slice(0, 2);
  const remainingCount = team.length > 2 ? team.length - 2 : 0;

  const materials = project?.materials || [];
  const contractValue = project?.contract_value || 0;
  
  // Recent Activities
  const activities = project?.activities || [];

  // --- 1. Finance & Cost Calculations ---
  const calculatedSpent = materials
    .filter(m => m.payment_status === "paid")
    .reduce((sum, m) => sum + (Number(m.total_cost) || 0), 0);
  
  const amountSpent = calculatedSpent > 0 ? calculatedSpent : (project?.amount_spent || 0);
  const balance = contractValue > 0 ? contractValue - amountSpent : 0;
  const pctSpent = contractValue > 0 ? Math.round((amountSpent / contractValue) * 100) : 0;

  // --- 2. Material Logistics Calculations ---
  const totalMats = materials.length;
  const deliveredMats = materials.filter(m => ["delivered", "inspected", "installed"].includes(m.status)).length;
  const transitMats = materials.filter(m => m.status === "ordered").length;
  const pendingMats = materials.filter(m => m.status === "pending").length;

  const pctDelivered = totalMats > 0 ? Math.round((deliveredMats / totalMats) * 100) : 0;
  const pctTransit = totalMats > 0 ? Math.round((transitMats / totalMats) * 100) : 0;
  const pctPending = totalMats > 0 ? Math.round((pendingMats / totalMats) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-['Poppins']">
      
      {/* 💳 Cost Tracking Card */}
      {contractValue > 0 ? (
        <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-[#000F1B]">Cost Tracking</h2>
              <Link to="/portal/payments" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
                View Ledger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-[#111111]/50 font-semibold mb-0.5">Budget</div>
                <div className="text-xs font-bold text-[#000F1B]">₹ {(contractValue / 100000).toFixed(1)}L</div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest text-[#111111]/50 font-semibold mb-0.5">Spent</div>
                <div className="text-xs font-bold text-[#FF5A00]">₹ {(amountSpent / 100000).toFixed(1)}L</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest text-[#111111]/50 font-semibold mb-0.5">Balance</div>
                <div className="text-xs font-bold text-[#10B981]">₹ {(balance / 100000).toFixed(1)}L</div>
              </div>
            </div>
            <div className="w-full h-2.5 bg-[#F2F2F2] rounded-full overflow-hidden flex mb-2">
              <div className="h-full bg-[#000F1B] transition-all duration-1000" style={{ width: `${pctSpent}%` }} />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-[#111111]/50 font-medium">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#000F1B]"/> Amount Paid</span>
            <span className="font-bold text-[#000F1B]">{pctSpent}%</span>
          </div>
        </div>
      ) : (
        <MetricsPlaceholder title="Cost Tracking" icon={IndianRupee} link="/portal/payments" desc="Financial data is syncing..." />
      )}

      {/* 📦 Material Status Card */}
      {totalMats > 0 ? (
        <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#000F1B]">Material Status</h2>
            <Link to="/portal/materials" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#F2F2F2" strokeWidth="12" fill="none" />
                <circle 
                  cx="32" cy="32" r="26" 
                  stroke="#FF5A00" strokeWidth="12" fill="none" 
                  strokeDasharray={`${26 * 2 * Math.PI}`} 
                  strokeDashoffset={`${26 * 2 * Math.PI - (pctDelivered / 100) * 26 * 2 * Math.PI}`} 
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-[#000F1B] leading-none">{pctDelivered}%</span>
                <span className="text-[7px] font-bold uppercase tracking-wider text-[#111111]/50 mt-0.5">On Site</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <StatRow dot="#FF5A00" label="Delivered" val={`${pctDelivered}%`} />
              <StatRow dot="#F59E0B" label="In Transit" val={`${pctTransit}%`} />
              <StatRow dot="#A6A6A6" label="Pending" val={`${pctPending}%`} />
            </div>
          </div>
        </div>
      ) : (
        <MetricsPlaceholder title="Material Status" icon={Package} link="/portal/materials" desc="Procurement data syncing..." />
      )}
      
      {/* 👷 Site Team Card */}
      <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#000F1B]">Site Team</h2>
            <Link to="/portal/team" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {team.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-9 h-9 rounded-full bg-[#F2F2F2] grid place-items-center mb-1.5">
                <Users className="w-4 h-4 text-[#111111]/30" />
              </div>
              <div className="text-[10px] text-[#111111]/50 font-medium">Team assignment pending...</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayTeam.map((member) => (
                <TeamRow key={member.id || member.name} member={member} />
              ))}
            </div>
          )}
        </div>

        {team.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[10px]">
            <span className="text-[#111111]/50 font-medium">
              {remainingCount > 0 ? `+${remainingCount} more member${remainingCount > 1 ? 's' : ''}` : `${team.length} member${team.length > 1 ? 's' : ''} assigned`}
            </span>
            <Link to="/portal/team" className="font-bold text-[#FF5A00] hover:underline">
              Team Page &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* 📋 Recent Updates Card (Live Activity Feed) */}
      <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col hover:shadow-md transition">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#000F1B]">Recent Updates</h2>
          <Link to="/portal/site-reports" className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00] flex items-center gap-1">
            View Log <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        {activities.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
            <div className="w-9 h-9 rounded-full bg-[#F2F2F2] grid place-items-center mb-1.5">
              <Activity className="w-4 h-4 text-[#111111]/30" />
            </div>
            <div className="text-[10px] text-[#111111]/50 font-medium">No recent activity.</div>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar">
            {activities.slice(0, 3).map((act, i) => (
              <ActivityRow key={act.id || i} act={act} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ---- Subcomponents ----
const StatRow = ({ dot, label, val }) => (
  <div className="flex items-center justify-between text-[10px]">
    <div className="flex items-center gap-1.5 text-[#111111]/70 font-medium"><span className="w-2 h-2 rounded-full" style={{backgroundColor: dot}}/> {label}</div>
    <div className="font-bold text-[#000F1B]">{val}</div>
  </div>
);

function TeamRow({ member }) {
  const cleanPhone = (member.whatsapp || member.phone || "").replace(/[^\d]/g, "");
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  return (
    <div className="flex items-center justify-between group py-0.5">
      <div className="flex items-center gap-2.5 min-w-0">
        {member.photo ? (
          <img src={resolveMediaUrl(member.photo)} alt={member.name} className="w-8 h-8 rounded-full object-cover border border-black/10 shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#000F1B] text-white text-[10px] font-bold grid place-items-center shrink-0">
            <User className="w-4 h-4 text-white/70" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[10px] text-[#111111]/50 font-semibold leading-tight truncate">
            {member.designation || member.role || "Team Member"}
          </div>
          <div className="text-xs font-bold text-[#000F1B] truncate">{member.name}</div>
        </div>
      </div>

      {waUrl && (
        <a href={waUrl} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center hover:bg-emerald-600 hover:text-white transition shrink-0 ml-2" title={`Chat with ${member.name} on WhatsApp`}>
          <MessageCircle className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

function ActivityRow({ act }) {
  let Icon = Activity; let color = "text-blue-500"; let bg = "bg-blue-50";
  const mod = act.module || "System";
  
  if (mod === "Drawings") { Icon = FileText; color = "text-blue-600"; bg = "bg-blue-50"; }
  if (mod === "Quality") { Icon = ShieldCheck; color = "text-indigo-600"; bg = "bg-indigo-50"; }
  if (mod === "Team") { Icon = Users; color = "text-emerald-600"; bg = "bg-emerald-50"; }
  if (mod === "Payments") { Icon = IndianRupee; color = "text-emerald-600"; bg = "bg-emerald-50"; }
  if (mod === "Progress") { Icon = HardHat; color = "text-[#FF5A00]"; bg = "bg-[#FF5A00]/10"; }
  if (mod === "Attendance") { Icon = CheckCircle2; color = "text-teal-600"; bg = "bg-teal-50"; }
  if (mod === "System") { Icon = Building2; color = "text-slate-600"; bg = "bg-slate-100"; }
  
  // Extract just the time (e.g. 10:45 AM)
  const timeString = new Date(act.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-[#000F1B] leading-tight truncate">{act.action}</div>
        <div className="text-[9px] text-[#111111]/50 font-medium mt-0.5">{timeString} • {mod}</div>
      </div>
    </div>
  );
}

function MetricsPlaceholder({ title, icon: Icon, link, desc }) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 p-5 shadow-sm flex flex-col h-[180px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-[#000F1B]">{title}</h2>
        <Link to={link} className="text-[10px] font-semibold text-[#111111]/50 hover:text-[#FF5A00]">
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#F2F2F2] grid place-items-center mb-2">
          <Icon className="w-5 h-5 text-[#111111]/30" />
        </div>
        <div className="text-[10px] text-[#111111]/50 font-medium">{desc}</div>
      </div>
    </div>
  );
}