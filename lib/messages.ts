
export type MessageSource = "Contact" | "Sur mesure";

export type CustomerMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: MessageSource;
  isRead: boolean;
  createdAt: string;
};

export const MESSAGES_STORAGE_KEY =
  "radiwood_admin_messages";

export const defaultMessages: CustomerMessage[] = [
  {
    id: "demo-1",
    name: "Client Démo 1",
    email: "demo1@example.com",
    phone: "",
    subject: "Plateau personnalisé",
    message:
      "Bonjour, je souhaite avoir des informations sur la création d'un plateau en bois d'olivier avec résine turquoise. Est-il possible de choisir les dimensions ?",
    source: "Sur mesure",
    isRead: false,
    createdAt: "2026-10-14T10:30:00",
  },
  {
    id: "demo-2",
    name: "Client Démo 2",
    email: "demo2@example.com",
    phone: "",
    subject: "Livraison en Tunisie",
    message:
      "Bonjour, je souhaite connaître les modalités de livraison pour une commande RadiWood.",
    source: "Contact",
    isRead: true,
    createdAt: "2026-10-13T15:15:00",
  },
  {
    id: "demo-3",
    name: "Client Démo 3",
    email: "demo3@example.com",
    phone: "",
    subject: "Miroir sur mesure",
    message:
      "Bonjour, j'aimerais commander un miroir en bois d'olivier avec des dimensions personnalisées. Pouvez-vous m'informer sur les possibilités ?",
    source: "Sur mesure",
    isRead: false,
    createdAt: "2026-10-12T09:00:00",
  },
  {
    id: "demo-4",
    name: "Client Démo 4",
    email: "demo4@example.com",
    phone: "",
    subject: "Informations sur les produits",
    message:
      "Bonjour, je souhaite avoir plus d'informations sur vos produits et les matériaux utilisés.",
    source: "Contact",
    isRead: true,
    createdAt: "2026-10-10T14:25:00",
  },
];

export function getMessages(): CustomerMessage[] {
  if (typeof window === "undefined") {
    return defaultMessages;
  }

  try {
    const stored = localStorage.getItem(
      MESSAGES_STORAGE_KEY
    );

    if (stored === null) {
      return defaultMessages;
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return defaultMessages;
    }

    return parsed.filter(
      (item): item is CustomerMessage =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.message === "string" &&
        typeof item.isRead === "boolean"
    );
  } catch {
    return defaultMessages;
  }
}

export function saveMessages(
  messages: CustomerMessage[]
): void {
  localStorage.setItem(
    MESSAGES_STORAGE_KEY,
    JSON.stringify(messages)
  );

  window.dispatchEvent(
    new Event("radiwood-messages-updated")
  );
}

export function updateMessage(
  id: string,
  changes: Partial<CustomerMessage>
): void {
  const updated = getMessages().map((message) =>
    message.id === id
      ? { ...message, ...changes }
      : message
  );

  saveMessages(updated);
}

export function deleteMessage(id: string): void {
  saveMessages(
    getMessages().filter((message) => message.id !== id)
  );
}
