"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { Product } from "@/types/next-auth";

type ProductInput = {
  item_name: string;
  category: string;
  unit: string;
  price: number | string;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return Number(session.user.id);
}

export async function getProducts(): Promise<Product[]> {
  const userId = await requireUserId();
  return prisma.product.findMany({
    where: { userId },
    orderBy: { item_name: "asc" },
  });
}

// 🔍 search action
export async function searchProducts(query: string): Promise<Product[]> {
  const userId = await requireUserId();

  if (!query.trim()) {
    return prisma.product.findMany({
      where: { userId },
      orderBy: { item_name: "asc" },
    });
  }

  return prisma.product.findMany({
    where: {
      userId,
      OR: [
        { item_name: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { item_name: "asc" },
  });
}

export async function createProduct(data: ProductInput): Promise<Product> {
  const userId = await requireUserId();
  if (!data.item_name || !data.category) {
    throw new Error("item_name and category required");
  }
  const product = await prisma.product.create({
    data: {
      item_name: data.item_name,
      category: data.category,
      unit: data.unit || "Pieces (pcs)",
      price: Number(data.price) || 0,
      userId,
    },
  });
  revalidatePath("/products/create");
  return product;
}

export async function updateProduct(
  id: number,
  data: ProductInput,
): Promise<Product> {
  const userId = await requireUserId();
  const existing = await prisma.product.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Not found");
  const product = await prisma.product.update({
    where: { id },
    data: {
      item_name: data.item_name,
      category: data.category,
      unit: data.unit,
      price: Number(data.price) || 0,
    },
  });
  revalidatePath("/products/create");
  return product;
}

export async function deleteProduct(id: number): Promise<{ success: true }> {
  const userId = await requireUserId();
  const existing = await prisma.product.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Not found");
  await prisma.product.delete({ where: { id } });
  revalidatePath("/products/create");
  return { success: true };
}
