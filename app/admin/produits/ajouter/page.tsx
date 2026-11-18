"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type DragEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  CloudUpload,
  Italic,
  Leaf,
  Link2,
  List,
  ListOrdered,
  Plus,
  Save,
  Underline,
  X,
} from "lucide-react";

import type { ProductStatus } from "@/lib/products";
import type { Category } from "@/lib/categories";

/* ==========================================
   TYPES
========================================== */

type ProductForm = {
  name: string;
  category: string;
  price: string;
  description: string;
  dimensions: string;
  materials: string;
  status: ProductStatus;
};

/* ==========================================
   CONFIGURATION
========================================== */

const INITIAL_FORM: ProductForm = {
  name: "",
  category: "",
  price: "",
  description: "",
  dimensions: "",
  materials: "",
  status: "Publié",
};

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const inputClass =
  "w-full rounded-lg border border-[#DDD9D1] bg-white px-4 py-3 text-sm text-[#29271F] outline-none transition focus:border-[#405033] focus:ring-2 focus:ring-[#405033]/10";

const labelClass = "mb-2 block text-[13px] font-semibold text-[#29271F]";

/* ==========================================
   COMPRESSION DES IMAGES
========================================== */

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Impossible de lire le fichier."));
    };

    reader.onload = () => {
      const image = new window.Image();

      image.onerror = () => {
        reject(new Error("Image invalide."));
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 900;

        const ratio = Math.min(
          1,
          maxDimension / Math.max(image.width, image.height)
        );

        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Impossible de compresser l'image."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL("image/jpeg", 0.65);
        resolve(compressed);
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

/* ==========================================
   PAGE AJOUTER PRODUIT
========================================== */

export default function AjouterProduitPage() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const descriptionInput = useRef<HTMLTextAreaElement>(null);

  /* ========================================
     STATES
  ======================================== */

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const [images, setImages] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ========================================
     CHARGER LES CATÉGORIES DEPUIS MONGODB
  ======================================== */

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = (await res.json()) as {
          success?: boolean;
          categories?: Category[];
        };

        if (active && data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
      } finally {
        if (active) {
          setCategoriesLoaded(true);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const availableCategories = categories.map((category) => category.name);

  /* ========================================
     MODIFIER LES CHAMPS
  ======================================== */

  function updateField(field: keyof ProductForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  /* ========================================
     GESTION DES IMAGES
  ======================================== */

  async function addImages(files: FileList | File[]) {
    const list = Array.from(files);

    if (list.length === 0) return;

    if (images.length + list.length > MAX_IMAGES) {
      setError("Vous pouvez ajouter 4 images maximum.");
      return;
    }

    const invalidFile = list.find(
      (file) => !ACCEPTED_IMAGE_TYPES.includes(file.type)
    );

    if (invalidFile) {
      setError("Formats autorisés : JPG, PNG et WebP.");
      return;
    }

    const tooLargeFile = list.find((file) => file.size > MAX_IMAGE_SIZE);

    if (tooLargeFile) {
      setError("Chaque image doit faire moins de 5 Mo.");
      return;
    }

    setLoadingImages(true);
    setError("");

    try {
      const compressedImages = await Promise.all(list.map(compressImage));

      setImages((previous) => [...previous, ...compressedImages]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les images."
      );
    } finally {
      setLoadingImages(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void addImages(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void addImages(event.dataTransfer.files);
  }

  function removeImage(index: number) {
    setImages((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  /* ========================================
     ÉDITEUR DESCRIPTION
  ======================================== */

  function formatText(before: string, after = before) {
    const textarea = descriptionInput.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.description.substring(start, end);

    const result =
      form.description.substring(0, start) +
      before +
      selectedText +
      after +
      form.description.substring(end);

    updateField("description", result);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    });
  }

  const toolbar = [
    { title: "Gras", icon: Bold, action: () => formatText("**") },
    { title: "Italique", icon: Italic, action: () => formatText("*") },
    {
      title: "Souligné",
      icon: Underline,
      action: () => formatText("<u>", "</u>"),
    },
    { title: "Liste", icon: List, action: () => formatText("- ", "") },
    {
      title: "Liste numérotée",
      icon: ListOrdered,
      action: () => formatText("1. ", ""),
    },
    {
      title: "Lien",
      icon: Link2,
      action: () => formatText("[", "](https://)"),
    },
  ];

  /* ========================================
     ENREGISTRER LE PRODUIT DANS MONGODB
  ======================================== */

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Veuillez saisir un nom de produit valide.");
      return;
    }

    if (!availableCategories.includes(form.category)) {
      setError("Veuillez sélectionner une catégorie valide.");
      return;
    }

    const price = Number(form.price);

    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setError("Veuillez saisir un prix valide.");
      return;
    }

    if (form.description.trim().length === 0) {
      setError("La description du produit est obligatoire.");
      return;
    }

    if (images.length === 0) {
      setError("Veuillez ajouter au moins une image.");
      return;
    }

    if (loadingImages) {
      setError("Veuillez attendre la fin du chargement des images.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          price,
          description: form.description.trim(),
          image: images[0],
          images,
          dimensions: form.dimensions.trim(),
          materials: form.materials.trim(),
          status: form.status,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Impossible d'enregistrer le produit."
        );
      }

      router.push("/admin/produits");
      router.refresh();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement :", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le produit dans la base de données."
      );

      setSaving(false);
    }
  }

  /* ========================================
     INTERFACE
  ======================================== */

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#F7F2E8] px-5 py-8 md:px-9">
      <form onSubmit={handleSave} className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 font-serif text-4xl font-semibold text-[#29271F] md:text-[43px]">
              Ajouter un produit
            </h1>

            <p className="text-sm text-[#817B70]">
              Remplissez les informations de votre création.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/produits")}
              className="flex items-center gap-2 rounded-xl border border-[#DED8CF] bg-white px-6 py-3.5 text-sm font-semibold transition hover:bg-[#F1EBE1]"
            >
              <ArrowLeft size={17} />
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving || loadingImages || !categoriesLoaded}
              className="flex items-center gap-2 rounded-xl bg-[#405033] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#536746] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_1.05fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-6 rounded-2xl border border-[#EBE5DB] bg-[#FFFCF8] p-6 shadow-sm sm:p-7">
            {/* PRODUCT NAME */}
            <div>
              <label htmlFor="product-name" className={labelClass}>
                Nom du produit
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="product-name"
                required
                minLength={2}
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ex : Plateau en bois d'olivier et résine"
                className={inputClass}
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label htmlFor="product-category" className={labelClass}>
                Catégorie
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="product-category"
                  required
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">
                    {categoriesLoaded
                      ? "Sélectionner une catégorie"
                      : "Chargement des catégories..."}
                  </option>

                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>

              {categoriesLoaded && availableCategories.length === 0 && (
                <p className="mt-2 text-xs text-orange-700">
                  Aucune catégorie disponible. Créez d&apos;abord une catégorie
                  dans l&apos;administration.
                </p>
              )}
            </div>

            {/* PRICE */}
            <div>
              <label htmlFor="product-price" className={labelClass}>
                Prix (TND)
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="product-price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label htmlFor="product-description" className={labelClass}>
                Description
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="overflow-hidden rounded-xl border border-[#DDD9D1] bg-white focus-within:border-[#405033]">
                <div className="flex flex-wrap gap-1 border-b border-[#E7E2DA] bg-[#FAF9F6] p-2">
                  {toolbar.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.title}
                        type="button"
                        title={item.title}
                        aria-label={item.title}
                        onClick={item.action}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#514B40] transition hover:bg-[#EBE7DF]"
                      >
                        <Icon size={18} />
                      </button>
                    );
                  })}
                </div>

                <textarea
                  ref={descriptionInput}
                  id="product-description"
                  required
                  rows={8}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Décrivez votre produit..."
                  className="min-h-[190px] w-full resize-y px-4 py-4 text-sm leading-7 outline-none"
                />
              </div>

              <p className="mt-2 text-[11px] text-[#817B70]">
                Les boutons ajoutent des marques de formatage dans le texte.
              </p>
            </div>

            {/* STATUS */}
            <div>
              <label htmlFor="product-status" className={labelClass}>
                Statut
              </label>

              <div className="relative">
                <select
                  id="product-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="Publié">Publié</option>
                  <option value="Brouillon">Brouillon</option>
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
            {/* PRODUCT IMAGES */}
            <section className="rounded-2xl border border-[#EBE5DB] bg-[#FFFCF8] p-6 shadow-sm sm:p-7">
              <h2 className="mb-5 text-[15px] font-semibold">
                Images du produit
                <span className="ml-1 text-red-500">*</span>
              </h2>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
                aria-label="Images du produit"
              />

              {/* DROPZONE */}
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={
                  "rounded-xl border-2 border-dashed transition " +
                  (dragging
                    ? "border-[#405033] bg-[#E8F0E3]"
                    : "border-[#D7D7D1] bg-[#FCFBF8]")
                }
              >
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex min-h-[215px] w-full flex-col items-center justify-center px-5 py-7 text-center"
                >
                  <CloudUpload
                    size={45}
                    strokeWidth={1.6}
                    className="mb-4 text-[#35372F]"
                  />

                  <span className="text-sm font-semibold">
                    {loadingImages
                      ? "Chargement des images..."
                      : "Cliquez pour ajouter des images"}
                  </span>

                  <span className="mt-2 text-xs text-[#8A847A]">
                    ou glissez-déposez
                  </span>

                  <span className="mt-2 text-xs text-[#8A847A]">
                    JPG, PNG, WebP — Max 5 Mo
                  </span>

                  <span className="mt-2 text-[11px] text-[#8A847A]">
                    4 images maximum
                  </span>
                </button>
              </div>

              {/* IMAGE PREVIEWS */}
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-xl border border-[#E3DFD5] bg-[#EDE7DD]"
                  >
                    <img
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 rounded-md bg-[#405033] px-2 py-1 text-[10px] text-white">
                        Principale
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Supprimer image ${index + 1}`}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    aria-label="Ajouter une image"
                    className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[#D7D7D1] bg-[#F7F7F3] text-[#405033] transition hover:bg-[#EDF2E8]"
                  >
                    <Plus size={30} />
                  </button>
                )}
              </div>

              <p className="mt-4 flex items-center gap-2 text-xs text-[#817B70]">
                <Leaf size={15} />
                La première image sera la photo principale.
              </p>
            </section>

            {/* INFORMATIONS SUPPLÉMENTAIRES */}
            <section className="rounded-2xl border border-[#EBE5DB] bg-[#FFFCF8] p-6 shadow-sm sm:p-7">
              <h2 className="mb-6 text-[15px] font-semibold">
                Informations supplémentaires
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-dimensions" className={labelClass}>
                    Dimensions
                  </label>

                  <input
                    id="product-dimensions"
                    type="text"
                    value={form.dimensions}
                    onChange={(event) =>
                      updateField("dimensions", event.target.value)
                    }
                    placeholder="Ex : 40 x 30 cm"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="product-materials" className={labelClass}>
                    Matériaux
                  </label>

                  <input
                    id="product-materials"
                    type="text"
                    value={form.materials}
                    onChange={(event) =>
                      updateField("materials", event.target.value)
                    }
                    placeholder="Ex : Bois d'olivier, résine époxy"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/produits")}
            className="rounded-xl border border-[#DED8CF] bg-white px-7 py-3 text-sm font-semibold transition hover:bg-[#F1EBE1]"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={saving || loadingImages || !categoriesLoaded}
            className="flex items-center gap-2 rounded-xl bg-[#405033] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#536746] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={18} />

            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}