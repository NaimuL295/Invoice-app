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




export async function getTransactionHistory(startDate: string, endDate: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: Number(session.user.id),
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        uid: true,
        customer: true,
        date: true,
        total: true,
        received: true,
        due: true,
        description: true,
      },
    });

    let runningBalance = 0;

 const transactions = invoices.map((invoice) => {
      runningBalance += (invoice.received ?? 0) - (invoice.due ?? 0);

      return {
        id: invoice.uid ?? String(invoice.id),
        customer: invoice.customer,        // ← ei line ta ache to?
        date: invoice.date,
        description: invoice.description ?? `Invoice - ${invoice.customer}`,
        type: (invoice.due ?? 0) > 0 ? "debit" : "credit",
        amount: invoice.total,
        due: invoice.due ?? 0,
        balance: runningBalance,
      };
    });


    return transactions.reverse();
  } catch (error) {
    console.error(error);
    throw new Error("Something went wrong while fetching transaction history");
  }
}