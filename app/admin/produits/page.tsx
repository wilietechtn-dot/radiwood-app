
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";

import {
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  Trash2,
  X,
  Check,
  Package,
} from "lucide-react";

import {
  type Product,
  type ProductStatus,
  CATEGORIES,
  getProducts,
  saveProducts,
  updateProduct,
  deleteProducts,
} from "@/lib/products";

const PAGE_SIZE = 6;

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [status, setStatus] = useState("Tous");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<"view" | "edit" | null>(
    null
  );
  const [activeProduct, setActiveProduct] =
    useState<Product | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    dimensions: "",
    materials: "",
    status: "Publié" as ProductStatus,
  });

  const refresh = useCallback(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);

    window.addEventListener(
      "radiwood-products-updated",
      refresh
    );

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        "radiwood-products-updated",
        refresh
      );
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesName = product.name
        .toLocaleLowerCase("fr")
        .includes(search.toLocaleLowerCase("fr").trim());

      const matchesCategory =
        category === "Toutes" ||
        product.category === category;

      const matchesStatus =
        status === "Tous" || product.status === status;

      return (
        matchesName &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [products, search, category, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allSelected =
    visible.length > 0 &&
    visible.every((item) => selected.includes(item.id));

  function changeFilter(
    kind: "search" | "category" | "status",
    value: string
  ) {
    setPage(1);
    setSelected([]);

    if (kind === "search") setSearch(value);
    if (kind === "category") setCategory(value);
    if (kind === "status") setStatus(value);
  }

  function toggleSelection(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function toggleAll() {
    const ids = visible.map((item) => item.id);

    if (allSelected) {
      setSelected((previous) =>
        previous.filter((id) => !ids.includes(id))
      );
    } else {
      setSelected((previous) =>
        Array.from(new Set([...previous, ...ids]))
      );
    }
  }

  function openView(product: Product) {
    setActiveProduct(product);
    setModal("view");
  }

  function openEdit(product: Product) {
    setActiveProduct(product);

    setEditForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      description: product.description,
      dimensions: product.dimensions ?? "",
      materials: product.materials ?? "",
      status: product.status,
    });

    setModal("edit");
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeProduct) return;

    const price = Number(editForm.price);

    if (
      editForm.name.trim() === "" ||
      editForm.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return;
    }

    updateProduct(activeProduct.id, {
      name: editForm.name.trim(),
      category: editForm.category,
      price,
      description: editForm.description.trim(),
      dimensions: editForm.dimensions.trim(),
      materials: editForm.materials.trim(),
      status: editForm.status,
    });

    refresh();
    setModal(null);
    setActiveProduct(null);
  }

  function removeOne(product: Product) {
    if (
      !window.confirm(
        `Voulez-vous supprimer "${product.name}" ?`
      )
    ) {
      return;
    }

    deleteProducts([product.id]);
    refresh();
    setSelected((previous) =>
      previous.filter((id) => id !== product.id)
    );
  }

  function removeSelected() {
    if (
      !selected.length ||
      !window.confirm(
        `Supprimer ${selected.length} produit(s) ?`
      )
    ) {
      return;
    }

    deleteProducts(selected);
    setSelected([]);
    refresh();
  }

  function changeSelectedStatus(next: ProductStatus) {
    const ids = new Set(selected);

    const updated = getProducts().map((product) =>
      ids.has(product.id)
        ? { ...product, status: next }
        : product
    );

    saveProducts(updated);
    refresh();
    setSelected([]);
  }

  const inputClass =
    "h-12 w-full rounded-lg border border-[#DED9CF] bg-white px-4 text-sm outline-none focus:border-[#405033]";

  const actionClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-[#E7E2D9] bg-white transition hover:bg-[#F2EFE8]";

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#F7F2E8] px-5 py-8 md:px-9">
      <div className="mx-auto max-w-[1500px]">

        {/* EN-TÊTE */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold text-[#5A5A50]">
              Produits
            </p>

            <h1 className="mb-2 font-serif text-4xl font-semibold md:text-[44px]">
              Tous les produits
            </h1>

            <p className="text-sm text-[#817B70]">
              Gérez vos créations artisanales.
            </p>
          </div>

          <Link
            href="/admin/produits/ajouter"
            className="inline-flex items-center justify-center gap-3 self-start rounded-xl border border-[#DCCFAE] bg-[#405033] px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#526442] md:self-center"
          >
            <Plus size={21} />
            Ajouter un produit
          </Link>
        </div>

        {/* FILTRES */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr_.8fr]">
          <div className="flex h-[54px] items-center gap-3 rounded-xl border border-[#DCD8D0] bg-[#FFFCF8] px-4">
            <Search size={22} className="text-[#858178]" />

            <input
              type="search"
              value={search}
              onChange={(e) =>
                changeFilter("search", e.target.value)
              }
              placeholder="Rechercher un produit..."
              className="w-full min-w-0 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrer par catégorie"
              value={category}
              onChange={(e) =>
                changeFilter("category", e.target.value)
              }
              className={`${inputClass} h-[54px] appearance-none pr-10`}
            >
              <option value="Toutes">
                Toutes les catégories
              </option>

              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Filtrer par statut"
              value={status}
              onChange={(e) =>
                changeFilter("status", e.target.value)
              }
              className={`${inputClass} h-[54px] appearance-none pr-10`}
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Publié">Publié</option>
              <option value="Brouillon">Brouillon</option>
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        {/* ACTIONS GROUPÉES */}

        {selected.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#CEDABF] bg-[#E8F0E2] p-4">
            <p className="mr-auto text-sm font-semibold text-[#405033]">
              {selected.length} produit(s) sélectionné(s)
            </p>

            <button
              type="button"
              onClick={() =>
                changeSelectedStatus("Publié")
              }
              className="rounded-lg bg-[#405033] px-4 py-2 text-xs text-white"
            >
              Publier
            </button>

            <button
              type="button"
              onClick={() =>
                changeSelectedStatus("Brouillon")
              }
              className="rounded-lg bg-white px-4 py-2 text-xs"
            >
              Brouillon
            </button>

            <button
              type="button"
              onClick={removeSelected}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600"
            >
              <Trash2 size={15} />
              Supprimer
            </button>
          </div>
        )}

        {/* TABLEAU */}

        <div className="overflow-hidden rounded-xl border border-[#E6DFD5] bg-[#FFFCF8] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left">
              <thead className="bg-[#F1EEE8]">
                <tr className="text-[13px] text-[#474137]">
                  <th className="w-12 px-4 py-5">
                    <input
                      type="checkbox"
                      aria-label="Tout sélectionner"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 accent-[#405033]"
                    />
                  </th>

                  <th className="px-3 py-5">Image</th>
                  <th className="px-3 py-5">Nom du produit</th>
                  <th className="px-3 py-5">Catégorie</th>
                  <th className="px-3 py-5">Prix (TND)</th>
                  <th className="px-3 py-5">Statut</th>
                  <th className="px-3 py-5">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loaded &&
                  visible.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-[#EAE5DE] transition hover:bg-[#FAF7F0]"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Sélectionner ${product.name}`}
                          checked={selected.includes(product.id)}
                          onChange={() =>
                            toggleSelection(product.id)
                          }
                          className="h-4 w-4 accent-[#405033]"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <img
                          src={product.image || "/images/plateau.jpg"}
                          alt={product.name}
                          className="h-[64px] w-[64px] rounded-lg bg-[#EEE7DA] object-cover"
                        />
                      </td>

                      <td className="max-w-[245px] px-3 py-3">
                        <p className="text-[13px] font-semibold leading-6">
                          {product.name}
                        </p>
                      </td>

                      <td className="px-3 py-3 text-[13px] text-[#6C675F]">
                        {product.category}
                      </td>

                      <td className="px-3 py-3 text-[13px] font-semibold">
                        {product.price.toLocaleString("fr-TN")}
                      </td>

                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13px]">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              product.status === "Publié"
                                ? "bg-green-600"
                                : "bg-orange-500"
                            }`}
                          />
                          {product.status}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Modifier"
                            aria-label={`Modifier ${product.name}`}
                            onClick={() => openEdit(product)}
                            className={actionClass}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Voir"
                            aria-label={`Voir ${product.name}`}
                            onClick={() => openView(product)}
                            className={actionClass}
                          >
                            <Eye size={19} />
                          </button>

                          <button
                            type="button"
                            title="Supprimer"
                            aria-label={`Supprimer ${product.name}`}
                            onClick={() => removeOne(product)}
                            className={`${actionClass} text-red-500`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {loaded && visible.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center"
                    >
                      <Package
                        size={40}
                        className="mx-auto mb-3 text-[#8C987F]"
                      />
                      <p className="font-serif text-xl">
                        Aucun produit trouvé
                      </p>
                    </td>
                  </tr>
                )}

                {!loaded && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-sm text-[#807A70]"
                    >
                      Chargement des produits...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}

        <div className="mt-8 flex flex-col items-center justify-between gap-5 sm:flex-row">
          <p className="text-sm text-[#817B70]">
            {filtered.length === 0
              ? "Aucun produit à afficher"
              : `Affichage de ${
                  (currentPage - 1) * PAGE_SIZE + 1
                } à ${Math.min(
                  currentPage * PAGE_SIZE,
                  filtered.length
                )} sur ${filtered.length} produits`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Page précédente"
              className="rounded-lg border border-[#E6DFD5] bg-white p-3 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from(
              { length: totalPages },
              (_, i) => i + 1
            ).map((number) => (
              <button
                key={number}
                type="button"
                onClick={() => setPage(number)}
                className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                  currentPage === number
                    ? "bg-[#405033] text-white"
                    : "bg-white text-[#625D53]"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Page suivante"
              className="rounded-lg border border-[#E6DFD5] bg-white p-3 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* MODALE CONSULTER / MODIFIER */}

      {modal && activeProduct && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModal(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="my-auto w-full max-w-[680px] overflow-hidden rounded-2xl bg-[#FFFCF8] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E8E0D6] p-6">
              <h2
                id="product-modal-title"
                className="font-serif text-2xl"
              >
                {modal === "view"
                  ? "Détails du produit"
                  : "Modifier le produit"}
              </h2>

              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Fermer"
                className="rounded-full bg-[#EEE8DE] p-2"
              >
                <X size={20} />
              </button>
            </div>

            {modal === "view" ? (
              <div className="max-h-[75vh] space-y-4 overflow-y-auto p-6">
                <img
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  className="h-[260px] w-full rounded-xl object-cover"
                />

                <h3 className="font-serif text-2xl">
                  {activeProduct.name}
                </h3>

                <p className="text-sm text-[#817A70]">
                  {activeProduct.category} —{" "}
                  {activeProduct.status}
                </p>

                <p className="text-xl font-bold">
                  {activeProduct.price} TND
                </p>

                <p className="whitespace-pre-wrap text-sm leading-7">
                  {activeProduct.description}
                </p>

                <p className="text-sm">
                  <strong>Dimensions : </strong>
                  {activeProduct.dimensions || "Non précisées"}
                </p>

                <p className="text-sm">
                  <strong>Matériaux : </strong>
                  {activeProduct.materials || "Non précisés"}
                </p>

                <div className="flex flex-wrap gap-3">
                  {(activeProduct.images ?? []).map(
                    (image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Photo ${index + 1}`}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )
                  )}
                </div>
              </div>
            ) : (
              <form
                onSubmit={saveEdit}
                className="max-h-[75vh] space-y-5 overflow-y-auto p-6"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Nom
                  </label>
                  <input
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Catégorie
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          category: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      {CATEGORIES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Prix (TND)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                    className={`${inputClass} h-auto py-3`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Dimensions
                    </label>
                    <input
                      value={editForm.dimensions}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          dimensions: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold">
                      Matériaux
                    </label>
                    <input
                      value={editForm.materials}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          materials: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Statut
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as ProductStatus,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Publié">Publié</option>
                    <option value="Brouillon">Brouillon</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#405033] px-5 py-3 text-sm font-semibold text-white"
                >
                  <Check size={18} />
                  Enregistrer les modifications
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
