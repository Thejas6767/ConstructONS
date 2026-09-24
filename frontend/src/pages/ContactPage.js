"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  ExternalLink,
  Building2,
  Navigation,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
} from "lucide-react";

import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { publicApi } from "@/lib/api";

/* =========================================================
   CUSTOM POWER BUTTON O SVG (Matches ConstructONS Logo)
========================================================= */
function PowerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

/* =========================================================
   BRAND LOCKUP COMPONENT (With Power Button 'O')
========================================================= */
function BrandLockup({ tone = "light", size = "md" }) {
  const isDark = tone === "dark";
  const textColor = isDark ? "text-white" : "text-[#000F1B]";
  const orangeColor = "text-[#FF5A00]";

  const sizeClasses = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  }[size] || "text-xl";

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size] || "w-5 h-5";

  return (
    <div className={`font-black tracking-tight flex items-center ${sizeClasses}`}>
      <span className={textColor}>Construct</span>
      <span className={`inline-flex items-center ${orangeColor}`}>
        <PowerIcon className={`${iconSizes} mx-[0.5px] stroke-[3.5]`} />
        <span>NS</span>
      </span>
    </div>
  );
}

/* =========================================================
   CUSTOM REDDIT ICON
========================================================= */
function RedditIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.566 3.875a.384.384 0 0 0-.271.112.38.38 0 0 0 0 .54c.732.732 2.012.982 3.087.982 1.075 0 2.355-.25 3.087-.982a.38.38 0 0 0 0-.54.384.384 0 0 0-.542 0c-.517.517-1.57.731-2.545.731-.976 0-2.028-.214-2.545-.731a.382.382 0 0 0-.271-.112z" />
    </svg>
  );
}

// Claymorphic style for social links
const customSocialCardStyle = {
  background: "rgb(223, 225, 235)",
  borderRadius: "32px",
  boxShadow:
    "rgba(0, 0, 0, 0.17) 0px -15px 20px 0px inset, rgba(0, 0, 0, 0.15) 0px -25px 25px 0px inset, rgba(0, 0, 0, 0.1) 0px -50px 30px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px",
};

