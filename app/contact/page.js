import { siteContent } from "@/lib/site-content";
import { MapPin, Clock, Mail, Phone, Facebook } from "lucide-react";

const ContactPage = () => {
  const c = siteContent.contact;
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">Contact</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Hai să vorbim</h1>
        <p className="max-w-2xl text-lg leading-8 text-[#516454]">
          Ai întrebări despre produsele noastre? Vrei o comandă personalizată? Suntem aici să te ajutăm.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard icon={MapPin} title="Adresă">
          <p>{c.address}</p>
        </InfoCard>
        <InfoCard icon={Clock} title="Program">
          <p>{c.schedule}</p>
        </InfoCard>
        <InfoCard icon={Phone} title="Telefon">
          {c.phones.map((p) => (
            <a key={p} href={`tel:${p}`} className="block hover:text-[#4f8f43]">{p}</a>
          ))}
        </InfoCard>
        <InfoCard icon={Mail} title="Email">
          {c.emails.map((e) => (
            <a key={e} href={`mailto:${e}`} className="block break-all hover:text-[#4f8f43]">{e}</a>
          ))}
        </InfoCard>
      </div>

      <div className="mt-10 rounded-3xl bg-gradient-to-br from-[#2f6a36] to-[#4f8f43] p-10 text-white shadow-xl">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold">{c.socialLabel}</h3>
            <p className="mt-1 text-white/85">Vezi cele mai noi produse și actualizări de sezon.</p>
          </div>
          <a
            href={c.facebook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-[#1f4023] hover:bg-white/90"
          >
            <Facebook className="h-4 w-4" /> Facebook
          </a>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-[#e3ebde]">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mt-4 text-lg font-semibold">{title}</h3>
    <div className="mt-2 leading-7 text-[#516454]">{children}</div>
  </div>
);

export default ContactPage;
