import { NextRequest } from "next/server";
import { verifyConfirmationToken, generateConfirmationToken } from "@/app/lib/api/token";
import { UserRepo } from "@/app/lib/database/userrepo";
import { ExplorerRepo } from "@/app/lib/database/explorerRepo";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return Response.json({ error: "Token is required" }, { status: 400 });
  }
  const verified = await verifyConfirmationToken(token);
  if (!verified) {
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }
  const user = await UserRepo.findByEmail(verified.email as string);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 400 });
  }

  if (user.verify) {
    return Response.json({ error: "User already verified" }, { status: 400 });
  }

  user.verify = true;
  await user.save();

  const explorerDate = Number(new Date().setHours(0, 0, 0, 0).toString());
  console.log("explorerDate", explorerDate);
  const explorer = await ExplorerRepo.findByDate(explorerDate);
  if (!explorer) {
    const latestExplorer = await ExplorerRepo.findByLatest();
    await ExplorerRepo.create({
      date: explorerDate,
      userCount: latestExplorer.userCount + 1,
      promptCount: latestExplorer.promptCount,
      dailyPromptCount: 0,
      activeUsers: [user.email as string]
    });
  } else {
    await ExplorerRepo.update({
      date: explorerDate,
      userCount: explorer.userCount + 1,
      promptCount: explorer.promptCount,
      dailyPromptCount: explorer.dailyPromptCount,
      activeUsers: [...explorer.activeUsers, user.email as string]
    });
  }

  const signInToken = await generateConfirmationToken(user.email as string, "manual");
  return Response.json({ message: "Email verified", id: user._id, token: signInToken }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { code, id } = await request.json();
  const inviteUser = await UserRepo.findByInviteCode(code);
  if (!inviteUser) {
    return Response.json({ error: "Invalid invite code" }, { status: 400 });
  }

  const user = await UserRepo.findById(id);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 400 });
  }

  inviteUser.numsOfUsedInviteCode = Number(inviteUser.numsOfUsedInviteCode) + 1;
  await inviteUser.save();

  user.referralCode = inviteUser.inviteCode;
  await user.save();

  return Response.json({ message: "Email verified" }, { status: 200 });
}