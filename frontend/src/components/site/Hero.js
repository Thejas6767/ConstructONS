import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Power } from "lucide-react";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function Hero() {
  const { open: openLead } = useLeadModal();

  return (
    <section
      id="top"
      data-testid="hero-section"
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#000F1B]"
    >
      {/* -------------------------------------------------
          BACKGROUND IMAGE & SMART OVERLAYS
      -------------------------------------------------- */}
      <div className="absolute inset-0">

        {/* Construction Background Image */}
        <img
          src="/hero-construction.png"
          alt="Construction site"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
        />

        {/* 1. Base darkening */}
        <div className="absolute inset-0 bg-[#000F1B]/25" />

        {/* 2. Strong left-side text protection */}
        <div className="absolute inset-0 w-full bg-gradient-to-r from-[#000F1B]/95 via-[#000F1B]/65 to-[#000F1B]/15 md:w-[85%]" />

        {/* 3. Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#000F1B] to-transparent" />

      </div>

      {/* -------------------------------------------------
          HERO CONTENT
      -------------------------------------------------- */}
      <div className="relative z-10 flex min-h-[100svh] items-center">
        <div className="mx-auto w-full max-w-[1536px] px-5 py-28 sm:px-8 md:px-12 md:py-36 lg:px-16 xl:px-20 2xl:px-24">

          <div className="max-w-4xl">

            {/* Brand Kicker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mb-6 flex items-center gap-4"
            >
              {/* Orange line */}
              <span className="h-[2px] w-12 bg-[#FF5A00]" />

              {/* ConstructONS */}
              <div className="flex items-center whitespace-nowrap">

                {/* Construct */}
                <span className="font-[Poppins] text-[13px] font-semibold tracking-[0.12em] text-white">
                  Construct
                </span>

                {/* Power-button O */}
                <Power
                  className="mx-[2px] h-[15px] w-[15px] shrink-0 text-[#FF5A00]"
                  strokeWidth={3.5}
                />

                {/* NS */}
                <span className="font-[Poppins] text-[13px] font-extrabold tracking-[0.08em] text-[#FF5A00]">
                  NS
                </span>

                {/* TM */}
                <sup className="ml-[2px] mt-[-5px] font-[Poppins] text-[7px] font-semibold text-[#FF5A00]">
                  ™
                </sup>

              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-[Poppins] text-4xl font-bold leading-[1.25] tracking-tight text-white sm:text-5xl sm:leading-[1.2] md:text-6xl md:leading-[1.18] lg:text-[64px] lg:leading-[1.15]"
            >
              Your trusted partner for <br className="hidden lg:block" />
              every stage of{" "}
              <span className="text-[#FF5A00]">
                home construction.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 max-w-2xl font-[Poppins] text-base font-light leading-relaxed text-white/80 md:text-lg"
            >
              From the first blueprint to the final handover, we make your
              dream home a reality with transparency, quality and trust.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <a
                href="/about"
                className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#FF5A00] px-8 py-3 font-[Poppins] text-base font-medium text-white transition-all duration-300 hover:bg-[#FF2D00] hover:shadow-[0_8px_25px_rgba(255,90,0,0.3)] sm:w-auto"
              >
                Explore Our Ecosystem

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <button
                type="button"
                onClick={() => openLead({ source: "hero" })}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-3 font-[Poppins] text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-[#FF5A00] hover:bg-[#FF5A00]/10 hover:text-[#FF5A00] sm:w-auto"
              >
                Talk to an Expert
              </button>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}