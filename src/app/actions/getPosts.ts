import prisma from '@/app/libs/prismadb';

const getPosts = async () => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        audience: 'public'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dob: true,
            gender: true,
            pronoun: true,
            profilePicture: true,
            coverPhoto: true,
            createdAt: true
          }
        },
        comments: true,
        likes: true
      }
    });

    return posts;
  } catch (err: any) {
    console.error('Error at getPosts() while fetching posts: ', err);
    return [];
  }
};

export default getPosts;
