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
    return db.Explorer.find();
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
    return db.Explorer.findOne().sort({ date: -1 });
}