import db from "./db";

export const AiRepo = {
    findAll,
    findById,
    create,
    update,
    deleteAI
}

async function findAll() {
    return await db.AI.find();
}

async function findById(id: string) {
    return await db.AI.findById(id);
}

async function create(ai: { name: string, inputCost: number, outputCost: number, multiplier: number }) {
    return await db.AI.create(ai);
}

async function update(id: string, ai: { name: string, inputCost: number, outputCost: number, multiplier: number }) {
    return await db.AI.findByIdAndUpdate(id, ai, { new: true });
}

async function deleteAI(id: string) {
    return await db.AI.findByIdAndDelete(id);
}