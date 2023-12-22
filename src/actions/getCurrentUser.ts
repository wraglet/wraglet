import dbConnect from '@/libs/dbConnect';
import getSession from './getSession';
import User from '@/models/User';

const getCurrentUser = async () => {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }

    await dbConnect();

    const currentUser = await User.findOne({
      email: session.user.email
    }).select('-hashedPassword');

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
