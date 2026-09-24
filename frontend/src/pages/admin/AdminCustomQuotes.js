/**
 * AdminCustomQuotes — Bespoke quotation builder.
 *
 * Left column: quote list.
 * Right column: full editor with:
 *   - Client info
 *   - Requirements (plot size, floors, BHK, budget, timeline)
 *   - AI panel (Mode A: recommend base + upgrades | Mode B: from scratch)
 *   - Base package picker + deep editable spec categories
 *   - Add-ons + custom line items
 *   - Live pricing breakdown (auto totals, editable overrides)
 *   - Scope / Exclusions / Payment schedule / Terms
 *   - Actions: Save, Download PDF, WhatsApp share, Email share
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminApi, publicApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  Plus, Trash2, Save, X, Pencil, RefreshCw, FileDown,
  Wand2, Mail, MessageCircle, Copy, Loader2, ChevronDown,
  ChevronUp, BookOpen, Link as LinkIcon, MessageSquare, Eye, EyeOff, Search,
  History, PackageOpen,
} from "lucide-react";

const rupees = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition";

const emptyQuote = () => ({
  status: "draft",
  valid_days: 30,
  client_name: "",
  client_phone: "",
  client_email: "",
  client_address: "",
  site_address: "",
  plot_area: "",
  floors: "G+1",
  built_up_area: 1200,
  bhk: "3 BHK",
  budget: "",
  style_pref: "Modern",
  expected_start: "",
  expected_completion: "",
  package_slug: "",
  package_name: "",
  price_per_sqft: 1799,
  addons: [],
  line_items: [],
  discount_label: "",
  discount_amount: 0,
  service_charge_percent: 15,
  gst_percent: 0,
  spec_categories: [],
  material_specs: [],
  interiors: [],
  floor_plans: [],
  elevations: [],
  visual_boards: [],
  scope_of_work: [],
  exclusions: [],
  payment_schedule: [],
  intro_note: "",
  terms: "",
  warranty_years: 10,
  ai_notes: "",
  ai_mode: "recommend",
});

export default function AdminCustomQuotes() {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, pkgs] = await Promise.all([
        adminApi.customQuotes.list().catch((err) => {
          console.error("[AdminCustomQuotes] customQuotes.list failed", err);
          return [];
        }),
        publicApi.getPackages().catch((err) => {
          console.error("[AdminCustomQuotes] getPackages failed", err);
          return [];
        }),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
    } catch (e) {
      console.error("[AdminCustomQuotes] load error", e);
      toast.error("Failed to load custom quotes");
      setItems([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = () => setEditing(emptyQuote());
  const startEdit = (row) => setEditing({ ...emptyQuote(), ...row });
  const cancelEdit = () => setEditing(null);

  const remove = async (row) => {
    if (!window.confirm(`Delete quote ${row.ref_number || ""}?`)) return;
    try {
      await adminApi.customQuotes.remove(row.id);
      toast.success("Quote deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.client_name?.trim()) {
      toast.error("Client name is required");
      return;
    }
    setSaving(true);
    try {
      const num = (v, dflt = 0) => {
        if (v === "" || v === null || v === undefined) return dflt;
        const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
        return Number.isFinite(n) ? n : dflt;
      };
      const numOrNull = (v) => {
        if (v === "" || v === null || v === undefined) return null;
        const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
        return Number.isFinite(n) ? n : null;
      };

      const payload = {
        ...editing,
        plot_area: numOrNull(editing.plot_area),
        built_up_area: num(editing.built_up_area, 0),
        budget: numOrNull(editing.budget),
        price_per_sqft: num(editing.price_per_sqft, 0),
        discount_amount: num(editing.discount_amount, 0),
        service_charge_percent: num(editing.service_charge_percent, 15),
        gst_percent: num(editing.gst_percent, 0),
        warranty_years: Math.trunc(num(editing.warranty_years, 10)),
        valid_days: Math.trunc(num(editing.valid_days, 30)),
        addons: (editing.addons || []).map((a) => ({
          ...a,
          price: num(a?.price, 0),
        })),
        line_items: (editing.line_items || []).map((li) => ({
          ...li,
          amount: num(li?.amount, 0),
        })),
        payment_schedule: (editing.payment_schedule || []).map((p) => ({
          ...p,
          percentage: num(p?.percentage, 0),
        })),
      };
      const saved = editing.id
        ? await adminApi.customQuotes.update(editing.id, payload)
        : await adminApi.customQuotes.create(payload);
      setEditing(saved);
      toast.success(editing.id ? "Quote updated" : "Quote created");
      load();
    } catch (e) {
      const detail = e?.response?.data?.detail;
      let msg = "Save failed";
      if (typeof detail === "string" && detail.trim()) {
        msg = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        const first = detail
          .slice(0, 3)
          .map((d) => {
            const path = Array.isArray(d?.loc) ? d.loc.filter((x) => x !== "body").join(" › ") : "";
            const reason = d?.msg || "invalid value";
            return path ? `${path}: ${reason}` : reason;
          })
          .join(" | ");
        msg = `Save failed — ${first}${detail.length > 3 ? ` (+${detail.length - 3} more)` : ""}`;
      } else if (e?.message) {
        msg = `Save failed — ${e.message}`;
      }
      console.error("[CustomQuotes] save error", { status: e?.response?.status, detail, error: e });
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-['Poppins']" data-testid="admin-custom-quotes">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <div className="section-eyebrow">Sales · AI-Powered</div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mt-1">Custom Quotes</h1>
          <p className="text-sm text-brand-navy/60 mt-1">
            Generate bespoke, AI-assisted quotations tailored to each client's requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            data-testid="cq-refresh-btn"
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm font-medium text-brand-navy hover:bg-brand-bg transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={startNew}
            data-testid="cq-new-btn"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-semibold hover:brightness-95 transition shadow-soft"
          >
            <Plus className="w-4 h-4" /> New Custom Quote
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-white border border-black/5 shadow-soft overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-brand-orange/10 grid place-items-center">
             
            </div>
            <div className="mt-4 font-semibold text-brand-navy">No custom quotes yet</div>
            <p className="text-sm text-brand-navy/60 mt-1 max-w-md mx-auto">
              Click "New Custom Quote" to build your first AI-assisted bespoke quotation
              with editable specs and PDF export.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm" data-testid="cq-list-table">
            <thead className="bg-brand-bg/60 text-brand-navy/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3">Ref</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Build</th>
                <th className="text-left px-4 py-3">Rate</th>
                <th className="text-left px-4 py-3">Grand Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const grand = computeGrand(row);
                return (
                  <tr
                    key={row.id}
                    className="border-t border-black/5 hover:bg-brand-bg/40 transition"
                    data-testid={`cq-row-${row.id}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-brand-navy/80">
                      {row.ref_number || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-brand-navy">{row.client_name}</div>
                      <div className="text-xs text-brand-navy/50">
                        {row.client_phone || "—"} · {row.client_email || "no email"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-navy/80">
                      {row.built_up_area || 0} sq.ft · {row.floors}
                    </td>
                    <td className="px-4 py-3 text-brand-navy/80">
                      {rupees(row.price_per_sqft)}/sqft
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-navy">
                      {rupees(grand)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={adminApi.customQuotes.pdfUrl(row.id)}
                          target="_blank"
                          rel="noreferrer"
                          data-testid={`cq-pdf-${row.id}`}
                          className="w-8 h-8 rounded-full grid place-items-center hover:bg-brand-bg text-brand-navy/70"
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => startEdit(row)}
                          data-testid={`cq-edit-${row.id}`}
                          className="w-8 h-8 rounded-full grid place-items-center hover:bg-brand-bg text-brand-navy/70"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(row)}
                          data-testid={`cq-del-${row.id}`}
                          className="w-8 h-8 rounded-full grid place-items-center hover:bg-red-50 text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Editor drawer */}
      <AnimatePresence>
        {editing && (
          <QuoteEditor
            editing={editing}
            setEditing={setEditing}
            packages={packages}
            saving={saving}
            onSave={save}
            onCancel={cancelEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------- Helpers ----------------------

function computeGrand(q) {
  const area = Number(q.built_up_area) || 0;
  const rate = Number(q.price_per_sqft) || 0;
  const base = area * rate;
  const addonTotal = (q.addons || []).reduce(
    (s, a) => s + (Number(a.price) || 0),
    0
  );
  const lineTotal = (q.line_items || []).reduce(
    (s, l) => s + (Number(l.amount) || 0),
    0
  );
  const interiorsTotal = (q.interiors || []).reduce((s, cat) => {
    return s + (cat.items || []).reduce((ss, it) => {
      if (!it.include_in_total) return ss;
      const qty = Number(it.quantity) || 1;
      return ss + (Number(it.rate) || 0) * qty;
    }, 0);
  }, 0);
  const subtotal = base + addonTotal + lineTotal + interiorsTotal;
  const discount = Number(q.discount_amount) || 0;
  const net = Math.max(0, subtotal - discount);
  const svcPct = q.service_charge_percent != null ? Number(q.service_charge_percent) : 15;
  const svc = (net * svcPct) / 100;
  return net + svc;
}

function StatusBadge({ status }) {
  const map = {
    draft: "bg-brand-navy/10 text-brand-navy",
    sent: "bg-amber-100 text-amber-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-700",
  };
  const cls = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center rounded-full text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 ${cls}`}>
      {status || "draft"}
    </span>
  );
}

// ---------------------- Editor ----------------------

function QuoteEditor({ editing, setEditing, packages, saving, onSave, onCancel }) {
  const [aiMode, setAiMode] = useState(editing.ai_mode || "recommend");
  const [aiLoading, setAiLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [publicLink, setPublicLink] = useState(editing.public_token || null);
  const [savingTpl, setSavingTpl] = useState(false);
  const [showTplModal, setShowTplModal] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplDesc, setTplDesc] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const previewUrlRef = useRef(null);
  const set = (patch) => setEditing((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    adminApi.quoteTemplates.list().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  const _num = (v, dflt = 0) => {
    if (v === "" || v === null || v === undefined) return dflt;
    const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : dflt;
  };
  const _numOrNull = (v) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  };

  const buildPayload = useCallback((src) => ({
    ...src,
    plot_area: _numOrNull(src.plot_area),
    built_up_area: _num(src.built_up_area, 0),
    budget: _numOrNull(src.budget),
    price_per_sqft: _num(src.price_per_sqft, 0),
    discount_amount: _num(src.discount_amount, 0),
    service_charge_percent: _num(src.service_charge_percent, 15),
    gst_percent: _num(src.gst_percent, 0),
    warranty_years: Math.trunc(_num(src.warranty_years, 10)),
    valid_days: Math.trunc(_num(src.valid_days, 30)),
    addons: (src.addons || []).map((a) => ({ ...a, price: _num(a?.price, 0) })),
    line_items: (src.line_items || []).map((li) => ({ ...li, amount: _num(li?.amount, 0) })),
    payment_schedule: (src.payment_schedule || []).map((p) => ({ ...p, percentage: _num(p?.percentage, 0) })),
  }), []);

  useEffect(() => {
    if (!showPreview) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const payload = buildPayload(editing);
        const blob = await adminApi.customQuotes.previewPdf(payload);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        const previous = previewUrlRef.current;
        previewUrlRef.current = url;
        setPreviewUrl(url);
        if (previous) {
          setTimeout(() => URL.revokeObjectURL(previous), 500);
        }
      } catch (e) {
        if (cancelled) return;
        const detail = e?.response?.data;
        let msg = "Preview render failed";
        if (detail instanceof Blob) {
          try {
            const text = await detail.text();
            const parsed = JSON.parse(text);
            const d = parsed?.detail;
            if (typeof d === "string") msg = d;
            else if (Array.isArray(d) && d.length > 0) {
              msg = d.slice(0, 2).map((x) => {
                const path = Array.isArray(x?.loc) ? x.loc.filter((y) => y !== "body").join(" › ") : "";
                return path ? `${path}: ${x.msg}` : x.msg;
              }).join(" | ");
            }
          } catch { }
        } else if (typeof detail?.detail === "string") {
          msg = detail.detail;
        }
        setPreviewError(msg);
        console.error("[CustomQuotes] preview error", e);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showPreview, editing, buildPayload]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const pricing = useMemo(() => {
    const area = Number(editing.built_up_area) || 0;
    const rate = Number(editing.price_per_sqft) || 0;
    const base = area * rate;
    const addonTotal = (editing.addons || []).reduce((s, a) => s + (Number(a.price) || 0), 0);
    const lineTotal = (editing.line_items || []).reduce((s, l) => s + (Number(l.amount) || 0), 0);
    const interiorsTotal = (editing.interiors || []).reduce((s, cat) => {
      return s + (cat.items || []).reduce((ss, it) => {
        if (!it.include_in_total) return ss;
        const qty = Number(it.quantity) || 1;
        return ss + (Number(it.rate) || 0) * qty;
      }, 0);
    }, 0);
    const subtotal = base + addonTotal + lineTotal + interiorsTotal;
    const discount = Number(editing.discount_amount) || 0;
    const net = Math.max(0, subtotal - discount);
    const svcPct = editing.service_charge_percent != null ? Number(editing.service_charge_percent) : 15;
    const svcAmt = (net * svcPct) / 100;
    const grand = net + svcAmt;
    const budget = Number(editing.budget) || 0;
    const budgetDelta = budget > 0 ? grand - budget : null;
    return { base, addonTotal, lineTotal, interiorsTotal, subtotal, discount, net, svcAmt, svcPct, grand, budgetDelta };
  }, [editing]);

  const runAI = async () => {
    setAiLoading(true);
    try {
      const start = await adminApi.customQuotes.aiSuggest({
        mode: aiMode,
        built_up_area: Number(editing.built_up_area) || 1200,
        plot_area: Number(editing.plot_area) || null,
        floors: editing.floors,
        bhk: editing.bhk,
        budget: Number(editing.budget) || null,
        style_pref: editing.style_pref,
        package_slug: editing.package_slug || null,
        client_name: editing.client_name || null,
      });
      const jobId = start?.job_id;
      if (!jobId) throw new Error("Failed to start AI job");

      const started = Date.now();
      const MAX_MS = 3 * 60 * 1000;
      let suggestion = null;
      const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

      while (Date.now() - started < MAX_MS) {
        await sleep(2500);
        const status = await adminApi.customQuotes.aiSuggestStatus(jobId);
        if (status?.status === "done") {
          suggestion = status.result;
          break;
        }
        if (status?.status === "error") {
          throw new Error(status.error || "AI job failed");
        }
      }

      if (!suggestion) {
        throw new Error("AI is taking longer than expected. Please try again.");
      }

      setEditing((prev) => ({
        ...prev,
        package_name: suggestion.package_name || prev.package_name,
        price_per_sqft: suggestion.price_per_sqft || prev.price_per_sqft,
        spec_categories: suggestion.spec_categories?.length ? suggestion.spec_categories : prev.spec_categories,
        interiors: suggestion.interiors?.length ? suggestion.interiors : prev.interiors,
        addons: suggestion.addons || prev.addons,
        line_items: suggestion.line_items || prev.line_items,
        scope_of_work: suggestion.scope_of_work?.length ? suggestion.scope_of_work : prev.scope_of_work,
        exclusions: suggestion.exclusions?.length ? suggestion.exclusions : prev.exclusions,
        payment_schedule: suggestion.payment_schedule?.length ? suggestion.payment_schedule : prev.payment_schedule,
        warranty_years: suggestion.warranty_years || prev.warranty_years,
        service_charge_percent: suggestion.service_charge_percent ?? 15,
        gst_percent: 0,
        ai_notes: suggestion.ai_notes || "",
        ai_mode: aiMode,
      }));
      toast.success("AI draft applied — review & edit anything below.");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "AI suggestion failed";
      toast.error(typeof msg === "string" ? msg : "AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  const applyBasePackage = (slug) => {
    const pkg = packages.find((p) => p.slug === slug);
    if (!pkg) {
      set({ package_slug: "", package_name: "" });
      return;
    }
    set({
      package_slug: pkg.slug,
      package_name: pkg.name,
      price_per_sqft: pkg.price_per_sqft || editing.price_per_sqft,
      spec_categories: JSON.parse(JSON.stringify(pkg.spec_categories || [])),
      scope_of_work: [...(pkg.scope_of_work || [])],
      exclusions: [...(pkg.exclusions || [])],
      payment_schedule: JSON.parse(JSON.stringify(pkg.payment_schedule || [])),
      warranty_years: pkg.warranty_years || editing.warranty_years,
    });
    toast.success(`Loaded baseline from ${pkg.name}`);
  };

  const whatsappShare = () => {
    if (!editing.id) { toast.error("Save the quote first to generate a shareable link"); return; }
    if (!editing.client_phone) { toast.error("Add client phone number first"); return; }
    const digits = editing.client_phone.replace(/\D/g, "");
    if (!digits) { toast.error("Invalid phone number"); return; }
    const pdfUrl = adminApi.customQuotes.pdfUrl(editing.id);
    const msg = encodeURIComponent(
      `Hi ${editing.client_name || "there"},\n\n` +
      `Please find your customised home construction quotation from ConstructONS below:\n\n` +
      `Reference: ${editing.ref_number || ""}\n` +
      `Package: ${editing.package_name || "Custom Home"}\n` +
      `Built-up: ${editing.built_up_area} sq.ft\n` +
      `Total: ${rupees(pricing.grand)}\n\n` +
      `Full PDF: ${pdfUrl}\n\n` +
      `Feel free to reply with any questions. — ConstructONS`
    );
    window.open(`https://wa.me/${digits}?text=${msg}`, "_blank");
  };

  const emailShare = () => {
    if (!editing.id) { toast.error("Save the quote first to generate a shareable link"); return; }
    if (!editing.client_email) { toast.error("Add client email first"); return; }
    const pdfUrl = adminApi.customQuotes.pdfUrl(editing.id);
    const subject = encodeURIComponent(`Your ConstructONS Customised Quotation — ${editing.ref_number || ""}`);
    const body = encodeURIComponent(
      `Hi ${editing.client_name || "there"},\n\n` +
      `Please find your customised home construction quotation attached / linked below.\n\n` +
      `Reference: ${editing.ref_number || ""}\n` +
      `Package: ${editing.package_name || "Custom Home"}\n` +
      `Built-up: ${editing.built_up_area} sq.ft\n` +
      `Total: ${rupees(pricing.grand)}\n\n` +
      `Download PDF: ${pdfUrl}\n\n` +
      `Warm regards,\nConstructONS Sales Team`
    );
    window.location.href = `mailto:${editing.client_email}?subject=${subject}&body=${body}`;
  };

  const copyPdfLink = async () => {
    if (!editing.id) { toast.error("Save the quote first to generate a link"); return; }
    const link = adminApi.customQuotes.pdfUrl(editing.id);
    try {
      await navigator.clipboard.writeText(link);
      toast.success("PDF link copied to clipboard");
    } catch {
      toast.error("Copy failed — link: " + link);
    }
  };

  const generatePublicLink = async () => {
    if (!editing.id) { toast.error("Save the quote first"); return; }
    try {
      const data = await adminApi.customQuotes.getPublicLink(editing.id);
      setPublicLink(data.public_token);
      set({ public_token: data.public_token });
      toast.success("Public link ready");
    } catch {
      toast.error("Failed to generate public link");
    }
  };

  const copyPublicLink = async () => {
    if (!publicLink) return;
    const link = `${window.location.origin}/quote/${publicLink}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Public link copied — send to client");
    } catch {
      toast.error("Copy failed — link: " + link);
    }
  };

  const loadTemplate = (tplId) => {
    if (!tplId) return;
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    if (!window.confirm(`Load "${tpl.name}"? This will replace specs, pricing, scope, exclusions, schedule and terms.`)) return;
    set({
      price_per_sqft: tpl.price_per_sqft || editing.price_per_sqft,
      spec_categories: JSON.parse(JSON.stringify(tpl.spec_categories || [])),
      addons: JSON.parse(JSON.stringify(tpl.addons || [])),
      line_items: JSON.parse(JSON.stringify(tpl.line_items || [])),
      scope_of_work: [...(tpl.scope_of_work || [])],
      exclusions: [...(tpl.exclusions || [])],
      payment_schedule: JSON.parse(JSON.stringify(tpl.payment_schedule || [])),
      terms: tpl.terms || editing.terms,
      intro_note: tpl.intro_note || editing.intro_note,
      warranty_years: tpl.warranty_years || editing.warranty_years,
      gst_percent: tpl.gst_percent ?? editing.gst_percent,
    });
    toast.success(`Loaded template "${tpl.name}"`);
  };

  const saveAsTemplate = async () => {
    if (!editing.id) { toast.error("Save the quote first"); return; }
    if (!tplName.trim()) { toast.error("Template name is required"); return; }
    setSavingTpl(true);
    try {
      await adminApi.customQuotes.saveAsTemplate(editing.id, {
        name: tplName.trim(),
        description: tplDesc.trim(),
        tags: [],
      });
      toast.success("Saved as template");
      setShowTplModal(false);
      setTplName("");
      setTplDesc("");
      adminApi.quoteTemplates.list().then(setTemplates).catch(() => { });
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSavingTpl(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 bg-brand-navy/50 backdrop-blur-sm z-40"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className={`fixed inset-y-0 right-0 bg-brand-bg z-50 overflow-hidden shadow-2xl ${showPreview ? "w-full max-w-[1400px]" : "w-full max-w-4xl"}`}
        data-testid="cq-editor-drawer"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-black/5 px-5 md:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="min-w-0">
            <div className="section-eyebrow">
              {editing.id ? `Editing ${editing.ref_number || "Quote"}` : "New Custom Quote"}
            </div>
            <div className="font-bold text-brand-navy truncate">
              {editing.client_name || "Untitled Quote"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview((v) => !v)}
              data-testid="cq-toggle-preview"
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${showPreview ? "bg-brand-navy text-white" : "border border-black/10 bg-white text-brand-navy hover:bg-brand-bg"}`}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? "Hide Preview" : "Preview PDF"}
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              data-testid="cq-save-btn"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-2 text-sm font-semibold hover:brightness-95 transition disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={onCancel}
              className="w-9 h-9 rounded-full grid place-items-center hover:bg-brand-bg text-brand-navy cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={`flex ${showPreview ? "flex-row" : "flex-col"} h-[calc(100vh-73px)]`}>
          <div className={`${showPreview ? "w-1/2 border-r border-black/5" : "w-full"} overflow-y-auto px-5 md:px-8 py-6 space-y-6`}>
            
            {/* Share actions */}
            {editing.id && (
              <div className="rounded-2xl bg-white border border-black/5 p-4 flex flex-wrap items-center gap-2">
                <div className="text-xs text-brand-navy/60 mr-2 font-medium">Share this quote:</div>
                <a
                  href={adminApi.customQuotes.pdfUrl(editing.id)}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="cq-download-pdf"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-110"
                >
                  <FileDown className="w-3.5 h-3.5" /> Download PDF
                </a>
                <button
                  onClick={whatsappShare}
                  data-testid="cq-share-whatsapp"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-110"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  onClick={emailShare}
                  data-testid="cq-share-email"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-110"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  onClick={copyPdfLink}
                  data-testid="cq-copy-link"
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-bg"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </button>
                <button
                  onClick={() => setShowTplModal(true)}
                  data-testid="cq-save-as-template"
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-bg"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Save as Template
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <label className="text-xs text-brand-navy/60">Status</label>
                  <select
                    value={editing.status || "draft"}
                    onChange={(e) => set({ status: e.target.value })}
                    data-testid="cq-status-select"
                    className="rounded-lg border border-black/10 bg-white px-2 py-1 text-xs"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            )}

            {/* Public Link */}
            {editing.id && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 p-5" data-testid="cq-public-link-section">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 grid place-items-center shrink-0">
                    <LinkIcon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Client Portal</div>
                    <div className="font-bold text-brand-navy mt-0.5">
                      Shareable link — client can view, comment, accept or decline
                    </div>
                    {publicLink ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <code className="text-xs bg-white border border-black/10 rounded-lg px-3 py-1.5 text-brand-navy/80 break-all">
                          {`${window.location.origin}/quote/${publicLink}`}
                        </code>
                        <button
                          onClick={copyPublicLink}
                          data-testid="cq-copy-public-link"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-110"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </button>
                        <a
                          href={`/quote/${publicLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-navy hover:bg-brand-bg"
                        >
                          Open Preview
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={generatePublicLink}
                        data-testid="cq-generate-public-link"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:brightness-110"
                      >
                        <LinkIcon className="w-3.5 h-3.5" /> Generate Client Link
                      </button>
                    )}
                    {editing.client_action && (
                      <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        editing.client_action === "accepted" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        Client {editing.client_action} on {new Date(editing.client_action_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Template loader */}
            {templates.length > 0 && !editing.id && (
              <div className="rounded-2xl bg-white border border-black/5 p-4 flex flex-wrap items-center gap-2" data-testid="cq-template-loader">
                <BookOpen className="w-4 h-4 text-brand-orange" />
                <div className="text-sm font-semibold text-brand-navy">Start from template:</div>
                <select
                  onChange={(e) => { loadTemplate(e.target.value); e.target.value = ""; }}
                  data-testid="cq-load-template"
                  className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-sm"
                  defaultValue=""
                >
                  <option value="">— Pick a template —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} · {rupees(t.price_per_sqft)}/sqft</option>
                  ))}
                </select>
              </div>
            )}

            {/* Client Info */}
            <Section title="Client Details" testId="cq-section-client">
              <Grid>
                <Field label="Client Name *" testId="cq-field-name">
                  <input
                    value={editing.client_name || ""}
                    onChange={(e) => set({ client_name: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Rajesh Kumar"
                  />
                </Field>
                <Field label="Phone" testId="cq-field-phone">
                  <input
                    value={editing.client_phone || ""}
                    onChange={(e) => set({ client_phone: e.target.value })}
                    className={inputCls}
                    placeholder="+91 98765 43210"
                  />
                </Field>
                <Field label="Email" testId="cq-field-email">
                  <input
                    value={editing.client_email || ""}
                    onChange={(e) => set({ client_email: e.target.value })}
                    className={inputCls}
                    placeholder="rajesh@example.com"
                  />
                </Field>
                <Field label="Client Address" testId="cq-field-address">
                  <input
                    value={editing.client_address || ""}
                    onChange={(e) => set({ client_address: e.target.value })}
                    className={inputCls}
                    placeholder="Home / office address"
                  />
                </Field>
              </Grid>
            </Section>

            {/* Requirements */}
            <Section title="Client Requirements" testId="cq-section-req">
              <Grid>
                <Field label="Site Address" testId="cq-field-site">
                  <input
                    value={editing.site_address || ""}
                    onChange={(e) => set({ site_address: e.target.value })}
                    className={inputCls}
                    placeholder="Plot address"
                  />
                </Field>
                <Field label="Plot Area (sq.ft)" testId="cq-field-plot">
                  <input
                    type="number"
                    value={editing.plot_area || ""}
                    onChange={(e) => set({ plot_area: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 2400"
                  />
                </Field>
                <Field label="Built-up Area (sq.ft)" testId="cq-field-builtup">
                  <input
                    type="number"
                    value={editing.built_up_area || ""}
                    onChange={(e) => set({ built_up_area: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 1800"
                  />
                </Field>
                <Field label="Floors" testId="cq-field-floors">
                  <select
                    value={editing.floors || "G+1"}
                    onChange={(e) => set({ floors: e.target.value })}
                    className={inputCls}
                  >
                    {["G", "G+1", "G+2", "G+3", "G+4"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>
                <Field label="BHK" testId="cq-field-bhk">
                  <select
                    value={editing.bhk || "3 BHK"}
                    onChange={(e) => set({ bhk: e.target.value })}
                    className={inputCls}
                  >
                    {["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK", "Duplex", "Villa"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Budget (₹)" testId="cq-field-budget">
                  <input
                    type="number"
                    value={editing.budget || ""}
                    onChange={(e) => set({ budget: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. 3500000"
                  />
                </Field>
                <Field label="Style" testId="cq-field-style">
                  <select
                    value={editing.style_pref || "Modern"}
                    onChange={(e) => set({ style_pref: e.target.value })}
                    className={inputCls}
                  >
                    {["Modern", "Classic", "Contemporary", "Duplex", "Villa", "Farmhouse", "Traditional"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Expected Start" testId="cq-field-start">
                  <input
                    value={editing.expected_start || ""}
                    onChange={(e) => set({ expected_start: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Jan 2026"
                  />
                </Field>
                <Field label="Expected Completion" testId="cq-field-end">
                  <input
                    value={editing.expected_completion || ""}
                    onChange={(e) => set({ expected_completion: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Nov 2026"
                  />
                </Field>
              </Grid>
            </Section>

            {/* AI Panel */}
            <div className="rounded-2xl bg-gradient-to-br from-brand-navy to-[#152847] text-white p-5 md:p-6 shadow-lg" data-testid="cq-ai-panel">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/20 grid place-items-center shrink-0">
                  <Wand2 className="w-5 h-5 text-brand-orangeLight" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase tracking-widest text-brand-orangeLight">
                    AI Quote Assistant · Gemini Flash
                  </div>
                  <div className="font-bold text-lg mt-1">Generate a draft based on requirements</div>
                  <p className="text-sm text-white/70 mt-1">
                    Pick a mode — the AI will draft specs, addons, pricing, scope &amp; payment schedule.
                  </p>

                  <div className="mt-4 inline-flex rounded-full bg-white/10 p-1">
                    <button
                      onClick={() => setAiMode("recommend")}
                      data-testid="cq-ai-mode-recommend"
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${aiMode === "recommend" ? "bg-brand-orange text-white" : "text-white/70 hover:text-white"}`}
                    >
                      Recommend + tune
                    </button>
                    <button
                      onClick={() => setAiMode("scratch")}
                      data-testid="cq-ai-mode-scratch"
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${aiMode === "scratch" ? "bg-brand-orange text-white" : "text-white/70 hover:text-white"}`}
                    >
                      Build from scratch
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={runAI}
                      disabled={aiLoading}
                      data-testid="cq-ai-generate"
                      className="inline-flex items-center gap-2 rounded-full bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold hover:brightness-95 transition disabled:opacity-60"
                    >
                      {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      {aiLoading ? "Drafting..." : "Generate AI Draft"}
                    </button>
                    {editing.ai_notes && (
                      <div className="text-xs text-white/60 max-w-xl">
                        <span className="text-brand-orangeLight font-semibold">AI notes:</span> {editing.ai_notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Base package + spec editor */}
            <Section title="Base Package & Specs" testId="cq-section-specs" defaultOpen>
              <div className="mb-4">
                <Field label="Base Package (optional)" testId="cq-field-pkg">
                  <select
                    value={editing.package_slug || ""}
                    onChange={(e) => applyBasePackage(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— Custom, no base package —</option>
                    {packages.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} · ₹{p.price_per_sqft || "custom"}/sqft
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <SpecCategoryEditor
                categories={editing.spec_categories || []}
                onChange={(specs) => set({ spec_categories: specs })}
              />
            </Section>

            {/* Add-ons */}
            <Section title="Add-ons" testId="cq-section-addons">
              <AddOnEditor
                items={editing.addons || []}
                onChange={(addons) => set({ addons })}
              />
            </Section>

            {/* Interiors */}
            <Section title="Interior Fit-Out" testId="cq-section-interiors" defaultOpen>
              <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                <div className="text-xs text-brand-navy/60 flex-1 min-w-0">
                  Add interior items. Tick "Bill" to include rate × qty in the grand total.
                </div>
                <button
                  onClick={() => setShowLibraryPicker(true)}
                  data-testid="cq-open-library"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-3.5 py-1.5 text-xs font-semibold hover:brightness-95 cursor-pointer"
                >
                  <PackageOpen className="w-3.5 h-3.5" /> Add from Library
                </button>
              </div>
              <SpecCategoryEditor
                categories={editing.interiors || []}
                onChange={(interiors) => set({ interiors })}
                isInterior
              />
            </Section>

            {/* Material Specification */}
            <Section title="Material Specification" testId="cq-section-materials">
              <MaterialSpecEditor
                rows={editing.material_specs || []}
                onChange={(material_specs) => set({ material_specs })}
              />
            </Section>

            {/* Floor Plans */}
            <Section title="Floor Plans" testId="cq-section-floor-plans">
              <DrawingSheetsEditor
                sheets={editing.floor_plans || []}
                onChange={(floor_plans) => set({ floor_plans })}
                kind="floor-plan"
              />
            </Section>

            {/* Elevations */}
            <Section title="Elevations" testId="cq-section-elevations">
              <DrawingSheetsEditor
                sheets={editing.elevations || []}
                onChange={(elevations) => set({ elevations })}
                kind="elevation"
              />
            </Section>

            {/* Visual Boards */}
            <Section title="Visual Boards & AI Renders" testId="cq-section-visuals">
              <VisualBoardsEditor
                boards={editing.visual_boards || []}
                onChange={(visual_boards) => set({ visual_boards })}
              />
            </Section>

            {/* Custom line items */}
            <Section title="Custom Line Items" testId="cq-section-lines">
              <LineItemEditor
                items={editing.line_items || []}
                onChange={(line_items) => set({ line_items })}
              />
            </Section>

            {/* Pricing */}
            <Section title="Pricing" testId="cq-section-pricing" defaultOpen>
              <Grid>
                <Field label="Rate per sq.ft (₹)" testId="cq-field-rate">
                  <input
                    type="number"
                    value={editing.price_per_sqft || 0}
                    onChange={(e) => set({ price_per_sqft: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Discount Label" testId="cq-field-disc-label">
                  <input
                    value={editing.discount_label || ""}
                    onChange={(e) => set({ discount_label: e.target.value })}
                    className={inputCls}
                    placeholder="e.g. Festive Discount"
                  />
                </Field>
                <Field label="Discount Amount (₹)" testId="cq-field-disc-amt">
                  <input
                    type="number"
                    value={editing.discount_amount || 0}
                    onChange={(e) => set({ discount_amount: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Service Charge %" testId="cq-field-service">
                  <input
                    type="number"
                    value={editing.service_charge_percent ?? 15}
                    onChange={(e) => set({ service_charge_percent: e.target.value })}
                    className={inputCls}
                  />
                </Field>
                <Field label="Warranty (years)" testId="cq-field-warranty">
                  <input
                    type="number"
                    value={editing.warranty_years || 10}
                    onChange={(e) => set({ warranty_years: e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </Grid>

              <div className="mt-4 rounded-xl bg-brand-navy text-white p-4">
                <div className="text-xs uppercase tracking-widest text-brand-orangeLight">Live Pricing</div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <PriceLine label="Base build" value={pricing.base} />
                  <PriceLine label="Add-ons" value={pricing.addonTotal} />
                  <PriceLine label="Line items" value={pricing.lineTotal} />
                  <PriceLine label="Subtotal" value={pricing.subtotal} bold />
                  {pricing.discount > 0 && (
                    <PriceLine label="Discount" value={-pricing.discount} negative />
                  )}
                  <PriceLine label={`Service Charge (${pricing.svcPct}%)`} value={pricing.svcAmt} />
                </div>
                <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                  <div className="text-sm text-white/70">Grand Total</div>
                  <div className="text-2xl font-bold text-brand-orangeLight" data-testid="cq-grand-total">
                    {rupees(pricing.grand)}
                  </div>
                </div>
              </div>
            </Section>

            {/* Scope */}
            <Section title="Scope of Work" testId="cq-section-scope">
              <ListEditor
                items={editing.scope_of_work || []}
                onChange={(scope_of_work) => set({ scope_of_work })}
                placeholder="e.g. Structural design & drawings"
              />
            </Section>

            {/* Exclusions */}
            <Section title="Exclusions" testId="cq-section-excl">
              <ListEditor
                items={editing.exclusions || []}
                onChange={(exclusions) => set({ exclusions })}
                placeholder="e.g. Government approval fees"
              />
            </Section>

            {/* Payment Schedule */}
            <Section title="Payment Schedule" testId="cq-section-schedule">
              <ScheduleEditor
                items={editing.payment_schedule || []}
                onChange={(payment_schedule) => set({ payment_schedule })}
              />
            </Section>

            {/* Client Comments */}
            {editing.id && (editing.comments || []).length > 0 && (
              <Section title={`Client Comments (${editing.comments.length})`} testId="cq-section-comments" defaultOpen>
                <div className="space-y-3">
                  {editing.comments.map((c, i) => (
                    <div key={c.id || i} className={`p-3 rounded-xl border ${c.source === "client" ? "bg-emerald-50 border-emerald-100" : "bg-brand-bg/50 border-black/5"}`}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="font-semibold text-brand-navy text-sm inline-flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          {c.author || "Client"}
                        </div>
                        <div className="text-[10px] text-brand-navy/50">{new Date(c.created_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-brand-navy/80 whitespace-pre-wrap">{c.message}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Notes & Terms */}
            <Section title="Notes & Terms" testId="cq-section-notes">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">
                  Intro Note (top of PDF)
                </div>
                <RichTextEditor
                  value={editing.intro_note || ""}
                  onChange={(html) => set({ intro_note: html })}
                  placeholder="Personal note that appears on page 2 of the PDF"
                  minHeight={140}
                  data-testid="cq-field-intro-rte"
                />
              </div>
              <div className="mt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">
                  Terms &amp; Conditions (leave blank for default)
                </div>
                <RichTextEditor
                  value={editing.terms || ""}
                  onChange={(html) => set({ terms: html })}
                  placeholder="Override the default terms if needed"
                  minHeight={200}
                  data-testid="cq-field-terms-rte"
                />
              </div>
            </Section>

            <div className="pt-2 flex items-center gap-3 sticky bottom-0 bg-brand-bg py-4 z-10">
              <button
                onClick={onSave}
                disabled={saving}
                data-testid="cq-save-btn-bottom"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-5 py-2.5 text-sm font-semibold hover:brightness-95 transition disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Quote
              </button>
              <button
                onClick={onCancel}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-brand-navy hover:bg-brand-bg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* PDF Preview Column */}
          {showPreview && (
            <div className="w-1/2 bg-brand-navy/95 relative flex flex-col" data-testid="cq-preview-panel">
              <div className="p-3 flex items-center justify-between text-white text-xs">
                <div className="inline-flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-orange" />
                  <span className="font-semibold uppercase tracking-wider">Live PDF Preview</span>
                </div>
                <div className="inline-flex items-center gap-3">
                  {previewLoading && (
                    <div className="inline-flex items-center gap-1.5 text-brand-orangeLight" data-testid="cq-preview-loading">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rendering...
                    </div>
                  )}
                  {previewUrl && !previewLoading && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                      data-testid="cq-preview-open-new-tab"
                    >
                      Open in tab
                    </a>
                  )}
                </div>
              </div>
              {previewError && (
                <div className="mx-3 mb-2 rounded-lg bg-red-500/15 border border-red-400/30 px-3 py-2 text-[11px] text-red-100" data-testid="cq-preview-error">
                  <div className="font-semibold uppercase tracking-wider text-red-200 mb-0.5">Preview failed</div>
                  {previewError}
                </div>
              )}
              <div className="flex-1 bg-white">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-full border-0"
                    data-testid="cq-preview-iframe"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-brand-navy/40 text-sm">
                    {previewLoading ? "Building preview..." : (previewError ? "" : "Preview will appear here")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Template Modal */}
        {showTplModal && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[60] grid place-items-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6" data-testid="cq-template-modal">
              <div className="font-bold text-brand-navy text-lg inline-flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-orange" /> Save as Template
              </div>
              <p className="text-sm text-brand-navy/60 mt-1">
                Snapshot this quote's specs and details for future reuse.
              </p>
              <label className="block mt-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">Template Name *</div>
                <input
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  placeholder="e.g. 3BHK Modern G+1 Premium"
                  data-testid="cq-tpl-name-input"
                />
              </label>
              <label className="block mt-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">Description</div>
                <textarea
                  value={tplDesc}
                  onChange={(e) => setTplDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm resize-y"
                  placeholder="What this template is best for"
                />
              </label>
              <div className="mt-5 flex items-center gap-2 justify-end">
                <button
                  onClick={() => { setShowTplModal(false); setTplName(""); setTplDesc(""); }}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-brand-navy cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAsTemplate}
                  disabled={savingTpl}
                  data-testid="cq-tpl-save-confirm"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-5 py-2 text-sm font-semibold cursor-pointer"
                >
                  {savingTpl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interior Library Picker */}
        {showLibraryPicker && (
          <InteriorLibraryPicker
            onClose={() => setShowLibraryPicker(false)}
            onAdd={(items) => {
              const existing = [...(editing.interiors || [])];
              items.forEach((it) => {
                let cat = existing.find((c) => c.name === it.category);
                if (!cat) {
                  cat = { name: it.category, icon: null, items: [] };
                  existing.push(cat);
                }
                cat.items = [...(cat.items || []), {
                  spec: it.name,
                  value: it.description || "",
                  brand: it.brand || "",
                  warranty: it.warranty || "",
                  rate: it.rate || 0,
                  rate_unit: it.rate_unit || "",
                  notes: it.notes || "",
                  quantity: it.default_quantity || 1,
                  include_in_total: true,
                }];
              });
              set({ interiors: existing });
              setShowLibraryPicker(false);
              toast.success(`${items.length} item${items.length > 1 ? "s" : ""} added to Interior Fit-Out`);
            }}
          />
        )}
      </motion.div>
    </>
  );
}

// ---------------------- Sub-Editors & Helpers ----------------------

function Grid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>; }

function Field({ label, testId, children }) { return <label className="block" data-testid={testId}><div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60 mb-1.5">{label}</div>{children}</label>; }

function Section({ title, testId, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white border border-black/5 shadow-soft overflow-hidden" data-testid={testId}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-brand-bg/50 transition">
        <div className="font-semibold text-brand-navy">{title}</div>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function PriceLine({ label, value, bold, negative }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className={`${bold ? "text-lg font-bold" : "text-base"} ${negative ? "text-red-300" : ""}`}>{rupees(value)}</div>
    </div>
  );
}

function ListEditor({ items, onChange, placeholder }) {
  const add = () => onChange([...(items || []), ""]);
  const update = (i, v) => onChange((items || []).map((it, ii) => (ii === i ? v : it)));
  const remove = (i) => onChange((items || []).filter((_, ii) => ii !== i));

  return (
    <div className="space-y-2">
      {(items || []).map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={it}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
            placeholder={placeholder}
          />
          <button
            onClick={() => remove(i)}
            className="w-8 h-8 rounded-full grid place-items-center hover:bg-red-50 text-red-500"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold"
      >
        <Plus className="w-3.5 h-3.5" /> Add
      </button>
    </div>
  );
}

function ScheduleEditor({ items, onChange }) {
  const add = () =>
    onChange([...(items || []), { milestone: "", percentage: 0, description: "" }]);
  const update = (i, patch) => onChange((items || []).map((it, ii) => (ii === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange((items || []).filter((_, ii) => ii !== i));

  const total = (items || []).reduce((s, i) => s + (Number(i.percentage) || 0), 0);

  return (
    <div className="space-y-2">
      {(items || []).map((it, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <input
            value={it.milestone || ""}
            onChange={(e) => update(i, { milestone: e.target.value })}
            className="col-span-4 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
            placeholder="Milestone (e.g. Foundation)"
          />
          <input
            type="number"
            value={it.percentage || 0}
            onChange={(e) => update(i, { percentage: e.target.value })}
            className="col-span-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-bold"
            placeholder="%"
          />
          <input
            value={it.description || ""}
            onChange={(e) => update(i, { description: e.target.value })}
            className="col-span-5 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"
            placeholder="Description"
          />
          <button
            onClick={() => remove(i)}
            className="col-span-1 w-7 h-7 rounded-full grid place-items-center hover:bg-red-50 text-red-500 mx-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between text-xs text-brand-navy/60 pt-1">
        <span>Milestone total: {total.toFixed(0)}%</span>
        {Math.abs(total - 100) > 0.5 && total > 0 && (
          <span className="text-amber-600 font-semibold">Should sum to 100%</span>
        )}
      </div>
      <button
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold"
      >
        <Plus className="w-3.5 h-3.5" /> Add Milestone
      </button>
    </div>
  );
}

const DEFAULT_MATERIAL_ROWS = [
  { category: "Structure", item: "Cement", brand_grade: "UltraTech / Ambuja (OPC 43 Grade)", notes: "Base Price - Rs. 410 / bag" },
  { category: "Structure", item: "Steel/TMT Bars", brand_grade: "SK Super / JSW Neosteel Fe-550D", notes: "Base Price - Rs. 65,000 / MT" },
  { category: "Structure", item: "Cement Blocks", brand_grade: "Hydraulic Compressed", notes: "Base Price - Rs. 40 / Block" },
  { category: "Flooring", item: "Living/Bedroom Tiles", brand_grade: "Kajaria / Somany, 2x2 ft Vitrified", notes: "Base Price - Rs. 55 / Sft" },
  { category: "Flooring", item: "Bathroom Tiles", brand_grade: "Kajaria / Somany, Anti-skid", notes: "Base Price - Rs. 45 / Sft" },
  { category: "Kitchen", item: "Modular Kitchen", brand_grade: "Sleek / Godrej Interio, Marine Ply", notes: "Base Price - Rs. 45 / Sft" },
  { category: "Kitchen", item: "Kitchen Countertop", brand_grade: "Granite (standard)", notes: "Base Price - Rs. 80 / Sft" },
  { category: "Kitchen", item: "Wall Dado", brand_grade: "Kajaria / Somany, 2x2 ft Vitrified", notes: "Base Price - Rs. 40 / Sft" },
  { category: "Kitchen", item: "Sink", brand_grade: "SS 304 Grade", notes: "Base Price - Rs. 3000 / Sink" },
  { category: "Doors & Windows", item: "Main Door", brand_grade: "Teak flush shutter, teak frame", notes: "Base Price - Rs. 4500 / Cft" },
  { category: "Doors & Windows", item: "Windows", brand_grade: "Fenesta / Encraft UPVC", notes: "Base Price - Rs. 300 / Sft" },
  { category: "Bath Fittings", item: "Sanitaryware", brand_grade: "Cera / Parryware", notes: "Base Price - Rs. 10000 / Bathroom" },
  { category: "Bath Fittings", item: "CP Fittings (taps, showers)", brand_grade: "Jaquar (standard range)", notes: "Base Price - Rs. 3000 / Bathroom" },
  { category: "Bath Tiles", item: "Wall + Floor Tiles", brand_grade: "Kajaria / Somany, 2x2 ft Vitrified", notes: "Base Price - Rs. 45 / Sft" },
  { category: "Electrical", item: "Wiring", brand_grade: "Havells / Finolex, ISI copper", notes: "" },
  { category: "Electrical", item: "Switches", brand_grade: "Legrand / Havells (modular)", notes: "" },
  { category: "Paint", item: "Interior", brand_grade: "Asian Paints Premium Emulsion", notes: "" },
  { category: "Paint", item: "Exterior", brand_grade: "Asian Paints Apex Weatherproof", notes: "" },
  { category: "Waterproofing", item: "Terrace", brand_grade: "Dr. Fixit system / equivalent", notes: "10-year warranty system available" },
];

function MaterialSpecEditor({ rows, onChange }) {
  const list = rows || [];
  const add = () =>
    onChange([...list, { category: "", item: "", brand_grade: "", notes: "" }]);
  const update = (i, patch) =>
    onChange(list.map((r, ii) => (ii === i ? { ...r, ...patch } : r)));
  const remove = (i) => onChange(list.filter((_, ii) => ii !== i));
  const loadDefaults = () => {
    if (list.length > 0 && !window.confirm("Replace current material specs with the standard 19-row template?")) return;
    onChange(DEFAULT_MATERIAL_ROWS.map((r) => ({ ...r })));
  };
  const clearAll = () => {
    if (!window.confirm("Remove all material spec rows?")) return;
    onChange([]);
  };

  return (
    <div className="space-y-2" data-testid="cq-material-editor">
      {list.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-black/15 text-center text-xs text-brand-navy/60">
          No material specs yet. Load the standard 19-row template or add rows one-by-one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10">
          <table className="w-full text-xs">
            <thead className="bg-brand-navy text-white">
              <tr>
                <th className="text-left px-2 py-2 font-semibold w-[18%]">Category</th>
                <th className="text-left px-2 py-2 font-semibold w-[22%]">Item</th>
                <th className="text-left px-2 py-2 font-semibold w-[30%]">Standard Included Brand/Grade</th>
                <th className="text-left px-2 py-2 font-semibold w-[26%]">Notes</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black/5">
              {list.map((r, i) => (
                <tr key={i} className="hover:bg-brand-bg/40">
                  <td className="px-1.5 py-1.5">
                    <input
                      value={r.category || ""}
                      onChange={(e) => update(i, { category: e.target.value })}
                      className="w-full rounded border border-black/10 bg-white px-2 py-1 text-xs"
                      placeholder="Structure"
                    />
                  </td>
                  <td className="px-1.5 py-1.5">
                    <input
                      value={r.item || ""}
                      onChange={(e) => update(i, { item: e.target.value })}
                      className="w-full rounded border border-black/10 bg-white px-2 py-1 text-xs"
                      placeholder="Cement"
                    />
                  </td>
                  <td className="px-1.5 py-1.5">
                    <input
                      value={r.brand_grade || ""}
                      onChange={(e) => update(i, { brand_grade: e.target.value })}
                      className="w-full rounded border border-black/10 bg-white px-2 py-1 text-xs"
                      placeholder="UltraTech / Ambuja"
                    />
                  </td>
                  <td className="px-1.5 py-1.5">
                    <input
                      value={r.notes || ""}
                      onChange={(e) => update(i, { notes: e.target.value })}
                      className="w-full rounded border border-black/10 bg-white px-2 py-1 text-xs italic"
                      placeholder="Base Price - Rs. 410 / bag"
                    />
                  </td>
                  <td className="px-1 py-1.5 align-middle">
                    <button
                      onClick={() => remove(i)}
                      className="w-7 h-7 rounded-full grid place-items-center hover:bg-red-50 text-red-500 mx-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Add Row
        </button>
        <button
          onClick={loadDefaults}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-navy/15 bg-white text-brand-navy px-4 py-1.5 text-xs font-semibold hover:bg-brand-navy/5"
          type="button"
        >
          Load Standard Template (19 rows)
        </button>
        {list.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white text-red-600 px-4 py-1.5 text-xs font-semibold hover:bg-red-50"
            type="button"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function DrawingSheetsEditor({ sheets, onChange, kind }) {
  const [uploading, setUploading] = useState(null);
  const addSheet = () =>
    onChange([...(sheets || []), {
      id: crypto.randomUUID?.() || String(Date.now()),
      title: kind === "floor-plan" ? `Floor Plan ${(sheets || []).length + 1}` : `Elevation ${(sheets || []).length + 1}`,
      image_url: "",
      sheet_number: (sheets || []).length + 1,
      units: "mm",
      scale: "1:100",
      drawn_by: "ConstructONS",
      north_direction: "N",
      notes: "",
      current_revision: "A",
      revisions: [{
        id: crypto.randomUUID?.() || String(Date.now()),
        letter: "A",
        date: new Date().toISOString().slice(0, 10),
        note: "Initial issue",
      }],
    }]);
  const updateSheet = (i, patch) => onChange((sheets || []).map((s, ii) => (ii === i ? { ...s, ...patch } : s)));
  const removeSheet = (i) => onChange((sheets || []).filter((_, ii) => ii !== i));

  const upload = async (i, file) => {
    if (!file) return;
    setUploading(i);
    try {
      const res = await adminApi.uploadImage(file, `quote-${kind}`);
      updateSheet(i, { image_url: res.url });
      toast.success("Uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-3">
      {(sheets || []).map((s, i) => (
        <div key={s.id || i} className="rounded-xl border border-black/10 bg-white overflow-hidden">
          <div className="grid grid-cols-12 gap-3 p-3 items-start">
            <div className="col-span-4">
              {s.image_url ? (
                <div className="relative">
                  <img src={s.image_url.startsWith("http") ? s.image_url : `${window.location.origin}${s.image_url}`} alt={s.title} className="w-full h-40 object-contain bg-brand-bg rounded-lg" />
                  <button onClick={() => updateSheet(i, { image_url: "" })} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 grid place-items-center text-red-500 hover:bg-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <label className="w-full h-40 rounded-lg border-2 border-dashed border-black/15 grid place-items-center cursor-pointer hover:border-brand-orange text-brand-navy/50 text-xs bg-brand-bg/30">
                  {uploading === i ? <Loader2 className="w-5 h-5 animate-spin text-brand-orange" /> : <span>Click to upload drawing</span>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(i, e.target.files?.[0])} />
                </label>
              )}
            </div>
            <div className="col-span-8 grid grid-cols-2 gap-2">
              <input value={s.title || ""} onChange={(e) => updateSheet(i, { title: e.target.value })} className="col-span-2 rounded border border-black/10 bg-white px-2 py-1.5 text-sm font-semibold" placeholder="Sheet title" />
              <input value={s.sheet_number || ""} onChange={(e) => updateSheet(i, { sheet_number: e.target.value })} className="rounded border border-black/10 bg-white px-2 py-1.5 text-xs" placeholder="Sheet No." />
              <input value={s.scale || ""} onChange={(e) => updateSheet(i, { scale: e.target.value })} className="rounded border border-black/10 bg-white px-2 py-1.5 text-xs" placeholder="Scale (e.g. 1:100)" />
            </div>
          </div>
          <div className="px-3 py-2 border-t border-black/5 flex items-center justify-end">
            <button onClick={() => removeSheet(i)} className="text-xs text-red-500 hover:underline">Remove sheet</button>
          </div>
        </div>
      ))}
      <button onClick={addSheet} className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold">
        <Plus className="w-3.5 h-3.5" /> Add {kind === "floor-plan" ? "Floor Plan" : "Elevation"} Sheet
      </button>
    </div>
  );
}

function VisualBoardsEditor({ boards, onChange }) {
  const [uploading, setUploading] = useState(null);

  const addBoard = () =>
    onChange([...(boards || []), {
      id: crypto.randomUUID?.() || String(Date.now()),
      title: `Visual Board ${(boards || []).length + 1}`,
      description: "",
      images: [],
    }]);
  const updateBoard = (i, patch) => onChange((boards || []).map((b, ii) => (ii === i ? { ...b, ...patch } : b)));
  const removeBoard = (i) => onChange((boards || []).filter((_, ii) => ii !== i));

  const addImageFromUpload = async (bi, file) => {
    if (!file) return;
    setUploading(`${bi}`);
    try {
      const res = await adminApi.uploadImage(file, "quote-visuals");
      updateBoard(bi, {
        images: [...(boards[bi].images || []), { id: crypto.randomUUID?.() || String(Date.now()), url: res.url, caption: "" }],
      });
      toast.success("Uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      {(boards || []).map((b, bi) => (
        <div key={b.id || bi} className="rounded-xl border border-black/10 bg-white overflow-hidden">
          <div className="p-3 border-b border-black/5 flex items-center gap-2">
            <input value={b.title || ""} onChange={(e) => updateBoard(bi, { title: e.target.value })} className="flex-1 font-semibold text-brand-navy bg-transparent focus:outline-none" placeholder="Board title" />
            <button onClick={() => removeBoard(bi)} className="w-7 h-7 rounded-full grid place-items-center hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-3 space-y-3">
            <label className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-3.5 py-1.5 text-xs font-semibold cursor-pointer hover:brightness-110">
              {uploading === `${bi}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => addImageFromUpload(bi, e.target.files?.[0])} />
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(b.images || []).map((img, ii) => (
                <div key={img.id || ii} className="relative group">
                  <img src={img.url.startsWith("http") ? img.url : `${window.location.origin}${img.url}`} alt={img.caption || ""} className="w-full h-28 object-cover rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button onClick={addBoard} className="inline-flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold">
        <Plus className="w-3.5 h-3.5" /> Add Visual Board
      </button>
    </div>
  );
}

function SpecCategoryEditor({ categories, onChange, isInterior = false }) {
  const addCat = () => onChange([...(categories || []), { name: "New Category", icon: null, items: [] }]);
  const updateCat = (idx, patch) => onChange((categories || []).map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  const removeCat = (idx) => onChange((categories || []).filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {(categories || []).map((cat, ci) => (
        <div key={ci} className="rounded-xl border border-black/10 bg-brand-bg/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <input value={cat.name || ""} onChange={(e) => updateCat(ci, { name: e.target.value })} className="flex-1 font-semibold text-brand-navy bg-transparent" />
            <button onClick={() => removeCat(ci)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      ))}
      <button onClick={addCat} className="rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold"><Plus className="w-3.5 h-3.5 inline mr-1" /> Add Category</button>
    </div>
  );
}

function AddOnEditor({ items, onChange }) {
  const add = () => onChange([...(items || []), { name: "", description: "", price: 0, unit: "" }]);
  const update = (i, patch) => onChange((items || []).map((it, ii) => (ii === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange((items || []).filter((_, ii) => ii !== i));

  return (
    <div className="space-y-2">
      {(items || []).map((it, i) => (
        <div key={i} className="flex gap-2">
          <input value={it.name || ""} onChange={(e) => update(i, { name: e.target.value })} className="rounded border px-2 py-1 text-xs flex-1" placeholder="Addon name" />
          <input type="number" value={it.price || 0} onChange={(e) => update(i, { price: e.target.value })} className="rounded border px-2 py-1 text-xs w-24" placeholder="Price" />
          <button onClick={() => remove(i)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={add} className="rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold"><Plus className="w-3.5 h-3.5 inline mr-1" /> Add Add-on</button>
    </div>
  );
}

function LineItemEditor({ items, onChange }) {
  const add = () => onChange([...(items || []), { name: "", description: "", amount: 0 }]);
  const update = (i, patch) => onChange((items || []).map((it, ii) => (ii === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange((items || []).filter((_, ii) => ii !== i));

  return (
    <div className="space-y-2">
      {(items || []).map((it, i) => (
        <div key={i} className="flex gap-2">
          <input value={it.name || ""} onChange={(e) => update(i, { name: e.target.value })} className="rounded border px-2 py-1 text-xs flex-1" placeholder="Line item" />
          <input type="number" value={it.amount || 0} onChange={(e) => update(i, { amount: e.target.value })} className="rounded border px-2 py-1 text-xs w-24" placeholder="Amount" />
          <button onClick={() => remove(i)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      <button onClick={add} className="rounded-full bg-brand-navy text-white px-4 py-1.5 text-xs font-semibold"><Plus className="w-3.5 h-3.5 inline mr-1" /> Add Line Item</button>
    </div>
  );
}

function InteriorLibraryPicker({ onClose, onAdd }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.interiorLibrary.categories().then((cats) => setCategories(cats || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    adminApi.interiorLibrary.list({ category: activeCat || undefined, q: query || undefined })
      .then((data) => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [activeCat, query]);

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectedItems = useMemo(
    () => items.filter((it) => selected[it.id]),
    [items, selected]
  );

  return (
    <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[60] grid place-items-center p-4 font-['Poppins']">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <div className="font-bold text-brand-navy text-lg flex items-center gap-2">
            <PackageOpen className="w-5 h-5 text-brand-orange" /> Pick Interior Items
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full grid place-items-center hover:bg-brand-bg text-brand-navy"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 border-b border-black/5 flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-full border border-black/10 px-4 py-2 text-sm" placeholder="Search items..." />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand-orange" /></div> :
            items.map((it) => (
              <div key={it.id} onClick={() => toggle(it.id)} className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${selected[it.id] ? "border-brand-orange bg-brand-orange/5" : "border-black/10 bg-white"}`}>
                <div>
                  <div className="font-bold text-sm text-brand-navy">{it.name}</div>
                  <div className="text-xs text-brand-navy/60">{it.category} • ₹{it.rate}</div>
                </div>
                <input type="checkbox" checked={!!selected[it.id]} readOnly className="accent-brand-orange w-4 h-4" />
              </div>
            ))
          }
        </div>

        <div className="p-4 border-t border-black/5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-full text-xs font-bold">Cancel</button>
          <button onClick={() => { onAdd(selectedItems); onClose(); }} disabled={selectedItems.length === 0} className="px-5 py-2 bg-brand-orange text-white rounded-full text-xs font-bold disabled:opacity-50">
            Add {selectedItems.length} Items
          </button>
        </div>
      </div>
    </div>
  );
}