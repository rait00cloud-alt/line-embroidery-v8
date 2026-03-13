import Stripe from "stripe";
import { supabaseAdmin } from "@/components/lib/supabase-admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentIntentId = searchParams.get("payment_intent");

  if (!paymentIntentId) {
    return Response.json({
      success: false,
      error: "Missing payment_intent",
    });
  }

  try {
    console.log("Verifying payment intent:", paymentIntentId);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("Payment intent status:", paymentIntent.status);

    if (paymentIntent.status === "succeeded") {
      // Find purchase by payment_intent_id
      console.log("Looking for purchase with payment_intent_id:", paymentIntentId);
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from("purchases")
        .select("*")
        .eq("payment_intent_id", paymentIntentId)
        .single();

      console.log("Purchase found:", purchase);
      console.log("Purchase error:", purchaseError);

      if (purchase && purchase.status !== "paid") {
        console.log("Updating purchase status to paid for purchase:", purchase.id);
        // Update purchase status
        const { error: updateError } = await supabaseAdmin
          .from("purchases")
          .update({ status: "paid" })
          .eq("id", purchase.id);

        console.log("Purchase update error:", updateError);

        // Send confirmation email
        try {
          console.log("Sending confirmation email for purchase:", purchase.id);
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-confirmation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ purchaseId: purchase.id }),
          });
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          // Silent error - don't fail verification if email fails
        }
      } else if (!purchase) {
        console.error("No purchase found for payment_intent_id:", paymentIntentId);
      } else {
        console.log("Purchase already marked as paid:", purchase.id);
      }
    }

    return Response.json({
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      id: paymentIntent.id,
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: "Stripe verification failed",
    });
  }
}