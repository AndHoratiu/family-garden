const BASE = "https://andhoratiu.github.io/proiect-site-family-garden";
const ASSETS = "https://customer-assets.emergentagent.com/job_fresh-harvest-152/artifacts";

export const siteImages = {
  logo: `${BASE}/LOGO.jpeg`,
  heroMain: `${ASSETS}/1cajzi3i_hero-main.jpg`,
  solar: `${BASE}/solar_1.jpeg`,
  peisaj: `${BASE}/peisaj_gradina_1.jpeg`,
  comenzi: `${BASE}/Comenzi.jpeg`,
  rosii: `${BASE}/rosii.jpeg`,
  castraveti: `${BASE}/castraveti.jpeg`,
  vinete: `${BASE}/vinete.jpeg`,
  spanac: `${BASE}/spanac.jpeg`,
  usturoi: `${BASE}/usturoi.jpeg`,
  ceapa: `${BASE}/ceapa.jpeg`,
  kapia: `${BASE}/kapia.jpeg`,
  telina: `${BASE}/telina.jpeg`,
  zmeura: `${BASE}/zmeura.jpeg`,
  mure: `${BASE}/mure.jpeg`,
  capsuni: `${BASE}/capsuni.jpeg`,
  panselute: `${BASE}/panselute.jpeg`,
  buchet: `${BASE}/buchet.jpeg`,
  rasad: `${BASE}/RASAD.jpeg`,
  legume: `${BASE}/legume.jpeg`,
  siropDulceata: `${BASE}/sirop%2Bdulceata.jpeg`,
  zacusca: `${BASE}/zacusca.jpeg`,
  // Imagini noi încărcate de utilizator
  morcovi: `${ASSETS}/qteatssz_ceapa.jpg`, // roabă cu morcovi
  morcoviCuFrunze: `${ASSETS}/ba9q03gn_telina.jpg`, // morcovi cu frunze verzi
  dulceataCaise: `${ASSETS}/kgfrh7da_zacusca.jpg`, // borcane dulceață caise
  palincaTraditionala: `${ASSETS}/0k4r87vx_vinete.jpg`, // sticle tradiționale cu tricolor
};

export const siteContent = {
  brand: "Family Garden",
  tagline: "Cultivat cu dragoste, livrat cu bucurie.",
  heroEyebrow: "Grădina ta de familie",
  heroTitle: "Natură proaspătă pentru acasă",
  heroSubtitle:
    "Legume, fructe, flori, răsaduri și alte plante crescute cu dragoste, direct din solar-ul nostru până la tine.",
  stats: [
    { value: "10+", label: "Ani de experiență" },
    { value: "500+", label: "Soiuri cultivate" },
    { value: "100%", label: "Cultivat local" },
  ],
  storyEyebrow: "Povestea noastră",
  storyTitle: "O pasiune pentru natură",
  storyText:
    "Family Garden a început ca un proiect de familie, din dorința de a aduce natura mai aproape de casele oamenilor. Cultivăm cu grijă și fără chimicale agresive, respectând ritmul natural al plantelor.",
  storyPoints: [
    "Răsaduri de legume și flori sezoniere",
    "Legume și fructe proaspete",
    "Sfaturi gratuite pentru îngrijirea plantelor",
    "Comenzi personalizate și livrare locală",
  ],
  benefits: [
    {
      title: "Sfaturi gratuite",
      text: "Te ajutăm cu sfaturi de îngrijire pentru fiecare plantă pe care o iei de la noi.",
      icon: "sprout",
    },
    {
      title: "Comenzi personalizate",
      text: "Cantități mari sau soiuri speciale? Le pregătim special pentru tine.",
      icon: "package",
    },
    {
      title: "Livrare locală",
      text: "Livrăm în zona Alba și împrejurimi direct la ușa ta, proaspete și pregătite.",
      icon: "truck",
    },
  ],
  contact: {
    address: "Alba, Vințu de Jos, Telman, nr. 46, România",
    schedule: "Luni – Sâmbătă",
    emails: ["b.androne@yahoo.com", "androne.horatiuro@gmail.com"],
    phones: ["0749476386", "0755736374"],
    phoneNote: "Apeluri și WhatsApp",
    facebook: "https://www.facebook.com/",
    socialLabel: "Urmărește-ne pe Facebook",
  },
  images: {
    hero: siteImages.heroMain,
    solar: siteImages.peisaj,
    logo: siteImages.logo,
  },
  galleryImages: [
    { src: siteImages.solar, alt: "Solarul nostru" },
    { src: siteImages.peisaj, alt: "Peisaj grădină" },
    { src: siteImages.comenzi, alt: "Comenzi pregătite" },
    { src: siteImages.spanac, alt: "Spanăc proaspăt" },
    { src: siteImages.zmeura, alt: "Zmeură" },
    { src: siteImages.mure, alt: "Mure" },
    { src: siteImages.buchet, alt: "Buchet de flori" },
    { src: siteImages.vinete, alt: "Vinete" },
    { src: siteImages.rosii, alt: "Roșii" },
    { src: siteImages.castraveti, alt: "Castraveți" },
    { src: siteImages.usturoi, alt: "Usturoi" },
    { src: siteImages.ceapa, alt: "Ceapă" },
    { src: siteImages.siropDulceata, alt: "Sirop și dulceață" },
    { src: siteImages.zacusca, alt: "Zacuscă" },
    { src: siteImages.capsuni, alt: "Căpșuni" },
    { src: siteImages.kapia, alt: "Ardei kapia" },
    { src: siteImages.telina, alt: "Țelină" },
    { src: siteImages.panselute, alt: "Panseluțe" },
  ],
};
