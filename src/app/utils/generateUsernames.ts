import prisma from '@/app/libs/prismadb';

const generateUsernames = async () => {
  const users = await prisma.user.findMany();

  for (const user of users) {
    if (!user.username) {
      const randomDigits = Math.floor(Math.random() * 90) + 10; // Generate random two-digit number
      const firstNameWithoutSpaces = user.firstName
        .toLowerCase()
        .replace(/\s/g, '');
      const lastNameWithoutSpaces = user.lastName
        .toLowerCase()
        .replace(/\s/g, '');
      const username = `@${firstNameWithoutSpaces}${lastNameWithoutSpaces}${randomDigits}`;

      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });
    }
  }

  console.log('Usernames generated and updated successfully.');
};

export default generateUsernames;
