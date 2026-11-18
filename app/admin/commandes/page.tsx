"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import {
  calculateOrderTotal,
  ORDER_SOURCES,
  ORDER_STATUSES,
  type Order,
  type OrderSource,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/orders";

import type { ProductDB } from "@/lib/products-db";

type OrderForm = {
  customerName: string;
  phone: string;
  address: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  deliveryFee: string;
  source: OrderSource;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string;
};

const EMPTY_FORM: OrderForm = {
  customerName: "",
  phone: "",
  address: "",
  productName: "",
  quantity: "1",
  unitPrice: "",
  deliveryFee: "0",
  source: "WhatsApp",
  status: "En attente",
  paymentStatus: "Non payé",
  notes: "",
};

const PAGE_SIZE = 6;

const inputClass =
  "w-full rounded-lg border border-[#DDD8CE] bg-white px-4 py-3 text-sm text-[#29271F] outline-none focus:border-[#405033]";

const labelClass = "mb-2 block text-xs font-semibold text-[#39362F]";

function getStatusStyle(status: OrderStatus) {
  switch (status) {
    case "En attente":
      return "bg-[#FFF0D6] text-[#98651A]";
    case "Confirmée":
      return "bg-[#E5EAF7] text-[#405D97]";
    case "En préparation":
      return "bg-[#EEE7FA] text-[#7551A3]";
    case "Expédiée":
      return "bg-[#E0EFF6] text-[#286D8D]";
    case "Livrée":
      return "bg-[#E5F3DF] text-[#347A30]";
    case "Annulée":
      return "bg-[#FBE4E2] text-[#B3443B]";
  }
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatPrice(value: number) {
  return `${value.toLocaleString("fr-TN", {
    maximumFractionDigits: 2,
  })} TND`;
}

function getWhatsAppUrl(order: Order) {
  const phone = order.phone.replace(/\D/g, "");

  const message = [
    `Bonjour ${order.customerName},`,
    `Concernant votre commande RadiWood ${order.reference} :`,
    `Statut : ${order.status}`,
    `Montant : ${formatPrice(calculateOrderTotal(order))}`,
    "",
    "Merci pour votre confiance.",
  ].join("\n");

  return phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductDB[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sourceFilter, setSourceFilter] = useState("Toutes");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<"add" | "edit" | "view" | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderForm>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* ========================================
     CHARGEMENT DEPUIS MONGODB
  ======================================== */

  const refresh = useCallback(async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
      ]);

      const ordersData = (await ordersRes.json()) as {
        success?: boolean;
        orders?: Order[];
      };
      const productsData = (await productsRes.json()) as {
        success?: boolean;
        products?: ProductDB[];
      };

      if (ordersData.success && Array.isArray(ordersData.orders)) {
        setOrders(ordersData.orders);
      }

      if (productsData.success && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      }
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ========================================
     FILTRAGE & PAGINATION
  ======================================== */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...orders]
      .filter((order) => {
        const text = [
          order.reference,
          order.customerName,
          order.phone,
          ...order.items.map((item) => item.productName),
        ]
          .join(" ")
          .toLowerCase();

        return (
          text.includes(query) &&
          (statusFilter === "Tous" || order.status === statusFilter) &&
          (sourceFilter === "Toutes" || order.source === sourceFilter)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, search, statusFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const stats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "En attente").length,
    preparing: orders.filter((order) => order.status === "En préparation")
      .length,
    delivered: orders.filter((order) => order.status === "Livrée").length,
  };

  function updateField(field: keyof OrderForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  }

  function openAdd() {
    setActiveOrder(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setModal("add");
  }

  function openEdit(order: Order) {
    const firstItem = order.items[0];

    setActiveOrder(order);
    setForm({
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      productName: firstItem?.productName ?? "",
      quantity: String(firstItem?.quantity ?? 1),
      unitPrice: String(firstItem?.unitPrice ?? 0),
      deliveryFee: String(order.deliveryFee),
      source: order.source,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
    });

    setError("");
    setModal("edit");
  }

  function openView(order: Order) {
    setActiveOrder(order);
    setModal("view");
  }

  function closeModal() {
    setModal(null);
    setActiveOrder(null);
    setError("");
  }

  function chooseProduct(name: string) {
    const product = products.find((item) => item.name === name);

    setForm((previous) => ({
      ...previous,
      productName: name,
      unitPrice: product ? String(product.price) : previous.unitPrice,
    }));
  }

  /* ========================================
     AJOUT / MODIFICATION (MONGODB)
  ======================================== */

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const unitPrice = Number(form.unitPrice);
    const deliveryFee = Number(form.deliveryFee);

    if (!form.customerName.trim() || !form.productName.trim()) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      form.unitPrice.trim() === "" ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      form.deliveryFee.trim() === "" ||
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0
    ) {
      setError("Veuillez vérifier les quantités et les prix.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const item = {
        productName: form.productName.trim(),
        quantity,
        unitPrice,
      };

      const common = {
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        deliveryFee,
        status: form.status,
        paymentStatus: form.paymentStatus,
        source: form.source,
        notes: form.notes.trim(),
      };

      if (modal === "edit" && activeOrder) {
        const res = await fetch(`/api/orders/${activeOrder.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...common,
            items: [item, ...activeOrder.items.slice(1)],
          }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
        };

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Impossible de modifier la commande.");
        }
      } else {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...common,
            items: [item],
          }),
        });

        const data = (await res.json()) as {
          success?: boolean;
          error?: string;
        };

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Impossible d'ajouter la commande.");
        }
      }

      await refresh();
      closeModal();
      setPage(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer la commande."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ========================================
     CHANGEMENT RAPIDE DE STATUT (MONGODB)
  ======================================== */

  async function changeStatus(order: Order, status: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o))
    );

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error();
      }
    } catch {
      window.alert("Impossible de modifier le statut.");
      await refresh();
    }
  }

  /* ========================================
     SUPPRESSION (MONGODB)
  ======================================== */

  async function removeOrder(order: Order) {
    if (!window.confirm(`Supprimer la commande ${order.reference} ?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error();
      }

      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch {
      window.alert("Impossible de supprimer la commande.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#F7F2E8] px-5 py-8 text-[#29271F] md:px-9">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold text-[#6C715F]">
              Gestion des commandes
            </p>

            <h1 className="mb-3 font-serif text-4xl font-semibold md:text-[44px]">
              Commandes
            </h1>

            <p className="text-sm text-[#817B70]">
              Suivez les commandes et les demandes de vos clients.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-3 self-start rounded-xl border border-[#DCCFAE] bg-[#405033] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#526442] md:self-center"
          >
            <Plus size={20} />
            Ajouter une commande
          </button>
        </div>

        {/* STATS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total commandes",
              value: stats.total,
              icon: ShoppingCart,
              bg: "bg-[#405033]",
              color: "text-white",
            },
            {
              label: "En attente",
              value: stats.pending,
              icon: Clock3,
              bg: "bg-[#F0DFC5]",
              color: "text-[#463A2C]",
            },
            {
              label: "En préparation",
              value: stats.preparing,
              icon: Package,
              bg: "bg-[#895936]",
              color: "text-white",
            },
            {
              label: "Livrées",
              value: stats.delivered,
              icon: Truck,
              bg: "bg-[#393A31]",
              color: "text-white",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`${stat.bg} ${stat.color} flex min-h-[120px] items-center gap-5 rounded-xl p-5 shadow-sm`}
              >
                <div className="rounded-full bg-white/15 p-4">
                  <Icon size={28} />
                </div>

                <div>
                  <p className="mb-2 text-sm">{stat.label}</p>

                  <strong className="text-3xl">
                    {loaded ? stat.value : "—"}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTRES */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex items-center gap-3 rounded-xl border border-[#DED8CE] bg-white px-4">
            <Search size={20} className="text-[#858075]" />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Rechercher une commande..."
              aria-label="Rechercher une commande"
              className="h-[54px] w-full min-w-0 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filtrer par statut"
              className={`${inputClass} h-[54px] appearance-none pr-10`}
            >
              <option value="Tous">Tous les statuts</option>

              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>

          <div className="relative">
            <select
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filtrer par source"
              className={`${inputClass} h-[54px] appearance-none pr-10`}
            >
              <option value="Toutes">Toutes les sources</option>

              {ORDER_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        {/* TABLEAU */}
        <div className="overflow-hidden rounded-xl border border-[#E8E0D5] bg-[#FFFCF8] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="bg-[#F1EEE8]">
                <tr className="text-[12px] font-semibold text-[#464137]">
                  <th className="px-5 py-5">Commande</th>
                  <th className="px-4 py-5">Client</th>
                  <th className="px-4 py-5">Date</th>
                  <th className="px-4 py-5">Montant</th>
                  <th className="px-4 py-5">Paiement</th>
                  <th className="px-4 py-5">Source</th>
                  <th className="px-4 py-5">Statut</th>
                  <th className="px-4 py-5">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loaded &&
                  visible.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-[#EAE5DC] transition hover:bg-[#FAF7F0]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-[#405033]">
                          {order.reference}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-[#888177]">
                          {order.items
                            .map((item) => item.productName)
                            .join(", ")}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold">
                          {order.customerName}
                        </p>

                        <p className="mt-1 text-xs text-[#817B70]">
                          {order.phone || "Téléphone non renseigné"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-[#706B62]">
                        {formatDate(order.createdAt)}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold">
                        {formatPrice(calculateOrderTotal(order))}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-2 text-[11px] font-semibold ${
                            order.paymentStatus === "Payé"
                              ? "bg-[#E4F2DF] text-[#357630]"
                              : "bg-[#FFF0DC] text-[#97631B]"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs">{order.source}</td>

                      <td className="px-4 py-4">
                        <select
                          value={order.status}
                          onChange={(event) =>
                            changeStatus(
                              order,
                              event.target.value as OrderStatus
                            )
                          }
                          aria-label={`Statut ${order.reference}`}
                          className={`max-w-[155px] rounded-lg border-0 px-2 py-2 text-[11px] font-semibold outline-none ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openView(order)}
                            aria-label={`Voir ${order.reference}`}
                            title="Voir"
                            className="rounded-lg border border-[#E8E1D8] bg-white p-2.5 hover:bg-[#F0EDE7]"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEdit(order)}
                            aria-label={`Modifier ${order.reference}`}
                            title="Modifier"
                            className="rounded-lg border border-[#E8E1D8] bg-white p-2.5 hover:bg-[#F0EDE7]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeOrder(order)}
                            aria-label={`Supprimer ${order.reference}`}
                            title="Supprimer"
                            className="rounded-lg border border-[#E8E1D8] bg-white p-2.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                {loaded && visible.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <ShoppingCart
                        size={40}
                        className="mx-auto mb-4 text-[#829273]"
                      />

                      <p className="font-serif text-xl">
                        Aucune commande trouvée
                      </p>
                    </td>
                  </tr>
                )}

                {!loaded && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-sm">
                      Chargement des commandes...
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
              ? "Aucune commande"
              : `Affichage de ${(currentPage - 1) * PAGE_SIZE + 1} à ${Math.min(
                  currentPage * PAGE_SIZE,
                  filtered.length
                )} sur ${filtered.length} commandes`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Page précédente"
              className="rounded-lg border border-[#E7E1D8] bg-white p-3 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                    number === currentPage
                      ? "bg-[#405033] text-white"
                      : "bg-white text-[#625C52]"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Page suivante"
              className="rounded-lg border border-[#E7E1D8] bg-white p-3 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* MODALES */}
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
            aria-labelledby="order-modal-title"
            className="my-auto w-full max-w-[750px] overflow-hidden rounded-2xl bg-[#FFFCF8] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E8E0D6] p-6">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-[#70815D]">
                  RADIOWOOD ADMIN
                </p>

                <h2
                  id="order-modal-title"
                  className="font-serif text-2xl md:text-3xl"
                >
                  {modal === "add"
                    ? "Ajouter une commande"
                    : modal === "edit"
                    ? `Modifier ${activeOrder?.reference}`
                    : `Commande ${activeOrder?.reference}`}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Fermer"
                className="rounded-full bg-[#F0EBE1] p-2"
              >
                <X size={20} />
              </button>
            </div>

            {modal === "view" && activeOrder ? (
              <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs text-[#827B70]">Client</p>
                    <p className="font-semibold">{activeOrder.customerName}</p>
                    <p className="mt-1 text-sm">
                      {activeOrder.phone || "Aucun numéro"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#827B70]">Date</p>
                    <p className="font-semibold">
                      {formatDate(activeOrder.createdAt)}
                    </p>
                    <p className="mt-1 text-sm">Source : {activeOrder.source}</p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#827B70]">Livraison</p>
                    <p className="text-sm">
                      {activeOrder.address || "Non précisée"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-[#827B70]">Statuts</p>
                    <p className="text-sm">
                      {activeOrder.status} — {activeOrder.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-[#E9E1D6]">
                  <div className="bg-[#F2EEE6] px-4 py-3 text-sm font-semibold">
                    Articles commandés
                  </div>

                  {activeOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between gap-4 border-t border-[#EEE8E0] px-4 py-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-xs text-[#817B70]">
                          Quantité : {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold">
                        {formatPrice(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}

                  <div className="flex justify-between border-t border-[#EEE8E0] px-4 py-3 text-sm">
                    <span>Livraison</span>
                    <span>{formatPrice(activeOrder.deliveryFee)}</span>
                  </div>

                  <div className="flex justify-between bg-[#E8EDDF] px-4 py-4 font-semibold text-[#405033]">
                    <span>Total</span>
                    <span>
                      {formatPrice(calculateOrderTotal(activeOrder))}
                    </span>
                  </div>
                </div>

                {activeOrder.notes && (
                  <div>
                    <p className="mb-2 font-semibold">Notes</p>
                    <p className="whitespace-pre-wrap text-sm text-[#716B61]">
                      {activeOrder.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(activeOrder)}
                    className="flex items-center gap-2 rounded-xl border border-[#DDD7CD] bg-white px-5 py-3 text-sm"
                  >
                    <Pencil size={17} />
                    Modifier
                  </button>

                  <a
                    href={getWhatsAppUrl(activeOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-[#405033] px-5 py-3 text-sm font-semibold text-white"
                  >
                    <MessageCircle size={17} />
                    Contacter le client
                    <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSave}
                className="max-h-[75vh] space-y-5 overflow-y-auto p-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="order-client" className={labelClass}>
                      Nom du client *
                    </label>
                    <input
                      id="order-client"
                      required
                      value={form.customerName}
                      onChange={(event) =>
                        updateField("customerName", event.target.value)
                      }
                      placeholder="Nom complet"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="order-phone" className={labelClass}>
                      Téléphone
                    </label>
                    <input
                      id="order-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="Ex : +216 ..."
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="order-address" className={labelClass}>
                    Adresse de livraison
                  </label>
                  <input
                    id="order-address"
                    value={form.address}
                    onChange={(event) =>
                      updateField("address", event.target.value)
                    }
                    placeholder="Ville et adresse"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="order-product" className={labelClass}>
                    Produit *
                  </label>

                  <input
                    id="order-product"
                    required
                    list="radiwood-order-products"
                    value={form.productName}
                    onChange={(event) => chooseProduct(event.target.value)}
                    placeholder="Sélectionner ou saisir un produit"
                    className={inputClass}
                  />

                  <datalist id="radiwood-order-products">
                    {products.map((product) => (
                      <option key={product.id} value={product.name} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="order-quantity" className={labelClass}>
                      Quantité *
                    </label>
                    <input
                      id="order-quantity"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.quantity}
                      onChange={(event) =>
                        updateField("quantity", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="order-price" className={labelClass}>
                      Prix unitaire (TND) *
                    </label>
                    <input
                      id="order-price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.unitPrice}
                      onChange={(event) =>
                        updateField("unitPrice", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="order-delivery" className={labelClass}>
                      Livraison (TND)
                    </label>
                    <input
                      id="order-delivery"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.deliveryFee}
                      onChange={(event) =>
                        updateField("deliveryFee", event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-[#E9EFE3] p-4 text-right text-sm font-semibold text-[#405033]">
                  Total :{" "}
                  {formatPrice(
                    (Number(form.quantity) || 0) *
                      (Number(form.unitPrice) || 0) +
                      (Number(form.deliveryFee) || 0)
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="order-source" className={labelClass}>
                      Source
                    </label>
                    <select
                      id="order-source"
                      value={form.source}
                      onChange={(event) =>
                        updateField("source", event.target.value)
                      }
                      className={inputClass}
                    >
                      {ORDER_SOURCES.map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="order-status" className={labelClass}>
                      Statut
                    </label>
                    <select
                      id="order-status"
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value)
                      }
                      className={inputClass}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="order-payment" className={labelClass}>
                      Paiement
                    </label>
                    <select
                      id="order-payment"
                      value={form.paymentStatus}
                      onChange={(event) =>
                        updateField("paymentStatus", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="Non payé">Non payé</option>
                      <option value="Payé">Payé</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="order-notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea
                    id="order-notes"
                    rows={3}
                    value={form.notes}
                    onChange={(event) =>
                      updateField("notes", event.target.value)
                    }
                    placeholder="Informations supplémentaires..."
                    className={`${inputClass} resize-y`}
                  />
                </div>

                {modal === "edit" &&
                  activeOrder &&
                  activeOrder.items.length > 1 && (
                    <p className="rounded-lg bg-[#FFF0D6] p-3 text-xs text-[#875A18]">
                      Cette fenêtre modifie le premier article. Les autres
                      articles de la commande seront conservés.
                    </p>
                  )}

                {error && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                  >
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 border-t border-[#EBE4D9] pt-5">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-[#DDD8CD] bg-white px-6 py-3 text-sm"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#405033] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Check size={17} />
                    {saving
                      ? "Enregistrement..."
                      : modal === "add"
                      ? "Ajouter la commande"
                      : "Enregistrer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}