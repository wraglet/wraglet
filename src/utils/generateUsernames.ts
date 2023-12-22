import dbConnect from '@/libs/dbConnect';
import User from '@/models/User';

const generateUsernames = async () => {
  try {
    await dbConnect();

    const users = await User.find();

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

        await User.findByIdAndUpdate(user._id, { username });
      }
    }

    console.log('Usernames generated and updated successfully.');
  } catch (error) {
    console.error('Error generating and updating usernames:', error);
  } finally {
    mongoose.disconnect();
  }
};

export default generateUsernames;
