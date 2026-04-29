"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell, { AdminLogin, useAdminToken } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, Search, Plus, Trash2, Edit3,
  Eye, EyeOff, Star, Save, RefreshCcw,
} from "lucide-react";

const stockBadge = (p) => {
  if (!p.active) return { label: "Inactiv", cls: "bg-gray-200 text-gray-600" };
  if (p.stock === 0) return { label: "Indisponibil", cls: "bg-red-100 text-red-700" };
  if (p.stock <= 10) return { label: "Stoc limitat", cls: "bg-amber-100 text-amber-700" };
  return { label: "În stoc", cls: "bg-emerald-100 text-emerald-700" };
};

const CATEGORIES = ["Legume", "Fructe", "Flori", "Răsaduri", "Produse artizanale"];

export default function AdminProductsPage() {
  const auth = useAdminToken();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [editingStock, setEditingStock] = useState({});
  const [savingId, setSavingId] = useState(null);

  const fetchProducts = async (tk) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (res.status === 401) {
        auth.logout();
        toast.error("Sesiunea a expirat");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setProducts(data.products || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) fetchProducts(auth.token);
  }, [auth.token]); // eslint-disable-line

  const updateProduct = async (id, fields, silent = false) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setProducts((prev) => prev.map((p) => (p.id === id ? data.product : p)));
      if (!silent) toast.success("Salvat");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSavingId(null);
    }
  };

  const saveStock = async (id) => {
    const value = editingStock[id];
    if (value === undefined) return;
    await updateProduct(id, { stock: Number(value) });
    setEditingStock((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleActive = (p) => updateProduct(p.id, { active: !p.active }, true);
  const toggleFeatured = (p) => updateProduct(p.id, { featured: !p.featured }, true);

  const deleteProduct = async (p) => {
    if (!confirm(`Șterge produsul "${p.name}"? Acțiunea este ireversibilă.`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      toast.success("Produs șters");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterCat !== "all" && p.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, filterCat, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const inactive = total - active;
    const lowStock = products.filter((p) => p.active && p.stock > 0 && p.stock <= 10).length;
    const outOfStock = products.filter((p) => p.active && p.stock === 0).length;
    return { total, active, inactive, lowStock, outOfStock };
  }, [products]);

  if (!auth.ready) return null;
  if (!auth.token) return <AdminLogin {...auth} />;

  return (
    <AdminShell token={auth.token} onLogout={auth.logout} title="Produse">
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#5b7a5f]">Admin / Produse</p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight md:text-3xl">Gestiune produse</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => fetchProducts(auth.token)} variant="outline" className="rounded-full" disabled={loading}>
            <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Reîncarcă
          </Button>
          <Link href="/admin/products/new">
            <Button className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
              <Plus className="mr-2 h-4 w-4" /> Adaugă produs
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
        <StatCard label="Total" value={stats.total} color="text-[#2f6a36]" />
        <StatCard label="Active" value={stats.active} color="text-emerald-600" />
        <StatCard label="Inactive" value={stats.inactive} color="text-gray-500" />
        <StatCard label="Stoc limitat" value={stats.lowStock} color="text-amber-600" />
        <StatCard label="Indisponibile" value={stats.outOfStock} color="text-red-600" />
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b7a5f]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Caută produs..." className="h-11 rounded-2xl border-[#d8e3d4] bg-white pl-11" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{v: "all", l: "Toate"}, ...CATEGORIES.map((c) => ({v: c, l: c}))].map((f) => (
            <button key={f.v} onClick={() => setFilterCat(f.v)} className={`rounded-full px-4 py-2 text-sm font-medium ${filterCat === f.v ? "bg-[#4f8f43] text-white" : "bg-white border border-[#d8e3d4] text-[#2a4430]"}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-[#5b7a5f] ring-1 ring-[#e3ebde]">
          Niciun produs găsit. <Link href="/admin/products/new" className="font-semibold text-[#2f6a36] underline">Adaugă unul nou</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e3ebde]">
          <table className="w-full">
            <thead className="bg-[#f8faf6] text-xs font-semibold uppercase tracking-wider text-[#5b7a5f]">
              <tr>
                <th className="px-4 py-3 text-left">Produs</th>
                <th className="px-4 py-3 text-left">Categorie</th>
                <th className="px-4 py-3 text-right">Preț</th>
                <th className="px-4 py-3 text-center">Stoc</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sb = stockBadge(p);
                const stockEditing = editingStock[p.id] !== undefined;
                return (
                  <tr key={p.id} className="border-t border-[#e3ebde] hover:bg-[#f8faf6]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-12 w-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold leading-tight">{p.name}</p>
                          <p className="font-mono text-[10px] text-[#5b7a5f]">{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#516454]">{p.category}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold">{p.price.toFixed(2)} lei</span>
                      <span className="block text-[10px] text-[#5b7a5f]">{p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Input
                          type="number"
                          value={stockEditing ? editingStock[p.id] : p.stock}
                          onChange={(e) => setEditingStock({ ...editingStock, [p.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") saveStock(p.id); }}
                          className={`h-9 w-20 rounded-xl text-center text-sm ${stockEditing ? "border-[#f59e0b] ring-2 ring-amber-200" : ""}`}
                          min="0"
                        />
                        {stockEditing && (
                          <button onClick={() => saveStock(p.id)} disabled={savingId === p.id} className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4f8f43] text-white hover:bg-[#3f7a35]">
                            {savingId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`rounded-full px-2 py-0.5 text-[10px] ${sb.cls}`}>{sb.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeatured(p)} className={`rounded-full p-2 ${p.featured ? "text-amber-500" : "text-gray-300 hover:text-amber-400"}`}>
                        <Star className={`h-5 w-5 ${p.featured ? "fill-current" : ""}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActive(p)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#5b7a5f] hover:bg-[#eef3ea]" title={p.active ? "Dezactivează" : "Activează"}>
                          {p.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                        </button>
                        <Link href={`/admin/products/${p.id}/edit`} className="flex h-9 w-9 items-center justify-center rounded-full text-[#5b7a5f] hover:bg-[#eef3ea]" title="Editează">
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button onClick={() => deleteProduct(p)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#5b7a5f] hover:bg-red-50 hover:text-red-600" title="Șterge">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </AdminShell>
  );
}

const StatCard = ({ label, value, color }) => (
  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#e3ebde]">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5b7a5f]">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
  </div>
);
