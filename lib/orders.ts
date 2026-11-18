export type OrderStatus =
  | "En attente"
  | "Confirmée"
  | "En préparation"
  | "Expédiée"
  | "Livrée"
  | "Annulée";

export type PaymentStatus = "Non payé" | "Payé";

export type OrderSource = "WhatsApp" | "Site web" | "Sur mesure" | "Autre";

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

export function calculateOrderTotal(order: Order): number {
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  return subtotal + order.deliveryFee;
}