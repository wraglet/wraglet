import prisma from '@/app/libs/prismadb';
import getSession from './getSession';

const getOtherUsers = async () => {
  const session = await getSession();

  if (!session?.user?.email) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        NOT: {
          email: session.user.email
        }
      },
      // Use select to specify the fields you want to include in the result
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dob: true,
        gender: true,
        bio: true,
        pronoun: true,
        profilePicture: true,
        coverPhoto: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return users;
  } catch (error: any) {
    return [];
  }
};

export default getOtherUsers;
