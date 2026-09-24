"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LucideIcon from "@/components/site/LucideIcon";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";

const FALLBACK_ICON = "Check";

/* ================================================================
   BRAND HEADING WITH POWER BUTTON "O"
================================================================ */
function BrandTitle() {
  return (
    <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-950 lg:text-5xl lg:leading-[1.15]">
      Your Journey With{" "}
      <span className="inline-flex items-center align-middle">
        <span>Construct</span>
        {/* Power Icon replacing 'O' */}
        <span className="mx-[0.05em] inline-flex items-center justify-center text-orange-500">
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
        <span className="text-orange-500">NS</span>
      </span>
    </h2>
  );
}

export default function CustomerJourney({ steps = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * Ultra-Fast Auto Progression (1.2 Seconds per step)
   */
  useEffect(() => {
    if (!steps.length) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => clearInterval(timer);
  }, [steps.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [steps]);

  if (!steps.length) return null;

  const activeStep = steps[activeIndex];

  const getPosition = (index) => {
    const RADIUS = 210;
    const DIAG = Math.round(RADIUS * 0.7071);

    const positions = [
      { x: 0, y: -RADIUS, dir: "top" },
      { x: DIAG, y: -DIAG, dir: "top-right" },
      { x: RADIUS, y: 0, dir: "right" },
      { x: DIAG, y: DIAG, dir: "bottom-right" },
      { x: 0, y: RADIUS, dir: "bottom" },
      { x: -DIAG, y: DIAG, dir: "bottom-left" },
      { x: -RADIUS, y: 0, dir: "left" },
      { x: -DIAG, y: -DIAG, dir: "top-left" },
    ];

    return positions[index % positions.length];
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-orange-50/70 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* =========================================================
            DESKTOP TWO-COLUMN LAYOUT
        ========================================================== */}
        <div className="hidden items-center justify-between gap-8 md:grid md:grid-cols-12">
          
          {/* LEFT SIDE: HEADING SECTION WITH POWER BUTTON O */}
          <div className="z-10 md:col-span-5 lg:col-span-4">
            <FadeIn>
              <div className="text-left">
                <SectionLabel>OUR PROCESS</SectionLabel>

                <BrandTitle />

                <p className="mt-5 text-sm leading-relaxed text-gray-500 lg:text-base">
                  From the first conversation to handing over your dream home,
                  every stage is carefully planned and executed.
                </p>

                {/* Active step tracker badge */}
                <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 shadow-sm">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-700">
                    Step {activeIndex + 1} of {steps.length}: {activeStep?.name}
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* RIGHT SIDE: ORBIT SYSTEM */}
          <div className="relative flex justify-end md:col-span-7 lg:col-span-8">
            <div className="relative h-[560px] w-[560px] translate-x-4 lg:translate-x-10">
              
              {/* Orbital Guide Ring */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gray-200/80" />

              {/* CENTER LOGO */}
              <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.15, 0.25, 0.15],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-[-25px] rounded-full bg-orange-400 blur-2xl"
                />

                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-gray-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
                  <img
                    src="/logo.webp"
                    alt="ConstructONS"
                    className="h-16 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                </div>
              </div>

              {/* JOURNEY STEPS */}
              {steps.map((step, index) => {
                const position = getPosition(index);
                const isActive = index === activeIndex;

                return (
                  <motion.div
                    key={step.id || index}
                    className="absolute left-1/2 top-1/2"
                    animate={{
                      x: position.x,
                      y: position.y,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                  >
                    {/* ICON BUTTON */}
                    <motion.button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.92 }}
                      animate={{ scale: isActive ? 1.15 : 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className={`relative z-30 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-colors ${
                        isActive
                          ? "border-orange-500 bg-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.40)]"
                          : "border-gray-200 bg-white text-gray-600 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-orange-300 hover:text-orange-500"
                      }`}
                      aria-label={step.name}
                    >
                      <span className="relative z-10">
                        <LucideIcon
                          name={step.icon || FALLBACK_ICON}
                          size={20}
                          strokeWidth={2}
                        />
                      </span>

                      {isActive && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: [0.6, 0, 0.6],
                            scale: [1, 1.35, 1],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="pointer-events-none absolute inset-[-6px] rounded-full border border-orange-400"
                        />
                      )}
                    </motion.button>

                    {/* FLOATING OUTSIDE DETAIL CARD */}
                    <AnimatePresence mode="wait">
                      {isActive && (
                        <motion.div
                          key={`details-${index}`}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{
                            duration: 0.18,
                            ease: "easeOut",
                          }}
                          className={`pointer-events-none absolute z-40 w-[210px] rounded-2xl border border-gray-100 bg-white/95 p-3.5 shadow-[0_15px_45px_rgba(0,0,0,0.12)] backdrop-blur-md ${getDetailPositionClass(
                            position.dir
                          )}`}
                        >
                          <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.20em] text-orange-500">
                            Step {index + 1}
                          </div>

                          <h3 className="text-sm font-bold leading-tight text-gray-950">
                            {step.name}
                          </h3>

                          <p className="mt-1 text-xs leading-relaxed text-gray-500">
                            {step.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================
            MOBILE LAYOUT
        ========================================================== */}
        <div className="md:hidden">
          <FadeIn>
            <div className="mb-8 text-center">
              <SectionLabel>OUR PROCESS</SectionLabel>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950">
                Your Journey With{" "}
                <span className="inline-flex items-center align-middle">
                  <span>Construct</span>
                  <span className="mx-[0.05em] inline-flex items-center justify-center text-orange-500">
                    <svg
                      className="h-[0.80em] w-[0.80em] fill-none stroke-current stroke-[3.5] align-middle"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 5.636a9 9 0 11-12.728 0M12 2v10"
                      />
                    </svg>
                  </span>
                  <span className="text-orange-500">NS</span>
                </span>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                From the first conversation to handing over your dream home.
              </p>
            </div>
          </FadeIn>

          <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-100 bg-white shadow-lg">
              <img
                src="/logo.webp"
                alt="ConstructONS"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={step.id || index}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "border-gray-200 bg-white text-gray-600 shadow-sm"
                  }`}
                >
                  <LucideIcon
                    name={step.icon || FALLBACK_ICON}
                    size={18}
                    strokeWidth={1.8}
                  />
                </motion.button>
              );
            })}
          </div>

          <div className="mx-auto mt-6 max-w-sm text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id || activeIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-100/50"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.20em] text-orange-500">
                  Step {activeIndex + 1}
                </div>

                <h3 className="mt-1.5 text-base font-bold text-gray-950">
                  {activeStep.name}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {activeStep.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   OUTSIDE CARD PLACEMENT
   ================================================================ */
function getDetailPositionClass(direction) {
  switch (direction) {
    case "top":
      return "bottom-[58px] left-1/2 -translate-x-1/2 text-center";

    case "top-right":
      return "bottom-[42px] left-[42px] text-left";

    case "right":
      return "top-1/2 left-[58px] -translate-y-1/2 text-left";

    case "bottom-right":
      return "top-[42px] left-[42px] text-left";

    case "bottom":
      return "top-[58px] left-1/2 -translate-x-1/2 text-center";

    case "bottom-left":
      return "top-[40px] right-[40px] text-right";

    case "left":
      return "bottom-[20px] right-[48px] text-right";

    case "top-left":
      return "bottom-[40px] right-[40px] text-right";

    default:
      return "top-1/2 left-[58px] -translate-y-1/2 text-left";
  }
}