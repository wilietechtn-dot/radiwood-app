import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { isValidImagePath, verifySameOrigin } from "@/lib/api-helpers";
import type { Category } from "@/lib/categories";

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
    const updates: Partial<Category> = {};

    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updates.name = body.name.trim().slice(0, 100);
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim().slice(0, 500);
    }
    if (typeof body.image === "string" && isValidImagePath(body.image)) {
      updates.image = body.image;
    }

    const db = await getDatabase();
    const updated = await db
      .collection<Category>("categories")
      .findOneAndUpdate({ id }, { $set: updates }, { returnDocument: "after", projection: { _id: 0 } });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Catégorie introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("RadiWood PATCH category:", error);
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
    const res = await db.collection<Category>("categories").deleteOne({ id });

    if (res.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Catégorie introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RadiWood DELETE category:", error);
    return NextResponse.json({ success: false, error: "Erreur de suppression." }, { status: 500 });
  }
}