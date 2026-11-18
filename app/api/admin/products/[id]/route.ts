import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { isValidImagePath, verifySameOrigin } from "@/lib/api-helpers";
import type { ProductDB } from "@/lib/products-db";

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
    const updates: Partial<ProductDB> = { updatedAt: new Date() };

    if (typeof body.name === "string" && body.name.trim().length >= 2) {
      updates.name = body.name.trim().slice(0, 150);
    }
    if (typeof body.category === "string" && body.category.trim().length >= 2) {
      updates.category = body.category.trim().slice(0, 100);
    }
    if (typeof body.price === "number" && Number.isFinite(body.price) && body.price >= 0) {
      updates.price = body.price;
    }
    if (typeof body.description === "string" && body.description.trim().length > 0) {
      updates.description = body.description.trim().slice(0, 10000);
    }
    if (typeof body.dimensions === "string") {
      updates.dimensions = body.dimensions.trim().slice(0, 200);
    }
    if (typeof body.materials === "string") {
      updates.materials = body.materials.trim().slice(0, 500);
    }
    if (body.status === "Publié" || body.status === "Brouillon") {
      updates.status = body.status;
    }
    if (typeof body.image === "string" && isValidImagePath(body.image)) {
      updates.image = body.image;
    }
    if (
      Array.isArray(body.images) &&
      body.images.length >= 1 &&
      body.images.every((img) => typeof img === "string" && isValidImagePath(img))
    ) {
      updates.images = body.images;
    }

    const db = await getDatabase();
    const result = await db
      .collection<ProductDB>("products")
      .findOneAndUpdate(
        { id },
        { $set: updates },
        { returnDocument: "after", projection: { _id: 0 } }
      );

    if (!result) {
      return NextResponse.json({ success: false, error: "Produit introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: result });
  } catch (error) {
    console.error("RadiWood PATCH product:", error);
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
    const result = await db.collection<ProductDB>("products").deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Produit introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RadiWood DELETE product:", error);
    return NextResponse.json({ success: false, error: "Erreur de suppression." }, { status: 500 });
  }
}