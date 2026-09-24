import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

export default function Marketplace({ items = [] }) {
  return (
    <section
      id="marketplace"
      data-testid="marketplace-section"
      className="relative py-16 md:py-20 lg:py-24 scroll-mt-20 bg-[#F7F7F7] font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white"
    >
      <div className="container-wide">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <FadeIn>
            <SectionLabel number={5} eyebrow="Marketplace" />
            <h2 className="mt-4 text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-[40px] lg:text-[44px] leading-[1.15] tracking-tight">
              Everything You Need.{" "}
              <span className="text-[#FF5A00]">To Build.</span>
            </h2>
            <p className="mt-4 text-[#000F1B]/60 max-w-xl leading-relaxed text-sm md:text-[15px]">
              One-stop marketplace for materials, equipment, contractors & professionals —
              verified, transparent, and always on.
            </p>
          </FadeIn>
        </div>

        {/* Flip cards grid */}
        <div className="marketplace-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {items.map((it, i) => (
            <MarketCard key={it.id} item={it} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        /* Sibling blur */
        .marketplace-grid:hover .flip-card:not(:hover) {
          filter: blur(3px) saturate(0.75);
          transform: scale(0.96);
          opacity: 0.7;
        }
        .marketplace-grid .flip-card {
          transition: filter 0.4s ease, transform 0.4s ease, opacity 0.4s ease;
        }
        .marketplace-grid .flip-card:hover {
          filter: none;
          transform: scale(1.03);
          opacity: 1;
          z-index: 6;
        }

        /* 3D flip */
        .flip-scene {
          perspective: 1200px;
          width: 100%;
          height: 100%;
        }
        .flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .flip-card:hover .flip-inner {
          transform: rotateY(180deg);
        }
        .flip-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 1rem;
          overflow: hidden;
        }
        .flip-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </section>
  );
}

function MarketCard({ item, index }) {
  const fallback =
    "https://images.unsplash.com/photo-1541123356219-284ebe98ae3b?auto=format&fit=crop&w=1200&q=80";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`marketplace-${item.slug}`}
      className="flip-card group relative w-full aspect-[3/4] sm:aspect-[5/6] cursor-pointer"
    >
      <div className="flip-scene h-full w-full">
        <div className="flip-inner h-full w-full rounded-2xl shadow-md group-hover:shadow-[0_20px_50px_rgba(255,90,0,0.2)]">
          
          {/* ===================== FRONT ===================== */}
          <div className="flip-face flip-front bg-white border border-black/5">
            {/* Image */}
            <div className="relative h-[62%] overflow-hidden bg-[#EFEFEF]">
              <img
                src={item.image || fallback}
                alt={item.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = fallback;
                }}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000F1B]/50 via-transparent to-transparent" />

              {item.icon && (
                <div className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-xl grid place-items-center bg-white/95 text-[#FF5A00] shadow-md">
                  <LucideIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Front text */}
            <div className="relative h-[38%] p-3 sm:p-3.5 flex flex-col justify-between bg-white">
              <div>
                <div className="font-semibold text-[#000F1B] text-sm leading-tight line-clamp-1">
                  {item.name}
                </div>
                <p className="mt-1 text-[10px] sm:text-[11px] text-[#000F1B]/55 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="w-6 h-0.5 rounded-full bg-[#FF5A00]" />
                <span className="text-[9px] uppercase tracking-widest font-semibold text-[#000F1B]/35 group-hover:text-[#FF5A00] transition-colors">
                  Flip →
                </span>
              </div>
            </div>
          </div>

          {/* ===================== BACK ===================== */}
          <div className="flip-face flip-back bg-gradient-to-br from-[#000F1B] via-[#0B1E30] to-[#000F1B] border border-white/10 text-white">
            {/* Soft glows */}
            <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FF5A00]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#FF5A00]/10 blur-3xl" />

            <div className="relative z-10 h-full flex flex-col p-4 sm:p-5">
              {/* Icon */}
              <div className="w-11 h-11 rounded-2xl grid place-items-center bg-[#FF5A00]/15 border border-[#FF5A00]/30 text-[#FF5A00]">
                <LucideIcon name={item.icon || "Package"} className="w-5 h-5" />
              </div>

              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF8A4C]">
                  Available
                </div>
                <h3 className="mt-1 font-bold text-lg sm:text-xl text-white leading-tight">
                  {item.name}
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed line-clamp-4">
                  {item.description}
                </p>
              </div>

              {/* Benefit chips */}
              <ul className="mt-4 space-y-1.5 flex-1">
                {["Verified partners", "Transparent rates", "On-demand"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-[11px] text-white/85">
                    <Check className="w-3.5 h-3.5 text-[#FF5A00] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white text-xs font-semibold px-4 py-2.5 transition-colors"
              >
                Explore
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}