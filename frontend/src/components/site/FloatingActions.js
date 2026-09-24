import React from "react";
import { motion } from "framer-motion";

// Official WhatsApp Brand SVG
const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.622-.918-2.218-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.554 4.108 1.522 5.834L0 24l6.326-1.485C8.006 23.473 9.948 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.84 0-3.585-.48-5.112-1.321l-.367-.202-3.757.881.986-3.626-.226-.37C2.637 15.82 2 13.974 2 12 2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
  </svg>
);

// Sleek Phone Icon SVG
const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function FloatingActions({ phone, whatsapp }) {
  const wa = (whatsapp || "").replace(/\D/g, "");

  if (!phone && !wa) return null;

  return (
    // Anchored strictly to BOTTOM RIGHT
    <div className="fixed right-4 bottom-6 md:right-6 md:bottom-8 z-50 flex flex-col gap-3.5 items-end">
      {/* Phone Action */}
      {phone && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="relative group flex items-center"
        >
          {/* Hover Tooltip */}
          <span className="hidden md:block pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-md opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            Call Us Now
          </span>

          <motion.a
            href={`tel:${phone}`}
            data-testid="float-call"
            aria-label="Call Us"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/30 transition-all duration-300 hover:shadow-brand-orange/50"
          >
            <span className="absolute inset-0 rounded-full bg-brand-orange opacity-40 animate-ping pointer-events-none" />
            <PhoneIcon className="relative z-10 w-5 h-5" />
          </motion.a>
        </motion.div>
      )}

      {/* WhatsApp Action */}
      {wa && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative group flex items-center"
        >
          {/* Hover Tooltip */}
          <span className="hidden md:block pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-gray-900/90 px-3 py-1.5 text-xs font-medium text-white shadow-xl backdrop-blur-md opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
            Chat on WhatsApp
          </span>

          <motion.a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            data-testid="float-whatsapp"
            aria-label="Chat on WhatsApp"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all duration-300 hover:shadow-[#25D366]/50"
          >
            <span className="absolute -inset-1 rounded-full bg-[#25D366]/20 blur-sm pointer-events-none group-hover:bg-[#25D366]/40 transition-colors" />
            <WhatsAppIcon className="relative z-10 w-6 h-6" />
          </motion.a>
        </motion.div>
      )}
    </div>
  );
}