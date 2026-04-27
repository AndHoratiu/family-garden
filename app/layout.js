import "@/app/globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  metadataBase: new URL("https://family-garden.ro"),
  title: {
    default: "Family Garden – Natură proaspătă pentru acasă | Vințu de Jos, Alba",
    template: "%s | Family Garden",
  },
  description:
    "Family Garden – legume, fructe, flori și răsaduri cultivate cu dragoste în Vințu de Jos, Alba. Comandă online direct de la producător, livrare locală. 10+ ani experiență, 500+ soiuri.",
  keywords: [
    "legume proaspete",
    "răsaduri",
    "flori sezoniere",
    "zacuscă de casă",
    "sirop și dulceață",
    "Family Garden",
    "Vințu de Jos",
    "Alba",
    "produse locale",
    "fără chimicale",
    "livrare locală",
  ],
  authors: [{ name: "Family Garden" }],
  creator: "Family Garden",
  publisher: "Family Garden",
  openGraph: {
    title: "Family Garden – Natură proaspătă pentru acasă",
    description:
      "Legume, fructe, flori și răsaduri cultivate local în Vințu de Jos. Comandă online cu livrare locală.",
    url: "/",
    siteName: "Family Garden",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: "https://andhoratiu.github.io/proiect-site-family-garden/LOGO.jpeg",
        width: 1200,
        height: 630,
        alt: "Family Garden",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Garden – Natură proaspătă pentru acasă",
    description:
      "Legume, fructe, flori și răsaduri cultivate local. Comandă online direct de la producător.",
    images: ["https://andhoratiu.github.io/proiect-site-family-garden/LOGO.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: "#4f8f43",
  width: "device-width",
  initialScale: 1,
};

const App = ({ children }) => {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Family Garden",
    image: "https://andhoratiu.github.io/proiect-site-family-garden/LOGO.jpeg",
    description:
      "Legume, fructe, flori și răsaduri cultivate local în Vințu de Jos, Alba.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Telman, nr. 46",
      addressLocality: "Vințu de Jos",
      addressRegion: "Alba",
      addressCountry: "RO",
    },
    telephone: ["+40749476386", "+40755736374"],
    email: ["b.androne@yahoo.com", "androne.horatiuro@gmail.com"],
    openingHours: "Mo-Sa",
    priceRange: "$",
  };

  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://andhoratiu.github.io" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body className="min-h-screen bg-[#f8f6f1] text-[#1f4023] antialiased">
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
