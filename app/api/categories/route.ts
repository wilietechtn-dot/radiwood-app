import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";
import { isValidImagePath, verifySameOrigin } from "@/lib/api-helpers";
import { defaultCategories, type Category } from "@/lib/categories";

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection<Category>("categories");
    let categories: Category[] = await collection
      .find({}, { projection: { _id: 0 } })
      .toArray();

    // Initialiser les catégories par défaut au premier démarrage si la collection est vide
    if (categories.length === 0) {
      await collection.insertMany(defaultCategories.map((c) => ({ ...c })));
      categories = defaultCategories;
    }

    return NextResponse.json(
      { success: true, categories },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("RadiWood GET categories:", error);
    return NextResponse.json({ success: true, categories: defaultCategories });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Non autorisé." },
      { status: 401 }
    );
  }
  const originError = verifySameOrigin(request);
  if (originError) return originError;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const image =
      typeof body.image === "string" ? body.image.trim() : "/images/plateau.jpg";

    if (name.length < 2 || name.length > 100 || !isValidImagePath(image)) {
      return NextResponse.json(
        { success: false, error: "Données de catégorie invalides." },
        { status: 400 }
      );
    }

    const category: Category = {
      id: randomUUID(),
      name,
      description: description.slice(0, 500),
      image,
    };

    const db = await getDatabase();
    await db.collection<Category>("categories").insertOne({ ...category });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("RadiWood POST category:", error);
    return NextResponse.json(
      { success: false, error: "Impossible de créer la catégorie." },
      { status: 500 }
    );
  }
}