import dbConnect from '@/libs/dbConnect';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Reaction from '@/models/Reaction';
import PostVote from '@/models/PostVote';

const getPosts = async () => {
  await dbConnect();
  try {
    const posts = await Post.find({ audience: 'public' })
      .sort({ createdAt: 'desc' })
      .populate({
        path: 'author',
        select:
          'firstName lastName username gender pronoun profilePicture coverPhoto'
      })
      .populate('comments reactions')
      .exec();

    return posts;
  } catch (err: any) {
    console.error('Error at getPosts() while fetching posts: ', err);
    return [];
  }
};

export default getPosts;
