export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: "https://family-garden.ro/sitemap.xml",
  };
}
