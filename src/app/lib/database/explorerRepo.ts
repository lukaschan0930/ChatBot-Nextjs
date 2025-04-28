import db from "./db";
import { IExplorer } from "../interface";

export const ExplorerRepo = {
    findAll,
    create,
    update,
    findByDate,
    findByLatest
}

async function findAll() {
    return db.Explorer.aggregate([
        {
            $project: {
                _id: 1,
                date: 1,
                userCount: 1,
                promptCount: 1,
                dailyPromptCount: 1,
                activeUsers: { $size: { $ifNull: ["$activeUsers", []] } }
            }
        }
    ]);
}

async function create(explorer: IExplorer) {
    return db.Explorer.create(explorer);
}

async function update(explorer: IExplorer) {
    return db.Explorer.updateOne({ date: explorer.date }, { $set: explorer });
}

async function findByDate(date: number) {
    return db.Explorer.findOne({ date: date });
}

async function findByLatest() {
    return db.Explorer.findOne({}, { _id: 1, date: 1, userCount: 1, promptCount: 1, dailyPromptCount: 1}).sort({ date: -1 });
}