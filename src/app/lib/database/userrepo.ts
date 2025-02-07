import db from "./db";
import { IUser } from "../interface";
import crypto from 'crypto';

export const UserRepo = {
    authenticate,
    findByEmail,
    create,
    findByInviteCode,
    findById,
    generateInviteCode,
    createUniqueInviteCode,
}

async function authenticate(email: string, password: string) {
    const user = await db.User.findOne({ email });
    if (!user) {
        return null;
    }
    const isAuthenticated = user.authenticate(password);
    if (!isAuthenticated) {
        return null;
    }

    if (!user.verify) {
        return null;
    }
    return user;
}

async function findByEmail(email: string) {
    return db.User.findOne({ email });
}

async function create(user: IUser) {
    return db.User.create(user);
}

async function findByInviteCode(code: string) {
    return db.User.findOne({ inviteCode: code });
}

async function findById(id: string) {
    return db.User.findById(id);
}

function generateInviteCode() {
    return crypto.randomBytes(3).toString('hex').toUpperCase(); // Generates 6 hex characters
}

async function createUniqueInviteCode() {
    const code = generateInviteCode();
    const user = await db.User.findOne({ inviteCode: code });
    if (user) {
        return createUniqueInviteCode();
    }
    return code;
}