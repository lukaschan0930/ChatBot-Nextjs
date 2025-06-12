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

        // Create setup intent for updating payment method
        const setupIntent = await stripe.setupIntents.create({
            customer: user.stripeCustomerId,
            payment_method_types: ['card'],
            usage: 'off_session', // For subscriptions
        });

        return NextResponse.json({ 
            success: true, 
            clientSecret: setupIntent.client_secret 
        });

    } catch (error) {
        console.error("Error creating setup intent:", error);
        return NextResponse.json(
            { error: "Failed to create setup intent" },
            { status: 500 }
        );
    }
} 