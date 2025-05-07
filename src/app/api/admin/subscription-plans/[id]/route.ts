import { NextRequest, NextResponse } from 'next/server';
import { PlanRepo } from '@/app/lib/database/planRepo';
import { checkAdmin } from '@/app/lib/api/helper';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const { id } = params;
        const plan = await PlanRepo.findById(id);

        return NextResponse.json({
            success: true,
            data: plan,
        });
    } catch (error) {
        console.error('Error fetching subscription plan:', error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    
    try {
        const { id } = params;
        const plan = await PlanRepo.findById(id);

        if (!plan) {
            return NextResponse.json(
                { success: false, message: 'Subscription plan not found' },
                { status: 404 }
            );
        }

        await PlanRepo.deletePlan(id);

        return NextResponse.json({
            success: true,
            message: 'Subscription plan deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete subscription plan' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
        return NextResponse.json({ message: "Unauthorized", status: false }, { status: 401 });
    }
    try {
        const { id } = params;
        const body = await request.json();
        const updatedPlan = await PlanRepo.update(id, body);

        return NextResponse.json({
            success: true,
            data: updatedPlan
        }); 
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update subscription plan' },
            { status: 500 }
        );
    }
}
