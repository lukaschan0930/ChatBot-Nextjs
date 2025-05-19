import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PlanRepo } from "@/app/lib/database/planRepo";
import { UserRepo } from "@/app/lib/database/userrepo";

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
                const userId = session.metadata?.userId as string;
                const planId = session.metadata?.planId as string;
                const customerId = session.customer as string;

                if (!customerId || !userId || !planId) {
                    console.error("Missing required metadata in checkout session:", session);
                    return NextResponse.json(
                        { error: "Missing required metadata" },
                        { status: 400 }
                    );
                }
                const subscriptionId = session.subscription as string;
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                console.log("checkout webhook metadata", userId, planId);
                const priceId = subscription.items.data[0].price.id;
                const plan = await PlanRepo.findByPriceId(priceId);

                if (!plan) {
                    console.error("Plan not found for price ID:", subscription.items.data[0].price.id);
                    return NextResponse.json(
                        { error: "Plan not found" },
                        { status: 404 }
                    );
                }

                const user = await UserRepo.getUserByStripeCustomerId(customerId);
                if (!user) {
                    console.error("User not found for ID:", userId);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                const userSubscription = await UserRepo.updateUserSubscription(
                    user.email,
                    subscriptionId,
                    subscription.status,
                    plan._id,
                    new Date(subscription.current_period_start * 1000),
                    new Date(subscription.current_period_end * 1000),
                    0,
                    new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    null
                );
                console.log("userSubscription", userSubscription);
                break;
            }

            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by Stripe customer ID
                const user = await UserRepo.getUserByStripeCustomerId(customerId);
                if (!user) {
                    console.error("User not found for customer:", customerId);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                if (subscription.status === "active") {
                    const plan = await PlanRepo.findByPriceId(subscription.items.data[0].price.id);
                    if (plan) {
                        const expandedSubscription = await stripe.subscriptions.retrieve(subscription.id);
                        await UserRepo.updateUserSubscription(
                            user.email,
                            subscription.id,
                            subscription.status,
                            plan._id,
                            new Date(expandedSubscription.current_period_start * 1000),
                            new Date(expandedSubscription.current_period_end * 1000),
                            0,
                            new Date(new Date().setMonth(new Date().getMonth() + 1)),
                            null
                        )
                    }
                }

                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by Stripe customer ID
                const user = await UserRepo.getUserByStripeCustomerId(customerId);
                if (!user) {
                    console.error("User not found for customer:", customerId);
                    return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                    );
                }

                await UserRepo.updateUserSubscription(user.email, null, null, null, null, null, 0, new Date(new Date().setMonth(new Date().getMonth() + 1)), null);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId = invoice.subscription as string;
                const customerId = invoice.customer as string;

                // Only process subscription invoices
                if (!subscriptionId) break;

                // Find user by Stripe customer ID
                const user = await UserRepo.getUserByStripeCustomerId(customerId);

                if (!user) {
                    console.error(`No user found with Stripe customer ID: ${customerId}`);
                    break;
                }

                // Get subscription details from Stripe
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const priceId = subscription.items.data[0].price.id;

                // Get plan from price ID
                const planId = await PlanRepo.findByPriceId(priceId);

                if (!planId) {
                    console.error(`No plan found for price ID: ${priceId}`);
                    break;
                }

                await UserRepo.updateUserSubscription(
                    user.email, 
                    subscriptionId, 
                    subscription.status, 
                    planId._id,
                    new Date(subscription.current_period_start * 1000), 
                    new Date(subscription.current_period_end * 1000), 
                    0, 
                    new Date(new Date().setMonth(new Date().getMonth() + 1)), 
                    null
                );

                await PlanRepo.createPlanHistory(user._id, planId._id, planId.price);

                console.log(`Subscription renewed for user: ${user._id}`);
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