import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
});

export async function POST(request: NextRequest) {
    try {
        const { paymentMethodId } = await request.json();
        
        const session = await getServerSession(authOptions as AuthOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await UserRepo.findByEmail(session.user?.email || '');
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.stripeCustomerId) {
            return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
        }

        // Update customer's default payment method
        await stripe.customers.update(user.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // If user has active subscription, update subscription's default payment method
        if (user.subscriptionId) {
            await stripe.subscriptions.update(user.subscriptionId, {
                default_payment_method: paymentMethodId,
            });
        }

        // Get the updated payment method to store in database
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
        
        // Update user's payment method in database
        await UserRepo.updateUserProfileWithEmail(
            user.email, 
            user.name, 
            user.avatar, 
            user.wallet, 
            user.chatPoints ?? 0, 
            user.workerPoints ?? 0, 
            user.isNodeConnected ?? false, 
            user.isNodeAdded ?? false, 
            paymentMethod
        );

        return NextResponse.json({ 
            success: true, 
            message: "Payment method updated successfully" 
        });

    } catch (error) {
        console.error("Error updating payment method:", error);
        return NextResponse.json(
            { error: "Failed to update payment method" },
            { status: 500 }
        );
    }
} 