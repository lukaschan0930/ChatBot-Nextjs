import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import Stripe from "stripe";
import db from "@/app/lib/database/db";

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

    if (user.currentplan === planId) {
        return NextResponse.json({ error: "User already on this plan" }, { status: 400 });
    }

    // Check if current plan has ended
    const isCurrentPlanEnded = user.planEndDate && new Date(user.planEndDate).getTime() < new Date().getTime();

    if (!isCurrentPlanEnded) {
        return NextResponse.json({ error: "Current plan has not ended" }, { status: 400 });
    }

    // Handle free plan (price = 0)
    if (plan.price === 0) {
        // If user has an active subscription, cancel it
        if (user.subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
            try {
                await stripe.subscriptions.cancel(user.subscriptionId);
            } catch (error) {
                console.error('Error canceling subscription:', error);
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle paid plan
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;
    await stripe.subscriptions.update(user.subscriptionId, {
        items: [{ id: subscriptionItemId, price: plan.priceId }],
        proration_behavior: 'always_invoice',
        billing_cycle_anchor: 'now'
    });

    await db.User.updateOne(
        { _id: user._id },
        { $set: { requestPlanId: planId } }
    );

    return NextResponse.json({
        success: true,
    }, { status: 200 });

    // Update existing subscription
    // const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    // if (!subscription) {
    //     return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    // }

    // await stripe.subscriptions.update(user.subscriptionId, {
    //     items: [{ id: user.subscriptionId, price: plan.priceId }],
    //     proration_behavior: 'always_invoice',
    //     billing_cycle_anchor: 'now'
    // });

    // return NextResponse.json({ success: true }, { status: 200 });
}
