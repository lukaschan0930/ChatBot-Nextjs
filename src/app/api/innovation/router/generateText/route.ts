import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { AiRepo } from "@/app/lib/database/aiRepo";
import { UserRepo } from "@/app/lib/database/userrepo";
import { NextRequest, NextResponse } from 'next/server';
import { IRouterChatLog } from "@/app/lib/interface";
import { User } from "@/app/lib/interface";

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return new NextResponse("not Authorized", { status: 404 });
    }
    const { sessionId, prompt, model, chatLog, reGenerate, files } = await request.json();

    try {
        const ai = await AiRepo.findById(model);
        if (!ai) {
            return new NextResponse("AI not found", { status: 404 });
        }

        const email = session?.user?.email;
        const user = await UserRepo.findByEmail(email as string) as User;
        console.log(user.currentplan);
        const availablePoints = Number(user.currentplan.points) + Number(user.currentplan.bonusPoints);
        const usedPoints = user.pointsUsed ?? 0;
        if (user.currentplan.type != "free" && user.planEndDate && user.planEndDate < new Date()) {
            return new NextResponse("Your Plan is outDate", { status: 429 })
        }

        if (availablePoints < usedPoints) {
            return new NextResponse("Your exceed your current token", { status: 429 });
        }

        const requestBody = {
            prompt,
            sessionId,
            chatHistory: chatLog.map((item: IRouterChatLog) => ({
                prompt: item.prompt,
                response: item.response,
            })),
            files,
            email: session?.user?.email as string,
            reGenerate,
            model
        }

        const response = await fetch(`${process.env.FASTAPI_URL}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.status == 429) {
            return new NextResponse("Your exceed your current token", { status: 429 });
        }

        if (!response.ok) {
            throw new Error('Failed to fetch from FastAPI');
        }

        return new NextResponse(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// const calculatePoints = (ai: IAI, inputToken: number, outputToken: number) => {
//     return ((ai.inputCost * inputToken) + (ai.outputCost * outputToken)) * ai.multiplier / 0.001;
// }