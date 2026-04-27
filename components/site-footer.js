import Link from "next/link";
import { siteContent } from "@/lib/site-content";
import { MapPin, Clock, Mail, Phone, Facebook, Sprout } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#e3ebde] bg-[#1f4023] text-[#e6efe1]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4f8f43]">
              <Sprout className="h-5 w-5" />
            </div>
            <p className="text-xl font-semibold">Family Garden</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-[#bcd1bf]">
            {siteContent.tagline} Proiect de familie din Vințu de Jos, Alba.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#a9c4ad]">Navigare</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Acasă</Link></li>
            <li><Link href="/comanda-online" className="hover:text-white">Comandă online</Link></li>
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

      <div className="border-t border-[#2c5535] py-5 text-center text-xs text-[#a9c4ad]">
        © {new Date().getFullYear()} Family Garden. Toate drepturile rezervate.
      </div>
    </footer>
  );
}
