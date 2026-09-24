"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Plus,
  Minus,
  Check,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";

import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";


/* =========================================================
   UTILITY
========================================================= */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}


/* =========================================================
   DYNAMIC LUCIDE ICON HELPER
========================================================= */

function DynamicLucideIcon({ name, className = "h-6 w-6 text-[#FF5A00]" }) {
  if (!name) return <LucideIcons.Home className={className} strokeWidth={2} />;

  if (typeof name === "function" || typeof name === "object") {
    const CustomIcon = name;
    return <CustomIcon className={className} strokeWidth={2} />;
  }

  if (LucideIcons[name]) {
    const IconComponent = LucideIcons[name];
    return <IconComponent className={className} strokeWidth={2} />;
  }

  const pascalName = String(name)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

  if (LucideIcons[pascalName]) {
    const IconComponent = LucideIcons[pascalName];
    return <IconComponent className={className} strokeWidth={2} />;
  }

  return <LucideIcons.Home className={className} strokeWidth={2} />;
}


/* =========================================================
   BRAND TEXT HELPER
========================================================= */

function BrandText({ dark = false }) {
  return (
    <span className="inline-flex items-center align-middle">
      <span className={dark ? "text-[#000F1B]" : "text-white"}>Construct</span>
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


/* =========================================================
   DEFAULT STATS (Defined globally to prevent ReferenceErrors)
========================================================= */

const DEFAULT_STATS = [
  { value: "250+", label: "Homes Planned", icon: "Home" },
  { value: "10+", label: "Years Experience", icon: "Award" },
  { value: "98%", label: "On-Time Delivery", icon: "Clock" },
  { value: "50+", label: "Expert Professionals", icon: "Users" },
];


/* =========================================================
   STATS BANNER COMPONENT
========================================================= */

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


/* =========================================================
   MAIN PAGE COMPONENT
========================================================= */

export default function AboutPage() {
  const [team, setTeam] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi
      .getTeam()
      .then(setTeam)
      .catch(() => setTeam([]));

    publicApi
      .getFaqs()
      .then(setFaqs)
      .catch(() => setFaqs([]));

    publicApi
      .getSiteSettings()
      .then((res) => {
        setSettings(res);
      })
      .catch(() => setSettings(null));
  }, []);

  const formattedTeam = team.map((m) => ({
    id: m.id || m.name,
    name: m.name,
    role: m.role,
    expertise:
      m.bio ||
      "Dedicated to building better homes with transparent processes.",
    image: m.photo,
    accent: "#FF5A00",
  }));

  // Safe page stats resolver checking settings or admin keys, falling back to defaults
  const pageStats = 
    settings?.stats && Array.isArray(settings.stats) && settings.stats.length > 0 
      ? settings.stats 
      : settings?.data?.stats && Array.isArray(settings.data.stats) && settings.data.stats.length > 0
        ? settings.data.stats
        : DEFAULT_STATS;

  return (
    <div className="bg-white font-sans selection:bg-[#FF5A00] selection:text-white min-h-screen">
      <Header />

      <main>
        {/* =================================================
            HERO SECTION
        ================================================= */}
        <section className="relative min-h-[85svh] md:min-h-[90svh] w-full bg-[#F7F7F7] overflow-hidden pt-20 md:pt-24 flex flex-col justify-between">
          <div className="relative z-10 pt-4 md:pt-8 text-center px-2 select-none pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center justify-center"
            >
              <h1 className="font-extrabold text-[#000F1B] text-[13vw] sm:text-[11vw] md:text-[10vw] lg:text-[9vw] leading-none tracking-tight whitespace-nowrap flex items-center justify-center">
                <BrandText dark={true} />
                <sup className="text-[0.35em] font-bold text-[#FF5A00] -top-[0.8em] ml-[0.05em]">
                  ™
                </sup>
              </h1>

              <p className="mt-3 text-[#000F1B]/50 font-medium text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase">
                Everything Construction. Always On.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: "10%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 -mt-8 sm:-mt-14 md:-mt-20 w-full flex-1 flex items-end justify-center pointer-events-none"
          >
            <img
              src="/images/about/about.webp"
              alt="ConstructONS Architecture"
              className="w-full max-w-6xl max-h-[50vh] sm:max-h-[60vh] md:max-h-[68vh] object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,15,27,0.2)]"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80";
                e.currentTarget.className =
                  "w-full max-w-6xl max-h-[50vh] object-cover object-bottom rounded-t-[40px] shadow-2xl";
              }}
            />
          </motion.div>

          <div className="absolute inset-0 z-30 pointer-events-none">
            <div className="container-wide relative h-full w-full">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute left-4 bottom-6 md:left-8 md:bottom-12 pointer-events-auto"
              >
                <div className="max-w-[200px] sm:max-w-[240px] bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-black/5 shadow-xl">
                  <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FF5A00] mb-2">
                    Our Mission
                  </div>
                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-[#000F1B]/75">
                    To build India&rsquo;s most intelligent construction platform for premium homeowners — with total transparency at every step.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute right-4 bottom-6 md:right-8 md:bottom-12 pointer-events-auto hidden sm:block"
              >
                <div className="bg-[#000F1B]/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-xl shadow-2xl max-w-[200px] sm:max-w-[220px] border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] animate-pulse" />
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#FF8A4C]">
                      What we build
                    </div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm font-bold leading-snug">
                    Homes engineered for absolute perfection.
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS SECTION
        ================================================= */}
        <section className="py-12 md:py-16 bg-white relative z-30">
          <StatsBanner stats={pageStats} />
        </section>

        {/* =================================================
            TEAM SECTION
        ================================================= */}
        <section
          className="relative py-20 md:py-28 bg-[#F7F7F7] bg-cover bg-center bg-no-repeat overflow-hidden"
          style={{ backgroundImage: "url('/images/about/teambg.webp')" }}
        >
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />
          <div className="container-wide relative z-10">
            {formattedTeam.length > 0 && (
              <TeamRevealGrid
                eyebrow="Leadership"
                title="Meet the team"
                description="The architects, engineers, and visionaries building the future of construction."
                members={formattedTeam}
              />
            )}
          </div>
        </section>

        {/* =================================================
            FAQ SECTION
        ================================================= */}
        <section id="faq" className="py-20 md:py-28 bg-white border-t border-black/5">
          <div className="container-wide">
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20 items-start">
              <div className="lg:sticky lg:top-32">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5A00]/20 bg-[#FF5A00]/5 px-3 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FF5A00] animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00]">
                    Knowledge Base
                  </span>
                </div>

                <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-[#000F1B] leading-[1.1] tracking-tight">
                  Frequently Asked
                  <br />
                  <span className="text-[#FF5A00]">Questions.</span>
                </h2>

                <p className="mt-4 text-[#000F1B]/60 text-sm md:text-base leading-relaxed max-w-sm">
                  Everything you need to know about building with ConstructONS. Can&rsquo;t find the answer? Contact our support team.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {faqs.map((f, i) => (
                  <FAQItem key={f.id || i} faq={f} index={i} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}


/* =========================================================
   FAQ ITEM COMPONENT
========================================================= */

function FAQItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
        isOpen
          ? "bg-[#F7F7F7] border-[#FF5A00]/30"
          : "bg-white border-black/5 hover:border-black/15"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 outline-none"
      >
        <span
          className={`font-semibold text-sm sm:text-[15px] pr-4 transition-colors ${
            isOpen ? "text-[#FF5A00]" : "text-[#000F1B]"
          }`}
        >
          {faq.question}
        </span>

        <div
          className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center transition-colors duration-300 ${
            isOpen ? "bg-[#FF5A00] text-white" : "bg-[#000F1B]/5 text-[#000F1B]"
          }`}
        >
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-[#000F1B]/65 text-xs sm:text-sm leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


/* =========================================================
   TEAM HELPERS & COMPONENTS
========================================================= */

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase();
}

function Portrait({ member, active }) {
  const style = {
    "--team-accent": member.accent ?? "#FF5A00",
  };

  return (
    <div
      style={style}
      className={cn(
        "relative h-full overflow-hidden rounded-[1.05rem] bg-[#E8EEF2] transition-colors duration-500",
        active && "bg-[color-mix(in_srgb,var(--team-accent)_12%,white)]"
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 opacity-55 transition-opacity duration-500",
          active && "opacity-100"
        )}
        style={{
          background:
            "radial-gradient(circle at 68% 20%, color-mix(in srgb, var(--team-accent) 36%, transparent), transparent 36%), radial-gradient(circle at 22% 82%, color-mix(in srgb, var(--team-accent) 16%, transparent), transparent 42%)",
        }}
      />

      {member.image ? (
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top grayscale transition-[filter,transform,opacity] duration-500 ease-out",
            active ? "scale-[1.03] grayscale-0" : "scale-100 grayscale opacity-85"
          )}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-end overflow-hidden">
          <div
            aria-hidden="true"
            className={cn(
              "absolute top-[13%] aspect-square h-[36%] rounded-full bg-black/10 transition-[transform,background-color] duration-500",
              active && "-translate-y-0.5 scale-105 bg-[var(--team-accent)]"
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "absolute -bottom-[12%] h-[66%] w-[82%] rounded-t-[48%] bg-black/10 transition-[transform,background-color] duration-500",
              active && "scale-105 bg-[var(--team-accent)]"
            )}
          />
          <span className="relative z-10 mb-[18%] text-2xl font-bold tracking-tight text-[#000F1B] mix-blend-overlay">
            {initials(member.name)}
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#000F1B]/90 via-[#000F1B]/30 to-transparent transition-opacity duration-500",
          active ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

function TeamRevealGrid({ eyebrow, title, description, members = [] }) {
  const [internalActiveId, setInternalActiveId] = useState(members[0]?.id || null);
  const [interacting, setInteracting] = useState(false);

  const selectMember = useCallback((id) => setInternalActiveId(id), []);

  useEffect(() => {
    if (interacting || members.length < 2) return;

    const timer = window.setInterval(() => {
      setInternalActiveId((current) => {
        const idx = members.findIndex((m) => m.id === current);
        const next = (idx + 1) % members.length;
        return members[next].id;
      });
    }, 2800);

    return () => window.clearInterval(timer);
  }, [interacting, members]);

  return (
    <div className="relative w-full mx-auto max-w-6xl">
      <header className="mx-auto mb-10 md:mb-12 max-w-2xl text-center">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF5A00]">
          {eyebrow}
        </p>

        <h2 className="text-balance text-3xl sm:text-4xl font-bold tracking-tight text-[#000F1B]">
          <span className="relative inline-block">
            <span className="relative z-10">{title}</span>
            <svg
              aria-hidden="true"
              className="absolute -bottom-2 sm:-bottom-3 left-0 h-2 sm:h-3 w-full text-[#FF5A00]"
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M2 12 Q35 2 95 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
              >
                <animate
                  attributeName="stroke-dasharray"
                  values="0 1;1 0"
                  dur="700ms"
                  fill="freeze"
                />
              </path>
            </svg>
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm md:text-[15px] leading-relaxed text-[#000F1B]/60">
          {description}
        </p>
      </header>

      <ul className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5">
        {members.map((member) => {
          const active = member.id === internalActiveId;
          const detailsId = `team-member-${member.id}-details`;

          return (
            <li
              key={member.id}
              className="w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.95rem)] min-w-[100px] flex-shrink-0"
            >
              <button
                type="button"
                aria-expanded={active}
                aria-controls={detailsId}
                onClick={() => selectMember(member.id)}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") {
                    setInteracting(true);
                    selectMember(member.id);
                  }
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === "mouse") {
                    setInteracting(false);
                  }
                }}
                onFocus={() => {
                  setInteracting(true);
                  selectMember(member.id);
                }}
                onBlur={() => setInteracting(false)}
                className="group block w-full text-left outline-none"
              >
                <div
                  style={{ "--team-accent": member.accent ?? "#FF5A00" }}
                  className={cn(
                    "relative overflow-hidden rounded-[1.25rem] border bg-white/95 backdrop-blur-sm p-1.5 shadow-[0_10px_35px_-24px_rgba(0,0,0,0.15)] transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    active
                      ? "-translate-y-1 border-[color-mix(in_srgb,var(--team-accent)_50%,transparent)] shadow-[0_22px_48px_-28px_color-mix(in_srgb,var(--team-accent)_60%,transparent)]"
                      : "border-black/5"
                  )}
                >
                  <div
                    className={cn(
                      "h-44 sm:h-48 md:h-52 transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                      active && "h-60 sm:h-64 md:h-72"
                    )}
                  >
                    <Portrait member={member} active={active} />
                  </div>

                  <div
                    id={detailsId}
                    className={cn(
                      "absolute inset-x-3 sm:inset-x-4 bottom-3 z-10 transition-[opacity,transform] duration-500 ease-out",
                      active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    )}
                  >
                    <p className="line-clamp-3 text-[10px] sm:text-[11px] md:text-xs leading-relaxed text-white/90 font-medium">
                      {member.expertise}
                    </p>
                  </div>
                </div>

                <div className="px-1 pt-2.5 text-center">
                  <h3 className="truncate text-xs sm:text-sm md:text-base font-bold text-[#000F1B] tracking-tight">
                    {member.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-[10px] sm:text-[11px] md:text-xs font-medium transition-colors duration-300",
                      active ? "text-[#FF5A00]" : "text-[#000F1B]/60"
                    )}
                  >
                    {member.role}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}