// app/actions/printSettings.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPrintSettings() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: { printLayout: true },
    });

    // Fallback to "1" (Classic) if no layout is found
    return { layout: user?.printLayout || "1" };
  } catch (error) {
    console.error("[GET_PRINT_SETTINGS_ERROR]:", error);
    throw new Error("Failed to fetch print settings");
  }
}

export async function updatePrintSettings(layout: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!layout) {
    throw new Error("Layout selection is required");
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { printLayout: layout },
    });

    return { 
      message: "Settings updated", 
      layout: updatedUser.printLayout 
    };
  } catch (error) {
    console.error("[UPDATE_PRINT_SETTINGS_ERROR]:", error);
    throw new Error("Failed to update settings");
  }
}