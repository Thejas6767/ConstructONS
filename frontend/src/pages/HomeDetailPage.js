"use client";

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bed,
  Bath,
  Layers,
  Car,
  Ruler,
  Check,
  ArrowRight,
  Home as HomeIcon,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  BookOpen,
  ShieldCheck,
  Square,
} from "lucide-react";
import { publicApi } from "@/lib/api";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import FloatingActions from "@/components/site/FloatingActions";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function HomeDetailPage() {
  const { slug } = useParams();
  const [home, setHome] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { open } = useLeadModal();

  useEffect(() => {
    publicApi.getHome(slug).then(setHome).catch(() => setHome({}));
    publicApi.getSiteSettings().then(setSettings).catch(() => {});
  }, [slug]);

  if (!home) {
    return (
      <div className="min-h-screen bg-white grid place-items-center font-['Poppins',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF5A00] border-t-transparent animate-spin" />
          <div className="text-xs uppercase tracking-widest text-[#000F1B]/50">
            Loading home
          </div>
        </div>
      </div>
    );
  }

  if (!home.id) {
    return (
      <div className="bg-white font-['Poppins',sans-serif]">
        <Header />
        <div className="min-h-[70vh] grid place-items-center text-center px-6 pt-24">
          <div>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF5A00]/10 grid place-items-center">
              <HomeIcon className="w-7 h-7 text-[#FF5A00]" />
            </div>
            <div className="mt-4 text-2xl font-bold text-[#000F1B]">
              Home not found
            </div>
            <p className="mt-1 text-sm text-[#000F1B]/50">
              The design you're looking for doesn't exist or was moved.
            </p>
            <Link
              to="/#home-collection"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold px-6 py-3 transition"
            >
              Browse Home Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Footer settings={settings} />
      </div>
    );
  }

  const gallery = home.gallery?.length
    ? home.gallery
    : [home.cover_image].filter(Boolean);
  const activeImg = gallery[selected] || home.cover_image;

  const nextImg = () => setSelected((s) => (s + 1) % gallery.length);
  const prevImg = () =>
    setSelected((s) => (s - 1 + gallery.length) % gallery.length);

  return (
    <div className="bg-[#F7F7F7] font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white min-h-screen">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container-wide">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/#home-collection"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#000F1B]/55 hover:text-[#FF5A00] transition group"
            >
              <span className="w-8 h-8 rounded-full bg-white border border-black/5 grid place-items-center group-hover:border-[#FF5A00]/30 transition">
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
              Back to Home Collection
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#000F1B]/40">
              <span className="text-[#000F1B]">CONSTRUCTONS</span>
            
              <span className="text-[#000F1B]/20">/</span>
              <span className="text-[#000F1B]">HOMES</span>
              <span className="text-[#000F1B]/20">/</span>
              <span className="text-[#FF5A00]">{home.name}</span>
            </div>
          </div>

          {/* ═════════════ MAIN GRID ═════════════ */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 lg:gap-6 items-start">
            {/* ── LEFT: Gallery ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col-reverse lg:flex-row gap-3">
                {gallery.length > 1 && (
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[600px] no-scrollbar lg:w-[92px] shrink-0 pb-1 lg:pb-0">
                    {gallery.map((g, i) => (
                      <button
                        key={g || `thumb-${i}`}
                        onClick={() => setSelected(i)}
                        data-testid={`gallery-thumb-${i}`}
                        className={`relative shrink-0 w-20 h-20 lg:w-full lg:h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          selected === i
                            ? "border-[#FF5A00] scale-[1.02] shadow-md"
                            : "border-transparent opacity-55 hover:opacity-100"
                        }`}
                      >
                        <img src={g} alt="" className="w-full h-full object-cover" />
                        {selected === i && (
                          <span className="absolute inset-x-1 bottom-1 h-0.5 rounded-full bg-[#FF5A00]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative flex-1 rounded-3xl overflow-hidden bg-[#0B1E30] shadow-[0_30px_60px_-30px_rgba(0,15,27,0.35)] group">
                  <div className="relative aspect-[16/10]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImg}
                        src={activeImg}
                        alt={home.name}
                        initial={{ opacity: 0, scale: 1.03 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </AnimatePresence>

                    <div className="absolute top-4 left-4 z-20 rounded-full bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-md flex items-center">
                      <img src="/logo.webp" alt="ConstructONS Logo" className="h-5 w-auto object-contain" />
                    </div>

                    <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-[#FF5A00] text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                      {home.style}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#000F1B]/70 to-transparent pointer-events-none" />

                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6 md:p-8">
                      <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight leading-tight drop-shadow">
                        {home.name}
                      </h1>
                      {home.tagline && (
                        <p className="mt-2 text-white/85 text-sm sm:text-base max-w-2xl leading-relaxed">
                          {home.tagline}
                        </p>
                      )}
                    </div>

                    {gallery.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={prevImg}
                          className="absolute top-1/2 left-3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 grid place-items-center text-white hover:bg-[#FF5A00] transition opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={nextImg}
                          className="absolute top-1/2 right-3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 grid place-items-center text-white hover:bg-[#FF5A00] transition opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setLightbox(true)}
                      className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 grid place-items-center text-white hover:bg-[#FF5A00] transition"
                      aria-label="View fullscreen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {gallery.length > 1 && (
                      <div className="absolute bottom-4 left-4 z-20 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md text-white text-[10px] font-bold tracking-widest">
                        {String(selected + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT: Glassmorphic sticky info panel ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:sticky lg:top-28"
            >
              <GlassCard>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A00]">
                    {home.style} Home
                  </div>
                  {home.vastu_compliant && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-500/15 backdrop-blur px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Vastu
                    </div>
                  )}
                </div>

                <h2 className="mt-2 text-xl sm:text-2xl font-bold text-[#000F1B]">
                  {home.name}
                </h2>
                {home.dimensions && (
                  <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#000F1B]/60">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5A00]" />
                    Plot {home.dimensions}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  <StatCell icon={Ruler} label="Area" value={home.area_sqft} />
                  <StatCell icon={HomeIcon} label="Dimensions" value={home.dimensions || "—"} />
                  <StatCell icon={Bed} label="Bedrooms" value={`${home.bedrooms} BHK`} />
                  <StatCell icon={Bath} label="Baths" value={home.bathrooms} />
                  <StatCell icon={Layers} label="Floors" value={home.floors === 1 ? "G+1" : `G+${home.floors}`} />
                  <StatCell icon={Car} label="Parking" value={`${home.parking} Car${home.parking > 1 ? "s" : ""}`} />
                </div>

                {/* Price band */}
                <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#000F1B] to-[#0B1E30] text-white p-4 relative overflow-hidden border border-white/10">
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#FF5A00]/20 blur-3xl" />
                  <div className="relative z-10">
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#FF8A4C]">
                      Estimated Cost
                    </div>
                    <div className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">
                      {home.estimated_cost}
                    </div>
                    <div className="text-[10px] text-white/45 mt-0.5">
                      Inclusive of standard specs · Excludes land
                    </div>
                  </div>
                </div>

                {/* Dynamic Call Button bound to backend settings */}
                <div className="mt-4 space-y-2">
                  <button
                    type="button"
                    onClick={() => open({ home: home.name, source: "home_detail" })}
                    data-testid="home-detail-cta"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold px-6 py-3.5 shadow-[0_12px_28px_rgba(255,90,0,0.32)] transition"
                  >
                    Get Custom Quote <ArrowRight className="w-4 h-4" />
                  </button>
                  {settings?.phone && (
                    <a
                      href={`tel:${settings.phone}`}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur text-[#000F1B] hover:border-[#000F1B] text-sm font-semibold px-6 py-3 transition"
                    >
                      <Phone className="w-4 h-4 text-[#FF5A00]" /> Call {settings.phone}
                    </a>
                  )}
                </div>

                {home.package_compatibility?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-black/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#000F1B]/45 mb-2">
                      Available Packages
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {home.package_compatibility.map((p) => (
                        <Link
                          key={p}
                          to="/#packages"
                          className="text-xs px-3 py-1.5 rounded-full bg-[#FF5A00]/10 text-[#FF5A00] font-semibold hover:bg-[#FF5A00] hover:text-white transition"
                        >
                          {p}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>

          {/* ═════════════ ABOUT + FLOOR PLAN ═════════════ */}
          <div className="mt-6 grid lg:grid-cols-[1.5fr_1fr] gap-5 lg:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard padded>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A00]">
                      Overview
                    </div>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">
                      About this home
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAboutOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#000F1B] hover:bg-[#0B1E30] text-white text-xs font-semibold px-4 py-2.5 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read Full Story
                  </button>
                </div>

                <p className="mt-4 text-[#000F1B]/70 text-sm sm:text-[15px] leading-relaxed line-clamp-4">
                  {home.description}
                </p>

                {home.features?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {home.features.slice(0, 4).map((f, i) => (
                      <span
                        key={`chip-${i}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#000F1B]/80 bg-white/70 backdrop-blur border border-black/5 rounded-full px-3 py-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
                        {f}
                      </span>
                    ))}
                    {home.features.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setAboutOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A00] bg-[#FF5A00]/10 hover:bg-[#FF5A00] hover:text-white rounded-full px-3 py-1.5 transition"
                      >
                        +{home.features.length - 4} more
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="mt-5 sm:hidden w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#000F1B] hover:bg-[#0B1E30] text-white text-xs font-semibold px-4 py-3 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Read Full Story
                </button>

                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="hidden sm:inline-flex mt-4 items-center gap-1 text-sm font-bold text-[#FF5A00] hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <FloorPlanCard home={home} />
            </motion.div>
          </div>

          {/* ═════════════ BOTTOM CTA BAND ═════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#000F1B] via-[#0B1E30] to-[#000F1B] text-white p-6 sm:p-8 md:p-10 border border-white/10"
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FF5A00]/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#FF5A00]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FF8A4C]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
                  Ready to build {home.name}?
                </div>
                <h4 className="mt-2 text-2xl sm:text-3xl font-bold leading-tight">
                  Get a personalized quote in <span className="text-[#FF5A00]">24 hours.</span>
                </h4>
                <p className="mt-2 text-white/55 text-sm leading-relaxed">
                  Talk to our expert. Free consultation. No obligation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-3 transition"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => open({ home: home.name, source: "home_detail_bottom" })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold px-6 py-3 shadow-[0_10px_28px_rgba(255,90,0,0.35)] transition"
                >
                  Get Free Consultation <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer settings={settings} />
      <FloatingActions phone={settings?.phone} whatsapp={settings?.whatsapp} />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#000F1B]/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 border border-white/20 text-white grid place-items-center hover:bg-[#FF5A00] transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImg();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white grid place-items-center hover:bg-[#FF5A00] transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImg();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 border border-white/20 text-white grid place-items-center hover:bg-[#FF5A00] transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <motion.img
              key={activeImg}
              src={activeImg}
              alt={home.name}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-[95vw] max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 shadow-md flex items-center">
              <img src="/logo.webp" alt="ConstructONS Logo" className="h-5 w-auto object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} home={home} />
    </div>
  );
}

function GlassCard({ children, padded = true, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_-30px_rgba(0,15,27,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] ${
        padded ? "p-5 sm:p-6 md:p-7" : ""
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/50 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

function StatCell({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/50 backdrop-blur p-3 hover:border-[#FF5A00]/30 hover:bg-white transition-all">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[#FF5A00]" />
        <div className="text-[9px] uppercase tracking-widest text-[#000F1B]/50 font-bold">
          {label}
        </div>
      </div>
      <div className="mt-1 font-bold text-sm text-[#000F1B]">{value}</div>
    </div>
  );
}

function AboutModal({ open, onClose, home }) {
  if (!home) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-[#000F1B]/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full sm:max-w-2xl max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col font-['Poppins',sans-serif]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden">
              <img src={home.cover_image} alt={home.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B]/85 via-[#000F1B]/30 to-transparent" />

              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 border border-white/25 backdrop-blur text-white grid place-items-center hover:bg-[#FF5A00] transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8A4C]">
                    <span>· Full Story</span>
                  </div>
                  <h3 className="mt-1 text-white font-bold text-2xl sm:text-3xl tracking-tight leading-tight">
                    {home.name}
                  </h3>
                </div>
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md flex items-center shrink-0">
                  <img src="/logo.webp" alt="ConstructONS Logo" className="h-5 w-auto object-contain" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7">
              {home.tagline && (
                <div className="text-sm sm:text-base font-semibold text-[#FF5A00] italic mb-4">
                  {home.tagline}
                </div>
              )}

              <p className="text-[#000F1B]/75 text-sm sm:text-[15px] leading-relaxed whitespace-pre-line">
                {home.description}
              </p>

              {home.features?.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-[2px] bg-[#FF5A00]" />
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#000F1B]/50">
                      All Highlights
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {home.features.map((f, i) => (
                      <div key={`modal-feat-${i}`} className="flex items-start gap-2.5 text-sm text-[#000F1B]/85">
                        <span className="w-5 h-5 rounded-full bg-[#FF5A00]/10 grid place-items-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#FF5A00]" />
                        </span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-black/5 grid grid-cols-3 gap-3">
                <ModalFact label="Area" value={home.area_sqft} />
                <ModalFact label="BHK" value={home.bedrooms} />
                <ModalFact label="Floors" value={home.floors === 1 ? "G+1" : `G+${home.floors}`} />
              </div>
            </div>

            <div className="shrink-0 border-t border-black/5 p-4 bg-[#F7F7F7] flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border border-black/10 bg-white text-[#000F1B] text-sm font-semibold py-2.5 hover:border-[#000F1B] transition"
              >
                Close
              </button>
              <Link
                to="/#home-collection"
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-sm font-semibold py-2.5 transition"
              >
                Browse More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalFact({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg sm:text-xl font-bold text-[#000F1B]">{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-[#000F1B]/45 mt-0.5">
        {label}
      </div>
    </div>
  );
}

function FloorPlanCard({ home }) {
  const areas = home.floor_areas || [];

  const parseSqft = (str) => {
    if (!str) return 0;
    const m = String(str).match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ""), 10) : 0;
  };

  const withValues = areas.map((a) => ({ ...a, sqft: parseSqft(a.area) }));
  const total = withValues.reduce((s, a) => s + a.sqft, 0);

  const [tab, setTab] = useState("visual");

  return (
    <GlassCard padded>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A00]">
            Floor Plan
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-bold text-[#000F1B] tracking-tight">
            Space breakdown
          </h3>
          <p className="mt-1 text-xs text-[#000F1B]/50">
            Visual layout of every space
          </p>
        </div>

        <div className="flex rounded-full bg-white/60 backdrop-blur border border-black/5 p-0.5 shrink-0">
          <TabBtn active={tab === "visual"} onClick={() => setTab("visual")}>
            Visual
          </TabBtn>
          <TabBtn active={tab === "list"} onClick={() => setTab("list")}>
            List
          </TabBtn>
        </div>
      </div>

      {tab === "visual" && withValues.length > 0 && (
        <div className="mt-5">
          <div className="grid grid-cols-6 auto-rows-[60px] gap-2">
            {withValues.map((a, i) => {
              const share = total > 0 ? a.sqft / total : 1 / withValues.length;
              let colSpan = Math.max(2, Math.min(6, Math.round(share * 12)));
              let rowSpan = share > 0.25 ? 2 : 1;

              const hues = [
                "bg-[#FF5A00]/90 text-white border-[#FF5A00]",
                "bg-[#000F1B] text-white border-[#000F1B]",
                "bg-white text-[#000F1B] border-black/10",
                "bg-[#FFF1E8] text-[#000F1B] border-[#FF5A00]/20",
                "bg-[#0B1E30] text-white border-[#0B1E30]",
                "bg-[#F7F7F7] text-[#000F1B] border-black/5",
              ];
              const cls = hues[i % hues.length];

              return (
                <motion.div
                  key={`fp-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className={`relative rounded-xl border p-2.5 flex flex-col justify-between overflow-hidden ${cls}`}
                  style={{
                    gridColumn: `span ${colSpan} / span ${colSpan}`,
                    gridRow: `span ${rowSpan} / span ${rowSpan}`,
                  }}
                >
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider opacity-70">
                    <Square className="w-2.5 h-2.5" />
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm leading-tight">
                      {a.label}
                    </div>
                    <div className="text-[10px] opacity-70 mt-0.5">
                      {a.area}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {total > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-[#000F1B] text-white p-3 border border-white/10">
              <div className="text-[10px] uppercase tracking-widest text-[#FF8A4C] font-bold">
                Total Covered
              </div>
              <div className="font-bold text-sm">
                {total.toLocaleString()} Sq.ft
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "list" && (
        <ul className="mt-5 space-y-0.5">
          {withValues.map((a, i) => {
            const share = total > 0 ? (a.sqft / total) * 100 : 0;
            return (
              <li key={`li-fp-${i}`} className="py-3 border-b border-black/5 last:border-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00]" />
                    <span className="text-[#000F1B]/80 font-medium">{a.label}</span>
                  </div>
                  <span className="font-bold text-[#000F1B] text-sm">
                    {a.area}
                  </span>
                </div>
                {share > 0 && (
                  <div className="mt-2 h-1 rounded-full bg-black/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${share}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-[#FF5A00] to-[#FF2D00]"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {home.floorplan_image && (
        <div className="mt-5 rounded-2xl overflow-hidden bg-[#F7F7F7] border border-black/5 relative">
          <img src={home.floorplan_image} alt="Floor plan blueprint" className="w-full h-auto object-cover" />
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1.5 shadow-sm flex items-center">
            <img src="/logo.webp" alt="ConstructONS Logo" className="h-5 w-auto object-contain" />
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function TabBtn({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition ${
        active ? "bg-[#000F1B] text-white" : "text-[#000F1B]/50 hover:text-[#000F1B]"
      }`}
    >
      {children}
    </button>
  );
}