import Link from "next/link";
import { siteContent } from "@/lib/site-content";
import { products } from "@/lib/products-data";
import { Button } from "@/components/ui/button";
import {
  Sprout,
  Truck,
  Package,
  Leaf,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

const iconMap = { sprout: Sprout, truck: Truck, package: Package };

const HomePage = () => {
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#cfe3c7] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-[#e7d8b6] opacity-40 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20 md:px-6">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe3c7] bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f6a36]">
              <Leaf className="h-3.5 w-3.5" /> {siteContent.heroEyebrow}
            </div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              {siteContent.heroTitle}
            </h1>
            <p className="max-w-xl text-lg leading-8 text-[#516454]">
              {siteContent.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/comanda-online">
                <Button size="lg" className="rounded-full bg-[#4f8f43] px-7 hover:bg-[#3f7a35]">
                  Vezi produsele <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[#4f8f43] bg-transparent px-7 text-[#2f6a36] hover:bg-[#eef3ea]"
                >
                  Contactează-ne
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-[#516454]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#4f8f43]" /> Cultivat local
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#4f8f43]" /> Fără chimicale agresive
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#4f8f43]" /> Livrare locală
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[36px] bg-white shadow-2xl ring-1 ring-black/5">
              <img
                src={siteContent.images.hero}
                alt="Family Garden – solar cu plante proaspete"
                className="h-[420px] w-full object-cover md:h-[520px]"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/5 md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ea]">
                  <Star className="h-6 w-6 fill-[#f5b301] text-[#f5b301]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Recomandat de familii din Alba</p>
                  <p className="text-xs text-[#5b7a5f]">Calitate de la producător</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {siteContent.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-[#e3ebde]"
            >
              <p className="text-5xl font-semibold tracking-tight text-[#2f6a36]">{stat.value}</p>
              <p className="mt-2 text-[#516454]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">
              {siteContent.storyEyebrow}
            </p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {siteContent.storyTitle}
            </h2>
            <p className="text-lg leading-8 text-[#516454]">{siteContent.storyText}</p>
            <ul className="space-y-3 pt-2">
              {siteContent.storyPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[#2a4430]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4f8f43]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-hidden rounded-[36px] bg-white shadow-xl ring-1 ring-black/5">
            <img
              src={siteContent.images.solar}
              alt="Solar Family Garden"
              className="h-[420px] w-full object-cover md:h-[520px]"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {siteContent.benefits.map((b) => {
            const Icon = iconMap[b.icon] || Sprout;
            return (
              <div key={b.title} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-[#e3ebde]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{b.title}</h3>
                <p className="mt-2 leading-7 text-[#516454]">{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">Ce oferim</p>
            <h2 className="mt-1 text-4xl font-semibold tracking-tight md:text-5xl">Produsele noastre</h2>
          </div>
          <Link
            href="/comanda-online"
            className="hidden items-center gap-1 text-sm font-semibold text-[#2f6a36] hover:text-[#1f4023] md:inline-flex"
          >
            Vezi toate <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/produs/${product.id}`}
              className="group rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-[#e3ebde] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ea]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b7a5f]">
                  {product.category}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{product.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[#516454]">{product.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{product.price.toFixed(2)} lei</p>
                    <p className="text-xs text-[#5b7a5f]">{product.unit}</p>
                  </div>
                  <span className="rounded-full bg-[#4f8f43] px-4 py-2 text-sm font-medium text-white group-hover:bg-[#3f7a35]">
                    Vezi
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center md:hidden">
          <Link href="/comanda-online">
            <Button variant="outline" className="rounded-full border-[#4f8f43] text-[#2f6a36]">
              Vezi toate produsele
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="overflow-hidden rounded-[40px] bg-gradient-to-br from-[#2f6a36] to-[#4f8f43] p-10 text-white shadow-xl md:p-16">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                Comandă acum și savurează prospețimea grădinii noastre
              </h2>
              <p className="mt-4 max-w-xl leading-8 text-white/85">
                Plasează comanda online în câteva minute. Te contactăm telefonic pentru confirmare și livrăm local proaspăt.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:justify-self-end">
              <Link href="/comanda-online">
                <Button size="lg" className="w-full rounded-full bg-white text-[#1f4023] hover:bg-white/90">
                  Comandă online <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:0749476386">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
                >
                  Sună: 0749 476 386
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
