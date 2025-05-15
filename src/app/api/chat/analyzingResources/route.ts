import { NextRequest, NextResponse } from 'next/server';
import { ISource } from '@/app/lib/interface';
import { openai } from '@/app/lib/api/openai/const';

export async function POST(request: NextRequest) {
    const { sources, title } = await request.json();
    try {
        const { learnings, usage } = await generateLearnings(sources, title);
        const learningDatas = learnings.learnings.length > 0 ? learnings.learnings : sources.map((source: ISource) => source.content);
        console.log("learningDatas", learningDatas);
        return NextResponse.json({ learningDatas, usage });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

const generateLearnings = async (sources: ISource[], title: string) => {
    const prompt = `Given the following contents from this topic <topic>${title}</topic>, 
    generate a list of learnings from the contents. 
    \n\n<contents>${sources
      .map(source => `<content>\n${source.content}\n</content>`)
      .join('\n')}</contents>
    Return a maximum of ${3} learnings, 
    but feel free to return less if the contents are clear. 
    Make sure each learning is unique and not similar to each other. 
    The learnings should be concise and to the point, as detailed and information dense as possible. 
    Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.
    The learnings should be in the following JSON Objectformat:
    {
        "learnings": [
            "learning1",
            "learning2",
            "learning3"
        ]
    }
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    });

    console.log("response", response.choices[0].message.content);
    return { learnings: JSON.parse(response.choices[0].message.content || "{}"), usage: response.usage };
}
