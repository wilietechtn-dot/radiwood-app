import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/api-helpers";
import {
  ORDER_SOURCES,
  ORDER_STATUSES,
  type Order,
  type OrderItem,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/orders";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  try {
    const db = await getDatabase();
    const orders = await db
      .collection<Order>("orders")
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(300)
      .toArray();

    return NextResponse.json({ success: true, orders }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("RadiWood GET orders:", error);
    return NextResponse.json({ success: false, error: "Erreur de chargement." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const isAdmin = await isAdminAuthenticated();

    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (customerName.length < 2 || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ success: false, error: "Informations de commande incomplètes." }, { status: 400 });
    }

    const items: OrderItem[] = body.items
      .filter(
        (item): item is OrderItem =>
          item !== null &&
          typeof item === "object" &&
          typeof item.productName === "string" &&
          item.productName.trim().length > 0 &&
          typeof item.quantity === "number" &&
          item.quantity > 0 &&
          typeof item.unitPrice === "number" &&
          item.unitPrice >= 0
      )
      .map((item) => ({
        productName: item.productName.trim().slice(0, 150),
        quantity: Math.floor(item.quantity),
        unitPrice: item.unitPrice,
      }));

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Articles invalides." }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection<Order>("orders");

    // Générer la référence séquentielle RW-XXXX
    const lastOrder = await collection.find({}, { projection: { reference: 1 } }).sort({ createdAt: -1 }).limit(1).toArray();
    const lastNum = lastOrder[0]?.reference ? Number(lastOrder[0].reference.replace("RW-", "")) : 1000;
    const nextNum = Number.isFinite(lastNum) && lastNum >= 1000 ? lastNum + 1 : 1001;

    const status: OrderStatus =
      isAdmin && ORDER_STATUSES.includes(body.status as OrderStatus)
        ? (body.status as OrderStatus)
        : "En attente";

    const paymentStatus: PaymentStatus =
      isAdmin && body.paymentStatus === "Payé" ? "Payé" : "Non payé";

    const source: OrderSource =
      isAdmin && ORDER_SOURCES.includes(body.source as OrderSource)
        ? (body.source as OrderSource)
        : "Site web";

    const deliveryFee =
      typeof body.deliveryFee === "number" && body.deliveryFee >= 0 ? body.deliveryFee : 0;

    const newOrder: Order = {
      id: randomUUID(),
      reference: `RW-${nextNum}`,
      customerName: customerName.slice(0, 120),
      phone: phone.slice(0, 40),
      address: address.slice(0, 300),
      items,
      deliveryFee,
      status,
      paymentStatus,
      source,
      notes: notes.slice(0, 2000),
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne({ ...newOrder });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error("RadiWood POST order:", error);
    return NextResponse.json({ success: false, error: "Impossible d'enregistrer la commande." }, { status: 500 });
  }
}