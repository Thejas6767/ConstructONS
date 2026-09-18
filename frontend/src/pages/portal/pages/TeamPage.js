import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Users, Building2, UserCheck, HardHat, Mail, Search,
  LayoutGrid, List, Loader2, UserPlus, Phone,
  MessageCircle, CheckCircle2, Trash2, Lock, RefreshCw
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import { resolveMediaUrl } from "../../../lib/mediaUrl";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000") + "/api";
const PHONE_RE = /^\+91[6-9]\d{9}$/;

function forcePhone(raw) {
  let s = String(raw || "").replace(/[^\d+]/g, "");
  if (!s.startsWith("+91")) {
    return "+91" + s.replace(/\D/g, "").replace(/^91/, "").slice(0, 10);
  }
  return "+91" + s.slice(3).replace(/\D/g, "").slice(0, 10);
}

function waLink(phone, text) {
  const digits = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export default function TeamPage() {
  const { project, user } = usePortal();
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Team Members");
  const [viewMode, setViewMode] = useState("List");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Invite Form State
  const [invName, setInvName] = useState("");
  const [invEmail, setInvEmail] = useState("");
  const [invPhone, setInvPhone] = useState("+91");
  const [invRole, setInvRole] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  
  const inviteRef = useRef(null);
  const nameInputRef = useRef(null);

  const loadTeam = useCallback(async (isSilent = false) => {
    if (!project?.id) return;
    if (!isSilent) setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/portal/my-project/team-data?project_id=${project.id}`, { withCredentials: true });
      setTeamData(res.data);
    } catch (err) {
      if (!isSilent) toast.error("Failed to sync live team data");
    } finally {
      if (!isSilent) setRefreshing(false);
    }
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    setLoading(true);
    loadTeam(true).finally(() => setLoading(false));

    // Auto-poll background updates every 15 seconds
    const interval = setInterval(() => {
      loadTeam(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [project, loadTeam]);

  const scrollToInvite = () => {
    inviteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => nameInputRef.current?.focus(), 500);
  };

  // ---- Remove Invited Member ----
  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this project?`)) return;
    try {
      await axios.delete(`${API_BASE}/portal/my-project/team/${memberId}`, { withCredentials: true });
      toast.success(`Removed ${memberName} from project team`);
      await loadTeam(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to remove team member");
    }
  };

  // ---- WhatsApp Invite ----
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!invEmail.trim()) {
      toast.error("Enter a Google email address for login access");
      return;
    }
    if (!PHONE_RE.test(invPhone)) {
      toast.error("Enter a valid phone: +91 followed by 10 digits");
      return;
    }
    if (!invRole) {
      toast.error("Please select a role");
      return;
    }

    setIsInviting(true);
    try {
      const access = /co-owner|spouse/i.test(invRole) ? "Full Access" : "View Access";
      const res = await axios.post(
        `${API_BASE}/portal/my-project/team/invite`,
        { name: invName, email: invEmail, phone: invPhone, role: invRole, access, contact: invPhone },
        { withCredentials: true }
      );

      const memberName = res.data.member.name;
      const msg =
`Hi${invName ? ` ${invName}` : ""}! 👋

You have been invited to join the *${res.data.project_title}* project team at *ConstructONS™* as *${invRole}*.

🔐 Access project updates, drawings & site reports here (Sign in with ${invEmail}):
${window.location.origin}/portal/login

— ConstructONS™
Everything Construction. Always On.`;

      window.open(waLink(invPhone, msg), "_blank");
      toast.success(`Access granted & WhatsApp opened for ${memberName}`);

      await loadTeam(true);

      setInvName(""); setInvEmail(""); setInvPhone("+91"); setInvRole("");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send invite.");
    } finally {
      setIsInviting(false);
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-['Poppins']">
        <Users className="w-12 h-12 text-[#111111]/20 mb-4" />
        <h2 className="text-xl font-bold text-[#000F1B]">Team Data Pending</h2>
        <p className="text-sm text-[#111111]/50 mt-1">Awaiting active project linkage.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#FF5A00]" /></div>;
  }

  const kpis = teamData?.kpis || {};
  const allMembers = teamData?.team_members || [];
  const activities = teamData?.activities || [];
  const attendance = teamData?.attendance || [];
  const onSiteMembers = allMembers.filter(m => m.on_site);

  // --- ROLE BASED ACCESS CONTROL (RBAC) ---
  const isPrimaryOwner = project?.customer_email?.toLowerCase() === user?.email?.toLowerCase();
  const currentUserRecord = allMembers.find(m => m.email?.toLowerCase() === user?.email?.toLowerCase());
  const hasFullAccess = isPrimaryOwner || currentUserRecord?.access === "Full Access";

  const roles = ["All", ...new Set(allMembers.map(m => m.role).filter(Boolean))];
  const members = allMembers.filter(m => {
    const q = search.toLowerCase();
    const matchQ = !q || [m.name, m.role, m.company, m.contact, m.email].some(v => String(v || "").toLowerCase().includes(q));
    const matchR = roleFilter === "All" || m.role === roleFilter;
    return matchQ && matchR;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 font-['Poppins'] pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold text-[#FF5A00] tracking-wider uppercase mb-1">Home &gt; Team</div>
          <h1 className="text-3xl font-bold text-[#000F1B] tracking-tight">Team</h1>
          <p className="text-sm text-[#111111]/60 mt-1">The right people. A better build. Collaborate, track and grow together.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => loadTeam(false)} 
            disabled={refreshing}
            className="px-3 py-2 bg-white border border-black/10 rounded-lg text-xs font-semibold text-[#000F1B] hover:bg-black/5 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF5A00]' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          {hasFullAccess && (
            <button onClick={scrollToInvite} className="px-5 py-2 bg-[#000F1B] text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#FF5A00] transition w-max">
              <UserPlus className="w-3.5 h-3.5" /> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={Users} count={kpis.total_members} label="Total Team Members" sub="Across all roles" />
        <KpiCard icon={HardHat} count={kpis.on_site_today} label="On Site Today" sub="Live attendance" color="#10B981" />
        <KpiCard icon={Building2} count={kpis.contractors} label="Active Contractors" sub="Vendors & suppliers" color="#F59E0B" />
        <KpiCard icon={UserCheck} count={kpis.consultants} label="Consultants" sub="Architect, Designers" color="#8B5CF6" />
        <KpiCard icon={Users} count={kpis.clients} label="Clients" sub="Home Owners" color="#3B82F6" />
        <KpiCard icon={Mail} count={kpis.pending_invites} label="Pending Invites" sub="Yet to join" color="#64748B" />
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Tabs + Members/Attendance */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
          <div className="border-b border-black/5">
            <div className="flex px-2 pt-2">
              {["Team Members", "Attendance"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === tab ? "border-[#FF5A00] text-[#000F1B]" : "border-transparent text-[#111111]/50 hover:text-[#000F1B]"}`}>
                  {tab}
                </button>
              ))}
            </div>
            {activeTab === "Team Members" && (
              <div className="p-3 bg-[#F2F2F2]/30 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111111]/40" />
                  <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search team members..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5A00]" />
                </div>
                <div className="flex items-center gap-2">
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-black/10 rounded-lg text-xs font-semibold text-[#111111]/70 focus:outline-none">
                    {roles.map(r => <option key={r} value={r}>{r === "All" ? "All Roles" : r}</option>)}
                  </select>
                  <div className="flex bg-white border border-black/10 rounded-lg p-0.5">
                    <button onClick={() => setViewMode("List")} className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition ${viewMode === "List" ? "bg-[#000F1B] text-white" : "text-[#111111]/60"}`}>
                      <List className="w-3.5 h-3.5" /> List
                    </button>
                    <button onClick={() => setViewMode("Cards")} className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition ${viewMode === "Cards" ? "bg-[#000F1B] text-white" : "text-[#111111]/60"}`}>
                      <LayoutGrid className="w-3.5 h-3.5" /> Cards
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === "Team Members" ? (
              viewMode === "List" ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wider text-[#111111]/50 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Access</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {members.map((m, idx) => (
                      <MemberRow key={m.id || idx} m={m} onDelete={() => handleDeleteMember(m.id, m.name)} hasFullAccess={hasFullAccess} />
                    ))}
                    {members.length === 0 && (
                      <tr><td colSpan="7" className="px-5 py-12 text-center text-sm text-[#111111]/50 italic">No members match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {members.map((m, idx) => (
                    <MemberCard key={m.id || idx} m={m} onDelete={() => handleDeleteMember(m.id, m.name)} hasFullAccess={hasFullAccess} />
                  ))}
                  {members.length === 0 && <div className="col-span-full py-12 text-center text-sm text-[#111111]/50 italic">No members match your search.</div>}
                </div>
              )
            ) : (
              /* Attendance Tab */
              <div className="p-5 space-y-6">
                <div className={`rounded-xl p-4 flex items-center gap-3 ${onSiteMembers.length > 0 ? "bg-emerald-50 border border-emerald-200" : "bg-[#F2F2F2] border border-black/5"}`}>
                  <div className={`w-10 h-10 rounded-full grid place-items-center ${onSiteMembers.length > 0 ? "bg-emerald-500 text-white" : "bg-[#111111]/10 text-[#111111]/40"}`}>
                    <HardHat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#000F1B]">
                      {onSiteMembers.length > 0 ? `${onSiteMembers.length} team member(s) currently on site` : "No attendance marked for today"}
                    </div>
                    <div className="text-[11px] text-[#111111]/55">
                      Attendance is marked daily by your site admin. Last updated: {attendance[0] ? new Date(attendance[0].marked_at).toLocaleString("en-IN") : "—"}
                    </div>
                  </div>
                </div>

                {onSiteMembers.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 mb-2.5">On Site Today</h4>
                    <div className="flex flex-wrap gap-3">
                      {onSiteMembers.map(m => (
                        <div key={m.id} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                          {m.photo
                            ? <img src={resolveMediaUrl(m.photo)} alt="" className="w-7 h-7 rounded-full object-cover" />
                            : <div className="w-7 h-7 rounded-full bg-[#000F1B] text-white text-[10px] font-bold grid place-items-center">{m.name?.[0]}</div>}
                          <span className="text-xs font-semibold text-[#000F1B]">{m.name}</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#111111]/50 mb-2.5">Attendance History (Last 7 Records)</h4>
                  {attendance.length === 0 ? (
                    <div className="text-xs text-[#111111]/40 italic">No attendance history yet. Mark attendance from Admin Projects.</div>
                  ) : (
                    <div className="space-y-2">
                      {attendance.map(a => (
                        <div key={a.date} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FAFB] border border-black/5">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className={`w-4 h-4 ${(a.member_ids || []).length > 0 ? "text-emerald-500" : "text-[#111111]/30"}`} />
                            <span className="text-xs font-semibold text-[#000F1B]">
                              {new Date(a.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                              {a.date === teamData?.date_today && <span className="ml-2 text-[9px] font-bold text-[#FF5A00] uppercase">Today</span>}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#000F1B]">{a.count ?? (a.member_ids || []).length} on site</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-black/5 p-3 bg-[#F9FAFB] text-[10px] font-medium text-[#111111]/40">
            Showing {members.length} of {allMembers.length} members
          </div>
        </div>

        {/* Right: Activity + Quick Invite */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex flex-col flex-1 min-h-[300px] max-h-[420px]">
            <h3 className="font-bold text-[#000F1B] mb-5 shrink-0">Team Activity</h3>
            <div className="relative pl-3 space-y-5 flex-1 overflow-y-auto no-scrollbar">
              <div className="absolute left-[17px] top-2 bottom-0 w-px bg-black/5" />
              {activities.length === 0 ? (
                <div className="text-xs text-[#111111]/40 italic">No recent activity.</div>
              ) : (
                activities.slice(0, 15).map((act, i) => <ActivityItem key={act.id || i} act={act} />)
              )}
            </div>
          </div>

          {/* Quick Invite Box */}
          {hasFullAccess ? (
            <form ref={inviteRef} onSubmit={handleInvite} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 shrink-0 scroll-mt-24">
              <h3 className="font-bold text-[#000F1B] mb-1">Invite Co-Owner or Family</h3>
              <p className="text-[10px] text-[#111111]/60 mb-4 leading-relaxed">
                Add family members to this project. They will log in using the Google Email specified below.
              </p>
              <div className="space-y-3">
                <input ref={nameInputRef} value={invName} onChange={e => setInvName(e.target.value)} type="text"
                  placeholder="Name" maxLength={30} required
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5A00]" />
                
                <input value={invEmail} onChange={e => setInvEmail(e.target.value)} type="email"
                  placeholder="Google Email (required for login)" required
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5A00]" />

                <input value={invPhone} onChange={e => setInvPhone(forcePhone(e.target.value))} type="tel" inputMode="numeric"
                  maxLength={13} placeholder="WhatsApp Number (+91...)" required
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#FF5A00]" />
                
                <select value={invRole} onChange={e => setInvRole(e.target.value)} required
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs text-[#111111]/70 bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5A00]">
                  <option value="">Select Role...</option>
                  <option value="Co-Owner">Co-Owner</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Client Representative">Client Representative</option>
                </select>

                <button type="submit" disabled={isInviting}
                  className="w-full px-4 py-2.5 bg-[#000F1B] hover:bg-[#FF5A00] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-70">
                  {isInviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageCircle className="w-3.5 h-3.5" />}
                  {isInviting ? "Sending..." : "Grant Access & Send WhatsApp"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex flex-col items-center justify-center text-center">
              <Lock className="w-8 h-8 text-[#111111]/20 mb-3" />
              <h3 className="font-bold text-[#000F1B]">Access Restricted</h3>
              <p className="text-xs text-[#111111]/50 mt-1">You need "Full Access" to invite or remove members from this project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub components ---------- */

function MemberRow({ m, onDelete, hasFullAccess }) {
  const phoneDigits = String(m.contact || "").replace(/\D/g, "");
  const isRemovable = hasFullAccess && !m.is_core && m.role !== "Project Owner";

  return (
    <tr className="hover:bg-black/[0.02] transition">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          {m.photo
            ? <img src={resolveMediaUrl(m.photo)} alt="" className="w-8 h-8 rounded-full object-cover border border-black/10 shrink-0" />
            : <div className="w-8 h-8 rounded-full bg-[#E5E7EB] text-[#000F1B] font-bold text-xs flex items-center justify-center shrink-0">{m.name?.[0]?.toUpperCase() || "?"}</div>}
          <div className="min-w-0">
            <div className="font-bold text-[#000F1B] truncate max-w-[150px]">{m.name}</div>
            {m.email && <div className="text-[9px] text-[#FF5A00] font-semibold">{m.email}</div>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-xs text-[#111111]/70">{m.role || "—"}</td>
      <td className="px-5 py-3.5 text-xs text-[#111111]/70">{m.company || "—"}</td>
      <td className="px-5 py-3.5 text-xs font-mono text-[#111111]/60">{m.contact || "—"}</td>
      <td className="px-5 py-3.5"><AccessBadge access={m.access} /></td>
      <td className="px-5 py-3.5">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${m.status === "Pending" ? "text-[#F59E0B]" : "text-[#10B981]"}`}>{m.status || "Active"}</span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1.5">
          {phoneDigits.length >= 10 && (
            <>
              <a href={`tel:+${phoneDigits}`} title="Call" className="w-7 h-7 rounded-lg bg-[#F2F2F2] grid place-items-center text-[#000F1B] hover:bg-[#000F1B] hover:text-white transition"><Phone className="w-3.5 h-3.5" /></a>
              <a href={waLink(m.whatsapp || m.contact)} target="_blank" rel="noreferrer" title="WhatsApp" className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center hover:bg-emerald-600 hover:text-white transition"><MessageCircle className="w-3.5 h-3.5" /></a>
            </>
          )}
          {isRemovable && (
            <button
              onClick={onDelete}
              title="Remove Invited Member"
              className="w-7 h-7 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-600 hover:text-white transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function MemberCard({ m, onDelete, hasFullAccess }) {
  const phoneDigits = String(m.contact || "").replace(/\D/g, "");
  const isRemovable = hasFullAccess && !m.is_core && m.role !== "Project Owner";

  return (
    <div className="rounded-2xl border border-black/5 p-4 hover:shadow-md transition bg-white relative group">
      <div className="flex items-center gap-3 mb-3">
        {m.photo
          ? <img src={resolveMediaUrl(m.photo)} alt="" className="w-11 h-11 rounded-full object-cover border border-black/10" />
          : <div className="w-11 h-11 rounded-full bg-[#E5E7EB] text-[#000F1B] font-bold grid place-items-center">{m.name?.[0]?.toUpperCase() || "?"}</div>}
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm text-[#000F1B] truncate">{m.name}</div>
          <div className="text-[10px] text-[#111111]/55 truncate">{m.role}</div>
          {m.email && <div className="text-[9px] text-[#FF5A00] truncate">{m.email}</div>}
        </div>
        {isRemovable && (
          <button
            onClick={onDelete}
            title="Remove Invited Member"
            className="w-7 h-7 rounded-lg bg-red-50 text-red-600 grid place-items-center hover:bg-red-600 hover:text-white transition shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-black/5">
        <AccessBadge access={m.access} />
        <div className="flex gap-1.5">
          {phoneDigits.length >= 10 && (
            <>
              <a href={`tel:+${phoneDigits}`} className="w-7 h-7 rounded-lg bg-[#F2F2F2] grid place-items-center text-[#000F1B] hover:bg-[#000F1B] hover:text-white transition"><Phone className="w-3.5 h-3.5" /></a>
              <a href={waLink(m.whatsapp || m.contact)} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center hover:bg-emerald-600 hover:text-white transition"><MessageCircle className="w-3.5 h-3.5" /></a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, count, label, sub, color = "#000F1B" }) {
  return (
    <div className="bg-white rounded-xl border border-black/5 p-4 shadow-sm flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
      <Icon className="w-5 h-5 mb-2 opacity-80" style={{ color }} />
      <div className="text-2xl font-black text-[#000F1B] leading-none mb-1">{count || 0}</div>
      <div className="text-[10px] font-bold text-[#111111]/70 leading-tight">{label}</div>
      <div className="text-[9px] text-[#111111]/40 mt-0.5">{sub}</div>
    </div>
  );
}

function AccessBadge({ access }) {
  const map = {
    "Full Access": "bg-emerald-50 text-emerald-700",
    "Edit Access": "bg-blue-50 text-blue-700",
    "View Access": "bg-purple-50 text-purple-700",
    "Limited Access": "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-semibold border border-black/5 ${map[access] || "bg-gray-100 text-gray-600"}`}>
      {access || "Pending"}
    </span>
  );
}

function ActivityItem({ act }) {
  let Icon = UserPlus, color = "text-emerald-600", bg = "bg-emerald-50";
  const mod = act.module || "System";
  if (mod === "Progress") { Icon = HardHat; color = "text-[#FF5A00]"; bg = "bg-[#FF5A00]/10"; }
  if (mod === "Attendance") { Icon = CheckCircle2; color = "text-teal-600"; bg = "bg-teal-50"; }
  if (mod === "Payments") { Icon = HardHat; color = "text-emerald-600"; bg = "bg-emerald-50"; }
  if (mod === "System") { Icon = Building2; color = "text-slate-500"; bg = "bg-slate-100"; }

  return (
    <div className="relative z-10 flex gap-3">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 border-white ring-1 ring-black/5 ${bg}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="min-w-0 pt-0.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="text-xs font-medium text-[#000F1B] leading-tight break-words">
            {act.action}
          </div>
          <div className={`text-[9px] font-bold uppercase tracking-wider shrink-0 pt-0.5 ${color}`}>
            {mod}
          </div>
        </div>
        <div className="text-[10px] text-[#111111]/40 mt-1.5">
          {new Date(act.timestamp).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}