export default function ContactPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    publicApi
      .getSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  // Dynamic Contact Details from backend settings with fallbacks
  const phone = settings?.phone || settings?.contact_phone || "";
  const whatsapp = settings?.whatsapp || settings?.phone || "";
  const email = settings?.email || settings?.support_email || "";

  // Dynamic Map URLs from backend settings
  const directMapUrl = settings?.map_direction_url || settings?.google_maps_url || "";
  const mapEmbed = settings?.map_embed_url || settings?.google_maps_embed || "";

  // Formatted WhatsApp URL
  const waNumber = String(whatsapp).replace(/\D/g, "");
  const waLink = waNumber 
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi ConstructONS, I'd like a consultation for my construction project.")}`
    : "#";
  const waQr = waNumber
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(waLink)}`
    : "";

  // Social Media Links mapped dynamically from backend settings, with hardcoded fallback/override for Reddit
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: settings?.social_instagram || settings?.social_links?.instagram || "",
      brandBg: "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600",
      textColor: "text-[#E4405F]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: settings?.social_linkedin || settings?.social_links?.linkedin || "",
      brandBg: "bg-[#0A66C2]",
      textColor: "text-[#0A66C2]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: settings?.social_facebook || settings?.social_links?.facebook || "",
      brandBg: "bg-[#1877F2]",
      textColor: "text-[#1877F2]",
    },
    {
      name: "Reddit",
      icon: RedditIcon,
      url: "https://www.reddit.com/r/ConstructONS/",
      brandBg: "bg-[#FF4500]",
      textColor: "text-[#FF4500]",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: settings?.social_youtube || settings?.social_links?.youtube || "",
      brandBg: "bg-[#FF0000]",
      textColor: "text-[#FF0000]",
    },
  ];

  return (
    <div className="bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white min-h-screen">
      <Header />

      <main className="pt-0">
        {/* ================= HERO SECTION ================= */}
        <section
          className="relative pt-28 md:pt-36 pb-16 md:pb-24 bg-cover bg-center bg-no-repeat overflow-hidden border-b border-black/10"
          style={{ backgroundImage: "url('/images/contact/contacthero.webp')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#000F1B]/90 via-[#000F1B]/80 to-[#000F1B]/95 backdrop-blur-[2px]" />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-xl"
              >
                <BrandLockup tone="dark" size="md" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                Let&rsquo;s Connect &amp; Build <br className="hidden sm:inline" />
                <span className="text-[#FF5A00]">Your Dream Space</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-white/75 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl"
              >
                Reach out directly via phone, WhatsApp, or email. Visit our headquarters or scan the QR code to chat directly with our engineering team.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs font-semibold text-white/90"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free Consultation</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-[#FF5A00]" />
                  <span>Bengaluru HQ</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT CARDS ================= */}
        <section className="py-16 md:py-24 bg-white overflow-hidden">
          <div className="container-wide">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 max-w-6xl mx-auto py-4">
              
              {/* Card 1: Call Directly */}
              <a
                href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
                className="relative rounded-lg -skew-x-6 -translate-y-2 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-72 h-44 p-2 bg-neutral-900 transition-all [box-shadow:12px_12px_0px_#000F1B] hover:[box-shadow:4px_4px_0px_#000F1B] block group border border-white/10"
              >
                <figure className="w-full h-full relative overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80"
                    alt="Call ConstructONS"
                    className="w-full h-full object-cover rounded-lg brightness-50 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF5A00] text-white grid place-items-center shadow-md">
                    <Phone className="w-4 h-4" />
                  </div>
                </figure>
                <div className="absolute text-neutral-50 bottom-4 left-0 px-5 z-10">
                  <span className="font-bold text-base block tracking-wide text-white">
                    Call Us Directly
                  </span>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5 font-mono">
                    {phone || "Loading..."} • Mon - Sat 9am to 7pm
                  </p>
                </div>
              </a>

              {/* Card 2: WhatsApp Chat */}
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="relative rounded-lg -skew-x-6 -translate-y-2 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-72 h-44 p-2 bg-neutral-900 transition-all [box-shadow:12px_12px_0px_#10B981] hover:[box-shadow:4px_4px_0px_#10B981] block group border border-white/10"
              >
                <figure className="w-full h-full relative overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=600&q=80"
                    alt="WhatsApp Consultation"
                    className="w-full h-full object-cover rounded-lg brightness-50 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center shadow-md">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                </figure>
                <div className="absolute text-neutral-50 bottom-4 left-0 px-5 z-10">
                  <span className="font-bold text-base block tracking-wide text-white">
                    WhatsApp Chat
                  </span>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
                    Send plot dimensions &amp; get instant cost estimation.
                  </p>
                </div>
              </a>

              {/* Card 3: Email Proposals */}
              <a
                href={email ? `mailto:${email}` : "#"}
                className="relative rounded-lg -skew-x-6 -translate-y-2 hover:-translate-y-1 hover:-translate-x-0 hover:skew-x-0 duration-500 w-72 h-44 p-2 bg-neutral-900 transition-all [box-shadow:12px_12px_0px_#FF5A00] hover:[box-shadow:4px_4px_0px_#FF5A00] block group border border-white/10"
              >
                <figure className="w-full h-full relative overflow-hidden rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80"
                    alt="Email ConstructONS"
                    className="w-full h-full object-cover rounded-lg brightness-50 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FF5A00] text-white grid place-items-center shadow-md">
                    <Mail className="w-4 h-4" />
                  </div>
                </figure>
                <div className="absolute text-neutral-50 bottom-4 left-0 px-5 z-10">
                  <span className="font-bold text-base block tracking-wide text-white">
                    Email Proposals
                  </span>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5 font-mono">
                    {email || "Loading..."}
                  </p>
                </div>
              </a>
            </div>

            {/* WhatsApp QR Banner */}
            <div className="mt-12 rounded-3xl border border-black/10 bg-slate-900/[0.02] backdrop-blur-md p-5 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-2xl border border-black/10 shadow-md shrink-0">
                  {waQr ? (
                    <img
                      src={waQr}
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading...</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-3 py-1 rounded-full inline-block mb-2">
                    Quick Connect
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#000F1B]">
                    Scan QR code to start a WhatsApp chat
                  </h3>
                  <p className="text-xs text-[#000F1B]/60 max-w-md mt-1 leading-relaxed">
                    Point your camera at the screen to start chatting instantly without saving contact details.
                  </p>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3.5 shadow-lg shadow-emerald-600/20 transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* ================= SOCIAL LINKS SECTION ================= */}
        <section className="py-14 bg-slate-50 border-t border-black/5">
          <div className="container-wide">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF5A00] mb-1">
                Social Channels
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#000F1B] tracking-tight">
                Follow ConstructONS Online
              </h2>
              <p className="text-xs text-[#000F1B]/60 mt-1">
                Stay updated with our ongoing site construction photos, design trends, and architectural updates.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-7">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                const hasValidUrl = Boolean(social.url && social.url !== "#");

                return (
                  <a
                    key={social.name}
                    href={social.url || "#"}
                    onClick={(e) => {
                      if (!hasValidUrl) {
                        e.preventDefault();
                      }
                    }}
                    target={hasValidUrl ? "_blank" : undefined}
                    rel={hasValidUrl ? "noreferrer" : undefined}
                    style={customSocialCardStyle}
                    className={`w-[145px] h-[175px] p-4 flex flex-col justify-center items-center text-center transition-all duration-300 group ${
                      hasValidUrl ? "hover:-translate-y-2 cursor-pointer" : "cursor-default opacity-90"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${social.brandBg} text-white grid place-items-center mb-3 shadow-lg ${
                        hasValidUrl ? "group-hover:scale-110" : ""
                      } transition-transform duration-300`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span className={`text-xs font-black ${social.textColor}`}>
                      {social.name}
                    </span>

                    <span className="text-[10px] font-semibold text-[#000F1B]/50 mt-1 flex items-center gap-1">
                      <span>{hasValidUrl ? "Follow" : "Coming Soon"}</span>
                      {hasValidUrl && <ExternalLink className="w-2.5 h-2.5" />}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= MAP LOCATION SECTION ================= */}
        <section className="py-12 md:py-20 bg-white border-t border-black/10 relative overflow-hidden">
          <div className="container-wide relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#FF5A00] mb-2">
                  Head Office &amp; Studio
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#000F1B] tracking-tight">
                  Visit Us in Person
                </h2>
              </div>

              <a
                href={directMapUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5A00] hover:underline"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Map Box */}
            <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-black/10 shadow-xl bg-slate-50 min-h-[380px] lg:min-h-[480px]">
              {/* Google Maps iFrame */}
              {mapEmbed ? (
                <iframe
                  title="ConstructONS Office Location Map"
                  src={mapEmbed}
                  className="absolute inset-0 w-full h-full border-0 transition-all duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">Map loading...</div>
              )}

              {/* TOP-LEFT CUSTOM MAP BADGE (EXACT DESIGN MATCH) */}
              <a
                href={directMapUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 left-4 z-20 bg-white px-3.5 py-2.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center gap-3 hover:shadow-xl transition-all duration-200 group"
              >
                {/* Orange Map Pin Circle */}
                <div className="w-7 h-7 rounded-full border-2 border-[#FF5A00] grid place-items-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-[#FF5A00] rounded-full" />
                </div>

                {/* View Location Title + Brand Logo (with Power Button 'O') */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#FF5A00] leading-none mb-1">
                    VIEW LOCATION
                  </span>
                  <BrandLockup tone="light" size="sm" />
                </div>

                {/* External Link Arrow Icon on the right */}
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#FF5A00] transition-colors ml-1" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer settings={settings} />
    </div>
  );
}