"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getInvoices() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: Number(session.user.id) },
      orderBy: { id: "desc" },
      select: {
        id: true,
        uid: true,
        customer: true,
        date: true,
        subtotal: true,
        total: true,
        discount: true,
        due: true,
        received: true,
        paymentType: true,
        description: true,
        userId: true,
        createdAt: true,
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
      },
    });

    return invoices;
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong while fetching invoices");
  }
}