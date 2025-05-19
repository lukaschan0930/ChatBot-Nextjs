import { authOptions, trimPrompt } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { AdminRepo } from "@/app/lib/database/adminRepo";
import { ChatLog } from '@/app/lib/interface';
import { NextRequest, NextResponse } from 'next/server';
import { UserRepo } from "@/app/lib/database/userrepo";
import { User } from "@/app/lib/interface";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const sessionId = formData.get('sessionId') as string;
    const chatLog = JSON.parse(formData.get('chatLog') as string);
    const reGenerate = formData.get('reGenerate') == "true" ? true : false;
    const learnings = JSON.parse(formData.get('learnings') as string);
    const fileUrls = JSON.parse(formData.get('fileUrls') as string);
    const model = formData.get('model') as string;
    const chatMode = Number(formData.get('chatMode'));
    const modelType = formData.get('modelType') as string;

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const email = session?.user?.email;
        const user = await UserRepo.findByEmail(email as string) as User;
        const availablePoints = Number(user.currentplan.points) + Number(user.currentplan.bonusPoints);
        const usedPoints = user.pointsUsed ?? 0;
        if (user.currentplan.type != "free" && user.planEndDate && user.planEndDate < new Date()) {
            return new NextResponse("Your Plan is outDate", { status: 429 })
        }

        if (availablePoints < usedPoints) {
            return new NextResponse("Your exceed your current token", { status: 429 });
        }

        const availableModels = user.currentplan.activeModels;
        if (!availableModels.includes(model)) {
            return new NextResponse("You don't have access to this model", { status: 429 });
        }

        const chatType = modelType == "image" ? 3 : modelType == "audio" ? 4 : chatMode == 1 ? 2 : learnings.length > 0 ? 1 : 0; // Determine chatType based on learnings length
        const chatHistory = chatLog.map((item: ChatLog) => ({
            prompt: item.prompt,
            response: item.response,
        }));

        const learningsString = trimPrompt(
            learnings
                .map((learning: string) => `<learning>\n${learning}\n</learning>`)
                .join('\n'),
            150_000,
        );

        const learningsPrompt = `Given the following prompt from the user, write a final report on the topic using the learnings from research. 
        Make it as as detailed as possible, aim for 3 or more pages, include ALL the learnings from research:
        \n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learningsString}\n</learnings>
        Not using words "Final Report:" or "Final Report" in the response title.`;

        const requestBody = {
            prompt: chatType == 1 ? learningsPrompt : prompt,
            sessionId,
            chatHistory,
            files: fileUrls,
            email: session?.user?.email as string,
            reGenerate,
            model,
            chatType,
        }

        if (chatType == 0 || chatType == 1) {
            const response = await fetch(`${process.env.FASTAPI_URL}/api/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 429) {
                    return new NextResponse(JSON.stringify({
                        error: true,
                        status: 429,
                        message: "Insufficient points available",
                        details: errorData.details || {}
                    }), {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

                throw new Error('Failed to fetch from FastAPI');
            }

            return new NextResponse(response.body, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        } else {
            const url = modelType == "text" ? "/api/chat/generateText" : modelType == "image" ? "/api/chat/generateImage" : "/api/chat/generateAudio";
            const response = await fetch(`${process.env.FASTAPI_URL}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("errorData", errorData);
                if (response.status === 429) {
                    return new NextResponse(JSON.stringify({
                        error: true,
                        status: 429,
                        message: "Insufficient points available",
                        details: errorData.details || {}
                    }), {
                        status: 429,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

                throw new Error('Failed to fetch from FastAPI');
            }

            const data = await response.json();

            return NextResponse.json({ content: data.data, success: true });
        }
    } catch (error) {
        console.error("Error generating text: ", error);
        return NextResponse.json({ content: "Error generating text.", success: false }, { status: 500 })
    }
} 