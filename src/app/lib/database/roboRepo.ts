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
    try {
        // First validate the data
        if (!email || !roboChat) {
            throw new Error("Invalid input: email and roboChat are required");
        }

        // Use findOneAndUpdate with proper options
        const result = await db.RoboChat.findOneAndUpdate(
            { email: email },
            { 
                $set: { 
                    session: roboChat,
                    updatedAt: new Date()
                } 
            },
            { 
                new: true, 
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        if (!result) {
            throw new Error("Failed to update RoboChat");
        }

        return result;
    } catch (error) {
        console.error("Error in updateRoboChat:", error);
        throw error;
    }
}

async function deleteRoboChat(email: string) {
    return db.RoboChat.deleteOne({ email: email });
}
