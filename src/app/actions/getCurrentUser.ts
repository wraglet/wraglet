import prisma from '@/app/libs/prismadb';
import getSession from './getSession';

const getCurrentUser = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string
      },
      // Use select to specify the fields you want to include in the result
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dob: true,
        username: true,
        gender: true,
        bio: true,
        pronoun: true,
        profilePicture: true,
        coverPhoto: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!currentUser) {
      return null;
    }

    return currentUser;
  } catch (error: any) {
    console.error('Some error happened while getting getCurrentUser: ', error);
    return null;
  }
};

export default getCurrentUser;
