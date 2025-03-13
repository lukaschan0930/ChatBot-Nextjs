import db from "./db";
import { ITweetContent, ITweetContentItem } from "../interface";

export const TweetContentRepo = {
    create,
    findByEmail,
    update,
}

async function create(tweetContent: ITweetContent) {
    return db.TweetContent.create(tweetContent);
}

async function findByEmail(email: string) {
    return db.TweetContent.findOne({ email })
        .select('content')
        .sort({ 'content.createdAt': -1 })
        .exec();
}

async function update(email: string, content: ITweetContentItem[]) {
    return db.TweetContent.updateOne({ email }, { $set: { content } });
}
