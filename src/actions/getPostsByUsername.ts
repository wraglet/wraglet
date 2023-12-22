import dbConnect from '@/libs/dbConnect';
import Post, { PostDocument } from '@/models/Post'; // Update import statement
import User from '@/models/User';

const getPostsByUsername = async (
  username: string
): Promise<PostDocument[]> => {
  try {
    await dbConnect();

    const user = await User.findOne({ username });
    if (!user) {
      return [];
    }

    const userPosts = await Post.find({
      author: user._id,
      audience: 'public'
    })
      .sort({ createdAt: 'desc' })
      .populate<PostDocument>({
        path: 'author',
        select:
          'firstName lastName username gender pronoun profilePicture coverPhoto'
      })
      .populate('comments reactions')
      .exec();

    return userPosts;
  } catch (err: any) {
    console.error(`Error at getPostsByUsername(${username}): `, err);
    return [];
  }
};

export default getPostsByUsername;
