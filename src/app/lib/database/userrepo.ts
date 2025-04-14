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
    getByTwitterId,
    updateTwitterId,
    getTwitterUserCount,
    getTopBoardUsers,
    updateJumpRewardState,
    findByJumpUserId,
    findByWallet,
    findByWalletWithoutUser,
    updateUserProfileWithEmail,
    count,
    getFullUser,
    getFullUserWithChatPoints,
    updateWorkerPoints,
}

async function findByWalletWithoutUser(wallet: string, email: string) {
    return db.User.findOne({ wallet, email: { $ne: email } });
}

async function findByWallet(wallet: string) {
    return db.User.findOne({ wallet });
}

async function findByJumpUserId(userId: string) {
    return db.User.findOne({ "jumpReward.jumpUserId": userId });
}

async function updateTwitterId(email: string, twitterId: string) {
    return db.User.findOneAndUpdate({ email }, { twitterId });
}

async function updateJumpRewardState(email: string) {
    return db.User.findOneAndUpdate(
        { email }, 
        { $set: { "jumpReward.isReward": true } },
        { upsert: true }
    );
}

async function getByTwitterId(id: string) {
    return db.User.findOne({ twitterId: id });
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

async function getTwitterUserCount() {
    const count = await db.User.countDocuments({
        twitterId: { $ne: "" }
    });
    return count;
};

async function getTopBoardUsers() {
    const topUsers = await db.User.aggregate([
        { $match: { "board.0": { $exists: true } } },
        {
            $addFields: {
                lastBoard: { 
                    $arrayElemAt: ["$board", -1] 
                }
            }
        },
        { $sort: { "lastBoard.rank": 1 } },
        { $limit: 5 },
        {
            $project: {
                name: 1,
                email: 1,
                rank: "$lastBoard.rank",
                score: "$lastBoard.score"
            }
        }
    ]);
    return topUsers;
};

async function updateUserProfileWithEmail(email: string, name: string, avatar: string, wallet: string, chatPoints: number, workerPoints: number, isNodeConnected: boolean, isNodeAdded: boolean) {
    return db.User.findOneAndUpdate({ email }, { name, avatar, wallet, chatPoints, workerPoints, isNodeConnected, isNodeAdded }, { upsert: true });
}

async function count() {
    return db.User.countDocuments();
}

async function getFullUser() {
    return db.User.find();
}

async function getFullUserWithChatPoints() {
    return db.User.find({chatPoints: {$gt: 0}}).select('email chatPoints');
}

async function updateWorkerPoints(email: string, workerPoints: number, nodeRewardHash: string) {
    return db.User.findOneAndUpdate({ email }, { workerPoints, nodeRewardHash, nodeConnectedTime: new Date() }, { upsert: true });
}