"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  Check,
  ImagePlus,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { Category } from "@/lib/categories";
import type { ProductDB } from "@/lib/products-db";

/* ==========================================
   TYPES
========================================== */

type CategoryForm = {
  name: string;
  description: string;
  image: string;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  description: "",
  image: "",
};

const inputClass =
  "w-full rounded-xl border border-[#DDD9D0] bg-white px-4 py-3 text-sm text-[#29271F] outline-none transition focus:border-[#405033] focus:ring-2 focus:ring-[#405033]/10";

/* ==========================================
   COMPRESSION IMAGE
========================================== */

async function processImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Format non autorisé. Utilisez JPG, PNG ou WebP.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("L'image ne doit pas dépasser 5 Mo.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Lecture de l'image impossible."));

    reader.onload = () => {
      const image = new window.Image();

      image.onerror = () => reject(new Error("Image invalide."));

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(
          1,
          700 / Math.max(image.width, image.height)
        );

        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Compression impossible."));
          return;
        }

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

/* ==========================================
   PAGE CATEGORIES
========================================== */

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductDB[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  /* ========================================
     CHARGEMENT DEPUIS MONGODB
  ======================================== */

  const refresh = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
      ]);

      const catData = (await catRes.json()) as {
        success?: boolean;
        categories?: Category[];
      };
      const prodData = (await prodRes.json()) as {
        success?: boolean;
        products?: ProductDB[];
      };

      if (catData.success && Array.isArray(catData.categories)) {
        setCategories(catData.categories);
      }

      if (prodData.success && Array.isArray(prodData.products)) {
        setProducts(prodData.products);
      }
    } catch (err) {
      console.error("Erreur chargement catégories:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ========================================
     FILTRAGE
  ======================================== */

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const value = search.trim().toLowerCase();

      return (
        category.name.toLowerCase().includes(value) ||
        category.description.toLowerCase().includes(value)
      );
    });
  }, [categories, search]);

  /* ========================================
     COMPTER LES PRODUITS
  ======================================== */

  function countProducts(categoryName: string) {
    return products.filter(
      (product) =>
        product.category.toLowerCase() === categoryName.toLowerCase()
    ).length;
  }

  /* ========================================
     FORMULAIRE
  ======================================== */

  function updateField(field: keyof CategoryForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function openAdd() {
    setForm({
      ...EMPTY_FORM,
      image: "/images/plateau.jpg",
    });

    setEditingId(null);
    setError("");
    setOpenMenu(null);
    setModal("add");
  }

  function openEdit(category: Category) {
    setForm({
      name: category.name,
      description: category.description,
      image: category.image,
    });

    setEditingId(category.id);
    setError("");
    setOpenMenu(null);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setError("");
    setUploading(false);
  }

  /* ========================================
     IMPORT IMAGE
  ======================================== */

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const result = await processImage(file);
      updateField("image", result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de charger l'image."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  /* ========================================
     ENREGISTRER UNE CATÉGORIE (MONGODB)
  ======================================== */

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (name.length < 2) {
      setError("Saisissez un nom de catégorie valide.");
      return;
    }

    const duplicate = categories.some(
      (item) =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingId
    );

    if (duplicate) {
      setError("Cette catégorie existe déjà.");
      return;
    }

    if (!form.image.trim()) {
      setError("Ajoutez une image pour la catégorie.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (modal === "edit" && editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            image: form.image,
          }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
        };

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de la modification.");
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            image: form.image,
          }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
        };

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Erreur lors de l'ajout.");
        }
      }

      await refresh();
      closeModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Enregistrement impossible dans la base de données."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ========================================
     SUPPRIMER UNE CATÉGORIE (MONGODB)
  ======================================== */

  async function removeCategory(category: Category) {
    setOpenMenu(null);

    const count = countProducts(category.name);

    if (count > 0) {
      window.alert(
        `Impossible de supprimer "${category.name}". ` +
          `${count} produit(s) utilisent cette catégorie. ` +
          "Réaffectez d'abord ces produits."
      );
      return;
    }

    const confirmed = window.confirm(
      `Supprimer la catégorie "${category.name}" ?`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        window.alert(data.error || "Impossible de supprimer cette catégorie.");
        return;
      }

      await refresh();
    } catch {
      window.alert("Erreur réseau lors de la suppression.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#F7F2E8] px-5 py-8 md:px-9">
      <div className="mx-auto max-w-[1300px]">
        {/* EN-TÊTE */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-3 font-serif text-4xl font-semibold text-[#29271F] md:text-[44px]">
              Catégories
            </h1>

            <p className="text-sm text-[#817B70]">
              Gérez les catégories de vos produits.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-3 self-start rounded-xl border border-[#D5C7A9] bg-[#405033] px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#526442] sm:self-center"
          >
            <Plus size={21} />
            Ajouter une catégorie
          </button>
        </div>

        {/* RECHERCHE */}
        <div className="mb-6 flex h-[49px] max-w-[410px] items-center gap-3 rounded-xl border border-[#E2DDD4] bg-[#FFFCF8] px-4">
          <Search size={19} className="shrink-0 text-[#827D73]" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une catégorie..."
            aria-label="Rechercher une catégorie"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>

        {/* LISTE DES CATÉGORIES */}
        <div className="space-y-4">
          {loaded &&
            filteredCategories.map((category) => {
              const count = countProducts(category.name);

              return (
                <article
                  key={category.id}
                  className="relative flex min-h-[132px] items-center gap-5 rounded-2xl border border-[#EFE8DC] bg-[#FFFCF8] p-3 shadow-sm transition duration-300 hover:shadow-md sm:gap-7"
                >
                  {/* IMAGE */}
                  <div className="h-[104px] w-[115px] shrink-0 overflow-hidden rounded-xl bg-[#E9DFD1] sm:h-[125px] sm:w-[170px]">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>

                  {/* INFORMATIONS */}
                  <div className="min-w-0 flex-1 py-2">
                    <h2 className="mb-2 font-serif text-xl font-semibold text-[#29271F] sm:text-[23px]">
                      {category.name}
                    </h2>

                    <p className="mb-2 text-sm text-[#817B70]">
                      {count} produit{count !== 1 ? "s" : ""}
                    </p>

                    <p className="text-xs leading-5 text-[#8C867C] sm:text-sm">
                      {category.description}
                    </p>
                  </div>

                  {/* MENU ACTIONS */}
                  <div className="relative self-start pt-2">
                    <button
                      type="button"
                      aria-label={`Actions pour ${category.name}`}
                      aria-expanded={openMenu === category.id}
                      onClick={() =>
                        setOpenMenu(
                          openMenu === category.id ? null : category.id
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-[#49463D] transition hover:bg-[#F0EAE0]"
                    >
                      <MoreVertical size={21} />
                    </button>

                    {openMenu === category.id && (
                      <div className="absolute right-0 top-12 z-30 w-[185px] overflow-hidden rounded-xl border border-[#E8E0D4] bg-white p-1.5 shadow-xl">
                        <button
                          type="button"
                          onClick={() => openEdit(category)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-[#F2EFE7]"
                        >
                          <Pencil size={17} />
                          Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}

          {/* LISTE VIDE */}
          {loaded && filteredCategories.length === 0 && (
            <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-[#E9E2D8] bg-[#FFFCF8] p-8 text-center">
              <Package size={42} className="mb-4 text-[#8E9A7F]" />

              <h2 className="mb-2 font-serif text-2xl">
                Aucune catégorie trouvée
              </h2>

              <p className="mb-5 text-sm text-[#817B70]">
                Ajoutez une nouvelle catégorie ou modifiez votre recherche.
              </p>

              <button
                type="button"
                onClick={openAdd}
                className="rounded-full bg-[#405033] px-6 py-3 text-sm font-semibold text-white"
              >
                Ajouter une catégorie
              </button>
            </div>
          )}

          {!loaded && (
            <p className="py-12 text-center text-sm text-[#817B70]">
              Chargement des catégories...
            </p>
          )}
        </div>

        {/* COMPTEUR */}
        <p className="mt-7 text-right text-xs text-[#817B70]">
          {filteredCategories.length} catégorie
          {filteredCategories.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* MODALE AJOUT / MODIFICATION */}
      {modal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="my-auto w-full max-w-[560px] overflow-hidden rounded-2xl bg-[#FFFCF8] shadow-2xl"
          >
            {/* HEADER MODALE */}
            <div className="flex items-center justify-between border-b border-[#E9E2D8] p-6">
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-[0.25em] text-[#71805E]">
                  RADIOWOOD ADMIN
                </p>

                <h2
                  id="category-modal-title"
                  className="font-serif text-[27px] font-semibold"
                >
                  {modal === "add"
                    ? "Ajouter une catégorie"
                    : "Modifier la catégorie"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Fermer"
                onClick={closeModal}
                className="rounded-full bg-[#F1EAE0] p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORMULAIRE */}
            <form
              onSubmit={handleSave}
              className="max-h-[75vh] space-y-5 overflow-y-auto p-6"
            >
              {/* IMAGE */}
              <div>
                <label className="mb-3 block text-sm font-semibold">
                  Image de la catégorie *
                </label>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="relative h-[190px] overflow-hidden rounded-xl border border-[#E4DDD2] bg-[#F1EADF]">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Aperçu de la catégorie"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-[#817B70]">
                      <ImagePlus size={37} />
                      <span className="text-xs">Aucune image</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-[#405033] px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
                  >
                    <ImagePlus size={16} />
                    {uploading ? "Chargement..." : "Changer l'image"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-[#817B70]">
                  JPG, PNG ou WebP — 5 Mo maximum.
                </p>
              </div>

              {/* NOM */}
              <div>
                <label
                  htmlFor="rw-category-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Nom de la catégorie *
                </label>

                <input
                  id="rw-category-name"
                  type="text"
                  required
                  minLength={2}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Ex : Plateaux"
                  className={inputClass}
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label
                  htmlFor="rw-category-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Description
                </label>

                <textarea
                  id="rw-category-description"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Décrivez cette catégorie..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* ERREUR */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  <AlertCircle size={17} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* BOUTONS */}
              <div className="flex justify-end gap-3 border-t border-[#E9E2D8] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#DED8CD] bg-white px-6 py-3 text-sm font-semibold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center gap-2 rounded-xl bg-[#405033] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#526442] disabled:opacity-60"
                >
                  <Check size={18} />

                  {saving
                    ? "Enregistrement..."
                    : modal === "add"
                    ? "Ajouter"
                    : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}