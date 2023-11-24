import React from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import CreatePost from './component/CreatePost';
import getPosts from '@/app/actions/getPosts';
import Post from './component/Post';
import { PostInterface } from '@/app/interfaces/post';

const FeedBody = async () => {
  const currentUser = await getCurrentUser();

  const getPublicPosts: PostInterface[] = await getPosts();

  return (
    <section className='col-span-5 h-auto flex flex-col mt-6 w-full gap-y-4'>
      <CreatePost currentUser={currentUser} />
      {/* Start of Feed Post */}
      {getPublicPosts.map((post) => (
        <Post key={post.id} currentUser={currentUser} post={post} />
      ))}
    </section>
  );
};

export default FeedBody;
