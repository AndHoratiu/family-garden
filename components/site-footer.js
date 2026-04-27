import Link from "next/link";
import { siteContent } from "@/lib/site-content";
import { MapPin, Clock, Mail, Phone, Facebook, Instagram, MessageCircle, Sprout } from "lucide-react";

const SiteFooter = () => {
  return (
    <footer className="mt-16 border-t border-[#e3ebde] bg-[#1f4023] text-[#e6efe1]">
      <div className="relative mx-auto max-w-7xl overflow-hidden px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-[#4f8f43]">
                <img src={siteContent.images.logo} alt="Family Garden" className="h-full w-full object-cover" />
              </div>
              <p className="font-serif text-2xl font-semibold">Family Garden</p>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#bcd1bf]">
              Legume, răsaduri și flori cultivate local, cu grijă pentru calitate și prospețime.
            </p>
            <div className="mt-4 flex gap-2">
              <a href={siteContent.contact.facebook} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2c5535] hover:bg-[#4f8f43]" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={`https://wa.me/40${siteContent.contact.phones[0].slice(1)}`} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2c5535] hover:bg-[#25d366]" aria-label="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#a9c4ad]">Navigare</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white">Acasă</Link></li>
              <li><Link href="/comanda-online" className="hover:text-white">Produse</Link></li>
              <li><Link href="/galerie" className="hover:text-white">Galerie</Link></li>
              <li><Link href="/despre-noi" className="hover:text-white">Despre noi</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#a9c4ad]">Contact</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {siteContent.contact.address}</li>
              <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0" /> {siteContent.contact.schedule}</li>
              {siteContent.contact.phones.map((phone) => (
                <li key={phone} className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                  <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#a9c4ad]">Email</p>
            <ul className="mt-4 space-y-2 text-sm">
              {siteContent.contact.emails.map((email) => (
                <li key={email} className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                  <a href={`mailto:${email}`} className="break-all hover:text-white">{email}</a>
                </li>
              ))}
            </ul>
            <a
              href={siteContent.contact.facebook}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4f8f43] px-4 py-2 text-sm font-medium text-white hover:bg-[#3f7a35]"
            >
              <Facebook className="h-4 w-4" /> Facebook
            </a>
          </div>
        </div>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-2 right-2 hidden h-32 w-44 text-[#2c5535] opacity-50 md:block"
          viewBox="0 0 200 140"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="40" cy="110" r="14" />
          <circle cx="160" cy="110" r="14" />
          <path d="M30 80 L170 80 L150 110 L50 110 Z" />
          <path d="M70 80 L60 50 L120 50 L130 80" />
          <path d="M85 50 L85 35 M100 50 L100 30 M115 50 L115 35" />
        </svg>
      </div>

      <div className="border-t border-[#2c5535] py-5 text-center text-xs text-[#a9c4ad]">
        © {new Date().getFullYear()} Family Garden. Toate drepturile rezervate.
      </div>
    </footer>
  );
};

export default SiteFooter;
