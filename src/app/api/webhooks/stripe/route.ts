import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import db from "@/app/lib/database/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get("stripe-signature")!;
        if (!signature) {
            return NextResponse.json(
                { error: "Webhook signature verification failed" },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return NextResponse.json(
                { error: "Webhook signature verification failed" },
                { status: 400 }
            );
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const userId = session.metadata?.userId as string;
                const planId = session.metadata?.planId as string;

                if (!customerId || !userId || !planId) {
                    console.error("Missing required metadata in checkout session:", session);
                    return NextResponse.json(
                        { error: "Missing required metadata" },
                        { status: 400 }
                    );
                }
                const subscriptionId = session.subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const plan = await db.Plan.findOne({ priceId: subscription.items.data[0].price.id });
                if (!plan) {
                    console.error("Plan not found for price ID:", subscription.items.data[0].price.id);
                    return NextResponse.json(
                        { error: "Plan not found" },
                        { status: 404 }
                    );
                }

                const user = await db.User.findById(userId);
                if (!user) {
                    console.error("User not found for ID:", userId);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                user.subscriptionId = subscriptionId;
                user.subscriptionStatus = subscription.status;
                user.currentplan = plan._id;
                user.planStartDate = new Date(subscription.current_period_start * 1000);
                user.planEndDate = new Date(subscription.current_period_end * 1000);
                user.pointsUsed = 0;
                user.pointsResetDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                user.requestPlanId = null;
                await user.save();
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by Stripe customer ID
                const user = await db.User.findOne({ stripeCustomerId: customerId });
                if (!user) {
                    console.error("User not found for customer:", customerId);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                if (subscription.status === "active") {
                    const plan = await db.Plan.findOne({ priceId: subscription.items.data[0].price.id });
                    if (plan) {
                        user.currentplan = plan._id;
                        const expandedSubscription = await stripe.subscriptions.retrieve(subscription.id);
                        user.planStartDate = new Date(expandedSubscription.current_period_start * 1000);
                        user.planEndDate = new Date(expandedSubscription.current_period_end * 1000);
                        user.pointsUsed = 0;
                        user.subscriptionId = subscription.id;
                        user.requestPlanId = null;
                        user.pointsResetDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                    }
                }

                await user.save();
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by Stripe customer ID
                const user = await db.User.findOne({ stripeCustomerId: customerId });
                if (!user) {
                    console.error("User not found for customer:", customerId);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                user.subscriptionId = null;
                user.currentplan = null;
                user.planStartDate = null;
                user.planEndDate = null;
                user.monthlyPoints = 0;
                user.pointsUsed = 0;
                user.requestPlanId = null;
                user.pointsResetDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                await user.save();
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                const customerId = invoice.customer as string;

                // Only process subscription invoices
                if (!subscriptionId) break;

                // Find user by Stripe customer ID
                const user = await db.User.findOne({ stripeCustomerId: customerId });

                if (!user) {
                    console.error(`No user found with Stripe customer ID: ${customerId}`);
                    break;
                }

                // Get subscription details from Stripe
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;

                // Get plan from price ID
                const planId = await db.Plan.findOne({ priceId: priceId });

                if (!planId) {
                    console.error(`No plan found for price ID: ${priceId}`);
                    break;
                }

                user.planStartDate = new Date(subscription.current_period_start * 1000);
                user.planEndDate = new Date(subscription.current_period_end * 1000);
                user.currentplan = planId;
                user.subscriptionId = subscriptionId;
                user.pointsUsed = 0;
                user.pointsResetDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
                user.requestPlanId = null;
                await user.save();

                await db.PlanHistory.create({
                    userId: user._id,
                    planId: planId._id,
                    price: planId.price,
                });

                console.log(`Subscription renewed for user: ${user.id}`);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 }
        );
    }
} 