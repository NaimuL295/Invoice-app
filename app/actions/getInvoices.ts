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
      where: { userId: Number(session.user.id) }, // Add Number() here if userId is Int
      orderBy: { id: "desc" },
      include: {
        user: true,
        items: true,
      },
    });

    return invoices;
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong while fetching invoices");
  }
}