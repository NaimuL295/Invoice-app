import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { user_name, email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email এবং password আবশ্যক" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password কমপক্ষে ৬ ক্যারেক্টার হতে হবে" },
        { status: 400 }
      );
    }

    // Duplicate check
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "এই email দিয়ে already একাউন্ট আছে" },
        { status: 409 }
      );
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

    return NextResponse.json(
      { id: user.id, email: user.email, user_name: user.user_name },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}