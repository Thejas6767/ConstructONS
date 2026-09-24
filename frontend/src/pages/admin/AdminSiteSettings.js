import React, { useEffect, useState } from "react";
import { publicApi, adminApi } from "@/lib/api";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

export default function AdminSiteSettings() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Use the official publicApi to fetch site settings to ensure correct headers and URL
    publicApi.getSiteSettings()
      .then((data) => {
        // If data is missing, provide a safe fallback so it doesn't spin forever
        setS(data || {
          company_name: "", tagline: "", phone: "", whatsapp: "", email: "", 
          address: "", google_maps_embed: "", footer_note: "", social_links: {}
        });
      })
      .catch((err) => {
        console.error("[AdminSiteSettings] failed to load settings", err);
        // Fallback on error to unlock the screen
        setS({
          company_name: "", tagline: "", phone: "", whatsapp: "", email: "", 
          address: "", google_maps_embed: "", footer_note: "", social_links: {}
        });
      });
  }, []);

  if (!s) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#FF5A00]" /></div>;

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSiteSettings(s);
      toast.success("Settings Saved Successfully");
    } catch (e) { 
      toast.error("Failed to save settings"); 
    } finally {
      setSaving(false);
    }
  };

  const update = (k, v) => setS({ ...s, [k]: v });
  const updateSocial = (k, v) => setS({ ...s, social_links: { ...(s.social_links || {}), [k]: v } });

  return (
    <div className="max-w-4xl font-['Poppins'] pb-12">
      <div className="text-xs font-semibold text-[#FF5A00] uppercase tracking-wider">CMS Management</div>
      <h1 className="mt-1 text-2xl font-bold text-[#000F1B]">Site Settings</h1>
      <p className="text-sm text-[#111111]/60 mt-1 mb-6">Manage your public website contact details and branding.</p>

      <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Company name" value={s.company_name} onChange={(v) => update("company_name", v)} />
          <Field label="Tagline" value={s.tagline} onChange={(v) => update("tagline", v)} />
          <Field label="Phone" value={s.phone} onChange={(v) => update("phone", v)} />
          <Field label="WhatsApp" value={s.whatsapp} onChange={(v) => update("whatsapp", v)} />
          <Field label="Email" value={s.email} onChange={(v) => update("email", v)} />
          <Field label="Address" value={s.address} onChange={(v) => update("address", v)} />
          <Field className="md:col-span-2" label="Google Maps Embed URL" value={s.google_maps_embed || ""} onChange={(v) => update("google_maps_embed", v)} />
          <Field className="md:col-span-2" label="Footer note" value={s.footer_note} onChange={(v) => update("footer_note", v)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mt-6">
        <div className="font-bold text-[#000F1B] mb-4">Social Links</div>
        <div className="grid md:grid-cols-2 gap-4">
          {["facebook","instagram","twitter","linkedin","youtube"].map((k) => (
            <Field key={k} label={k[0].toUpperCase()+k.slice(1)} value={s.social_links?.[k] || ""} onChange={(v) => updateSocial(k, v)} />
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={saving} className="bg-[#000F1B] hover:bg-[#FF5A00] text-white px-6 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-[#000F1B] mb-1.5">{label}</div>
      <input 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full rounded-xl border border-black/10 bg-[#F9FAFB] px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#FF5A00] focus:bg-white text-sm transition" 
      />
    </label>
  );
}