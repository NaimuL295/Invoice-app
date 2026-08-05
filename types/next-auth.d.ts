import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// ==========================================
// 1. NextAuth Module Augmentations
// ==========================================
declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
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
    id: string;
    user_name?: string | null;
  }
}

// ==========================================
// 2. Application Domain Models
// ==========================================
export interface AppUser {
  id: number;
  user_name: string | null;
  email: string;
  password?: string | null;
  googleId?: string | null;
  emailVerified?: Date | string | null;
  image?: string | null;
  qrcodelink?: string | null;
  printLayout?: string | null;
  address?: string | null;
  phone?: string | null;
  createdAt: Date | string;
}

export interface Item {
  id?: number;
  item_name: string;
  quantity: number;
  unit?: string | null;
  price: number;
  invoiceId?: number;
}

export interface Invoice {
  id: number;
  uid?: string | null;
  customer: string;
  customer_number?: string | null;
  customer_address?: string | null;
  date: Date | string;
  subtotal: number;
  total: number;
  discount?: number | null;
  discountType?: "percentage" | "flat"; // UI helper property
  due?: number | null;
  received: number;
  paymentType: string;
  description?: string | null;
  userId: number;
  createdAt: Date | string;
  user?: AppUser;
  items: Item[];
}

export interface Product {
  id: number;
  item_name: string;
  category: string;
  unit: string;
  price: number;
  userId: number;
  createdAt: Date | string;
}