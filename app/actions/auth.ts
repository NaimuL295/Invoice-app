// app/actions/auth.ts
"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { generateResetToken, hashPassword } from "@/lib/token";
import { sendEmail } from "@/lib/mail";

export async function forgotPasswordAction(formData: FormData) {
  const rawEmail = formData.get("email") as string;

  if (!rawEmail || typeof rawEmail !== "string") {
    return { error: "Please provide a valid email address." };
  }

  const email = rawEmail.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Email Enumeration প্রতিরোধের জন্য ইউজার না থাকলেও সফল মেসেজ ব্যাক করা হয়
    if (!user) return { ok: true };

    const { token, hashed } = generateResetToken();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 মিনিট মেয়াদের টোকেন

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashed, resetTokenExpiry: expires },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account. Click the button below to update your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1bc325; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail(email, "Reset your password", htmlContent);

    return { ok: true };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { error: "Failed to send reset link. Please try again later." };
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!token || !newPassword) {
    return { error: "Missing required fields." };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  try {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: { 
        resetToken: hashed, 
        resetTokenExpiry: { gt: new Date() } 
      },
    });

    if (!user) {
      return { error: "Invalid or expired token. Please request a new link." };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}