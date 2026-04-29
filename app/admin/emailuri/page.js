"use client";

import { useEffect, useState } from "react";
import AdminShell, { AdminLogin, useAdminToken } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Loader2, Mail, Plus, Trash2, AlertTriangle } from "lucide-react";

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function AdminEmailsPage() {
  const auth = useAdminToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    if (!auth.token) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${auth.token}` } });
        const data = await res.json();
        if (res.status === 401) { auth.logout(); return; }
        if (!res.ok) throw new Error(data.error || "Eroare");
        setRecipients(data.settings?.emails?.recipients || []);
      } catch (e) { toast.error(e.message); }
      finally { setLoading(false); }
    })();
  }, [auth.token]); // eslint-disable-line

  const addEmail = () => {
    const e = newEmail.trim().toLowerCase();
    if (!isValidEmail(e)) { toast.error("Email invalid"); return; }
    if (recipients.includes(e)) { toast.error("Email deja adăugat"); return; }
    setRecipients([...recipients, e]);
    setNewEmail("");
  };

  const removeEmail = (e) => setRecipients(recipients.filter((x) => x !== e));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ emails: { recipients } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      toast.success("Setări salvate");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!auth.ready) return null;
  if (!auth.token) return <AdminLogin {...auth} />;

  return (
    <AdminShell token={auth.token} onLogout={auth.logout} title="Emailuri">
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" /></div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">Admin / Emailuri</p>
              <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">Notificări comenzi noi</h1>
              <p className="mt-1 text-sm text-[#5b7a5f]">Adresele care primesc email când vine o comandă nouă.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1f4023]"><Mail className="h-4 w-4 text-[#5b7a5f]" /> Destinatari notificări admin</h2>
            <div className="space-y-2">
              {recipients.length === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4" />
                  Nu există destinatari configurați. Comenzile noi nu vor genera email.
                </div>
              )}
              {recipients.map((e) => (
                <div key={e} className="flex items-center gap-3 rounded-2xl bg-[#f8faf6] p-3">
                  <Mail className="h-4 w-4 text-[#5b7a5f]" />
                  <span className="flex-1 font-mono text-sm">{e}</span>
                  <button onClick={() => removeEmail(e)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#5b7a5f] hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="adresa@email.com" type="email" className="rounded-xl" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }} />
              <Button onClick={addEmail} variant="outline" className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Adaugă</Button>
            </div>
          </div>

          <div className="rounded-3xl bg-[#f8faf6] p-5 ring-1 ring-[#e3ebde]">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">Status integrare email</p>
            <p className="mt-2 text-sm text-[#516454]">
              Emailurile sunt trimise prin <strong>Resend</strong>. Dacă cheia API nu este configurată, comenzile sunt salvate dar nu se trimite niciun email.
            </p>
          </div>

          <div className="sticky bottom-3 flex justify-end">
            <Button onClick={save} disabled={saving} size="lg" className="rounded-full bg-[#4f8f43] shadow-lg hover:bg-[#3f7a35]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> Salvează</>}
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
