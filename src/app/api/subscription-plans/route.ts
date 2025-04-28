import { NextResponse } from 'next/server';
import { ISubscriptionPlan } from '@/app/lib/interface';
import { PlanRepo } from '@/app/lib/database/planRepo';

export async function GET() {
    try {
        const plans = await PlanRepo.findAll();
        return NextResponse.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch subscription plans' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newPlan = await PlanRepo.create(body);

        return NextResponse.json({
            success: true,
            data: newPlan
        });
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create subscription plan' },
            { status: 500 }
        );
    }
} 