import { OpenAI } from "openai";
import FirecrawlApp from '@mendable/firecrawl-js';
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { Pinecone } from '@pinecone-database/pinecone';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY!,
});

export const cerebras = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY!,
    baseURL: process.env.CEREBRAS_BASE_URL!,
});

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});