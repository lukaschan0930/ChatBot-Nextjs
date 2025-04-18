import db from "./db";
import { IRoboChatHistory } from "../interface";

export const RoboRepo = {
    createRoboChat,
    getRoboChat,
    updateRoboChat,
    deleteRoboChat
}

type RoboChat = {
    email: string;
    session: IRoboChatHistory[];
}   

async function createRoboChat(email: string, roboChat: IRoboChatHistory[]) {
    return db.RoboChat.create({
        email: email,
        session: roboChat
    });
}

async function getRoboChat(email: string) {
    return db.RoboChat.findOne<RoboChat>({ email: email });
}

async function updateRoboChat(email: string, roboChat: IRoboChatHistory[]) {
    return db.RoboChat.updateOne({ email: email }, { $set: { session: roboChat } });
}

async function deleteRoboChat(email: string) {
    return db.RoboChat.deleteOne({ email: email });
}
