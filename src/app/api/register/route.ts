import bcrypt from 'bcrypt';

import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      gender,
      pronoun,
      friendRequests,
      publicProfileVisible
    } = body;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !dob ||
      !gender ||
      !pronoun ||
      !friendRequests ||
      !publicProfileVisible ||
      !password
    ) {
      return new NextResponse('Missing info', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        hashedPassword,
        dob,
        gender,
        pronoun,
        friendRequests,
        publicProfileVisible
      }
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.log('REGISTRATION ERROR: ', error);
    console.error(
      'Some error happened while accessing POST at /api/register at route.ts: ',
      error
    );
    return new NextResponse('Internal Error', { status: 500 });
  }
}
