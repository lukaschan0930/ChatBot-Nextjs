import { UserRepo } from "@/app/lib/database/userrepo";
import { NextRequest } from "next/server";
import { generateConfirmationToken } from "@/app/lib/api/token";
import { emailUserID } from "@/app/lib/config";
import emailjs from "@emailjs/nodejs";
// import { verifyRecaptcha, getRecaptchaTokenFromRequest } from "@/app/lib/recaptcha";

export async function POST(request: NextRequest) {
    const data = await request.json();
    const { email, password, confirmPassword, name } = data;
    let { transactionId, userId } = data;

    // Verify reCAPTCHA
    // const recaptchaToken = getRecaptchaTokenFromRequest(request);
    // if (!recaptchaToken) {
    //     return Response.json({ error: "reCAPTCHA token is required" }, { status: 400 });
    // }

    // const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
    // if (!isValidRecaptcha) {
    //     return Response.json({ error: "reCAPTCHA verification failed" }, { status: 400 });
    // }

    if (password !== confirmPassword) {
        return Response.json({ error: "Passwords do not match" });
    }
    const user = await UserRepo.findByEmail(email);
    if (user && user.verify) {
        return Response.json({ error: "User already exists" });
    }

    try {
        if (!user) {
            const inviteCode = await UserRepo.createUniqueInviteCode();

            if (userId) {
                const jumpUser = await UserRepo.findByJumpUserId(userId);
                if (jumpUser) {
                    transactionId = "";
                    userId = "";
                }
            }

            await UserRepo.create({
                email,
                password,
                name,
                inviteCode: inviteCode,
                numsOfUsedInviteCode: 0,
                loginType: "email",
                verify: false,
                role: "user",
                logins: 0,
                wallet: "",
                chatPoints: 0,
                workerPoints: 0,
                jumpReward: {
                    jumpUserId: userId || "",
                    jumpTransactionId: transactionId || "",
                    isReward: false
                },
                pointsUsed: 0,
                pointResetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                currentplan: "680f11c0d44970f933ae5e54",
            });
        }
        const token = await generateConfirmationToken(email, "email");
        const url = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
        const templateParams = {
            to_name: "dear",
            from_name: "ChatEdith",
            logo_url: process.env.LOGO_URL,
            recipient: email,
            message: url,
        };

        const result = await emailjs.send(
            process.env.EMAILJS_SERVICE_ID!,
            process.env.EMAILJS_TEMPLATE_ID!,
            templateParams,
            emailUserID
        );
        // console.log(result);
        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Failed to sign up" });
    }
}