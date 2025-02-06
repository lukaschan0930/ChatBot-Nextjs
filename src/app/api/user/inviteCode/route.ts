import { AuthOptions, getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/api/helper";
import { UserRepo } from "@/app/lib/database/userrepo";

export async function GET() {
    const session = await getServerSession(authOptions as AuthOptions);
    try {
        const user = await UserRepo.findByEmail(session?.user?.email as string);
        return Response.json({ success: true, inviteCode: user?.inviteCode });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, message: "User not found" });
    }
}