import db from "./db";

export const ErrorLogRepo = {
    create,
    findAll,
    findByUserId,
    findByErrorType,
    findRecent,
    deleteOld
};

async function create(errorLog: {
    errorType: string;
    message: string;
    stack?: string;
    userId?: string;
    userEmail?: string;
    context?: any;
    metadata?: any;
}) {
    return db.ErrorLog.create({
        errorType: errorLog.errorType,
        message: errorLog.message,
        stack: errorLog.stack || 'No stack trace available',
        userId: errorLog.userId,
        userEmail: errorLog.userEmail,
        context: errorLog.context,
        metadata: errorLog.metadata,
        createdAt: new Date()
    });
}

async function findAll(limit: number = 100) {
    return db.ErrorLog.find()
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .limit(limit);
}

async function findByUserId(userId: string, limit: number = 50) {
    return db.ErrorLog.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
}

async function findByErrorType(errorType: string, limit: number = 50) {
    return db.ErrorLog.find({ errorType })
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .limit(limit);
}

async function findRecent(hours: number = 24, limit: number = 100) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db.ErrorLog.find({ createdAt: { $gte: since } })
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .limit(limit);
}

async function deleteOld(daysOld: number = 30) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    return db.ErrorLog.deleteMany({ createdAt: { $lt: cutoffDate } });
} 