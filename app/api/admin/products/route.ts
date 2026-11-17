
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { getDatabase } from "@/lib/mongodb";
import { isAdminAuthenticated } from "@/lib/auth";

import type {
  ProductDB,
  CreateProductInput,
  ProductStatus,
} from "@/lib/products-db";

const COLLECTION = "products";

function isImagePath(value: string): boolean {
  if (
    value.startsWith("/images/") &&
    !value.includes("..") &&
    !value.includes("\\")
  ) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidProduct(
  value: unknown
): value is CreateProductInput {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const product = value as Record<string, unknown>;

  const validStatus =
    product.status === "Publié" ||
    product.status === "Brouillon";

  const validImages =
    Array.isArray(product.images) &&
    product.images.length >= 1 &&
    product.images.length <= 4 &&
    product.images.every(
      (image: unknown) =>
        typeof image === "string" &&
        image.length <= 2048 &&
        isImagePath(image)
    );

  return (
    typeof product.name === "string" &&
    product.name.trim().length >= 2 &&
    product.name.length <= 150 &&

    typeof product.category === "string" &&
    product.category.trim().length >= 2 &&
    product.category.length <= 100 &&

    typeof product.price === "number" &&
    Number.isFinite(product.price) &&
    product.price >= 0 &&
    product.price <= 1000000 &&

    typeof product.description === "string" &&
    product.description.trim().length > 0 &&
    product.description.length <= 10000 &&

    typeof product.image === "string" &&
    isImagePath(product.image) &&

    validImages &&
    validStatus &&

    (
      product.dimensions === undefined ||
      (
        typeof product.dimensions === "string" &&
        product.dimensions.length <= 200
      )
    ) &&

    (
      product.materials === undefined ||
      (
        typeof product.materials === "string" &&
        product.materials.length <= 500
      )
    )
  );
}

/* ==========================================
   GET - PRODUITS PUBLICS
========================================== */

export async function GET() {
  try {
    const db = await getDatabase();

    const products = await db
      .collection<ProductDB>(COLLECTION)
      .find(
        { status: "Publié" },
        { projection: { _id: 0 } }
      )
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("RadiWood GET products:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible de charger les produits.",
      },
      { status: 500 }
    );
  }
}

/* ==========================================
   POST - AJOUTER UN PRODUIT
========================================== */

export async function POST(request: NextRequest) {
  // Vérifier l'authentification côté serveur.
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      {
        success: false,
        error: "Accès non autorisé.",
      },
      { status: 401 }
    );
  }

  // Protection contre les requêtes d'autres origines.
  const origin = request.headers.get("origin");

  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      {
        success: false,
        error: "Origine non autorisée.",
      },
      { status: 403 }
    );
  }

  // Limiter la taille des requêtes JSON.
  const contentLength = Number(
    request.headers.get("content-length") ?? "0"
  );

  if (
    contentLength > 100_000
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Requête trop volumineuse.",
      },
      { status: 413 }
    );
  }

  try {
    const rawBody = await request.text();

    if (Buffer.byteLength(rawBody, "utf8") > 100_000) {
      return NextResponse.json(
        {
          success: false,
          error: "Requête trop volumineuse.",
        },
        { status: 413 }
      );
    }

    const body: unknown = JSON.parse(rawBody);

    if (!isValidProduct(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Informations du produit invalides.",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    const product: ProductDB = {
      id: randomUUID(),
      name: body.name.trim(),
      category: body.category.trim(),
      price: body.price,
      description: body.description.trim(),
      image: body.image,
      images: body.images,
      dimensions: body.dimensions?.trim() ?? "",
      materials: body.materials?.trim() ?? "",
      status: body.status as ProductStatus,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDatabase();

    await db
      .collection<ProductDB>(COLLECTION)
      .insertOne(product);

    return NextResponse.json(
      {
        success: true,
        message: "Produit ajouté avec succès.",
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          image: product.image,
          images: product.images,
          dimensions: product.dimensions,
          materials: product.materials,
          status: product.status,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("RadiWood POST products:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Impossible d'enregistrer le produit.",
      },
      { status: 500 }
    );
  }
}
