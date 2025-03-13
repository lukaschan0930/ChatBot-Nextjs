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
    logins: number;
    role: string;
    reward: {
        platform: string;
        totalReward: number;
        availableReward: number;
        createdAt: Date;
    }[];
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
        reward: [{
            platform: {
                type: String,
                required: true
            },
            totalReward: {
                type: Number,
                default: 0
            },
            availableReward: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }],
        role: {
            type: String,
            default: "user"
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
                default: 1
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

export default db;