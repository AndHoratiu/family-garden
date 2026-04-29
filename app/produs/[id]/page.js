"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft,
  Plus,
  Minus,
  ShoppingBasket,
  CheckCircle2,
  Truck,
  Calendar,
  Package,
  Loader2,
} from "lucide-react";

const ProductDetail = ({ params }) => {
  const router = useRouter();
  // Next 15: params can be a Promise; safely unwrap if needed
  const resolved = typeof params?.then === "function" ? use(params) : params;
  const id = resolved?.id;

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, listRes] = await Promise.all([
          fetch(`/api/products/${id}`, { cache: "no-store" }),
          fetch(`/api/products`, { cache: "no-store" }),
        ]);
        const pData = await pRes.json();
        const listData = await listRes.json();
        if (!mounted) return;
        if (pRes.ok && pData.product) {
          setProduct(pData.product);
          setQty(pData.product.minOrder || 1);
        }
        if (listRes.ok) setAllProducts(listData.products || []);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4 py-32">
        <Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">Produs inexistent</h1>
        <Link href="/comanda-online" className="mt-4 inline-block text-[#4f8f43] hover:underline">
          Înapoi la produse
        </Link>
      </div>
    );
  }

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAdd = () => {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("fg_pending_cart") || "{}");
      stored[product.id] = (stored[product.id] || 0) + qty;
      localStorage.setItem("fg_pending_cart", JSON.stringify(stored));
      toast.success(`${qty} × ${product.name} adăugat în coș`);
      router.push("/comanda-online");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <Link href="/comanda-online" className="mb-6 inline-flex items-center gap-1 text-sm text-[#5b7a5f] hover:text-[#1f4023]">
        <ChevronLeft className="h-4 w-4" /> Înapoi la produse
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-xl ring-1 ring-[#e3ebde]">
          <img src={product.image} alt={product.name} className="h-full max-h-[600px] w-full object-cover" />
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full border-[#4f8f43] text-[#2f6a36]">
              {product.category}
            </Badge>
            {product.stock <= 10 && product.stock > 0 && (
              <Badge className="rounded-full bg-[#f59e0b] hover:bg-[#f59e0b]">Stoc limitat</Badge>
            )}
            {product.stock === 0 && (
              <Badge className="rounded-full bg-red-500 hover:bg-red-500">Indisponibil</Badge>
            )}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{product.name}</h1>
          <p className="text-lg leading-8 text-[#516454]">{product.description}</p>

          <div className="flex items-baseline gap-2 pt-2">
            <span className="text-5xl font-bold text-[#2f6a36]">{Number(product.price).toFixed(2)}</span>
            <span className="text-xl font-semibold text-[#5b7a5f]">{product.unit}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-[#f8faf6] p-4">
            <Info icon={Calendar} label="Sezon" value={product.season} />
            <Info icon={Package} label="Stoc" value={product.stock} />
            <Info icon={ShoppingBasket} label="Min. comandă" value={product.minOrder} />
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-[#e3ebde]">
            <span className="text-sm font-semibold">Cantitate:</span>
            <div className="flex items-center gap-2 rounded-full bg-[#eef3ea] p-1">
              <button
                onClick={() => setQty(Math.max(product.minOrder, qty - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-[#dde6d8]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[40px] text-center font-semibold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f8f43] text-white hover:bg-[#3f7a35]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="ml-auto text-lg font-bold">{(product.price * qty).toFixed(2)} lei</span>
          </div>

          <Button onClick={handleAdd} disabled={product.stock === 0} size="lg" className="w-full rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">
            <ShoppingBasket className="mr-2 h-4 w-4" /> {product.stock === 0 ? "Indisponibil" : "Adaugă în coș"}
          </Button>

          <ul className="space-y-2 pt-2 text-sm text-[#516454]">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-[#4f8f43]" /> Livrare locală în Alba și împrejurimi</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#4f8f43]" /> Cultivat local, fără chimicale agresive</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Produse asemănătoare</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/produs/${p.id}`}
                className="group rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#e3ebde] transition hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ea]">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                </div>
                <div className="px-2 pt-3 pb-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-[#2f6a36]">{Number(p.price).toFixed(2)} lei</span>
                    <span className="text-xs text-[#5b7a5f]">{p.unit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-[#5b7a5f]">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <p className="mt-1 text-sm font-semibold">{value}</p>
  </div>
);

export default ProductDetail;
