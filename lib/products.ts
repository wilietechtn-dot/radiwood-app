
export type ProductStatus = "Publié" | "Brouillon";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  dimensions: string;
  materials: string;
  status: ProductStatus;
  createdAt: string;
};

export type ProductInput = Omit<
  Product,
  "id" | "createdAt"
>;

export const STORAGE_KEY = "radiwood_admin_products";

export const CATEGORIES = [
  "Plateaux",
  "Miroirs",
  "Art de la table",
  "Décoration",
  "Sur mesure",
];

export const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Plateau en bois d'olivier et résine",
    category: "Plateaux",
    price: 450,
    description:
      "Plateau artisanal en bois d'olivier et résine.",
    image: "/images/plateau.jpg",
    images: ["/images/plateau.jpg"],
    dimensions: "40 x 30 cm",
    materials: "Bois d'olivier, résine époxy",
    status: "Publié",
    createdAt: "2026-10-01",
  },
  {
    id: "2",
    name: "Miroir naturel",
    category: "Miroirs",
    price: 680,
    description:
      "Miroir avec cadre artisanal en bois d'olivier.",
    image: "/images/miroir.jpg",
    images: ["/images/miroir.jpg"],
    dimensions: "80 x 60 cm",
    materials: "Bois d'olivier, miroir",
    status: "Publié",
    createdAt: "2026-10-02",
  },
  {
    id: "3",
    name: "Planche de service",
    category: "Art de la table",
    price: 320,
    description:
      "Planche de service aux veinures naturelles.",
    image: "/images/table.jpg",
    images: ["/images/table.jpg"],
    dimensions: "45 x 25 cm",
    materials: "Bois d'olivier",
    status: "Publié",
    createdAt: "2026-10-03",
  },
  {
    id: "4",
    name: "Décoration murale",
    category: "Décoration",
    price: 280,
    description:
      "Objet décoratif en bois d'olivier.",
    image: "/images/decoration.jpg",
    images: ["/images/decoration.jpg"],
    dimensions: "30 x 30 cm",
    materials: "Bois d'olivier",
    status: "Brouillon",
    createdAt: "2026-10-04",
  },
  {
    id: "5",
    name: "Table d'appoint",
    category: "Sur mesure",
    price: 750,
    description:
      "Table artisanale personnalisable.",
    image: "/images/table.jpg",
    images: ["/images/table.jpg"],
    dimensions: "60 x 45 cm",
    materials: "Bois d'olivier",
    status: "Publié",
    createdAt: "2026-10-05",
  },
  {
    id: "6",
    name: "Plateau rond",
    category: "Plateaux",
    price: 390,
    description:
      "Plateau rond élégant en bois naturel.",
    image: "/images/plateau.jpg",
    images: ["/images/plateau.jpg"],
    dimensions: "Diamètre 35 cm",
    materials: "Bois d'olivier",
    status: "Publié",
    createdAt: "2026-10-06",
  },
];

export function getProducts(): Product[] {
  if (typeof window === "undefined") {
    return defaultProducts;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      return defaultProducts;
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultProducts;
    }

    return parsed.filter(
      (item): item is Product =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number"
    );
  } catch {
    return defaultProducts;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(products)
  );

  window.dispatchEvent(new Event("radiwood-products-updated"));
}

export function addProduct(input: ProductInput): Product {
  const product: Product = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  saveProducts([product, ...getProducts()]);

  return product;
}

export function updateProduct(
  id: string,
  changes: Partial<ProductInput>
): void {
  const updated = getProducts().map((product) =>
    product.id === id
      ? { ...product, ...changes }
      : product
  );

  saveProducts(updated);
}

export function deleteProducts(ids: string[]): void {
  saveProducts(
    getProducts().filter(
      (product) => !ids.includes(product.id)
    )
  );
}
