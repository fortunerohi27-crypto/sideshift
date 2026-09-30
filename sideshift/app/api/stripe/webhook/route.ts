import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const session = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const userId = session.client_reference_id;
    if (!userId) return NextResponse.json({ error: "No userId in session" }, { status: 400 });

    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: true })
      .eq("id", userId);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    // Also record the subscription
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: "active",
      });

    if (subError) console.error("Subscription record error:", subError);
  }

  return NextResponse.json({ received: true });
}
