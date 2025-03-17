import db from "./db";

export const TaskListRepo = {
    findAll,
    create,
    deleteLog,
    update,
    findById
}

async function findAll() {
    return db.TaskList.find();
}

async function create(taskList: { title: string, year: number, month: number, week: number, weight: number }) {
    const task = await db.TaskList.findOne({ year: taskList.year, month: taskList.month, week: taskList.week });
    if (task) {
        return task;
    }
    return db.TaskList.create(taskList);
}

async function deleteLog(id: string) {
    return db.TaskList.deleteOne({ _id: id });
}

async function update(id: string, taskList: { title: string, year: number, month: number, week: number, weight: number }) {
    return db.TaskList.updateOne({ _id: id }, { $set: taskList });
}

async function findById(id: string) {
    return db.TaskList.findById(id);
}