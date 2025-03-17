import cron from "node-cron";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { resolve } from 'path';
import { existsSync } from 'fs';
import Crypto from 'crypto';
import { getWeek } from "date-fns";

// Load both .env files
dotenv.config(); // First load .env

// Check if .env.local exists and load it
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

// Required environment variables
const requiredEnvVars = [
    'MONGODB_URL',
    'SOCIALDATA_API_KEY',
    'OPENAI_API_KEY',
    'DAILY_POOL'
];

// Validate environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

console.log('All required environment variables are present');

// Minimum thresholds
const MINIMUM_SCORE = 30;
const MINIMUM_IMPRESSIONS = 100;
const MINIMUM_RETWEETS = 3;
const MINIMUM_MEANINGFUL_COMMENTS = 10;
const MINIMUM_LIKES = 10;
const MINIMUM_USER_FOLLOWERS = 10;
const MINIMUM_ACCOUNT_AGE_DAYS = 90;
const MINIMUM_USER_TWEETS = 30;
const MINIMUM_CONTENT_WORDS = 100;
const MINIMUM_HASHTAGS = [
    "edith",
    // Add other required hashtags here
];

// Add these constants
const RATE_LIMIT = 120; // requests
const RATE_WINDOW = 60000; // 1 minute in milliseconds
const DAILY_POOL = parseInt(process.env.DAILY_POOL || '0');
// Comment out or remove Redis initialization
// const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Simple in-memory rate limiter
class SimpleRateLimiter {
    constructor(max, windowMs) {
        this.max = max;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    async get({ id }) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        // Clean old requests
        this.requests.set(id, (this.requests.get(id) || []).filter(time => time > windowStart));
        
        const requests = this.requests.get(id) || [];
        const remaining = Math.max(0, this.max - requests.length);
        
        return {
            remaining,
            reset: Math.ceil((windowStart + this.windowMs) / 1000),
        };
    }

    async increment({ id }) {
        const requests = this.requests.get(id) || [];
        requests.push(Date.now());
        this.requests.set(id, requests);
    }
}

// Replace Redis rate limiter with simple in-memory one
const limiter = new SimpleRateLimiter(RATE_LIMIT, RATE_WINDOW);

