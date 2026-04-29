import { MongoClient } from "mongodb";

let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || "family_garden";
  if (!uri) throw new Error("MONGO_URL is not set");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
}

export const DEFAULT_SETTINGS = {
  id: "main",
  hero: {
    title: "Comandă online produse proaspete de la Family Garden",
    subtitle:
      "Legume, răsaduri și flori cultivate local, cu grijă pentru calitate, prospețime și gust autentic. Vezi rapid ce este disponibil și comandă simplu, online.",
    image: "https://customer-assets.emergentagent.com/job_fresh-harvest-152/artifacts/1cajzi3i_hero-main.jpg",
  },
  whyUs: [
    { title: "Cultivat local", text: "Produse crescute cu grijă, aproape de client." },
    { title: "Stoc clar și transparent", text: "Vezi imediat ce este disponibil." },
    { title: "Comandă simplă", text: "Livrare locală sau ridicare personală." },
  ],
  contact: {
    address: "Vințu de Jos, Telman, nr. 46, Alba, România",
    schedule: "Luni – Sâmbătă · 08:00 – 19:00",
    phone: "0749476386",
    phoneAlt: "0755736374",
    email: "comenzi@familygarden.ro",
    mapUrl: "",
  },
  social: {
    facebook: "https://www.facebook.com/",
    instagram: "",
    whatsapp: "https://wa.me/40749476386",
  },
  delivery: {
    enabled: true,
    fee: 15,
    freeAbove: 0, // 0 = disabled
    pickupEnabled: true,
    pickupAddress: "Vințu de Jos, Telman, nr. 46, Alba",
  },
  payment: {
    rambursEnabled: true,
    onlineEnabled: false,
  },
  emails: {
    recipients: ["androne.horatiuro@gmail.com", "b.androne@yahoo.com"],
  },
};

function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return override ?? base;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    const v = override[k];
    if (v && typeof v === "object" && !Array.isArray(v) && base?.[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      out[k] = deepMerge(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export async function getSettings() {
  try {
    const db = await getDb();
    const doc = await db.collection("settings").findOne({ id: "main" });
    if (!doc) return { ...DEFAULT_SETTINGS };
    const { _id, ...rest } = doc;
    return deepMerge(DEFAULT_SETTINGS, rest);
  } catch (e) {
    console.error("[settings-server] error:", e?.message);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateSettings(patch) {
  const db = await getDb();
  const current = await getSettings();
  const allowedKeys = ["hero", "whyUs", "contact", "social", "delivery", "payment", "emails"];
  const next = { ...current };
  for (const k of allowedKeys) {
    if (patch[k] !== undefined) next[k] = patch[k];
  }
  next.id = "main";
  next.updatedAt = new Date().toISOString();
  await db.collection("settings").updateOne(
    { id: "main" },
    { $set: next },
    { upsert: true }
  );
  return next;
}
