import { NextRequest } from "next/server";
import { authOptions } from "@/app/lib/api/helper";
import { getServerSession, AuthOptions } from "next-auth";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return Response.json({ success: false, message: "Unauthorized" });
    }

    const user = await UserRepo.findByEmail(session?.user?.email as string);

    if (!user) {
        return Response.json({ success: false, message: "User not found" });
    }

    const twitterId = user?.twitterId;
    if (!twitterId) {
        return Response.json({ success: false, message: "Twitter ID is required" });
    }
    
    try {
        const response = await fetch(`
            https://api.socialdata.tools/twitter/user/${twitterId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.SOCIALDATA_API_KEY}`
                }
            }
        );
        const data = await response.json();
        return Response.json({ success: true, data });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "User fetch failed" });
    }
}