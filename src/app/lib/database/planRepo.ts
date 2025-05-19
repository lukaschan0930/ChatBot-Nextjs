import db from "./db";

export const PlanRepo = {
    findAll,
    findById,
    create,
    update,
    deletePlan,
    createPlanHistory,
    findByPriceId
}

async function findAll() {
    return await db.Plan.find();
}

async function findById(id: string) {
    return await db.Plan.findById(id);
}

async function create(plan: {
    name: string;
    price: number;
    description: string;
    features: string[];
    isYearlyPlan: boolean;
    points: number;
    bonusPoints: number;
    disableModel: string[];
    priceId: string;
    productId: string;
}) {
    return await db.Plan.create({
        name: plan.name,
        price: plan.price,
        description: plan.description,
        features: plan.features,
        isYearlyPlan: plan.isYearlyPlan,
        points: plan.points,
        bonusPoints: plan.bonusPoints,
        disableModel: plan.disableModel,
        priceId: plan.priceId,
        productId: plan.productId
    });
}

async function update(id: string, plan: {
    name: string;
    price: number;
    description: string;
    features: string[];
    isYearlyPlan: boolean;
    points: number;
    bonusPoints: number;
    disableModel: string[];
    priceId: string;
    productId: string;
}) {
    return await db.Plan.findByIdAndUpdate(id, plan, { new: true });
}

async function deletePlan(id: string) {
    return await db.Plan.findByIdAndDelete(id);
}

async function findByPriceId(priceId: string) {
    return await db.Plan.findOne({ priceId });
}

async function createPlanHistory(userId: string, planId: string, price: number) {
    return await db.PlanHistory.create({
        userId,
        planId,
        price
    });
}
