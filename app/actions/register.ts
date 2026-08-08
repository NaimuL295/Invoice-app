"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerAction(formData: FormData) {
  const user_name = formData.get("user_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters",
    };
  }

  // Duplicate check
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists",
    };
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      user_name,
      email,
      password: hashed,
    },
  });

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      user_name: user.user_name,
    },
  };
}