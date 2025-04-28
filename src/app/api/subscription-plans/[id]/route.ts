import { NextResponse } from 'next/server';
import { PlanRepo } from '@/app/lib/database/planRepo';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
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
    request: Request,
    { params }: { params: { id: string } }
) {
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
