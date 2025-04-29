import db from "@/app/lib/database/db";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
    const { planId } = await request.json();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db.User.findOne({ email: session.user?.email });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const plan = await db.Plan.findOne({ _id: planId });
    if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    if (user.currentPlan === planId) {
        return NextResponse.json({ error: "User already on this plan" }, { status: 400 });
    }

    await stripe.subscriptions.update(user.subscriptionId, {
        items: [{ id: user.subscriptionId, price: plan.priceId }],
        proration_behavior: 'always_invoice',
        billing_cycle_anchor: 'now'
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
