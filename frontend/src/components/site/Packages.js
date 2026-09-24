import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Download,
  Scale,
  Compass,
  X,
  Maximize2,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";
import { useBrochureModal } from "@/components/site/BrochureModalProvider";

export default function Packages({ packages = [] }) {
  const { open: openLead } = useLeadModal();
  const { open: openBrochure } = useBrochureModal();
  const [previewPkg, setPreviewPkg] = useState(null);

  // First 3 = normal grid cards | Rest = custom/premium cards
  const normalPackages = packages.slice(0, 3);
  const customPackages = packages.slice(3);

  return (
    <section
      id="packages"
      data-testid="packages-section"
      className="relative scroll-mt-20 bg-[#F7F7F7] py-16 font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white sm:py-18 md:py-20 lg:py-24"
    >
      <div className="container-wide">
        {/* HEADER */}
        <div className="mb-10 md:mb-12">
          <FadeIn>
            <SectionLabel number={3} eyebrow="Build Packages" />

            <h2 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-[#000F1B] sm:text-4xl md:text-[40px] lg:text-[44px]">
              Transparent Packages.{" "}
              <span className="text-[#FF5A00]">
                Trusted Construction.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#000F1B]/60 md:text-[15px]">
              No hidden costs. No surprises. Just quality construction with
              clear pricing.
            </p>

            {/* Header buttons */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                to="/find-my-package"
                data-testid="packages-quiz-link"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#000F1B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B1E30]"
              >
                <Compass className="h-4 w-4 shrink-0" />
                <span>Find My Perfect Package</span>
              </Link>

              <Link
                to="/packages/compare"
                data-testid="packages-compare-link"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#000F1B] transition hover:border-[#000F1B]"
              >
                <Scale className="h-4 w-4 shrink-0" />
                <span>Compare All Packages</span>
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* -------------------------------------------------
            FIRST 3 PACKAGE CARDS
        -------------------------------------------------- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
          {normalPackages.map((p, i) => (
            <PackageCard
              key={p.id}
              pkg={p}
              index={i}
              mobileCenter={i === 2}
              onQuote={() =>
                openLead({
                  package: p.name,
                  source: "packages",
                })
              }
              onBrochure={() =>
                openBrochure(p.slug, p.name)
              }
              onPreview={() => setPreviewPkg(p)}
            />
          ))}
        </div>

        {/* -------------------------------------------------
            CUSTOM / PREMIUM CARDS
        -------------------------------------------------- */}
        {customPackages.length > 0 && (
          <div className="mt-5 space-y-5 md:mt-6">
            {customPackages.map((p, i) => (
              <CustomPackageCard
                key={p.id}
                pkg={p}
                index={i + 3}
                onQuote={() =>
                  openLead({
                    package: p.name,
                    source: "packages",
                  })
                }
                onBrochure={() =>
                  openBrochure(p.slug, p.name)
                }
                onPreview={() => setPreviewPkg(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* QUICK PREVIEW MODAL */}
      <PreviewModal
        pkg={previewPkg}
        onClose={() => setPreviewPkg(null)}
        onBrochure={() => {
          if (previewPkg) {
            openBrochure(
              previewPkg.slug,
              previewPkg.name
            );
          }
        }}
        onQuote={() => {
          if (previewPkg) {
            openLead({
              package: previewPkg.name,
              source: "packages-preview",
            });

            setPreviewPkg(null);
          }
        }}
      />
    </section>
  );
}

/* -------------------------------------------------------
   NORMAL PACKAGE CARD
------------------------------------------------------- */
function PackageCard({
  pkg,
  onQuote,
  onBrochure,
  onPreview,
  index,
  mobileCenter,
}) {
  const isPopular = pkg.is_most_popular;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`group h-full ${
        mobileCenter
          ? "col-span-2 w-[calc((100%-0.75rem)/2)] justify-self-center md:col-span-1 md:w-auto"
          : ""
      }`}
      data-testid={`package-card-${pkg.slug}`}
    >
      <div
        className={`relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.02] ${
          isPopular
            ? "border-white/10 bg-gradient-to-br from-[#000F1B] via-[#0B1E30] to-[#000F1B] text-white shadow-xl hover:border-[#FF5A00]/40 hover:shadow-[0_20px_50px_rgba(255,90,0,0.2)]"
            : "border-black/5 bg-white text-[#000F1B] shadow-md hover:border-[#FF5A00]/30 hover:shadow-xl"
        }`}
      >
        {/* Shine */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]" />

          {isPopular && (
            <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#FF5A00]/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-60" />
          )}
        </div>

        {/* Popular badge */}
        {isPopular && (
          <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 rounded-b-xl bg-[#FF5A00] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg sm:text-[10px]">
            Most Popular
          </div>
        )}

        {/* Card content */}
        <div className="relative z-10 flex h-full flex-col p-3 sm:p-5 md:p-6">

          {/* Package name */}
          <div
            className={`text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-xs ${
              isPopular
                ? "text-[#FF8A4C]"
                : "text-[#FF5A00]"
            }`}
          >
            {pkg.name}
          </div>

          {/* Price */}
          <div className="mt-2 flex flex-wrap items-baseline gap-1 sm:mt-3">
            <div
              className={`text-[22px] font-bold leading-none sm:text-3xl md:text-[34px] ${
                isPopular
                  ? "text-white"
                  : "text-[#000F1B]"
              }`}
            >
              {pkg.price_display}
            </div>

            {pkg.price_unit && (
              <div
                className={`text-[11px] sm:text-sm ${
                  isPopular
                    ? "text-white/60"
                    : "text-[#000F1B]/50"
                }`}
              >
                {pkg.price_unit}
              </div>
            )}
          </div>

          {/* Tagline */}
          <div
            className={`mt-1.5 text-[11px] font-semibold sm:text-sm ${
              isPopular
                ? "text-white"
                : "text-[#000F1B]"
            }`}
          >
            {pkg.tagline}
          </div>

          {/* Description */}
          <div
            className={`mt-1 line-clamp-2 text-[9px] leading-relaxed sm:text-xs ${
              isPopular
                ? "text-white/60"
                : "text-[#000F1B]/55"
            }`}
          >
            {pkg.description}
          </div>

          {/* Features */}
          <ul className="mt-4 flex-1 space-y-1.5 sm:space-y-2">
            {(pkg.highlights || [])
              .slice(0, 5)
              .map((h, i) => (
                <li
                  key={`${pkg.slug}-hl-${i}`}
                  className={`flex items-start gap-1 text-[10px] sm:gap-2 sm:text-sm ${
                    isPopular
                      ? "text-white/90"
                      : "text-[#000F1B]/85"
                  }`}
                >
                  <Check
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                      isPopular
                        ? "text-[#FF8A4C]"
                        : "text-[#FF5A00]"
                    }`}
                  />

                  <span className="line-clamp-2">
                    {h}
                  </span>
                </li>
              ))}
          </ul>

          {/* Accent */}
          <div className="mt-4 h-0.5 w-8 rounded-full bg-[#FF5A00] transition-all duration-500 group-hover:w-14" />

          {/* Buttons */}
          <div className="mt-4 flex flex-col gap-2">

            {/* Preview / Download */}
            <div className="flex items-center gap-1">

              <button
                type="button"
                onClick={onPreview}
                className={`min-w-0 flex-1 rounded-full px-1.5 py-2 text-[10px] font-semibold transition sm:px-2 sm:text-xs ${
                  isPopular
                    ? "text-white/90 hover:bg-white/10"
                    : "text-[#000F1B]/75 hover:bg-[#000F1B]/5"
                } inline-flex items-center justify-center gap-1 sm:gap-1.5`}
              >
                <Eye className="h-3.5 w-3.5 shrink-0" />
                <span>Preview</span>
              </button>

              <span
                className={`h-4 w-px ${
                  isPopular
                    ? "bg-white/20"
                    : "bg-black/10"
                }`}
              />

              <button
                type="button"
                onClick={onBrochure}
                data-testid={`package-brochure-${pkg.slug}`}
                className={`min-w-0 flex-1 rounded-full px-1.5 py-2 text-[10px] font-semibold transition sm:px-2 sm:text-xs ${
                  isPopular
                    ? "text-[#FF8A4C] hover:bg-white/10"
                    : "text-[#FF5A00] hover:bg-[#FF5A00]/8"
                } inline-flex items-center justify-center gap-1 sm:gap-1.5`}
              >
                <Download className="h-3.5 w-3.5 shrink-0" />
                <span>Download</span>
              </button>
            </div>

            {/* View Details */}
            <Link
              to={`/packages/${pkg.slug}`}
              data-testid={`package-view-details-${pkg.slug}`}
              className={`inline-flex w-full items-center justify-center gap-1 rounded-full px-3 py-2.5 text-[10px] font-semibold transition sm:gap-1.5 sm:px-4 sm:text-sm ${
                isPopular
                  ? "bg-[#FF5A00] text-white hover:bg-[#E04F00]"
                  : "bg-[#000F1B] text-white hover:bg-[#0B1E30]"
              }`}
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   CUSTOM / PREMIUM PACKAGE CARD
------------------------------------------------------- */
function CustomPackageCard({
  pkg,
  onQuote,
  onBrochure,
  onPreview,
  index,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.55,
        delay: 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      data-testid={`package-card-${pkg.slug}`}
    >
      <div className="group relative overflow-hidden rounded-2xl border border-[#FF5A00]/20 bg-gradient-to-r from-[#000F1B] via-[#0B1E30] to-[#000F1B] text-white shadow-xl transition-all duration-500 hover:border-[#FF5A00]/40 hover:shadow-[0_20px_50px_rgba(255,90,0,0.18)]">

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#FF5A00]/15 blur-3xl" />

          <div className="absolute -bottom-20 left-20 h-48 w-48 rounded-full bg-[#FF5A00]/10 blur-3xl" />

          <div className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-[200%]" />
        </div>

        <div className="relative z-10 grid items-center gap-6 p-6 md:grid-cols-[1fr_auto] sm:p-8 md:p-10">

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FF8A4C] sm:text-xs">
                {pkg.name}
              </span>

              <span className="rounded-full bg-[#FF5A00] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                Custom
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-2">
              <div className="text-3xl font-bold leading-none text-white sm:text-4xl md:text-5xl">
                {pkg.price_display}
              </div>

              {pkg.price_unit && (
                <div className="text-sm text-white/60">
                  {pkg.price_unit}
                </div>
              )}
            </div>

            <div className="mt-2 text-base font-semibold text-white sm:text-lg">
              {pkg.tagline}
            </div>

            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/60">
              {pkg.description}
            </p>

            <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {(pkg.highlights || [])
                .slice(0, 6)
                .map((h, i) => (
                  <li
                    key={`${pkg.slug}-hl-${i}`}
                    className="flex items-start gap-2 text-sm text-white/90"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF8A4C]" />
                    <span>{h}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Custom card actions */}
          <div className="flex w-full shrink-0 flex-col gap-2.5 md:w-[220px]">

            <div className="flex items-center overflow-hidden rounded-full bg-white/5">
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-white/90 transition hover:bg-white/10"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>

              <span className="h-5 w-px bg-white/15" />

              <button
                type="button"
                onClick={onBrochure}
                data-testid={`package-brochure-${pkg.slug}`}
                className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#FF8A4C] transition hover:bg-white/10"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>

            <Link
              to={`/packages/${pkg.slug}`}
              data-testid={`package-view-details-${pkg.slug}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#000F1B] transition hover:bg-white/90"
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={onQuote}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FF5A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,90,0,0.3)] transition hover:bg-[#E04F00]"
            >
              Get Custom Quote
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------
   QUICK PREVIEW MODAL
------------------------------------------------------- */
function PreviewModal({
  pkg,
  onClose,
  onBrochure,
  onQuote,
}) {
  if (!pkg) return null;

  const sections = (
    pkg.spec_categories ||
    pkg.sections ||
    []
  ).slice(0, 6);

  return (
    <AnimatePresence>
      {pkg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000F1B]/80 p-3 font-['Poppins',sans-serif] backdrop-blur-md sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 16,
            }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between border-b border-black/5 bg-[#F7F7F7] px-5 py-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF5A00]">
                  {pkg.name} Package
                </div>

                <div className="mt-0.5 text-lg font-bold text-[#000F1B]">
                  {pkg.price_display}

                  {pkg.price_unit && (
                    <span className="ml-1 text-sm font-medium text-[#000F1B]/50">
                      {pkg.price_unit}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close preview"
                className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-[#000F1B] transition hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">

              {pkg.tagline && (
                <p className="text-sm font-semibold text-[#000F1B]">
                  {pkg.tagline}
                </p>
              )}

              {pkg.description && (
                <p className="mt-1 text-sm leading-relaxed text-[#000F1B]/60">
                  {pkg.description}
                </p>
              )}

              {/* Highlights */}
              {pkg.highlights?.length > 0 && (
                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00]">
                    Highlights
                  </div>

                  <ul className="mt-2.5 space-y-2">
                    {pkg.highlights.map(
                      (h, i) => (
                        <li
                          key={`pv-hl-${i}`}
                          className="flex items-start gap-2 text-sm text-[#000F1B]/85"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5A00]" />
                          {h}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {sections.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00]">
                    Specifications
                  </div>

                  {sections.map(
                    (sec, i) => (
                      <div
                        key={`pv-sec-${i}`}
                      >
                        <div className="text-xs font-bold text-[#000F1B]">
                          {sec.name ||
                            sec.title}
                        </div>

                        <ul className="mt-1.5 space-y-1">
                          {(sec.items || [])
                            .slice(0, 4)
                            .map(
                              (it, j) => (
                                <li
                                  key={`pv-item-${i}-${j}`}
                                  className="flex items-start gap-1.5 text-xs text-[#000F1B]/70"
                                >
                                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF5A00]" />

                                  <span>
                                    {typeof it ===
                                    "string"
                                      ? it
                                      : `${it.spec}${
                                          it.value
                                            ? `: ${it.value}`
                                            : ""
                                        }`}
                                  </span>
                                </li>
                              )
                            )}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex shrink-0 flex-col gap-2 border-t border-black/5 bg-[#F7F7F7] px-5 py-4 sm:flex-row">

              <div className="flex flex-1 overflow-hidden rounded-full border border-black/5 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#000F1B]/70 transition hover:bg-black/5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Close
                </button>

                <span className="w-px bg-black/10" />

                <button
                  type="button"
                  onClick={onBrochure}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-[#FF5A00] transition hover:bg-[#FF5A00]/5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>

              <Link
                to={`/packages/${pkg.slug}`}
                onClick={onClose}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#000F1B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B1E30]"
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </Link>

              {(pkg.tier === "premium" ||
                pkg.tier === "custom") && (
                <button
                  type="button"
                  onClick={onQuote}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E04F00]"
                >
                  Get Custom Quote
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}