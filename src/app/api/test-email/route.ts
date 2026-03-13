import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Line Embroidery <onboarding@resend.dev>",
      to: "rait00.cloud@gmail.com",
      subject: "Test Email - Line Embroidery",
      html: `
        <h1>Email Test Successful!</h1>
        <p>Your Resend configuration is working correctly.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, message: "Email sent successfully", data });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