// Update the rate-limited fetch function
const rateLimitedFetch = async (url, options) => {
    try {
        const limit = await limiter.get({ id: 'social-api' });
        
        if (limit.remaining === 0) {
            const waitTime = Math.ceil((limit.reset * 1000) - Date.now());
            console.log(`Rate limit reached, waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        await limiter.increment({ id: 'social-api' });
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error('Failed to fetch:', error);
        throw error;
    }
};

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL); // Make sure to set this in your .env file
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

function tweetContentModel() {
    const TweetContentSchema = new mongoose.Schema({
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

function userModel() {
    const UserSchema = new mongoose.Schema({
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
            }
        }],
        board: [
            {
                score: {
                    type: Number,
                    default: 0
                },
                rank: {
                    type: Number,
                    default: 0
                }
            }
        ],
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

const startCron = async () => {
    // Connect to MongoDB before starting cron jobs
    await connectDB();
    let evaluateCron = false;

    cron.schedule("0 */6 * * *", async () => {
        evaluateCron = true;
        console.log("Starting tweet content validation");
        const oldUnrewardedContent = await getUnrewardedOldContent();
        await evaluateTweetContent(oldUnrewardedContent);
        evaluateCron = false;
    });

    cron.schedule("0 0 * * *", async () => {
        while (evaluateCron) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Waiting for evaluateCron to be false");
        }
        console.log("This is cron job for distribute reward based on score");
        const unrewardedContent = await getUnrewardedContent();
        await distributeReward(unrewardedContent);
        await setArchivedContent();
    });
}

const distributeReward = async (unrewardedContent) => {
    const session = await mongoose.startSession(); // Start a new transaction session
    try {
        await session.withTransaction(async () => {
            // All database operations here are part of the transaction
            // If any operation fails, all changes are rolled back
            const TweetContent = tweetContentModel();
            const User = userModel();

            // Aggregate scores by user
            const userScores = new Map();
            const userContent = new Map();
            
            for (const doc of unrewardedContent) {
                for (const tweet of doc.content) {
                    if (!tweet.reward && tweet.status === 1) {
                        const email = doc.email;
                        userScores.set(email, (userScores.get(email) || 0) + tweet.score);
                        
                        if (!userContent.has(email)) {
                            userContent.set(email, []);
                        }
                        userContent.get(email).push({
                            tweetId: tweet._id,
                            docId: doc._id
                        });
                    }
                }
            }

            if (userScores.size === 0) {
                console.log('No approved content to distribute rewards');
                return;
            }

            // Convert to array and sort users by total score
            const sortedUsers = Array.from(userScores.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by score descending
                .map(([email, score]) => ({ email, score }));

            const top10Count = Math.ceil(sortedUsers.length * 0.1);
            const next20Count = Math.ceil(sortedUsers.length * 0.2);
            const remaining70Count = sortedUsers.length - top10Count - next20Count;

            // Calculate points per tier
            const top10Pool = DAILY_POOL * 0.7;
            const next20Pool = DAILY_POOL * 0.2;
            const remaining70Pool = DAILY_POOL * 0.1;

            // Distribute rewards
            const rewards = new Map(); // email -> reward amount

            // Top 10% users
            for (let i = 0; i < top10Count; i++) {
                const pointsPerUser = top10Pool / top10Count;
                const email = sortedUsers[i].email;
                rewards.set(email, (rewards.get(email) || 0) + pointsPerUser);
            }

            // Next 20% users
            for (let i = top10Count; i < top10Count + next20Count; i++) {
                const pointsPerUser = next20Pool / next20Count;
                const email = sortedUsers[i].email;
                rewards.set(email, (rewards.get(email) || 0) + pointsPerUser);
            }

            // Bottom 70% users
            for (let i = top10Count + next20Count; i < sortedUsers.length; i++) {
                const pointsPerUser = remaining70Pool / remaining70Count;
                const email = sortedUsers[i].email;
                rewards.set(email, (rewards.get(email) || 0) + pointsPerUser);
            }

            // Process referral bonuses for first-time rewards
            const REFERRAL_BONUS = 10;
            for (const user of sortedUsers) {
                const userDoc = await User.findOne({ 
                    email: user.email,
                    'reward': { 
                        $elemMatch: { 
                            platform: 'twitter',
                            totalReward: { $gt: 0 } 
                        }
                    }
                });

                if (!userDoc?.referralCode) continue;

                // If no previous rewards, process referral bonus
                if (!userDoc) {
                    const referrer = await User.findOne({ inviteCode: userDoc.referralCode });
                    if (referrer) {
                        rewards.set(referrer.email, (rewards.get(referrer.email) || 0) + REFERRAL_BONUS);
                        
                        // Update referrer's invite usage count
                        await User.findByIdAndUpdate(referrer._id, {
                            $inc: { numsOfUsedInviteCode: 1 }
                        });
                    }
                }
            }

            // Update rewards in database
            for (const [email, rewardAmount] of rewards) {
                await User.findOneAndUpdate(
                    { 
                        email,
                        'reward.platform': 'twitter'
                    },
                    {
                        $inc: {
                            'reward.$.totalReward': rewardAmount,
                        },
                        $set: {
                            'board': []                
                        }
                    },
                    {
                        new: true
                    }
                );
            }

            // Mark all content as rewarded
            for (const [email, contents] of userContent) {
                for (const content of contents) {
                    await TweetContent.updateOne(
                        {
                            _id: content.docId,
                            'content._id': content.tweetId
                        },
                        {
                            $set: {
                                'content.$.reward': true
                            }
                        }
                    );
                }
            }

            // Log distribution details
            console.log(`Distributed rewards to ${rewards.size} users`);
            console.log('Top 10% users:', sortedUsers.slice(0, top10Count).map(u => `${u.email}: ${u.score}`));
            console.log('Reward distribution:', Object.fromEntries(rewards));
        });
    } catch (error) {
        console.error('Error distributing rewards:', error);
        throw error;
    } finally {
        session.endSession(); // Always close the session, even if there's an error
    }
};

const getUnrewardedOldContent = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const TweetContent = tweetContentModel();
        const unrewardedContents = await TweetContent.find({
            'content': {
                $elemMatch: {
                    'reward': false,
                    'createdAt': { $lt: sevenDaysAgo },
                    'status': { $ne: 3 }
                }
            }
        });

        return unrewardedContents;
    } catch (error) {
        console.error('Error fetching unrewarded content:', error);
        return [];
    }
}

const getUnrewardedContent = async () => {
    const TweetContent = tweetContentModel();
    const unrewardedContents = await TweetContent.find({
        'content': {
            $elemMatch: {
                'reward': false,
                'status': 2
            }
        }
    });

    return unrewardedContents;
}

const setArchivedContent = async () => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const TweetContent = tweetContentModel();
        const archivedContents = await TweetContent.updateMany(
            {
                'content': {
                    $elemMatch: {
                        'createdAt': { $gte: sevenDaysAgo },
                        'status': 1
                    }
                }
            },
            {
                $set: {
                    'content.$.status': 4  // Use positional $ operator to update matched array elements
                }
            },
            {
                new: true
            }
        );

        return archivedContents;
    } catch (error) {
        console.error('Error fetching archived content:', error);
        return [];
    }
}

const evaluateTweetContent = async (content) => {
    try {
        const TweetContent = tweetContentModel();
        const TaskList = taskListModel();
        const BATCH_SIZE = 10;
        const userTotalScore = new Map();

        for (const doc of content) {
            userTotalScore.set(doc.email, 0);
            // Process tweets in batches
            for (let i = 0; i < doc.content.length; i += BATCH_SIZE) {
                const batch = doc.content.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (tweet) => {
                    if (!tweet.reward && tweet.status === 0) {
                        const socialMetrics = await getSocialMetrics(tweet.url);
                        
                        if (!socialMetrics) return;

                        if (!isValidContent(socialMetrics)) {
                            await updateTweetStatus(TweetContent, doc._id, tweet._id, 3, {base: 0, performance: 0, quality: 0, bonus: 0, total: 0});
                            return;
                        }

                        const llmScore = await calculateLLMScore(socialMetrics.fullText);
                        const authenticityScore = await calculateAuthenticityScore(socialMetrics);

                        const isApproved =
                            llmScore >= MINIMUM_SCORE &&
                            socialMetrics.impressions >= MINIMUM_IMPRESSIONS &&
                            socialMetrics.retweets >= MINIMUM_RETWEETS &&
                            socialMetrics.meaningfulComments >= MINIMUM_MEANINGFUL_COMMENTS &&
                            socialMetrics.likes >= MINIMUM_LIKES &&
                            authenticityScore >= 70 &&
                            socialMetrics.hasAllHashtags &&
                            !isEngagementSuspicious(socialMetrics);

                        const newStatus = isApproved ? 2 : 3;
                        const finalScore = isApproved ? calculateFinalScore(llmScore, socialMetrics, authenticityScore) : {base: 0, performance: 0, quality: 0, bonus: 0, total: 0};
                        const week = getWeek(new Date(tweet.created_at));
                        const year = new Date(tweet.created_at).getFullYear();

                        const taskList = await TaskList.findOne({ year, week });
                        if (taskList) {
                            const weight = taskList.weight;
                            const taskTitle = taskList.title;
                            const isRelatedContent = await checkRelatedContent(socialMetrics.fullText, taskTitle);
                            if (isRelatedContent) {
                                finalScore.total *= weight;
                            }
                        }

                        userTotalScore.set(doc.email, userTotalScore.get(doc.email) + finalScore.total);

                        await updateTweetStatus(TweetContent, doc._id, tweet._id, newStatus, finalScore);
                        console.log(`Evaluated tweet ${tweet.url}: Status=${newStatus}, Score=${finalScore}`);
                    }
                }));

                // Add a small delay between batches to help with rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        const allUsers = await User.find({});

        const allUserScores = allUsers.map(user => ({
            email: user.email,
            score: userTotalScore.get(user.email) || 0
        }));

        allUserScores.sort((a, b) => b.score - a.score);

        let currentRank = 0;
        let previousScore = null;
        let skipCount = 0;

        const updatePromises = allUserScores.map(async (userScore, index) => {
            // If score is different from previous, update rank
            // If same score as previous, keep same rank
            if (previousScore !== userScore.score) {
                currentRank = currentRank + 1;
                previousScore = userScore.score;
                skipCount = 0;
            } else {
                skipCount++;
            }

            return User.findOneAndUpdate(
                { email: userScore.email }, 
                {
                    $push: {
                        board: {
                            score: userScore.score,
                            rank: currentRank
                        }
                    }
                },
                { new: true }
            );
        });

        // Execute all updates
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error in tweet evaluation:', error);
    }
};

const checkRelatedContent = async (fullText, taskTitle) => {
    try {
        const response = await rateLimitedFetch(`https://api.openai.com/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Use a valid OpenAI model
                messages: [{
                    role: "system",
                    content: `You are a content analyzer. Determine if the following content is related to the task title: "${taskTitle}". Respond with only 'yes' or 'no'.`
                }, {
                    role: "user",
                    content: Array.isArray(fullText) ? fullText.join("\n") : fullText
                }],
                temperature: 0.3,
                max_tokens: 5
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from OpenAI');
        }

        const answer = data.choices[0].message.content.trim().toLowerCase();
        return answer === 'yes';
    } catch (error) {
        console.error('Error checking related content:', error);
        return false; // Default to false in case of errors
    }
};

const getSocialMetrics = async (tweetUrl) => {
    try {
        const tweetId = tweetUrl.split("/").pop();
        const response = await rateLimitedFetch(`https://api.socialdata.tools/twitter/thread/${tweetId}`, {
            headers: {
                "Authorization": `Bearer ${process.env.SOCIALDATA_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        const user = data.tweets[0].user;
        const tweetHashTags = [];
        const fullText = [];

        const threadMetrics = data.tweets.reduce(async (metrics, tweet) => {
            metrics.impressions += tweet.views_count || 0;
            metrics.likes += tweet.favorite_count || 0;
            metrics.retweets += tweet.retweet_count || 0;
            metrics.totalWords += (tweet.full_text || tweet.text || "").split(/\s+/).length;
            fullText.push(tweet.full_text || tweet.text || "");

            const comments = await getMeaningfulComments(tweet.id_str);
            metrics.meaningfulComments += comments;
            // Check for required mentions and links in each tweet
            if (tweet.entities?.user_mentions?.some(mention => mention.screen_name === "edithAPP")) {
                metrics.hasRequiredMentions = true;
            }

            // Check URLs in entities
            if (tweet.entities?.urls?.some(url => url.expanded_url?.includes("edithx.ai"))) {
                metrics.hasEdithLink = true;
            }

            const tweetTags = tweet.entities?.hashtags?.map(hashtag =>
                hashtag.text.toLowerCase()
            ) || [];

            tweetHashTags.push(...tweetTags);

            return metrics;
        }, {
            impressions: 0,
            likes: 0,
            retweets: 0,
            totalWords: 0,
            meaningfulComments: 0,
            hasRequiredMentions: false,
            hasEdithLink: false
        });

        // Check if all required hashtags are present in any tweet of the thread
        const hasAllHashtags = MINIMUM_HASHTAGS.every(tag =>
            tweetHashTags.includes(tag.toLowerCase())
        );

        // Calculate account age in days
        const accountAge = Math.floor(
            (new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)
        );

        return {
            impressions: threadMetrics.impressions,
            likes: threadMetrics.likes,
            retweets: threadMetrics.retweets,
            meaningfulComments: threadMetrics.meaningfulComments || 0,
            engagementRate: calculateEngagementRate({
                impressions: threadMetrics.impressions,
                likes: threadMetrics.likes,
                retweets: threadMetrics.retweets,
                meaningfulComments: threadMetrics.meaningfulComments
            }),
            contentWordCount: threadMetrics.totalWords,
            hasRequiredMentions: threadMetrics.hasRequiredMentions,
            hasEdithLink: threadMetrics.hasEdithLink,
            hasAllRequiredHashtags: hasAllHashtags,
            threadLength: data.tweets.length,
            user: {
                followers: user.followers_count,
                accountAgeDays: accountAge,
                tweets: user.statuses_count,
                hasBio: !!user.description,
                hasProfilePic: !!user.profile_image_url_https
            },
            engagementTimeline: await getEngagementTimeline(data.tweets),
            fullText: fullText
        };
    } catch (error) {
        console.error('Error fetching social metrics:', error);
        return null;
    }
};

const getMeaningfulComments = async (tweetId) => {
    const response = await rateLimitedFetch(`https://api.socialdata.tools/twitter/tweets/${tweetId}/comments`, {
        headers: {
            "Authorization": `Bearer ${process.env.SOCIALDATA_API_KEY}`,
            "Content-Type": "application/json"
        }
    });
    const data = await response.json();
    const comments = data.tweets.filter(comment => (comment.full_text || comment.text || "").split(/\s+/).length > 10);
    return comments.length;
};

const calculateLLMScore = async (content) => {
    try {
        // Call OpenAI or your preferred LLM API to analyze content
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{
                    role: "system",
                    content: "You are a content quality analyzer. Score the following content from 0-100 based on: originality (40%), relevance (30%), and complexity (30%). Respond with only the numeric score."
                }, {
                    role: "user",
                    content: content.join("\n")
                }],
                temperature: 0.3,
                max_tokens: 5
            })
        });

        const data = await response.json();

        // Extract numeric score from response
        const score = parseInt(data.choices[0].message.content.trim());

        // Validate score is within bounds
        if (isNaN(score) || score < 0 || score > 100) {
            console.error('Invalid LLM score received:', data.choices[0].message.content);
            return 0;
        }

        return score;
    } catch (error) {
        console.error('Error calculating LLM score:', error);
        return 0;
    }
};

