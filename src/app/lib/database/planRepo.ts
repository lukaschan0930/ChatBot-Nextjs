import db from "./db";

export const PlanRepo = {
    findAll,
    findById,
    create,
    update,
    deletePlan
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
}) {
    return await db.Plan.create(plan);
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
}) {
    return await db.Plan.findByIdAndUpdate(id, plan, { new: true });
}

async function deletePlan(id: string) {
    return await db.Plan.findByIdAndDelete(id);
}