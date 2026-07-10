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

// export interface Item {
//   id: number;
//   item_name: string;
//   quantity: number;
//   unit: string;
//   price: number;
//   invoiceId?: number;
// }
// export interface Item {
//   id?: number;
//   name: string;
//   qty: number;
//   price: number;
//   invoiceId?: number;
// }
// export interface Invoice {
//   id?: number;
//   user_name:string;
//   companyEmail:string
//   uid: string;
//   email:string
//   customer: string;
//   date: string;
//   subtotal: number;
//   total: number;
//   discount: number;
//   due: number;
//   received: number;
//   paymentType: string;
//   description: string;
//   userId: number;
//   createdAt: string;
//  user: User;
//   items: Item[];
// }
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

export interface Item {
  id?: number;
  item_name: string; // Unified version (adjust property names if your DB uses name/qty)
  quantity: number;  
  unit?: string;
  price: number;
  invoiceId?: number;
}

export interface Invoice {
  id?: number;
  user_name: string;
  companyEmail: string;
  uid: string;
  email: string;
  customer: string;
  date: string;
  subtotal: number;
  total: number;
  discount: number;
  due: number;
  received: number;
  paymentType: string;
  description: string;
  userId: number;
  createdAt: string | Date;
  user?: User;         // Made optional to safely support both flat and relational structures
  items?: Item[];      // Made optional to prevent strict relation issues when loading lists
}