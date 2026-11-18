import { NextRequest, NextResponse } from "next/server";
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
} from "@/lib/orders";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
  }
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates: Partial<Order> = {};

    if (
      typeof body.customerName === "string" &&
      body.customerName.trim().length >= 2
    ) {
      updates.customerName = body.customerName.trim().slice(0, 120);
    }

    if (typeof body.phone === "string") {
      updates.phone = body.phone.trim().slice(0, 40);
    }

    if (typeof body.address === "string") {
      updates.address = body.address.trim().slice(0, 300);
    }

    if (Array.isArray(body.items) && body.items.length > 0) {
      const validItems: OrderItem[] = body.items
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

      if (validItems.length > 0) {
        updates.items = validItems;
      }
    }

    if (ORDER_STATUSES.includes(body.status as OrderStatus)) {
      updates.status = body.status as OrderStatus;
    }

    if (body.paymentStatus === "Payé" || body.paymentStatus === "Non payé") {
      updates.paymentStatus = body.paymentStatus;
    }

    if (ORDER_SOURCES.includes(body.source as OrderSource)) {
      updates.source = body.source as OrderSource;
    }

    if (typeof body.notes === "string") {
      updates.notes = body.notes.trim().slice(0, 2000);
    }

    if (
      typeof body.deliveryFee === "number" &&
      Number.isFinite(body.deliveryFee) &&
      body.deliveryFee >= 0
    ) {
      updates.deliveryFee = body.deliveryFee;
    }

    const db = await getDatabase();
    const updated = await db
      .collection<Order>("orders")
      .findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: "after", projection: { _id: 0 } }
      );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("RadiWood PATCH order:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de mise à jour." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
  }
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  const { id } = await context.params;

  try {
    const db = await getDatabase();
    const res = await db.collection<Order>("orders").deleteOne({ id });

    if (res.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RadiWood DELETE order:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de suppression." },
      { status: 500 }
    );
  }
}