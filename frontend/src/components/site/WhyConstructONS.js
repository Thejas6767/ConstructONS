"use client";

import React, { useRef, useState } from "react";
import { Check, X } from "lucide-react";
import * as LucideIcons from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                        DYNAMIC LUCIDE ICON HELPER                          */
/* -------------------------------------------------------------------------- */

function DynamicLucideIcon({ name, className = "h-6 w-6 text-[#FF5A00]" }) {
  if (!name) return <LucideIcons.Home className={className} strokeWidth={2} />;

  // If name is already a valid React Component (e.g. default props)
  if (typeof name === "function" || typeof name === "object") {
    const CustomIcon = name;
    return <CustomIcon className={className} strokeWidth={2} />;
  }

  // 1. Exact match (e.g. "Home", "Award", "Clock", "Users")
  if (LucideIcons[name]) {
    const IconComponent = LucideIcons[name];
    return <IconComponent className={className} strokeWidth={2} />;
  }

  // 2. PascalCase conversion for lowercase/kebab-case strings (e.g. "home" -> "Home", "building-2" -> "Building2")
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  if (LucideIcons[pascalName]) {
    const IconComponent = LucideIcons[pascalName];
    return <IconComponent className={className} strokeWidth={2} />;
  }

  // Fallback icon if string doesn't match any Lucide icon name
  return <LucideIcons.Home className={className} strokeWidth={2} />;
}

/* -------------------------------------------------------------------------- */
/*                            BRAND LOGO TEXT                                 */
/* -------------------------------------------------------------------------- */

