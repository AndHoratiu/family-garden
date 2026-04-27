"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lock,
  LogOut,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Search,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Wallet,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "new", label: "Nouă", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed", label: "Confirmată", color: "bg-amber-100 text-amber-700" },
  { value: "delivered", label: "Livrată", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Anulată", color: "bg-red-100 text-red-700" },
];

const statusInfo = (s) => STATUS_OPTIONS.find((o) => o.value === s) || STATUS_OPTIONS[0];

const AdminPage = () => {
  const [token, setToken] = useState("");
  const [pwd, setPwd] = useState("");
  const [logging, setLogging] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("fg_admin_token");
      if (t) setToken(t);
    }
  }, []);

  const fetchOrders = async (tk) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("fg_admin_token");
        setToken("");
        toast.error("Sesiunea a expirat");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      setOrders(data.orders || []);
      setStats(data.stats || null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrders(token);
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLogging(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      localStorage.setItem("fg_admin_token", data.token);
      setToken(data.token);
      toast.success("Autentificat cu succes");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLogging(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fg_admin_token");
    setToken("");
    setOrders([]);
    setStats(null);
  };

  const updateStatus = async (id, orderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      toast.success("Status actualizat");
      fetchOrders(token);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm("Șterge această comandă? Acțiunea este ireversibilă.")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare");
      toast.success("Comandă ștearsă");
      fetchOrders(token);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filter !== "all" && o.orderStatus !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (o.customerName || "").toLowerCase().includes(q) ||
          (o.customerPhone || "").includes(q) ||
          (o.orderNumber || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, filter, search]);

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-[#e3ebde]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-center text-2xl font-semibold">Admin Family Garden</h1>
          <p className="mt-1 text-center text-sm text-[#5b7a5f]">Introdu parola pentru a accesa panoul.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="pwd">Parolă</Label>
              <Input
                id="pwd"
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="mt-1.5 rounded-xl"
                required
                autoFocus
              />
            </div>
            <Button type="submit" disabled={logging} className="w-full rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
              {logging ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se verifică...</> : "Intră"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">Panou administrare</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Comenzi Family Garden</h1>
        </div>
        <Button onClick={handleLogout} variant="outline" className="rounded-full">
          <LogOut className="mr-2 h-4 w-4" /> Ieșire
        </Button>
      </div>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Package} label="Total" value={stats.total} color="text-[#2f6a36]" />
          <StatCard icon={Clock} label="Noi" value={stats.new} color="text-blue-600" />
          <StatCard icon={CheckCircle2} label="Confirmate" value={stats.confirmed} color="text-amber-600" />
          <StatCard icon={Truck} label="Livrate" value={stats.delivered} color="text-emerald-600" />
          <StatCard icon={TrendingUp} label="Venit livrat" value={`${stats.revenue.toFixed(2)} lei`} color="text-[#2f6a36]" />
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b7a5f]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume, telefon, număr comandă..."
            className="h-11 rounded-2xl border-[#d8e3d4] bg-white pl-11"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { v: "all", l: "Toate" },
            ...STATUS_OPTIONS.map((s) => ({ v: s.value, l: s.label })),
          ].map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === f.v ? "bg-[#4f8f43] text-white" : "bg-white border border-[#d8e3d4] text-[#2a4430]"
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center text-[#5b7a5f] ring-1 ring-[#e3ebde]">
          Nicio comandă găsită.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const sInfo = statusInfo(o.orderStatus);
            const isExp = expanded[o.id];
            return (
              <div key={o.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e3ebde]">
                <div className="flex flex-wrap items-center gap-4 p-5">
                  <button
                    onClick={() => setExpanded((p) => ({ ...p, [o.id]: !p[o.id] }))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f2f7ef]"
                  >
                    {isExp ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <div className="min-w-[140px]">
                    <p className="font-mono text-sm font-semibold">#{o.orderNumber}</p>
                    <p className="text-xs text-[#5b7a5f]">{new Date(o.createdAt).toLocaleString("ro-RO")}</p>
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <p className="font-semibold">{o.customerName}</p>
                    <a href={`tel:${o.customerPhone}`} className="flex items-center gap-1 text-sm text-[#5b7a5f] hover:text-[#4f8f43]">
                      <Phone className="h-3 w-3" /> {o.customerPhone}
                    </a>
                  </div>
                  <div className="min-w-[120px]">
                    <p className="text-xs text-[#5b7a5f]">{o.deliveryMethod}</p>
                    <p className="text-xs text-[#5b7a5f]">{o.paymentMethod}</p>
                  </div>
                  <p className="min-w-[100px] text-lg font-bold text-[#2f6a36]">{o.total?.toFixed(2)} lei</p>
                  <Badge className={`rounded-full px-3 py-1 ${sInfo.color}`}>{sInfo.label}</Badge>
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="rounded-full border border-[#d8e3d4] bg-white px-3 py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteOrder(o.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#5b7a5f] hover:bg-red-50 hover:text-red-600"
                    aria-label="Șterge"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {isExp && (
                  <div className="grid gap-6 border-t border-[#e3ebde] bg-[#f8faf6] p-5 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-semibold">Detalii client</p>
                      <ul className="space-y-1.5 text-sm text-[#516454]">
                        {o.customerEmail && <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {o.customerEmail}</li>}
                        {o.customerAddress && <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {o.customerAddress}</li>}
                        {o.notes && <li className="rounded-xl bg-white p-3 ring-1 ring-[#e3ebde]"><span className="font-semibold">Observații: </span>{o.notes}</li>}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-semibold">Produse</p>
                      <ul className="space-y-1 text-sm">
                        {o.items?.map((it, i) => (
                          <li key={i} className="flex justify-between">
                            <span>{it.quantity} × {it.name}</span>
                            <span>{(it.price * it.quantity).toFixed(2)} lei</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 space-y-0.5 border-t border-[#e3ebde] pt-2 text-sm text-[#516454]">
                        <div className="flex justify-between"><span>Subtotal</span><span>{o.subtotal?.toFixed(2)} lei</span></div>
                        <div className="flex justify-between"><span>Livrare</span><span>{o.deliveryFee?.toFixed(2)} lei</span></div>
                        <div className="flex justify-between font-bold text-[#1f4023]"><span>Total</span><span>{o.total?.toFixed(2)} lei</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#e3ebde]">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5b7a5f]">
      <Icon className="h-3.5 w-3.5" /> {label}
    </div>
    <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default AdminPage;
