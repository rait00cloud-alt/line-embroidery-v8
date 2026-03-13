import { NextRequest } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/components/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Find purchase by payment_intent_id
    const { data: purchase } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("payment_intent_id", paymentIntent.id)
      .single();

    if (purchase) {
      // Update purchase status
      await supabaseAdmin
        .from("purchases")
        .update({ status: "paid" })
        .eq("id", purchase.id);

      // Send confirmation email
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: purchase.id }),
      });
    }
  }

  return Response.json({ received: true });
}
