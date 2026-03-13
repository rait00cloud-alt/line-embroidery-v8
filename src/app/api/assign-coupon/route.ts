import { supabaseAdmin } from "@/components/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const { error } = await supabaseAdmin
      .from("coupons")
      .insert([
        {
          user_id: userId,
          code: "WELCOME10",
          discount_percent: 10,
          is_active: true,
          type: "new_user",
        },
      ]);

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
