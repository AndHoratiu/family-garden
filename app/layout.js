import "@/app/globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Family Garden – Natură proaspătă pentru acasă",
  description:
    "Legume, fructe, flori și răsaduri cultivate cu dragoste în Vințu de Jos, Alba. Comandă online direct de la producător.",
};

const App = ({ children }) => {
  return (
    <html lang="ro">
      <body className="min-h-screen bg-[#f8f6f1] text-[#1f4023] antialiased">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
};

export default App;
