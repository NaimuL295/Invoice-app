"use server" // KEEP this here

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Item } from "@/types/next-auth";


export async function createInvoice(data: {
  uid?: string;
  date?: string;
  customer: string;
  items: Item[];
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
      throw new Error("Unauthorized");
    }

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
          create: data.items.map((item: Item) => ({
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

    return invoiceCreate;
  } catch (error: unknown) {
    console.error("Prisma Creation Error:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("An unexpected error occurred.");
  }
}


export async function deleteInvoice(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const deletedInvoice = await prisma.invoice.delete({
      where: {
        id: id,
      },
    });

    return {
      success: true,
      message: `Invoice ${deletedInvoice.uid} and its items were deleted.`,
    };
} catch (error: unknown) {
    // Safely check for Prisma error codes without using 'any'
    if (error && typeof error === "object" && "code" in error) {
      // P2025 = Prisma error code for "Record to delete does not exist"
      if (error.code === "P2025") {
        throw new Error("Invoice not found.");
      }
    }

    console.error("Delete Error:", error);
    throw new Error("Failed to delete invoice.");
  }
}



export async function getInvoiceId(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: id,
      userId: Number(session.user.id), // Ensure user owns the invoice
    },
    include: {
      user: true,
      items: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
}

export async function modifyInvoice(
  id: number,
  data: {
    date?: string;
    customer?: string;
    items?: Item[];
    subtotal?: number | string;
    total?: number | string;
    discount?: number | string;
    received?: number | string;
    due?: number | string;
    paymentType?: string;
    description?: string;
  }
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { 
        id: id,
        userId: Number(session.user.id), // Ensure user owns the invoice
      },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        customer: data.customer || undefined,
        subtotal: data.subtotal !== undefined ? Number(data.subtotal) : undefined,
        discount: data.discount !== undefined ? Number(data.discount) : undefined,
        received: data.received !== undefined ? Number(data.received) : undefined,
        total: data.total !== undefined ? Number(data.total) : undefined,
        due: data.due !== undefined ? Number(data.due) : undefined,
        description: data.description || undefined,
        paymentType: data.paymentType || undefined,
        
        items: data.items ? {
          deleteMany: {}, // Delete old items
          create: data.items.map((item: Item) => ({
            item_name: item.item_name,
            quantity: Number(item.quantity),
            unit: item.unit,
            price: Number(item.price),
          })),
        } : undefined,
      },
      include: { items: true },
    });

    return updatedInvoice;
  }  catch (error: unknown) {
  console.error("Update Error:", error);

  // 1. Check if the error is an object containing a Prisma error code
  if (error && typeof error === "object" && "code" in error) {
    // P2025: "An operation failed because a record was not found."
    if (error.code === "P2025") {
      throw new Error("Invoice not found");
    }
  }

  // Fallback error message for unexpected database or system crashes
  const message = error instanceof Error ? error.message : "Error updating invoice";
  throw new Error(message);
}
}