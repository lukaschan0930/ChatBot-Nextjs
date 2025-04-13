import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/api/helper';
import db from '@/app/lib/database/db';
import { NextAuthOptions } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as NextAuthOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ isActive: false });
    }

    // Get the user's last active session timestamp
    const user = await db.User.findOne({ email: session.user.email })
      .select('lastActiveSession');

    if (!user) {
      return NextResponse.json({ isActive: false });
    }

    // If the user doesn't have a lastActiveSession or it's older than 1.7 minutes,
    // this session becomes the active one
    const now = new Date();
    const lastActive = user.lastActiveSession ? new Date(user.lastActiveSession) : null;
    const isActive = !lastActive || (now.getTime() - lastActive.getTime() > 1.7 * 60 * 1000);

    if (isActive) {
      // Update the lastActiveSession timestamp
      await db.User.updateOne(
        { email: session.user.email },
        { $set: { lastActiveSession: now } }
      );
    }

    return NextResponse.json({ isActive });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ isActive: false });
  }
} 