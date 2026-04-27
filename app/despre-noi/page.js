import Link from "next/link";
import { siteContent } from "@/lib/site-content";
import { Button } from "@/components/ui/button";
import { Sprout, Heart, Sun, CheckCircle2 } from "lucide-react";

const AboutPage = () => {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7a5f]">Despre noi</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{siteContent.storyTitle}</h1>
            <p className="text-lg leading-8 text-[#516454]">{siteContent.storyText}</p>
            <p className="text-lg leading-8 text-[#516454]">
              Pentru noi, fiecare răsad și fiecare floare contează. Lucrăm zi de zi în solar pentru a-ți oferi produse de calitate, exact cum am face pentru propria noastră familie.
            </p>
            <ul className="space-y-3 pt-2">
              {siteContent.storyPoints.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4f8f43]" />
                  <span className="text-[#2a4430]">{p}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <Link href="/comanda-online">
                <Button size="lg" className="rounded-full bg-[#4f8f43] hover:bg-[#3f7a35]">Vezi produsele</Button>
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-[36px] bg-white shadow-xl ring-1 ring-black/5">
            <img src={siteContent.images.solar} alt="Solar" className="h-[520px] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {[{Icon: Heart, title: "Cu dragoste", text: "Fiecare plantă este îngrijită ca în grădina noastră."},
            {Icon: Sun, title: "Sezonul tău", text: "Cultivăm pe ritmul natural al plantelor, fără forțări."},
            {Icon: Sprout, title: "Local 100%", text: "Soiuri cultivate aici, în Vințu de Jos, Alba."}].map(({Icon, title, text}) => (
            <div key={title} className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-[#e3ebde]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ea] text-[#2f6a36]"><Icon className="h-6 w-6" /></div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 leading-7 text-[#516454]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
