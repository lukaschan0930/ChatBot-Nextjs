import db from "./db";
import { IRouterChatHistory } from "../interface";

export const RouterRepo = {
    createRouterChat,
    getRouterChat,
    updateRouterChat,
    deleteRouterChat
}

type RouterChat = {
    email: string;
    session: IRouterChatHistory[];
}   

async function createRouterChat(email: string, routerChat: IRouterChatHistory[]) {
    return db.RouterChat.create({
        email: email,
        session: routerChat
    });
}

async function getRouterChat(email: string) {
    return db.RouterChat.findOne<RouterChat>({ email: email });
}

async function updateRouterChat(email: string, routerChat: IRouterChatHistory[]) {
    try {
        // First validate the data
        if (!email || !routerChat) {
            throw new Error("Invalid input: email and roboChat are required");
        }

        // Use findOneAndUpdate with proper options
        const result = await db.RouterChat.findOneAndUpdate(
            { email: email },
            { 
                $set: { 
                    session: routerChat,
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
            throw new Error("Failed to update RouterChat");
        }

        return result;
    } catch (error) {
        console.error("Error in updateRouterChat:", error);
        throw error;
    }
}

async function deleteRouterChat(email: string) {
    return db.RouterChat.deleteOne({ email: email });
}
