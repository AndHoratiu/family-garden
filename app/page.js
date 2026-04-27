import Link from "next/link";
import { siteContent, siteImages } from "@/lib/site-content";
import { products, productCategories } from "@/lib/products-data";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  RefreshCcw,
  Truck,
  Store,
  CreditCard,
  Sprout,
  ListChecks,
  ShoppingCart,
  ArrowRight,
  MessageCircle,
  Phone,
} from "lucide-react";

const trustItems = [
  { icon: MapPin, label: "Produse locale" },
  { icon: RefreshCcw, label: "Disponibilitate actualizată" },
  { icon: Truck, label: "Livrare locală" },
  { icon: Store, label: "Ridicare personală" },
  { icon: CreditCard, label: "Plată online sau ramburs" },
];

const whyItems = [
  {
    icon: Sprout,
    title: "Cultivat local",
    text: "Produse crescute cu grijă, aproape de client.",
  },
  {
    icon: ListChecks,
    title: "Stoc clar și transparent",
    text: "Vezi imediat ce este disponibil.",
  },
  {
    icon: ShoppingCart,
    title: "Comandă simplă",
    text: "Livrare locală sau ridicare personală.",
  },
];

const WHATSAPP_LINK = `https://wa.me/40749476386?text=${encodeURIComponent("Bună! Aș dori să comand de la Family Garden.")}`;

const stockBadge = (p) => {
  if (p.stock === 0) return { label: "Indisponibil", cls: "bg-red-100 text-red-700" };
  if (p.stock <= 10) return { label: "Stoc limitat", cls: "bg-amber-100 text-amber-700" };
  return { label: "În stoc", cls: "bg-emerald-100 text-emerald-700" };
};

const HomePage = () => {
  const featured = products.filter((p) => p.featured && p.active).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-[#1f4023] md:text-6xl lg:text-7xl">
              Comandă online produse proaspete de la Family Garden
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#516454]">
              Legume, răsaduri și flori cultivate local, cu grijă pentru calitate, prospețime și gust autentic. Vezi rapid ce este disponibil și comandă simplu, online.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/comanda-online">
                <Button size="lg" className="rounded-full bg-[#4f8f43] px-7 text-base hover:bg-[#3f7a35]">
                  <Sprout className="mr-2 h-4 w-4" /> Vezi produsele
                </Button>
              </Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="rounded-full border-[#4f8f43] bg-transparent px-7 text-base text-[#2f6a36] hover:bg-[#eef3ea]">
                  <MessageCircle className="mr-2 h-4 w-4" /> Comandă pe WhatsApp
                </Button>
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-[36px] bg-white shadow-2xl ring-1 ring-black/5">
              <img
                src={siteContent.images.hero}
                alt="Family Garden – legume, fructe, flori, răsaduri proaspete"
                className="h-[420px] w-full object-cover md:h-[560px]"
              />
            </div>
          </div>
        </div>

        {/* TRUST STRIP */}
        <div className="mt-10 rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-[#e3ebde] md:p-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {trustItems.map((t) => (
              <div key={t.label} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-[#2a4430]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef3ea] text-[#2f6a36]">
                  <t.icon className="h-4 w-4" />
                </div>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <h2 className="text-center font-serif text-3xl font-semibold tracking-tight md:text-5xl">
          De ce să alegi Family Garden
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {whyItems.map((w) => (
            <div
              key={w.title}
              className="flex items-center gap-5 rounded-3xl bg-[#eef3ea] p-7 ring-1 ring-[#d8e3d4]"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2f6a36] shadow-sm">
                <w.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1f4023]">{w.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#516454]">{w.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
        <h2 className="text-center font-serif text-3xl font-semibold tracking-tight md:text-5xl">
          Produse recomandate în acest sezon
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => {
            const sb = stockBadge(product);
            return (
              <Link
                key={product.id}
                href={`/produs/${product.id}`}
                className="group flex flex-col rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#e3ebde] transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ea]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col px-1 pt-4">
                  <h3 className="font-serif text-xl font-semibold leading-tight">{product.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#1f4023]">{product.price.toFixed(2)} lei</span>
                    <span className="text-sm text-[#5b7a5f]">/ {product.unit.split(" / ")[1] || "buc"}</span>
                  </div>
                  <span className={`mt-2 inline-flex w-fit items-center rounded-full px-3 py-0.5 text-xs font-semibold ${sb.cls}`}>
                    {sb.label}
                  </span>
                  <span className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-[#4f8f43] px-4 py-2 text-sm font-semibold text-white group-hover:bg-[#3f7a35]">
                    <ShoppingCart className="h-4 w-4" /> Adaugă în coș
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS LIST PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">Produsele noastre</h2>
          <div className="flex flex-wrap gap-2">
            {productCategories.slice(0, 4).map((c, i) => (
              <Link
                key={c}
                href="/comanda-online"
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  i === 0 ? "bg-[#4f8f43] text-white" : "border border-[#d8e3d4] bg-white text-[#2a4430]"
                }`}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 6).map((p) => {
            const sb = stockBadge(p);
            return (
              <Link
                key={p.id}
                href={`/produs/${p.id}`}
                className="flex gap-4 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-[#e3ebde] transition hover:shadow-md"
              >
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-[#eef3ea]">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-center pr-2">
                  <h3 className="font-serif text-lg font-semibold leading-tight">{p.name}</h3>
                  <p className="mt-1 text-xs text-[#5b7a5f]">Sezon: {p.season}</p>
                  <p className="text-xs text-[#5b7a5f]">Disponibil: {p.stock}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-base font-bold text-[#1f4023]">{p.price.toFixed(2)} lei</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${sb.cls}`}>{sb.label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href="/comanda-online">
            <Button size="lg" className="rounded-full bg-[#4f8f43] px-8 hover:bg-[#3f7a35]">
              Vezi toate produsele <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* BOTTOM CTA CARDS */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e3ebde] transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#25d366] text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-semibold">Comandă rapidă</h3>
              <p className="mt-1 text-sm text-[#516454]">Scrie-ne pe WhatsApp și ți-i răspundem rapid la orice întrebare.</p>
              <p className="mt-2 inline-flex items-center text-sm font-semibold text-[#2f6a36] group-hover:underline">
                Comandă pe WhatsApp <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </p>
            </div>
          </a>

          <Link
            href="/contact"
            className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e3ebde] transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]">
              <Truck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-semibold">Livrare locală</h3>
              <p className="mt-1 text-sm text-[#516454]">Livrăm cu grijă, rapid și în siguranță în zona ta.</p>
              <p className="mt-2 inline-flex items-center text-sm font-semibold text-[#2f6a36] group-hover:underline">
                Vezi zona de livrare <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </p>
            </div>
          </Link>

          <Link
            href="/comanda-online"
            className="group flex items-center gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#e3ebde] transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]">
              <Sprout className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-semibold">Produse de sezon</h3>
              <p className="mt-1 text-sm text-[#516454]">Prospețime garantată, direct din grădina noastră, la momentul potrivit.</p>
              <p className="mt-2 inline-flex items-center text-sm font-semibold text-[#2f6a36] group-hover:underline">
                Vezi produsele de sezon <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
