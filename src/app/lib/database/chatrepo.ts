import { ChatHistory } from "../interface";
import db from "./db";

export const ChatRepo = {
    findHistoryByEmail,
    updateHistory,
    create,
}

async function findHistoryByEmail(email: string) {
    return db.Chat.findOne({ email });
}

async function updateHistory(email: string, chatHistory: { session: ChatHistory[] }) {
    return db.Chat.updateOne({ email }, { $set: { session: chatHistory.session } });
}

async function create(chatHistory: { email: string, session: ChatHistory[] }) {
    return db.Chat.create(chatHistory);
}
