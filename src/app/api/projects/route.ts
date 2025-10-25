// app/api/projects/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {authOptions} from '@/app/api/auth/[...nextauth]/option';
import {ConnectToDB} from '@/lib/db';
import {User} from '@/lib/models/user.model';
export const dynamic = "force-dynamic"
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "Please Login",
        },
        { status: 401 }
      );
    }

    await ConnectToDB();

    const user = await User.findOne({
      studentNo: session.user.studentNo,
    }).lean();

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    if (Array.isArray(user)) {
      return NextResponse.json(
        {
          error: "Unexpected user data format",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        projects: user?.projects || [],
      },
      { status: 200 }
    );
  } catch (error:any) {
    console.log(error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
