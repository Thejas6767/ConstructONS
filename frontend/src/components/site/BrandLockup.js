import React from "react";
import { Power } from "lucide-react";

/**
 * ConstructONS Brand Lockup
 *
 * Header:
 * [LOGO] Construct⏻NS™
 *        EVERYTHING CONSTRUCTION. ALWAYS ON.
 *
 * Footer / Text only:
 * Construct⏻NS™
 * EVERYTHING CONSTRUCTION. ALWAYS ON.
 */

export default function BrandLockup({
  tone = "light",
  size = "md",
  className = "",
  responsive = false,
  showLogo = true,
}) {
  const isDark = tone === "dark";

  const sizes =
    {
      sm: {
        mark: "h-7 w-7",
        word: "text-[15px]",
        power: "h-[12px] w-[12px]",
        tm: "text-[7px]",
        tag: "text-[7px]",
      },

      md: {
        mark: "h-9 w-9",
        word: "text-[19px]",
        power: "h-[20px] w-[20px]",
        tm: "text-[8px]",
        tag: "text-[8px]",
      },

      lg: {
        mark: "h-11 w-11",
        word: "text-[24px]",
        power: "h-[18px] w-[18px]",
        tm: "text-[10px]",
        tag: "text-[9px]",
      },
    }[size] || {};

  return (
    <div
      className={`
        flex items-center
        ${showLogo ? "gap-2.5" : ""}
        min-w-0
        ${className}
      `}
    >
      {/* =========================================
          LOGO
          ========================================= */}
      {showLogo && (
        <div className="shrink-0">
          <img
            src="/logo.webp"
            alt=""
            aria-hidden="true"
            className={`${sizes.mark} object-contain`}
          />
        </div>
      )}

      {/* =========================================
          WORDMARK
          ========================================= */}
      <div className="min-w-0 leading-none">

        {/* Construct⏻NS™ - KEEP EVERYTHING ON ONE LINE */}
        <div className="flex items-center whitespace-nowrap">

          {/* Construct */}
          <span
            className={`
              ${sizes.word}
              font-[Poppins]
              font-semibold
              tracking-[-0.02em]
              whitespace-nowrap
              ${isDark ? "text-white" : "text-[#000F1B]"}
            `}
          >
            Construct
          </span>

          {/* Power-button O */}
      <Power
  className={`
    ${sizes.power}
    mx-[2px]
    shrink-0
    text-[#FF5A00]
  `}
  strokeWidth={3.5}
/>

          {/* NS */}
          <span
            className={`
              ${sizes.word}
              font-[Poppins]
              font-extrabold
              tracking-[-0.02em]
              whitespace-nowrap
              text-[#FF5A00]
            `}
          >
            NS
          </span>

          {/* Trademark */}
          <sup
            className={`
              ml-[2px]
              self-start
              font-[Poppins]
              font-semibold
              ${sizes.tm}
              ${
                isDark
                  ? "text-white/70"
                  : "text-[#000F1B]/60"
              }
            `}
          >
          TM
          </sup>
        </div>

        {/* =========================================
            TAGLINE
            ========================================= */}
        <div
          className={`
            mt-1
            font-[Poppins]
            font-semibold
            uppercase
            whitespace-nowrap
            ${sizes.tag}
            ${responsive ? "hidden sm:block" : ""}
            ${
              isDark
                ? "text-white/70"
                : "text-[#000F1B]/60"
            }
          `}
          style={{
            letterSpacing: "0.12em",
          }}
        >
          Everything Construction. Always On.
        </div>
      </div>
    </div>
  );
}