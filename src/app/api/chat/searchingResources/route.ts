import { NextRequest, NextResponse } from "next/server";
import { compact } from 'lodash-es';
import { trimPrompt } from '@/app/lib/api/helper';
import { openai, firecrawl } from '@/app/lib/api/openai/const';

export async function POST(request: NextRequest) {
    const { title } = await request.json();
    try {
        const queryResult = await generateSearchQuery(title);
        console.log(queryResult);
        const results = await Promise.all(queryResult.queries.map(async (query: string) => {
            const result = await firecrawl.search(query, {
                timeout: 15000,
                limit: 2,
                scrapeOptions: { formats: ['markdown'] },
            });
            const titles = compact(result.data.map(item => item.metadata?.title));
            const newUrls = compact(result.data.map(item => item.url));
            const contents = compact(result.data.map(item => item.markdown)).map(
                content => trimPrompt(content, 25_000),
            );
            const images = compact(result.data.map(item => item.metadata?.ogImage));
            return { urls: newUrls, contents, images, titles };
        }));
        return NextResponse.json({ results });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

const generateSearchQuery = async (title: string) => {
    const prompt = `
    Given the following prompt from the user, 
    generate a list of SERP queries to research the topic. 
    Return a maximum of 2 queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other.
    Prompt: ${title}
    Return the queries in a JSON array format for example: ["query1", "query2", "query3"]
    `;
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });
    const queries = JSON.parse(response.choices[0].message.content || "[]");
    return queries;
}
