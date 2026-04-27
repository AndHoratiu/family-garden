"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/site-content";

const navItems = [
  { href: "/", label: "Acasă" },
  { href: "/comanda-online", label: "Comandă online" },
  { href: "/galerie", label: "Galerie" },
  { href: "/despre-noi", label: "Despre noi" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e3ebde] bg-[#f8f6f1]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-[#4f8f43]/30">
            <img
              src={siteContent.images.logo}
              alt="Family Garden"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-semibold leading-none text-[#1f4023]">Family Garden</p>
            <p className="text-xs text-[#5b7a5f]">Cultivat cu dragoste</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#2a4430] transition hover:text-[#4f8f43]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/comanda-online" className="hidden md:block">
          <Button className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
            <ShoppingBasket className="mr-2 h-4 w-4" />
            Comandă
          </Button>
        </Link>

        <div className="md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="Meniu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#e3ebde] bg-[#f8f6f1] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-white px-4 py-3 text-[#2a4430]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/comanda-online"
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-[#4f8f43] px-4 py-3 text-center font-semibold text-white"
            >
              Comandă online
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
