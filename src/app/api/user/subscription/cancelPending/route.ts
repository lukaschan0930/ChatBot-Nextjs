import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await UserRepo.findByEmail(session.user?.email || '');
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if there's a pending request to cancel
    if (!user.requestPlanId) {
        return NextResponse.json({ error: "No pending subscription changes found" }, { status: 400 });
    }

    try {
        if (user.subscriptionId) {
            // Get the current subscription from Stripe
            const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

            // Get the requested plan details
            const requestedPlan = await PlanRepo.findById(user.requestPlanId);
            if (!requestedPlan) {
                return NextResponse.json({ error: "Requested plan not found" }, { status: 404 });
            }

            // Handle canceling pending cancellation (downgrade to free plan)
            if (requestedPlan.price === 0) {
                // Cancel the pending cancellation by setting cancel_at_period_end to false
                await stripe.subscriptions.update(user.subscriptionId, {
                    cancel_at_period_end: false,
                });
            } else {
                // Handle canceling pending downgrade to paid plan
                // Revert back to current plan by updating subscription items
                const currentPlan = await PlanRepo.findById(user.currentplan);
                if (!currentPlan) {
                    return NextResponse.json({ error: "Current plan not found" }, { status: 404 });
                }

                if (currentPlan.price != 0) {
                    const subscriptionItemId = subscription.items.data[0].id;
                    await stripe.subscriptions.update(user.subscriptionId, {
                        items: [{ id: subscriptionItemId, price: currentPlan.priceId }]
                    });
                    await PlanRepo.updatePlanHistory(user._id.toString(), user.requestPlanId, "failed", null, null);
                }
            }
        }

        // Update the local database to clear the requestPlanId
        const newUser = await UserRepo.updateUserSubscription(
            user.email,
            user.subscriptionId,
            user.subscriptionStatus,
            user.currentplan,
            user.planStartDate,
            user.planEndDate,
            user.pointsUsed,
            user.pointsResetDate,
            null
        )

        return NextResponse.json({
            success: true,
            user: newUser,
            message: "Pending subscription changes have been cancelled"
        });
    } catch (error) {
        console.error("Error canceling pending subscription:", error);
        return NextResponse.json(
            { error: "Failed to cancel pending subscription changes" },
            { status: 500 }
        );
    }
}