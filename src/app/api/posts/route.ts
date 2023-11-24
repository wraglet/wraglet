import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';

export const POST = async (request: Request) => {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { content, audience = 'public' } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const newPost = await prisma.post.create({
      data: {
        content: content,
        audience: audience,
        author: {
          connect: {
            id: currentUser.id
          }
        }
      }
    });

    return NextResponse.json(newPost);
  } catch (err) {
    console.log('Create Post error: ', err);
    return new NextResponse('Internal Error: ', { status: 500 });
  }
};
