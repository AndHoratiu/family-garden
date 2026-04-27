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
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
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

const checkAdmin = (request) => {
  const auth = request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  return token && token === process.env.ADMIN_PASSWORD;
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
      if (segs[1]) {
        const order = await db.collection("orders").findOne({ id: segs[1] });
        if (!order) return json({ error: "Order not found" }, 404);
        const { _id, ...rest } = order;
        return json({ order: rest });
      }
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

    if (segs[0] === "admin" && segs[1] === "orders") {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const db = await getDb();
      const list = await db
        .collection("orders")
        .find({})
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();
      const orders = list.map(({ _id, ...rest }) => rest);
      const stats = {
        total: orders.length,
        new: orders.filter((o) => o.orderStatus === "new").length,
        confirmed: orders.filter((o) => o.orderStatus === "confirmed").length,
        delivered: orders.filter((o) => o.orderStatus === "delivered").length,
        cancelled: orders.filter((o) => o.orderStatus === "cancelled").length,
        revenue: orders
          .filter((o) => o.orderStatus === "delivered")
          .reduce((s, o) => s + (o.total || 0), 0),
      };
      return json({ orders, stats });
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

    if (segs[0] === "admin" && segs[1] === "login") {
      const password = body.password || "";
      if (!process.env.ADMIN_PASSWORD) {
        return json({ error: "Admin not configured" }, 500);
      }
      if (password !== process.env.ADMIN_PASSWORD) {
        return json({ error: "Parolă incorectă" }, 401);
      }
      return json({ token: process.env.ADMIN_PASSWORD });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("POST error:", err);
    return json({ error: err.message || "Server error" }, 500);
  }
}

export async function PATCH(request, { params }) {
  try {
    const segs = getPath(await params);
    const body = await request.json().catch(() => ({}));

    if (segs[0] === "admin" && segs[1] === "orders" && segs[2]) {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const db = await getDb();
      const allowed = ["orderStatus", "paymentStatus", "notes"];
      const update = {};
      for (const k of allowed) {
        if (body[k] !== undefined) update[k] = body[k];
      }
      if (Object.keys(update).length === 0) {
        return json({ error: "No fields to update" }, 400);
      }
      update.updatedAt = new Date().toISOString();
      const result = await db
        .collection("orders")
        .findOneAndUpdate(
          { id: segs[2] },
          { $set: update },
          { returnDocument: "after" }
        );
      const doc = result?.value || result;
      if (!doc) return json({ error: "Order not found" }, 404);
      const { _id, ...rest } = doc;
      return json({ order: rest });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("PATCH error:", err);
    return json({ error: err.message || "Server error" }, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const segs = getPath(await params);
    if (segs[0] === "admin" && segs[1] === "orders" && segs[2]) {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const db = await getDb();
      const result = await db.collection("orders").deleteOne({ id: segs[2] });
      if (result.deletedCount === 0) return json({ error: "Order not found" }, 404);
      return json({ ok: true });
    }
    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: err.message || "Server error" }, 500);
  }
}
