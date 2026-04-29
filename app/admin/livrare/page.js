"use client";

import { useEffect, useState } from "react";
import AdminShell, { AdminLogin, useAdminToken } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Loader2, Truck, CreditCard, Wallet } from "lucide-react";

export default function AdminDeliveryPage() {
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
      } catch (e) { toast.error(e.message); }
      finally { setLoading(false); }
    })();
  }, [auth.token]); // eslint-disable-line

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({
          delivery: {
            ...s.delivery,
            fee: Number(s.delivery.fee || 0),
            freeAbove: Number(s.delivery.freeAbove || 0),
          },
          payment: s.payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setS(data.settings);
      toast.success("Setări salvate");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!auth.ready) return null;
  if (!auth.token) return <AdminLogin {...auth} />;

  return (
    <AdminShell token={auth.token} onLogout={auth.logout} title="Livrare & Plată">
      {loading || !s ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">Admin / Livrare & Plată</p>
              <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">Setări livrare și plată</h1>
            </div>
            <Button onClick={save} disabled={saving} className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> Salvează</>}
            </Button>
          </div>

          {/* DELIVERY */}
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1f4023]"><Truck className="h-4 w-4 text-[#5b7a5f]" /> Livrare locală</h2>
            <div className="space-y-4">
              <Toggle label="Activează livrare locală" desc="Apare ca opțiune la checkout." checked={s.delivery.enabled} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, enabled: v } })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Cost livrare (lei)">
                  <Input type="number" min="0" step="0.01" value={s.delivery.fee} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, fee: e.target.value } })} className="rounded-xl" />
                </Field>
                <Field label="Livrare gratuită peste (lei) — 0 = dezactivat">
                  <Input type="number" min="0" step="1" value={s.delivery.freeAbove} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, freeAbove: e.target.value } })} className="rounded-xl" />
                </Field>
              </div>
              <div className="my-2 border-t border-[#e3ebde]" />
              <Toggle label="Activează ridicare personală" desc="Clientul ridică direct comanda de la fermă." checked={s.delivery.pickupEnabled} onChange={(v) => setS({ ...s, delivery: { ...s.delivery, pickupEnabled: v } })} />
              <Field label="Adresă ridicare personală">
                <Textarea value={s.delivery.pickupAddress || ""} onChange={(e) => setS({ ...s, delivery: { ...s.delivery, pickupAddress: e.target.value } })} className="min-h-16 rounded-xl" placeholder="Vințu de Jos, Telman, nr. 46, Alba" />
              </Field>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1f4023]"><Wallet className="h-4 w-4 text-[#5b7a5f]" /> Metode de plată</h2>
            <div className="space-y-3">
              <Toggle label="Plată la livrare (Ramburs)" desc="Clientul plătește când primește comanda." checked={s.payment.rambursEnabled} onChange={(v) => setS({ ...s, payment: { ...s.payment, rambursEnabled: v } })} />
              <Toggle label="Plată online" desc="Necesită integrare Stripe / NETOPIA. Activează doar când e configurat." checked={s.payment.onlineEnabled} onChange={(v) => setS({ ...s, payment: { ...s.payment, onlineEnabled: v } })} icon={CreditCard} />
            </div>
          </div>

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

function Toggle({ label, desc, checked, onChange, icon: Icon }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#f8faf6] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="mt-0.5 h-4 w-4 text-[#5b7a5f]" />}
        <div>
          <Label className="font-semibold">{label}</Label>
          {desc && <p className="text-xs text-[#5b7a5f]">{desc}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
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
