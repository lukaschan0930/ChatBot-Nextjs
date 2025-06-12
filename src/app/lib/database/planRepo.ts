import db from "./db";

export const PlanRepo = {
    findAll,
    findById,
    create,
    update,
    deletePlan,
    createPlanHistory,
    findByPriceId,
    findPlanHistoryByUserId,
    updatePlanHistory,
    getPlanHistoryByUserIdAndPlanId,
    savePlanHistory
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

async function createPlanHistory(userId: string, planId: string, price: number, type: string) {
    return await db.PlanHistory.create({
        userId,
        planId,
        price,
        type
    });
}

async function findPlanHistoryByUserId(userId: string) {
    return await db.PlanHistory.find({ userId }).sort({ createdAt: -1 });
}

async function updatePlanHistory(userId: string, planId: string, status: string, invoiceId: string | null, invoicePdfUrl: string | null | undefined) {
    return await db.PlanHistory.findOneAndUpdate({ userId, planId, status: "pending" }, { status, invoiceId, invoicePdfUrl }, { new: true });
}

async function getPlanHistoryByUserIdAndPlanId(userId: string, planId: string) {
    return await db.PlanHistory.findOne({ userId, planId, status: "pending" });
}

async function savePlanHistory(userId: string, planId: string, price: number, type: string, status: string, invoiceId: string | null, invoicePdfUrl: string | null | undefined) {
    return await db.PlanHistory.create({ userId, planId, price, type, status, invoiceId, invoicePdfUrl });
}