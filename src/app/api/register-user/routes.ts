import { supabase } from "@/components/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password, phone, address } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
    }

    // Create Auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: authError?.message || "Auth error" }), { status: 400 });
    }

    const userId = authData.user.id;

    //  Insert user into `users` table with phone + address
    const { error: userTableError } = await supabase
      .from("users")
      .insert([{ id: userId, email, phone, address }]);

    if (userTableError) {
      return new Response(JSON.stringify({ error: userTableError.message }), { status: 400 });
    }

    // Assign welcome coupon
    const { error: couponError } = await supabase
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

    if (couponError) {
      return new Response(JSON.stringify({ error: couponError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, userId }));
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
