// src/app/api/stripe/checkout/route.ts

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { CartItem } from "@/contexts/CartContext";
import { supabaseAdmin } from "@/components/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

type PurchaseInsert = {
  product_name: string;
  amount: number;
  status: string;
  shipping_address: any;
  cart_items: CartItem[];
  coupon_id: string | null;
  created_at: string;
  user_id?: string;
  guest_email?: string;
  guest_name?: string;
};

export async function POST(req: NextRequest) {
  try {
    const {
      cart,
      shippingAddress,
      shippingCost,
      couponId,
      user_id,
      guestEmail,
      guestName,
    }: {
      cart: CartItem[];
      shippingAddress: any;
      shippingCost: number;
      couponId: string | null;
      user_id: string | null;
      guestEmail?: string;
      guestName?: string;
    } = await req.json();

    if (!user_id && !guestEmail) {
  return Response.json(
    { error: "Guest email is required for guest checkout" },
    { status: 400 }
  );
}

    if (!cart || cart.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Fetch design cost from settings
    const { data: config } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "design_cost_per_asset")
      .single();

    const DESIGN_COST_PER_ASSET = config ? Number(config.value) : 45;

    // Validate coupon and get discount (only for logged-in users)
    let couponDiscountPercent = 0;
    if (couponId && user_id) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("discount")
        .eq("id", couponId)
        .eq("user_id", user_id)
        .eq("is_used", false)
        .maybeSingle();

      if (coupon) {
        couponDiscountPercent = coupon.discount;
      } 
    }

    // Calculate totals
    let productSubtotal = 0;
    let customizationCost = 0;

    for (const item of cart) {
      const assetCount = item.design?.length || 0;
      const basePrice = item.price - assetCount * DESIGN_COST_PER_ASSET;
      productSubtotal += basePrice * item.quantity;
      customizationCost += assetCount * DESIGN_COST_PER_ASSET * item.quantity;
    }

    const subtotalBeforeDiscount = productSubtotal + customizationCost;
    const couponDiscount = couponDiscountPercent
      ? (subtotalBeforeDiscount * couponDiscountPercent) / 100
      : 0;
    const totalAfterDiscount = subtotalBeforeDiscount - couponDiscount;
    const totalWithShipping = totalAfterDiscount + shippingCost;

    // Create PaymentIntent instead of Checkout Session
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalWithShipping * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user_id || "guest",
        guest_email: guestEmail || "",
        guest_name: guestName || "",
        coupon_id: couponId || "",
      },
    });

    // Create purchase record
    const purchaseData: PurchaseInsert = {
      product_name: cart.map((i) => i.name).join(", "),
      amount: totalWithShipping,
      status: "pending_payment",
      shipping_address: shippingAddress,
      cart_items: cart,
      coupon_id: couponId,
      created_at: new Date().toISOString(),
    };

    if (user_id) {
      purchaseData.user_id = user_id;
    } else {
      purchaseData.guest_email = guestEmail!;
      purchaseData.guest_name = guestName || null;
    }

    console.log("Creating purchase with data:", purchaseData);
    console.log("User ID being used:", user_id);
    console.log("Purchase data user_id:", purchaseData.user_id);
    
    // Verify user exists if user_id is provided, create if not
    if (user_id) {
      const { data: userExists, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user_id)
        .single();
      
      console.log("User exists check:", { userExists, userError });
      
      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist, create it
        console.log("Creating user record for:", user_id);
        const { error: createUserError } = await supabaseAdmin
          .from("users")
          .insert({ id: user_id })
          .single();
        
        if (createUserError) {
          console.error("Failed to create user record:", createUserError);
          return Response.json(
            { error: "Failed to create user record" },
            { status: 500 }
          );
        }
      } else if (userError) {
        console.error("Error checking user:", userError);
        return Response.json(
          { error: "Database error" },
          { status: 500 }
        );
      }
    }
    
    const insertResult = await supabaseAdmin
      .from("purchases")
      .insert(purchaseData)
      .select("id")
      .single();

    console.log("Purchase insert result:", insertResult);

    // Handle purchase creation errors
    if (insertResult.error) {
      console.error("Purchase insert error:", insertResult.error);
      return Response.json(
        { error: "Failed to create purchase record" },
        { status: 500 }
      );
    }

    if (!insertResult.data) {
      return Response.json(
        { error: "No purchase data returned" },
        { status: 500 }
      );
    }

    const purchase = insertResult.data;

    console.log("Updating purchase with payment_intent_id:", paymentIntent.id);
    
    // Update purchase with payment intent ID
    const updateResult = await supabaseAdmin
      .from("purchases")
      .update({ payment_intent_id: paymentIntent.id })
      .eq("id", purchase.id);
      
    console.log("Purchase update result:", updateResult);

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}