const calculateAuthenticityScore = async (metrics) => {
    try {
        let score = 0;
        const weights = {
            accountAge: 20,
            engagement: 25,
            profile: 20,
            content: 20,
            thread: 15
        };

        // Account age score (max 20)
        const ageScore = Math.min(metrics.user.accountAgeDays / MINIMUM_ACCOUNT_AGE_DAYS, 1) * weights.accountAge;

        // Engagement quality score (max 25)
        const engagementScore = calculateEngagementQualityScore(metrics) * weights.engagement;

        // Profile completeness score (max 20) - Updated to be more strict
        const profileScore = ((metrics.user.hasBio ? 0.5 : 0) +
            (metrics.user.hasProfilePic ? 0.5 : 0)) * weights.profile;

        // Content quality score (max 20)
        const contentScore = (
            (metrics.contentWordCount >= MINIMUM_CONTENT_WORDS ? 0.5 : 0) +
            (metrics.hasRequiredMentions ? 0.25 : 0) +
            (metrics.hasEdithLink ? 0.25 : 0)
        ) * weights.content;

        // Thread quality score (max 15)
        const threadScore = Math.min(metrics.threadLength / 5, 1) * weights.thread;

        score = ageScore + engagementScore + profileScore + contentScore + threadScore;
        return Math.floor(score);
    } catch (error) {
        console.error('Error calculating authenticity score:', error);
        return 0;
    }
};

