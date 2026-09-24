import React, { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, publicApi, API_BASE } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Save, X, Pencil, RefreshCw, FileDown, Send, Users,
  IndianRupee, Loader2
} from "lucide-react";

const rupees = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const emptyProposal = () => ({
  status: "draft", valid_days: 30, client_name: "", client_phone: "",
  client_email: "", client_address: "", site_address: "", plot_area: "",
  floors: "G+1", built_up_area: 1200, package_slug: "", addons_selected: [],
  discount_amount: 0, discount_label: "", gst_percent: 18, intro_note: "",
  scope_of_work: [], exclusions: [], payment_schedule: [], terms: "",
});

export default function AdminProposals() {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, pkgs] = await Promise.all([
        adminApi.list("proposals"),
        publicApi.getPackages(),
      ]);
      
      // Strict Array Check to prevent crash loops
      setItems(Array.isArray(list) ? list : []);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
    } catch (e) {
      console.error("[AdminProposals] load failed", e);
      toast.error("Failed to load proposals");
      setItems([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedPkg = useMemo(
    () => packages.find((p) => p.slug === editing?.package_slug),
    [editing?.package_slug, packages]
  );

  const pricing = useMemo(() => {
    const area = Number(editing?.built_up_area || 0);
    const rate = Number(selectedPkg?.price_per_sqft || 0);
    const base = area * rate;
    const addonTotal = (editing?.addons_selected || []).reduce((s, a) => s + Number(a.price || 0), 0);
    const subtotal = base + addonTotal;
    const discount = Number(editing?.discount_amount || 0);
    const net = Math.max(0, subtotal - discount);
    const gstPct = Number(editing?.gst_percent ?? 18);
    const gst = net * gstPct / 100;
    const grand = net + gst;
    return { area, rate, base, addonTotal, subtotal, discount, net, gst, gstPct, grand };
  }, [editing, selectedPkg]);

  const startNew = () => {
    const p = emptyProposal();
    if (packages[0]) p.package_slug = packages[0].slug;
    setEditing(p);
  };
  const startEdit = (p) => setEditing({ ...emptyProposal(), ...p });
  const close = () => setEditing(null);
  const setField = (patch) => setEditing((e) => ({ ...e, ...patch }));

  const toggleAddon = (addon) => {
    const list = editing.addons_selected || [];
    const idx = list.findIndex((a) => a.name === addon.name);
    let next;
    if (idx >= 0) {
      next = list.filter((_, i) => i !== idx);
    } else {
      const priceNum = Number(String(addon.price || "").replace(/[^\d.]/g, "")) || 0;
      next = [...list, { name: addon.name, price: priceNum, unit: addon.unit || "", description: addon.description || "" }];
    }
    setField({ addons_selected: next });
  };

  const save = async () => {
    if (!editing.client_name || !editing.client_phone) { toast.error("Client name and phone are required"); return; }
    if (!editing.package_slug) { toast.error("Please pick a package"); return; }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        built_up_area: Number(editing.built_up_area || 0),
        plot_area: editing.plot_area ? Number(editing.plot_area) : null,
        discount_amount: Number(editing.discount_amount || 0),
        gst_percent: Number(editing.gst_percent || 18),
      };
      let saved;
      if (editing.id) saved = await adminApi.update("proposals", editing.id, payload);
      else saved = await adminApi.create("proposals", payload);
      
      toast.success(`Proposal ${saved.ref_number || ""} saved`);
      setEditing(saved);
      await load();
    } catch (e) {
      console.error("[AdminProposals] save failed", e);
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this proposal? This cannot be undone.")) return;
    try { await adminApi.remove("proposals", id); toast.success("Deleted"); await load(); }
    catch (e) { toast.error("Delete failed"); }
  };

  const downloadPdf = async (p) => {
    if (!p?.id) { toast.error("Please save the proposal first"); return; }
    try {
      const res = await fetch(`${API_BASE}/proposals/${p.id}/pdf`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${p.ref_number || "proposal"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error("PDF download failed"); }
  };

  const sendWhatsApp = (p) => {
    if (!p?.id) { toast.error("Save the proposal first"); return; }
    const rawPhone = (p.client_phone || "").replace(/[^\d+]/g, "");
    const phone = rawPhone.startsWith("+") ? rawPhone.replace("+", "") : (rawPhone.length === 10 ? `91${rawPhone}` : rawPhone);
    if (!phone) { toast.error("Client phone missing"); return; }
    const msg = [
      `Hi ${p.client_name || "there"},`, "",
      `Here's your ConstructONS home construction proposal (${p.ref_number || ""}).`,
      p.package_name ? `Package: ${p.package_name}` : "",
      `Built-up Area: ${(p.built_up_area || 0).toLocaleString("en-IN")} sq.ft`, "",
      "Please find the attached PDF. Reach out to discuss any details.", "",
      "Thanks,", "ConstructONS Team",
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp opened. Attach the downloaded PDF to send.");
  };

  if (loading && items.length === 0) {
    return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>;
  }

  return (
    <div className="font-['Poppins'] pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="text-xs font-semibold text-[#FF5A00] uppercase tracking-wider">Sales</div>
          <h1 className="mt-1 text-2xl font-bold text-[#000F1B]">Client Proposals</h1>
          <p className="text-sm text-[#111111]/60 mt-1">Build personalised proposals with live pricing and branded PDFs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-4 py-2 text-xs font-semibold text-[#000F1B] bg-white border border-black/10 rounded-xl hover:bg-[#F2F2F2] flex items-center gap-1.5"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button onClick={startNew} className="inline-flex items-center gap-1.5 rounded-xl bg-[#000F1B] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#FF5A00] transition shadow-sm"><Plus className="w-4 h-4" /> New Proposal</button>
        </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-12 text-center">
            <Users className="w-10 h-10 text-[#111111]/20 mx-auto mb-3" />
            <div className="text-[#000F1B] font-bold text-lg">No proposals yet</div>
            <div className="text-sm text-[#111111]/50 mt-1">Click "New Proposal" to prepare your first customised quote.</div>
          </div>
        ) : (
          items.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-black/5 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:shadow-md transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold bg-[#F2F2F2] text-[#000F1B] px-2 py-0.5 rounded border border-black/5">{p.ref_number || "DRAFT"}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    p.status === "accepted" ? "bg-emerald-50 text-emerald-600" : p.status === "sent" ? "bg-blue-50 text-blue-600" : "bg-black/5 text-[#111111]/50"
                  }`}>{p.status}</span>
                </div>
                <div className="text-lg font-bold text-[#000F1B] truncate">{p.client_name}</div>
                <div className="text-xs font-semibold text-[#111111]/50 truncate mt-1">
                  {p.package_name || p.package_slug} • {Number(p.built_up_area || 0).toLocaleString("en-IN")} sq.ft • {p.client_phone}
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => downloadPdf(p)} className="p-2 rounded-xl bg-[#F2F2F2] hover:bg-black/10 transition text-[#000F1B]" title="Download PDF"><FileDown className="w-4 h-4" /></button>
                <button onClick={() => sendWhatsApp(p)} className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition text-emerald-600" title="Send via WhatsApp"><Send className="w-4 h-4" /></button>
                <button onClick={() => startEdit(p)} className="px-4 py-2 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] transition text-white text-xs font-bold flex items-center gap-1.5"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => remove(p.id)} className="p-2 rounded-xl bg-red-50 hover:bg-red-100 transition text-red-500 ml-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-[#000F1B]/60 backdrop-blur-sm" onClick={close} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-3xl bg-[#F8F9FA] h-full shadow-2xl flex flex-col">
              
              <div className="p-5 border-b border-black/5 bg-white flex items-center justify-between shrink-0">
                <div>
                  <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider">{editing.id ? `${editing.ref_number || "Edit"}` : "New Proposal"}</div>
                  <div className="font-bold text-[#000F1B] text-lg mt-0.5">{editing.client_name || "Untitled Proposal"}</div>
                </div>
                <button onClick={close} className="w-8 h-8 rounded-full bg-black/5 grid place-items-center hover:bg-black/10"><X className="w-4 h-4 text-[#000F1B]" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                <Section title="Client Details">
                  <Two>
                    <Field label="Full Name *"><Input value={editing.client_name} onChange={v => setField({ client_name: v })} /></Field>
                    <Field label="Phone *"><Input value={editing.client_phone} onChange={v => setField({ client_phone: v })} placeholder="+91 98xxxxxxxx" /></Field>
                    <Field label="Email"><Input value={editing.client_email} onChange={v => setField({ client_email: v })} /></Field>
                    <Field label="Address"><Input value={editing.client_address} onChange={v => setField({ client_address: v })} /></Field>
                  </Two>
                </Section>

                <Section title="Site & Project Scope">
                  <Two>
                    <Field label="Site Address"><Input value={editing.site_address} onChange={v => setField({ site_address: v })} /></Field>
                    <Field label="Plot Area (sq.ft)"><Input type="number" value={editing.plot_area} onChange={v => setField({ plot_area: v })} /></Field>
                    <Field label="Floors"><Input value={editing.floors} onChange={v => setField({ floors: v })} placeholder="G+1" /></Field>
                    <Field label="Built-up Area (sq.ft) *"><Input type="number" value={editing.built_up_area} onChange={v => setField({ built_up_area: v })} /></Field>
                    <Field label="Expected Start"><Input value={editing.expected_start} onChange={v => setField({ expected_start: v })} placeholder="e.g. Jan 2027" /></Field>
                    <Field label="Expected Completion"><Input value={editing.expected_completion} onChange={v => setField({ expected_completion: v })} placeholder="e.g. Dec 2027" /></Field>
                  </Two>
                </Section>

                <Section title="Base Package Selection">
                  <div className="grid grid-cols-2 gap-3">
                    {packages.map((p) => {
                      const active = editing.package_slug === p.slug;
                      return (
                        <button key={p.slug} type="button" onClick={() => setField({ package_slug: p.slug, addons_selected: [] })} className={`rounded-xl border p-4 text-left transition ${active ? "border-[#FF5A00] bg-[#FF5A00]/5 ring-1 ring-[#FF5A00]/30 shadow-sm" : "border-black/10 bg-white hover:border-black/20"}`}>
                          <div className="text-[10px] uppercase tracking-widest text-[#111111]/50 font-bold">{p.tier}</div>
                          <div className="text-sm font-bold text-[#000F1B] mt-1">{p.name}</div>
                          <div className="text-xs font-bold text-[#FF5A00] mt-2">₹{p.price_per_sqft}/sq.ft</div>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                {selectedPkg?.addons?.length > 0 && (
                  <Section title="Add-ons & Upgrades">
                    <div className="grid grid-cols-2 gap-3">
                      {selectedPkg.addons.map((a) => {
                        const active = editing.addons_selected?.some((x) => x.name === a.name);
                        return (
                          <button key={a.name} type="button" onClick={() => toggleAddon(a)} className={`rounded-xl border p-4 text-left transition flex flex-col justify-between ${active ? "border-[#000F1B] bg-[#000F1B] text-white shadow-sm" : "border-black/10 bg-white text-[#000F1B] hover:border-black/20"}`}>
                            <div>
                              <div className="font-bold text-sm">{a.name}</div>
                              {a.description && <div className={`text-[10px] mt-1 line-clamp-2 ${active ? "text-white/60" : "text-[#111111]/50"}`}>{a.description}</div>}
                            </div>
                            <div className={`text-xs font-bold mt-3 ${active ? "text-[#FF5A00]" : "text-[#FF5A00]"}`}>{a.price}</div>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                <Section title="Pricing Summary">
                  <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-5 space-y-3">
                    <Row label={`${pricing.area.toLocaleString("en-IN")} sq.ft × ${rupees(pricing.rate)}`} value={rupees(pricing.base)} />
                    {editing.addons_selected?.length > 0 && <Row label={`Add-ons (${editing.addons_selected.length})`} value={rupees(pricing.addonTotal)} />}
                    <div className="pt-3 border-t border-black/5"><Row label="Subtotal" value={rupees(pricing.subtotal)} bold /></div>
                    
                    <div className="grid grid-cols-[1fr_auto_120px] items-center gap-3 pt-2">
                      <input value={editing.discount_label || ""} onChange={(e) => setField({ discount_label: e.target.value })} placeholder="Discount Label (e.g. Diwali Offer)" className="rounded-lg border border-black/10 bg-[#F9FAFB] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF5A00] text-xs font-semibold" />
                      <span className="text-[#111111]/60 text-sm font-bold">− ₹</span>
                      <input type="number" value={editing.discount_amount || 0} onChange={(e) => setField({ discount_amount: Number(e.target.value || 0) })} className="rounded-lg border border-black/10 bg-[#F9FAFB] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF5A00] text-xs font-bold text-right" />
                    </div>
                    
                    <Row label={`GST @ ${pricing.gstPct}%`} value={rupees(pricing.gst)} />
                    <div className="mt-4 pt-4 border-t border-black/10">
                      <Row label="Grand Total" value={rupees(pricing.grand)} big />
                    </div>
                  </div>
                </Section>

                <Section title="Document Status & Notes">
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-2">Proposal Status</label>
                    <select value={editing.status} onChange={(e) => setField({ status: e.target.value })} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF5A00] text-sm font-bold">
                      <option value="draft">Draft</option><option value="sent">Sent to Client</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-2">Personal Intro Note</label>
                    <textarea rows={3} value={editing.intro_note || ""} onChange={(e) => setField({ intro_note: e.target.value })} placeholder="Write a personal message to the client..." className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF5A00] text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-2">Custom Terms (Optional)</label>
                    <textarea rows={3} value={editing.terms || ""} onChange={(e) => setField({ terms: e.target.value })} placeholder="Leave blank to use standard ConstructONS terms." className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-[#FF5A00] text-sm resize-none" />
                  </div>
                </Section>
                
              </div>

              <div className="p-5 border-t border-black/5 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="text-xs text-[#111111]/60 font-semibold flex items-center gap-1">
                  Grand Total: <b className="ml-1 text-xl text-[#000F1B] font-black">{rupees(pricing.grand)}</b>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={close} className="px-5 py-2.5 rounded-xl border border-black/10 text-xs font-semibold hover:bg-black/5 transition">Cancel</button>
                  <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#000F1B] hover:bg-[#FF5A00] text-white text-sm font-bold transition disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] font-bold text-[#FF5A00] uppercase tracking-wider mb-3">{title}</div>
      {children}
    </div>
  );
}

function Two({ children }) { return <div className="grid md:grid-cols-2 gap-4">{children}</div>; }

function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-[#000F1B] uppercase tracking-wider mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(type === "number" ? e.target.value : e.target.value)} className="w-full rounded-xl border border-black/10 bg-[#F9FAFB] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:bg-white text-sm font-semibold transition" />
  );
}

function Row({ label, value, bold, big }) {
  return (
    <div className={`flex items-center justify-between ${big ? "text-xl mt-2" : "text-sm"}`}>
      <span className={`text-[#111111]/70 ${bold || big ? "font-bold text-[#000F1B]" : "font-medium"}`}>{label}</span>
      <span className={`text-[#000F1B] ${bold ? "font-bold" : "font-semibold"} ${big ? "font-black text-[#10B981]" : ""}`}>{value}</span>
    </div>
  );
}