"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Check,
  ChevronDown,
  ShieldCheck,
  Layers,
} from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";
import { useBrochureModal } from "@/components/site/BrochureModalProvider";
import { useLeadModal } from "@/components/site/LeadModalProvider";

/* ──────────────────────────────────────────────────────────────
   Brand pill — Uses /logo.webp directly with ConstructONS branding
────────────────────────────────────────────────────────────── */
function BrandPill({ size = "md", label = "Compare" }) {
  const sizes = {
    sm: { pill: "px-3 py-1.5 text-[11px] gap-1.5", img: "w-4 h-4" },
    md: { pill: "px-4 py-2 text-xs gap-2", img: "w-5 h-5" },
  }[size];

  return (
    <div
      className={`inline-flex items-center rounded-full bg-[#000F1B] shadow-[0_10px_30px_rgba(0,15,27,0.25)] border border-white/5 ${sizes.pill}`}
    >
      <img
        src="/logo.webp"
        alt="ConstructONS Logo"
        className={`${sizes.img} object-contain`}
      />
      <span className="font-bold tracking-tight text-white flex items-center">
        Construct
        <span className="text-[#E04F00] inline-flex items-center justify-center align-middle mx-[1px]" style={{ transform: "translateY(-1px)" }}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <path d="M12 2v9" />
            <path d="M5.64 5.64a9 9 0 1 0 12.72 0" />
          </svg>
        </span>
        NS
      </span>
      {label && (
        <>
          <span className="text-white/30 mx-0.5">·</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
            {label}
          </span>
        </>
      )}
    </div>
  );
}