const isValidContent = (metrics) => {
    // First check account validity
    const isValidAccount = (
        metrics.user.accountAgeDays >= MINIMUM_ACCOUNT_AGE_DAYS &&
        metrics.user.followers >= MINIMUM_USER_FOLLOWERS &&
        metrics.user.tweets >= MINIMUM_USER_TWEETS &&
        metrics.user.hasBio &&          // Must have bio
        metrics.user.hasProfilePic      // Must have profile picture
    );

    // If account is not valid, log the reason
    if (!isValidAccount) {
        console.log('Account validation failed:', {
            email: metrics.email,
            reasons: {
                accountAge: metrics.user.accountAgeDays < MINIMUM_ACCOUNT_AGE_DAYS ? 
                    `Account age ${metrics.user.accountAgeDays} days < required ${MINIMUM_ACCOUNT_AGE_DAYS} days` : null,
                followers: metrics.user.followers < MINIMUM_USER_FOLLOWERS ?
                    `Followers ${metrics.user.followers} < required ${MINIMUM_USER_FOLLOWERS}` : null,
                tweets: metrics.user.tweets < MINIMUM_USER_TWEETS ?
                    `Tweet count ${metrics.user.tweets} < required ${MINIMUM_USER_TWEETS}` : null,
                bio: !metrics.user.hasBio ? 'Missing bio' : null,
                profilePic: !metrics.user.hasProfilePic ? 'Missing profile picture' : null
            }
        });
        return false;
    }

    // Then check content validity
    return (
        metrics.contentWordCount >= MINIMUM_CONTENT_WORDS &&
        metrics.hasRequiredMentions &&
        metrics.hasEdithLink &&
        metrics.hasAllRequiredHashtags &&
        metrics.threadLength >= 1
    );
};

