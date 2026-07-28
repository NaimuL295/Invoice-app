import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    user_name?: string | null;
  }

  interface Session {
    user: {
      id: string;
      user_name?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    user_name?: string | null;
  }
}

export interface User {
  id: number;
  createdAt: Date;
  user_name: string | null;
  email: string;
  password?: string | null;
  googleId?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  qrcodelink?: string | null;
  printLayout?: string | null;
  address?: string | null;
  phone?: string | null;
}
import { InvoicePrint } from "@/types/next-auth";

interface LayoutProps {
  data: InvoicePrint;
  title?: string;
}
export interface Item {
  id?: number;
  item_name: string; // Unified version (adjust property names if your DB uses name/qty)
  quantity: number;
  unit?: string;
  price: number;
  invoiceId?: number;
}

export interface Invoice {
  id: number;
  user_name: string;
  companyEmail: string;
  uid: string;
  email: string;
  customer: string;
  date: string | Date; // Safe parsing for JavaScript Date strings
  subtotal: number;
  total?: number;
  discount: number; // Represents the percentage (2) in your calculation
  discountType?: "percentage" | "flat"; // Optional helper for handling the 2% vs $2 issue
  due: number;
  received: number;
  paymentType: string;
  description: string;
  userId: number;
  createdAt: string | Date;
  user: User; // Present in response data
  items: Item[]; // Present in response data as Array(1)
}
export interface Product {
  id: number;
  item_name: string;
  category: string;
  unit: string;
  price: number;
  userId: number;
  createdAt: string | Date;
}