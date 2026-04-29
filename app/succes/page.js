"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/site-content";

const SuccessContent = () => {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data.order || null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <div className="rounded-[36px] bg-white p-10 text-center shadow-xl ring-1 ring-[#e3ebde] md:p-14">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef3ea]">
          <CheckCircle2 className="h-10 w-10 text-[#4f8f43]" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">Mulțumim pentru comandă!</h1>
        <p className="mt-3 text-[#516454]">
          Comanda ta a fost înregistrată cu succes. Te vom contacta telefonic în cel mai scurt timp pentru confirmare.
        </p>

        {loading ? (
          <div className="mt-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#5b7a5f]" /></div>
        ) : order ? (
          <div className="mt-8 space-y-4 rounded-2xl bg-[#f8faf6] p-6 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b7a5f]">Număr comandă</span>
              <span className="font-mono font-semibold">#{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b7a5f]">Status</span>
              <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-semibold text-[#8a6212]">În așteptare</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b7a5f]">Livrare</span>
              <span className="font-semibold">{order.deliveryMethod}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5b7a5f]">Plată</span>
              <span className="font-semibold">{order.paymentMethod}</span>
            </div>
            <div className="border-t border-[#e3ebde] pt-3">
              <p className="mb-2 text-sm font-semibold">Produse</p>
              <ul className="space-y-1 text-sm text-[#516454]">
                {order.items?.map((it) => (
                  <li key={it.id} className="flex justify-between">
                    <span>{it.quantity} × {it.name}</span>
                    <span>{(it.price * it.quantity).toFixed(2)} lei</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between border-t border-[#e3ebde] pt-3 text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-[#2f6a36]">{order.total?.toFixed(2)} lei</span>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-[#f8faf6] p-6 text-sm text-[#516454]">
            Comanda a fost trimisă. Verifică telefonul pentru confirmare.
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <a href={`tel:${siteContent.contact.phones[0]}`}>
            <Button variant="outline" className="rounded-full border-[#4f8f43] text-[#2f6a36]">
              <Phone className="mr-2 h-4 w-4" /> Întrebări? {siteContent.contact.phones[0]}
            </Button>
          </a>
          <Link href="/comanda-online" className="text-sm text-[#5b7a5f] hover:text-[#1f4023]">
            <Package className="mr-1 inline h-4 w-4" /> Comandă din nou
          </Link>
        </div>
      </div>
    </div>
  );
};

const SuccessFallback = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4">
    <Loader2 className="h-6 w-6 animate-spin text-[#5b7a5f]" />
  </div>
);

const SuccessPage = () => (
  <Suspense fallback={<SuccessFallback />}>
    <SuccessContent />
  </Suspense>
);

export default SuccessPage;
