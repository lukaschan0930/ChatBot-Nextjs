import mongoose, { Document, Schema } from 'mongoose';
import Crypto from 'crypto';

interface IUser extends Document {
    email: string;
    password: string;
    salt: string;
    hashPassword(password: string): string;
    inviteCode: string;
    referralCode: string;
    numsOfUsedInviteCode: number;
    loginType: string;
    twitterId: string;
    thumbnail: string;
    name: string;
    avatar: string;
    api: string;
    verify: boolean;
    lastLogin: Date;
    lastActiveSession: Date;
    logins: number;
    wallet: string;
    chatPoints: number;
    workerPoints: number;
    role: string;
    isNodeAdded: boolean;
    nodeConnectedTime: Date;
    nodeRewardHash: string;
    jumpReward: {
        jumpUserId: string,
        jumpTransactionId: string,
        isReward: boolean
    }
    pointsUsed: number;
    pointResetDate: Date;
    currentplan: mongoose.Schema.Types.ObjectId;
    disableModel: mongoose.Schema.Types.ObjectId[];
}

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/edith-chatapp')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
mongoose.Promise = global.Promise;

const db = {
    User: userModel(),
    Chat: chatModel(),
    ChangeLog: changeLogModel(),
    TweetContent: tweetContentModel(),
    TaskList: taskListModel(),
    Admin: adminModel(),
    Explorer: explorerModel(),
    RoboChat: roboChatModel(),
    RouterChat: routerChatModel(),
    Plan: planModel(),
    AI: aiModel()
}

function userModel() {
    const UserSchema = new Schema<IUser>({
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
        pointsUsed: {
            type: Number,
            default: 0
        },
        pointResetDate: {
            type: Date,
            default: null
        },
        currentplan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Plan',
            default: null
        },
        disableModel: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'AI',
            default: []
        },
        salt: {
            type: String
        }
    }, {
        timestamps: true
    });

    // Define the hashPassword method
    UserSchema.methods.hashPassword = function (password: string): string {
        return Crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('base64');
    };

    // Compared hased password from user with database's password so if exist, then res is true, not false
    UserSchema.methods.authenticate = function (password: string) {
        return this.password === this.hashPassword(password);
    };

    UserSchema.pre<IUser>('save', function (next) {
        if (this.isModified('password')) {
            this.salt = Crypto.randomBytes(16).toString('base64');
            this.password = this.hashPassword(this.password);
        }
        next();
    });

    return mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
}

function chatModel() {
    const ChatSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        session: [{
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
            },
            chats: [{
                prompt: {
                    type: String,
                    required: true
                },
                response: {
                    type: String,
                },
                timestamp: {
                    type: Number,
                    required: true,
                },
                inputToken: {
                    type: Number
                },
                outputToken: {
                    type: Number
                },
                inputTime: {
                    type: Number
                },
                outputTime: {
                    type: Number,
                },
                totalTime: {
                    type: Number,
                },
                chatType: {
                    type: Number,
                    required: true
                },
                datasource: {
                    type: Boolean,
                    required: true
                },
                fileUrls: [{
                    type: String,
                }]
            }]
        }],

        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }, {
        timestamps: true
    });

    return mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
}

function roboChatModel() {
    const RoboChatSchema = new Schema({
        email: {
            type: String,
            required: true  
        },
        session: [{
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
            },
            llamaCoderVersion: {
                type: String,
                required: true,
                default: "v2"
            },
            shadcn: {
                type: Boolean,
                required: true,
            },
            chats: [{
                model: {
                    type: String,
                },
                quality: {
                    type: String,
                },
                prompt: {
                    type: String,
                },
                role: {
                    type: String,
                    required: true
                },
                content: {
                    type: String,
                    required: true,
                    default: ""
                },
                position: {
                    type: Number,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now()
                }
            }],
            createdAt: {
                type: Date,
                default: Date.now()
            },
            timestamp: {
                type: Number,
            }
        }]
    }, {
        timestamps: true
    });

    return mongoose.models.RoboChat || mongoose.model('RoboChat', RoboChatSchema);
}

