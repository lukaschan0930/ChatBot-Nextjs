import { NextRequest, NextResponse } from "next/server";
import { compact } from 'lodash-es';
import { trimPrompt } from '@/app/lib/api/helper';
import { openai, firecrawl } from '@/app/lib/api/openai/const';

export async function POST(request: NextRequest) {
    const { title } = await request.json();
    try {
        const queryResult = await generateSearchQuery(title);
        console.log('Query Result:', queryResult);
        
        // Check if queries exist and is an array
        if (!queryResult?.queries || !Array.isArray(queryResult.queries)) {
            return NextResponse.json({ error: "Failed to generate search queries" }, { status: 400 });
        }

        const results = await Promise.all(queryResult.queries.map(async (query: string) => {
            const result = await firecrawl.search(query, {
                timeout: 15000,
                limit: 1,
                scrapeOptions: { formats: ['markdown'] },
            });
            
            // Add null checks for result.data
            if (!result?.data) {
                return { urls: [], contents: [], images: [], titles: [] };
            }

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
        console.error('Error in search resources:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

const generateSearchQuery = async (title: string) => {
    try {
        const prompt = `
        Given the following prompt from the user, 
        generate a list of SERP queries to research the topic. 
        Return a maximum of 2 queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other.
        Prompt: ${title}
        Return the queries in a JSON format like this: {"queries": ["query1", "query2"]}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) {
            throw new Error('No content in OpenAI response');
        }

        const parsed = JSON.parse(content);
        if (!parsed?.queries || !Array.isArray(parsed.queries)) {
            return { queries: [] }; // Return empty array as fallback
        }

        return parsed;
    } catch (error) {
        console.error('Error generating search query:', error);
        return { queries: [] }; // Return empty array on error
    }
}
