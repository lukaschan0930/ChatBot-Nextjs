import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import Stripe from "stripe";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
    const { planId } = await request.json();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await UserRepo.findByEmail(session.user?.email || '');
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const plan = await PlanRepo.findById(planId);
    if (!plan) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    if (user.currentplan === planId) {
        return NextResponse.json({ error: "User already on this plan" }, { status: 400 });
    }

    try {
        // First retrieve the subscription to get the subscription item ID
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        const subscriptionItemId = subscription.items.data[0].id;

        // Update the subscription with the new price
        await stripe.subscriptions.update(user.subscriptionId, {
            items: [{
                id: subscriptionItemId,
                price: plan.priceId
            }],
            proration_behavior: 'none',
            billing_cycle_anchor: 'now'
        });

        // Update user's current plan in database
        user.requestPlanId = planId;
        await user.save();

        await PlanRepo.createPlanHistory(user._id.toString(), plan._id.toString(), plan.price, `${plan.name} - ${plan.isYearlyPlan ? "Annual" : "Monthly"}`);

        return NextResponse.json({ success: true, user }, { status: 200 });
    } catch (error) {
        console.error('Subscription update error:', error);
        return NextResponse.json(
            { error: "Failed to update subscription" },
            { status: 500 }
        );
    }
}
