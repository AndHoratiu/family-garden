import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--font-playfair", display: "swap", weight: ["400", "500", "600", "700", "800"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://familygarden.ro";
const FALLBACK_LOGO = "https://customer-assets.emergentagent.com/job_fresh-harvest-152/artifacts/tqfpgjzu_Screenshot_20260429_205344_WhatsApp.jpg";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Family Garden – Natură proaspătă pentru acasă | Vințu de Jos, Alba",
    template: "%s | Family Garden",
  },
  description:
    "Family Garden – legume, fructe, flori și răsaduri cultivate cu dragoste în Vințu de Jos, Alba. Comandă online direct de la producător, livrare locală.",
  keywords: [
    "legume proaspete", "răsaduri", "flori sezoniere", "zacuscă de casă", "sirop și dulceață",
    "Family Garden", "Vințu de Jos", "Alba", "produse locale", "fără chimicale", "livrare locală",
  ],
  authors: [{ name: "Family Garden", url: SITE_URL }],
  creator: "Family Garden",
  publisher: "Family Garden",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Family Garden – Natură proaspătă pentru acasă",
    description: "Legume, fructe, flori și răsaduri cultivate local în Vințu de Jos. Comandă online cu livrare locală.",
    url: SITE_URL,
    siteName: "Family Garden",
    locale: "ro_RO",
    type: "website",
    images: [{ url: FALLBACK_LOGO, width: 1200, height: 630, alt: "Family Garden" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Garden – Natură proaspătă pentru acasă",
    description: "Legume, fructe, flori și răsaduri cultivate local. Comandă online direct de la producător.",
    images: [FALLBACK_LOGO],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  themeColor: "#2f6a36",
  width: "device-width",
  initialScale: 1,
};

const App = ({ children }) => {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Family Garden",
    url: SITE_URL,
    image: FALLBACK_LOGO,
    description: "Legume, fructe, flori și răsaduri cultivate local în Vințu de Jos, Alba.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Telman, nr. 46",
      addressLocality: "Vințu de Jos",
      addressRegion: "Alba",
      addressCountry: "RO",
    },
    telephone: ["+40749476386", "+40755736374"],
    email: ["comenzi@familygarden.ro", "b.androne@yahoo.com", "androne.horatiuro@gmail.com"],
    openingHours: "Mo-Sa",
    priceRange: "$",
  };

  return (
    <html lang="ro" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://andhoratiu.github.io" />
        <link rel="preconnect" href="https://customer-assets.emergentagent.com" />
        <link rel="preconnect" href="https://drive.google.com" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />
      </head>
      <body className="min-h-screen bg-[#f8f5ed] font-sans text-[#1f4023] antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <WhatsAppButton />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
};

export default App;
