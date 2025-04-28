import { NextRequest, NextResponse } from 'next/server';
import { PlanRepo } from '@/app/lib/database/planRepo';
import { checkAdmin } from '@/app/lib/api/helper';

export async function GET(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
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

export async function POST(request: NextRequest) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
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