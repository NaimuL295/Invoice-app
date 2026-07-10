"use server" // KEEP this here

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ItemType } from "@/types/next-auth";

// 1. Change the function name and accept raw data instead of a Request object
export async function createInvoice(data: {
  uid?: string;
  date?: string;
  customer: string;
  items: ItemType[];
  subtotal: number | string;
  total: number | string;
  discount?: number | string;
  received?: number | string;
  due?: number | string;
  paymentType: string;
  description?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized"); // Throw errors instead of returning NextResponse
    }

    // 2. Remove req.json(), use the data directly
    console.log("Request Body:", data);

    const invoiceCreate = await prisma.invoice.create({
      data: {
        uid: data.uid || undefined,
        date: data.date ? new Date(data.date) : new Date(),
        customer: data.customer,
        subtotal: Number(data.subtotal),
        discount: Number(data.discount || 0),
        received: Number(data.received || 0),
        total: Number(data.total),
        due: Number(data.due || 0),
        description: data.description,
        paymentType: data.paymentType,
        user: {
          connect: { id: Number(session.user.id) },
        },
        items: {
          create: data.items.map((item: ItemType) => ({
            item_name: item.item_name,
            quantity: Number(item.quantity),
            unit: item.unit,
            price: Number(item.price),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 3. Return the data directly
    return invoiceCreate; 
} catch (error: unknown) {
    console.error("Prisma Creation Error:", error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error("An unexpected error occurred.");
  }
}