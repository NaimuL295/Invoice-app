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
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        uid: true,
        customer: true,
        customer_number: true,
        customer_address: true,
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
            email: true,
            user_name: true,
            image: true,
          },
        },
        items: {
          select: {
            id: true,
            item_name: true,
            quantity: true,
            unit: true,
            price: true,
            invoiceId: true,
          },
        },
      },
    });

    return invoices;
  } catch (error) {
    console.error("Fetch Invoices Error:", error);
    throw new Error("Something went wrong while fetching invoices.");
  }
}

export async function getTransactionHistory(startDate: string, endDate: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Ensures all invoices on the end date are included

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: Number(session.user.id),
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        uid: true,
        customer: true,
        customer_number: true,
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
        customer: invoice.customer,
        customerNumber: invoice.customer_number ?? "",
        date: invoice.date,
        description: invoice.description ?? `Invoice - ${invoice.customer}`,
        type: (invoice.due ?? 0) > 0 ? "debit" : "credit",
        amount: invoice.total,
        received: invoice.received ?? 0,
        due: invoice.due ?? 0,
        balance: runningBalance,
      };
    });

    return transactions.reverse();
  } catch (error) {
    console.error("Fetch History Error:", error);
    throw new Error("Something went wrong while fetching transaction history.");
  }
}