"use client";

import { useEffect, useState } from "react";
import { siteContent } from "@/lib/site-content";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const GaleriePage = () => {
  const [active, setActive] = useState(null);
  const images = siteContent.galleryImages;

  const close = () => setActive(null);
  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (active === null) return;
    const handler = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">Vizitează-ne</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Din grădina noastră</h1>
        <p className="max-w-2xl text-lg leading-8 text-[#516454]">
          Imagini reale din solarul și grădina noastră, cu produse cultivate cu grijă în Vințu de Jos.
        </p>
      </div>

      <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="group mb-4 block w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#e3ebde]"
          >
            <div className="relative">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-white opacity-0 transition group-hover:bg-white/90 group-hover:text-[#1f4023] group-hover:opacity-100">
                  <ZoomIn className="h-5 w-5" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
        >
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Închide"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={images[active].src}
            alt={images[active].alt}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            aria-label="Următor"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white backdrop-blur">
            {active + 1} / {images.length} — {images[active].alt}
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriePage;
