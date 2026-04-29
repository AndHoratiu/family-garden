import { MongoClient } from "mongodb";
import { products as seedProducts } from "@/lib/products-data";

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
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

let _seeded = false;
async function ensureSeeded(db) {
  if (_seeded) return;
  const count = await db.collection("products").countDocuments();
  if (count === 0) {
    const docs = seedProducts.map((p, idx) => ({
      ...p,
      sortOrder: idx,
      createdAt: new Date().toISOString(),
    }));
    await db.collection("products").insertMany(docs);
  }
  try {
    await db.collection("products").createIndex({ id: 1 }, { unique: true });
    await db.collection("products").createIndex({ sortOrder: 1 });
  } catch {}
  _seeded = true;
}

export async function getAllProducts({ activeOnly = true } = {}) {
  try {
    const db = await getDb();
    await ensureSeeded(db);
    const filter = activeOnly ? { active: { $ne: false } } : {};
    const docs = await db
      .collection("products")
      .find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .toArray();
    return docs.map(({ _id, ...rest }) => rest);
  } catch (e) {
    console.error("[products-server] DB error, falling back to seed:", e?.message);
    return seedProducts.filter((p) => !activeOnly || p.active);
  }
}

export async function getProductById(id) {
  try {
    const db = await getDb();
    await ensureSeeded(db);
    const doc = await db.collection("products").findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest;
  } catch {
    return seedProducts.find((p) => p.id === id) || null;
  }
}
