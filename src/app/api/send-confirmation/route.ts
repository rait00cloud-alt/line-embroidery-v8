import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/components/lib/supabase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { purchaseId } = await req.json();

    // Get purchase details
    const { data: purchase, error } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("id", purchaseId)
      .single();

    if (error || !purchase) {
      return Response.json({ error: "Purchase not found" }, { status: 404 });
    }

    // Get user or guest email
    let recipientEmail = "";
    let recipientName = "";

    if (purchase.user_id) {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(purchase.user_id);
      recipientEmail = user?.user?.email || "";
      recipientName = user?.user?.user_metadata?.name || "Customer";
    } else {
      recipientEmail = purchase.guest_email || "";
      recipientName = purchase.guest_name || "Customer";
    }

    if (!recipientEmail) {
      return Response.json({ error: "No email found" }, { status: 400 });
    }

    // Upload design screenshots to storage
    const cartItems = purchase.cart_items || [];
    const designUrls: string[] = [];

    for (const item of cartItems) {
      if (item.design && item.design.length > 0) {
        for (const asset of item.design) {
          if (asset._url) {
            try {
              const blob = await (await fetch(asset._url)).blob();
              const fileExt = blob.type.split("/")[1] || "png";
              const fileName = `${purchase.user_id || "guest"}/${purchaseId}/designs/${Date.now()}.${fileExt}`;
              
              const { error: uploadError } = await supabaseAdmin.storage
                .from("user-designs")
                .upload(fileName, blob);

              if (!uploadError) {
                const publicUrl = supabaseAdmin.storage
                  .from("user-designs")
                  .getPublicUrl(fileName).data.publicUrl;
                designUrls.push(publicUrl);
              }
            } catch (err) {
              // Silent error
            }
          }
        }
      }
    }

    // Build email HTML
    const itemsHtml = cartItems
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">
            <strong>${item.name}</strong><br/>
            <span style="color: #666; font-size: 14px;">
              ${item.color} • ${item.size} • Qty: ${item.quantity}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
            $${item.price.toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const designsHtml = designUrls.length > 0
      ? `
        <h3 style="margin-top: 30px;">Your Designs</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${designUrls.map(url => `<img src="${url}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;" />`).join("")}
        </div>
      `
      : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000;">Thank You for Your Order!</h1>
            <p style="color: #666;">Order #${purchaseId}</p>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 12px; font-weight: bold;">Total</td>
                <td style="padding: 12px; text-align: right; font-weight: bold;">
                  $${purchase.amount.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${purchase.shipping_address?.line1 || ""}</p>
            <p style="margin: 5px 0;">
              ${purchase.shipping_address?.city || ""}, ${purchase.shipping_address?.state || ""} ${purchase.shipping_address?.zip || ""}
            </p>
            <p style="margin: 5px 0;">${purchase.shipping_address?.country || ""}</p>
          </div>

          ${designsHtml}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
            <p>We'll send you a shipping confirmation email as soon as your order ships.</p>
            <p style="margin-top: 20px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="color: #000; text-decoration: none;">
                Visit Line Embroidery
              </a>
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    await resend.emails.send({
      from: "Line Embroidery <onboarding@resend.dev>",
      to: recipientEmail,
      subject: `Order Confirmation #${purchaseId}`,
      html: emailHtml,
    });

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
