import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists. Please sign in." },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "CUSTOMER" },
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user in Prisma database
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        name,
        email,
        passwordHash: "supabase-auth-managed", // Password is managed by Supabase
        role: "CUSTOMER",
        status: authData.user.confirmed_at ? "ACTIVE" : "PENDING_VERIFICATION",
        emailVerifiedAt: authData.user.confirmed_at || null,
      },
    });

    // Return success
    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });

  } catch (error: any) {
    console.error("Registration error:", error);
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}