const isEngagementSuspicious = (metrics) => {
    const engagementTimeline = metrics.engagementTimeline;
    const SUSPICIOUS_THRESHOLD = 100;  // Matches requirement for 100 likes in 5 minutes
    const TIME_WINDOW_MINUTES = 5;     // Matches 5-minute window requirement

    // Enhanced bot detection
    if (metrics.user.followers < MINIMUM_USER_FOLLOWERS ||
        metrics.user.accountAgeDays < MINIMUM_ACCOUNT_AGE_DAYS) {
        return true;
    }

    // Check for suspicious engagement patterns
    for (let i = 1; i < engagementTimeline.length; i++) {
        const timeDiff = (engagementTimeline[i].timestamp - engagementTimeline[i - 1].timestamp) / (1000 * 60);
        const likeDiff = engagementTimeline[i].likes - engagementTimeline[i - 1].likes;
        const retweetDiff = engagementTimeline[i].retweets - engagementTimeline[i - 1].retweets;

        if (timeDiff <= TIME_WINDOW_MINUTES &&
            (likeDiff >= SUSPICIOUS_THRESHOLD || retweetDiff >= SUSPICIOUS_THRESHOLD)) {
            return true;
        }
    }

    return false;
};

const calculateFinalScore = (llmScore, socialMetrics, authenticityScore) => {
    try {
        // Base Points (5 points)
        const basePoints = 5;

        // Performance Points (0-50 points)
        const performancePoints = calculatePerformancePoints(socialMetrics);

        // Quality Points from LLM (0-30 points)
        const qualityPoints = Math.floor(llmScore * 0.3); // Convert 0-100 LLM score to 0-30 range

        // Bonus Points (10-50 points)
        const bonusPoints = calculateBonusPoints(socialMetrics, llmScore, authenticityScore);

        const totalScore = basePoints + performancePoints + qualityPoints + bonusPoints;

        console.log(`Score Breakdown:
            Base Points: ${basePoints}
            Performance Points: ${performancePoints}
            Quality Points: ${qualityPoints}
            Bonus Points: ${bonusPoints}
            Total Score: ${totalScore}
        `);

        return {base: 5, performance: performancePoints, quality: qualityPoints, bonus: bonusPoints, total: totalScore};
    } catch (error) {
        console.error('Error calculating final score:', error);
        return {base: 0, performance: 0, quality: 0, bonus: 0, total: 0};
    }
};

