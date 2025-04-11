import db from "./db";

export const AdminRepo = {
    findAdmin,
    updateAdmin,
    updateTotalNode,
}

async function findAdmin() {
    return db.Admin.findOne();
}

async function updateAdmin(systemPrompt: string) {
    return db.Admin.updateOne({}, { $set: { systemPrompt } });
}

async function updateTotalNode(totalNode: number) {
    return db.Admin.updateOne({}, { $set: { totalNode } });
}
