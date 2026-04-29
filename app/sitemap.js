import { products } from "@/lib/products-data";

const BASE = "https://familygarden.ro";

export default function sitemap() {
  const staticPaths = [
    "",
    "/comanda-online",
    "/galerie",
    "/despre-noi",
    "/contact",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));

  const productPaths = products
    .filter((p) => p.active)
    .map((p) => ({
      url: `${BASE}/produs/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticPaths, ...productPaths];
}