const calculatePerformancePoints = (metrics) => {
    try {
        let points = 0;

        // Engagement metrics scoring (0-30 points)
        const engagementScore = Math.min(30, Math.floor(metrics.engagementRate * 10));
        points += engagementScore;

        // Reach metrics scoring (0-20 points)
        const reachMultiplier = 20 / MINIMUM_IMPRESSIONS;
        const reachScore = Math.min(20, Math.floor(metrics.impressions * reachMultiplier));
        points += reachScore;

        return points;
    } catch (error) {
        console.error('Error calculating performance points:', error);
        return 0;
    }
};

const calculateBonusPoints = (metrics, llmScore, authenticityScore) => {
    try {
        let bonusPoints = 0;

        // Viral post bonus (up to 25 points)
        if (metrics.impressions > MINIMUM_IMPRESSIONS * 10) {
            bonusPoints += 25;
        } else if (metrics.impressions > MINIMUM_IMPRESSIONS * 5) {
            bonusPoints += 15;
        }

        // High-quality content bonus (up to 15 points)
        if (llmScore > 90) {
            bonusPoints += 15;
        } else if (llmScore > 80) {
            bonusPoints += 10;
        }

        // High authenticity bonus (up to 10 points)
        if (authenticityScore > 90) {
            bonusPoints += 10;
        } else if (authenticityScore > 80) {
            bonusPoints += 5;
        }

        return Math.min(50, bonusPoints); // Cap bonus points at 50
    } catch (error) {
        console.error('Error calculating bonus points:', error);
        return 0;
    }
};

const updateTweetStatus = async (TweetContent, docId, tweetId, status, score) => {
    await TweetContent.updateOne(
        {
            _id: docId,
            "content._id": tweetId
        },
        {
            $set: {
                "content.$.status": status,
                "content.$.score": score.total,
                "content.$.base": score.base,
                "content.$.performance": score.performance,
                "content.$.quality": score.quality,
                "content.$.bonus": score.bonus
            }
        }
    );
};

const getEngagementTimeline = async (tweets) => {
    return tweets.map(tweet => ({
        timestamp: new Date(tweet.created_at).getTime(),
        likes: tweet.favorite_count,
        retweets: tweet.retweet_count,
        impressions: tweet.views_count
    })).sort((a, b) => a.timestamp - b.timestamp);
};

const calculateEngagementRate = (metrics) => {
    try {
        const totalEngagements = metrics.likes + metrics.retweets + metrics.meaningfulComments;
        if (metrics.impressions === 0) return 0;

        const engagementRate = (totalEngagements / metrics.impressions) * 100;
        return Math.round(engagementRate * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error('Error calculating engagement rate:', error);
        return 0;
    }
};

startCron().catch(console.error);