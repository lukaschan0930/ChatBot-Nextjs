import cron from 'node-cron';
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import Crypto from 'crypto';
import dotenv from "dotenv";
import { resolve } from 'path';
import { existsSync } from 'fs';

dotenv.config(); 

const envLocalPath = resolve(process.cwd(), '.env.local');
if (existsSync(envLocalPath)) {
    dotenv.config({
        path: envLocalPath,
        override: true
    });
    console.log('.env.local found and loaded');
} else {
    console.log('.env.local not found, using only .env');
}

const User = (function userModel() {
    const UserSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        password: {
            type: String
        },
        inviteCode: {
            type: String,
            required: true
        },
        referralCode: {
            type: String,
        },
        numsOfUsedInviteCode: {
            type: Number,
            default: 0
        },
        loginType: {
            type: String,
            default: "manual"
        },
        twitterId: {
            type: String,
            default: ""
        },
        thumbnail: {
            type: String,
            default: ""
        },
        name: {
            type: String,
            default: ""
        },
        avatar: {
            type: String
        },
        api: {
            type: String,
            default: ""
        },
        verify: {
            type: Boolean,
            default: false
        },
        lastLogin: { // lastest login time
            type: Date,
            default: Date.now()
        },
        logins: { // login number
            type: Number,
            default: 0
        },
        wallet: {
            type: String,
            default: ""
        },
        chatPoints: {
            type: Number,
            default: 0
        },
        workerPoints: {
            type: Number,
            default: 0
        },
        isNodeAdded: {
            type: Boolean,
            default: false
        },
        nodeConnectedTime: { // last active session timestamp
            type: Date,
            default: null
        },
        nodeRewardHash: {
            type: String,
            default: ""
        },
        role: {
            type: String,
            default: "user"
        },
        jumpReward: {
            jumpUserId: {
                type: String,
            },
            jumpTransactionId: {
                type: String
            },
            isReward: {
                type: Boolean,
                default: false
            }
        },
        disableModel: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'AI',
            default: []
        },
        pointsUsed: {
            type: Number,
            default: 0
        },
        pointsResetDate: {
            type: Date,
            default: null
        },
        currentplan: {
            type: Schema.Types.ObjectId,
            ref: 'Plan',
            default: null
        },
        requestPlanId: {
            type: Schema.Types.ObjectId,
            ref: 'Plan',
            default: null
        },
        planStartDate: {
            type: Date,
            default: null
        },
        planEndDate: {
            type: Date,
            default: null
        },
        subscriptionId: {
            type: String,
            default: null
        },
        stripeCustomerId: {
            type: String,
            default: null
        },
        salt: {
            type: String
        },
    }, {
        timestamps: true
    });

    // Add virtual population
    UserSchema.virtual('plan', {
        ref: 'Plan',
        localField: 'currentplan',
        foreignField: '_id',
        justOne: true
    });

    // Enable virtuals in toJSON and toObject
    UserSchema.set('toJSON', { virtuals: true });
    UserSchema.set('toObject', { virtuals: true });

    // Define the hashPassword method
    UserSchema.methods.hashPassword = function (password) {
        return Crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
    };

    // Compared hased password from user with database's password so if exist, then res is true, not false
    UserSchema.methods.authenticate = function (password) {
        return this.password === this.hashPassword(password);
    };

    UserSchema.pre('save', function (next) {
        if (this.isModified('password')) {
            this.salt = Crypto.randomBytes(16).toString('base64');
            this.password = this.hashPassword(this.password);
        }
        next();
    });

    return mongoose.models.User || mongoose.model('User', UserSchema);
})(); // Immediately invoke the function to get the model

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/edith-chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Schedule the job to run every day at midnight
cron.schedule('0 * * * *', async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all users where pointsResetDate matches today OR is null
        const usersToReset = await User.find({
            $or: [
                {
                    pointsResetDate: {
                        $gte: today,
                        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                },
                {
                    pointsResetDate: null
                }
            ]
        });

        // Reset pointsUsed to 0 for all matching users
        for (const user of usersToReset) {
            user.pointsUsed = 0;
            user.pointsResetDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
            await user.save();
        }

        console.log(`Reset pointsUsed for ${usersToReset.length} users`);
    } catch (error) {
        console.error('Error in resetPoints cron job:', error);
    }
});

console.log('Points reset cron job scheduled');