import { Invoice, Item } from "@/types/next-auth";

type PrismaInvoiceItem = {
  id: number;
  item_name: string;
  quantity: number;
  unit: string | null;
  price: number;
  invoiceId: number;
};

type PrismaInvoiceUser = {
  id: number;
  user_name: string | null;
  email: string;
  printLayout?: string | null;
  createdAt?: Date;
  googleId?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  qrcodelink?: string | null;
  address?: string | null;
  phone?: string | null;
};

export type PrismaInvoicePayload = {
  id: number;
  uid: string | null;
  customer: string;
  date: Date | null;
  subtotal: number;
  total: number;
  discount: number | null;
  due: number | null;
  received: number;
  paymentType: string;
  description: string | null;
  userId: number;
  createdAt: Date;
  user: PrismaInvoiceUser;
  items?: PrismaInvoiceItem[];
};

function formatItems(items: PrismaInvoiceItem[] = []): Item[] {
  return items.map((item) => ({
    id: item.id,
    item_name: item.item_name,
    quantity: item.quantity,
    unit: item.unit ?? undefined,
    price: item.price,
    invoiceId: item.invoiceId,
  }));
}

export function formatPrismaInvoice(raw: PrismaInvoicePayload): Invoice {
  return {
    ...raw,
    uid: raw.uid ?? "",
    user_name: raw.user?.user_name ?? "",
    email: raw.user?.email ?? "",
    companyEmail: raw.user?.email ?? "",
    date: raw.date ? new Date(raw.date).toISOString().split("T")[0] : "",
    createdAt: raw.createdAt
      ? new Date(raw.createdAt).toISOString()
      : new Date().toISOString(),
    discount: raw.discount ?? 0,
    subtotal: raw.subtotal ?? 0,
    total: raw.total ?? 0,
    due: raw.due ?? 0,
    received: raw.received ?? 0,
    customer: raw.customer ?? "",
    paymentType: raw.paymentType ?? "",
    description: raw.description ?? "",
    items: formatItems(raw.items),
    user: raw.user as Invoice["user"],
  };
}

export function formatPrismaInvoices(rawList: PrismaInvoicePayload[]): Invoice[] {
  return rawList.map(formatPrismaInvoice);
}
