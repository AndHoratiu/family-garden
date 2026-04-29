"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Lock, LogOut, Loader2, ShoppingBag, Package, Sliders,
  Truck, Mail, Menu, X, Home, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Comenzi", icon: ShoppingBag },
  { href: "/admin/products", label: "Produse", icon: Package },
  { href: "/admin/site", label: "Conținut site", icon: Sliders },
  { href: "/admin/livrare", label: "Livrare & Plată", icon: Truck },
  { href: "/admin/emailuri", label: "Emailuri", icon: Mail },
];

export function useAdminToken() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [pwd, setPwd] = useState("");
  const [logging, setLogging] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("fg_admin_token");
      if (t) setToken(t);
      setReady(true);
    }
  }, []);

  const login = async (e) => {
    if (e?.preventDefault) e.preventDefault();
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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLogging(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("fg_admin_token");
    setToken("");
    router.push("/admin");
  };

  return { token, setToken, pwd, setPwd, logging, login, logout, ready };
}

export default function AdminShell({ children, token, onLogout, title }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  if (!token) return children;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f7f9f5]">
      {/* Mobile top bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 border-b border-[#e3ebde] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <button
          onClick={() => setNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3ea] text-[#2f6a36]"
          aria-label="Deschide meniu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold text-[#1f4023]">{title || "Admin"}</p>
        <button
          onClick={onLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-[#d8e3d4] text-[#5b7a5f]"
          aria-label="Ieșire"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-24 hidden h-fit w-60 shrink-0 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-[#e3ebde] md:block">
          <Link href="/" className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-widest text-[#5b7a5f] hover:bg-[#eef3ea]">
            <Home className="h-3.5 w-3.5" /> Vezi site-ul
          </Link>
          <div className="my-2 border-t border-[#e3ebde]" />
          <nav className="space-y-1">
            {NAV_ITEMS.map((it) => {
              const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#eef3ea] text-[#1f4023] ring-1 ring-[#d8e3d4]" : "text-[#516454] hover:bg-[#f8faf6]"}`}
                >
                  <it.icon className={`h-4 w-4 ${active ? "text-[#2f6a36]" : "text-[#5b7a5f]"}`} />
                  <span className="flex-1">{it.label}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5" />}
                </Link>
              );
            })}
          </nav>
          <div className="my-3 border-t border-[#e3ebde]" />
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#5b7a5f] hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Ieșire
          </button>
        </aside>

        {/* Mobile drawer */}
        {navOpen && (
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setNavOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1f4023]">Meniu admin</p>
                <button onClick={() => setNavOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3ea]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {NAV_ITEMS.map((it) => {
                  const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={() => setNavOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${active ? "bg-[#eef3ea] text-[#1f4023]" : "text-[#516454]"}`}
                    >
                      <it.icon className="h-4 w-4" /> {it.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="my-3 border-t border-[#e3ebde]" />
              <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-[#5b7a5f]">
                <Home className="h-4 w-4" /> Vezi site-ul
              </Link>
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function AdminLogin({ pwd, setPwd, login, logging }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-[#e3ebde]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center font-serif text-2xl font-semibold">Admin Family Garden</h1>
        <p className="mt-1 text-center text-sm text-[#5b7a5f]">Introdu parola pentru a accesa panoul.</p>
        <form onSubmit={login} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="pwd">Parolă</Label>
            <Input id="pwd" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="mt-1.5 rounded-xl" required autoFocus />
          </div>
          <Button type="submit" disabled={logging} className="w-full rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
            {logging ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se verifică...</> : "Intră"}
          </Button>
        </form>
      </div>
    </div>
  );
}
