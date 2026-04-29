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
import {
  ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, X, Star,
  ArrowLeft as ChevLeft, ArrowRight as ChevRight, Plus,
} from "lucide-react";

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
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) { reject(err); }
    };
    img.onerror = () => reject(new Error("Imagine invalidă"));
    img.src = dataUrl;
  });

export default function ProductForm({ mode = "new", productId = null }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [form, setForm] = useState({
    name: "", category: "Legume", description: "",
    price: "", unit: "lei / kg", stock: 0, minOrder: 1,
    featured: false, season: "Tot anul", images: [], active: true,
  });

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
        // Backwards compatibility: build images[] from image if missing
        const p = data.product || {};
        const images = Array.isArray(p.images) && p.images.length > 0
          ? p.images
          : (p.image ? [p.image] : []);
        setForm({ ...p, images });
      } catch (e) {
        toast.error(e.message);
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, productId, token, router]);

  const addImageFromFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const newImgs = [];
      for (const file of files) {
        if (!file.type.startsWith("image/")) continue;
        const dataUrl = await readFileAsDataUrl(file);
        const resized = await resizeImage(dataUrl, 1200, 0.85);
        newImgs.push(resized);
      }
      if (newImgs.length === 0) {
        toast.error("Niciun fișier imagine valid");
      } else {
        setForm((p) => ({ ...p, images: [...(p.images || []), ...newImgs] }));
        toast.success(`${newImgs.length} ${newImgs.length === 1 ? "imagine adăugată" : "imagini adăugate"}`);
      }
    } catch (err) {
      toast.error("Eroare la încărcare: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addImageFromUrl = () => {
    const url = (urlInput || "").trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url) && !url.startsWith("data:")) {
      toast.error("Introduceți un URL valid (http/https)");
      return;
    }
    setForm((p) => ({ ...p, images: [...(p.images || []), url] }));
    setUrlInput("");
    toast.success("Imagine adăugată");
  };

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (idx, dir) => {
    setForm((p) => {
      const arr = [...p.images];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return p;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...p, images: arr };
    });
  };

  const setAsPrimary = (idx) => {
    setForm((p) => {
      if (idx === 0) return p;
      const arr = [...p.images];
      const [picked] = arr.splice(idx, 1);
      arr.unshift(picked);
      return { ...p, images: arr };
    });
  };

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
      const images = (form.images || []).filter(Boolean);
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        minOrder: Number(form.minOrder || 1),
        images,
        image: images[0] || "",
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
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

  const primaryImage = form.images?.[0] || "";

  return (
    <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:pb-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e3ebde] hover:bg-[#eef3ea]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">
              Admin / Produse / {mode === "edit" ? "Editare" : "Adaugă"}
            </p>
            <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">
              {mode === "edit" ? `Editează: ${form.name}` : "Adaugă produs nou"}
            </h1>
          </div>
        </div>
        {/* Desktop save shortcut (also visible at top for quick access) */}
        <Button type="submit" form="product-form" disabled={saving} className="hidden rounded-full bg-[#4f8f43] hover:bg-[#3f7a35] md:inline-flex">
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> Salvează</>}
        </Button>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[1fr_360px]">
        {/* LEFT: details */}
        <div className="space-y-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde] md:p-6">
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
              <Input id="price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="8.00" className="mt-1.5 rounded-xl" required />
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

          {/* IMAGES SECTION */}
          <div className="rounded-2xl bg-[#f8faf6] p-4 ring-1 ring-[#e3ebde]">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Imagini produs</Label>
                <p className="text-xs text-[#5b7a5f]">Prima imagine apare ca principală pe site.</p>
              </div>
              <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#4f8f43] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3f7a35] ${uploading ? "pointer-events-none opacity-70" : ""}`}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Se încarcă..." : "Adaugă poză"}
                <input type="file" accept="image/*" multiple onChange={addImageFromFile} disabled={uploading} className="hidden" />
              </label>
            </div>

            {(form.images || []).length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d8e3d4] bg-white py-10 text-center">
                <ImageIcon className="h-10 w-10 text-[#bdd1bf]" />
                <p className="mt-2 text-sm text-[#5b7a5f]">Nicio imagine adăugată încă</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.images.map((src, idx) => (
                  <div key={idx} className={`group relative overflow-hidden rounded-2xl bg-white ring-1 ${idx === 0 ? "ring-2 ring-[#4f8f43]" : "ring-[#e3ebde]"}`}>
                    <div className="aspect-square">
                      <img src={src} alt={`Imagine ${idx + 1}`} className="h-full w-full object-cover" onError={(e) => { e.target.style.opacity = "0.3"; }} />
                    </div>
                    {idx === 0 && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#4f8f43] px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                        <Star className="h-3 w-3 fill-current" /> Principală
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1f4023] disabled:opacity-30">
                          <ChevLeft className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === form.images.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#1f4023] disabled:opacity-30">
                          <ChevRight className="h-3.5 w-3.5" />
                        </button>
                        {idx !== 0 && (
                          <button type="button" onClick={() => setAsPrimary(idx)} title="Setează ca principală" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-amber-600 hover:bg-amber-50">
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <button type="button" onClick={() => removeImage(idx)} className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="sau lipește un URL imagine..."
                className="rounded-xl bg-white"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageFromUrl(); } }}
              />
              <Button type="button" onClick={addImageFromUrl} variant="outline" className="rounded-full">
                <Plus className="mr-1 h-4 w-4" /> Adaugă URL
              </Button>
            </div>
            <p className="mt-2 text-xs text-[#5b7a5f]">JPG/PNG/WebP. Imaginile sunt redimensionate automat la max. 1200px.</p>
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
              <p className="text-xs text-[#5b7a5f]">Apare pe homepage în secțiunea „Produse recomandate".</p>
            </div>
            <Switch id="featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
          </div>
        </div>

        {/* RIGHT: preview + actions */}
        <div className="space-y-4">
          <div className="sticky top-24 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
            <p className="mb-3 text-sm font-semibold">Previzualizare</p>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ea]">
              {primaryImage ? (
                <img src={primaryImage} alt={form.name || "Preview"} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#5b7a5f]">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}
            </div>
            <div className="mt-3 space-y-1">
              <h3 className="font-serif text-lg font-semibold leading-tight">{form.name || "Numele produsului"}</h3>
              <p className="text-xs text-[#5b7a5f]">{form.category} · {form.season}</p>
              <p className="text-xl font-bold text-[#1f4023]">
                {Number(form.price || 0).toFixed(2)} <span className="text-xs font-normal text-[#5b7a5f]">{form.unit}</span>
              </p>
              <p className="text-xs text-[#5b7a5f]">Stoc: {form.stock}</p>
            </div>
            <Button type="submit" disabled={saving} className="mt-5 w-full rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> {mode === "edit" ? "Salvează modificările" : "Creează produsul"}</>}
            </Button>
            <Link href="/admin/products" className="mt-2 block text-center text-sm text-[#5b7a5f] hover:text-[#1f4023]">Anulează</Link>
          </div>
        </div>
      </form>

      {/* Mobile sticky save bar — always visible on mobile so user doesn't have to scroll */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e3ebde] bg-white/95 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <Link href="/admin/products" className="flex-1 rounded-full border border-[#d8e3d4] bg-white px-4 py-2.5 text-center text-sm font-medium text-[#5b7a5f]">
            Anulează
          </Link>
          <Button type="submit" form="product-form" disabled={saving} className="flex-[2] rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se salvează...</> : <><Save className="mr-2 h-4 w-4" /> {mode === "edit" ? "Salvează" : "Creează"}</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