function routerChatModel() {
    const RouterChatSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        session: [{
            id: {
                type: String,
                required: true,
            },
            title: {
                type: String,
            },
            chats: [{
                prompt: {
                    type: String,
                    required: true
                },
                model: {
                    type: String,
                    required: true
                },
                response: {
                    type: String,
                },
                timestamp: {
                    type: Number,
                    required: true,
                },
                inputToken: {
                    type: Number
                },
                outputToken: {
                    type: Number
                },
                points: {
                    type: Number,
                    required: true,
                    default: 0
                }
            }]
        }],
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }, {
        timestamps: true
    });

    return mongoose.models.RouterChat || mongoose.model('RouterChat', RouterChatSchema);
}

function tweetContentModel() {
    const TweetContentSchema = new Schema({
        email: {
            type: String,
            required: true
        },
        content: [{
            title: {
                type: String,
                required: true,
            },
            url: {
                type: String
            },
            status: {
                type: Number,
                required: true,
                default: 0
            },
            score: {
                type: Number,
                required: true,
                default: 0
            },
            base: {
                type: Number,
                required: true,
                default: 0
            },
            performance: {
                type: Number,
                required: true,
                default: 0
            },
            quality: {
                type: Number,
                required: true,
                default: 0
            },
            bonus: {
                type: Number,
                required: true,
                default: 0
            },
            reward: {
                type: Boolean,
                required: true,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now()
            },
            postedAt: {
                type: Date,
                default: Date.now()
            }
        }],
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }, {
        timestamps: true
    });

    return mongoose.models.TweetContent || mongoose.model('TweetContent', TweetContentSchema);
}

function changeLogModel() {
    const ChangeLogSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        article: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }, {
        timestamps: true
    });

    return mongoose.models.ChangeLog || mongoose.model('ChangeLog', ChangeLogSchema);
}

function taskListModel() {
    const TaskListSchema = new Schema({
        title: {
            type: String,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        month: {
            type: Number,
            required: true
        },
        week: {
            type: Number,
            required: true
        },
        weight: {
            type: Number,
            required: true,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }, {
        timestamps: true
    });

    return mongoose.models.TaskList || mongoose.model('TaskList', TaskListSchema);
}

function adminModel() {
    const AdminSchema = new Schema({
        systemPrompt: {
            type: String,
            required: true
        },
        totalNode: {
            type: Number,
            required: true,
            default: 19739
        }
    });

    return mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
}

function explorerModel() {
    const ExplorerSchema = new Schema({
        date: {
            type: Number,
            required: true
        },
        userCount: {
            type: Number,
            required: true
        },
        promptCount: {
            type: Number,
            required: true
        },
        dailyPromptCount: {
            type: Number,
            required: true
        },
        activeUsers: {
            type: [String],
            required: true
        }
    });

    return mongoose.models.Explorer || mongoose.model('Explorer', ExplorerSchema);
}

function planModel() {
    const PlanSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        features: {
            type: [String],
            required: true
        },
        isYearlyPlan: {
            type: Boolean,
            required: true,
            default: false
        },
        priceId: {
            type: String,
            required: true
        },
        productId: {
            type: String,
            required: true
        },
        points: {
            type: Number,
            required: true
        },
        bonusPoints: {
            type: Number,
            required: true,
            default: 0
        },
        disableModel: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'AI',
            required: true,
            default: []
        }
    });

    return mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
}

function aiModel() {
    const AiSchema = new Schema({
        name: {
            type: String,
            required: true
        },
        inputCost: {
            type: Number,
            required: true
        },
        outputCost: {
            type: Number,
            required: true
        },
        multiplier: {
            type: Number,
            required: true
        }
    });

    return mongoose.models.Ai || mongoose.model('Ai', AiSchema);
}

export default db;