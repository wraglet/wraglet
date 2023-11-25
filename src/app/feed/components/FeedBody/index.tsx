'use client';

import React, { FC } from 'react';
import CreatePost from './component/CreatePost';
import Post from './component/Post';
import { PostInterface, UserInterface } from '@/app/interfaces';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';

interface FeedBodyInterface {
  currentUser: UserInterface;
  posts: PostInterface[];
}

const FeedBody: FC<FeedBodyInterface> = ({ currentUser, posts }) => {
  const client = new Ably.Realtime.Promise({
    authUrl: '/api/ably',
    authMethod: 'GET'
  });

  return (
    <AblyProvider client={client}>
      <section className='col-span-5 h-auto flex flex-col mt-6 w-full gap-y-4'>
        <CreatePost currentUser={currentUser} />
        {/* Start of Feed Post */}
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </section>
    </AblyProvider>
  );
};

export default FeedBody;
