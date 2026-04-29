import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { sendOrderEmails } from "@/lib/email";
import { getAllProducts, getProductById, getDb as getProductDb } from "@/lib/products-server";
import { getSettings, updateSettings } from "@/lib/settings-server";

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

    // Public site settings (sanitized — no admin recipients)
    if (segs[0] === "settings") {
      const s = await getSettings();
      const { emails, ...publicSettings } = s;
      return json({ settings: publicSettings });
    }

    // Admin settings (full)
    if (segs[0] === "admin" && segs[1] === "settings") {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const s = await getSettings();
      return json({ settings: s });
    }

    // Public products endpoint
    if (segs[0] === "products") {
      if (segs[1]) {
        const product = await getProductById(segs[1]);
        if (!product) return json({ error: "Product not found" }, 404);
        return json({ product });
      }
      const products = await getAllProducts({ activeOnly: true });
      return json({ products });
    }

    // Admin products endpoint
    if (segs[0] === "admin" && segs[1] === "products") {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      if (segs[2]) {
        const product = await getProductById(segs[2]);
        if (!product) return json({ error: "Product not found" }, 404);
        return json({ product });
      }
      const products = await getAllProducts({ activeOnly: false });
      return json({ products });
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

      // Validate stock + active for each item against current DB state
      const dbProducts = await getAllProducts({ activeOnly: false });
      const productMap = new Map(dbProducts.map((p) => [p.id, p]));
      const stockErrors = [];
      for (const item of body.items) {
        const p = productMap.get(item.id);
        if (!p) {
          stockErrors.push(`${item.name || item.id}: produs inexistent`);
          continue;
        }
        if (!p.active) {
          stockErrors.push(`${p.name}: indisponibil momentan`);
          continue;
        }
        const qty = Number(item.quantity || 0);
        if (qty <= 0) {
          stockErrors.push(`${p.name}: cantitate invalidă`);
          continue;
        }
        if (Number(p.stock || 0) < qty) {
          stockErrors.push(`${p.name}: stoc insuficient (disponibil: ${p.stock || 0})`);
        }
      }
      if (stockErrors.length > 0) {
        return json({ error: stockErrors.join("; "), stockErrors }, 409);
      }

      const db = await getDb();
      const id = uuidv4();
      const subtotal = body.items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0);

      // Dynamic delivery fee from settings
      const settings = await getSettings();
      const isLocal = body.deliveryMethod === "Livrare locală";
      let deliveryFee = 0;
      if (isLocal && settings.delivery?.enabled) {
        deliveryFee = Number(settings.delivery.fee || 0);
        const freeAbove = Number(settings.delivery.freeAbove || 0);
        if (freeAbove > 0 && subtotal >= freeAbove) deliveryFee = 0;
      }
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

      // Decrement stock atomically per product (best-effort)
      try {
        const productsCol = db.collection("products");
        await Promise.all(
          body.items.map((item) =>
            productsCol.updateOne(
              { id: item.id, stock: { $gte: Number(item.quantity) } },
              { $inc: { stock: -Number(item.quantity) } }
            )
          )
        );
      } catch (e) {
        console.error("[orders] stock decrement error:", e?.message);
      }

      // Send email notifications (non-blocking - never fail the order)
      sendOrderEmails(order).catch((e) =>
        console.error("[orders] sendOrderEmails error:", e?.message)
      );

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

    // Admin: Create product
    if (segs[0] === "admin" && segs[1] === "products") {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const required = ["name", "category", "price", "unit"];
      for (const k of required) {
        if (body[k] === undefined || body[k] === null || body[k] === "") {
          return json({ error: `Missing field: ${k}` }, 400);
        }
      }
      const db = await getProductDb();
      const slug = (body.id || body.name)
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      let id = slug;
      let suffix = 1;
      while (await db.collection("products").findOne({ id })) {
        id = `${slug}-${++suffix}`;
      }
      const lastSorted = await db
        .collection("products")
        .find({})
        .sort({ sortOrder: -1 })
        .limit(1)
        .toArray();
      const nextOrder = (lastSorted[0]?.sortOrder || 0) + 1;
      const product = {
        id,
        name: body.name,
        category: body.category,
        description: body.description || "",
        price: Number(body.price),
        unit: body.unit,
        stock: Number(body.stock || 0),
        minOrder: Number(body.minOrder || 1),
        featured: Boolean(body.featured),
        season: body.season || "Tot anul",
        image: body.image || (Array.isArray(body.images) ? body.images[0] : "") || "",
        images: Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []),
        active: body.active !== false,
        sortOrder: nextOrder,
        createdAt: new Date().toISOString(),
      };
      await db.collection("products").insertOne(product);
      const { _id, ...rest } = product;
      return json({ product: rest });
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

    // Admin: Update product
    if (segs[0] === "admin" && segs[1] === "products" && segs[2]) {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const db = await getProductDb();
      const allowed = [
        "name", "category", "description", "price", "unit",
        "stock", "minOrder", "featured", "season", "image", "images", "active", "sortOrder",
      ];
      const update = {};
      for (const k of allowed) {
        if (body[k] !== undefined) {
          if (["price", "stock", "minOrder", "sortOrder"].includes(k)) {
            update[k] = Number(body[k]);
          } else if (["featured", "active"].includes(k)) {
            update[k] = Boolean(body[k]);
          } else if (k === "images") {
            update[k] = Array.isArray(body[k]) ? body[k].filter(Boolean) : [];
          } else {
            update[k] = body[k];
          }
        }
      }
      // Keep main image in sync with images[0] if images updated and image not explicitly set
      if (update.images && body.image === undefined && update.images.length > 0) {
        update.image = update.images[0];
      }
      if (Object.keys(update).length === 0) {
        return json({ error: "No fields to update" }, 400);
      }
      update.updatedAt = new Date().toISOString();
      const result = await db
        .collection("products")
        .findOneAndUpdate(
          { id: segs[2] },
          { $set: update },
          { returnDocument: "after" }
        );
      const doc = result?.value || result;
      if (!doc) return json({ error: "Product not found" }, 404);
      const { _id, ...rest } = doc;
      return json({ product: rest });
    }

    // Admin: Update site settings
    if (segs[0] === "admin" && segs[1] === "settings") {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      try {
        const next = await updateSettings(body || {});
        return json({ settings: next });
      } catch (e) {
        return json({ error: e.message || "Could not update settings" }, 500);
      }
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("PATCH error:", err);
    return json({ error: err.message || "Server error" }, 500);
  }
}

export async function PUT(request, { params }) {
  // Alias for PATCH on settings (some clients prefer PUT for full replace)
  try {
    const segs = getPath(await params);
    const body = await request.json().catch(() => ({}));
    if (segs[0] === "admin" && segs[1] === "settings") {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const next = await updateSettings(body || {});
      return json({ settings: next });
    }
    return json({ error: "Not found" }, 404);
  } catch (err) {
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
    if (segs[0] === "admin" && segs[1] === "products" && segs[2]) {
      if (!checkAdmin(request)) return json({ error: "Unauthorized" }, 401);
      const db = await getProductDb();
      const result = await db.collection("products").deleteOne({ id: segs[2] });
      if (result.deletedCount === 0) return json({ error: "Product not found" }, 404);
      return json({ ok: true });
    }
    return json({ error: "Not found" }, 404);
  } catch (err) {
    return json({ error: err.message || "Server error" }, 500);
  }
}