export default function PackagesComparePage() {
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [openCats, setOpenCats] = useState({});
  const { open: openBrochure } = useBrochureModal();
  const { open: openLead } = useLeadModal();

  useEffect(() => {
    publicApi.comparePackages().then(setData).catch(() => setData(null));
    publicApi.getSiteSettings().then(setSettings).catch(() => {});
    window.scrollTo(0, 0);
  }, []);

  // Expand all categories by default once data loads
  useEffect(() => {
    if (!data?.category_order) return;
    const init = {};
    data.category_order.forEach((c) => {
      init[c] = true;
    });
    setOpenCats(init);
  }, [data]);

  // Extract variables with fallbacks before calling useMemo
  const packages = useMemo(() => data?.packages || [], [data]);
  const category_order = useMemo(() => data?.category_order || [], [data]);

  // Union of item labels per category (called unconditionally before early return)
  const categoryItems = useMemo(() => {
    const out = {};
    category_order.forEach((cn) => {
      const set = [];
      const seen = new Set();
      packages.forEach((p) => {
        const cat = (p.spec_categories || []).find((c) => c.name === cn);
        (cat?.items || []).forEach((it) => {
          const k = (it.spec || "").toLowerCase();
          if (k && !seen.has(k)) {
            seen.add(k);
            set.push(it.spec);
          }
        });
      });
      out[cn] = set;
    });
    return out;
  }, [packages, category_order]);

  // Conditional early return comes AFTER all Hooks are defined
  if (!data) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] grid place-items-center font-['Poppins',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF5A00] border-t-transparent animate-spin" />
          <div className="text-xs uppercase tracking-widest text-[#000F1B]/50">
            Loading comparison
          </div>
        </div>
      </div>
    );
  }

  const findItem = (pkg, catName, itemLabel) => {
    const cat = (pkg.spec_categories || []).find((c) => c.name === catName);
    if (!cat) return null;
    return (cat.items || []).find(
      (i) => (i.spec || "").toLowerCase() === (itemLabel || "").toLowerCase()
    );
  };

  const toggleCat = (cn) =>
    setOpenCats((s) => ({ ...s, [cn]: !s[cn] }));

  const expandAll = () => {
    const init = {};
    category_order.forEach((c) => {
      init[c] = true;
    });
    setOpenCats(init);
  };

  const collapseAll = () => {
    const init = {};
    category_order.forEach((c) => {
      init[c] = false;
    });
    setOpenCats(init);
  };

  return (
    <div className="bg-[#FBF9F6] font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white min-h-screen">
      <Header />

      <main className="pt-24 pb-20">
        {/* ═════════════ HERO ═════════════ */}
        <section className="relative overflow-hidden border-b border-black/5">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FBF9F6] to-[#FBF9F6]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #000F1B 0.7px, transparent 0.8px)",
              backgroundSize: "14px 14px",
            }}
          />

          <div className="container-wide relative z-10 py-10 md:py-14">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="max-w-2xl">
                <Link
                  to="/#packages"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#000F1B]/50 hover:text-[#FF5A00] transition mb-5 group"
                >
                  <span className="w-7 h-7 rounded-full bg-white border border-black/5 grid place-items-center group-hover:border-[#FF5A00]/30 transition">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                  All packages
                </Link>

                <div className="mb-4">
                  <BrandPill label="Compare" />
                </div>

                <h1 className="text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.05] tracking-tight">
                  Compare every tier.
                  <br />
                  <span className="text-[#FF5A00] italic">Side by side.</span>
                </h1>

                <p className="mt-4 text-[#000F1B]/60 text-sm md:text-base max-w-xl leading-relaxed">
                  Materials, brands and finishes across every category — so you
                  know exactly what you get before you build.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-xs font-semibold text-[#000F1B]/60 hover:text-[#FF5A00] px-3 py-2 rounded-full border border-black/10 bg-white transition"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-xs font-semibold text-[#000F1B]/60 hover:text-[#FF5A00] px-3 py-2 rounded-full border border-black/10 bg-white transition"
                >
                  Collapse all
                </button>
                <button
                  type="button"
                  onClick={() => openLead({ source: "packages-compare" })}
                  className="inline-flex items-center gap-2 rounded-full bg-[#000F1B] hover:bg-[#FF5A00] text-white text-xs font-semibold px-5 py-2.5 transition"
                >
                  Talk to expert <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tier summary chips */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {packages.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`relative rounded-sm border p-4 ${
                    p.is_most_popular
                      ? "bg-[#000F1B] border-[#000F1B] text-white shadow-[0_16px_40px_-20px_rgba(0,15,27,0.5)]"
                      : "bg-white/80 backdrop-blur border-black/10 text-[#000F1B]"
                  }`}
                >
                  {p.is_most_popular && (
                    <div className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-[#FF5A00] text-white text-[8px] font-bold uppercase tracking-widest">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      p.is_most_popular ? "text-[#FF8A4C]" : "text-[#FF5A00]"
                    }`}
                  >
                    {p.tagline || p.tier}
                  </div>
                  <div className="mt-1 font-bold text-lg leading-tight">
                    {p.name?.replace(" Package", "")}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span
                      className={`text-2xl font-black tracking-tight ${
                        p.is_most_popular ? "text-white" : "text-[#000F1B]"
                      }`}
                    >
                      {p.price_display}
                    </span>
                    {p.price_unit && (
                      <span
                        className={`text-xs ${
                          p.is_most_popular ? "text-white/50" : "text-[#000F1B]/45"
                        }`}
                      >
                        {p.price_unit}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════ COMPARISON TABLE ═════════════ */}
        <section className="container-wide mt-8 md:mt-10">
          <div className="rounded-sm bg-white border border-black/10 shadow-[0_20px_50px_-30px_rgba(0,15,27,0.15)] overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse text-sm min-w-[960px]"
                data-testid="compare-table"
              >
                {/* Sticky header */}
                <thead>
                  <tr>
                    <th className="text-left align-bottom p-0 sticky left-0 z-30 bg-white border-b border-black/10 w-[200px] lg:w-[240px]">
                      <div className="p-4 lg:p-5">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#000F1B]/40">
                          Spec / Item
                        </div>
                        <div className="mt-1 text-xs text-[#000F1B]/55 font-medium">
                          {packages.length} packages · {category_order.length} categories
                        </div>
                      </div>
                    </th>

                    {packages.map((p) => (
                      <th
                        key={p.id}
                        className={`text-left align-bottom p-0 border-b border-l border-black/10 w-[180px] lg:w-[200px] sticky top-0 z-20 ${
                          p.is_most_popular
                            ? "bg-[#000F1B] text-white"
                            : "bg-[#FBF9F6]"
                        }`}
                      >
                        <div className="p-4 lg:p-5 relative">
                          {p.is_most_popular && (
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FF5A00]" />
                          )}

                          <div
                            className={`text-[9px] font-bold uppercase tracking-[0.16em] mb-1 ${
                              p.is_most_popular ? "text-[#FF8A4C]" : "text-[#FF5A00]"
                            }`}
                          >
                            {p.is_most_popular ? "Most Popular" : p.tier || "Package"}
                          </div>

                          <div
                            className={`font-bold text-base leading-tight ${
                              p.is_most_popular ? "text-white" : "text-[#000F1B]"
                            }`}
                          >
                            {p.name}
                          </div>

                          <div className="mt-2 flex items-baseline gap-1">
                            <span
                              className={`text-xl font-black tracking-tight ${
                                p.is_most_popular ? "text-white" : "text-[#000F1B]"
                              }`}
                            >
                              {p.price_display}
                            </span>
                            {p.price_unit && (
                              <span
                                className={`text-[10px] ${
                                  p.is_most_popular ? "text-white/50" : "text-[#000F1B]/45"
                                }`}
                              >
                                {p.price_unit}
                              </span>
                            )}
                          </div>

                          {p.tagline && (
                            <div
                              className={`mt-1 text-[11px] ${
                                p.is_most_popular ? "text-white/60" : "text-[#000F1B]/55"
                              }`}
                            >
                              {p.tagline}
                            </div>
                          )}

                          <div className="mt-4 flex flex-col gap-1.5">
                            <Link
                              to={`/packages/${p.slug}`}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-full text-[11px] font-bold px-3 py-2 transition ${
                                p.is_most_popular
                                  ? "bg-[#FF5A00] text-white hover:bg-[#E04F00]"
                                  : "bg-[#000F1B] text-white hover:bg-[#FF5A00]"
                              }`}
                            >
                              View details <ArrowRight className="w-3 h-3" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openBrochure(p.slug, p.name)}
                              className={`inline-flex items-center justify-center gap-1.5 rounded-full text-[11px] font-semibold px-3 py-1.5 border transition ${
                                p.is_most_popular
                                  ? "border-white/20 text-white/80 hover:bg-white/10"
                                  : "border-black/10 text-[#000F1B]/70 hover:border-[#000F1B]/30"
                              }`}
                            >
                              <Download className="w-3 h-3" /> Brochure
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {category_order.map((cat, catIdx) => {
                    const items = categoryItems[cat] || [];
                    if (!items.length) return null;
                    const isOpen = openCats[cat] !== false;

                    return (
                      <React.Fragment key={cat}>
                        {/* Category header row */}
                        <tr className="bg-[#F4F2EE]">
                          <td
                            colSpan={packages.length + 1}
                            className="p-0 border-t border-black/5 sticky left-0"
                          >
                            <button
                              type="button"
                              onClick={() => toggleCat(cat)}
                              className="w-full flex items-center justify-between gap-3 px-4 lg:px-5 py-3 text-left hover:bg-[#EFECE6] transition"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-[#000F1B] text-white grid place-items-center text-[10px] font-bold">
                                  {String(catIdx + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#000F1B]">
                                  {cat}
                                </span>
                                <span className="text-[10px] text-[#000F1B]/40 font-medium">
                                  {items.length} items
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-[#000F1B]/50 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </td>
                        </tr>

                        {/* Spec rows */}
                        <AnimatePresence initial={false}>
                          {isOpen &&
                            items.map((label) => (
                              <motion.tr
                                key={cat + label}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="group hover:bg-[#FFF8F3]/80 transition-colors"
                              >
                                <td className="px-4 lg:px-5 py-3.5 border-t border-black/5 align-top sticky left-0 bg-white group-hover:bg-[#FFF8F3] z-10 w-[200px] lg:w-[240px]">
                                  <div className="font-semibold text-[#000F1B]/85 text-xs leading-snug">
                                    {label}
                                  </div>
                                </td>

                                {packages.map((p) => {
                                  const it = findItem(p, cat, label);
                                  const isPop = p.is_most_popular;
                                  return (
                                    <td
                                      key={p.id + cat + label}
                                      className={`px-4 lg:px-5 py-3.5 border-t border-l border-black/5 align-top text-xs ${
                                        isPop ? "bg-[#FAFAFA] group-hover:bg-[#FFF5EE]" : ""
                                      }`}
                                    >
                                      {it ? (
                                        <div>
                                          <div className="text-[#000F1B]/90 leading-snug font-medium">
                                            {it.value || "—"}
                                          </div>
                                          {it.brand && (
                                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#000F1B]/50">
                                              <span className="w-1 h-1 rounded-full bg-[#FF5A00]" />
                                              {it.brand}
                                            </div>
                                          )}
                                          {it.warranty && (
                                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-emerald-700">
                                              <ShieldCheck className="w-3 h-3" />
                                              {it.warranty}
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-[#000F1B]/25 font-medium">—</div>
                                      )}
                                    </td>
                                  );
                                })}
                              </motion.tr>
                            ))}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}

                  {/* Highlights row if packages have highlights */}
                  {packages.some((p) => p.highlights?.length) && (
                    <>
                      <tr className="bg-[#F4F2EE]">
                        <td
                          colSpan={packages.length + 1}
                          className="px-4 lg:px-5 py-3 border-t border-black/5"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-[#FF5A00] text-white grid place-items-center">
                              <Layers className="w-3 h-3" />
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#000F1B]">
                              Key Highlights
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 lg:px-5 py-4 border-t border-black/5 sticky left-0 bg-white align-top text-xs font-semibold text-[#000F1B]/70">
                          What stands out
                        </td>
                        {packages.map((p) => (
                          <td
                            key={`hl-${p.id}`}
                            className={`px-4 lg:px-5 py-4 border-t border-l border-black/5 align-top ${
                              p.is_most_popular ? "bg-[#FAFAFA]" : ""
                            }`}
                          >
                            <ul className="space-y-2">
                              {(p.highlights || []).slice(0, 4).map((h, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-xs text-[#000F1B]/80"
                                >
                                  <Check className="w-3.5 h-3.5 text-[#FF5A00] shrink-0 mt-0.5" strokeWidth={3} />
                                  <span className="leading-snug">{h}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile hint */}
          <p className="mt-3 text-center text-[11px] text-[#000F1B]/40 font-medium lg:hidden">
            Swipe horizontally to compare all packages →
          </p>
        </section>

        {/* ═════════════ BOTTOM CTA ═════════════ */}
        <section className="container-wide mt-10 md:mt-14">
          <div className="relative overflow-hidden rounded-sm bg-gradient-to-br from-[#000F1B] via-[#0B1E30] to-[#000F1B] text-white p-7 sm:p-10 border border-white/10">
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF5A00]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#FF5A00]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <BrandPill size="sm" label="Help" />
                <h3 className="mt-4 text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                  Still deciding?
                  <br />
                  <span className="text-[#FF5A00]">We&apos;ll help you pick.</span>
                </h3>
                <p className="mt-2 text-white/55 text-sm leading-relaxed">
                  Talk to a consultant — free, no obligation. They&apos;ll match the
                  right package to your plot, budget and lifestyle.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                <Link
                  to="/find-my-package"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-3 transition"
                >
                  Dont Know What to Choose?
                </Link>
                <button
                  type="button"
                  onClick={() => openLead({ source: "packages-compare-cta" })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold px-6 py-3 shadow-[0_12px_30px_rgba(255,90,0,0.35)] transition"
                >
                  Get Free Consultation <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}