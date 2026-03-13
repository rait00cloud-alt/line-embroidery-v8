// /api/stripe/embedded-checkout
const session = await stripe.checkout.sessions.create({
  ui_mode: "embedded",
  payment_method_types: ["card"],
  line_items: cart.map(item => ({
    price_data: {
      currency: "usd",
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  })),
  mode: "payment",
  metadata: { purchase_id: purchase.id },
});
return NextResponse.json({ client_secret: session.client_secret });
