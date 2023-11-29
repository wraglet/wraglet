'use client';

import { PostInterface } from '@/app/interfaces';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import FeedBody from '..';

const FeedAblyProvider = ({
  initialPosts
}: {
  initialPosts: PostInterface[];
}) => {
  const client = new Ably.Realtime.Promise({
    authUrl: '/api/token',
    authMethod: 'POST'
  });
  return (
    <AblyProvider client={client}>
      {/* <FeedBody initialPosts={initialPosts} /> */}
      <section className='col-start-3 col-end-8 h-auto flex flex-col mt-6 w-full gap-y-4 overflow-auto'>
        <p>This is a wrapped AblyProvider</p>
      </section>
    </AblyProvider>
  );
};

export default FeedAblyProvider;