function BrandText({ dark = false }) {
  return (
    <span className="inline-flex items-center align-middle">
      <span className={dark ? "text-[#000F1B]" : "text-white"}>Construct</span>
      {/* Power Icon replacing 'O' */}
      <span className="mx-[0.05em] inline-flex items-center justify-center text-[#FF5A00]">
        <svg
          className="h-[0.82em] w-[0.82em] fill-none stroke-current stroke-[3.5] align-middle"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636a9 9 0 11-12.728 0M12 2v10"
          />
        </svg>
      </span>
      <span className="text-[#FF5A00]">NS</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DEFAULT CONTENT                               */
/* -------------------------------------------------------------------------- */

const DEFAULT_TRADITIONAL = [
  "No fixed pricing",
  "No live tracking",
  "Paper based documents",
  "Manual updates",
  "No dashboard",
  "Delays & cost overrun",
  "Limited after-sales",
  "No tech integration",
];

const DEFAULT_CONSTRUCTONS = [
  "Transparent package pricing",
  "AI-powered live tracking",
  "Digital documents",
  "Real-time updates",
  "On-time delivery guarantee",
  "Live milestone tracking",
  "10 year warranty",
  "AI + IoT + Cloud platform",
];

/* -------------------------------------------------------------------------- */
/*                              DEFAULT STATS                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_STATS = [
  {
    value: "250+",
    label: "Homes Planned",
    icon: "Home",
  },
  {
    value: "10+",
    label: "Years Experience",
    icon: "Award",
  },
  {
    value: "98%",
    label: "On-Time Delivery",
    icon: "Clock",
  },
  {
    value: "50+",
    label: "Expert Professionals",
    icon: "Users",
  },
];

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function WhyConstructONS({
  traditionalPoints = DEFAULT_TRADITIONAL,
  constructonsPoints = DEFAULT_CONSTRUCTONS,
  stats = DEFAULT_STATS,
}) {
  return (
    <section
      id="why"
      data-testid="why-section"
      className="relative scroll-mt-20 bg-[#F8F9FA] font-sans selection:bg-[#FF5A00] selection:text-white"
    >
      {/* 1. HERO SPOTLIGHT */}
      <MaskRevealHero />

      {/* 2. COMPARISON */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <ComparisonGrid
          traditional={traditionalPoints}
          constructons={constructonsPoints}
        />
      </div>

      {/* 3. STATS BANNER */}
      {stats.length > 0 && <StatsBanner stats={stats} />}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SPOTLIGHT HERO                                  */
/* -------------------------------------------------------------------------- */

function MaskRevealHero() {
  const containerRef = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-[24rem] w-full cursor-none select-none items-center justify-center overflow-hidden bg-[#000F1B] sm:h-[28rem] md:h-[32rem]"
    >
      {/* Base layer */}
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <p className="max-w-4xl text-xl font-bold leading-snug text-white/30 sm:text-3xl md:text-5xl">
          Building better with{" "}
          <span className="text-white/60">technology</span>, transparency, and{" "}
          <span className="text-white/60">AI-powered tracking</span> — from
          blueprint to handover.
        </p>
      </div>

      {/* Orange reveal */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#FF5A00] px-6 text-center transition-opacity duration-300"
        style={{
          WebkitMaskImage: `radial-gradient(circle ${
            isHovered ? 260 : 60
          }px at ${pos.x}% ${pos.y}%, black 100%, transparent 100%)`,
          maskImage: `radial-gradient(circle ${
            isHovered ? 260 : 60
          }px at ${pos.x}% ${pos.y}%, black 100%, transparent 100%)`,
        }}
      >
        <p className="max-w-4xl text-xl font-extrabold leading-snug text-white sm:text-3xl md:text-5xl">
          Traditional contractors leave you guessing.
          <br />
          <span className="text-[#000F1B]">We give you total control.</span>
        </p>
      </div>

      {/* Pointer */}
      <div
        className="pointer-events-none absolute z-30 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 transition-transform duration-75"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            COMPARISON GRID                                 */
/* -------------------------------------------------------------------------- */

function ComparisonGrid({ traditional = [], constructons = [] }) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
        <span className="inline-block rounded-full border border-[#FF5A00]/20 bg-[#FF5A00]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FF5A00]">
          Side-By-Side Comparison
        </span>

        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#000F1B] sm:text-4xl md:text-5xl">
          The <BrandText dark={true} /> Advantage
        </h2>

        <p className="mt-3 text-base text-slate-600 sm:text-lg">
          See how tech-driven execution eliminates the risks of traditional
          construction.
        </p>
      </div>

      {/* Grid */}
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        {/* Traditional */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-300 sm:p-8 md:p-10">
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  The Old Way
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-slate-800 sm:text-2xl">
                  Traditional Contractors
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Opaque
              </span>
            </div>

            <ul className="space-y-4">
              {traditional.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 text-sm font-medium text-slate-600 sm:text-base"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500">
                    <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-400">
            Higher risk of cost revisions & unexpected delays.
          </div>
        </div>

        {/* VS */}
        <div className="my-2 flex items-center justify-center lg:my-0">
          <div className="z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#FF5A00] text-lg font-black text-white shadow-lg shadow-[#FF5A00]/30 sm:h-16 sm:w-16 sm:text-xl">
            VS
          </div>
        </div>

        {/* ConstructONS */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#000F1B] p-6 text-white shadow-xl sm:p-8 md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full bg-[#FF5A00]/20 blur-3xl" />

          <div>
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF5A00]">
                  Next-Gen Standard
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                  <BrandText dark={false} />
                </h3>
              </div>
              <span className="rounded-full border border-[#FF5A00]/30 bg-[#FF5A00]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FF5A00]">
                Recommended
              </span>
            </div>

            <ul className="space-y-4">
              {constructons.map((point, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 text-sm font-semibold text-slate-200 sm:text-base"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 text-xs font-semibold text-slate-400">
            <span>Guaranteed deliverables backed by technology.</span>
            <span className="font-bold text-[#FF5A00]">100% Tracked →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              STATS BANNER                                  */
/* -------------------------------------------------------------------------- */

function StatsBanner({ stats }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8">
      <div className="rounded-3xl bg-[#030914] p-6 text-white shadow-2xl md:rounded-full md:px-12 md:py-6">
        <div className="grid grid-cols-2 gap-6 md:flex md:flex-row md:items-center md:justify-around md:gap-0">
          {stats.map((s, idx) => {
            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 py-2 md:py-0">
                  {/* ICON CONTAINER */}
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0D1829]">
                    <DynamicLucideIcon name={s.icon} className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5A00]" />
                  </div>

                  {/* STAT TEXT */}
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                      {s.value}
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-400 md:text-sm">
                      {s.label}
                    </span>
                  </div>
                </div>

                {/* VERTICAL DIVIDER LINE */}
                {idx < stats.length - 1 && (
                  <div className="hidden h-10 w-[1px] bg-white/10 md:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}