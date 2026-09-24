"use client";

import React from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Power,
} from "lucide-react";
import { FadeIn, SectionLabel } from "@/components/site/Primitives";
import { useLeadModal } from "@/components/site/LeadModalProvider";

export default function ContactCTA({ settings = {} }) {
  const { open } = useLeadModal();

  // Dynamic values from backend settings
  const phone = settings?.phone || settings?.contact_phone || "";
  const whatsapp = settings?.whatsapp || settings?.phone || "";
  const email = settings?.email || settings?.support_email || "";
  
  const googleMapsUrl = settings?.map_direction_url || settings?.google_maps_url || "";
  const googleMapsEmbed = settings?.map_embed_url || settings?.google_maps_embed || "";

  const waNumber = String(whatsapp).replace(/\D/g, "");
  const waLink = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi ConstructONS, I'd like a free consultation for my home construction.")}`
    : "#";
  const waQr = waNumber
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=12&data=${encodeURIComponent(waLink)}`
    : "";

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-14 md:py-20 lg:py-24 scroll-mt-20 bg-white font-['Poppins',sans-serif] selection:bg-[#FF5A00] selection:text-white overflow-hidden"
    >
      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-10 max-w-2xl">
          <FadeIn>
            <SectionLabel number={10} eyebrow="Get In Touch" />
            <h2 className="mt-3 text-[#000F1B] font-bold text-3xl sm:text-4xl md:text-[40px] leading-[1.1] tracking-tight">
              Let&rsquo;s Build Your{" "}
              <span className="text-[#FF5A00]">Dream Home</span> Together
            </h2>
            <p className="mt-2 text-[#000F1B]/55 text-sm leading-relaxed max-w-lg">
              Talk to our team — free, no obligation. We&rsquo;ll help you pick the
              right home and package.
            </p>
          </FadeIn>
        </div>

        {/* ============================================================
            MAIN BOX — contacts + map + mobile QR
        ============================================================ */}
        <div className="rounded-[28px] border border-black/5 bg-[#F7F7F7] p-2 sm:p-3 shadow-sm">
          <div className="rounded-[22px] bg-white overflow-hidden">
            {/* Top: channels */}
            <div className="p-5 sm:p-6 md:p-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <ContactItem
                  icon={Phone}
                  label="Call Us"
                  value={phone || "Loading..."}
                  href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
                  testId="contact-call"
                />
                <ContactItem
                  icon={MessageCircle}
                  label="WhatsApp"
                  value={whatsapp || "Loading..."}
                  href={waLink}
                  testId="contact-whatsapp"
                />
                <ContactItem
                  icon={Mail}
                  label="Email Us"
                  value={email || "Loading..."}
                  href={email ? `mailto:${email}` : "#"}
                  testId="contact-email"
                />
              </div>
            </div>

            <div className="h-px bg-black/5 mx-5 sm:mx-6 md:mx-7" />

            {/* Middle: map + Phone QR mockup */}
            <div className="grid lg:grid-cols-[1fr_auto] gap-0">
              {/* MAP */}
              <div className="relative min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] bg-[#E8EEF2] border-t lg:border-t-0 lg:border-r border-black/5">
                {googleMapsEmbed ? (
                  <iframe
                    title="Office Location Map"
                    src={googleMapsEmbed}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">Map loading...</div>
                )}

                {/* Location Overlay Card */}
                <a
                  href={googleMapsUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute left-3 sm:left-4 top-3 rounded-xl bg-white/95 backdrop-blur-md border border-black/10 p-3 shadow-lg flex items-center justify-between gap-4 hover:bg-slate-50 transition group"
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-5 h-5 text-[#FF5A00] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF5A00]">
                        View Location
                      </div>
                      
                      {/* Styled Company Title with Larger/Darker Power Button "O" */}
                      <div className="text-base font-bold text-[#000F1B] leading-snug mt-0.5 flex items-center tracking-tight">
                        <span>Construct</span>
                        <span className="text-[#FF5A00] flex items-center ml-[1px]">
                          {/* Larger, Darker Orange Power Button "O" */}
                          <Power className="w-4 h-4 stroke-[3.5] text-[#E04F00] inline-block transform translate-y-[-0.5px] -mr-[0.5px]" />
                          NS
                        </span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#000F1B]/40 shrink-0 group-hover:text-[#000F1B] transition-colors" />
                </a>
              </div>

              {/* QR inside Mobile Mockup */}
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:w-[260px] bg-slate-50/50 border-t lg:border-t-0 border-black/5">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#000F1B]/40 mb-3">
                  Scan WhatsApp QR
                </div>

                {/* Smartphone Container */}
                <div className="relative w-[180px] h-[320px] bg-black rounded-[26px] p-[5px] shadow-xl border border-slate-900 shrink-0">
                  {/* Dynamic Island / Camera Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-black rounded-full z-20 flex items-center justify-between px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#131333]" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  </div>

                  {/* Smartphone Screen */}
                  <div className="w-full h-full rounded-[21px] bg-gradient-to-b from-[#0F172A] via-[#000F1B] to-[#1E293B] relative overflow-hidden flex flex-col items-center justify-between p-3 pt-7 text-white">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 text-[9px] font-medium tracking-wide text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>WhatsApp</span>
                    </div>

                    {/* QR Code Container */}
                    <div className="w-[125px] h-[125px] bg-white rounded-xl p-1.5 shadow-md flex items-center justify-center">
                      {waQr ? (
                        <img
                          src={waQr}
                          alt="Scan to chat on WhatsApp"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-400">Loading...</div>
                      )}
                    </div>

                    {/* Home Indicator */}
                    <div className="flex flex-col items-center gap-1.5 w-full pb-0.5">
                      <span className="text-[9px] text-white/50 font-medium">Scan to connect</span>
                      <div className="w-10 h-1 bg-white/30 rounded-full" />
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[10px] text-[#000F1B]/45 text-center leading-snug max-w-[160px]">
                  Point your phone camera at the screen to start chatting
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            FULL-WIDTH BOTTOM BAR — hours, trust, CTA
        ============================================================ */}
        <div className="mt-4 md:mt-5 rounded-[22px] border border-black/5 bg-[#000F1B] text-white p-4 sm:p-5 md:px-8 md:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 flex-1">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 text-[#FF5A00] shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    Mon – Sat · 9:00 AM – 7:00 PM
                  </div>
                  <div className="text-[11px] text-white/45 mt-0.5">
                    Average response under 30 mins
                  </div>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-white/10" />

              <div className="flex items-center gap-2 text-[12px] text-white/55">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Free &amp; no obligation · Your data stays private
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
              <a
                href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold px-5 py-3 transition"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <button
                type="button"
                onClick={() => open({ source: "contact" })}
                data-testid="contact-cta"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] hover:bg-[#E04F00] text-white font-semibold text-sm px-6 py-3 shadow-[0_10px_28px_rgba(255,90,0,0.35)] transition"
              >
                Get Free Consultation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href={phone ? `tel:${phone.replace(/\s+/g, "")}` : "#"}
            className="rounded-2xl border border-black/5 bg-[#F7F7F7] hover:border-[#FF5A00]/30 hover:bg-white p-4 flex items-center gap-3 transition"
          >
            <span className="w-10 h-10 rounded-full bg-[#FF5A00]/10 text-[#FF5A00] grid place-items-center">
              <Phone className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#000F1B]/40 font-bold">
                Call
              </div>
              <div className="text-sm font-semibold text-[#000F1B]">{phone || "Loading..."}</div>
            </div>
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-black/5 bg-[#F7F7F7] hover:border-emerald-500/30 hover:bg-white p-4 flex items-center gap-3 transition"
          >
            <span className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center">
              <MessageCircle className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#000F1B]/40 font-bold">
                WhatsApp
              </div>
              <div className="text-sm font-semibold text-[#000F1B]">
                Chat instantly
              </div>
            </div>
          </a>
          <a
            href={email ? `mailto:${email}` : "#"}
            className="rounded-2xl border border-black/5 bg-[#F7F7F7] hover:border-[#FF5A00]/30 hover:bg-white p-4 flex items-center gap-3 transition"
          >
            <span className="w-10 h-10 rounded-full bg-[#FF5A00]/10 text-[#FF5A00] grid place-items-center">
              <Mail className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-[#000F1B]/40 font-bold">
                Email
              </div>
              <div className="text-sm font-semibold text-[#000F1B] truncate">
                {email || "Loading..."}
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, label, value, href, testId }) {
  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className="flex items-center gap-3 group"
      data-testid={testId}
    >
      <div className="w-11 h-11 rounded-full bg-[#FF5A00]/10 grid place-items-center group-hover:bg-[#FF5A00] group-hover:text-white text-[#FF5A00] transition-colors shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-[#000F1B]/45 uppercase tracking-widest font-semibold">
          {label}
        </div>
        <div className="text-sm font-semibold text-[#000F1B] truncate">
          {value}
        </div>
      </div>
    </a>
  );
}