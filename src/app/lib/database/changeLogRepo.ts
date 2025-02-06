import db from "./db";

export const ChangeLogRepo = {
    findAll,
    create,
    deleteLog,
    update,
    findById
}

async function findAll() {
    return db.ChangeLog.find();
}

async function create(changeLog: { title: string, category: string, article: string }) {
    return db.ChangeLog.create(changeLog);
}

async function deleteLog(id: string) {
    return db.ChangeLog.deleteOne({ _id: id });
}

async function update(id: string, changeLog: { title: string, category: string, article: string }) {
    return db.ChangeLog.updateOne({ _id: id }, { $set: changeLog });
}

async function findById(id: string) {
    return db.ChangeLog.findById(id);
}
