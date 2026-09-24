import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Youtube, MessageSquare } from "lucide-react";
import BrandLockup from "@/components/site/BrandLockup";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Careers", to: "/about#careers" },
      { label: "Blog", to: "/blog" },
      { label: "Media", to: "/about#media" },
      { label: "Contact Us", to: "/contact" },
    ],
  },
  {
    title: "Packages",
    links: [
      { label: "Basic Package", to: "/packages/basic" },
      { label: "Essential Package", to: "/packages/essential" },
      { label: "Standard Package", to: "/packages/standard" },
      { label: "Premium Package", to: "/packages/premium" },
    ],
  },
  {
    title: "AI Platform",
    links: [
      { label: "AI Workspace", to: "/#ai-platform" },
      { label: "Project Management", to: "/#ai-platform" },
      { label: "Site Management", to: "/#ai-platform" },
      { label: "Documents", to: "/#ai-platform" },
      { label: "Finance", to: "/#ai-platform" },
      { label: "CRM", to: "/#ai-platform" },
      { label: "Enterprise", to: "/#ai-platform" },
    ],
  },
  {
    title: "Marketplace",
    links: [
      { label: "Materials", to: "/#marketplace" },
      { label: "Equipment", to: "/#marketplace" },
      { label: "Contractors", to: "/#marketplace" },
      { label: "Interiors", to: "/#marketplace" },
      { label: "Smart Home", to: "/#marketplace" },
    ],
  },
  {
    title: "Financial Services",
    links: [
      { label: "PayLater", to: "/#financial" },
      { label: "Loans", to: "/#financial" },
      { label: "Insurance", to: "/#financial" },
      { label: "Payment Gateway", to: "/#financial" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/contact" },
      { label: "FAQ", to: "/#faq" },
      { label: "Terms & Conditions", to: "/about#terms" },
      { label: "Privacy Policy", to: "/about#privacy" },
    ],
  },
];

export default function Footer({ settings }) {
  const s = settings || {};

  // Social media links: Facebook, Instagram, LinkedIn, and YouTube are disconnected (empty string) 
  // so they don't clash with backend, but Reddit is kept hardcoded as requested.
  const socialLinks = {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    reddit: "https://www.reddit.com/r/ConstructONS/",
  };

  return (
    <footer className="bg-brand-navy text-white" data-testid="site-footer">
      <div className="container-wide py-16">
        <div className="grid lg:grid-cols-[1.3fr_repeat(6,minmax(0,1fr))] gap-8">
          <div>
            <BrandLockup tone="dark" size="md" />
            <p className="mt-4 text-white/60 text-sm max-w-xs">
              India&rsquo;s most intelligent construction platform for premium home owners.
            </p>
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              <SocialLink href={socialLinks.facebook} icon={Facebook} title="Facebook" />
              <SocialLink href={socialLinks.instagram} icon={Instagram} title="Instagram" />
              <SocialLink href={socialLinks.linkedin} icon={Linkedin} title="LinkedIn" />
              <SocialLink href={socialLinks.youtube} icon={Youtube} title="YouTube" />
              <SocialLink href={socialLinks.reddit} icon={MessageSquare} title="Reddit" />
            </div>
          </div>

          {COLUMNS.map((c) => (
            <div key={c.title}>
              <div className="text-[10px] uppercase tracking-widest text-white/50 mb-4">{c.title}</div>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/85 hover:text-brand-orange transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div>© {new Date().getFullYear()} ConstructONS. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>{s.footer_note || "Made with love in India"}</span>
            <span className="text-white/25">·</span>
            <Link
              to="/admin/login"
              data-testid="footer-admin-link"
              className="text-white/50 hover:text-brand-orange transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon: Icon, title }) {
  // Always render the button icon even if href is empty/disconnected, 
  // but prevent clicking dead links if href is missing.
  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noreferrer" : undefined}
      title={title}
      onClick={(e) => {
        if (!href) e.preventDefault();
      }}
      className={`w-9 h-9 rounded-full grid place-items-center bg-white/5 transition ${
        href ? "hover:bg-brand-orange cursor-pointer" : "opacity-60 cursor-default"
      }`}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}