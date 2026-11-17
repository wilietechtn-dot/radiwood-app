
export type OrderStatus =
  | "En attente"
  | "Confirmée"
  | "En préparation"
  | "Expédiée"
  | "Livrée"
  | "Annulée";

export type PaymentStatus =
  | "Non payé"
  | "Payé";

export type OrderSource =
  | "WhatsApp"
  | "Site web"
  | "Sur mesure"
  | "Autre";

export type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  reference: string;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  deliveryFee: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  source: OrderSource;
  notes: string;
  createdAt: string;
};

export const ORDER_STORAGE_KEY =
  "radiwood_admin_orders";

export const ORDER_STATUSES: OrderStatus[] = [
  "En attente",
  "Confirmée",
  "En préparation",
  "Expédiée",
  "Livrée",
  "Annulée",
];

export const ORDER_SOURCES: OrderSource[] = [
  "WhatsApp",
  "Site web",
  "Sur mesure",
  "Autre",
];

export const defaultOrders: Order[] = [
  {
    id: "demo-1",
    reference: "RW-1001",
    customerName: "Client Démo 1",
    phone: "",
    address: "Tunis",
    items: [
      {
        productName: "Plateau en bois d'olivier et résine",
        quantity: 1,
        unitPrice: 450,
      },
    ],
    deliveryFee: 0,
    status: "En attente",
    paymentStatus: "Non payé",
    source: "WhatsApp",
    notes: "Commande fictive pour démonstration.",
    createdAt: "2026-10-12T10:30:00",
  },
  {
    id: "demo-2",
    reference: "RW-1002",
    customerName: "Client Démo 2",
    phone: "",
    address: "Sousse",
    items: [
      {
        productName: "Miroir naturel",
        quantity: 1,
        unitPrice: 680,
      },
    ],
    deliveryFee: 15,
    status: "En préparation",
    paymentStatus: "Payé",
    source: "Sur mesure",
    notes: "Commande fictive pour démonstration.",
    createdAt: "2026-10-11T14:00:00",
  },
  {
    id: "demo-3",
    reference: "RW-1003",
    customerName: "Client Démo 3",
    phone: "",
    address: "Sfax",
    items: [
      {
        productName: "Planche de service",
        quantity: 2,
        unitPrice: 320,
      },
    ],
    deliveryFee: 20,
    status: "Livrée",
    paymentStatus: "Payé",
    source: "WhatsApp",
    notes: "Commande fictive pour démonstration.",
    createdAt: "2026-10-09T09:15:00",
  },
  {
    id: "demo-4",
    reference: "RW-1004",
    customerName: "Client Démo 4",
    phone: "",
    address: "Nabeul",
    items: [
      {
        productName: "Table d'appoint",
        quantity: 1,
        unitPrice: 750,
      },
    ],
    deliveryFee: 25,
    status: "Confirmée",
    paymentStatus: "Non payé",
    source: "Sur mesure",
    notes: "Commande fictive pour démonstration.",
    createdAt: "2026-10-08T16:45:00",
  },
];

export function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return defaultOrders;
  }

  try {
    const saved = localStorage.getItem(
      ORDER_STORAGE_KEY
    );

    if (saved === null) {
      return defaultOrders;
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return defaultOrders;
    }

    return parsed.filter(
      (item): item is Order =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.reference === "string" &&
        typeof item.customerName === "string" &&
        Array.isArray(item.items)
    );
  } catch {
    return defaultOrders;
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify(orders)
  );

  window.dispatchEvent(
    new Event("radiwood-orders-updated")
  );
}

export function calculateOrderTotal(
  order: Order
): number {
  const subtotal = order.items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unitPrice,
    0
  );

  return subtotal + order.deliveryFee;
}

export function addOrder(
  input: Omit<
    Order,
    "id" | "reference" | "createdAt"
  >
): Order {
  const orders = getOrders();

  const nextNumber =
    orders.reduce((max, order) => {
      const number = Number(
        order.reference.replace("RW-", "")
      );

      return Number.isFinite(number)
        ? Math.max(max, number)
        : max;
    }, 1000) + 1;

  const newOrder: Order = {
    ...input,
    id: crypto.randomUUID(),
    reference: `RW-${nextNumber}`,
    createdAt: new Date().toISOString(),
  };

  saveOrders([newOrder, ...orders]);

  return newOrder;
}

export function updateOrder(
  id: string,
  changes: Partial<Order>
): void {
  saveOrders(
    getOrders().map((order) =>
      order.id === id
        ? { ...order, ...changes }
        : order
    )
  );
}

export function deleteOrder(id: string): void {
  saveOrders(
    getOrders().filter((order) => order.id !== id)
  );
}
