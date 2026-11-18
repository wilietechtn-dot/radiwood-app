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