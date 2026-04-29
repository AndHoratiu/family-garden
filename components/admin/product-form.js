"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, X } from "lucide-react";

const CATEGORIES = ["Legume", "Fructe", "Flori", "Răsaduri", "Produse artizanale"];
const SEASONS = [
  "Primăvară", "Vară", "Toamnă", "Iarnă",
  "Primăvară - Vară", "Vară - Toamnă", "Toamnă - Iarnă",
  "Primăvară - Toamnă", "Tot anul",
];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Eroare la citirea fișierului"));
    reader.readAsDataURL(file);
  });

const resizeImage = (dataUrl, maxWidth = 1200, quality = 0.85) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const out = canvas.toDataURL("image/jpeg", quality);
        resolve(out);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Imagine invalidă"));
    img.src = dataUrl;
  });

export default function ProductForm({ mode = "new", productId = null }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "Legume", description: "",
    price: "", unit: "lei / kg", stock: 0, minOrder: 1,
    featured: false, season: "Tot anul", image: "", active: true,
  });
  const [uploading, setUploading] = useState(false);

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Te rog selectează un fișier imagine.");
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const resized = await resizeImage(dataUrl, 1200, 0.85);
      setForm((prev) => ({ ...prev, image: resized }));
      toast.success("Imagine încărcată");
    } catch (err) {
      toast.error("Nu am putut încărca imaginea: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-select
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("fg_admin_token");
      if (!t) {
        router.push("/admin/products");
        return;
      }
      setToken(t);
    }
  }, [router]);

  useEffect(() => {
    if (mode !== "edit" || !productId || !token) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare");
        setForm(data.product);
      } catch (e) {
        toast.error(e.message);
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, productId, token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.unit || form.price === "") {
      toast.error("Completează nume, categorie, preț și unitate.");
      return;
    }
    setSaving(true);
    try {
      const url = mode === "edit" ? `/api/admin/products/${productId}` : "/api/admin/products";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock || 0),
          minOrder: Number(form.minOrder || 1),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      toast.success(mode === "edit" ? "Produs actualizat" : "Produs creat cu succes");
      router.push("/admin/products");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/products" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e3ebde] hover:bg-[#eef3ea]">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">Admin / Produse / {mode === "edit" ? "Editare" : "Adaugă"}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {mode === "edit" ? `Editează: ${form.name}` : "Adaugă produs nou"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e3ebde]">
          <div>
            <Label htmlFor="name">Nume produs *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Roșii de grădină" className="mt-1.5 rounded-xl" required />
          </div>
          <div>
            <Label htmlFor="description">Descriere</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descriere scurtă a produsului" className="mt-1.5 min-h-24 rounded-xl" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="category">Categorie *</Label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-input bg-white px-3 text-sm" required>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="season">Sezon</Label>
              <select id="season" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="mt-1.5 h-10 w-full rounded-xl border border-input bg-white px-3 text-sm">
                {SEASONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="price">Preț (lei) *</Label>
              <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="8.00" className="mt-1.5 rounded-xl" required />
            </div>
            <div>
              <Label htmlFor="unit">Unitate *</Label>
              <Input id="unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="lei / kg" className="mt-1.5 rounded-xl" required />
            </div>
            <div>
              <Label htmlFor="minOrder">Min. comandă</Label>
              <Input id="minOrder" type="number" min="1" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} className="mt-1.5 rounded-xl" />
            </div>
          </div>
          <div>
            <Label htmlFor="stock">Stoc disponibil</Label>
            <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1.5 rounded-xl" />
            <p className="mt-1 text-xs text-[#5b7a5f]">0 = Indisponibil &middot; 1-10 = Stoc limitat &middot; 11+ = În stoc</p>
          </div>
          <div>
            <Label>Imagine produs</Label>
            <div className="mt-1.5 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#4f8f43] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3f7a35] ${uploading ? "pointer-events-none opacity-70" : ""}`}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Se încarcă..." : "Încarcă poză"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="inline-flex items-center gap-1 rounded-full border border-[#d8e3d4] bg-white px-3 py-1.5 text-xs text-[#5b7a5f] hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-3 w-3" /> Elimină
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="image"
                  value={form.image && form.image.startsWith("data:") ? "📷 Imagine încărcată local" : form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="sau lipește un URL: https://..."
                  className="rounded-xl"
                  readOnly={form.image?.startsWith("data:")}
                />
              </div>
              <p className="text-xs text-[#5b7a5f]">
                Acceptă JPG, PNG, WebP. Imaginea e redimensionată automat la max. 1200px.
                Sau lipește un URL (Drive/Pexels/etc).
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-[#f8faf6] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label htmlFor="active" className="font-semibold">Activ pe site</Label>
              <p className="text-xs text-[#5b7a5f]">Dacă e dezactivat, nu apare în magazin.</p>
            </div>
            <Switch id="active" checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-[#f8faf6] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Label htmlFor="featured" className="font-semibold">Featured (recomandat)</Label>
              <p className="text-xs text-[#5b7a5f]">Apare pe homepage în secțiunea "Produse recomandate".</p>
            </div>
            <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="sticky top-24 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
            <p className="mb-3 text-sm font-semibold">Previzualizare imagine</p>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ea]">
              {form.image ? (
                <img src={form.image} alt={form.name || "Preview"} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#5b7a5f]">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <Button type="submit" disabled={saving} className="mt-5 w-full rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> {mode === "edit" ? "Salvează modificările" : "Creează produsul"}</>}
            </Button>
            <Link href="/admin/products" className="mt-2 block text-center text-sm text-[#5b7a5f] hover:text-[#1f4023]">Anulează</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
