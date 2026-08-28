import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the developer record
    const { data: developer, error: developerError } = await supabase
      .from("developers")
      .select("id")
      .eq("userId", user.id)
      .single();

    if (developerError || !developer) {
      return NextResponse.json(
        { error: "Developer account not found" },
        { status: 404 }
      );
    }

    // Get payouts for this developer
    const { data: payouts, error: payoutsError } = await supabase
      .from("payouts")
      .select("*")
      .eq("developerId", developer.id)
      .order("requestedAt", { ascending: false });

    if (payoutsError) {
      console.error("Error fetching payouts:", payoutsError);
      return NextResponse.json(
        { error: "Failed to fetch payouts" },
        { status: 500 }
      );
    }

    // Calculate totals
    let totalEarned = 0;
    let pendingAmount = 0;

    (payouts || []).forEach((p: any) => {
      if (p.status === "PAID") {
        totalEarned += p.netAmount || 0;
      } else if (p.status === "REQUESTED" || p.status === "APPROVED" || p.status === "PROCESSING") {
        pendingAmount += p.netAmount || 0;
      }
    });

    return NextResponse.json({
      payouts: payouts || [],
      totalEarned,
      pendingAmount,
    });
  } catch (error) {
    console.error("Error in developer payouts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}