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

        // Create customer portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXTAUTH_URL}/userSetting`,
        });

        return NextResponse.json({ 
            success: true, 
            url: portalSession.url 
        });

    } catch (error) {
        console.error("Error creating customer portal session:", error);
        return NextResponse.json(
            { error: "Failed to create customer portal session" },
            { status: 500 }
        );
    }
} 