"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Item } from "@/types/next-auth";

export async function createInvoice(data: {
  uid?: string;
  date?: string;
  customer: string;
  customer_number: number | string;
  customer_address: string;
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

    const userId = Number(session.user.id);

    const invoiceCreate = await prisma.invoice.create({
      data: {
        uid: data.uid || undefined,
        date: data.date ? new Date(data.date) : new Date(),
        customer: data.customer,
        customer_number: String(data.customer_number),
        customer_address: data.customer_address,
        subtotal: Number(data.subtotal),
        discount: Number(data.discount || 0),
        received: Number(data.received || 0),
        total: Number(data.total),
        due: Number(data.due || 0),
        description: data.description,
        paymentType: data.paymentType,
        user: {
          connect: { id: userId },
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

    revalidatePath("/");
    return invoiceCreate;
  } catch (error: unknown) {
    console.error("Prisma Creation Error:", error);

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("An unexpected error occurred while creating invoice.");
  }
}

export async function deleteInvoice(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  try {
    // Ensuring user owns the invoice before deleting (Tenant Isolation)
    const existing = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("Invoice not found or unauthorized access.");
    }

    const deletedInvoice = await prisma.invoice.delete({
      where: { id },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Invoice ${deletedInvoice.uid} and its items were deleted.`,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    if (error && typeof error === "object" && "code" in error) {
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
      userId: Number(session.user.id),
    },
    include: {
      user: {
        select: {
          id: true,
          user_name: true,
          email: true,
          printLayout: true,
          createdAt: true,
          googleId: true,
          emailVerified: true,
          image: true,
          qrcodelink: true,
          address: true,
          phone: true,
        },
      },
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
    customer_number?: number | string;
    customer_address?: string;
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
        customer_number: data.customer_number
          ? String(data.customer_number)
          : undefined,
        customer_address: data.customer_address || undefined,
        subtotal:
          data.subtotal !== undefined ? Number(data.subtotal) : undefined,
        discount:
          data.discount !== undefined ? Number(data.discount) : undefined,
        received:
          data.received !== undefined ? Number(data.received) : undefined,
        total: data.total !== undefined ? Number(data.total) : undefined,
        due: data.due !== undefined ? Number(data.due) : undefined,
        description: data.description || undefined,
        paymentType: data.paymentType || undefined,

        items: data.items
          ? {
              deleteMany: {}, // Delete old items
              create: data.items.map((item: Item) => ({
                item_name: item.item_name,
                quantity: Number(item.quantity),
                unit: item.unit,
                price: Number(item.price),
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    revalidatePath("/");
    return updatedInvoice;
  } catch (error: unknown) {
    console.error("Update Error:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "P2025") {
        throw new Error("Invoice not found or unauthorized");
      }
    }

    const message =
      error instanceof Error ? error.message : "Error updating invoice";
    throw new Error(message);
  }
}