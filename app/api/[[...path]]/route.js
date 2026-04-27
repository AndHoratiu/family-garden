import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";

let cachedClient = null;
let cachedDb = null;

const getDb = async () => {
  if (cachedDb) return cachedDb;
  const uri = process.env.MONGO_URL;
  const dbName = process.env.DB_NAME || "family_garden";
  if (!uri) throw new Error("MONGO_URL is not set");
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  cachedDb = client.db(dbName);
  return cachedDb;
};

const json = (data, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

export async function OPTIONS() {
  return json({}, 200);
}

const getPath = (params) => {
  const segs = params?.path || [];
  return Array.isArray(segs) ? segs : [segs];
};

export async function GET(request, { params }) {
  try {
    const segs = getPath(await params);

    if (segs.length === 0 || segs[0] === "") {
      return json({ ok: true, service: "Family Garden API" });
    }

    if (segs[0] === "health") {
      return json({ status: "ok" });
    }

    if (segs[0] === "orders") {
      const db = await getDb();
      // GET /api/orders/:id
      if (segs[1]) {
        const order = await db.collection("orders").findOne({ id: segs[1] });
        if (!order) return json({ error: "Order not found" }, 404);
        const { _id, ...rest } = order;
        return json({ order: rest });
      }
      // GET /api/orders
      const list = await db
        .collection("orders")
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();
      return json({
        orders: list.map(({ _id, ...rest }) => rest),
      });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("GET error:", err);
    return json({ error: err.message || "Server error" }, 500);
  }
}

export async function POST(request, { params }) {
  try {
    const segs = getPath(await params);
    const body = await request.json().catch(() => ({}));

    if (segs[0] === "orders") {
      const required = ["customerName", "customerPhone", "items"];
      for (const k of required) {
        if (!body[k] || (k === "items" && body.items.length === 0)) {
          return json({ error: `Missing field: ${k}` }, 400);
        }
      }

      const db = await getDb();
      const id = uuidv4();
      const subtotal = body.items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);
      const deliveryFee = body.deliveryMethod === "Livrare locală" ? 15 : 0;
      const total = subtotal + deliveryFee;

      // generate short order number
      const orderNumber = `FG${Date.now().toString().slice(-6)}`;

      const order = {
        id,
        orderNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail || "",
        customerAddress: body.customerAddress || "",
        notes: body.notes || "",
        deliveryMethod: body.deliveryMethod || "Livrare locală",
        paymentMethod: body.paymentMethod || "Ramburs",
        items: body.items,
        subtotal,
        deliveryFee,
        total,
        paymentStatus: "pending",
        orderStatus: "new",
        createdAt: new Date().toISOString(),
      };

      await db.collection("orders").insertOne(order);
      return json({ orderId: id, orderNumber, order });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("POST error:", err);
    return json({ error: err.message || "Server error" }, 500);
  }
}
