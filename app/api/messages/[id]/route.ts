import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { verifySameOrigin } from "@/lib/api-helpers";
import type { CustomerMessage } from "@/lib/messages";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.isRead !== "boolean") {
      return NextResponse.json({ success: false, error: "Paramètre isRead invalide." }, { status: 400 });
    }

    const db = await getDatabase();
    const updated = await db
      .collection<CustomerMessage>("messages")
      .findOneAndUpdate(
        { id },
        { $set: { isRead: body.isRead } },
        { returnDocument: "after", projection: { _id: 0 } }
      );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Message introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    console.error("RadiWood PATCH message:", error);
    return NextResponse.json({ success: false, error: "Erreur de mise à jour." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  const { id } = await context.params;

  try {
    const db = await getDatabase();
    const res = await db.collection<CustomerMessage>("messages").deleteOne({ id });
    if (res.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Message introuvable." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RadiWood DELETE message:", error);
    return NextResponse.json({ success: false, error: "Erreur de suppression." }, { status: 500 });
  }
}