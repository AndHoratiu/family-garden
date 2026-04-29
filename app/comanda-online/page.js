"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SEASON_FILTERS,
  getCurrentSeasonKey,
  isProductInSeason,
  getProductSeasonBadges,
  SEASONS,
} from "@/lib/season-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  Loader2,
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  Wallet,
} from "lucide-react";

const DELIVERY_FEE = 15;

const productCategories = ["Toate", "Legume", "Fructe", "Flori", "Răsaduri", "Produse artizanale"];

const ComandaOnlinePage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toate");
  const [season, setSeason] = useState("all");
  const [cart, setCart] = useState({});
  const [delivery, setDelivery] = useState("Livrare locală");
  const [payment, setPayment] = useState("Ramburs");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    notes: "",
  });

  // Fetch products + settings from MongoDB
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const pRes = await fetch("/api/products", { cache: "no-store" });
        const pData = await pRes.json();
        if (cancelled) return;
        const list = Array.isArray(pData.products) ? pData.products : [];
        setProducts(list);
        setProductsLoading(false);
      } catch (e) {
        console.error("[comanda-online] products fetch error:", e);
        if (!cancelled) setProductsLoading(false);
      }

      try {
        const sRes = await fetch("/api/settings", { cache: "no-store" });
        const sData = await sRes.json();
        if (cancelled) return;
        setSettings(sData.settings || null);
        const d = sData.settings?.delivery;
        const p = sData.settings?.payment;
        if (d) {
          if (!d.enabled && d.pickupEnabled) setDelivery("Ridicare personală");
          else if (d.enabled) setDelivery("Livrare locală");
        }
        if (p) {
          if (!p.rambursEnabled && p.onlineEnabled) setPayment("Plată online");
          else if (p.rambursEnabled) setPayment("Ramburs");
        }
      } catch (e) {
        console.error("[comanda-online] settings fetch error:", e);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Hydrate cart from localStorage (initial + redirect from product detail)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const persisted = JSON.parse(localStorage.getItem("fg_cart") || "{}");
      const pending = JSON.parse(localStorage.getItem("fg_pending_cart") || "{}");
      const merged = { ...persisted };
      for (const [k, v] of Object.entries(pending)) {
        merged[k] = (merged[k] || 0) + Number(v || 0);
      }
      if (Object.keys(merged).length > 0) setCart(merged);
      if (Object.keys(pending).length > 0) localStorage.removeItem("fg_pending_cart");
    } catch {}
  }, []);

  // Persist cart to localStorage and notify header badge
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("fg_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("fg-cart-changed"));
    } catch {}
  }, [cart]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "Toate" || product.category === category;
      const matchesSeason = isProductInSeason(product.season, season);
      return matchesSearch && matchesCategory && matchesSeason && product.active;
    });
  }, [products, search, category, season]);

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === id);
        return product ? { ...product, quantity: qty } : null;
      })
      .filter(Boolean);
  }, [cart, products]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryEnabled = settings?.delivery?.enabled !== false;
  const pickupEnabled = settings?.delivery?.pickupEnabled !== false;
  const rambursEnabled = settings?.payment?.rambursEnabled !== false;
  const onlineEnabled = settings?.payment?.onlineEnabled === true;
  const deliveryFeeBase = Number(settings?.delivery?.fee ?? DELIVERY_FEE);
  const freeAbove = Number(settings?.delivery?.freeAbove ?? 0);
  const isLocalDelivery = delivery === "Livrare locală" && deliveryEnabled;
  const qualifiesFreeShipping = freeAbove > 0 && subtotal >= freeAbove;
  const deliveryFee = isLocalDelivery && subtotal > 0 && !qualifiesFreeShipping ? deliveryFeeBase : 0;
  const total = subtotal + deliveryFee;
  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const current = prev[product.id] || 0;
      const next = current === 0 ? product.minOrder : current + 1;
      if (next > product.stock) {
        toast.error(`Stoc disponibil: ${product.stock}`);
        return prev;
      }
      return { ...prev, [product.id]: next };
    });
    toast.success(`${product.name} adăugat în coș`);
  };

  const updateQty = (productId, delta) => {
    setCart((prev) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return prev;
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      if (next > product.stock) {
        toast.error(`Stoc disponibil: ${product.stock}`);
        return prev;
      }
      return { ...prev, [productId]: next };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Coșul este gol. Adaugă produse pentru a comanda.");
      return;
    }
    if (!form.customerName || !form.customerPhone) {
      toast.error("Te rugăm completează numele și telefonul.");
      return;
    }
    if (delivery === "Livrare locală" && !form.customerAddress) {
      toast.error("Adresa este obligatorie pentru livrare locală.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        deliveryMethod: delivery,
        paymentMethod: payment,
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          unit: i.unit,
        })),
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la plasarea comenzii");
      // Clear cart on success
      try {
        localStorage.setItem("fg_cart", "{}");
        window.dispatchEvent(new Event("fg-cart-changed"));
      } catch {}
      toast.success("Comanda a fost plasată cu succes!");
      router.push(`/succes?order=${data.orderId}`);
    } catch (err) {
      toast.error(err.message || "A apărut o eroare");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">Comandă online</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight md:text-6xl">Produse și disponibilitate</h1>
        <p className="max-w-3xl text-lg leading-8 text-[#516454]">
          Vezi produsele disponibile, alege cantitatea dorită și finalizează comanda online. Te contactăm telefonic pentru confirmare.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#5b7a5f]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută un produs..."
            className="h-12 rounded-2xl border-[#d8e3d4] bg-white pl-12 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {productCategories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-[#4f8f43] text-white shadow"
                  : "border border-[#d8e3d4] bg-white text-[#2a4430] hover:border-[#4f8f43]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Season filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-[#5b7a5f]">
            Sezon:
          </span>
          {SEASON_FILTERS.map((s) => {
            const active = season === s.key;
            const isCurrent = s.key === getCurrentSeasonKey();
            return (
              <button
                key={s.key}
                onClick={() => setSeason(s.key)}
                className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#1f4023] text-white shadow"
                    : "border border-[#d8e3d4] bg-white text-[#2a4430] hover:border-[#4f8f43]"
                }`}
              >
                <span className="mr-1">{s.emoji}</span>
                {s.label}
                {isCurrent && s.key !== "all" && s.key !== "totAnul" && (
                  <span className="ml-1.5 rounded-full bg-[#4f8f43] px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Acum
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
        {/* PRODUCT GRID */}
        <div>
          {visibleProducts.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center text-[#5b7a5f] ring-1 ring-[#e3ebde]">
              Nu am găsit produse care să corespundă căutării.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => {
                const inCart = cart[product.id] || 0;
                const out = product.stock === 0;
                const low = product.stock > 0 && product.stock <= 10;
                const stockBadge = out
                  ? { label: "Indisponibil", cls: "bg-red-100 text-red-700" }
                  : low
                  ? { label: "Stoc limitat", cls: "bg-amber-100 text-amber-700" }
                  : { label: "În stoc", cls: "bg-emerald-100 text-emerald-700" };
                return (
                  <article
                    key={product.id}
                    className="flex flex-col rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#e3ebde] transition hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3ea]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`h-full w-full object-cover ${out ? "opacity-50" : ""}`}
                      />
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${stockBadge.cls}`}>
                        {stockBadge.label}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col px-2 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5b7a5f]">
                        {product.category}
                      </p>
                      <h2 className="mt-1 font-serif text-xl font-semibold leading-snug">{product.name}</h2>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#516454]">{product.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {getProductSeasonBadges(product.season).map((s) => (
                          <span
                            key={s.key}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${s.color}`}
                          >
                            <span>{s.emoji}</span> {s.label}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-[#5b7a5f]">
                        <span>Stoc: {product.stock}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div>
                          <p className="text-xl font-bold text-[#1f4023]">{product.price.toFixed(2)} lei</p>
                          <p className="text-xs text-[#5b7a5f]">{product.unit}</p>
                        </div>
                        {out ? (
                          <Button disabled className="rounded-full bg-gray-200 text-gray-500 cursor-not-allowed">
                            Indisponibil
                          </Button>
                        ) : inCart > 0 ? (
                          <div className="flex items-center gap-1 rounded-full bg-[#eef3ea] p-1">
                            <button
                              onClick={() => updateQty(product.id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm hover:bg-[#dde6d8]"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[28px] text-center text-sm font-semibold">{inCart}</span>
                            <button
                              onClick={() => updateQty(product.id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4f8f43] text-white hover:bg-[#3f7a35]"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(product)}
                            className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]"
                          >
                            Adaugă
                          </Button>
                        )}
                      </div>
                      {product.minOrder > 1 && (
                        <p className="mt-2 text-xs text-[#5b7a5f]">Min. comandă: {product.minOrder} {product.unit.split(" / ")[1] || "buc"}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* CHECKOUT SIDEBAR */}
        <aside className="sticky top-24 h-fit space-y-5">
          <div className="rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-[#e3ebde]">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <ShoppingBasket className="h-5 w-5" /> Coșul tău
              </h2>
              {totalQty > 0 && (
                <Badge className="rounded-full bg-[#4f8f43] hover:bg-[#4f8f43]">{totalQty} produse</Badge>
              )}
            </div>

            {cartItems.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-[#f2f7ef] p-4 text-sm text-[#516454]">
                Coșul este gol. Adaugă produse din lista de mai sus.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl bg-[#f8faf6] p-3"
                  >
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-[#5b7a5f]">
                        {item.quantity} × {item.price.toFixed(2)} lei
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{(item.price * item.quantity).toFixed(2)} lei</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#5b7a5f] hover:text-red-600"
                      aria-label="Șterge"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="mt-5 space-y-2 border-t border-[#e3ebde] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#516454]">Subtotal</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#516454]">Livrare</span>
                  <span className="font-semibold">
                    {deliveryFee > 0 ? `${deliveryFee.toFixed(2)} lei` : "Gratuit"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#e3ebde] pt-2 text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-[#2f6a36]">{total.toFixed(2)} lei</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="rounded-[28px] bg-white p-6 shadow-lg ring-1 ring-[#e3ebde] space-y-5">
            <h3 className="text-lg font-semibold">Date de contact</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nume complet *</Label>
                <Input
                  id="name"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Ion Popescu"
                  className="mt-1.5 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="07xx xxx xxx"
                  className="mt-1.5 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="email@exemplu.ro"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="address">
                  Adresă {delivery === "Livrare locală" ? "de livrare *" : ""}
                </Label>
                <Input
                  id="address"
                  value={form.customerAddress}
                  onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
                  placeholder="Stradă, număr, oraș"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="notes">Observații</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Detalii suplimentare pentru comandă"
                  className="mt-1.5 min-h-20 rounded-xl"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Metodă de livrare</p>
              <div className="grid grid-cols-2 gap-2">
                {deliveryEnabled && (
                  <OptionButton
                    active={delivery === "Livrare locală"}
                    onClick={() => setDelivery("Livrare locală")}
                    icon={Truck}
                    label="Livrare locală"
                    sub={qualifiesFreeShipping ? "Gratuit" : `${deliveryFeeBase} lei`}
                  />
                )}
                {pickupEnabled && (
                  <OptionButton
                    active={delivery === "Ridicare personală"}
                    onClick={() => setDelivery("Ridicare personală")}
                    icon={Store}
                    label="Ridicare"
                    sub="Gratuit"
                  />
                )}
              </div>
              {freeAbove > 0 && !qualifiesFreeShipping && delivery === "Livrare locală" && (
                <p className="mt-2 rounded-xl bg-[#eef3ea] p-2.5 text-xs text-[#2f6a36]">
                  💚 Livrare gratuită peste {freeAbove} lei (mai ai {(freeAbove - subtotal).toFixed(2)} lei)
                </p>
              )}
              {delivery === "Ridicare personală" && settings?.delivery?.pickupAddress && (
                <p className="mt-2 rounded-xl bg-[#f8faf6] p-2.5 text-xs text-[#516454]">
                  📍 Ridicare de la: {settings.delivery.pickupAddress}
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">Metodă de plată</p>
              <div className="grid grid-cols-2 gap-2">
                {rambursEnabled && (
                  <OptionButton
                    active={payment === "Ramburs"}
                    onClick={() => setPayment("Ramburs")}
                    icon={Wallet}
                    label="Ramburs"
                    sub="La livrare"
                  />
                )}
                <OptionButton
                  active={payment === "Plată online" && onlineEnabled}
                  onClick={() => setPayment("Plată online")}
                  icon={CreditCard}
                  label="Online"
                  sub={onlineEnabled ? "Card" : "Card · indisponibil"}
                  disabled={!onlineEnabled}
                  badge={!onlineEnabled ? "În curând" : null}
                />
              </div>
              {!onlineEnabled && (
                <p className="mt-2 rounded-xl bg-[#fff7e6] p-3 text-xs text-[#8a6212]">
                  💳 Plata online cu cardul va fi disponibilă în curând. Momentan poți comanda cu plată ramburs (la livrare).
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting || cartItems.length === 0}
              className="w-full rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]"
            >
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Se trimite...</>
              ) : (
                <>Plasează comanda • {total.toFixed(2)} lei</>
              )}
            </Button>
            <p className="flex items-start gap-2 text-xs text-[#5b7a5f]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4f8f43]" />
              Te contactăm telefonic pentru a confirma comanda și detaliile de livrare.
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
};

const OptionButton = ({ active, onClick, icon: Icon, label, sub, disabled, badge }) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    aria-disabled={disabled}
    className={`relative flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
      disabled
        ? "cursor-not-allowed border-[#e3ebde] bg-[#f5f7f2] text-[#9aa89c] opacity-80"
        : active
        ? "border-[#4f8f43] bg-[#eef3ea] text-[#1f4023] ring-2 ring-[#4f8f43]/20"
        : "border-[#d8e3d4] bg-white text-[#2a4430] hover:border-[#4f8f43]"
    }`}
  >
    {badge && (
      <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
        {badge}
      </span>
    )}
    <Icon className={`h-4 w-4 ${disabled ? "text-[#9aa89c]" : active ? "text-[#4f8f43]" : "text-[#5b7a5f]"}`} />
    <span className="text-sm font-semibold">{label}</span>
    <span className={`text-xs ${disabled ? "text-[#9aa89c]" : "text-[#5b7a5f]"}`}>{sub}</span>
  </button>
);

export default ComandaOnlinePage;
