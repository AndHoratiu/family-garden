export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: "https://familygarden.ro/sitemap.xml",
    host: "https://familygarden.ro",
  };
}
