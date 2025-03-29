import db from "./db";

export const AdminRepo = {
    findAdmin,
    updateAdmin,
}

async function findAdmin() {
    return db.Admin.findOne();
}

async function updateAdmin(systemPrompt: string) {
    return db.Admin.updateOne({}, { $set: { systemPrompt } });
}
