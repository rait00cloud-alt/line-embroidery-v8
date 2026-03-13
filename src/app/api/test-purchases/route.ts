import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/components/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    // Get all purchases to see what's in the table
    const { data: allPurchases, error: allError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .limit(10);

    console.log("All purchases:", allPurchases);
    console.log("All purchases error:", allError);

    // Get table info
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .limit(1);

    return Response.json({
      allPurchases,
      allError,
      tableInfo,
      tableError,
      count: allPurchases?.length || 0
    });
  } catch (error: any) {
    console.error("Test purchases error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return Response.json({ error: "user_id required" }, { status: 400 });
    }

    // Test creating a purchase
    const testPurchase = {
      user_id,
      product_name: "Test Product",
      amount: 25.00,
      status: "paid",
      shipping_address: {
        name: "Test User",
        line1: "123 Test St",
        city: "Test City",
        state: "TS",
        postal_code: "12345",
        country: "US"
      },
      cart_items: [{
        id: "test",
        name: "Test Product",
        price: 25,
        quantity: 1,
        size: "One Size",
        color: "Black"
      }],
      coupon_id: null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from("purchases")
      .insert(testPurchase)
      .select("*")
      .single();

    return Response.json({ data, error });
  } catch (error: any) {
    console.error("Test purchase creation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}