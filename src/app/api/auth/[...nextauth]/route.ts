import { Session, User as NextAuthUser, Account, Profile } from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyConfirmationToken, generateConfirmationToken } from '@/app/lib/api/token';
import { UserRepo } from '@/app/lib/database/userrepo';
import emailjs from '@emailjs/nodejs';
import { emailUserID } from '@/app/lib/config';
import { JWT } from 'next-auth/jwt';
import NextAuth from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import { cookies } from 'next/headers'
import { IUser } from '@/app/lib/interface';
import { NextAuthOptions } from "next-auth";

const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            httpOptions: {
                timeout: 10000,
            }
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            version: "2.0",
        }),
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                console.log("credentials", credentials);
                if (!credentials) {
                    return null;
                }
                const { email, password } = credentials;
                try {
                    const user = await UserRepo.authenticate(email, password);
                    return user;
                } catch (error) {
                    console.log("error", error);
                    return null;
                }

            }
        }),
        CredentialsProvider({
            id: 'token',
            name: 'JWT-Token',
            credentials: {
                token: {}
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }
                const { token } = credentials;
                try {
                    const decoded = await verifyConfirmationToken(token);
                    if (!decoded) {
                        return null;
                    }
                    const user = await UserRepo.findByEmail(decoded.email as string);
                    if (user && user.verify) {
                        if (user.jumpReward && !user.jumpReward.isReward && user.jumpReward.jumpOfferId && user.jumpReward.jumpUserId && user.jumpReward.jumpTransactionId) {
                            try {
                                await fetch(`https://jumptask.go2cloud.org/aff_lsr?offer_id=${user.jumpReward.jumpOfferId}&transaction_id=${user.jumpReward.jumpTransactionId}&adv_sub=${user.jumpReward.jumpUserId}`)
                                console.log("send jump reward", user.jumpReward.jumpOfferId);
                                await UserRepo.updateJumpRewardState(user.email)
                            } catch (error) {
                                console.log(error);
                            }
                        }
                        return user;
                    } else {
                        return null;
                    }
                } catch (error) {
                    console.log("error", error);
                    return null;
                }
            }
        })
    ],
    pages: {
        error: '/verify',
        signIn: '/signin',
        signOut: '/signout',
    },
    session: {
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET!,
    debug: true,
    callbacks: {
        async signIn({ user, account, profile }: {
            user: NextAuthUser | AdapterUser;
            account: Account | null;
            profile?: Profile;
        }) {
            if (account?.provider === 'google') {
                let existingUser = await UserRepo.findByEmail(profile?.email as string);
                if (existingUser && existingUser.verify == true) {
                    user.name = existingUser.name;
                    user.email = existingUser.email;
                    return true;
                }

                if (!existingUser) {
                    let jumpUserId = cookies().get("jumpUserId")?.value;
                    let jumpOfferId = cookies().get("jumpOfferId")?.value;
                    let jumpTransactionId = cookies().get("jumpTransactionId")?.value;

                    if (jumpUserId) {
                        const jumpUser = await UserRepo.findByJumpUserId(jumpUserId);
                        if (jumpUser) {
                            jumpOfferId = "";
                            jumpTransactionId = "";
                            jumpUserId = "";
                        }
                    }

                    const token = await generateConfirmationToken(profile?.email as string, "google");
                    const inviteCode = await UserRepo.createUniqueInviteCode();
                    existingUser = await UserRepo.create({
                        email: profile?.email as string,
                        verify: false,
                        inviteCode: inviteCode,
                        numsOfUsedInviteCode: 0,
                        loginType: 'google',
                        lastLogin: new Date(),
                        logins: 0,
                        role: 'user',
                        name: profile?.name as string,
                        reward: [],
                        board: [],
                        jumpReward: {
                            jumpOfferId: jumpOfferId || "",
                            jumpUserId: jumpUserId || "",
                            jumpTransactionId: jumpTransactionId || "",
                            isReward: false
                        }
                    });

                    const magicLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
                    const templateParams = {
                        to_name: "dear",
                        from_name: "ChatEdith",
                        logo_url: process.env.LOGO_URL,
                        recipient: profile?.email as string,
                        message: magicLink,
                    };

                    await emailjs.send(
                        process.env.EMAILJS_SERVICE_ID!,
                        process.env.EMAILJS_TEMPLATE_ID!,
                        templateParams,
                        emailUserID
                    );
                    return false;
                } else if (!existingUser.verify) {
                    const token = await generateConfirmationToken(user.email as string, "google");
                    const magicLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
                    const templateParams = {
                        to_name: "dear",
                        from_name: "ChatEdith",
                        logo_url: process.env.LOGO_URL,
                        recipient: existingUser.email as string,
                        message: magicLink,
                    };

                    await emailjs.send(
                        process.env.EMAILJS_SERVICE_ID!,
                        process.env.EMAILJS_TEMPLATE_ID!,
                        templateParams,
                        emailUserID
                    );
                    return false;
                }
            } else if (account?.provider === 'twitter' || account?.provider === 'discord') {
                const socialId = account?.providerAccountId;
                const currentEmail = cookies().get("currentEmail")?.value;
                if (!currentEmail) {
                    console.error("No current email found in cookies");
                    throw new Error("No current email found in cookies");
                }
                const currentUser: IUser | null = await UserRepo.findByEmail(currentEmail);
                if (!currentUser || currentUser.verify == false) {
                    console.error("User not found or not verified");
                    throw new Error("User not found or not verified");
                }
                const existingSocial = await UserRepo.getByTwitterId(socialId);
                if (existingSocial) {
                    console.error("Already linked to another account");
                    throw new Error("Already linked to another account");
                }
                try {
                    await UserRepo.updateTwitterId(currentEmail, socialId);
                } catch (error) {
                    console.error("Failed to link account", error);
                    throw new Error("Failed to link account");
                }
                user.name = currentUser.name;
                user.email = currentUser.email;
                return true;
            }
            return true;
        },
        async jwt({ token, account, user }: { token: JWT, account: Account | null, user: NextAuthUser | AdapterUser }) {
            if (account) {
                token.accessToken = account.access_token
                token.name = user.name;
                token.email = user.email;
            }
            return token
        },
        async session({ session, token }: { session: Session, token: JWT }) {
            if (session.user) {
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.image = token.image as string;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };