import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { role, status } = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current user metadata
    const { data: userData, error: fetchError } = await supabase.auth.admin.getUserById(
      params.id
    );

    if (fetchError) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentMetadata = userData.user.user_metadata || {};

    // Update user metadata
    const updates: any = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      params.id,
      {
        user_metadata: { ...currentMetadata, ...updates },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}