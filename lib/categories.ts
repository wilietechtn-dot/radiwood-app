
export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export const CATEGORY_STORAGE_KEY =
  "radiwood_admin_categories";

export const defaultCategories: Category[] = [
  {
    id: "plateaux",
    name: "Plateaux",
    description: "Plateaux artisanaux en bois d'olivier",
    image: "/images/plateau.jpg",
  },
  {
    id: "miroirs",
    name: "Miroirs",
    description: "Miroirs au contour naturel",
    image: "/images/miroir.jpg",
  },
  {
    id: "art-table",
    name: "Art de la table",
    description: "Service et convivialité",
    image: "/images/table.jpg",
  },
  {
    id: "decoration",
    name: "Décoration",
    description: "Objets décoratifs uniques",
    image: "/images/decoration.jpg",
  },
  {
    id: "sur-mesure",
    name: "Sur mesure",
    description: "Créations personnalisées",
    image: "/images/table.jpg",
  },
];

export function getCategories(): Category[] {
  if (typeof window === "undefined") {
    return defaultCategories;
  }

  try {
    const saved = localStorage.getItem(
      CATEGORY_STORAGE_KEY
    );

    if (saved === null) {
      return defaultCategories;
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultCategories;
    }

    return parsed.filter(
      (item): item is Category =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.description === "string" &&
        typeof item.image === "string"
    );
  } catch {
    return defaultCategories;
  }
}

export function saveCategories(
  categories: Category[]
): void {
  localStorage.setItem(
    CATEGORY_STORAGE_KEY,
    JSON.stringify(categories)
  );

  window.dispatchEvent(
    new Event("radiwood-categories-updated")
  );
}
