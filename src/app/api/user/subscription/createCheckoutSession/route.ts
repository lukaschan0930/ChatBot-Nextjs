import { NextRequest, NextResponse } from "next/server";
import { Stripe } from "stripe";
import { UserRepo } from "@/app/lib/database/userrepo";
import { PlanRepo } from "@/app/lib/database/planRepo";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, NextAuthOptions } from "next-auth";
import db from "@/app/lib/database/db";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const user = await UserRepo.findByEmail(session.user?.email as string);
    if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { planId } = await request.json();
    const plan = await PlanRepo.findById(planId);
    if (!plan) {
        return NextResponse.json({ success: false, error: "Plan not found" }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email as string,
        });
        customerId = customer.id;
        await UserRepo.updateUserStripeInfo(user.email as string, customerId);
    }
    const stripeSession = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: plan.priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.NEXTAUTH_URL}/subscription?success=true&planId=${planId}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`,
        metadata: {
            userId: user._id.toString(),
            planId: plan._id.toString(),
        },
    });
    
    // await db.User.updateOne(
    //     { email: user.email },
    //     { $set: { requestPlanId: planId } }
    // );

    // await PlanRepo.createPlanHistory(user._id.toString(), plan._id.toString(), plan.price, `${plan.name} - ${plan.isYearlyPlan ? "Annual" : "Monthly"}`);

    return NextResponse.json({ success: true, url: stripeSession.url }, { status: 200 });
}