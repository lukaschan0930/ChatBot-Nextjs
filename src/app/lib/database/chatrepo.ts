import { ChatHistory } from "../interface";
import db from "./db";

export const ChatRepo = {
    findHistoryByEmail,
    updateHistory,
    create,
    getFullHistory,
    getFullHistroyWithSessions,
    findLogByEmail
}

async function findHistoryByEmail(email: string) {
    return db.Chat.findOne({ email }, { session: { title: 1, id: 1, chats: { timestamp: 1 } }, _id: 1, email: 1 });
}

async function findLogByEmail(email: string, sessionId: string) {
    return db.Chat.aggregate([
        { $match: { email } },
        {
            $project: {
                email: 1,
                _id: 1,
                session: {
                    $filter: {
                        input: "$session",
                        as: "session",
                        cond: { $eq: ["$$session.id", sessionId] }
                    }
                }
            }
        }
    ]);
}

async function updateHistory(email: string, chatHistory: { session: ChatHistory[] }) {
    return db.Chat.updateOne({ email }, { $set: { session: chatHistory.session } });
}

async function create(chatHistory: { email: string, session: ChatHistory[] }) {
    return db.Chat.create(chatHistory);
}

async function getFullHistory() {
    return db.Chat.find();
}

async function getFullHistroyWithSessions() {
    return db.Chat.aggregate([
        {
            $project: {
                sessionLength: { $size: { $ifNull: ["$session", []] } }
            }
        }
    ]);
}
