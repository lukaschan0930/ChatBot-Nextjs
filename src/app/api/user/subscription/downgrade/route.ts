import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import Stripe from "stripe";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";
import db from "@/app/lib/database/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
    const { planId } = await request.json();

    try {
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

        if (plan.price === 0) {
            // If user has an active subscription, cancel it
            if (user.subscriptionId) {
                const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
                const currentPeriodEnd = subscription.current_period_end;
                await stripe.subscriptions.update(user.subscriptionId, {
                    cancel_at_period_end: true,
                });

                await db.User.updateOne(
                    { email: user.email },
                    { $set: { requestPlanId: planId } }
                );

                return NextResponse.json({
                    success: true,
                    message: "Subscription will be cancelled at the end of current billing period",
                    effectiveDate: new Date(currentPeriodEnd * 1000)
                }, { status: 200 });
            }

            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Handle paid plan
        const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
        const subscriptionItemId = subscription.items.data[0].id;
        await stripe.subscriptions.update(user.subscriptionId, {
            items: [{ id: subscriptionItemId, price: plan.priceId }]
        });

        await db.User.updateOne(
            { email: user.email },
            { $set: { requestPlanId: planId } }
        );

        return NextResponse.json({
            success: true,
            user
        }, { status: 200 });

    } catch (error) {
        console.error("Error downgrading subscription:", error);
        return NextResponse.json({ error: "Failed to downgrade subscription" }, { status: 500 });
    }
}
