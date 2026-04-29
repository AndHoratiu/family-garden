"use client";

import { useEffect, useState } from "react";
import AdminShell, { AdminLogin, useAdminToken } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Plus, Trash2, Sliders } from "lucide-react";

export default function AdminSitePage() {
  const auth = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState(null);

  useEffect(() => {
    if (!auth.token) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${auth.token}` } });
        const data = await res.json();
        if (res.status === 401) { auth.logout(); return; }
        if (!res.ok) throw new Error(data.error || "Eroare");
        setS(data.settings);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.token]); // eslint-disable-line

  const save = async () => {
    if (!s) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ hero: s.hero, whyUs: s.whyUs, contact: s.contact, social: s.social }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setS(data.settings);
      toast.success("Setări salvate");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!auth.ready) return null;
  if (!auth.token) return <AdminLogin {...auth} />;

  return (
    <AdminShell token={auth.token} onLogout={auth.logout} title="Conținut site">
      {loading || !s ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" /></div>
      ) : (
        <div className="space-y-6">
          <Header title="Conținut site" subtitle="Editează texte, contact și rețele sociale" onSave={save} saving={saving} />

          {/* HERO */}
          <Card title="Hero (homepage)">
            <Field label="Titlu">
              <Input value={s.hero.title} onChange={(e) => setS({ ...s, hero: { ...s.hero, title: e.target.value } })} className="rounded-xl" />
            </Field>
            <Field label="Subtitlu">
              <Textarea value={s.hero.subtitle} onChange={(e) => setS({ ...s, hero: { ...s.hero, subtitle: e.target.value } })} className="min-h-24 rounded-xl" />
            </Field>
            <Field label="URL imagine hero">
              <Input value={s.hero.image} onChange={(e) => setS({ ...s, hero: { ...s.hero, image: e.target.value } })} className="rounded-xl" placeholder="https://..." />
              {s.hero.image && (
                <div className="mt-2 aspect-[16/8] max-w-md overflow-hidden rounded-xl bg-[#eef3ea]">
                  <img src={s.hero.image} alt="hero" className="h-full w-full object-cover" onError={(e) => (e.target.style.display = "none")} />
                </div>
              )}
            </Field>
          </Card>

          {/* WHY US */}
          <Card title="De ce să alegi Family Garden" right={
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setS({ ...s, whyUs: [...(s.whyUs || []), { title: "Titlu", text: "Descriere scurtă" }] })}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Adaugă
            </Button>
          }>
            <div className="space-y-3">
              {(s.whyUs || []).map((w, idx) => (
                <div key={idx} className="flex gap-3 rounded-2xl bg-[#f8faf6] p-3">
                  <div className="flex-1 space-y-2">
                    <Input value={w.title} onChange={(e) => {
                      const arr = [...s.whyUs]; arr[idx] = { ...arr[idx], title: e.target.value }; setS({ ...s, whyUs: arr });
                    }} placeholder="Titlu" className="rounded-xl bg-white" />
                    <Textarea value={w.text} onChange={(e) => {
                      const arr = [...s.whyUs]; arr[idx] = { ...arr[idx], text: e.target.value }; setS({ ...s, whyUs: arr });
                    }} placeholder="Descriere" className="min-h-16 rounded-xl bg-white" />
                  </div>
                  <button onClick={() => { const arr = s.whyUs.filter((_, i) => i !== idx); setS({ ...s, whyUs: arr }); }} className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-full text-[#5b7a5f] hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!s.whyUs || s.whyUs.length === 0) && <p className="text-sm text-[#5b7a5f]">Niciun beneficiu adăugat.</p>}
            </div>
          </Card>

          {/* CONTACT */}
          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Telefon principal"><Input value={s.contact.phone} onChange={(e) => setS({ ...s, contact: { ...s.contact, phone: e.target.value } })} className="rounded-xl" /></Field>
              <Field label="Telefon secundar"><Input value={s.contact.phoneAlt || ""} onChange={(e) => setS({ ...s, contact: { ...s.contact, phoneAlt: e.target.value } })} className="rounded-xl" /></Field>
              <Field label="Email contact"><Input value={s.contact.email} onChange={(e) => setS({ ...s, contact: { ...s.contact, email: e.target.value } })} className="rounded-xl" /></Field>
              <Field label="Program"><Input value={s.contact.schedule} onChange={(e) => setS({ ...s, contact: { ...s.contact, schedule: e.target.value } })} className="rounded-xl" /></Field>
            </div>
            <Field label="Adresă"><Textarea value={s.contact.address} onChange={(e) => setS({ ...s, contact: { ...s.contact, address: e.target.value } })} className="min-h-16 rounded-xl" /></Field>
            <Field label="URL hartă (Google Maps embed)"><Input value={s.contact.mapUrl || ""} onChange={(e) => setS({ ...s, contact: { ...s.contact, mapUrl: e.target.value } })} className="rounded-xl" placeholder="https://www.google.com/maps/..." /></Field>
          </Card>

          {/* SOCIAL */}
          <Card title="Rețele sociale">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Facebook"><Input value={s.social?.facebook || ""} onChange={(e) => setS({ ...s, social: { ...s.social, facebook: e.target.value } })} className="rounded-xl" placeholder="https://facebook.com/..." /></Field>
              <Field label="Instagram"><Input value={s.social?.instagram || ""} onChange={(e) => setS({ ...s, social: { ...s.social, instagram: e.target.value } })} className="rounded-xl" placeholder="https://instagram.com/..." /></Field>
              <Field label="WhatsApp"><Input value={s.social?.whatsapp || ""} onChange={(e) => setS({ ...s, social: { ...s.social, whatsapp: e.target.value } })} className="rounded-xl" placeholder="https://wa.me/..." /></Field>
            </div>
          </Card>

          <div className="sticky bottom-3 flex justify-end">
            <Button onClick={save} disabled={saving} size="lg" className="rounded-full bg-[#4f8f43] shadow-lg hover:bg-[#3f7a35]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> Salvează modificările</>}
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Header({ title, subtitle, onSave, saving }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">Admin / Setări</p>
        <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#5b7a5f]">{subtitle}</p>}
      </div>
      <Button onClick={onSave} disabled={saving} className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> Salvează</>}
      </Button>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-[#1f4023]"><Sliders className="h-4 w-4 text-[#5b7a5f]" /> {title}</h2>
        {right}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs font-semibold uppercase tracking-wider text-[#5b7a5f]">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
