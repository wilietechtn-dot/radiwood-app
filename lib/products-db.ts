
export type ProductStatus = "Publié" | "Brouillon";

export type ProductDB = {
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
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductInput = {
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  dimensions?: string;
  materials?: string;
  status: ProductStatus;
};
