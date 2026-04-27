"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingCart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { href: "/", label: "Acasă" },
  { href: "/comanda-online", label: "Produse" },
  { href: "/despre-noi", label: "Despre noi" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

const WHATSAPP_NUMBER = "40749476386";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bună! Aș dori să comand de la Family Garden.")}`;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("fg_cart") || "{}");
        const total = Object.values(stored).reduce((s, q) => s + Number(q || 0), 0);
        setCount(total);
      } catch { setCount(0); }
    };
    compute();
    window.addEventListener("storage", compute);
    window.addEventListener("fg-cart-changed", compute);
    return () => {
      window.removeEventListener("storage", compute);
      window.removeEventListener("fg-cart-changed", compute);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e3ebde] bg-[#f8f5ed]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-[#4f8f43]/20">
            <img src={siteContent.images.logo} alt="Family Garden" className="h-full w-full object-cover" />
          </div>
          <p className="font-serif text-2xl font-semibold leading-none tracking-tight text-[#1f4023]">Family Garden</p>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-[#2a4430] transition hover:text-[#4f8f43]">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/comanda-online" className="relative">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e3ebde] hover:ring-[#4f8f43]" aria-label="Coș">
              <ShoppingCart className="h-5 w-5 text-[#2a4430]" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4f8f43] text-[10px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          </Link>

          <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="hidden md:block">
            <Button className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
              <MessageCircle className="mr-2 h-4 w-4" /> Comandă pe WhatsApp
            </Button>
          </a>

          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#e3ebde] lg:hidden"
            aria-label="Meniu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#e3ebde] bg-[#f8f5ed] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="rounded-2xl bg-white px-4 py-3 text-[#2a4430]">
                {item.label}
              </Link>
            ))}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="rounded-2xl bg-[#4f8f43] px-4 py-3 text-center font-semibold text-white">
              Comandă pe WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
